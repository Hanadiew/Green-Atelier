// =============================================================================
// stripe-webhook — the ONLY place an order becomes paid (TEST MODE)
// =============================================================================
// The success page is not authoritative: a buyer visiting /payment-success
// proves nothing. Payment is settled here, and only after Stripe's signature
// verifies. That also means payment still lands if the buyer's browser dies on
// the way back from Stripe.
//
// Secrets (server-side only):
//   STRIPE_SECRET_KEY           sk_test_...
//   STRIPE_WEBHOOK_SECRET       whsec_... from `stripe listen` or the dashboard
//   SUPABASE_SERVICE_ROLE_KEY   to call finalize/release, which are not granted
//                               to authenticated
//
// Deploy with --no-verify-jwt: Stripe does not send a Supabase JWT. The Stripe
// signature is the authentication.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import Stripe from 'npm:stripe@16.12.0'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

/** Where the GAFS order id travels on a Stripe object. */
function orderIdFrom(object: any): string | null {
  return object?.client_reference_id ?? object?.metadata?.gafs_order_id ?? null
}

/**
 * A payment_intent event carries no client_reference_id, so the order is found
 * by the intent id we stamped on it, falling back to the session lookup.
 */
async function orderIdForPaymentIntent(intentId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent_id', intentId)
    .maybeSingle()
  if (data?.id) return data.id

  const sessions = await stripe.checkout.sessions.list({ payment_intent: intentId, limit: 1 })
  return sessions.data.length ? orderIdFrom(sessions.data[0]) : null
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set — refusing to trust this request.')
    return new Response('Webhook not configured', { status: 500 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) return new Response('Missing stripe-signature header', { status: 400 })

  // Must be the raw body — parsing it first would break the signature.
  const payload = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, STRIPE_WEBHOOK_SECRET)
  } catch (error) {
    // Unverified: could be anyone. 400 and no side effects.
    console.error('Stripe signature verification failed:', (error as Error).message)
    return new Response(`Signature verification failed: ${(error as Error).message}`, {
      status: 400,
    })
  }

  try {
    switch (event.type) {
      // The success path. Fires whether or not the buyer made it back to GAFS.
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = orderIdFrom(session)
        if (!orderId) {
          console.error('No GAFS order id on session', session.id)
          break
        }

        // Trust the event, but confirm the money actually cleared. A completed
        // session with an unpaid status must not finalize anything.
        if (session.payment_status !== 'paid') {
          console.log('Session', session.id, 'completed but payment_status is', session.payment_status)
          break
        }

        // Confirm the session really belongs to this order, so a forged (but
        // somehow signed) reference cannot settle someone else's order.
        const { data: order, error: orderError } = await supabaseAdmin
          .from('orders')
          .select('id, total, stripe_checkout_session_id')
          .eq('id', orderId)
          .maybeSingle()

        if (orderError) throw orderError
        if (!order) {
          console.error('Session', session.id, 'references unknown order', orderId)
          break
        }
        if (
          order.stripe_checkout_session_id &&
          order.stripe_checkout_session_id !== session.id
        ) {
          console.error(
            'Session mismatch for order', orderId,
            '— stored', order.stripe_checkout_session_id, 'received', session.id,
          )
          break
        }

        // And that the amount matches what we asked for.
        const expected = Math.round(Number(order.total) * 100)
        if (typeof session.amount_total === 'number' && session.amount_total !== expected) {
          console.error(
            'Amount mismatch for order', orderId,
            '— expected', expected, 'received', session.amount_total,
          )
          break
        }

        const intentId =
          typeof session.payment_intent === 'string' ? session.payment_intent : null

        // Idempotent in the database: returns false if already paid.
        const { data: finalized, error: finalizeError } = await supabaseAdmin.rpc(
          'finalize_paid_order',
          { p_order_id: orderId, p_payment_intent_id: intentId },
        )
        if (finalizeError) throw finalizeError

        console.log(
          finalized
            ? `Order ${orderId} finalized as paid.`
            : `Order ${orderId} was already paid — duplicate event ignored.`,
        )
        break
      }

      // Buyer walked away, or the 30-minute session lifetime ran out. Listings
      // go back on sale.
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = orderIdFrom(session)
        if (!orderId) break

        const { error } = await supabaseAdmin.rpc('release_pending_order', {
          p_order_id: orderId,
          p_payment_status: 'pending',
        })
        if (error) throw error
        console.log(`Order ${orderId} released — checkout session expired.`)
        break
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = orderIdFrom(session)
        if (!orderId) break

        const { error } = await supabaseAdmin.rpc('release_pending_order', {
          p_order_id: orderId,
          p_payment_status: 'failed',
        })
        if (error) throw error
        console.log(`Order ${orderId} marked failed — async payment failed.`)
        break
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent
        const orderId = await orderIdForPaymentIntent(intent.id)
        if (!orderId) break

        // release_pending_order refuses to touch a paid order, so a failed
        // attempt arriving after a later successful retry is harmless.
        const { error } = await supabaseAdmin.rpc('release_pending_order', {
          p_order_id: orderId,
          p_payment_status: 'failed',
        })
        if (error) throw error
        console.log(`Order ${orderId} marked failed — payment declined.`)
        break
      }

      default:
        // Everything else is acknowledged and ignored, so Stripe stops retrying.
        console.log('Unhandled Stripe event:', event.type)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    // 500 makes Stripe retry, which is what we want for a transient database
    // problem — the handlers above are all idempotent.
    console.error('STRIPE WEBHOOK ERROR:', event.type, error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Webhook failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})
