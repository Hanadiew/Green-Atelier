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
