-- =============================================================================
-- DROP THE UNUSED MESSAGING TABLES
-- =============================================================================
-- conversations and messages were built in the original schema for buyer/seller
-- chat. That feature was never finished: nothing in src/ or in any Edge Function
-- reads or writes either table, so both have sat empty since the schema was
-- created.
--
-- Dropped rather than left in place because an empty table with live RLS
-- policies still reads as a feature to anyone opening the database, and it
-- carried three policies, a trigger, a trigger function and a grant, all of
-- which had to be understood before they could be dismissed.
--
-- Negotiation between buyer and seller still exists. It lives in `offers`,
-- which is a structured price exchange rather than free text, and is untouched
-- here. The Contact Us inbox is `enquiries`, also untouched.
--
-- BEFORE RUNNING THIS: confirm both tables are empty. This cannot be undone.
--   select
--     (select count(*) from public.conversations) as conversations,
--     (select count(*) from public.messages)      as messages;
--
-- Deliberately no `cascade`. If something depends on these that this migration
-- has not accounted for, the drop should fail loudly rather than quietly take
-- that dependency with it.

-- messages first: it holds the foreign key to conversations. Its policies,
-- indexes and the messages_touch_conversation trigger all go with it.
drop table if exists public.messages;

drop table if exists public.conversations;

-- Orphaned by the above: its only caller was the trigger on messages.
drop function if exists public.touch_conversation();
