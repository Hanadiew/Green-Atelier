-- =============================================================================
-- FLAT RM20 BUYER SERVICE FEE
-- =============================================================================
-- The service fee was 5% of the subtotal, which on a RM7,100 bag came to RM355 —
-- a handling fee that scales with the item price reads as a penalty on expensive
-- listings, and resale baskets skew expensive.
--
-- It is now a flat RM20 per order, like the RM15 shipping fee beside it.
--
-- The seller side is deliberately unchanged: the 15% platform commission and 85%
-- payout on order_items stay exactly as they were. This migration only touches
-- what the BUYER is charged on top of the item.

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
  v_shipping numeric(12,2) := 15;   -- flat, unchanged
  v_service  numeric(12,2) := 20;   -- flat per order, was round(subtotal * 0.05, 2)
  v_discount numeric(12,2) := 0;
  v_count    integer := 0;
  v_promo    text := nullif(trim(coalesce(p_promo_code, '')), '');
  v_valid    boolean;
  v_stale    record;
begin
  if v_buyer is null then
    raise exception 'You must be signed in to place an order.';
  end if;

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

  perform 1
    from public.listings l
    join public.cart_items c on c.listing_id = l.id
   where c.user_id = v_buyer
   for update of l;

  -- effective_price honours an accepted offer; see 20260805000700.
  for v_item in
    select
      l.id,
      l.title,
      l.seller_id,
      l.status,
      coalesce(
        (select o.offer_amount
           from public.offers o
          where o.listing_id = l.id
            and o.buyer_id = v_buyer
            and o.status = 'accepted'
            and o.expires_at > now()
          order by o.created_at desc
          limit 1),
        l.listing_price
      ) as effective_price
      from public.cart_items c
      join public.listings l on l.id = c.listing_id
     where c.user_id = v_buyer
     order by c.created_at
  loop
    if v_item.status <> 'active' then
      raise exception 'Sorry — "%" is no longer available.', v_item.title;
    end if;
    if v_item.seller_id = v_buyer then
      raise exception 'You cannot buy your own listing "%".', v_item.title;
    end if;
    v_count := v_count + 1;
    v_subtotal := v_subtotal + v_item.effective_price;
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
    nullif(l.images[1], ''),
    agreed.price,
    round(agreed.price * 0.15, 2),   -- 15% platform commission, unchanged
    round(agreed.price * 0.85, 2),   -- 85% seller payout, unchanged
    'pending'
  from public.cart_items c
  join public.listings l on l.id = c.listing_id
  cross join lateral (
    select coalesce(
      (select o.offer_amount
         from public.offers o
        where o.listing_id = l.id
          and o.buyer_id = v_buyer
          and o.status = 'accepted'
          and o.expires_at > now()
        order by o.created_at desc
        limit 1),
      l.listing_price
    ) as price
  ) agreed
  where c.user_id = v_buyer;

  perform set_config('gafs.bypass_status_guard', 'on', true);

  update public.listings
     set status = 'reserved', reserved_order_id = v_order
   where id in (select listing_id from public.cart_items where user_id = v_buyer);

  return v_order;
end;
$$;

revoke all on function public.create_pending_order(uuid, text, text, text)
  from public, anon;
grant execute on function public.create_pending_order(uuid, text, text, text)
  to authenticated;
