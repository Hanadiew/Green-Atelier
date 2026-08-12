-- =============================================================================
-- ACCOUNT SUSPENSIONS
-- =============================================================================
-- Suspending an account only ever wrote auth.users.banned_until, which says when
-- a ban ends and nothing else. Staff opening the user page afterwards could see
-- that sign-in was blocked but not why, who blocked it, or how long it was meant
-- to last — not even the admin who did it themselves a month earlier. The old
-- interface could show a date and no more because a date was all there was.
--
-- This table is the missing half: one row per suspension, holding the reason, the
-- intended length, who imposed it and who lifted it.
--
-- banned_until stays the source of truth for whether sign-in is blocked — GoTrue
-- reads it and nothing else does — so ends_at here is deliberately a second copy.
-- It records what the moderator chose, which stays worth knowing after a ban is
-- lifted early and banned_until has been reset to the past.
--
-- Append-only, and never rewritten in place: re-suspending an account adds a row
-- rather than editing the last one, so a repeat offender's history survives. The
-- current state of an account is its most recent row.
--
-- Written only by the admin-manage-user Edge Function under the service role.
-- There is no insert, update or delete policy here on purpose: the service role
-- bypasses RLS, and routing every write through that function is what guarantees
-- a suspension cannot be recorded without a reason, or against staff, or against
-- the caller's own account.

create table if not exists public.account_suspensions (
  id uuid primary key default gen_random_uuid(),

  -- profiles rather than auth.users, matching listings.seller_id and
  -- orders.buyer_id: profiles is keyed 1:1 to auth.users, and PostgREST can only
  -- embed a name if the foreign key points at the table holding one. Cascades,
  -- because a deleted account has no history left to explain.
  user_id uuid not null references public.profiles(id) on delete cascade,

  -- Required, and bounded so the panel that renders it cannot be flooded. The
  -- trim() in the check stops a reason of pure whitespace passing for one.
  reason text not null check (char_length(trim(reason)) between 3 and 500),

  -- null means indefinite. The alternative — a date a century out — would render
  -- as "Suspended until 12 Aug 2126", which reads like a bug rather than intent.
  ends_at timestamptz,

  created_at timestamptz not null default now(),

  -- set null, not cascade: a moderator leaving the company must not erase the
  -- record of the suspensions they imposed.
  created_by uuid references public.profiles(id) on delete set null,

  -- Stamped when access is restored by hand. A ban left to expire on its own
  -- keeps lifted_at null and simply falls out of date, which is why the interface
  -- compares ends_at to now() instead of treating null as "still active".
  lifted_at timestamptz,
  lifted_by uuid references public.profiles(id) on delete set null
);

-- The only read pattern: this user's suspensions, newest first.
create index if not exists account_suspensions_user_idx
  on public.account_suspensions (user_id, created_at desc);

alter table public.account_suspensions enable row level security;

-- Staff only: who imposed a suspension, when, and an account's earlier ones are
-- nobody else's business. The member themselves is shown the reason and end date
-- of the suspension in force when they try to sign in, but through
-- public.suspension_notice() in 20260812000500 — which hands out those two fields
-- and nothing else — rather than by reading this table.
drop policy if exists account_suspensions_select_admin on public.account_suspensions;
create policy account_suspensions_select_admin
  on public.account_suspensions for select to authenticated
  using ((select public.is_admin()));
