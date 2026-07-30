-- =============================================================================
-- Remove the followers / following feature
--
-- Drops the follows table and takes the follower counts out of profile_stats.
-- The table held no rows when this ran, so no data was lost.
--
-- The view has to be recreated rather than altered, because you cannot remove
-- columns from an existing view with CREATE OR REPLACE VIEW.
-- =============================================================================

drop view if exists public.profile_stats;

create view public.profile_stats
with (security_invoker = true) as
select
  p.id,
  count(l.id) filter (where l.status = 'active') as items_for_sale,
  count(l.id) filter (where l.status = 'sold')   as sold_count,
  coalesce(sum(l.co2_saved_kg) filter (where l.status = 'sold'), 0) as co2_saved_kg
from public.profiles p
left join public.listings l on l.seller_id = p.id
group by p.id;

grant select on public.profile_stats to anon, authenticated;

-- Policies and indexes on the table go with it.
drop table if exists public.follows;
