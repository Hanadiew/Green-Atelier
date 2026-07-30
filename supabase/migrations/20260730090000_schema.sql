-- =============================================================================
-- Green Atelier (GAFS) — core schema
-- Sustainable luxury fashion resale marketplace
--
-- Idempotent: safe to re-run. The pre-existing `public.profiles` table is
-- extended additively rather than replaced.
-- =============================================================================

create extension if not exists "pgcrypto";

-- =============================================================================
-- ENUMS
-- =============================================================================

do $$ begin
  create type public.listing_status as enum
    ('draft', 'pending_review', 'active', 'sold', 'rejected', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum
    ('processing', 'shipped', 'delivered', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.offer_status as enum
    ('pending', 'accepted', 'declined', 'withdrawn', 'expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum
    ('pending', 'paid', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

-- =============================================================================
-- SHARED TRIGGER FUNCTION
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- =============================================================================
-- PROFILES  (extends the existing table)
-- =============================================================================
-- Rows here are world-readable (seller cards, public profiles), so nothing
-- private lives on this table. Email stays in auth.users; notification
-- settings live in user_settings; listing secrets in listing_verification.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade
);

alter table public.profiles add column if not exists first_name  text;
alter table public.profiles add column if not exists last_name   text;
alter table public.profiles add column if not exists full_name   text;
alter table public.profiles add column if not exists username    text;
alter table public.profiles add column if not exists bio         text;
alter table public.profiles add column if not exists avatar_url  text;
alter table public.profiles add column if not exists phone       text;
alter table public.profiles add column if not exists city        text;
alter table public.profiles add column if not exists state       text;
alter table public.profiles add column if not exists country     text default 'Malaysia';
alter table public.profiles add column if not exists is_trusted_seller boolean not null default false;
alter table public.profiles add column if not exists created_at  timestamptz not null default now();
alter table public.profiles add column if not exists updated_at  timestamptz not null default now();

-- Usernames are case-insensitively unique and URL-safe.
create unique index if not exists profiles_username_lower_key
  on public.profiles (lower(username))
  where username is not null;

do $$ begin
  alter table public.profiles
    add constraint profiles_username_format
    check (username is null or username ~ '^[a-z0-9_.]{3,30}$');
exception when duplicate_object then null; end $$;

-- Keep full_name consistent with first/last without discarding pre-existing values.
create or replace function public.sync_profile_full_name()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.first_name is not null or new.last_name is not null then
    new.full_name := nullif(trim(concat_ws(' ', new.first_name, new.last_name)), '');
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_sync_full_name on public.profiles;
create trigger profiles_sync_full_name
  before insert or update of first_name, last_name on public.profiles
  for each row execute function public.sync_profile_full_name();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =============================================================================
-- USER ROLES
-- =============================================================================
-- No user-facing write policy exists for this table, so a role can only be
-- granted with the service_role key or from the SQL editor. That is what keeps
-- users from promoting themselves to admin.

create table if not exists public.user_roles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  role text not null check (role in ('admin', 'moderator')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('admin', 'moderator')
  );
$$;

-- =============================================================================
-- USER SETTINGS  (private, owner-only)
-- =============================================================================

create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  email_offers     boolean not null default true,
  email_orders     boolean not null default true,
  email_messages   boolean not null default true,
  email_newsletter boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

-- =============================================================================
-- NEW USER BOOTSTRAP
-- =============================================================================
-- Fires on auth.users insert so a profile + settings row always exists.
-- Username is derived from the email local part, de-duplicated on collision.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_username text;
  candidate     text;
  suffix        integer := 0;
begin
  base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_.]', '', 'g'));
  if length(base_username) < 3 then
    base_username := 'atelier' || base_username;
  end if;
  base_username := left(base_username, 24);
  candidate := base_username;

  while exists (select 1 from public.profiles where lower(username) = candidate) loop
    suffix := suffix + 1;
    candidate := left(base_username, 24) || suffix::text;
  end loop;

  insert into public.profiles (id, username, first_name, last_name, avatar_url)
  values (
    new.id,
    candidate,
    nullif(new.raw_user_meta_data ->> 'first_name', ''),
    nullif(new.raw_user_meta_data ->> 'last_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- BRANDS  (reference data, publicly readable)
-- =============================================================================

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- ADDRESSES
-- =============================================================================

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  address_type text not null default 'both' check (address_type in ('shipping', 'billing', 'both')),
  first_name text not null,
  surname    text,
  company    text,
  phone_code text,
  phone      text,
  street_address text not null,
  apartment  text,
  city       text not null,
  state      text,
  postcode   text not null,
  country    text not null default 'Malaysia',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists addresses_user_id_idx on public.addresses (user_id);

-- At most one default address per user.
create unique index if not exists addresses_one_default_per_user
  on public.addresses (user_id)
  where is_default;

-- Setting a new default clears the previous one instead of hitting the index above.
create or replace function public.clear_other_default_addresses()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_default then
    update public.addresses
       set is_default = false
     where user_id = new.user_id
       and id <> new.id
       and is_default;
  end if;
  return new;
end;
$$;

drop trigger if exists addresses_single_default on public.addresses;
create trigger addresses_single_default
  before insert or update of is_default on public.addresses
  for each row when (new.is_default) execute function public.clear_other_default_addresses();

drop trigger if exists addresses_set_updated_at on public.addresses;
create trigger addresses_set_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

-- =============================================================================
-- LISTINGS
-- =============================================================================

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,

  title text not null check (length(trim(title)) between 2 and 140),

  -- Sellers may type any brand, so the free-text value is authoritative and the
  -- brands link is an optional enrichment.
  brand    text not null check (length(trim(brand)) > 0),
  brand_id uuid references public.brands (id) on delete set null,

  category  text not null check (category in
    ('Blouses', 'Tops', 'Bottoms', 'Bags', 'Accessories', 'Shoes')),
  item_type text,
  condition text not null check (condition in
    ('New with tag', 'Good as new', 'Fair')),

  color    text,
  material text,
  size     text,
  is_vintage boolean not null default false,

  description text,
  year_purchased integer check (year_purchased between 1900 and 2100),
  origin text check (origin in
    ('Direct from the brand', 'Private or staff sale',
     'Bought on Vestiaire Collective', 'Other')),
  packaging text[] not null default '{}',

  images text[] not null default '{}',

  listing_price  numeric(12, 2) not null check (listing_price > 0),
  original_price numeric(12, 2) check (original_price is null or original_price > 0),
  accept_offers  boolean not null default true,

  status public.listing_status not null default 'pending_review',
  shipping_address_id uuid references public.addresses (id) on delete set null,

  -- Sustainability calculator: fixed per-category CO2 saving, in kg.
  co2_saved_kg numeric(6, 2) generated always as (
    case category
      when 'Bags'        then 3.20
      when 'Shoes'       then 2.40
      when 'Bottoms'     then 1.85
      when 'Tops'        then 1.02
      when 'Blouses'     then 1.02
      when 'Accessories' then 0.85
      else 1.00
    end
  ) stored,

  view_count integer not null default 0,
  sold_at    timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  search_vector tsvector generated always as (
    to_tsvector('simple'::regconfig,
      coalesce(title, '') || ' ' ||
      coalesce(brand, '') || ' ' ||
      coalesce(category, '') || ' ' ||
      coalesce(description, ''))
  ) stored
);

create index if not exists listings_seller_id_idx  on public.listings (seller_id);
create index if not exists listings_status_idx     on public.listings (status);
create index if not exists listings_category_idx   on public.listings (category);
create index if not exists listings_condition_idx  on public.listings (condition);
create index if not exists listings_price_idx      on public.listings (listing_price);
create index if not exists listings_created_at_idx on public.listings (created_at desc);
create index if not exists listings_search_idx     on public.listings using gin (search_vector);

-- Drives the "active listings, newest first" catalogue query.
create index if not exists listings_active_created_idx
  on public.listings (created_at desc)
  where status = 'active';

drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- Stamp sold_at whenever a listing transitions into 'sold'.
create or replace function public.stamp_listing_sold_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'sold' and (old.status is distinct from 'sold') then
    new.sold_at := coalesce(new.sold_at, now());
  end if;
  return new;
end;
$$;

drop trigger if exists listings_stamp_sold_at on public.listings;
create trigger listings_stamp_sold_at
  before update of status on public.listings
  for each row execute function public.stamp_listing_sold_at();

-- =============================================================================
-- LISTING VERIFICATION  (private — never exposed to buyers)
-- =============================================================================
-- The Sell wizard promises "this information remains private" for the serial
-- number and authenticity document, so they cannot live on the world-readable
-- listings row.

create table if not exists public.listing_verification (
  listing_id uuid primary key references public.listings (id) on delete cascade,
  serial_number text,
  authenticity_document_url text,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists listing_verification_set_updated_at on public.listing_verification;
create trigger listing_verification_set_updated_at
  before update on public.listing_verification
  for each row execute function public.set_updated_at();

-- =============================================================================
-- WISHLIST / CART / FOLLOWS
-- =============================================================================
-- Resale items are one-of-a-kind, so cart rows need no quantity column.

create table if not exists public.wishlists (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create index if not exists wishlists_listing_id_idx on public.wishlists (listing_id);

create table if not exists public.cart_items (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table if not exists public.follows (
  follower_id  uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self check (follower_id <> following_id)
);

create index if not exists follows_following_id_idx on public.follows (following_id);

-- =============================================================================
-- OFFERS
-- =============================================================================

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_id   uuid not null references public.profiles (id) on delete cascade,
  offer_amount numeric(12, 2) not null check (offer_amount > 0),
  message text,
  status public.offer_status not null default 'pending',
  expires_at   timestamptz not null default (now() + interval '7 days'),
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists offers_listing_id_idx on public.offers (listing_id);
create index if not exists offers_buyer_id_idx   on public.offers (buyer_id);

-- One live offer per buyer per listing; re-offering means replacing the old one.
create unique index if not exists offers_one_pending_per_buyer
  on public.offers (listing_id, buyer_id)
  where status = 'pending';

drop trigger if exists offers_set_updated_at on public.offers;
create trigger offers_set_updated_at
  before update on public.offers
  for each row execute function public.set_updated_at();

-- =============================================================================
-- PROMO CODES
-- =============================================================================

create table if not exists public.promo_codes (
  code text primary key check (code = upper(code)),
  description text,
  discount_type  text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(12, 2) not null check (discount_value > 0),
  min_subtotal   numeric(12, 2) not null default 0,
  max_discount   numeric(12, 2),
  is_active   boolean not null default true,
  valid_from  timestamptz not null default now(),
  valid_until timestamptz,
  usage_limit integer,
  times_used  integer not null default 0,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- ORDERS
-- =============================================================================

-- Uses gen_random_uuid() (core since PG13) rather than pgcrypto's
-- gen_random_bytes(), which would not resolve under an empty search_path.
create or replace function public.generate_order_number()
returns text
language sql
volatile
set search_path = ''
as $$
  select 'GA-' || to_char(now(), 'YYYYMMDD') || '-' ||
         upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 5));
$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default public.generate_order_number(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  shipping_address_id uuid references public.addresses (id) on delete set null,

  subtotal     numeric(12, 2) not null check (subtotal >= 0),
  shipping_fee numeric(12, 2) not null default 0 check (shipping_fee >= 0),
  service_fee  numeric(12, 2) not null default 0 check (service_fee >= 0),
  discount     numeric(12, 2) not null default 0 check (discount >= 0),
  total        numeric(12, 2) not null check (total >= 0),
  promo_code   text references public.promo_codes (code) on delete set null,

  payment_method text check (payment_method in ('card', 'fpx', 'ewallet')),
  payment_status public.payment_status not null default 'pending',
  status public.order_status not null default 'processing',

  tracking_number text,
  placed_at    timestamptz not null default now(),
  shipped_at   timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_buyer_id_idx  on public.orders (buyer_id);
create index if not exists orders_placed_at_idx on public.orders (placed_at desc);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Order items carry a snapshot of the listing so purchase history survives the
-- listing being edited or deleted. Each item has its own status because a
-- multi-seller order ships in separate parcels.
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  listing_id uuid references public.listings (id) on delete set null,
  seller_id  uuid not null references public.profiles (id) on delete cascade,

  title_snapshot text not null,
  brand_snapshot text,
  image_snapshot text,

  price_paid    numeric(12, 2) not null check (price_paid >= 0),
  platform_fee  numeric(12, 2) not null default 0 check (platform_fee >= 0),
  seller_payout numeric(12, 2) not null default 0 check (seller_payout >= 0),

  status public.order_status not null default 'processing',
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx  on public.order_items (order_id);
create index if not exists order_items_seller_id_idx on public.order_items (seller_id);

-- =============================================================================
-- MESSAGING  (the "Chat" button on a product page)
-- =============================================================================

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete set null,
  buyer_id   uuid not null references public.profiles (id) on delete cascade,
  seller_id  uuid not null references public.profiles (id) on delete cascade,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint conversations_distinct_parties check (buyer_id <> seller_id)
);

create unique index if not exists conversations_unique_thread
  on public.conversations (coalesce(listing_id, '00000000-0000-0000-0000-000000000000'::uuid), buyer_id, seller_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (length(trim(body)) > 0),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

create or replace function public.touch_conversation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.conversations
     set last_message_at = new.created_at
   where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists messages_touch_conversation on public.messages;
create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation();

-- =============================================================================
-- CONTACT MESSAGES  (public contact form)
-- =============================================================================

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  name    text not null,
  email   text not null,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved')),
  created_at timestamptz not null default now()
);

-- =============================================================================
-- PROFILE STATS VIEW
-- =============================================================================
-- security_invoker keeps the caller's RLS in force rather than the view owner's.

create or replace view public.profile_stats
with (security_invoker = true) as
select
  p.id,
  count(l.id) filter (where l.status = 'active') as items_for_sale,
  count(l.id) filter (where l.status = 'sold')   as sold_count,
  (select count(*) from public.follows f where f.following_id = p.id) as followers_count,
  (select count(*) from public.follows f where f.follower_id  = p.id) as following_count,
  coalesce(sum(l.co2_saved_kg) filter (where l.status = 'sold'), 0)   as co2_saved_kg
from public.profiles p
left join public.listings l on l.seller_id = p.id
group by p.id;

-- =============================================================================
-- RPC: increment view count
-- =============================================================================

create or replace function public.increment_listing_views(p_listing_id uuid)
returns void
language sql
volatile
security definer
set search_path = ''
as $$
  update public.listings
     set view_count = view_count + 1
   where id = p_listing_id and status = 'active';
$$;

-- =============================================================================
-- RPC: validate a promo code
-- =============================================================================

create or replace function public.validate_promo_code(p_code text, p_subtotal numeric)
returns table (valid boolean, discount numeric, reason text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  pc public.promo_codes;
  d  numeric(12, 2);
begin
  select * into pc from public.promo_codes where code = upper(trim(p_code));

  if pc.code is null then
    return query select false, 0::numeric, 'Invalid promo code.'; return;
  end if;
  if not pc.is_active then
    return query select false, 0::numeric, 'This promo code is no longer active.'; return;
  end if;
  if now() < pc.valid_from or (pc.valid_until is not null and now() > pc.valid_until) then
    return query select false, 0::numeric, 'This promo code has expired.'; return;
  end if;
  if pc.usage_limit is not null and pc.times_used >= pc.usage_limit then
    return query select false, 0::numeric, 'This promo code has reached its limit.'; return;
  end if;
  if p_subtotal < pc.min_subtotal then
    return query select false, 0::numeric,
      'Spend at least RM ' || pc.min_subtotal::text || ' to use this code.'; return;
  end if;

  if pc.discount_type = 'percent' then
    d := round(p_subtotal * pc.discount_value / 100, 2);
  else
    d := pc.discount_value;
  end if;

  if pc.max_discount is not null then
    d := least(d, pc.max_discount);
  end if;
  d := least(d, p_subtotal);

  return query select true, d, null::text;
end;
$$;

-- =============================================================================
-- RPC: place an order from the caller's cart
-- =============================================================================
-- All money is computed server-side from stored listing prices, so a tampered
-- client cannot set its own total. Listings are locked FOR UPDATE so two buyers
-- racing on the same one-of-a-kind item cannot both succeed.

create or replace function public.place_order(
  p_shipping_address_id uuid,
  p_payment_method text,
  p_promo_code text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_buyer   uuid := auth.uid();
  v_order   uuid;
  v_subtotal numeric(12, 2) := 0;
  v_discount numeric(12, 2) := 0;
  v_shipping numeric(12, 2) := 15.00;  -- flat domestic rate
  v_service  numeric(12, 2);           -- 5% buyer service fee
  v_promo    text := nullif(upper(trim(coalesce(p_promo_code, ''))), '');
  v_valid    boolean;
  v_item     record;
  v_count    integer := 0;
begin
  if v_buyer is null then
    raise exception 'You must be signed in to place an order.';
  end if;

  if p_payment_method is not null and p_payment_method not in ('card', 'fpx', 'ewallet') then
    raise exception 'Unsupported payment method: %', p_payment_method;
  end if;

  -- The address must belong to the buyer.
  if p_shipping_address_id is null or not exists (
    select 1 from public.addresses
     where id = p_shipping_address_id and user_id = v_buyer
  ) then
    raise exception 'A valid shipping address is required.';
  end if;

  -- Lock every listing in the cart before pricing it.
  perform 1
    from public.listings l
    join public.cart_items c on c.listing_id = l.id
   where c.user_id = v_buyer
   for update of l;

  for v_item in
    select l.id, l.title, l.brand, l.listing_price, l.seller_id, l.status, l.images
      from public.cart_items c
      join public.listings l on l.id = c.listing_id
     where c.user_id = v_buyer
     order by c.created_at
  loop
    if v_item.status <> 'active' then
      raise exception 'Sorry — "%" is no longer available.', v_item.title;
    end if;
    if v_item.seller_id = v_buyer then
      raise exception 'You cannot buy your own listing "%".', v_item.title;
    end if;
    v_count := v_count + 1;
    v_subtotal := v_subtotal + v_item.listing_price;
  end loop;

  if v_count = 0 then
    raise exception 'Your bag is empty.';
  end if;

  if v_promo is not null then
    select valid, discount into v_valid, v_discount
      from public.validate_promo_code(v_promo, v_subtotal);
    if not coalesce(v_valid, false) then
      v_discount := 0;
      v_promo := null;
    end if;
  end if;

  v_service := round(v_subtotal * 0.05, 2);

  insert into public.orders (
    buyer_id, shipping_address_id, subtotal, shipping_fee,
    service_fee, discount, total, promo_code, payment_method, payment_status
  )
  values (
    v_buyer, p_shipping_address_id, v_subtotal, v_shipping,
    v_service, v_discount,
    v_subtotal + v_shipping + v_service - v_discount,
    v_promo, p_payment_method, 'pending'
  )
  returning id into v_order;

  insert into public.order_items (
    order_id, listing_id, seller_id, title_snapshot, brand_snapshot,
    image_snapshot, price_paid, platform_fee, seller_payout
  )
  select
    v_order, l.id, l.seller_id, l.title, l.brand,
    nullif(l.images[1], ''), l.listing_price,
    round(l.listing_price * 0.15, 2),   -- 15% platform fee
    round(l.listing_price * 0.85, 2)    -- 85% seller payout
  from public.cart_items c
  join public.listings l on l.id = c.listing_id
  where c.user_id = v_buyer;

  -- Lets this function past the seller status guard installed in the RLS migration.
  perform set_config('gafs.bypass_status_guard', 'on', true);

  update public.listings
     set status = 'sold'
   where id in (select listing_id from public.cart_items where user_id = v_buyer);

  if v_promo is not null then
    update public.promo_codes set times_used = times_used + 1 where code = v_promo;
  end if;

  -- The purchased items leave every cart, not just the buyer's.
  delete from public.cart_items
   where listing_id in (select listing_id from public.cart_items where user_id = v_buyer);

  return v_order;
end;
$$;

-- =============================================================================
-- GRANTS
-- =============================================================================
-- Table-level privileges only; RLS in the next migration decides which rows.

grant usage on schema public to anon, authenticated;

grant select on public.brands, public.promo_codes, public.profile_stats to anon, authenticated;
grant select on public.profiles, public.listings to anon, authenticated;

grant select, insert, update, delete on
  public.addresses, public.wishlists, public.cart_items, public.follows,
  public.offers, public.listings, public.listing_verification,
  public.conversations, public.messages
to authenticated;

-- Orders are created only through place_order(), never by a direct insert.
grant select on public.orders, public.order_items to authenticated;
grant update on public.orders to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.user_settings to authenticated;
grant select on public.user_roles to authenticated;
grant insert on public.contact_messages to anon, authenticated;
grant select on public.contact_messages to authenticated;

grant execute on function public.increment_listing_views(uuid) to anon, authenticated;
grant execute on function public.validate_promo_code(text, numeric) to anon, authenticated;
grant execute on function public.place_order(uuid, text, text) to authenticated;
grant execute on function public.is_admin() to authenticated;
