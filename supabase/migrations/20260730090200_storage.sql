-- =============================================================================
-- Green Atelier (GAFS) — Storage buckets and policies
--
-- Path convention for every bucket: <auth.uid()>/<rest-of-path>
-- The leading folder is the owner's user id, which is what the policies below
-- check. Idempotent: safe to re-run.
-- =============================================================================

-- Product photos: shown to everyone, so the bucket is public.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images', 'listing-images', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Profile pictures: also public.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars', 'avatars', true, 2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Receipts and authenticity cards: private. The Sell wizard tells sellers this
-- stays confidential, so the bucket is not public and reads require a signed URL.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'authenticity-docs', 'authenticity-docs', false, 10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- =============================================================================
-- listing-images
-- =============================================================================

drop policy if exists "listing images are publicly readable" on storage.objects;
create policy "listing images are publicly readable" on storage.objects
  for select using (bucket_id = 'listing-images');

drop policy if exists "sellers upload their own listing images" on storage.objects;
create policy "sellers upload their own listing images" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "sellers update their own listing images" on storage.objects;
create policy "sellers update their own listing images" on storage.objects
  for update to authenticated using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "sellers delete their own listing images" on storage.objects;
create policy "sellers delete their own listing images" on storage.objects
  for delete to authenticated using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =============================================================================
-- avatars
-- =============================================================================

drop policy if exists "avatars are publicly readable" on storage.objects;
create policy "avatars are publicly readable" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "users manage their own avatar" on storage.objects;
create policy "users manage their own avatar" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =============================================================================
-- authenticity-docs  (private)
-- =============================================================================
-- No public select policy. Only the uploading seller and staff can read.

drop policy if exists "sellers read their own authenticity docs" on storage.objects;
create policy "sellers read their own authenticity docs" on storage.objects
  for select to authenticated using (
    bucket_id = 'authenticity-docs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

drop policy if exists "sellers upload their own authenticity docs" on storage.objects;
create policy "sellers upload their own authenticity docs" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'authenticity-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "sellers delete their own authenticity docs" on storage.objects;
create policy "sellers delete their own authenticity docs" on storage.objects
  for delete to authenticated using (
    bucket_id = 'authenticity-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
