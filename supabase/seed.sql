-- =============================================================================
-- Green Atelier (GAFS) — seed data
--
-- Reference data (brands, promo codes) plus a demo seller and catalogue so the
-- Shop page has content before any real listing exists.
--
-- Idempotent: safe to re-run.
--
-- NOTE: the demo seller is inserted straight into auth.users, which is only
-- appropriate for a demo/dev account. Real users must go through Supabase Auth.
-- Delete the DEMO SELLER and DEMO CATALOGUE sections before going to production.
-- =============================================================================

-- crypt()/gen_salt() come from pgcrypto, which Supabase installs into the
-- `extensions` schema. Naming both schemas here keeps the seed working whichever
-- schema pgcrypto happens to live in.
set search_path = public, extensions, pg_catalog;

-- =============================================================================
-- BRANDS
-- =============================================================================

insert into public.brands (name, slug, logo_url) values
  ('Chanel',  'chanel',  '/demo/brands/chanel.png'),
  ('Coach',   'coach',   '/demo/brands/coach.png'),
  ('Dior',    'dior',    '/demo/brands/dior.png'),
  ('Gucci',   'gucci',   '/demo/brands/gucci.png'),
  ('Lacoste', 'lacoste', '/demo/brands/lacoste.png'),
  ('Prada',   'prada',   '/demo/brands/prada.png'),
  ('Celine',  'celine',  null),
  ('Hermès',  'hermes',  null),
  ('Louis Vuitton', 'louis-vuitton', null),
  ('Bottega Veneta', 'bottega-veneta', null),
  ('Saint Laurent',  'saint-laurent',  null),
  ('Burberry', 'burberry', null)
on conflict (name) do nothing;

-- =============================================================================
-- PROMO CODES
-- =============================================================================

insert into public.promo_codes
  (code, description, discount_type, discount_value, min_subtotal, max_discount, is_active)
values
  ('GREEN10',  '10% off your order',          'percent', 10, 0,    1000, true),
  ('ATELIER5', 'RM 50 off orders over RM 500','fixed',   50, 500,  null, true),
  ('WELCOME15','15% off your first order',    'percent', 15, 200,  1500, true)
on conflict (code) do nothing;

-- =============================================================================
-- DEMO SELLER
-- =============================================================================
-- Signs in with demo.seller@greenatelier.test / DemoSeller123
-- Inserting the auth.users row fires handle_new_user(), which creates the
-- matching profiles and user_settings rows.

do $$
declare
  v_uid   uuid := '11111111-1111-4111-8111-111111111111';
  v_email text := 'demo.seller@greenatelier.test';
begin
  if not exists (select 1 from auth.users where id = v_uid) then
    -- The token columns must be '' rather than NULL. GoTrue scans them into
    -- non-nullable Go strings, and a NULL makes every sign-in fail with
    -- "Database error querying schema".
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token,
      email_change, email_change_token_new, email_change_token_current,
      phone_change, phone_change_token, reauthentication_token,
      created_at, updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000', v_uid,
      'authenticated', 'authenticated', v_email,
      crypt('DemoSeller123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"first_name":"Ana","last_name":"Sofea"}'::jsonb,
      '', '', '', '', '', '', '', '',
      now(), now()
    );

    -- Password sign-in needs a matching identity row. GoTrue has changed this
    -- table's shape over time, so a failure here must not abort the seed —
    -- the profile and listings below are still valid without it.
    begin
      insert into auth.identities
        (provider_id, user_id, identity_data, provider,
         last_sign_in_at, created_at, updated_at)
      values
        (v_uid::text, v_uid,
         jsonb_build_object('sub', v_uid::text, 'email', v_email, 'email_verified', true),
         'email', now(), now(), now());
    exception when others then
      raise notice 'Skipped auth.identities for demo seller: %', sqlerrm;
    end;
  end if;
end $$;

-- Flesh out the auto-created profile. Running as the table owner means
-- auth.uid() is null, so guard_profile_privileges() steps aside and
-- is_trusted_seller can be set here.
update public.profiles set
  first_name = 'Ana',
  last_name  = 'Sofea',
  username   = 'anasofea',
  bio        = 'Curating pre-loved luxury from my own wardrobe. Every piece authenticated.',
  city       = 'Kulai',
  state      = 'Johor',
  country    = 'Malaysia',
  is_trusted_seller = true
where id = '11111111-1111-4111-8111-111111111111';

-- Shipping-from address for the demo seller.
insert into public.addresses (
  id, user_id, address_type, first_name, surname, phone_code, phone,
  street_address, city, state, postcode, country, is_default
) values (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  'both', 'Ana', 'Sofea', '+60', '1163477080',
  '7080, Jalan Sri Putri 14/2', 'Kulai', 'Johor', '81000', 'Malaysia', true
)
on conflict (id) do nothing;

-- =============================================================================
-- DEMO CATALOGUE
-- =============================================================================
-- Images live in public/demo/ so they resolve in both dev and production
-- builds. Listings created through the Sell wizard get Storage URLs instead.
--
-- Inserted as 'active' so the Shop page has stock. auth.uid() is null here, so
-- force_new_listing_pending() does not downgrade them.

insert into public.listings (
  id, seller_id, title, brand, brand_id, category, item_type, condition,
  color, material, size, is_vintage, description, year_purchased, origin,
  packaging, images, listing_price, original_price, accept_offers, status,
  shipping_address_id, created_at
)
select
  v.id::uuid,
  '11111111-1111-4111-8111-111111111111',
  v.title, v.brand,
  (select b.id from public.brands b where b.name = v.brand),
  v.category, v.item_type, v.condition,
  v.color, v.material, v.size, v.is_vintage, v.description,
  v.year_purchased, v.origin, v.packaging, v.images,
  v.listing_price, v.original_price, v.accept_offers, 'active'::public.listing_status,
  '22222222-2222-4222-8222-222222222222',
  now() - (v.age_days || ' days')::interval
from (values
  ('33333333-3333-4333-8333-000000000001',
   'Kisslock Frame Bag 27', 'Coach', 'Bags', 'Bag', 'Good as new',
   'Brown', 'Straw Woven', 'One size', false,
   'A beautifully crafted kisslock frame bag in straw woven material. Carried a handful of times, no marks on the leather trim. Deserves a home where it will actually be styled rather than sitting in storage.',
   2022, 'Direct from the brand',
   array['Original Box', 'Dustbag'], array['/demo/bag1.png'],
   2500, 3200, true, 1),

  ('33333333-3333-4333-8333-000000000002',
   'Triomphe Stamp 01 Sunglasses', 'Celine', 'Accessories', 'Sunglasses', 'New with tag',
   'Black', 'Acetate', 'One size', false,
   'Never worn, tags still attached. Bought as a gift that did not suit me. Comes with the original hard case and cleaning cloth.',
   2024, 'Direct from the brand',
   array['Original Box', 'Card or certificate'], array['/demo/shades.png'],
   2000, 2450, true, 3),

  ('33333333-3333-4333-8333-000000000003',
   'Silk Pleated Blouse', 'Dior', 'Blouses', 'Blouse', 'Good as new',
   'White', 'Silk', 'FR 38', false,
   'Worn twice to evening events, dry cleaned after each wear. Pleating is crisp with no pulls or staining. A quiet, timeless piece.',
   2023, 'Direct from the brand',
   array['Dustbag'], array['/demo/shirt.png'],
   9000, 11500, false, 5),

  ('33333333-3333-4333-8333-000000000004',
   'Women''s Elite Active Sneakers', 'Lacoste', 'Shoes', 'Sneakers', 'Good as new',
   'White', 'Leather', 'EU 38', false,
   'Light wear on the soles, uppers are clean. Comfortable everyday trainers that no longer fit me.',
   2023, 'Direct from the brand',
   array['Original Box'], array['/demo/shoes.png'],
   400, 620, true, 7),

  ('33333333-3333-4333-8333-000000000005',
   'Vintage Quilted Shoulder Bag', 'Chanel', 'Bags', 'Bag', 'Fair',
   'Black', 'Leather', 'Medium', true,
   'A genuine vintage piece, over twenty years old. Honest signs of age: softening at the corners and light patina on the hardware. Structurally sound and full of character.',
   2004, 'Private or staff sale',
   array['Dustbag', 'Card or certificate'], array['/demo/bag1.png'],
   7800, 9500, true, 11),

  ('33333333-3333-4333-8333-000000000006',
   'Monogram Silk Scarf', 'Gucci', 'Accessories', 'Scarf', 'New with tag',
   'Beige', 'Silk', '90cm', false,
   'Unworn with the original tag. A versatile neutral that works as a neck scarf or bag tie.',
   2024, 'Direct from the brand',
   array['Original Box'], array['/demo/shades.png'],
   1450, 1800, true, 13),

  ('33333333-3333-4333-8333-000000000007',
   'Tailored Wool Trousers', 'Prada', 'Bottoms', 'Trousers', 'Good as new',
   'Navy', 'Cotton', 'IT 40', false,
   'Sharp tailoring with an unbroken crease. Hemmed once by a tailor, otherwise unaltered. Selling because my size changed.',
   2022, 'Direct from the brand',
   array[]::text[], array['/demo/shirt.png'],
   1900, 2600, true, 17),

  ('33333333-3333-4333-8333-000000000008',
   'Leather Ankle Boots', 'Burberry', 'Shoes', 'Boots', 'Fair',
   'Brown', 'Leather', 'EU 39', false,
   'Well loved and it shows: creasing across the vamp and scuffing at both heels. Leather is still supple and the soles have plenty of life left.',
   2019, 'Other',
   array[]::text[], array['/demo/shoes.png'],
   980, 2100, true, 23)
) as v (
  id, title, brand, category, item_type, condition,
  color, material, size, is_vintage, description,
  year_purchased, origin, packaging, images,
  listing_price, original_price, accept_offers, age_days
)
on conflict (id) do nothing;

-- Private verification records for the demo listings. Buyers cannot read these.
insert into public.listing_verification (listing_id, serial_number, reviewed_at, review_notes)
values
  ('33333333-3333-4333-8333-000000000001', 'CH-2291-KSL-0027', now() - interval '1 day',
   'Hardware stamps and lining weave consistent with the stated year.'),
  ('33333333-3333-4333-8333-000000000002', 'CL-TRI-01-88421',  now() - interval '3 days',
   'Tags intact, matches current retail production.'),
  ('33333333-3333-4333-8333-000000000005', 'CC-VTG-1997-3312', now() - interval '11 days',
   'Serial format consistent with late-1990s production. Vintage claim verified.')
on conflict (listing_id) do nothing;
