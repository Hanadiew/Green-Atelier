-- =============================================================================
-- SUSPENSION NOTICE AT SIGN-IN
-- =============================================================================
-- A suspended member got GoTrue's "User is banned" and nothing else: no reason,
-- no end date, and no way to tell a deliberate suspension from a broken login.
-- This lets the sign-in page tell them what the admin portal already knows.
--
-- account_suspensions itself stays staff-only. This function is the single narrow
-- window into it, and it is deliberately narrow:
--
--   * one row at most, and only ever the two fields a member needs — never who
--     imposed the suspension, when, or any of the account's earlier ones;
--   * only while the ban is actually in force, so a lifted or expired suspension
--     stops being readable the moment it stops applying;
--   * nothing at all for an address that is not suspended, whether or not an
--     account exists on it — the empty result is the same either way, so this
--     cannot be used to test which addresses are registered.
--
-- It is callable without a session, which it has to be: the person reading the
-- notice is by definition unable to sign in. That is a deliberate trade, made
-- knowingly. GoTrue already answers "is this address suspended?" to anyone who
-- asks — the user_banned error on a failed sign-in is that answer, and it needs no
-- password to provoke — so what this adds to what a prober can already learn is
-- the reason text and the end date, for accounts that are suspended right now.
--
-- The consequence for staff is that the reason is written for two readers: the
-- next moderator, and the suspended member. The suspend dialog in the admin portal
-- says so where the reason is typed.
--
-- security definer because auth.users is unreadable to anon and authenticated, and
-- search_path is pinned empty so every name below resolves explicitly.

create or replace function public.suspension_notice(account_email text)
returns table (reason text, ends_at timestamptz)
language sql
security definer
set search_path = ''
as $$
  select
    coalesce(s.reason, '') as reason,
    -- A record's own ends_at, where there is one: null there means indefinite and
    -- must stay null, so it cannot be coalesced with banned_until — which for an
    -- indefinite suspension holds a date a century out and would read as a bug.
    -- With no record, banned_until is all there is, and it is still the truth for
    -- a ban imposed from the Supabase dashboard or before records were kept.
    case when s.id is null then u.banned_until else s.ends_at end as ends_at
  from auth.users u
  -- Left, so a ban with no record behind it still produces a notice, just a
  -- reasonless one. The join conditions keep only a record that still explains the
  -- ban in force: one closed by hand, or one that ran out while the account stayed
  -- blocked by some other route, is not offered as if it did.
  left join public.account_suspensions s
    on s.user_id = u.id
    and s.lifted_at is null
    and (s.ends_at is null or s.ends_at > now())
  -- banned_until is what actually blocks sign-in, so it decides whether there is a
  -- notice to give at all. A lifted ban leaves it in the past.
  where lower(u.email) = lower(trim(account_email))
    and u.banned_until is not null
    and u.banned_until > now()
  order by s.created_at desc nulls last
  limit 1;
$$;

-- EXECUTE on a new function is granted to PUBLIC by default, which would include
-- the postgres and service_role paths regardless; the revoke is here so the grant
-- below is the complete and only statement of who may call it.
revoke all on function public.suspension_notice(text) from public;
grant execute on function public.suspension_notice(text) to anon, authenticated;
