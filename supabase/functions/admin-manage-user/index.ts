// =============================================================================
// admin-manage-user — suspend / reactivate / delete an account
// =============================================================================
// All three actions live in auth.users, which the browser's publishable key
// cannot write to at any privilege level, so they need the service role and
// therefore a server.
//
// The service role bypasses RLS entirely, which means this function must do its
// own authorisation. It checks the CALLER against public.user_roles rather than
// trusting anything in the request body — an admin flag sent by the client would
// be worthless.
//
// Secrets: SUPABASE_SERVICE_ROLE_KEY (auto-injected).

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing Authorization header' }, 401)

    // Identify the caller from their own JWT.
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const {
      data: { user: caller },
      error: authError,
    } = await userClient.auth.getUser()
    if (authError || !caller) return json({ error: 'Not authenticated' }, 401)

    // Authorise against the database, not the request. user_roles is the same
    // source public.is_admin() reads, so the portal and this function agree.
    const { data: role, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .maybeSingle()

    if (roleError) throw roleError
    if (role?.role !== 'admin') {
      return json({ error: 'Only an administrator can manage accounts.' }, 403)
    }

    // days: null means indefinite. reason is required for a suspension and
    // ignored by the other two actions.
    const { action, userId, days = null, reason = '' } = (await req.json().catch(() => ({}))) ?? {}
    if (!userId) return json({ error: 'userId is required.' }, 400)
    if (userId === caller.id) {
      return json({ error: 'You cannot suspend or delete your own account.' }, 400)
    }

    // Never let one admin remove another through this endpoint.
    const { data: targetRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()
    if (targetRole) {
      return json(
        { error: 'That account is staff. Remove their role in user_roles first.' },
        400,
      )
    }

    if (action === 'suspend') {
      // Refused here as well as in the browser. banned_until alone cannot explain
      // itself, so an unexplained suspension is one nobody can review later.
      const suspensionReason = String(reason ?? '').trim()
      if (suspensionReason.length < 3) {
        return json({ error: 'Give a reason for the suspension.' }, 400)
      }
      if (suspensionReason.length > 500) {
        return json({ error: 'Keep the reason under 500 characters.' }, 400)
      }

      const suspensionDays = days === null || days === undefined ? null : Math.trunc(Number(days))
      if (suspensionDays !== null && (!Number.isFinite(suspensionDays) || suspensionDays < 1)) {
        return json({ error: 'A suspension must run for at least one day.' }, 400)
      }

      const endsAt =
        suspensionDays === null
          ? null
          : new Date(Date.now() + suspensionDays * 86_400_000).toISOString()

      // ban_duration is a Go duration string, where hours is the largest unit
      // available — hence the conversion from the days the moderator picked. An
      // indefinite suspension is a century rather than a special value, because
      // GoTrue has no way to express "forever".
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: `${(suspensionDays ?? 36_500) * 24}h`,
      })
      if (error) throw error

      const { error: recordError } = await supabaseAdmin.from('account_suspensions').insert({
        user_id: userId,
        reason: suspensionReason,
        ends_at: endsAt,
        created_by: caller.id,
      })

      // The ban and its explanation are one action, so a half-completed one is
      // undone rather than left standing: an account blocked with no readable
      // reason is exactly the state this feature exists to remove.
      if (recordError) {
        await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: 'none' })
        throw recordError
      }

      return json({ ok: true, action: 'suspend', endsAt })
    }

    if (action === 'reactivate') {
      // 'none' is Supabase's documented way to lift a ban.
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: 'none',
      })
      if (error) throw error

      // Close any open record so the history reads as suspended-then-restored,
      // rather than as a suspension that is somehow still running. Unlike the
      // suspend path this failure is only logged: access has already been given
      // back, and refusing the whole call would tell the admin it had not been.
      const { error: recordError } = await supabaseAdmin
        .from('account_suspensions')
        .update({ lifted_at: new Date().toISOString(), lifted_by: caller.id })
        .eq('user_id', userId)
        .is('lifted_at', null)
      if (recordError) {
        console.error('ADMIN MANAGE USER: could not close suspension record:', recordError.message)
      }

      return json({ ok: true, action: 'reactivate' })
    }

    if (action === 'delete') {
      // Deletion is no longer refused for accounts with history.
      //
      // It used to be, because order_items.seller_id and .listing_id cascaded:
      // removing a seller took their lines out of other buyers' order history.
      // Migration 20260808000300 changed both to ON DELETE SET NULL, and the
      // line already snapshots title, brand, image and price at checkout — so a
      // buyer's record now survives the seller being removed, showing the piece
      // exactly as it was bought.
      //
      // What deletion still removes is the account's own data: their listings,
      // wishlist, cart, addresses, and — if they were a buyer — their own orders
      // and payment records. That is the intent of the action, and it is
      // irreversible, so the interface confirms before calling this.

      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (error) throw error
      return json({ ok: true, action: 'delete' })
    }

    return json({ error: `Unknown action "${action}".` }, 400)
  } catch (error) {
    console.error('ADMIN MANAGE USER ERROR:', error)
    return json(
      { error: error instanceof Error ? error.message : 'Could not complete that action.' },
      500,
    )
  }
})
