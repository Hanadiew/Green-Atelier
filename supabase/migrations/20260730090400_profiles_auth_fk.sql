-- =============================================================================
-- Fix: public.profiles was missing its foreign key to auth.users
--
-- public.profiles already existed in this project before the schema migration
-- ran, so the `create table if not exists ... references auth.users` in
-- 20260730090000 was a no-op and never established the reference.
--
-- Without it, deleting a user from the Auth dashboard left an orphaned profile
-- behind, along with their listings, addresses and orders, because every other
-- table cascades from profiles rather than from auth.users directly.
-- =============================================================================

-- Any profile with no matching auth user is already orphaned data and would
-- block the constraint below.
delete from public.profiles p
where not exists (select 1 from auth.users u where u.id = p.id);

do $$ begin
  alter table public.profiles
    add constraint profiles_id_fkey
    foreign key (id) references auth.users (id) on delete cascade;
exception
  when duplicate_object then null;
  when duplicate_table then null;
end $$;
