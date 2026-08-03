import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const RESEND_FROM = Deno.env.get('RESEND_FROM_EMAIL') ?? 'Green Atelier <mierzaazmi@gmail.com>'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing Authorization header' }, 401)

    const { orderId } = await req.json()
    if (!orderId) return json({ error: 'orderId is required' }, 400)

    // Verify the caller via their own JWT, so a user can only email their own order.
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) return json({ error: 'Not authenticated' }, 401)

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        id, order_number, subtotal, shipping_fee, service_fee, discount, total,
        payment_method, placed_at, buyer_id,
        items:order_items(title_snapshot, brand_snapshot, price_paid)
      `)
      .eq('id', orderId)
      .maybeSingle()

    if (orderError) throw orderError
    if (!order || order.buyer_id !== user.id) return json({ error: 'Order not found' }, 404)

    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(user.id)
    const email = authUser?.user?.email
    if (!email) return json({ error: 'No email on file for this account.' }, 400)

    if (!RESEND_API_KEY) {
      return json({ error: 'Email sending is not configured (missing RESEND_API_KEY secret).' }, 500)
    }

    const itemsHtml = (order.items ?? [])
      .map(
        (i: any) =>
          `<tr><td style="padding:6px 0;">${i.title_snapshot}${i.brand_snapshot ? ` (${i.brand_snapshot})` : ''}</td><td style="text-align:right;">RM ${Number(i.price_paid).toFixed(2)}</td></tr>`,
      )
      .join('')

    const html = `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color:#333;">
        <p style="letter-spacing:0.2em; color:#C9A96E; text-align:center; font-size:12px;">GREEN ATELIER</p>
        <h2 style="text-align:center;">Order Confirmed</h2>
        <p style="text-align:center; color:#888; font-size:13px;">
          Order #${order.order_number} · ${new Date(order.placed_at).toLocaleDateString()}
        </p>
        <table style="width:100%; font-size:14px; margin-top:20px;">${itemsHtml}</table>
        <table style="width:100%; font-size:13px; margin-top:16px; border-top:1px solid #eee; padding-top:10px;">
          <tr><td>Subtotal</td><td style="text-align:right;">RM ${Number(order.subtotal).toFixed(2)}</td></tr>
          <tr><td>Shipping</td><td style="text-align:right;">RM ${Number(order.shipping_fee).toFixed(2)}</td></tr>
          <tr><td>Service fee</td><td style="text-align:right;">RM ${Number(order.service_fee).toFixed(2)}</td></tr>
          ${Number(order.discount) > 0 ? `<tr><td>Discount</td><td style="text-align:right;">-RM ${Number(order.discount).toFixed(2)}</td></tr>` : ''}
          <tr style="font-weight:bold;">
            <td style="padding-top:8px;">Total</td>
            <td style="text-align:right; padding-top:8px;">RM ${Number(order.total).toFixed(2)}</td>
          </tr>
        </table>
        <p style="text-align:center; color:#888; font-size:12px; margin-top:24px;">
          Thank you for shopping consciously with Green Atelier.
        </p>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: email,
        subject: `Your Green Atelier receipt — Order #${order.order_number}`,
        html,
      }),
    })

    if (!res.ok) throw new Error(`Resend API error: ${await res.text()}`)

    return json({ success: true })
  } catch (error) {
  console.error('SEND RECEIPT EMAIL ERROR:', error)

  return json(
    {
      error: error instanceof Error ? error.message : 'Unknown error',
    },
    500,
  )
}
})