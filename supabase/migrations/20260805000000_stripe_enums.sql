-- =============================================================================
-- STRIPE PAYMENTS — enum additions only
-- =============================================================================
-- Postgres will not let a newly added enum value be *used* in the same
-- transaction that adds it, and `supabase db push` wraps each migration file in
-- one transaction. So the two new values live here alone, and everything that
-- references them is in 20260805000100_stripe_payments.sql.
--
--   order_status.pending    an order awaiting payment. It is not yet a sale, so
--                           it must not appear as work for the seller.
--   listing_status.reserved held for a buyer who is mid-payment. Not sold — a
--                           Stripe Checkout Session is not a payment — but not
--                           purchasable by anyone else either, which is what
--                           stops two buyers being charged for one item.

alter type public.order_status   add value if not exists 'pending' before 'processing';
alter type public.listing_status add value if not exists 'reserved' after 'pending_review';
