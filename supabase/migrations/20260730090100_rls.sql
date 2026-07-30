-- =============================================================================
-- Green Atelier (GAFS) — Row Level Security
--
-- The anon key is shipped inside the browser bundle, so it is public by design.
-- These policies — not the secrecy of that key — are what protect the data.
-- Idempotent: safe to re-run.
-- =============================================================================

alter table public.profiles             enable row level security;
alter table public.user_roles           enable row level security;
alter table public.user_settings        enable row level security;
alter table public.brands               enable row level security;
alter table public.addresses            enable row level security;
alter table public.listings             enable row level security;
alter table public.listing_verification enable row level security;
alter table public.wishlists            enable row level security;
alter table public.cart_items           enable row level security;
alter table public.follows              enable row level security;
alter table public.offers               enable row level security;
alter table public.promo_codes          enable row level security;
alter table public.orders               enable row level security;
alter table public.order_items          enable row level security;
alter table public.conversations        enable row level security;
alter table public.messages             enable row level security;
alter table public.contact_messages     enable row level security;

-- =============================================================================
-- COLUMN GUARDS
-- =============================================================================
-- RLS decides which rows a user may touch but cannot protect individual
-- columns, so two escalation paths need triggers instead.
--
-- Both guards are skipped when auth.uid() is null, which is the case for the
-- service_role key and for SQL run from the dashboard — that is how seeding and
-- admin tooling still work.

-- 1. A seller must not award themselves the "Trusted Seller" badge.
create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.is_trusted_seller := old.is_trusted_seller;
    new.id := old.id;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_privileges on public.profiles;
create trigger profiles_guard_privileges
  before update on public.profiles
  for each row execute function public.guard_profile_privileges();

-- 2. A seller must not publish or mark their own listing sold. Going live
--    requires review; 'sold' is reached only through place_order().
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
     and new.status not in ('draft', 'pending_review', 'archived') then
    raise exception
      'Listings can only be set to active or sold by Green Atelier review.';
  end if;

  -- Re-submitting an archived or rejected listing sends it back for review.
  if old.status in ('rejected', 'archived') and new.status = 'pending_review' then
    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists listings_guard_status on public.listings;
create trigger listings_guard_status
  before update on public.listings
  for each row execute function public.guard_listing_status();

-- New listings always start in review regardless of what the client sent.
create or replace function public.force_new_listing_pending()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null and not public.is_admin()
     and new.status not in ('draft', 'pending_review') then
    new.status := 'pending_review';
  end if;
  return new;
end;
$$;

drop trigger if exists listings_force_pending on public.listings;
create trigger listings_force_pending
  before insert on public.listings
  for each row execute function public.force_new_listing_pending();

-- =============================================================================
-- PROFILES
-- =============================================================================
-- Public so seller cards and profile pages work for signed-out visitors.
-- Nothing private is stored on this table.

drop policy if exists profiles_select_all on public.profiles;
create policy profiles_select_all on public.profiles
  for select using (true);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- =============================================================================
-- USER ROLES
-- =============================================================================
-- Read-only to users; granting a role requires the service_role key.

drop policy if exists user_roles_select_own on public.user_roles;
create policy user_roles_select_own on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- =============================================================================
-- USER SETTINGS
-- =============================================================================

drop policy if exists user_settings_select_own on public.user_settings;
create policy user_settings_select_own on public.user_settings
  for select to authenticated using (user_id = auth.uid());

drop policy if exists user_settings_insert_own on public.user_settings;
create policy user_settings_insert_own on public.user_settings
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists user_settings_update_own on public.user_settings;
create policy user_settings_update_own on public.user_settings
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =============================================================================
-- BRANDS
-- =============================================================================

drop policy if exists brands_select_all on public.brands;
create policy brands_select_all on public.brands
  for select using (true);

drop policy if exists brands_admin_write on public.brands;
create policy brands_admin_write on public.brands
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- ADDRESSES
-- =============================================================================

drop policy if exists addresses_own on public.addresses;
create policy addresses_own on public.addresses
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =============================================================================
-- LISTINGS
-- =============================================================================
-- Anyone can browse active listings, and sold ones stay visible so profile
-- pages can show a seller's history and the "Sold items" toggle works for
-- visitors. profile_stats runs with security_invoker, so it also depends on
-- sold rows being readable to produce a correct public sold count.
--
-- Sellers additionally see their own drafts, items in review and rejections.

drop policy if exists listings_select_active on public.listings;
create policy listings_select_active on public.listings
  for select using (
    status in ('active', 'sold')
    or seller_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists listings_insert_own on public.listings;
create policy listings_insert_own on public.listings
  for insert to authenticated with check (seller_id = auth.uid());

drop policy if exists listings_update_own on public.listings;
create policy listings_update_own on public.listings
  for update to authenticated
  using (seller_id = auth.uid() or public.is_admin())
  with check (seller_id = auth.uid() or public.is_admin());

-- Sold listings are order history and cannot be deleted.
drop policy if exists listings_delete_own on public.listings;
create policy listings_delete_own on public.listings
  for delete to authenticated
  using (
    (seller_id = auth.uid() and status in ('draft', 'pending_review', 'rejected', 'archived'))
    or public.is_admin()
  );

-- =============================================================================
-- LISTING VERIFICATION  (serial numbers, authenticity documents)
-- =============================================================================
-- Deliberately has no public read policy — buyers never see these rows.

drop policy if exists listing_verification_owner on public.listing_verification;
create policy listing_verification_owner on public.listing_verification
  for all to authenticated
  using (
    exists (select 1 from public.listings l
             where l.id = listing_id and l.seller_id = auth.uid())
    or public.is_admin()
  )
  with check (
    exists (select 1 from public.listings l
             where l.id = listing_id and l.seller_id = auth.uid())
    or public.is_admin()
  );

-- =============================================================================
-- WISHLIST / CART
-- =============================================================================

drop policy if exists wishlists_own on public.wishlists;
create policy wishlists_own on public.wishlists
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists cart_items_own on public.cart_items;
create policy cart_items_own on public.cart_items
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =============================================================================
-- FOLLOWS
-- =============================================================================
-- Readable by all so follower counts render on public profiles.

drop policy if exists follows_select_all on public.follows;
create policy follows_select_all on public.follows
  for select using (true);

drop policy if exists follows_insert_own on public.follows;
create policy follows_insert_own on public.follows
  for insert to authenticated with check (follower_id = auth.uid());

drop policy if exists follows_delete_own on public.follows;
create policy follows_delete_own on public.follows
  for delete to authenticated using (follower_id = auth.uid());

-- =============================================================================
-- OFFERS
-- =============================================================================

drop policy if exists offers_select_parties on public.offers;
create policy offers_select_parties on public.offers
  for select to authenticated using (
    buyer_id = auth.uid()
    or exists (select 1 from public.listings l
                where l.id = listing_id and l.seller_id = auth.uid())
    or public.is_admin()
  );

-- Only on active listings that opted into offers, and never your own.
drop policy if exists offers_insert_buyer on public.offers;
create policy offers_insert_buyer on public.offers
  for insert to authenticated with check (
    buyer_id = auth.uid()
    and exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.status = 'active'
        and l.accept_offers
        and l.seller_id <> auth.uid()
    )
  );

drop policy if exists offers_update_parties on public.offers;
create policy offers_update_parties on public.offers
  for update to authenticated
  using (
    buyer_id = auth.uid()
    or exists (select 1 from public.listings l
                where l.id = listing_id and l.seller_id = auth.uid())
  )
  with check (
    buyer_id = auth.uid()
    or exists (select 1 from public.listings l
                where l.id = listing_id and l.seller_id = auth.uid())
  );

-- =============================================================================
-- PROMO CODES
-- =============================================================================
-- Only active codes are visible, and validation goes through
-- validate_promo_code() so limits and expiry are enforced server-side.

drop policy if exists promo_codes_select_active on public.promo_codes;
create policy promo_codes_select_active on public.promo_codes
  for select using (is_active);

drop policy if exists promo_codes_admin_write on public.promo_codes;
create policy promo_codes_admin_write on public.promo_codes
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- ORDERS
-- =============================================================================
-- No insert policy on purpose: place_order() is SECURITY DEFINER and is the only
-- way to create an order, which keeps pricing on the server.

-- NOTE: these two policies are replaced in 20260730090300 because referencing
-- each other's table caused infinite RLS recursion. They are left as written
-- here so this migration still reflects what was originally applied.
drop policy if exists orders_select_parties on public.orders;
create policy orders_select_parties on public.orders
  for select to authenticated using (
    buyer_id = auth.uid()
    or exists (select 1 from public.order_items oi
                where oi.order_id = public.orders.id and oi.seller_id = auth.uid())
    or public.is_admin()
  );

-- Buyers may cancel while an order is still processing; admins may do anything.
drop policy if exists orders_update_buyer on public.orders;
create policy orders_update_buyer on public.orders
  for update to authenticated
  using ((buyer_id = auth.uid() and status = 'processing') or public.is_admin())
  with check ((buyer_id = auth.uid() and status in ('processing', 'cancelled')) or public.is_admin());

drop policy if exists order_items_select_parties on public.order_items;
create policy order_items_select_parties on public.order_items
  for select to authenticated using (
    seller_id = auth.uid()
    or exists (select 1 from public.orders o
                where o.id = public.order_items.order_id and o.buyer_id = auth.uid())
    or public.is_admin()
  );

-- =============================================================================
-- MESSAGING
-- =============================================================================

drop policy if exists conversations_parties on public.conversations;
create policy conversations_parties on public.conversations
  for select to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin());

drop policy if exists conversations_insert_buyer on public.conversations;
create policy conversations_insert_buyer on public.conversations
  for insert to authenticated
  with check (buyer_id = auth.uid() and seller_id <> auth.uid());

drop policy if exists messages_select_parties on public.messages;
create policy messages_select_parties on public.messages
  for select to authenticated using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
    or public.is_admin()
  );

drop policy if exists messages_insert_participant on public.messages;
create policy messages_insert_participant on public.messages
  for insert to authenticated with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- Marking a message read.
drop policy if exists messages_update_recipient on public.messages;
create policy messages_update_recipient on public.messages
  for update to authenticated using (
    sender_id <> auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- =============================================================================
-- CONTACT MESSAGES
-- =============================================================================
-- Signed-out visitors can submit the contact form but nobody can read the
-- inbox except the sender (when signed in) and staff.

drop policy if exists contact_messages_insert_any on public.contact_messages;
create policy contact_messages_insert_any on public.contact_messages
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

drop policy if exists contact_messages_select_own on public.contact_messages;
create policy contact_messages_select_own on public.contact_messages
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
