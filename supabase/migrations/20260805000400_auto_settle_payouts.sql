-- =============================================================================
-- AUTO-SETTLED PAYOUTS (TEST-MODE SIMULATION)
-- =============================================================================
-- Green Atelier does not hold seller funds: the seller's 85% is settled the
-- moment the buyer's payment is confirmed.
--
-- READ THIS BEFORE TRUSTING A 'paid' ROW. No money moves. This project runs on
-- Stripe TEST MODE, where the buyer's payment is itself simulated and the
-- platform balance is always zero — there is nothing to transfer. Moving real
-- funds to a third party's bank needs Stripe Connect, which this project
-- deliberately does not implement.
--
-- So payouts.payout_provider = 'simulated' is the record of what actually
-- happened: a simulated settlement, marked paid for demonstration. Any code that
-- later performs real transfers must write 'stripe' or 'manual' instead, and
-- must not treat 'simulated' rows as money that left the platform.

-- =============================================================================
-- 1. Record HOW a payout was settled
-- =============================================================================
alter table public.payouts
  add column if not exists payout_provider text
    check (payout_provider is null or payout_provider in ('simulated', 'stripe', 'manual'));

comment on column public.payouts.payout_provider is
  'How the payout was settled. ''simulated'' means no money moved — test-mode demonstration only.';

-- =============================================================================
-- 2. Settle at payment time
-- =============================================================================
-- Only settles when the seller has a default payout account: paying out to
-- nowhere is meaningless even in simulation, and leaving the row 'pending' is
-- what tells the seller to add their bank details.

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

  -- The seller's share, settled immediately where there is an account to settle
  -- to. payouts_one_per_order_item keeps a replayed webhook from double-paying.
  insert into public.payouts (
    seller_id, order_item_id, payout_account_id, amount,
    status, payout_provider, paid_at
  )
  select
    oi.seller_id,
    oi.id,
    acct.id,
    oi.seller_payout,
    case when acct.id is null then 'pending'::public.payout_status
         else 'paid'::public.payout_status end,
    case when acct.id is null then null else 'simulated' end,
    case when acct.id is null then null else now() end
  from public.order_items oi
  left join lateral (
    select spa.id
      from public.seller_payout_accounts spa
     where spa.user_id = oi.seller_id and spa.is_default
     limit 1
  ) acct on true
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

-- =============================================================================
-- 3. Earnings are measured from payouts, not deliveries
-- =============================================================================
-- The old view summed seller_payout for order_items at status 'delivered' while
-- reading paid_out from the payouts table. Now that a payout is settled at
-- payment — long before delivery — those two halves disagreed, and
-- pending_earnings (delivered total minus paid total) went NEGATIVE.
--
-- The payouts table is now created exactly when a sale is paid for, so it is the
-- single correct source for all four figures. Column names and order are
-- unchanged, so CREATE OR REPLACE is valid here.

create or replace view public.seller_earnings_stats
with (security_invoker = true) as
select
  p.seller_id,
  coalesce(sum(p.amount), 0)                                        as total_earnings,
  coalesce(sum(p.amount) filter (where p.status = 'paid'), 0)       as paid_out,
  coalesce(sum(p.amount) filter (where p.status <> 'paid'), 0)      as pending_earnings,
  count(*)                                                          as items_sold
from public.payouts p
group by p.seller_id;

grant select on public.seller_earnings_stats to authenticated;

-- =============================================================================
-- 4. Settle the backfilled rows for sellers who already have an account
-- =============================================================================
-- Payouts created before this migration are 'pending'. Anything belonging to a
-- seller with bank details on file is settled now, so existing test orders show
-- the same behaviour as new ones.

update public.payouts p
   set status = 'paid',
       payout_provider = 'simulated',
       paid_at = coalesce(p.paid_at, now()),
       payout_account_id = coalesce(p.payout_account_id, acct.id)
  from (
    -- distinct on, not min(): Postgres has no min() aggregate for uuid. A
    -- partial-unique trigger already keeps one default per seller; ordering by
    -- created_at just makes the pick deterministic if that ever slipped.
    select distinct on (spa.user_id) spa.user_id, spa.id
      from public.seller_payout_accounts spa
     where spa.is_default
     order by spa.user_id, spa.created_at
  ) acct
 where acct.user_id = p.seller_id
   and p.status = 'pending';
