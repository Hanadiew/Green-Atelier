import { supabase } from '../supabase.js'

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