// =============================================================================
// attach-test-card — give a user a saved card, without them typing one
// =============================================================================
// Stripe test mode ships ready-made PaymentMethod tokens (pm_card_visa and
// friends) that represent known test cards. They can be attached to a Customer
// server-side, so a user ends up with a saved card having entered nothing — which
// is the point: at checkout the card is already there.
//
// THIS ONLY WORKS IN TEST MODE. pm_card_visa does not exist in live mode, and it
// must not: attaching a card nobody entered would be fraud. The test-key check
// below is what keeps that honest.
//
// Secrets: STRIPE_SECRET_KEY (sk_test_ only), SUPABASE_SERVICE_ROLE_KEY.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import Stripe from 'npm:stripe@16.12.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? ''

// Stripe's canonical test tokens. Only these are offered — an arbitrary
// payment-method id from the client would let a caller attach someone else's.
const TEST_CARDS: Record<string, string> = {
  visa: 'pm_card_visa',
  mastercard: 'pm_card_mastercard',
  declined: 'pm_card_chargeDeclined',
}

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

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    if (!STRIPE_SECRET_KEY.startsWith('sk_test_')) {
      return json(
        {
          error:
            'Saved test cards are only available in Stripe test mode. A real card must ' +
            'always be entered by the cardholder.',
        },
        400,
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
    if (authError || !user) return json({ error: 'Please sign in first.' }, 401)

    const body = (await req.json().catch(() => ({}))) ?? {}
    const card = TEST_CARDS[body.card ?? 'visa']
    if (!card) return json({ error: `Unknown test card "${body.card}".` }, 400)

    // Reuse the user's Stripe customer if they already have one.
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, full_name, username')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) throw profileError

    let customerId = profile?.stripe_customer_id ?? null

    if (customerId) {
      // Confirm it still exists — a wiped test dataset leaves a dangling id.
      const existing = await stripe.customers.retrieve(customerId).catch(() => null)
      if (!existing || (existing as any).deleted) customerId = null
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        name: profile?.full_name ?? profile?.username ?? undefined,
        metadata: { gafs_user_id: user.id },
      })
      customerId = customer.id

      const { error: saveError } = await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
      if (saveError) throw saveError
    }

    const method = await stripe.paymentMethods.attach(card, { customer: customerId })

    // Default for future payments, which is what makes Checkout preselect it.
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: method.id },
    })

    return json({
      ok: true,
      card: {
        id: method.id,
        brand: method.card?.brand ?? 'card',
        last4: method.card?.last4 ?? '****',
        expMonth: method.card?.exp_month ?? null,
        expYear: method.card?.exp_year ?? null,
      },
    })
  } catch (error) {
    console.error('ATTACH TEST CARD ERROR:', error)
    return json(
      { error: error instanceof Error ? error.message : 'Could not save the test card.' },
      500,
    )
  }
})
