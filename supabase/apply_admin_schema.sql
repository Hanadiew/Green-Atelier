-- =============================================================================
-- Green Atelier — admin portal schema, ready to paste into the Supabase
-- SQL editor (Dashboard -> SQL Editor -> New query -> Run).
--
-- This is 20260730091300_admin_features.sql followed by
-- 20260730091400_admin_portal_support.sql, unchanged. Both are idempotent, so
-- running this more than once is safe, and a later `supabase db push` will
-- re-run them harmlessly.
--
-- Requires the base migrations (090000-091200) to already be applied. Do not
-- assume they are: 091100 and 091200 were missed on the live project even
-- though this file ran, which left seller_payout_accounts and payouts absent.
-- apply_payouts_and_listing_lifecycle.sql backfills them.
-- =============================================================================


-- ############ 20260730091300_admin_features.sql ############
-- =============================================================================
-- Admin Portal Support Tables: Reports and Featured Listings
-- =============================================================================

-- =============================================================================
-- REPORTS TABLE
-- =============================================================================
-- For moderation: users can report listings or other users for policy violations.
-- Admins/moderators review and take action.

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  
  -- Who filed the report
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  
  -- What is being reported (at least one should be non-null)
  reported_listing_id uuid references public.listings (id) on delete cascade,
  reported_user_id uuid references public.profiles (id) on delete cascade,
  
  -- Reason for the report
  reason text not null check (reason in (
    'misleading_info',
    'policy_violation',
    'incorrect_product_info',
    'inappropriate_content',
    'seller_misconduct',
    'buyer_misconduct',
    'other'
  )),
  
  -- Details
  description text,
  
  -- Moderation workflow
  status text not null default 'pending' check (status in (
    'pending',
    'investigating',
    'resolved',
    'dismissed'
  )),
  
  -- Admin/moderator notes and action details
  admin_notes text,
  
  -- Track who handled it
  handled_by_id uuid references public.profiles (id) on delete set null,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_reporter_id_idx on public.reports (reporter_id);
create index if not exists reports_reported_listing_id_idx on public.reports (reported_listing_id);
create index if not exists reports_reported_user_id_idx on public.reports (reported_user_id);
create index if not exists reports_status_idx on public.reports (status);
create index if not exists reports_created_at_idx on public.reports (created_at desc);

-- =============================================================================
-- FEATURED LISTINGS TABLE
-- =============================================================================
-- Allows admins to curate which active listings appear in the featured section
-- on the homepage. One-to-many since a listing can only be featured once.

create table if not exists public.featured_listings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  added_by_id uuid not null references public.profiles (id) on delete set null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- Only one featured entry per listing
create unique index if not exists featured_listings_listing_id_key
  on public.featured_listings (listing_id);

create index if not exists featured_listings_position_idx on public.featured_listings (position);

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

alter table public.reports enable row level security;
alter table public.featured_listings enable row level security;

-- Reports: anyone can insert (file a report)
drop policy if exists reports_insert_any on public.reports;
create policy reports_insert_any on public.reports
  for insert
  with check (auth.uid() is not null);

-- Reports: reporters can view their own
drop policy if exists reports_select_own on public.reports;
create policy reports_select_own on public.reports
  for select
  using (reporter_id = auth.uid());

-- Reports: admins/moderators can view all
drop policy if exists reports_select_admin on public.reports;
create policy reports_select_admin on public.reports
  for select
  using (exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('admin', 'moderator')
  ));

-- Reports: only admins/moderators can update
drop policy if exists reports_update_admin on public.reports;
create policy reports_update_admin on public.reports
  for update
  using (exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('admin', 'moderator')
  ))
  with check (exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('admin', 'moderator')
  ));

-- Featured listings: public read
drop policy if exists featured_listings_select_public on public.featured_listings;
create policy featured_listings_select_public on public.featured_listings
  for select
  using (true);

-- Featured listings: only admins can insert/update/delete
drop policy if exists featured_listings_admin_write on public.featured_listings;
create policy featured_listings_admin_write on public.featured_listings
  for insert
  with check (exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  ));

drop policy if exists featured_listings_admin_update on public.featured_listings;
create policy featured_listings_admin_update on public.featured_listings
  for update
  using (exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  ))
  with check (exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  ));

drop policy if exists featured_listings_admin_delete on public.featured_listings;
create policy featured_listings_admin_delete on public.featured_listings
  for delete
  using (exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  ));

-- =============================================================================
-- GRANTS
-- =============================================================================

grant select on public.reports to authenticated;
grant insert on public.reports to authenticated;
grant select, insert, update, delete on public.reports to authenticated;

grant select on public.featured_listings to anon, authenticated;
grant insert, update, delete on public.featured_listings to authenticated;

-- =============================================================================
-- TRIGGER TO UPDATE UPDATED_AT
-- =============================================================================

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at
  before update on public.reports
  for each row execute function public.set_updated_at();

-- ############ 20260730091400_admin_portal_support.sql ############
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

drop policy if exists reports_insert_any on public.reports;
create policy reports_insert_own on public.reports
  for insert to authenticated
  with check (reporter_id = (select auth.uid()));

-- One SELECT policy, not two: two permissive policies on the same command make
-- every read evaluate both (multiple_permissive_policies).
drop policy if exists reports_select_own on public.reports;
drop policy if exists reports_select_admin on public.reports;
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
-- =============================================================================
-- Tell PostgREST about the new tables and views straight away rather than
-- waiting for its cache to expire.
-- =============================================================================
notify pgrst, 'reload schema';

-- Sanity check — expect: admin_users, featured_listings, reports, and one
-- listings.rejection_reason row.
select table_name, table_type
  from information_schema.tables
 where table_schema = 'public'
   and table_name in ('reports', 'featured_listings', 'admin_users')
 order by table_name;

select column_name
  from information_schema.columns
 where table_schema = 'public'
   and (table_name, column_name) in
       (values ('listings', 'rejection_reason'), ('contact_messages', 'is_read'));
