-- =============================================================================
-- SELLER REVIEWS
-- =============================================================================
-- A buyer who has actually received a piece may rate the seller once for that
-- order. The review then shows on the seller's public profile.
--
-- The "actually received" part is the whole point, and it is enforced here
-- rather than in the browser: a review is only insertable when the row's own
-- order is delivered and belongs to the person writing it. Client-side checks
-- decide what the UI offers; this decides what the database accepts.
--
-- One review per order, not per seller: a buyer who has bought three times has
-- three things to say, and each is anchored to the transaction it describes.

create table if not exists public.seller_reviews (
  id uuid primary key default gen_random_uuid(),

  -- The order is the anchor. Unique, so a buyer cannot stack reviews on one
  -- purchase, and cascade so a deleted order does not leave an orphan.
  order_id uuid not null unique references public.orders(id) on delete cascade,

  -- Denormalised on purpose. The profile page reads by seller and would
  -- otherwise have to join orders -> order_items -> listings to find them, and
  -- a seller must keep their history even if a listing is later removed.
  -- Referencing profiles rather than auth.users on purpose, matching
  -- listings.seller_id and orders.buyer_id: PostgREST can only embed the
  -- reviewer's name and avatar if the foreign key points at the table holding
  -- them, and profiles is keyed 1:1 to auth.users anyway.
  seller_id uuid not null references public.profiles(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,

  rating smallint not null check (rating between 1 and 5),
  body text check (body is null or char_length(body) <= 1000),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists seller_reviews_seller_idx
  on public.seller_reviews (seller_id, created_at desc);

alter table public.seller_reviews enable row level security;

-- Anyone may read: these are published on a public profile.
drop policy if exists seller_reviews_read on public.seller_reviews;
create policy seller_reviews_read
  on public.seller_reviews for select
  using (true);

-- Insert only by the buyer, only for their own delivered order, and only where
-- the seller named is genuinely the seller on that order. Without the last
-- clause a buyer could post a five-star review against any account they liked,
-- or a one-star against a competitor.
drop policy if exists seller_reviews_insert on public.seller_reviews;
create policy seller_reviews_insert
  on public.seller_reviews for insert
  with check (
    buyer_id = auth.uid()
    and buyer_id <> seller_id
    and exists (
      select 1
      from public.orders o
      join public.order_items oi on oi.order_id = o.id
      join public.listings l on l.id = oi.listing_id
      where o.id = seller_reviews.order_id
        and o.buyer_id = auth.uid()
        and o.status = 'delivered'
        and l.seller_id = seller_reviews.seller_id
    )
  );

-- A buyer may correct their own words. They may not repoint the review at a
-- different order or a different seller, which the guard below enforces.
drop policy if exists seller_reviews_update on public.seller_reviews;
create policy seller_reviews_update
  on public.seller_reviews for update
  using (buyer_id = auth.uid())
  with check (buyer_id = auth.uid());

drop policy if exists seller_reviews_delete on public.seller_reviews;
create policy seller_reviews_delete
  on public.seller_reviews for delete
  using (buyer_id = auth.uid());

-- RLS cannot restrict individual columns, so the immutable ones are pinned in a
-- trigger. Same pattern as guard_offer_transition().
create or replace function public.guard_seller_review_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.order_id is distinct from old.order_id
     or new.seller_id is distinct from old.seller_id
     or new.buyer_id is distinct from old.buyer_id then
    raise exception 'A review cannot be moved to another order, seller or buyer.';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists seller_reviews_guard on public.seller_reviews;
create trigger seller_reviews_guard
  before update on public.seller_reviews
  for each row execute function public.guard_seller_review_update();
