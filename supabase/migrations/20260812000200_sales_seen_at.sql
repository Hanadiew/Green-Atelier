-- =============================================================================
-- SALES ORDERS: SEEN MARKER
-- =============================================================================
-- Records when a seller last opened their Sales Orders page, so the navbar can
-- show a dot for orders that arrived since. Without it a seller has no way of
-- knowing a sale has happened except by opening the page and comparing it to
-- what they remember.
--
-- Lives on profiles rather than on order_items because a seller cannot write to
-- order_items at all: guard_order_item_status_transition() pins every column
-- except status. The marker has to sit on a row they own.
--
-- One timestamp rather than a per-order read flag. A dot only has to answer
-- "is there anything I have not looked at", and one column answers it with one
-- comparison instead of a join.
--
-- not null default now() is deliberate. A nullable column would read as "never
-- looked", which would light the dot up with every historical sale the first
-- time this ships. Existing profiles are stamped now() by the default, so the
-- dot starts clear and only genuinely new orders raise it.

alter table public.profiles
  add column if not exists sales_seen_at timestamptz not null default now();

comment on column public.profiles.sales_seen_at is
  'When the seller last opened Sales Orders. Order items created after this count as new.';

-- No RLS change needed. profiles_update_own already lets a user write their own
-- row, and guard_profile_privileges() pins only is_trusted_seller, id and
-- stripe_customer_id, so this column is writable by its owner and by no one
-- else.

-- The badge query filters seller_id, then status, then created_at. The existing
-- order_items_seller_id_idx covers only the first.
create index if not exists order_items_seller_new_idx
  on public.order_items (seller_id, created_at desc)
  where status = 'processing';
