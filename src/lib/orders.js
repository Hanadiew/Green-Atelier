import { supabase } from '../supabase.js'

const STATUS_LABELS = {
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export function statusLabel(status) {
  return STATUS_LABELS[status] ?? status
}

/**
 * Places an order for everything in the caller's cart.
 *
 * All pricing happens inside the place_order database function, reading stored
 * listing prices — the browser cannot influence the total. The function also
 * locks each listing so two buyers racing for the same one-of-a-kind item
 * cannot both succeed.
 */
export async function placeOrder({ shippingAddressId, paymentMethod, promoCode = null }) {
  const { data, error } = await supabase.rpc('place_order', {
    p_shipping_address_id: shippingAddressId,
    p_payment_method: paymentMethod,
    p_promo_code: promoCode,
  })
  if (error) throw new Error(error.message.replace(/^.*?:\s*/, ''))
  return data
}

export async function validatePromoCode(code, subtotal) {
  const { data, error } = await supabase.rpc('validate_promo_code', {
    p_code: code,
    p_subtotal: subtotal,
  })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  return {
    valid: Boolean(row?.valid),
    discount: Number(row?.discount ?? 0),
    reason: row?.reason ?? null,
  }
}

/** Orders the signed-in user has placed, newest first, with their items. */
export async function fetchOrders(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select(
      `id, order_number, subtotal, shipping_fee, service_fee, discount, total,
       status, payment_status, payment_method, placed_at,
       items:order_items(id, listing_id, title_snapshot, brand_snapshot,
                         image_snapshot, price_paid, status)`,
    )
    .eq('buyer_id', userId)
    .order('placed_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((o) => ({
    id: o.id,
    orderId: o.order_number,
    total: Number(o.total),
    subtotal: Number(o.subtotal),
    shippingFee: Number(o.shipping_fee),
    serviceFee: Number(o.service_fee),
    discount: Number(o.discount),
    status: statusLabel(o.status),
    rawStatus: o.status,
    paymentStatus: o.payment_status,
    paymentMethod: o.payment_method,
    date: new Date(o.placed_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    items: (o.items ?? []).map((i) => ({
      id: i.id,
      listingId: i.listing_id,
      name: i.title_snapshot,
      brand: i.brand_snapshot,
      image: i.image_snapshot || '/demo/bag1.png',
      price: Number(i.price_paid),
      status: statusLabel(i.status),
    })),
  }))
}

/** Full detail for one order — used by the receipt page. */
export async function fetchOrderById(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .select(
      `id, order_number, subtotal, shipping_fee, service_fee, discount, total,
       status, payment_status, payment_method, placed_at, promo_code,
       shipping_address:addresses(first_name, surname, street_address, apartment,
                                  city, state, postcode, country, phone_code, phone),
       items:order_items(id, listing_id, title_snapshot, brand_snapshot,
                         image_snapshot, price_paid, status)`,
    )
    .eq('id', orderId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    id: data.id,
    orderId: data.order_number,
    subtotal: Number(data.subtotal),
    shippingFee: Number(data.shipping_fee),
    serviceFee: Number(data.service_fee),
    discount: Number(data.discount),
    total: Number(data.total),
    status: statusLabel(data.status),
    rawStatus: data.status,
    paymentStatus: data.payment_status,
    paymentMethod: data.payment_method,
    promoCode: data.promo_code,
    placedAt: data.placed_at,
    date: new Date(data.placed_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    time: new Date(data.placed_at).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    shippingAddress: data.shipping_address ?? null,
    items: (data.items ?? []).map((i) => ({
      id: i.id,
      listingId: i.listing_id,
      name: i.title_snapshot,
      brand: i.brand_snapshot,
      image: i.image_snapshot || '/demo/bag1.png',
      price: Number(i.price_paid),
      status: statusLabel(i.status),
    })),
  }
}


/** Items the signed-in user has sold, for a seller dashboard. */
export async function fetchSales(userId) {
  const { data, error } = await supabase
    .from('order_items')
    .select(
      `id, title_snapshot, brand_snapshot, image_snapshot, price_paid,
       seller_payout, platform_fee, status, created_at,
       order:orders(order_number, placed_at, status)`,
    )
    .eq('seller_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((i) => ({
    id: i.id,
    name: i.title_snapshot,
    brand: i.brand_snapshot,
    image: i.image_snapshot || '/demo/bag1.png',
    price: Number(i.price_paid),
    payout: Number(i.seller_payout),
    platformFee: Number(i.platform_fee),
    status: statusLabel(i.status),
    orderNumber: i.order?.order_number,
  }))
}

export async function cancelOrder(orderId) {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', orderId)
  if (error) throw error
}
