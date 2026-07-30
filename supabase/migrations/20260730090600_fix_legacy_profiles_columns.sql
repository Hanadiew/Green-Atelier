-- =============================================================================
-- Fix: three defects inherited from the pre-existing public.profiles table
--
-- public.profiles predates the schema migration, so every
-- `alter table ... add column if not exists` in 20260730090000 was a no-op for
-- the columns that already existed — including their constraints and defaults.
-- That left three problems that only surface on a real sign-up:
--
-- 1. full_name was NOT NULL with no default. handle_new_user() does not set it,
--    and sync_profile_full_name() only fills it when a first or last name is
--    present. A normal sign-up supplies neither, so the insert raised
--      23502: null value in column "full_name" violates not-null constraint
--    which rolled back the auth.users insert and returned HTTP 500. Sign-up was
--    impossible. It went unnoticed because the seeded demo seller and the test
--    buyer were both created WITH first/last name metadata, which satisfied the
--    constraint via the sync trigger.
--
-- 2. created_at was nullable with no default, so new profiles were created with
--    created_at = NULL.
--
-- 3. id defaulted to gen_random_uuid(). A profile id must always come from
--    auth.users; a generated one would only violate the foreign key.
-- =============================================================================

-- 1. full_name is a derived convenience column. A brand-new account has no name
--    yet, and Account settings fills it in later.
alter table public.profiles alter column full_name drop not null;

-- 2. Give created_at a default, backfill the rows that already lost it, then
--    make it required.
alter table public.profiles alter column created_at set default now();
update public.profiles set created_at = coalesce(created_at, updated_at, now())
 where created_at is null;
alter table public.profiles alter column created_at set not null;

-- 3. Never invent a profile id.
alter table public.profiles alter column id drop default;
