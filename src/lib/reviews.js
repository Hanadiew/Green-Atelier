/* --- Seller reviews ----------------------------------------------------------
   A buyer rates the seller once per delivered order; the reviews show on that
   seller's public profile.

   Every rule that matters — delivered, yours, one per order, the named seller
   is really the seller — lives in RLS and a trigger, not here. What this module
   decides is only what the interface offers. See
   supabase/migrations/20260808000100_seller_reviews.sql. */

import { supabase } from '../supabase.js'

/** Reviews written about a seller, newest first, with the reviewer's name. */
export async function fetchSellerReviews(sellerId) {
  const { data, error } = await supabase
    .from('seller_reviews')
    .select(`id, rating, body, created_at,
             reviewer:profiles!seller_reviews_buyer_id_fkey(username, full_name, avatar_url)`)
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    body: r.body || '',
    name: r.reviewer?.full_name || r.reviewer?.username || 'Green Atelier buyer',
    username: r.reviewer?.username || null,
    avatar: r.reviewer?.avatar_url || null,
    date: new Date(r.created_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  }))
}

/**
 * Average and count for a seller.
 *
 * Rounded to one decimal for display only — the raw mean is kept so a caller
 * can decide its own precision.
 */
export function summarise(reviews) {
  if (!reviews.length) return { count: 0, average: 0, display: null }

  const total = reviews.reduce((sum, r) => sum + r.rating, 0)
  const average = total / reviews.length

  return { count: reviews.length, average, display: average.toFixed(1) }
}

/**
 * The buyer's own reviews, keyed by order id.
 *
 * Keyed rather than listed because the Orders tab asks "has this one been
 * reviewed?" per row, which would otherwise be a scan for every order drawn.
 */
export async function fetchMyReviewsByOrder(buyerId) {
  const { data, error } = await supabase
    .from('seller_reviews')
    .select('id, order_id, rating, body')
    .eq('buyer_id', buyerId)

  if (error) throw error

  return Object.fromEntries((data ?? []).map((r) => [r.order_id, r]))
}

/**
 * Write or correct a review.
 *
 * Upsert on order_id: a buyer editing what they said should replace their own
 * review rather than be refused by the unique constraint.
 */
export async function saveReview({ orderId, sellerId, buyerId, rating, body }) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Choose a rating from 1 to 5 stars.')
  }

  const { data, error } = await supabase
    .from('seller_reviews')
    .upsert(
      {
        order_id: orderId,
        seller_id: sellerId,
        buyer_id: buyerId,
        rating,
        body: body?.trim() ? body.trim() : null,
      },
      { onConflict: 'order_id' },
    )
    .select('id, order_id, rating, body')
    .single()

  if (error) throw error
  return data
}
