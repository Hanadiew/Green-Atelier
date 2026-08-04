-- =============================================================================
-- STRIPE CUSTOMER PER USER
-- =============================================================================
-- Saving a card so the buyer does not retype it at checkout means the card has to
-- live on a Stripe Customer, and the Checkout Session has to be told which
-- customer it belongs to. This is where that id is kept.
--
-- Not a secret: a cus_… id is useless without the secret key, and the value is
-- only ever written by the attach-test-card Edge Function using the service role.
-- Readable by its owner and by staff, like the rest of the profile.

alter table public.profiles
  add column if not exists stripe_customer_id text;

create unique index if not exists profiles_stripe_customer_id_key
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;

comment on column public.profiles.stripe_customer_id is
  'Stripe Customer this user maps to, for saved payment methods. Written only by the attach-test-card function.';

-- A user must not be able to point themselves at somebody else's Stripe customer
-- — that would attach their checkout to another person's saved cards. Same guard
-- that already pins is_trusted_seller.
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
    new.stripe_customer_id := old.stripe_customer_id;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_privileges on public.profiles;
create trigger profiles_guard_privileges
  before update on public.profiles
  for each row execute function public.guard_profile_privileges();
