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
