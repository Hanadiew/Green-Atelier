// =============================================================================
// confirm-checkout-session — settle an order on the way back from Stripe
// =============================================================================
// The webhook remains the authoritative path and still settles orders on its
// own. This exists because the buyer usually lands back on /payment-success
// before the webhook does — and in local development, where nothing forwards
// Stripe events to the Edge Function at all, it never does. Waiting on it left
// the success page spinning until it timed out on a payment that had in fact
// gone through.
//
// The browser still cannot declare a payment. It sends an order id and nothing
// else; this asks STRIPE what happened to that order's Checkout Session and
// applies exactly the same checks the webhook applies (session belongs to the
// order, amount matches, payment_status is 'paid') before calling the same
// idempotent finalize_paid_order(). Calling it on an order that the webhook has
// already settled is a no-op.
//
// Secrets used (server-side only, never VITE_*):
//   STRIPE_SECRET_KEY            sk_test_...
//   SUPABASE_SERVICE_ROLE_KEY    to read the order and call finalize/release
//
// Deploy WITH jwt verification (the default): the caller must be the buyer.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import Stripe from 'npm:stripe@16.12.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? ''

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

/** The current state of an order, as the success page wants to read it. */
async function readOrder(orderId: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, buyer_id, total, status, payment_status, stripe_checkout_session_id')
    .eq('id', orderId)
    .maybeSingle()
  if (error) throw error
  return data
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    if (!STRIPE_SECRET_KEY) {
      return json({ error: 'Payments are not configured (missing STRIPE_SECRET_KEY).' }, 500)
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
    if (authError || !user) return json({ error: 'Please sign in.' }, 401)

    const { orderId } = (await req.json().catch(() => ({}))) ?? {}
    if (!orderId) return json({ error: 'An order id is required.' }, 400)

    const order = await readOrder(orderId)
    if (!order) return json({ error: 'Order not found.' }, 404)

    // Someone else's order is none of this caller's business, and saying so
    // plainly would confirm the order exists.
    if (order.buyer_id !== user.id) return json({ error: 'Order not found.' }, 404)

    // Already settled — by the webhook, or by an earlier call to this. Nothing
    // to do, and re-reading Stripe would only cost a round trip.
    if (order.payment_status === 'paid') {
      return json({
        settled: false,
        paymentStatus: order.payment_status,
        orderStatus: order.status,
      })
    }

    if (!order.stripe_checkout_session_id) {
      return json({
        settled: false,
        paymentStatus: order.payment_status,
        orderStatus: order.status,
        reason: 'no_session',
      })
    }

    const session = await stripe.checkout.sessions.retrieve(order.stripe_checkout_session_id)

    // The session Stripe handed back must be the one recorded against this
    // order, and must carry the same order id it was created with.
    const sessionOrderId = session.client_reference_id ?? session.metadata?.gafs_order_id ?? null
    if (sessionOrderId && sessionOrderId !== order.id) {
      console.error('Session', session.id, 'references order', sessionOrderId, 'not', order.id)
      return json({ error: 'This payment does not belong to that order.' }, 409)
    }

    if (session.payment_status === 'paid') {
      // Same amount check the webhook makes: a session that charged a different
      // figure than the order says settles nothing.
      const expected = Math.round(Number(order.total) * 100)
      if (typeof session.amount_total === 'number' && session.amount_total !== expected) {
        console.error(
          'Amount mismatch for order', order.id,
          '— expected', expected, 'received', session.amount_total,
        )
        return json({ error: 'Payment amount does not match this order.' }, 409)
      }

      const intentId =
        typeof session.payment_intent === 'string' ? session.payment_intent : null

      // Idempotent: returns false when the webhook got here first.
      const { data: finalized, error: finalizeError } = await supabaseAdmin.rpc(
        'finalize_paid_order',
        { p_order_id: order.id, p_payment_intent_id: intentId },
      )
      if (finalizeError) throw finalizeError

      console.log(
        finalized
          ? `Order ${order.id} finalized as paid from the return redirect.`
          : `Order ${order.id} was already paid — nothing to do.`,
      )
    } else if (session.status === 'expired') {
      // The buyer never paid and the session is gone. Hand the listings back
      // rather than waiting on the expiry webhook.
      const { error: releaseError } = await supabaseAdmin.rpc('release_pending_order', {
        p_order_id: order.id,
        p_payment_status: 'pending',
      })
      if (releaseError) throw releaseError
      console.log(`Order ${order.id} released — checkout session expired.`)
    }
    // Anything else (session still open, payment processing) is left alone:
    // the caller polls, and the webhook is still coming.

    const fresh = await readOrder(order.id)
    return json({
      settled: fresh?.payment_status === 'paid',
      paymentStatus: fresh?.payment_status ?? order.payment_status,
      orderStatus: fresh?.status ?? order.status,
      sessionStatus: session.status,
      sessionPaymentStatus: session.payment_status,
    })
  } catch (error) {
    console.error('CONFIRM CHECKOUT SESSION ERROR:', error)
    return json(
      { error: error instanceof Error ? error.message : 'Could not confirm the payment.' },
      500,
    )
  }
})
