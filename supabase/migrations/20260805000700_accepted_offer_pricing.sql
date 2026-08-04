-- =============================================================================
-- CHECKOUT HONOURS AN ACCEPTED OFFER
-- =============================================================================
-- A seller who accepts an offer has agreed a price, so that is what the buyer
-- pays. The lookup lives inside create_pending_order() — the same function that
-- already prices everything else — so there is still exactly ONE place a total is
-- computed and the browser still cannot influence it.
--
-- =============================================================================
-- 1. FIRST, CLOSE THE HOLE THIS WOULD OTHERWISE OPEN
-- =============================================================================
-- offers_update_parties permits an update by the buyer OR the seller, and RLS
-- cannot restrict individual columns. Verified against the live database: a buyer
-- could set their own offer to 'accepted'.
--
-- On its own that was cosmetic. The moment an accepted offer decides the price it
-- becomes critical: offer RM1 on a RM7,800 bag, self-accept, check out for RM1.
--
-- So who may change what is enforced here, in a column guard:
--   seller — may accept or decline; may never touch the amount
--   buyer  — may propose and withdraw; may never accept; amount frozen once the
--            offer stops being 'pending'
--   nobody — may repoint an offer at a different listing or buyer

create or replace function public.guard_offer_transition()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid       uuid := auth.uid();
  v_is_buyer  boolean;
  v_is_seller boolean;
begin
  -- Service role and staff are unrestricted, as elsewhere.
  if v_uid is null or public.is_admin() then
    return new;
  end if;

  -- An offer's identity is fixed for everyone.
  new.listing_id := old.listing_id;
  new.buyer_id := old.buyer_id;

  v_is_buyer := old.buyer_id = v_uid;

  select exists (
    select 1 from public.listings l
     where l.id = old.listing_id and l.seller_id = v_uid
  ) into v_is_seller;

  -- Seller checked first: they own the decision, never the price.
  if v_is_seller then
    new.offer_amount := old.offer_amount;
    new.message := old.message;

    if new.status is distinct from old.status
       and new.status not in ('accepted', 'declined') then
      raise exception 'A seller can only accept or decline an offer.';
    end if;

    return new;
  end if;

  if v_is_buyer then
    if new.status is distinct from old.status and new.status <> 'withdrawn' then
      raise exception 'Only the seller can accept or decline an offer.';
    end if;

    -- Once it is out of 'pending' the figure is settled; re-pricing an accepted
    -- offer would be re-pricing the sale.
    if old.status <> 'pending'
       and new.offer_amount is distinct from old.offer_amount then
      raise exception 'This offer has already been answered and cannot be changed.';
    end if;

    return new;
  end if;

  raise exception 'You are not a party to this offer.';
end;
$$;

drop trigger if exists offers_guard_transition on public.offers;
create trigger offers_guard_transition
  before update on public.offers
  for each row execute function public.guard_offer_transition();

-- =============================================================================
-- 2. PRICE THE ORDER FROM THE ACCEPTED OFFER
-- =============================================================================

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
  v_shipping numeric(12,2) := 15;
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

  -- effective_price is the agreed price: the buyer's accepted offer if there is a
  -- live one, otherwise the listing price. Read from the database, never sent by
  -- the browser. Only 'accepted' counts, and only from THIS buyer, and only while
  -- unexpired — an accepted offer that lapsed is not a standing discount.
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

  -- price_paid is the agreed price, and the 15/85 split is taken from it — so a
  -- seller who discounts absorbs their own discount rather than the platform
  -- silently eating it.
  insert into public.order_items (
    order_id, listing_id, seller_id, title_snapshot, brand_snapshot,
    image_snapshot, price_paid, platform_fee, seller_payout, status
  )
  select
    v_order, l.id, l.seller_id, l.title, l.brand,
    nullif(l.images[1], ''),
    agreed.price,
    round(agreed.price * 0.15, 2),
    round(agreed.price * 0.85, 2),
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

-- =============================================================================
-- 3. A read-only helper so the cart can show the price it will charge
-- =============================================================================
-- Same rule as above, exposed for display. Without it the bag would show the
-- listing price while the server charged the offer price.

create or replace function public.my_agreed_prices()
returns table (listing_id uuid, agreed_price numeric)
language sql
stable
security definer
set search_path = ''
as $$
  select o.listing_id, o.offer_amount
    from public.offers o
   where o.buyer_id = auth.uid()
     and o.status = 'accepted'
     and o.expires_at > now();
$$;

revoke all on function public.my_agreed_prices() from public, anon;
grant execute on function public.my_agreed_prices() to authenticated;
