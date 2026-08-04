-- =============================================================================
-- SETTLE PAYOUTS THAT PREDATE THE SELLER'S BANK DETAILS
-- =============================================================================
-- finalize_paid_order() settles a payout at payment time, but only when the
-- seller already has a default payout account — there is nowhere to send it
-- otherwise, so the row is left 'pending'.
--
-- That leaves a gap: a seller who sells first and adds their bank details
-- afterwards would have those earlier payouts stuck 'pending' forever. This
-- function closes it, and is called from the app right after a payout account is
-- saved (src/lib/payouts.js: savePayoutAccount).
--
-- SCOPE, deliberately narrow: the caller's own rows, still unpaid, and only when
-- they have a default account. It writes payout_provider = 'simulated' because
-- that is the truth — see 20260805000400; no money moves in Stripe test mode.
--
-- WHEN A REAL PAYOUT PROVIDER IS ADDED, DELETE THIS FUNCTION. Letting a seller
-- mark their own payouts paid is only acceptable while 'paid' means "simulated
-- for demonstration". With real transfers, only the provider may set that.

create or replace function public.settle_my_pending_payouts()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_seller  uuid := auth.uid();
  v_account uuid;
  v_settled integer := 0;
begin
  if v_seller is null then
    raise exception 'You must be signed in.';
  end if;

  select id into v_account
    from public.seller_payout_accounts
   where user_id = v_seller and is_default
   limit 1;

  -- No account, nothing to settle to. Not an error: the caller may simply not be
  -- a seller yet.
  if v_account is null then
    return 0;
  end if;

  with settled as (
    update public.payouts
       set status = 'paid',
           payout_provider = 'simulated',
           paid_at = coalesce(paid_at, now()),
           payout_account_id = coalesce(payout_account_id, v_account)
     where seller_id = v_seller
       and status in ('pending', 'processing')
    returning 1
  )
  select count(*) into v_settled from settled;

  return v_settled;
end;
$$;

revoke all on function public.settle_my_pending_payouts() from public, anon;
grant execute on function public.settle_my_pending_payouts() to authenticated;
