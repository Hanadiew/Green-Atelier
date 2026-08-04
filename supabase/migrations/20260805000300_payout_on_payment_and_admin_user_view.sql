-- =============================================================================
-- PAYOUT AT PAYMENT TIME + FULL USER DETAIL FOR STAFF
-- =============================================================================

-- =============================================================================
-- 1. A seller's payout becomes due when the buyer pays, not on delivery
-- =============================================================================
-- 20260730091200 created the payout row when an order_item reached 'delivered'.
-- Green Atelier does not want to sit on seller money, so the row is now created
-- the moment the Stripe webhook confirms payment — the same transaction that
-- marks the order paid.
--
-- IMPORTANT, and unchanged from the original design: this records what is OWED.
-- It does not move money. The row is created 'pending' and only an external
-- payout provider may set it to 'paid' (see src/lib/payouts.js). Nothing here
-- fabricates a bank transfer, because nothing here can perform one — there is no
-- Stripe Connect in this project by design.

create or replace function public.finalize_paid_order(
  p_order_id uuid,
  p_payment_intent_id text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order  record;
  v_promo  text;
begin
  select id, buyer_id, promo_code, payment_status, status
    into v_order
    from public.orders
   where id = p_order_id
   for update;

  if not found then
    raise exception 'Order % not found.', p_order_id;
  end if;

  if v_order.payment_status = 'paid' then
    return false;
  end if;

  v_promo := v_order.promo_code;

  update public.orders
     set payment_status = 'paid',
         paid_at = coalesce(paid_at, now()),
         status = 'processing',
         stripe_payment_intent_id =
           coalesce(p_payment_intent_id, stripe_payment_intent_id)
   where id = p_order_id;

  update public.order_items
     set status = 'processing'
   where order_id = p_order_id and status = 'pending';

  perform set_config('gafs.bypass_status_guard', 'on', true);

  update public.listings
     set status = 'sold', reserved_order_id = null
   where reserved_order_id = p_order_id;

  -- The seller's 85% is owed from this moment. payouts_one_per_order_item makes
  -- the insert idempotent, so a replayed webhook cannot double-pay: the earlier
  -- payment_status guard already returns before reaching here, and this is a
  -- second line of defence.
  insert into public.payouts (seller_id, order_item_id, payout_account_id, amount, status)
  select
    oi.seller_id,
    oi.id,
    (select spa.id
       from public.seller_payout_accounts spa
      where spa.user_id = oi.seller_id and spa.is_default
      limit 1),
    oi.seller_payout,
    'pending'
  from public.order_items oi
  where oi.order_id = p_order_id
  on conflict (order_item_id) do nothing;

  if v_promo is not null then
    update public.promo_codes set times_used = times_used + 1 where code = v_promo;
  end if;

  delete from public.cart_items
   where listing_id in (
     select listing_id from public.order_items
      where order_id = p_order_id and listing_id is not null
   );

  return true;
end;
$$;

revoke all on function public.finalize_paid_order(uuid, text)
  from public, anon, authenticated;

-- The delivery trigger is now a second, later path to the same row. Dropping it
-- leaves exactly one place payouts are created, so the two can never disagree
-- about the amount.
drop trigger if exists order_items_create_payout on public.order_items;
drop function if exists public.create_payout_on_delivery();

-- Backfill: orders already paid before this change have no payout row.
insert into public.payouts (seller_id, order_item_id, payout_account_id, amount, status)
select
  oi.seller_id,
  oi.id,
  (select spa.id
     from public.seller_payout_accounts spa
    where spa.user_id = oi.seller_id and spa.is_default
    limit 1),
  oi.seller_payout,
  'pending'
from public.order_items oi
join public.orders o on o.id = oi.order_id
where o.payment_status = 'paid'
on conflict (order_item_id) do nothing;

-- =============================================================================
-- 2. Staff can read a user's addresses
-- =============================================================================
-- addresses_own was owner-only, so the admin user-detail page could not show a
-- shipping address at all. Read-only for staff: writing someone else's address
-- is still theirs alone.

drop policy if exists addresses_own on public.addresses;
create policy addresses_own on public.addresses
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists addresses_select_admin on public.addresses;
create policy addresses_select_admin on public.addresses
  for select to authenticated
  using ((select public.is_admin()));

-- =============================================================================
-- 3. admin_users gains the remaining profile fields
-- =============================================================================
-- phone and bio were on profiles but missing from the view, so the detail page
-- had no way to show them without a second query.
--
-- Dropped and recreated rather than CREATE OR REPLACE: replace can only append
-- columns, and these belong next to the other profile fields. Nothing depends on
-- this view, so the drop is safe — but the grants below are not optional, since
-- dropping takes them with it.

drop view if exists public.admin_users;

create view public.admin_users
with (security_invoker = false) as
select
  p.id,
  p.username,
  p.full_name,
  p.first_name,
  p.last_name,
  p.avatar_url,
  p.bio,
  p.phone,
  u.email,
  u.last_sign_in_at,
  u.email_confirmed_at,
  u.banned_until,
  p.city,
  p.state,
  p.country,
  p.is_trusted_seller,
  p.created_at,
  p.updated_at
from public.profiles p
join auth.users u on u.id = p.id
where (select public.is_admin());

revoke all on public.admin_users from anon;
grant select on public.admin_users to authenticated;
