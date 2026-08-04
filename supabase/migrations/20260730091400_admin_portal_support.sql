-- =============================================================================
-- Admin Portal, phase 2: make the schema actually serve src/lib/admin.js
--
-- 20260730091300 created `reports` and `featured_listings`, but several things
-- the admin portal reads or writes still do not exist, and a few of that
-- migration's own definitions cannot work as written:
--
--   1. reports.reporter_id is NOT NULL but createReport() never sends it, so
--      every user-filed report fails with 23502.
--   2. featured_listings.added_by_id is NOT NULL *and* ON DELETE SET NULL —
--      contradictory: deleting the admin's profile raises 23502.
--   3. Both tables' policies re-query user_roles inline instead of using the
--      SECURITY DEFINER public.is_admin(), and omit `to authenticated`, so they
--      run for anon and re-evaluate auth.uid() per row (the exact pattern
--      20260730090500 removed everywhere else).
--   4. contact_messages has no is_read column and no admin UPDATE policy, so
--      getContactMessages()/markMessageAsRead() 400 and 403.
--   5. profile_stats exposes items_for_sale/sold_count keyed on `id`, but
--      getAdminUser() reads user_id/listing_count/sales_count/purchase_count.
--   6. There is no user email anywhere in public. profiles is world-readable
--      (profiles_select_all uses `true`), so an email column there would leak
--      every address to anon — the admin user list gets a guarded view instead.
--
-- Idempotent; safe to run over a database that already has 091300 applied.
-- =============================================================================

-- =============================================================================
-- STRICT ADMIN PREDICATE
-- =============================================================================
-- public.is_admin() is true for moderators too. Homepage curation is an
-- admin-only power, so it needs a narrower check with the same SECURITY
-- DEFINER escape from user_roles' own RLS.

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_platform_admin() to authenticated;

-- =============================================================================
-- REPORTS: fill in reporter_id, require a target, rewrite policies
-- =============================================================================

-- The client only sends the target, reason and description. The reporter is
-- whoever is logged in, and the insert policy pins it there.
alter table public.reports alter column reporter_id set default auth.uid();

-- "at least one should be non-null" was a comment in 091300, not a constraint.
do $$ begin
  alter table public.reports
    add constraint reports_has_target
    check (reported_listing_id is not null or reported_user_id is not null);
exception when duplicate_object then null; end $$;

-- Drop the policy being replaced AND the one about to be created. Without the
-- second drop this migration is not re-runnable, which broke `db push` on a
-- project where apply_admin_schema.sql had already created these by hand.
drop policy if exists reports_insert_any on public.reports;
drop policy if exists reports_insert_own on public.reports;
create policy reports_insert_own on public.reports
  for insert to authenticated
  with check (reporter_id = (select auth.uid()));

-- One SELECT policy, not two: two permissive policies on the same command make
-- every read evaluate both (multiple_permissive_policies).
drop policy if exists reports_select_own on public.reports;
drop policy if exists reports_select_admin on public.reports;
drop policy if exists reports_select_own_or_admin on public.reports;
create policy reports_select_own_or_admin on public.reports
  for select to authenticated
  using (reporter_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists reports_update_admin on public.reports;
create policy reports_update_admin on public.reports
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists reports_delete_admin on public.reports;
create policy reports_delete_admin on public.reports
  for delete to authenticated
  using ((select public.is_platform_admin()));

-- 091300 granted DELETE to every authenticated user and then granted SELECT
-- twice. Reset to what the policies above actually permit.
revoke all on public.reports from anon, authenticated;
grant select, insert, update, delete on public.reports to authenticated;

-- =============================================================================
-- FEATURED LISTINGS: resolvable ownership, admin-only writes
-- =============================================================================

-- Keep the curation entry when the admin who added it is deleted; that is what
-- ON DELETE SET NULL was reaching for.
alter table public.featured_listings alter column added_by_id drop not null;
alter table public.featured_listings alter column added_by_id set default auth.uid();

drop policy if exists featured_listings_select_public on public.featured_listings;
create policy featured_listings_select_public on public.featured_listings
  for select to anon, authenticated
  using (true);

drop policy if exists featured_listings_admin_write on public.featured_listings;
drop policy if exists featured_listings_admin_insert on public.featured_listings;
create policy featured_listings_admin_insert on public.featured_listings
  for insert to authenticated
  with check ((select public.is_platform_admin()));

drop policy if exists featured_listings_admin_update on public.featured_listings;
create policy featured_listings_admin_update on public.featured_listings
  for update to authenticated
  using ((select public.is_platform_admin()))
  with check ((select public.is_platform_admin()));

drop policy if exists featured_listings_admin_delete on public.featured_listings;
create policy featured_listings_admin_delete on public.featured_listings
  for delete to authenticated
  using ((select public.is_platform_admin()));

revoke all on public.featured_listings from anon, authenticated;
grant select on public.featured_listings to anon, authenticated;
grant insert, update, delete on public.featured_listings to authenticated;

-- =============================================================================
-- CONTACT MESSAGES: read state + admin write access
-- =============================================================================

alter table public.contact_messages
  add column if not exists is_read boolean not null default false;

alter table public.contact_messages
  add column if not exists handled_by_id uuid references public.profiles (id) on delete set null;

create index if not exists contact_messages_is_read_idx
  on public.contact_messages (is_read) where is_read = false;

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

drop policy if exists contact_messages_update_admin on public.contact_messages;
create policy contact_messages_update_admin on public.contact_messages
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists contact_messages_delete_admin on public.contact_messages;
create policy contact_messages_delete_admin on public.contact_messages
  for delete to authenticated
  using ((select public.is_platform_admin()));

grant update, delete on public.contact_messages to authenticated;

-- =============================================================================
-- LISTINGS: keep the reason a listing was rejected
-- =============================================================================
-- rejectListing(listingId, reason) has always accepted a reason and silently
-- dropped it, because there was nowhere to put it. The seller cannot fix a
-- rejection they were never told about.

alter table public.listings add column if not exists rejection_reason text;

-- =============================================================================
-- PROMO CODES: let staff see the codes they just deactivated
-- =============================================================================
-- promo_codes_select_active is `using (is_active)`, with no admin branch. The
-- admin promos page could therefore list a code, deactivate it, and watch it
-- disappear — with no way to ever switch it back on.

drop policy if exists promo_codes_select_active on public.promo_codes;
create policy promo_codes_select_active on public.promo_codes
  for select
  using (is_active or (select public.is_admin()));

-- =============================================================================
-- PROFILE STATS: add the counts the admin user detail page reads
-- =============================================================================
-- Additive only. items_for_sale / sold_count / co2_saved_kg are kept because
-- the public profile page reads them; CREATE OR REPLACE cannot add columns in
-- the middle of a view, so the view is dropped and rebuilt.
--
-- security_invoker stays on: an admin sees every user's counts because the
-- orders / order_items policies already grant is_admin() a full read, and a
-- normal visitor still only aggregates rows they are allowed to see.

drop view if exists public.profile_stats;

create view public.profile_stats
with (security_invoker = true) as
select
  p.id,
  p.id as user_id,
  count(l.id) filter (where l.status = 'active') as items_for_sale,
  count(l.id) filter (where l.status = 'sold')   as sold_count,
  count(l.id)                                    as listing_count,
  coalesce(sum(l.co2_saved_kg) filter (where l.status = 'sold'), 0) as co2_saved_kg,
  (select count(*) from public.order_items oi where oi.seller_id = p.id) as sales_count,
  (select count(*) from public.orders o where o.buyer_id = p.id)        as purchase_count
from public.profiles p
left join public.listings l on l.seller_id = p.id
group by p.id;

grant select on public.profile_stats to anon, authenticated;

-- =============================================================================
-- ADMIN USER DIRECTORY  (the only place an email is exposed)
-- =============================================================================
-- profiles_select_all is `using (true)`, so anything added to public.profiles
-- is world-readable. Emails live in auth.users; this view joins them in and
-- runs as its owner (security_invoker off) purely so it can read auth.users.
-- The WHERE clause is the access control — without it the view would hand
-- every address to any logged-in user.

create or replace view public.admin_users
with (security_invoker = false) as
select
  p.id,
  p.username,
  p.full_name,
  p.first_name,
  p.last_name,
  p.avatar_url,
  u.email,
  u.last_sign_in_at,
  u.banned_until,
  p.city,
  p.state,
  p.country,
  p.is_trusted_seller,
  p.created_at
from public.profiles p
join auth.users u on u.id = p.id
where (select public.is_admin());

revoke all on public.admin_users from anon;
grant select on public.admin_users to authenticated;