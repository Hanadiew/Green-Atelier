-- =============================================================================
-- Seller Sales Orders — status updates + address visibility
--
-- order_items already has seller_id and a status column typed as
-- public.order_status (processing/shipped/delivered/cancelled), so no new
-- table is needed. This migration:
--   1. Adds updated_at to order_items.
--   2. Lets a seller update the status of their own order_items, restricted to
--      the status column and to valid transitions only.
--   3. Lets a seller read the shipping address attached to an order that
--      contains one of their items (needed for the order details view).
-- Idempotent: safe to re-run.
-- =============================================================================

-- =============================================================================
-- 1. updated_at column
-- =============================================================================

alter table public.order_items add column if not exists updated_at timestamptz not null default now();

drop trigger if exists order_items_set_updated_at on public.order_items;
create trigger order_items_set_updated_at
  before update on public.order_items
  for each row execute function public.set_updated_at();

-- =============================================================================
-- 2. Status transition guard
-- =============================================================================
-- Allowed flow:
--   processing -> shipped -> delivered
--   processing -> cancelled
-- delivered and cancelled are terminal. Only the seller who owns the item may
-- change it, and only the status column — every other field is reset to its
-- previous value so a seller cannot rewrite price/snapshot data through this
-- policy.

create or replace function public.guard_order_item_status_transition()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- service_role / SQL editor work (auth.uid() is null) and admins bypass the guard.
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if new.seller_id <> auth.uid() then
    raise exception 'Only the seller of this item can update its status.';
  end if;

  -- Lock every column except status to its previous value.
  new.order_id        := old.order_id;
  new.listing_id       := old.listing_id;
  new.seller_id         := old.seller_id;
  new.title_snapshot     := old.title_snapshot;
  new.brand_snapshot       := old.brand_snapshot;
  new.image_snapshot        := old.image_snapshot;
  new.price_paid              := old.price_paid;
  new.platform_fee              := old.platform_fee;
  new.seller_payout               := old.seller_payout;
  new.created_at                    := old.created_at;

  if new.status is distinct from old.status then
    if old.status in ('delivered', 'cancelled') then
      raise exception 'This order item is % and can no longer be updated.', old.status;
    end if;

    if not (
      (old.status = 'processing' and new.status in ('shipped', 'cancelled'))
      or (old.status = 'shipped' and new.status = 'delivered')
    ) then
      raise exception 'Invalid status transition from % to %.', old.status, new.status;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists order_items_guard_status_transition on public.order_items;
create trigger order_items_guard_status_transition
  before update on public.order_items
  for each row execute function public.guard_order_item_status_transition();

-- =============================================================================
-- 3. RLS: seller can update their own order_items
-- =============================================================================

drop policy if exists order_items_update_seller on public.order_items;
create policy order_items_update_seller on public.order_items
  for update to authenticated
  using (seller_id = (select auth.uid()) or (select public.is_admin()))
  with check (seller_id = (select auth.uid()) or (select public.is_admin()));

grant update on public.order_items to authenticated;

-- =============================================================================
-- 4. RLS: seller can read the shipping address for their own sales
-- =============================================================================
-- addresses_own only lets a user see their own addresses. A seller viewing an
-- order they sold into needs to see the buyer's shipping address too, but
-- nothing else about the buyer's saved addresses.

drop policy if exists addresses_select_for_seller_orders on public.addresses;
create policy addresses_select_for_seller_orders on public.addresses
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      join public.order_items oi on oi.order_id = o.id
      where o.shipping_address_id = addresses.id
        and oi.seller_id = (select auth.uid())
    )
  );