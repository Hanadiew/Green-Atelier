-- =============================================================================
-- LET AN ADMIN DELETE AN ACCOUNT WITHOUT DESTROYING OTHER PEOPLE'S RECORDS
-- =============================================================================
-- Deleting a user was refused whenever they had ever bought or sold, because
-- order_items.seller_id and order_items.listing_id both cascade: removing a
-- seller took their lines out of *other buyers'* order history, and removing a
-- listing did the same.
--
-- The refusal was the right call given those cascades. The better fix is to
-- remove the cascade, because order_items already snapshots everything a buyer
-- needs to read their own history — title_snapshot, brand_snapshot,
-- image_snapshot and price_paid are copied at checkout precisely so the line
-- survives the listing.
--
-- After this, deleting a seller nulls the reference and leaves the buyer's line
-- intact, showing the piece exactly as it was bought. Deleting a buyer still
-- removes that buyer's own orders, which is their data and the point of the
-- action.

-- --- order_items.seller_id ---------------------------------------------------
alter table public.order_items
  alter column seller_id drop not null;

alter table public.order_items
  drop constraint if exists order_items_seller_id_fkey;

alter table public.order_items
  add constraint order_items_seller_id_fkey
  foreign key (seller_id) references public.profiles(id) on delete set null;

-- --- order_items.listing_id --------------------------------------------------
-- Same reasoning: a delisted or deleted piece must not erase the record of
-- someone having bought it.
alter table public.order_items
  alter column listing_id drop not null;

alter table public.order_items
  drop constraint if exists order_items_listing_id_fkey;

alter table public.order_items
  add constraint order_items_listing_id_fkey
  foreign key (listing_id) references public.listings(id) on delete set null;

-- --- seller_reviews ----------------------------------------------------------
-- Reviews are about a seller, so they go with the seller. Cascade is correct
-- here and is left as it is; it is stated only so the next reader does not have
-- to check.
