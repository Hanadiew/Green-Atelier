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

const CART_LISTING_FIELDS =
  'id, title, brand, listing_price, images, status'

function toCartItem(listing) {
  return {
    id: listing.id,
    name: listing.title,
    brand: listing.brand,
    price: Number(listing.listing_price),
    image: listing.images?.[0] || '/demo/bag1.png',
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

  cartItems.value = rows.map((r) => toCartItem(r.listing))
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
