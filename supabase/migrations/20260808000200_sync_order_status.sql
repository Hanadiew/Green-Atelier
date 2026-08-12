-- =============================================================================
-- KEEP orders.status AND order_items.status IN STEP
-- =============================================================================
-- Fulfilment was being written to two places by two different people:
--
--   seller  ->  order_items.status   (Sales Orders page)
--   admin   ->  orders.status        (admin order detail)
--
-- and the buyer's Orders tab reads order_items.status. So a seller's change
-- showed up for the buyer and an admin's change did not — the admin appeared to
-- do nothing. The same split silently broke the review policy, which gated on
-- orders.status while the interface offered reviews on delivered items.
--
-- Rather than pick a winner and rewrite every reader, the two are reconciled
-- here: order_items.status stays the source of truth for fulfilment, because
-- that is the level delivery actually happens at, and orders.status is derived
-- from it. Admin writes to the items (see admin.updateOrderStatus) and the
-- trigger below brings the order along.
--
-- Derivation rule: an order is only as far along as its least-advanced item.
-- Three items where two are delivered and one is still processing is a
-- processing order, not a delivered one. Cancelled items are ignored unless
-- every item is cancelled, in which case the order is cancelled too.

create or replace function public.sync_order_status_from_items()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_order uuid := coalesce(new.order_id, old.order_id);
  -- Typed as the enum, not text. A case expression built from bare literals
  -- resolves to text, and there is no text = order_status operator, so both the
  -- assignment and the comparison below fail at runtime with 42883.
  next_status public.order_status;
begin
  select (case
           -- Every line cancelled: so is the order.
           when count(*) filter (where status <> 'cancelled') = 0 then 'cancelled'
           -- Otherwise the least-advanced line that is still live.
           when count(*) filter (where status = 'processing') > 0 then 'processing'
           when count(*) filter (where status = 'shipped') > 0 then 'shipped'
           else 'delivered'
         end)::public.order_status
    into next_status
    from public.order_items
   where order_id = target_order;

  -- Only write when it actually changes, so this does not churn updated_at or
  -- fire other triggers for no reason.
  update public.orders o
     set status = next_status,
         shipped_at   = case when next_status = 'shipped'   and o.shipped_at   is null then now() else o.shipped_at   end,
         delivered_at = case when next_status = 'delivered' and o.delivered_at is null then now() else o.delivered_at end,
         cancelled_at = case when next_status = 'cancelled' and o.cancelled_at is null then now() else o.cancelled_at end
   where o.id = target_order
     and o.status is distinct from next_status;

  return null;
end;
$$;

drop trigger if exists order_items_sync_order_status on public.order_items;
create trigger order_items_sync_order_status
  after insert or update of status or delete on public.order_items
  for each row execute function public.sync_order_status_from_items();

-- Bring existing rows into line. Without this, orders placed before today keep
-- whatever status they drifted to.
update public.orders o
   set status = sub.derived
  from (
    select order_id,
           -- Cast for the same reason as in the function above: without it this
           -- column is text and the comparison against o.status has no operator.
           (case
             when count(*) filter (where status <> 'cancelled') = 0 then 'cancelled'
             when count(*) filter (where status = 'processing') > 0 then 'processing'
             when count(*) filter (where status = 'shipped') > 0 then 'shipped'
             else 'delivered'
           end)::public.order_status as derived
      from public.order_items
     group by order_id
  ) sub
 where o.id = sub.order_id
   and o.status is distinct from sub.derived;
