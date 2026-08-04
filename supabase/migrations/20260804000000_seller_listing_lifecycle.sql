-- =============================================================================
-- SELLER LISTING LIFECYCLE
-- =============================================================================
-- A seller's only controls over a listing are "edit" and "remove". They must
-- never be able to move it between statuses — publishing is Green Atelier's
-- decision, and 'sold' is reached only through place_order().
--
-- Before this migration a seller could set 'archived', and Profile.vue used
-- that as a soft delete for active listings. Archiving turned out to be a dead
-- end: an archived listing is invisible to buyers (listings_select_active),
-- has no path back to review, and gave the admin portal nothing to approve or
-- reject. Removing the state from the seller's reach is simpler than teaching
-- every screen to handle it.

-- 1. Sellers can no longer change status at all, with one exception: sending a
--    draft or a corrected rejection back for review.
create or replace function public.guard_listing_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null
     or coalesce(current_setting('gafs.bypass_status_guard', true), '') = 'on'
     or public.is_admin() then
    return new;
  end if;

  if new.status is distinct from old.status
     and not (old.status in ('draft', 'rejected') and new.status = 'pending_review') then
    raise exception
      'A listing''s status is set by Green Atelier review. Edit or remove the listing instead.';
  end if;

  return new;
end;
$$;

-- 2. "Remove" now means remove. Previously a seller could only delete a
--    draft/pending/rejected/archived listing, which is why removing an active
--    one had to archive it instead. Sold listings remain undeletable because
--    they are order history.
drop policy if exists listings_delete_own on public.listings;
create policy listings_delete_own on public.listings
  for delete to authenticated
  using (
    (seller_id = (select auth.uid()) and status <> 'sold')
    or (select public.is_admin())
  );

-- 3. One-time repair. Every listing currently sitting in 'archived' got there
--    through the old soft-delete path, not through a review decision. Send them
--    back to 'pending_review' rather than straight to 'active': the seller sees
--    "In review" and the admin portal gets them in its Pending Review queue to
--    approve or reject. auth.uid() is null here, so the guard above lets this
--    through.
update public.listings
   set status = 'pending_review'
 where status = 'archived';
