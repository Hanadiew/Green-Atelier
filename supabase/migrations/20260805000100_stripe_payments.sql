-- =============================================================================
-- STRIPE PAYMENTS (TEST MODE)
-- =============================================================================
-- Splits the existing single-shot place_order() into the two halves a real
-- payment flow needs:
--
--   create_pending_order()   prices the cart, writes the order as
--                            status='pending' / payment_status='pending', and
--                            RESERVES the listings. Nothing is sold yet.
--   finalize_paid_order()    called only from the verified Stripe webhook.
--                            Marks paid, moves the order to 'processing', turns
--                            reserved listings into 'sold', clears carts.
--   release_pending_order()  cancel / expiry / failure. Hands the listings back.
--
-- place_order() is kept and becomes a thin wrapper over the first two, so the
-- pricing rules (RM15 shipping, 5% buyer service fee, 15/85 split, promo
-- validation) exist in exactly ONE place and the old security properties —
-- server-side repricing, listing locks, no self-purchase — are preserved by
-- construction rather than duplicated.

-- =============================================================================
-- 1. COLUMNS
-- =============================================================================
-- payment_status already exists (public.payment_status: pending/paid/failed/
-- refunded) so it is not redefined here. 'cancelled' is not in that enum; a
-- buyer-abandoned checkout is recorded as order status 'cancelled' with
-- payment_status left 'pending', which is accurate — no payment was attempted.

alter table public.orders
  add column if not exists payment_provider text
    check (payment_provider is null or payment_provider in ('stripe', 'manual')),
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists paid_at timestamptz;

-- One Stripe session can only ever belong to one order. This is the database
-- half of webhook idempotency: a replayed event cannot fan out to a second row.
create unique index if not exists orders_stripe_checkout_session_id_key
  on public.orders (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index if not exists orders_stripe_payment_intent_id_idx
  on public.orders (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

create index if not exists orders_payment_status_idx on public.orders (payment_status);

-- Which pending order is holding a reserved listing, so releasing is targeted
-- rather than "every reserved row".
alter table public.listings
  add column if not exists reserved_order_id uuid
    references public.orders (id) on delete set null;

create index if not exists listings_reserved_order_id_idx
  on public.listings (reserved_order_id)
  where reserved_order_id is not null;

-- =============================================================================
-- 2. PAYMENT-CONTROLLED COLUMNS ARE NOT WRITABLE BY USERS
-- =============================================================================
-- orders_update_buyer lets a buyer update their own order while it is
-- 'processing' — which, without this guard, includes payment_status and the
-- Stripe identifiers. Only the service role (the webhook, where auth.uid() is
-- null) and admins may touch them.

create or replace function public.guard_order_payment_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if new.payment_status           is distinct from old.payment_status
     or new.paid_at               is distinct from old.paid_at
     or new.payment_provider      is distinct from old.payment_provider
     or new.stripe_checkout_session_id is distinct from old.stripe_checkout_session_id
     or new.stripe_payment_intent_id   is distinct from old.stripe_payment_intent_id
     or new.subtotal              is distinct from old.subtotal
     or new.shipping_fee          is distinct from old.shipping_fee
     or new.service_fee           is distinct from old.service_fee
     or new.discount              is distinct from old.discount
     or new.total                 is distinct from old.total then
    raise exception
      'Payment fields are set by Green Atelier''s payment processor and cannot be edited.';
  end if;

  return new;
end;
$$;

drop trigger if exists orders_guard_payment_fields on public.orders;
create trigger orders_guard_payment_fields
  before update on public.orders
  for each row execute function public.guard_order_payment_fields();

-- =============================================================================
-- 3. CREATE PENDING ORDER
-- =============================================================================
-- Everything place_order() used to do EXCEPT marking listings sold, clearing
-- carts and consuming the promo code. Those three are the irreversible parts and
-- they wait for money.

create or replace function public.create_pending_order(
  p_shipping_address_id uuid,
  p_payment_method text default null,
  p_promo_code text default null,
  p_payment_provider text default 'stripe'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_buyer    uuid := auth.uid();
  v_order    uuid;
  v_item     record;
  v_subtotal numeric(12,2) := 0;
  v_shipping numeric(12,2) := 15;    -- flat RM15, unchanged
  v_service  numeric(12,2) := 0;
  v_discount numeric(12,2) := 0;
  v_count    integer := 0;
  v_promo    text := nullif(trim(coalesce(p_promo_code, '')), '');
  v_valid    boolean;
  v_stale    record;
begin
  if v_buyer is null then
    raise exception 'You must be signed in to place an order.';
  end if;

  -- Backstop for a buyer who abandoned an earlier redirect without Stripe
  -- telling us (tab closed, webhook missed): their own stale reservation would
  -- otherwise block them from ever checking out again. Only orders past the
  -- 30-minute session lifetime are touched, so a checkout genuinely in progress
  -- in another tab is never pulled out from under itself. An immediate cancel is
  -- handled promptly instead by cancel_my_pending_order().
  for v_stale in
    select id from public.orders
     where buyer_id = v_buyer
       and status = 'pending'
       and payment_status = 'pending'
       and placed_at < now() - interval '30 minutes'
  loop
    perform public.release_pending_order(v_stale.id, 'pending');
  end loop;

  if p_payment_method is not null and p_payment_method not in ('card', 'fpx', 'ewallet') then
    raise exception 'Unsupported payment method: %', p_payment_method;
  end if;

  if p_payment_provider not in ('stripe', 'manual') then
    raise exception 'Unsupported payment provider: %', p_payment_provider;
  end if;

  if p_shipping_address_id is null or not exists (
    select 1 from public.addresses
     where id = p_shipping_address_id and user_id = v_buyer
  ) then
    raise exception 'A valid shipping address is required.';
  end if;

  -- Lock every listing in the cart before pricing it, so two buyers checking out
  -- the same one-of-a-kind item serialise here rather than racing.
  perform 1
    from public.listings l
    join public.cart_items c on c.listing_id = l.id
   where c.user_id = v_buyer
   for update of l;

  for v_item in
    select l.id, l.title, l.listing_price, l.seller_id, l.status
      from public.cart_items c
      join public.listings l on l.id = c.listing_id
     where c.user_id = v_buyer
     order by c.created_at
  loop
    -- 'reserved' lands here too: someone else is already paying for it.
    if v_item.status <> 'active' then
      raise exception 'Sorry — "%" is no longer available.', v_item.title;
    end if;
    if v_item.seller_id = v_buyer then
      raise exception 'You cannot buy your own listing "%".', v_item.title;
    end if;
    v_count := v_count + 1;
    v_subtotal := v_subtotal + v_item.listing_price;
  end loop;

  if v_count = 0 then
    raise exception 'Your bag is empty.';
  end if;

  if v_promo is not null then
    select valid, discount into v_valid, v_discount
      from public.validate_promo_code(v_promo, v_subtotal);
    if not coalesce(v_valid, false) then
      v_discount := 0;
      v_promo := null;
    end if;
  end if;

  v_service := round(v_subtotal * 0.05, 2);

  insert into public.orders (
    buyer_id, shipping_address_id, subtotal, shipping_fee,
    service_fee, discount, total, promo_code, payment_method,
    payment_status, status, payment_provider
  )
  values (
    v_buyer, p_shipping_address_id, v_subtotal, v_shipping,
    v_service, coalesce(v_discount, 0),
    v_subtotal + v_shipping + v_service - coalesce(v_discount, 0),
    v_promo, p_payment_method,
    'pending', 'pending', p_payment_provider
  )
  returning id into v_order;

  insert into public.order_items (
    order_id, listing_id, seller_id, title_snapshot, brand_snapshot,
    image_snapshot, price_paid, platform_fee, seller_payout, status
  )
  select
    v_order, l.id, l.seller_id, l.title, l.brand,
    nullif(l.images[1], ''), l.listing_price,
    round(l.listing_price * 0.15, 2),   -- 15% platform fee
    round(l.listing_price * 0.85, 2),   -- 85% seller payout
    'pending'
  from public.cart_items c
  join public.listings l on l.id = c.listing_id
  where c.user_id = v_buyer;

  -- Hold the stock. Not sold — no money has moved — but off the market.
  perform set_config('gafs.bypass_status_guard', 'on', true);

  update public.listings
     set status = 'reserved', reserved_order_id = v_order
   where id in (select listing_id from public.cart_items where user_id = v_buyer);

  return v_order;
end;
$$;

-- =============================================================================
-- 4. FINALIZE A PAID ORDER
-- =============================================================================
-- Service-role only: the Stripe webhook, after verifying the signature. Runs at
-- most once per order however many times Stripe delivers the event.

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
  v_buyer  uuid;
  v_promo  text;
begin
  -- Lock the order first: two concurrent deliveries of the same event both
  -- reach this line, and the second one finds payment_status already 'paid'.
  select id, buyer_id, promo_code, payment_status, status
    into v_order
    from public.orders
   where id = p_order_id
   for update;

  if not found then
    raise exception 'Order % not found.', p_order_id;
  end if;

  -- Idempotency: already settled, nothing more to do. Not an error — Stripe
  -- retries are normal and must be answered with a 200.
  if v_order.payment_status = 'paid' then
    return false;
  end if;

  v_buyer := v_order.buyer_id;
  v_promo := v_order.promo_code;

  update public.orders
     set payment_status = 'paid',
         paid_at = coalesce(paid_at, now()),
         status = 'processing',
         stripe_payment_intent_id =
           coalesce(p_payment_intent_id, stripe_payment_intent_id)
   where id = p_order_id;

  -- The order's own items become the seller's work queue.
  update public.order_items
     set status = 'processing'
   where order_id = p_order_id and status = 'pending';

  -- Reserved -> sold. Scoped to this order's reservations so a concurrent
  -- checkout's holds are untouched.
  perform set_config('gafs.bypass_status_guard', 'on', true);

  update public.listings
     set status = 'sold', reserved_order_id = null
   where reserved_order_id = p_order_id;

  if v_promo is not null then
    update public.promo_codes set times_used = times_used + 1 where code = v_promo;
  end if;

  -- The purchased items leave every cart, not just the buyer's.
  delete from public.cart_items
   where listing_id in (
     select listing_id from public.order_items
      where order_id = p_order_id and listing_id is not null
   );

  return true;
end;
$$;

-- =============================================================================
-- 5. RELEASE A PENDING ORDER
-- =============================================================================
-- Buyer cancelled, the session expired, or the payment failed. The listings go
-- back on sale. Never touches an order that has already been paid.

create or replace function public.release_pending_order(
  p_order_id uuid,
  p_payment_status public.payment_status default 'pending'
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status public.payment_status;
begin
  select payment_status into v_status
    from public.orders
   where id = p_order_id
   for update;

  if not found then
    return false;
  end if;

  -- A paid order is final. An out-of-order 'expired' event arriving after
  -- 'completed' must not unwind a real sale.
  if v_status = 'paid' then
    return false;
  end if;

  update public.orders
     set payment_status = p_payment_status,
         status = 'cancelled',
         cancelled_at = coalesce(cancelled_at, now())
   where id = p_order_id;

  update public.order_items
     set status = 'cancelled'
   where order_id = p_order_id and status = 'pending';

  perform set_config('gafs.bypass_status_guard', 'on', true);

  update public.listings
     set status = 'active', reserved_order_id = null
   where reserved_order_id = p_order_id and status = 'reserved';

  return true;
end;
$$;

-- =============================================================================
-- 5b. BUYER-INITIATED CANCEL
-- =============================================================================
-- Stripe's cancel_url lands here. Releases the hold straight away so the buyer
-- can retry immediately instead of waiting out the session expiry. Deliberately
-- narrow: your own order, still unpaid, nothing else.

create or replace function public.cancel_my_pending_order(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.orders
     where id = p_order_id
       and buyer_id = auth.uid()
       and status = 'pending'
       and payment_status = 'pending'
  ) then
    return false;
  end if;

  return public.release_pending_order(p_order_id, 'pending');
end;
$$;

-- =============================================================================
-- 6. place_order() — now a wrapper
-- =============================================================================
-- Kept so nothing that already calls it breaks. Same signature, same return, and
-- the same end state as before (order 'processing', listings 'sold', carts
-- cleared) — it just reaches it through the two halves above instead of its own
-- copy of the pricing logic. Used for the no-payment-provider path only.

create or replace function public.place_order(
  p_shipping_address_id uuid,
  p_payment_method text default null,
  p_promo_code text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order uuid;
begin
  v_order := public.create_pending_order(
    p_shipping_address_id, p_payment_method, p_promo_code, 'manual'
  );
  perform public.finalize_paid_order(v_order, null);
  return v_order;
end;
$$;

-- =============================================================================
-- 7. GRANTS
-- =============================================================================
-- create_pending_order runs as the buyer (it reads auth.uid()).
-- finalize/release are NOT granted to authenticated: only the service role,
-- which bypasses grants, may settle a payment.

grant execute on function
  public.create_pending_order(uuid, text, text, text) to authenticated;
grant execute on function
  public.cancel_my_pending_order(uuid) to authenticated;

revoke all on function
  public.finalize_paid_order(uuid, text) from anon, authenticated;
revoke all on function
  public.release_pending_order(uuid, public.payment_status) from anon, authenticated;

-- =============================================================================
-- 8. SELLERS DO NOT SEE UNPAID ORDERS
-- =============================================================================
-- A pending order is not a sale. is_order_seller() drives the seller's view of
-- both orders and order_items, so unpaid rows are filtered at the source.

create or replace function public.is_order_seller(p_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.order_items oi
      join public.orders o on o.id = oi.order_id
     where oi.order_id = p_order_id
       and oi.seller_id = auth.uid()
       and o.payment_status <> 'pending'
  );
$$;

-- order_items_select_parties matches sellers on order_items.seller_id directly,
-- so it needs its own gate — otherwise a seller would watch unpaid reservations
-- appear and disappear in their sales list. security definer, so reading orders
-- here cannot recurse back into this policy.
create or replace function public.order_awaiting_payment(p_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.orders
     where id = p_order_id and payment_status = 'pending'
  );
$$;

grant execute on function public.order_awaiting_payment(uuid) to authenticated;

drop policy if exists order_items_select_parties on public.order_items;
create policy order_items_select_parties on public.order_items
  for select to authenticated using (
    (seller_id = (select auth.uid()) and not public.order_awaiting_payment(order_id))
    or public.is_order_buyer(order_id)
    or (select public.is_admin())
  );

-- Same gate on the seller's update path: a seller must not be able to move an
-- unpaid item to 'shipped'.
drop policy if exists order_items_update_seller on public.order_items;
create policy order_items_update_seller on public.order_items
  for update to authenticated
  using (
    (seller_id = (select auth.uid()) and not public.order_awaiting_payment(order_id))
    or (select public.is_admin())
  )
  with check (
    seller_id = (select auth.uid())
    or (select public.is_admin())
  );
