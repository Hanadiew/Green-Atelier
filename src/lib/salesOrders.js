import { ref, watch } from 'vue'
import { supabase } from '../supabase.js'
import { profile, userId } from './auth.js'

export const ORDER_ITEM_STATUSES = ['processing', 'shipped', 'delivered', 'cancelled']

const STATUS_LABELS = {
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export function statusLabel(status) {
  return STATUS_LABELS[status] ?? status
}

// Mirrors the transition guard in the database (order_items_guard_status_transition).
// Checked here first so the UI never offers an invalid option; the trigger is
// still the source of truth if this ever drifts.
const ALLOWED_TRANSITIONS = {
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

export function nextStatusOptions(current) {
  return ALLOWED_TRANSITIONS[current] ?? []
}

export function canTransition(from, to) {
  return nextStatusOptions(from).includes(to)
}

export function isLocked(status) {
  return status === 'delivered' || status === 'cancelled'
}

// !inner so the payment_status filter below can apply to the joined order. RLS
// already hides unpaid orders from sellers (order_awaiting_payment); this keeps
// the query honest about it too rather than relying on the policy alone.
const SALE_FIELDS = `
  id, order_id, listing_id, title_snapshot, brand_snapshot, image_snapshot,
  price_paid, platform_fee, seller_payout, status, created_at, updated_at,
  order:orders!inner (
    order_number, placed_at, total, payment_method, payment_status,
    buyer:profiles ( username, first_name, last_name, full_name ),
    shipping_address:addresses ( first_name, surname, street_address, apartment, city, state, postcode, country, phone_code, phone )
  )
`

function buyerName(buyer) {
  if (!buyer) return 'Green Atelier Buyer'
  return buyer.full_name || [buyer.first_name, buyer.last_name].filter(Boolean).join(' ') || buyer.username
}

function toSalesOrder(row) {
  return {
    id: row.id,
    orderId: row.order?.order_number ?? row.order_id,
    image: row.image_snapshot || '/demo/bag1.png',
    name: row.title_snapshot,
    brand: row.brand_snapshot,
    buyerName: buyerName(row.order?.buyer),
    date: row.order?.placed_at
      ? new Date(row.order.placed_at).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : '',
    quantity: 1, // resale items are one-of-a-kind, per the schema design
    price: Number(row.price_paid),
    status: row.status,
    statusLabel: statusLabel(row.status),
    updatedAt: row.updated_at,
    paymentMethod: row.order?.payment_method,
    shippingAddress: row.order?.shipping_address ?? null,
  }
}

/** Sales for the signed-in seller, newest first, paginated. */
export async function fetchSellerSalesOrders(sellerId, { page = 1, perPage = 10 } = {}) {
  if (!sellerId) return { items: [], total: 0 }

  const from = (page - 1) * perPage
  const { data, error, count } = await supabase
    .from('order_items')
    .select(SALE_FIELDS, { count: 'exact' })
    .eq('seller_id', sellerId)
    // An order awaiting payment is not a sale yet — a buyer part-way through
    // Stripe must not surface as work for the seller.
    .neq('order.payment_status', 'pending')
    .order('created_at', { ascending: false })
    .range(from, from + perPage - 1)

  if (error) throw error
  return { items: (data ?? []).map(toSalesOrder), total: count ?? 0 }
}

/** Updates one sale's status. Rejects invalid transitions before hitting the network. */
export async function updateSaleStatus(orderItemId, currentStatus, nextStatus) {
  if (!canTransition(currentStatus, nextStatus)) {
    throw new Error(
      `Cannot change status from ${statusLabel(currentStatus)} to ${statusLabel(nextStatus)}.`,
    )
  }

  const { data, error } = await supabase
    .from('order_items')
    .update({ status: nextStatus })
    .eq('id', orderItemId)
    .select('id, status, updated_at')
    .single()

  if (error) throw new Error(error.message.replace(/^.*?:\s*/, ''))
  return data
}

// =============================================================================
// NEW SALES BADGE
// =============================================================================
// Shared module state, the same shape as pendingOfferCount in offers.js, so the
// navbar dot and the dropdown count read from one query rather than two.
//
// A sale used to be invisible until the seller thought to go and look. This is
// the dot that tells them to.

/** Order items that arrived since the seller last opened Sales Orders. */
export const newSalesCount = ref(0)

/**
 * Recounts the badge.
 *
 * Only 'processing' items count. That is the status finalize_paid_order() moves
 * an item to once Stripe confirms payment, so it means "paid, and the seller has
 * not acted on it yet". It also excludes items still 'pending', which belong to
 * a buyer part-way through checkout and are not a sale yet.
 */
export async function refreshNewSales() {
  if (!userId.value) {
    newSalesCount.value = 0
    return
  }

  try {
    let query = supabase
      .from('order_items')
      .select('id', { count: 'exact', head: true })
      .eq('seller_id', userId.value)
      .eq('status', 'processing')

    // Absent only in the moment between sign-in and the profile arriving. Count
    // nothing rather than everything: a dot that appears and then corrects
    // itself downward is worse than one that appears a beat late.
    const seenAt = profile.value?.sales_seen_at
    if (!seenAt) return
    query = query.gt('created_at', seenAt)

    const { count, error } = await query
    if (error) throw error
    newSalesCount.value = count ?? 0
  } catch (error) {
    // A badge is not worth breaking a page over. Leave the last known count.
    console.error('Could not count new sales:', error?.message ?? error)
  }
}

/**
 * Stamps "seen" and clears the dot. Called when the seller opens Sales Orders,
 * which is the point at which they have in fact seen them.
 */
export async function markSalesSeen() {
  if (!userId.value) return

  const seenAt = new Date().toISOString()
  const { error } = await supabase
    .from('profiles')
    .update({ sales_seen_at: seenAt })
    .eq('id', userId.value)

  if (error) {
    console.error('Could not mark sales as seen:', error.message)
    return
  }

  // Kept in step locally so the dot clears now rather than on the next profile
  // load, and so refreshNewSales() compares against the new mark.
  if (profile.value) profile.value.sales_seen_at = seenAt
  newSalesCount.value = 0
}

// Follows the profile rather than the session, because the count needs
// sales_seen_at and loadProfile() resolves a tick after sign-in. Same reason
// wishlist.js watches userId directly: no page should have to remember to ask.
watch(
  () => profile.value?.sales_seen_at,
  (seenAt) => {
    if (seenAt) refreshNewSales()
    else newSalesCount.value = 0
  },
  { immediate: true },
)