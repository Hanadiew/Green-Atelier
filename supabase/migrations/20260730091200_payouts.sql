-- =============================================================================
-- Payouts — records of money owed/sent to a seller for a completed sale
--
-- This table tracks payout STATUS only. Green Atelier does not hold seller
-- funds and does not perform the transfer itself — a payout starts life as
-- 'pending' and only ever becomes 'paid' once an external payout provider
-- confirms the transfer (see src/lib/payouts.js: processSellerPayout()).
-- Nothing in this schema fabricates a successful bank transfer.
--
-- A payout row is created automatically the moment an order_item transitions
-- to 'delivered' — that status already means "this sale is complete" in the
-- existing order_items_guard_status_transition state machine, so no new
-- vocabulary is introduced. If the seller has no default payout account yet,
-- no row is created (the seller is prompted separately; see the app-side
-- publish-gate on new listings).
--
-- Idempotent: safe to re-run.
-- =============================================================================

do $$ begin
  create type public.payout_status as enum ('pending', 'processing', 'paid', 'failed');
exception when duplicate_object then null; end $$;

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),

  seller_id uuid not null references public.profiles (id) on delete cascade,
  order_item_id uuid not null references public.order_items (id) on delete cascade,
  payout_account_id uuid references public.seller_payout_accounts (id) on delete set null,

  -- Snapshot of order_items.seller_payout at creation time, so a later change
  -- to the payout account or order row can't silently alter what's owed.
  amount numeric(12, 2) not null check (amount >= 0),

  status public.payout_status not null default 'pending',

  created_at timestamptz not null default now(),
  paid_at timestamptz
);

-- One payout per sold item — the delivery trigger below relies on this to
-- avoid creating duplicates if it ever fires more than once.
create unique index if not exists payouts_one_per_order_item
  on public.payouts (order_item_id);

create index if not exists payouts_seller_id_idx on public.payouts (seller_id);
create index if not exists payouts_status_idx on public.payouts (status);

-- Stamp paid_at whenever a payout transitions into 'paid'.
create or replace function public.stamp_payout_paid_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'paid' and (old.status is distinct from 'paid') then
    new.paid_at := coalesce(new.paid_at, now());
  end if;
  return new;
end;
$$;

drop trigger if exists payouts_stamp_paid_at on public.payouts;
create trigger payouts_stamp_paid_at
  before update of status on public.payouts
  for each row execute function public.stamp_payout_paid_at();

-- =============================================================================
-- AUTO-CREATE a pending payout when an order_item becomes 'delivered'
-- =============================================================================
-- security definer because the row is written on behalf of the seller by the
-- system, not by an authenticated insert the seller performs themselves —
-- there is intentionally no insert policy for authenticated users below.

create or replace function public.create_payout_on_delivery()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_account_id uuid;
begin
  if new.status = 'delivered' and (old.status is distinct from 'delivered') then
    select id into v_account_id
      from public.seller_payout_accounts
     where user_id = new.seller_id and is_default
     limit 1;

    insert into public.payouts (seller_id, order_item_id, payout_account_id, amount, status)
    values (new.seller_id, new.id, v_account_id, new.seller_payout, 'pending')
    on conflict (order_item_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists order_items_create_payout on public.order_items;
create trigger order_items_create_payout
  after update of status on public.order_items
  for each row execute function public.create_payout_on_delivery();

-- =============================================================================
-- RLS
-- =============================================================================
-- Sellers can read their own payouts. No insert/update/delete policy for
-- authenticated: payouts are created by the trigger above and progressed to
-- 'processing'/'paid'/'failed' only by the payout service using the
-- service_role key (or by an admin), never directly by the seller.

alter table public.payouts enable row level security;

drop policy if exists payouts_select_own on public.payouts;
create policy payouts_select_own on public.payouts
  for select to authenticated
  using (seller_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists payouts_admin_write on public.payouts;
create policy payouts_admin_write on public.payouts
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.payouts to authenticated;
grant select, insert, update on public.payouts to authenticated;

-- =============================================================================
-- SELLER EARNINGS VIEW
-- =============================================================================
-- total_earnings: value of every completed (delivered) sale, regardless of
--   whether a payout row exists yet.
-- paid_out: sum of payouts actually confirmed 'paid' by the payout provider.
-- pending_earnings: the remainder — earned but not yet paid out. Computed as
--   a subtraction rather than "sum of pending/processing payouts" so a seller
--   who completes a sale before adding a bank account (and therefore has no
--   payout row at all) still sees it reflected as pending, not missing.
--
-- security_invoker so the caller's own RLS on order_items/payouts applies —
-- a seller only ever sees rows scoped to seller_id = their own id anyway via
-- the underlying table policies, but this keeps the view honest either way.

create or replace view public.seller_earnings_stats
with (security_invoker = true) as
select
  oi.seller_id,
  coalesce(sum(oi.seller_payout) filter (where oi.status = 'delivered'), 0) as total_earnings,
  coalesce(sum(p.amount) filter (where p.status = 'paid'), 0) as paid_out,
  coalesce(sum(oi.seller_payout) filter (where oi.status = 'delivered'), 0)
    - coalesce(sum(p.amount) filter (where p.status = 'paid'), 0) as pending_earnings,
  count(oi.id) filter (where oi.status = 'delivered') as items_sold
from public.order_items oi
left join public.payouts p on p.order_item_id = oi.id
group by oi.seller_id;

grant select on public.seller_earnings_stats to authenticated;
