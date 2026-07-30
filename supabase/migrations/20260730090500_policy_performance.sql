-- =============================================================================
-- Performance: stop re-evaluating auth.uid() once per row
--
-- `supabase db advisors` reported 29 auth_rls_initplan warnings. Written bare,
-- auth.uid() is treated as volatile per row, so a 10,000-row scan calls it
-- 10,000 times. Wrapping it as (select auth.uid()) turns it into an InitPlan
-- that Postgres evaluates once per query. Same for public.is_admin().
--
-- It also reported multiple_permissive_policies on brands and promo_codes: the
-- `FOR ALL` admin policies also applied to SELECT, so every read ran two
-- policies. Those are now scoped to writes only.
--
-- Policy logic is unchanged throughout — this migration is purely about how
-- often the expressions are evaluated.
-- =============================================================================

-- =============================================================================
-- PROFILES
-- =============================================================================

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));

-- =============================================================================
-- USER ROLES / SETTINGS
-- =============================================================================

drop policy if exists user_roles_select_own on public.user_roles;
create policy user_roles_select_own on public.user_roles
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists user_settings_select_own on public.user_settings;
create policy user_settings_select_own on public.user_settings
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists user_settings_insert_own on public.user_settings;
create policy user_settings_insert_own on public.user_settings
  for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists user_settings_update_own on public.user_settings;
create policy user_settings_update_own on public.user_settings
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- =============================================================================
-- BRANDS  (admin policy no longer overlaps the public read)
-- =============================================================================

drop policy if exists brands_admin_write on public.brands;

create policy brands_admin_insert on public.brands
  for insert to authenticated with check ((select public.is_admin()));
create policy brands_admin_update on public.brands
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy brands_admin_delete on public.brands
  for delete to authenticated using ((select public.is_admin()));

-- =============================================================================
-- ADDRESSES
-- =============================================================================

drop policy if exists addresses_own on public.addresses;
create policy addresses_own on public.addresses
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- =============================================================================
-- LISTINGS
-- =============================================================================

drop policy if exists listings_select_active on public.listings;
create policy listings_select_active on public.listings
  for select using (
    status in ('active', 'sold')
    or seller_id = (select auth.uid())
    or (select public.is_admin())
  );

drop policy if exists listings_insert_own on public.listings;
create policy listings_insert_own on public.listings
  for insert to authenticated with check (seller_id = (select auth.uid()));

drop policy if exists listings_update_own on public.listings;
create policy listings_update_own on public.listings
  for update to authenticated
  using (seller_id = (select auth.uid()) or (select public.is_admin()))
  with check (seller_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists listings_delete_own on public.listings;
create policy listings_delete_own on public.listings
  for delete to authenticated
  using (
    (seller_id = (select auth.uid())
      and status in ('draft', 'pending_review', 'rejected', 'archived'))
    or (select public.is_admin())
  );

-- =============================================================================
-- LISTING VERIFICATION
-- =============================================================================

drop policy if exists listing_verification_owner on public.listing_verification;
create policy listing_verification_owner on public.listing_verification
  for all to authenticated
  using (
    exists (select 1 from public.listings l
             where l.id = listing_id and l.seller_id = (select auth.uid()))
    or (select public.is_admin())
  )
  with check (
    exists (select 1 from public.listings l
             where l.id = listing_id and l.seller_id = (select auth.uid()))
    or (select public.is_admin())
  );

-- =============================================================================
-- WISHLIST / CART / FOLLOWS
-- =============================================================================

drop policy if exists wishlists_own on public.wishlists;
create policy wishlists_own on public.wishlists
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists cart_items_own on public.cart_items;
create policy cart_items_own on public.cart_items
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists follows_insert_own on public.follows;
create policy follows_insert_own on public.follows
  for insert to authenticated with check (follower_id = (select auth.uid()));

drop policy if exists follows_delete_own on public.follows;
create policy follows_delete_own on public.follows
  for delete to authenticated using (follower_id = (select auth.uid()));

-- =============================================================================
-- OFFERS
-- =============================================================================

drop policy if exists offers_select_parties on public.offers;
create policy offers_select_parties on public.offers
  for select to authenticated using (
    buyer_id = (select auth.uid())
    or exists (select 1 from public.listings l
                where l.id = listing_id and l.seller_id = (select auth.uid()))
    or (select public.is_admin())
  );

drop policy if exists offers_insert_buyer on public.offers;
create policy offers_insert_buyer on public.offers
  for insert to authenticated with check (
    buyer_id = (select auth.uid())
    and exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.status = 'active'
        and l.accept_offers
        and l.seller_id <> (select auth.uid())
    )
  );

drop policy if exists offers_update_parties on public.offers;
create policy offers_update_parties on public.offers
  for update to authenticated
  using (
    buyer_id = (select auth.uid())
    or exists (select 1 from public.listings l
                where l.id = listing_id and l.seller_id = (select auth.uid()))
  )
  with check (
    buyer_id = (select auth.uid())
    or exists (select 1 from public.listings l
                where l.id = listing_id and l.seller_id = (select auth.uid()))
  );

-- =============================================================================
-- PROMO CODES  (admin policy no longer overlaps the public read)
-- =============================================================================

drop policy if exists promo_codes_admin_write on public.promo_codes;

create policy promo_codes_admin_insert on public.promo_codes
  for insert to authenticated with check ((select public.is_admin()));
create policy promo_codes_admin_update on public.promo_codes
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy promo_codes_admin_delete on public.promo_codes
  for delete to authenticated using ((select public.is_admin()));

-- =============================================================================
-- ORDERS  (keeps the recursion-safe helpers from 20260730090300)
-- =============================================================================

drop policy if exists orders_select_parties on public.orders;
create policy orders_select_parties on public.orders
  for select to authenticated using (
    buyer_id = (select auth.uid())
    or public.is_order_seller(id)
    or (select public.is_admin())
  );

drop policy if exists orders_update_buyer on public.orders;
create policy orders_update_buyer on public.orders
  for update to authenticated
  using (
    (buyer_id = (select auth.uid()) and status = 'processing')
    or (select public.is_admin())
  )
  with check (
    (buyer_id = (select auth.uid()) and status in ('processing', 'cancelled'))
    or (select public.is_admin())
  );

drop policy if exists order_items_select_parties on public.order_items;
create policy order_items_select_parties on public.order_items
  for select to authenticated using (
    seller_id = (select auth.uid())
    or public.is_order_buyer(order_id)
    or (select public.is_admin())
  );

-- =============================================================================
-- MESSAGING
-- =============================================================================

drop policy if exists conversations_parties on public.conversations;
create policy conversations_parties on public.conversations
  for select to authenticated
  using (
    buyer_id = (select auth.uid())
    or seller_id = (select auth.uid())
    or (select public.is_admin())
  );

drop policy if exists conversations_insert_buyer on public.conversations;
create policy conversations_insert_buyer on public.conversations
  for insert to authenticated
  with check (buyer_id = (select auth.uid()) and seller_id <> (select auth.uid()));

drop policy if exists messages_select_parties on public.messages;
create policy messages_select_parties on public.messages
  for select to authenticated using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = (select auth.uid()) or c.seller_id = (select auth.uid()))
    )
    or (select public.is_admin())
  );

drop policy if exists messages_insert_participant on public.messages;
create policy messages_insert_participant on public.messages
  for insert to authenticated with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = (select auth.uid()) or c.seller_id = (select auth.uid()))
    )
  );

drop policy if exists messages_update_recipient on public.messages;
create policy messages_update_recipient on public.messages
  for update to authenticated using (
    sender_id <> (select auth.uid())
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = (select auth.uid()) or c.seller_id = (select auth.uid()))
    )
  );

-- =============================================================================
-- CONTACT MESSAGES
-- =============================================================================

drop policy if exists contact_messages_insert_any on public.contact_messages;
create policy contact_messages_insert_any on public.contact_messages
  for insert to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));

drop policy if exists contact_messages_select_own on public.contact_messages;
create policy contact_messages_select_own on public.contact_messages
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
