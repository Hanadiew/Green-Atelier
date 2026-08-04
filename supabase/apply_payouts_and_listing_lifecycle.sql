-- =============================================================================
-- Green Atelier — payouts + seller listing lifecycle, ready to paste into the
-- Supabase SQL editor (Dashboard -> SQL Editor -> New query -> Run).
--
-- Why this file exists: the live database has 20260730091300 and 091400
-- applied (via apply_admin_schema.sql) but NOT 091100 or 091200, so
-- public.seller_payout_accounts and public.payouts were never created. That is
-- what "Could not find the table 'public.seller_payout_accounts' in the schema
-- cache" on Account -> Payout Information means.
--
-- Contents, unchanged and in order:
--   20260730091100_seller_payout_accounts.sql
--   20260730091200_payouts.sql
--   20260804000000_seller_listing_lifecycle.sql
--
-- All three are idempotent, so running this more than once is safe and a later
-- `supabase db push` will re-run them harmlessly.
-- =============================================================================




-- ############ 20260730091100_seller_payout_accounts.sql ############
-- =============================================================================
-- Seller Payout Accounts — bank details a seller registers to receive earnings
--
-- Private table, same shape as `addresses`: one default per user, enforced by
-- a partial unique index + a trigger that clears the previous default rather
-- than fighting the index. No public read policy anywhere — buyers, product
-- pages and other sellers must never see this data.
--
-- Green Atelier never stores or moves money itself. This table only records
-- where a legitimate payout provider should send a seller's earnings; the
-- actual transfer is handled by `payouts` + a payout service (see the next
-- migration and src/lib/payouts.js).
--
-- Idempotent: safe to re-run.
-- =============================================================================

create table if not exists public.seller_payout_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,

  bank_name text not null check (length(trim(bank_name)) > 0),
  account_holder_name text not null check (length(trim(account_holder_name)) > 0),
  account_number text not null check (length(trim(account_number)) > 0),

  is_default boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists seller_payout_accounts_user_id_idx
  on public.seller_payout_accounts (user_id);

-- At most one default payout account per seller, mirroring addresses_one_default_per_user.
create unique index if not exists seller_payout_accounts_one_default_per_user
  on public.seller_payout_accounts (user_id)
  where is_default;

create or replace function public.clear_other_default_payout_accounts()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_default then
    update public.seller_payout_accounts
       set is_default = false
     where user_id = new.user_id
       and id <> new.id
       and is_default;
  end if;
  return new;
end;
$$;

drop trigger if exists seller_payout_accounts_single_default on public.seller_payout_accounts;
create trigger seller_payout_accounts_single_default
  before insert or update of is_default on public.seller_payout_accounts
  for each row when (new.is_default) execute function public.clear_other_default_payout_accounts();

drop trigger if exists seller_payout_accounts_set_updated_at on public.seller_payout_accounts;
create trigger seller_payout_accounts_set_updated_at
  before update on public.seller_payout_accounts
  for each row execute function public.set_updated_at();

-- =============================================================================
-- RLS — owner-only, no public select policy at all.
-- =============================================================================

alter table public.seller_payout_accounts enable row level security;

drop policy if exists seller_payout_accounts_own on public.seller_payout_accounts;
create policy seller_payout_accounts_own on public.seller_payout_accounts
  for all to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()))
  with check (user_id = (select auth.uid()) or (select public.is_admin()));

-- =============================================================================
-- GRANTS
-- =============================================================================

grant select, insert, update, delete on public.seller_payout_accounts to authenticated;


-- ############ 20260730091200_payouts.sql ############
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


-- ############ 20260804000000_seller_listing_lifecycle.sql ############
-- =============================================================================
-- SELLER LISTING LIFECYCLE
-- =============================================================================
-- A seller's only controls over a listing are "edit" and "remove". They must
-- never be able to move it between statuses — publishing is Green Atelier's
-- decision, and 'sold' is reached only through place_order().
--
-- Before this migration a seller could set 'archived', and Profile.vue used
-- that as a soft delete for active listings. Archiving turned out to be a dead
-- end: an archived listing is invisible to buyers (listings_select_active),
-- has no path back to review, and gave the admin portal nothing to approve or
-- reject. Removing the state from the seller's reach is simpler than teaching
-- every screen to handle it.

-- 1. Sellers can no longer change status at all, with one exception: sending a
--    draft or a corrected rejection back for review.
create or replace function public.guard_listing_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null
     or coalesce(current_setting('gafs.bypass_status_guard', true), '') = 'on'
     or public.is_admin() then
    return new;
  end if;

  if new.status is distinct from old.status
     and not (old.status in ('draft', 'rejected') and new.status = 'pending_review') then
    raise exception
      'A listing''s status is set by Green Atelier review. Edit or remove the listing instead.';
  end if;

  return new;
end;
$$;

-- 2. "Remove" now means remove. Previously a seller could only delete a
--    draft/pending/rejected/archived listing, which is why removing an active
--    one had to archive it instead. Sold listings remain undeletable because
--    they are order history.
drop policy if exists listings_delete_own on public.listings;
create policy listings_delete_own on public.listings
  for delete to authenticated
  using (
    (seller_id = (select auth.uid()) and status <> 'sold')
    or (select public.is_admin())
  );

-- 3. One-time repair. Every listing currently sitting in 'archived' got there
--    through the old soft-delete path, not through a review decision — seed.sql
--    inserts its catalogue as 'active'. Put them back so the shop has stock.
--    auth.uid() is null here, so the guard above lets this through.
update public.listings
   set status = 'active'
 where status = 'archived';
