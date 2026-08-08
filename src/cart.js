import { computed, ref, watch } from 'vue'
import { supabase } from './supabase.js'
import { isAuthenticated, userId } from './lib/auth.js'

// Items keep the shape the drawer and checkout already render:
// { id, name, brand, price, image }
export const cartItems = ref([])

export const cartCount = computed(() => cartItems.value.length)

export const cartSubtotal = computed(() =>
  cartItems.value.reduce((sum, item) => sum + Number(item.price), 0),
)

const GUEST_KEY = 'gafs.cart'

// --- Guest cart (localStorage) ----------------------------------------------
// Signed-out shoppers keep a cart in the browser. On sign-in it is merged into
// the database cart so nothing is lost at the login step.

function readGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeGuestCart(items) {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(items))
  } catch {
    // Storage can be unavailable (private mode, quota) — the in-memory cart
    // still works for this session.
  }
}

// The seller comes along with the listing because checkout shows who the buyer
// is actually buying from — it used to print a hardcoded "Green Atelier Seller"
// for everyone, which is wrong on a marketplace where every listing has an owner.
const CART_LISTING_FIELDS =
  'id, title, brand, listing_price, images, status, seller_id, ' +
  'seller:profiles!listings_seller_id_fkey(id, username, full_name, first_name, last_name, avatar_url, is_trusted_seller)'

/** Display name for a seller profile, matching how the product page reads it. */
export function sellerDisplayName(seller) {
  if (!seller) return 'Green Atelier Seller'
  return (
    seller.full_name ||
    [seller.first_name, seller.last_name].filter(Boolean).join(' ') ||
    seller.username ||
    'Green Atelier Seller'
  )
}

function toCartItem(listing) {
  return {
    id: listing.id,
    name: listing.title,
    brand: listing.brand,
    price: Number(listing.listing_price),
    image: listing.images?.[0] || '/demo/bag1.png',
    sellerId: listing.seller_id ?? listing.seller?.id ?? null,
    seller: listing.seller ?? null,
  }
}

// --- Database cart ----------------------------------------------------------

async function loadServerCart() {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`listing_id, created_at, listing:listings(${CART_LISTING_FIELDS})`)
    .eq('user_id', userId.value)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to load cart:', error.message)
    return
  }

  // Drop anything that sold or was withdrawn while the user was away.
  const rows = (data ?? []).filter((r) => r.listing && r.listing.status === 'active')
  const stale = (data ?? []).filter((r) => !r.listing || r.listing.status !== 'active')

  if (stale.length) {
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId.value)
      .in('listing_id', stale.map((r) => r.listing_id))
  }

  // An accepted offer is the agreed price, and create_pending_order() charges it.
  // The bag has to show the same figure or the buyer sees one number here and a
  // different one on Stripe. Still server-decided: my_agreed_prices() only ever
  // returns offers the seller accepted, for the caller, that have not expired.
  const agreed = new Map()
  const { data: agreedRows, error: agreedError } = await supabase.rpc('my_agreed_prices')
  if (agreedError) {
    // Fall back to listing prices. The server total remains authoritative either
    // way, so the worst case is the bag reading high until this succeeds.
    console.error('Could not load accepted offer prices:', agreedError.message)
  } else {
    for (const row of agreedRows ?? []) agreed.set(row.listing_id, Number(row.agreed_price))
  }

  cartItems.value = rows.map((r) => {
    const item = toCartItem(r.listing)
    const offerPrice = agreed.get(r.listing.id)
    if (offerPrice != null && offerPrice < item.price) {
      return { ...item, price: offerPrice, listPrice: item.price, fromAcceptedOffer: true }
    }
    return item
  })
}

async function mergeGuestCartIntoServer() {
  const guest = readGuestCart()
  if (!guest.length) return

  const rows = guest.map((item) => ({ user_id: userId.value, listing_id: item.id }))
  const { error } = await supabase.from('cart_items').upsert(rows, {
    onConflict: 'user_id,listing_id',
    ignoreDuplicates: true,
  })
  if (error) console.error('Failed to merge guest cart:', error.message)

  writeGuestCart([])
}

/** Called once at startup and again whenever the signed-in user changes. */
export async function syncCart() {
  if (isAuthenticated.value && userId.value) {
    await mergeGuestCartIntoServer()
    await loadServerCart()
  } else {
    cartItems.value = readGuestCart()
  }
}

let watching = false

export function initCart() {
  if (!watching) {
    watching = true
    watch(userId, () => syncCart())
  }
  return syncCart()
}

// --- Mutations --------------------------------------------------------------

export async function addToCart(product) {
  if (cartItems.value.some((i) => i.id === product.id)) return

  const item = {
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: Number(product.price),
    image: product.image,
    // Optional: a guest cart is rendered straight from this object, so whatever
    // the caller knows about the seller is worth keeping. Signed-in carts reload
    // from the database on the next sync and get the full profile regardless.
    sellerId: product.sellerId ?? product.seller?.id ?? null,
    seller: product.seller ?? null,
  }
  cartItems.value = [...cartItems.value, item]

  if (isAuthenticated.value && userId.value) {
    const { error } = await supabase
      .from('cart_items')
      .insert({ user_id: userId.value, listing_id: product.id })
    // 23505 just means it was already there.
    if (error && error.code !== '23505') {
      console.error('Failed to save cart item:', error.message)
      cartItems.value = cartItems.value.filter((i) => i.id !== product.id)
      throw error
    }
  } else {
    writeGuestCart(cartItems.value)
  }
}

export async function removeFromCart(id) {
  const previous = cartItems.value
  cartItems.value = cartItems.value.filter((i) => i.id !== id)

  if (isAuthenticated.value && userId.value) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId.value)
      .eq('listing_id', id)
    if (error) {
      console.error('Failed to remove cart item:', error.message)
      cartItems.value = previous
    }
  } else {
    writeGuestCart(cartItems.value)
  }
}

export async function clearCart() {
  cartItems.value = []

  if (isAuthenticated.value && userId.value) {
    const { error } = await supabase.from('cart_items').delete().eq('user_id', userId.value)
    if (error) console.error('Failed to clear cart:', error.message)
  } else {
    writeGuestCart([])
  }
}

/** Used after checkout, where place_order() has already emptied the cart. */
export function resetCartState() {
  cartItems.value = []
  writeGuestCart([])
}
