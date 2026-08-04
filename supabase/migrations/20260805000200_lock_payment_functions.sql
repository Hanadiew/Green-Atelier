-- =============================================================================
-- LOCK THE PAYMENT FUNCTIONS
-- =============================================================================
-- Fixes a hole in 20260805000100. That migration did:
--
--   revoke all on function public.finalize_paid_order(uuid, text)
--     from anon, authenticated;
--
-- which is not enough. Postgres grants EXECUTE on every new function to PUBLIC
-- by default, and `anon`/`authenticated` inherit it through that grant rather
-- than holding one of their own — so revoking from those two roles changed
-- nothing. Verified against the live database: calling finalize_paid_order() as
-- a signed-in user reached the function body ("Order ... not found") instead of
-- being refused.
--
-- The consequence was severe: finalize_paid_order() is SECURITY DEFINER, so any
-- authenticated buyer could pass their own pending order id and have it marked
-- paid, the listings marked sold and the cart cleared — without paying.
--
-- Revoking from PUBLIC is what actually removes it. Only the service role, which
-- bypasses grants entirely, may settle a payment.

revoke all on function public.finalize_paid_order(uuid, text)
  from public, anon, authenticated;

revoke all on function public.release_pending_order(uuid, public.payment_status)
  from public, anon, authenticated;

-- The two buyer-facing functions are re-granted explicitly rather than relying
-- on the implicit PUBLIC grant, so the privilege list says what is intended.
-- Both already verify auth.uid() internally; this just removes anon's access.
revoke all on function public.create_pending_order(uuid, text, text, text)
  from public, anon;
grant execute on function public.create_pending_order(uuid, text, text, text)
  to authenticated;

revoke all on function public.cancel_my_pending_order(uuid)
  from public, anon;
grant execute on function public.cancel_my_pending_order(uuid)
  to authenticated;
