import { ref } from 'vue'
import { supabase } from '../supabase.js'
import { toCard } from './listings.js'

/** Listing ids the signed-in user has saved, for filling in heart icons. */
export const wishlistIds = ref(new Set())

export async function loadWishlistIds(userId) {
  if (!userId) {
    wishlistIds.value = new Set()
    return
  }
  const { data, error } = await supabase.from('wishlists').select('listing_id').eq('user_id', userId)
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
