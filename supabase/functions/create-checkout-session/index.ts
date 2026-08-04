// =============================================================================
// create-checkout-session — GAFS -> Stripe Checkout (TEST MODE)
// =============================================================================
// Creates the pending order first, then a Stripe Checkout Session priced from
// what the database wrote. The browser sends only an address id, a payment
// method label and a promo code — never an amount. Anything a buyer could tamper
// with is recomputed by create_pending_order() inside Postgres.
//
// Secrets used (server-side only, never VITE_*):
//   STRIPE_SECRET_KEY            sk_test_... — must be a TEST key
//   SUPABASE_SERVICE_ROLE_KEY    to stamp the session id onto the order

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import Stripe from 'npm:stripe@16.12.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
const SITE_URL = Deno.env.get('SITE_URL') ?? 'http://localhost:5173'
const CURRENCY = 'myr'

// Stripe's shortest allowed session lifetime. create_pending_order() releases a
// buyer's own stale holds after the same 30 minutes, so the two agree.
const SESSION_TTL_SECONDS = 30 * 60

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

/** RM 1.00 -> 100 sen. Stripe amounts are integer minor units. */
function toMinorUnits(amount: number) {
  return Math.round(Number(amount) * 100)
}

/**
 * Where Stripe sends the buyer back to.
 *
 * Prefers the origin the request actually came from, so a dev server on a
 * non-default port still gets the buyer home without anyone having to keep
 * SITE_URL in sync. Deliberately narrow about it: only localhost, or an exact
 * match for SITE_URL. Echoing an arbitrary Origin back into success_url would be
 * an open redirect, and while the redirect carries no secret and never settles a
 * payment, it is not worth the hole.
 */
function resolveReturnOrigin(req: Request) {
  const origin = req.headers.get('Origin')
  if (!origin) return SITE_URL

  if (origin === SITE_URL) return origin

  try {
    const { hostname, protocol } = new URL(origin)
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && protocol === 'http:') {
      return origin
    }
  } catch {
    // Unparseable Origin — fall through to the configured value.
  }

  return SITE_URL
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let pendingOrderId: string | null = null
  const returnOrigin = resolveReturnOrigin(req)

  try {
    if (!STRIPE_SECRET_KEY) {
      return json({ error: 'Payments are not configured (missing STRIPE_SECRET_KEY).' }, 500)
    }
    // Belt and braces for an FYP build: refuse to run against a live key at all.
    if (!STRIPE_SECRET_KEY.startsWith('sk_test_')) {
      return json(
        { error: 'Refusing to run: STRIPE_SECRET_KEY is not a test key. GAFS is test mode only.' },
        500,
      )
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing Authorization header' }, 401)

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser()
    if (authError || !user) {
      return json({ error: 'Please sign in to continue to payment.' }, 401)
    }

    const body = await req.json().catch(() => ({}))
    const { shippingAddressId, paymentMethod = null, promoCode = null } = body ?? {}
    if (!shippingAddressId) return json({ error: 'A shipping address is required.' }, 400)

    // Prices, validates the cart, blocks self-purchase and reserves the listings.
    // Runs as the buyer, so RLS and auth.uid() still apply.
    const { data: orderId, error: rpcError } = await userClient.rpc('create_pending_order', {
      p_shipping_address_id: shippingAddressId,
      p_payment_method: paymentMethod,
      p_promo_code: promoCode,
      p_payment_provider: 'stripe',
    })

    if (rpcError) {
      // These are the buyer-facing rules ("no longer available", "bag is empty").
      return json({ error: rpcError.message.replace(/^.*?:\s*/, '') }, 409)
    }
    pendingOrderId = orderId as string

    // If the buyer has a Stripe customer with a saved card, hand it to Checkout so
    // the card is already there instead of being retyped.
    const { data: buyerProfile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle()
    const stripeCustomerId = buyerProfile?.stripe_customer_id ?? null

    // Read the authoritative totals back out. Note this is the service-role
    // client reading what Postgres computed — not what the browser claimed.
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(
        `id, order_number, subtotal, shipping_fee, service_fee, discount, total,
         items:order_items(title_snapshot, brand_snapshot, price_paid)`,
      )
      .eq('id', pendingOrderId)
      .single()

    if (orderError) throw orderError

    // One line item per listing, plus fees as their own lines so the buyer sees
    // the same breakdown on Stripe that they saw on the GAFS checkout page.
    const lineItems = (order.items ?? []).map((item: any) => ({
      quantity: 1,
      price_data: {
        currency: CURRENCY,
        unit_amount: toMinorUnits(item.price_paid),
        product_data: {
          name: item.title_snapshot,
          ...(item.brand_snapshot ? { description: item.brand_snapshot } : {}),
        },
      },
    }))

    if (Number(order.shipping_fee) > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: CURRENCY,
          unit_amount: toMinorUnits(order.shipping_fee),
          product_data: { name: 'Shipping' },
        },
      })
    }
    if (Number(order.service_fee) > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: CURRENCY,
          unit_amount: toMinorUnits(order.service_fee),
          product_data: { name: 'Service fee (5%)' },
        },
      })
    }

    // A promo discount is applied as a Stripe coupon rather than a negative line
    // item, which Stripe does not allow.
    let discounts: Array<{ coupon: string }> | undefined
    if (Number(order.discount) > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: toMinorUnits(order.discount),
        currency: CURRENCY,
        duration: 'once',
        name: `Promo ${order.order_number}`,
      })
      discounts = [{ coupon: coupon.id }]
    }

    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        line_items: lineItems,
        discounts,
        // customer and customer_email are mutually exclusive in Checkout: passing
        // both is an error, so the customer wins when there is one.
        ...(stripeCustomerId
          ? { customer: stripeCustomerId }
          : { customer_email: user.email ?? undefined }),
        // Saves whatever card is used back onto the customer, so a buyer who
        // never added a test card still only types it once.
        ...(stripeCustomerId
          ? { payment_intent_data: { setup_future_usage: 'off_session' as const } }
          : {}),
        expires_at: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
        // The webhook reads these back. client_reference_id is the primary link;
        // metadata is a redundant copy for the Stripe dashboard.
        client_reference_id: order.id,
        metadata: { gafs_order_id: order.id, gafs_order_number: order.order_number },
        success_url: `${returnOrigin}/payment-success?order=${order.id}`,
        cancel_url: `${returnOrigin}/payment-cancelled?order=${order.id}`,
      },
      // Retrying this request must not open a second session for the same order.
      { idempotencyKey: `gafs-checkout-${order.id}` },
    )

    const { error: stampError } = await supabaseAdmin
      .from('orders')
      .update({
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === 'string' ? session.payment_intent : null,
      })
      .eq('id', order.id)

    if (stampError) throw stampError

    return json({ orderId: order.id, orderNumber: order.order_number, url: session.url })
  } catch (error) {
    console.error('CREATE CHECKOUT SESSION ERROR:', error)

    // The order was reserved but we never got the buyer to Stripe. Hand the
    // listings back rather than stranding them in 'reserved' for 30 minutes.
    if (pendingOrderId) {
      const { error: releaseError } = await supabaseAdmin.rpc('release_pending_order', {
        p_order_id: pendingOrderId,
        p_payment_status: 'failed',
      })
      if (releaseError) {
        console.error('Could not release reservation for', pendingOrderId, releaseError.message)
      }
    }

    return json(
      { error: error instanceof Error ? error.message : 'Could not start payment.' },
      500,
    )
  }
})
