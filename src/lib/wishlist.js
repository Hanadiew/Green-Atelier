import { computed, ref, watch } from 'vue'
import { supabase } from './supabase.js'
import { userId } from './auth.js'
import { toCard } from './listings.js'

/** Listing ids the signed-in user has saved, for filling in heart icons. */
export const wishlistIds = ref(new Set())

/** How many items are saved, for the navbar badge. */
export const wishlistCount = computed(() => wishlistIds.value.size)

// Follow the session rather than waiting for a page to ask. Shop and Product
// used to load this themselves, which left the count unknown on every other
// page — including the navbar that renders on all of them.
watch(userId, (id) => loadWishlistIds(id), { immediate: true })

export async function loadWishlistIds(id) {
  if (!id) {
    wishlistIds.value = new Set()
    return
  }
  const { data, error } = await supabase.from('wishlists').select('listing_id').eq('user_id', id)
  if (error) {
    console.error('Failed to load wishlist:', error.message)
    return
  }
  wishlistIds.value = new Set((data ?? []).map((r) => r.listing_id))
}

export async function fetchWishlist(userId) {
  const { data, error } = await supabase
    .from('wishlists')
    .select(
      'listing_id, created_at, listing:listings(id, title, brand, category, condition, listing_price, original_price, images, status, created_at, seller_id)',
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).filter((r) => r.listing).map((r) => toCard(r.listing))
}

export async function addToWishlist(userId, listingId) {
  const { error } = await supabase
    .from('wishlists')
    .insert({ user_id: userId, listing_id: listingId })
  if (error && error.code !== '23505') throw error
  wishlistIds.value = new Set(wishlistIds.value).add(listingId)
}

export async function removeFromWishlist(userId, listingId) {
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('listing_id', listingId)
  if (error) throw error
  const next = new Set(wishlistIds.value)
  next.delete(listingId)
  wishlistIds.value = next
}

/** Returns the new saved state. */
export async function toggleWishlist(userId, listingId) {
  if (wishlistIds.value.has(listingId)) {
    await removeFromWishlist(userId, listingId)
    return false
  }
  await addToWishlist(userId, listingId)
  return true
}
