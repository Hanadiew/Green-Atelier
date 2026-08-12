-- =============================================================================
-- RETURN CANCELLED ITEMS TO SALE
-- =============================================================================
-- A cancelled order item puts its listing back on the marketplace.
--
-- Before this, only one cancellation path restored a listing:
-- release_pending_order(), which covers the unpaid cases (an abandoned Stripe
-- checkout, an expired session, a failed payment). It matches on
-- "reserved_order_id = p_order_id and status = 'reserved'", and it returns
-- early when the order is already paid.
--
-- So every cancellation *after* payment left the listing stranded. An admin
-- cancelling an order (src/lib/admin.js) and a seller cancelling a sale
-- (src/lib/salesOrders.js) both write only order_items.status. The listing
-- stayed 'sold' forever: off the shop, with sold_at set, and not even deletable
-- by its own seller, because the seller delete policy excludes sold rows. The
-- piece existed, nobody had bought it, and no one could put it back.
--
-- Handled here as a trigger on order_items rather than in each caller, because
-- there are four ways to cancel and more will be added. The one that matters is
-- the state, not the route taken to it.

create or replace function public.relist_cancelled_order_item()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- listing_id is nullable since 20260808000300 (deleting a user nulls it).
  -- Nothing to put back if the listing itself is gone.
  if new.listing_id is null then
    return null;
  end if;

  -- Only the crossing into 'cancelled'. Re-saving a cancelled row must not
  -- resurrect a listing that has since been sold again.
  if new.status <> 'cancelled' or old.status = 'cancelled' then
    return null;
  end if;

  -- guard_listing_status() otherwise rejects any status change not made by an
  -- admin, which is correct for people and wrong for this.
  perform set_config('gafs.bypass_status_guard', 'on', true);

  update public.listings l
     set status = 'active',
         -- Cleared so the piece does not read as sold. stamp_listing_sold_at()
         -- sets this again on the next genuine sale.
         sold_at = null,
         reserved_order_id = null,
         updated_at = now()
   where l.id = new.listing_id
     -- 'draft' or 'archived' means the seller has since made their own decision
     -- about this piece. Do not overrule it.
     and l.status in ('sold', 'reserved')
     -- Held for a different checkout that is still live: leave that hold alone,
     -- or two buyers end up racing for one item.
     and (l.reserved_order_id is null or l.reserved_order_id = new.order_id)
     -- And no other live order still claims it. Belt and braces: a listing can
     -- only be bought while 'active', so this should never match, but the cost
     -- of being wrong is selling one piece twice.
     and not exists (
       select 1
         from public.order_items other
        where other.listing_id = l.id
          and other.id <> new.id
          and other.status <> 'cancelled'
     );

  return null;
end;
$$;

drop trigger if exists order_items_relist_on_cancel on public.order_items;
create trigger order_items_relist_on_cancel
  after update of status on public.order_items
  for each row execute function public.relist_cancelled_order_item();

-- -----------------------------------------------------------------------------
-- Backfill
-- -----------------------------------------------------------------------------
-- Listings already stranded by a cancellation that happened before this
-- migration existed. Same conditions as the trigger: every order item pointing
-- at the listing is cancelled, and at least one of them is.
do $$
begin
  perform set_config('gafs.bypass_status_guard', 'on', true);

  update public.listings l
     set status = 'active',
         sold_at = null,
         reserved_order_id = null,
         updated_at = now()
   where l.status in ('sold', 'reserved')
     and exists (
       select 1 from public.order_items oi
        where oi.listing_id = l.id and oi.status = 'cancelled'
     )
     and not exists (
       select 1 from public.order_items oi
        where oi.listing_id = l.id and oi.status <> 'cancelled'
     );
end $$;
