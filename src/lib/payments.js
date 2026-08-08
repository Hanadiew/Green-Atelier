import { supabase } from '../supabase.js'

/**
 * Stripe payments, test mode.
 *
 * Nothing in here decides what anything costs. The browser sends an address, a
 * payment-method label and a promo code; the create-checkout-session Edge
 * Function prices the cart in Postgres and tells Stripe the amount. Likewise
 * nothing here marks an order paid — that is the webhook's job alone.
 */

/** Reads the real error body out of a functions.invoke() failure. */
async function invokeError(error) {
  const detail = await error.context?.json?.().catch(() => null)
  return new Error(detail?.error ?? error.message)
}

/**
 * Creates the pending order and its Stripe Checkout Session, then returns the
 * URL to send the buyer to. Does not redirect — the caller decides when.
 */
export async function createCheckoutSession({ shippingAddressId, paymentMethod, promoCode }) {
  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: { shippingAddressId, paymentMethod, promoCode: promoCode || null },
  })
  if (error) throw await invokeError(error)
  if (!data?.url) throw new Error('Stripe did not return a payment page. Please try again.')
  return data
}

/**
 * Payment and fulfilment state for one order. The success page polls this rather
 * than assuming it succeeded, because the webhook may not have landed yet.
 */
export async function fetchPaymentState(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, total, payment_status, status, paid_at, items:order_items(id)')
    .eq('id', orderId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    id: data.id,
    orderNumber: data.order_number,
    total: Number(data.total),
    itemCount: data.items?.length ?? 0,
    paymentStatus: data.payment_status,
    orderStatus: data.status,
    paidAt: data.paid_at,
    isPaid: data.payment_status === 'paid',
    isFailed: data.payment_status === 'failed',
    isAwaiting: data.payment_status === 'pending' && data.status === 'pending',
  }
}

/**
 * Asks the server to check with Stripe what happened to this order and settle it
 * if the money cleared.
 *
 * This does not make the browser authoritative — it only triggers a server-side
 * read of the Stripe session, and the Edge Function runs the same checks the
 * webhook does before marking anything paid. It exists because the buyer beats
 * the webhook back from Stripe more often than not, and in local development the
 * webhook may never arrive at all.
 *
 * Never throws: the success page keeps polling regardless, and the webhook
 * remains the path that settles payment if this one is unavailable.
 */
export async function confirmCheckoutSession(orderId) {
  if (!orderId) return null
  try {
    const { data, error } = await supabase.functions.invoke('confirm-checkout-session', {
      body: { orderId },
    })
    if (error) throw await invokeError(error)
    return data
  } catch (error) {
    console.warn('Could not confirm payment with Stripe:', error.message)
    return null
  }
}

/**
 * Releases the listings a cancelled checkout was holding so the buyer can retry
 * straight away. Safe to call more than once, and it can only ever affect the
 * caller's own unpaid order.
 */
export async function cancelPendingOrder(orderId) {
  const { error } = await supabase.rpc('cancel_my_pending_order', { p_order_id: orderId })
  if (error) throw error
}

// --- Saved cards ---------------------------------------------------------------
// Card details are never stored by GAFS — they live on a Stripe Customer. So
// these all go through Edge Functions: reading them needs the secret key.

/**
 * Attaches one of Stripe's test cards to the user, so checkout has a card ready
 * without them typing one. Test mode only — the function refuses otherwise,
 * because attaching a card nobody entered is not something a live account may do.
 */
export async function attachTestCard(card = 'visa') {
  const { data, error } = await supabase.functions.invoke('attach-test-card', {
    body: { card },
  })
  if (error) throw await invokeError(error)
  return data.card
}

/** The caller's saved cards. Empty when they have no Stripe customer yet. */
export async function fetchSavedCards() {
  const { data, error } = await supabase.functions.invoke('list-payment-methods', {
    body: {},
  })
  if (error) throw await invokeError(error)
  return data.cards ?? []
}

export async function removeSavedCard(paymentMethodId) {
  const { error } = await supabase.functions.invoke('list-payment-methods', {
    body: { action: 'detach', paymentMethodId },
  })
  if (error) throw await invokeError(error)
}

export const TEST_CARD_CHOICES = [
  { key: 'visa', label: 'Visa (payment succeeds)' },
  { key: 'mastercard', label: 'Mastercard (payment succeeds)' },
  { key: 'declined', label: 'Visa (always declined)' },
]

export const PAYMENT_STATUS_LABELS = {
  pending: 'Payment pending',
  paid: 'Paid',
  failed: 'Payment failed',
  refunded: 'Refunded',
}

export function paymentStatusLabel(status) {
  return PAYMENT_STATUS_LABELS[status] ?? status
}
