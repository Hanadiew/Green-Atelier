// =============================================================================
// list-payment-methods — the caller's saved cards, and removing one
// =============================================================================
// Card details live at Stripe, never in GAFS (see README: card data is not
// stored here). So the Payment methods page cannot read them from the database —
// it has to ask Stripe, which needs the secret key, which needs a server.
//
// Only ever operates on the customer recorded against the CALLER's own profile,
// so no request can enumerate somebody else's cards.
//
// Secrets: STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY.

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

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    if (!STRIPE_SECRET_KEY) return json({ error: 'Payments are not configured.' }, 500)

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

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle()

    const customerId = profile?.stripe_customer_id
    // No customer yet simply means no saved cards. Not an error.
    if (!customerId) return json({ cards: [], defaultId: null })

    const body = (await req.json().catch(() => ({}))) ?? {}

    if (body.action === 'detach') {
      if (!body.paymentMethodId) return json({ error: 'paymentMethodId is required.' }, 400)

      // Confirm the card belongs to THIS customer before detaching. Without this
      // a caller could pass any pm_… id and remove a stranger's card.
      const method = await stripe.paymentMethods.retrieve(body.paymentMethodId)
      if (method.customer !== customerId) {
        return json({ error: 'That card is not on your account.' }, 403)
      }
      await stripe.paymentMethods.detach(body.paymentMethodId)
      return json({ ok: true })
    }

    const [methods, customer] = await Promise.all([
      stripe.paymentMethods.list({ customer: customerId, type: 'card' }),
      stripe.customers.retrieve(customerId),
    ])

    const defaultId =
      (customer as any)?.invoice_settings?.default_payment_method ?? null

    return json({
      cards: methods.data.map((m) => ({
        id: m.id,
        brand: m.card?.brand ?? 'card',
        last4: m.card?.last4 ?? '****',
        expMonth: m.card?.exp_month ?? null,
        expYear: m.card?.exp_year ?? null,
        isDefault: m.id === defaultId,
      })),
      defaultId,
    })
  } catch (error) {
    console.error('LIST PAYMENT METHODS ERROR:', error)
    return json(
      { error: error instanceof Error ? error.message : 'Could not load saved cards.' },
      500,
    )
  }
})
