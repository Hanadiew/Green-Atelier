-- =============================================================================
-- Fix: infinite recursion between the orders and order_items policies
--
-- orders_select_parties asked "is there an order_item of this order that I sell?"
-- and order_items_select_parties asked "is the parent order mine?". Each policy
-- triggered the other, so Postgres rejected every read of either table with
--   42P17: infinite recursion detected in policy for relation "orders"
--
-- The membership checks now live in SECURITY DEFINER functions. Those run as the
-- function owner, which is not subject to RLS, so the cycle is broken. Each one
-- only ever returns a boolean about the caller's own relationship to an order,
-- so no data is exposed that the policies did not already intend to allow.
-- =============================================================================

create or replace function public.is_order_buyer(p_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.orders o
    where o.id = p_order_id and o.buyer_id = auth.uid()
  );
$$;

create or replace function public.is_order_seller(p_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.order_items oi
    where oi.order_id = p_order_id and oi.seller_id = auth.uid()
  );
$$;

grant execute on function public.is_order_buyer(uuid) to authenticated;
grant execute on function public.is_order_seller(uuid) to authenticated;

-- Buyers match on their own column; sellers go through the helper.
drop policy if exists orders_select_parties on public.orders;
create policy orders_select_parties on public.orders
  for select to authenticated using (
    buyer_id = auth.uid()
    or public.is_order_seller(id)
    or public.is_admin()
  );

-- Sellers match on their own column; buyers go through the helper.
drop policy if exists order_items_select_parties on public.order_items;
create policy order_items_select_parties on public.order_items
  for select to authenticated using (
    seller_id = auth.uid()
    or public.is_order_buyer(order_id)
    or public.is_admin()
  );
