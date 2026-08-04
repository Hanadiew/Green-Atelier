import { supabase } from '../supabase.js'
import { userId } from './auth.js'

/**
 * Price negotiation on listings whose seller opted into `accept_offers`.
 *
 * No migration was needed for any of this: the `offers` table, its
 * `offer_status` enum and three RLS policies already exist. Those policies do
 * the real enforcement — a buyer can only insert an offer on an active listing
 * that opted in and isn't their own, and only the two parties can read or
 * update a row. Nothing here is a security check; it is the UI's data layer.
 */

export const OFFER_STATUS = {
  pending: { label: 'Awaiting reply', style: 'background-color: #FEF3EC; color: #92400E;' },
  accepted: { label: 'Accepted', style: 'background-color: #E8F5EE; color: #166534;' },
  declined: { label: 'Declined', style: 'background-color: #FEF2F2; color: #B91C1C;' },
  withdrawn: { label: 'Withdrawn', style: 'background-color: #F3F4F6; color: #4B5563;' },
  expired: { label: 'Expired', style: 'background-color: #F3F4F6; color: #4B5563;' },
}

function toOffer(row) {
  return {
    id: row.id,
    listingId: row.listing_id,
    amount: Number(row.offer_amount),
    message: row.message,
    status: row.status,
    statusLabel: OFFER_STATUS[row.status]?.label ?? row.status,
    statusStyle: OFFER_STATUS[row.status]?.style ?? OFFER_STATUS.pending.style,
    buyerId: row.buyer_id,
    buyerName:
      row.buyer?.full_name ||
      [row.buyer?.first_name, row.buyer?.last_name].filter(Boolean).join(' ') ||
      row.buyer?.username ||
      'A buyer',
    buyerUsername: row.buyer?.username ?? null,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  }
}

const OFFER_FIELDS = `
  id, listing_id, buyer_id, offer_amount, message, status, expires_at, created_at,
  buyer:profiles!offers_buyer_id_fkey(username, full_name, first_name, last_name)
`

/**
 * Places (or replaces) the caller's offer on a listing.
 *
 * A partial unique index allows only one *pending* offer per buyer per listing,
 * so re-offering updates the existing row rather than inserting a second one —
 * inserting would fail on that index.
 */
export async function placeOffer({ listingId, amount, message = null }) {
  const value = Number(amount)
  if (!value || value <= 0) throw new Error('Enter an offer amount.')

  const { data: existing, error: lookupError } = await supabase
    .from('offers')
    .select('id')
    .eq('listing_id', listingId)
    .eq('buyer_id', userId.value)
    .eq('status', 'pending')
    .maybeSingle()

  if (lookupError) throw lookupError

  if (existing) {
    const { error } = await supabase
      .from('offers')
      .update({ offer_amount: value, message: message || null })
      .eq('id', existing.id)
    if (error) throw error
    return
  }

  const { error } = await supabase.from('offers').insert({
    listing_id: listingId,
    buyer_id: userId.value,
    offer_amount: value,
    message: message || null,
  })
  if (error) throw error
}

/** Every offer on a listing — the seller's view. */
export async function fetchOffersForListing(listingId) {
  const { data, error } = await supabase
    .from('offers')
    .select(OFFER_FIELDS)
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(toOffer)
}

/** The caller's own offer on a listing, if they have made one. */
export async function fetchMyOffer(listingId) {
  const { data, error } = await supabase
    .from('offers')
    .select(OFFER_FIELDS)
    .eq('listing_id', listingId)
    .eq('buyer_id', userId.value)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data ? toOffer(data) : null
}

/**
 * Seller accepts or declines. Accepting records agreement on the price — it does
 * not sell the item or change the listing price; the buyer still checks out and
 * pays through Stripe. Keeping it to a status change means no pricing path can
 * disagree with create_pending_order().
 */
export async function respondToOffer(offerId, status) {
  if (!['accepted', 'declined'].includes(status)) {
    throw new Error(`Cannot set an offer to "${status}".`)
  }
  const { error } = await supabase
    .from('offers')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('id', offerId)
  if (error) throw error
}

/** Buyer takes their own offer back. */
export async function withdrawOffer(offerId) {
  const { error } = await supabase
    .from('offers')
    .update({ status: 'withdrawn', responded_at: new Date().toISOString() })
    .eq('id', offerId)
  if (error) throw error
}
