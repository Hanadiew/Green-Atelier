-- =============================================================================
-- Green Atelier TrustCheck™ — AI-assisted authenticity assessment
--
-- Stores the outcome of a rule-based assessment of the evidence a seller
-- uploaded. This is NOT authentication: nothing here decides whether an item is
-- genuine, and the vocabulary "authentic" / "fake" / "counterfeit" appears
-- nowhere in the schema or its constraints.
--
-- Two-table split, matching how the rest of this database treats seller data:
--   * trustcheck_assessments — the score, status and which evidence exists.
--     Publicly readable, because buyers see it on the product page.
--   * listing_verification   — the raw OCR text and the document paths.
--     Already private; receipts routinely contain the original purchase price
--     and the buyer's name, so that text must never reach a product page.
-- =============================================================================

-- =============================================================================
-- PRIVATE COLUMNS ON THE EXISTING VERIFICATION TABLE
-- =============================================================================

alter table public.listing_verification add column if not exists receipt_path      text;
alter table public.listing_verification add column if not exists certificate_path  text;
alter table public.listing_verification add column if not exists serial_image_path text;
alter table public.listing_verification add column if not exists ocr_text          text;
alter table public.listing_verification add column if not exists ocr_engine        text;

comment on column public.listing_verification.ocr_text is
  'Raw text read off uploaded documents. Private: may contain purchase price and buyer name.';

-- =============================================================================
-- SCORING FUNCTION
-- =============================================================================
-- Mirrors src/lib/trustcheck/scoring.js. The browser computes a preview so the
-- seller sees an instant result, but this is the authoritative version — the
-- trigger below overwrites whatever score the client submitted. Without it a
-- seller could simply POST a score of 100.

create or replace function public.trustcheck_score(
  p_has_front        boolean,
  p_has_back         boolean,
  p_has_interior     boolean,
  p_has_receipt      boolean,
  p_has_serial       boolean,
  p_ocr_origin_match boolean,
  p_has_certificate  boolean
)
returns integer
language sql
immutable
set search_path = ''
as $$
  select
      case when p_has_front        then 15 else 0 end
    + case when p_has_back         then 15 else 0 end
    + case when p_has_interior     then 15 else 0 end
    + case when p_has_receipt      then 20 else 0 end
    + case when p_has_serial       then 15 else 0 end
    + case when p_ocr_origin_match then 10 else 0 end
    + case when p_has_certificate  then 10 else 0 end;
$$;

create or replace function public.trustcheck_status(p_score integer)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_score >= 85 then 'likely_consistent'
    when p_score >= 60 then 'needs_review'
    else 'insufficient_evidence'
  end;
$$;

-- =============================================================================
-- ASSESSMENTS
-- =============================================================================

create table if not exists public.trustcheck_assessments (
  listing_id uuid primary key references public.listings (id) on delete cascade,

  -- The reference model this was assessed against.
  reference_slug    text not null,
  brand             text not null,
  model             text not null,
  reference_country text not null,

  -- Which evidence was provided. These are the only inputs to the score.
  has_front         boolean not null default false,
  has_back          boolean not null default false,
  has_interior      boolean not null default false,
  has_receipt       boolean not null default false,
  has_serial        boolean not null default false,
  has_certificate   boolean not null default false,
  ocr_origin_match  boolean not null default false,

  -- Recomputed by trigger; never trusted from the client.
  evidence_score integer not null default 0 check (evidence_score between 0 and 100),
  status text not null default 'insufficient_evidence'
    check (status in ('likely_consistent', 'needs_review', 'insufficient_evidence')),

  ocr_engine  text,
  assessed_at timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists trustcheck_status_idx on public.trustcheck_assessments (status);
create index if not exists trustcheck_score_idx  on public.trustcheck_assessments (evidence_score desc);

-- Verifies the image claims, then computes the score from the corrected flags.
--
-- Both jobs live in one trigger on purpose. Postgres fires BEFORE triggers in
-- alphabetical order by trigger name, so splitting them would have let the
-- score be computed from flags that were about to be corrected.
create or replace function public.trustcheck_apply_score()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_image_count integer;
begin
  -- The three required photos are the listing's own images, so a claim of
  -- has_front/back/interior is checked against the listing really having them.
  select coalesce(array_length(images, 1), 0) into v_image_count
    from public.listings where id = new.listing_id;

  if new.has_front    and v_image_count < 1 then new.has_front    := false; end if;
  if new.has_back     and v_image_count < 2 then new.has_back     := false; end if;
  if new.has_interior and v_image_count < 3 then new.has_interior := false; end if;

  new.evidence_score := public.trustcheck_score(
    new.has_front, new.has_back, new.has_interior,
    new.has_receipt, new.has_serial, new.ocr_origin_match, new.has_certificate
  );
  new.status := public.trustcheck_status(new.evidence_score);
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trustcheck_recompute on public.trustcheck_assessments;
create trigger trustcheck_recompute
  before insert or update on public.trustcheck_assessments
  for each row execute function public.trustcheck_apply_score();

-- =============================================================================
-- RLS
-- =============================================================================

alter table public.trustcheck_assessments enable row level security;

-- Buyers need to read this on the product page, so it follows the same
-- visibility rule as the listing it belongs to.
drop policy if exists trustcheck_select_public on public.trustcheck_assessments;
create policy trustcheck_select_public on public.trustcheck_assessments
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.status in ('active', 'sold')
             or l.seller_id = (select auth.uid())
             or (select public.is_admin()))
    )
  );

drop policy if exists trustcheck_insert_seller on public.trustcheck_assessments;
create policy trustcheck_insert_seller on public.trustcheck_assessments
  for insert to authenticated with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = (select auth.uid())
    )
    or (select public.is_admin())
  );

drop policy if exists trustcheck_update_seller on public.trustcheck_assessments;
create policy trustcheck_update_seller on public.trustcheck_assessments
  for update to authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = (select auth.uid())
    )
    or (select public.is_admin())
  )
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = (select auth.uid())
    )
    or (select public.is_admin())
  );

drop policy if exists trustcheck_delete_admin on public.trustcheck_assessments;
create policy trustcheck_delete_admin on public.trustcheck_assessments
  for delete to authenticated using ((select public.is_admin()));

-- =============================================================================
-- GRANTS
-- =============================================================================

grant select on public.trustcheck_assessments to anon, authenticated;
grant insert, update on public.trustcheck_assessments to authenticated;
grant execute on function public.trustcheck_score(
  boolean, boolean, boolean, boolean, boolean, boolean, boolean) to anon, authenticated;
grant execute on function public.trustcheck_status(integer) to anon, authenticated;
