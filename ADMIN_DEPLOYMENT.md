# Admin Portal Deployment Guide

## Prerequisites
- Supabase CLI installed: `npm install -g supabase`
- You have access to your Supabase project
- You've linked your local project: `npx supabase link --project-ref your-project-ref`

## Step 1: Deploy the Database Migration

The new admin features require a database migration that adds:
- `reports` table for moderation
- `featured_listings` table for homepage curation
- Appropriate RLS policies

### Apply the migration:

```bash
npx supabase db push
```

This will apply all pending migrations, including:
- `supabase/migrations/20260730091300_admin_features.sql`

The migration is idempotent - it's safe to run multiple times.

### Verify migration success:

In the Supabase dashboard, check:
1. **Tables** → `reports` table should exist with columns:
   - `id` (uuid primary key)
   - `reporter_id` (uuid)
   - `reported_listing_id` (uuid, nullable)
   - `reported_user_id` (uuid, nullable)
   - `reason` (text)
   - `description` (text)
   - `status` (text: pending, investigating, resolved, dismissed)
   - `admin_notes` (text)
   - `handled_by_id` (uuid)
   - `created_at`, `updated_at` (timestamps)

2. **Tables** → `featured_listings` table should exist with columns:
   - `id` (uuid primary key)
   - `listing_id` (uuid unique)
   - `added_by_id` (uuid)
   - `position` (integer)
   - `created_at` (timestamp)

3. **Row Level Security** → Both tables should have RLS enabled with appropriate policies

## Step 2: Create Admin User(s)

### Option A: Supabase Dashboard (Recommended)

1. Open **Supabase Dashboard → SQL Editor**
2. Run this SQL to grant admin role to a user:

```sql
-- Replace 'your-user-id' with an actual user UUID from auth.users
INSERT INTO public.user_roles (user_id, role)
VALUES ('your-user-id', 'admin');
```

To find a user's ID:
1. Go to **Authentication → Users**
2. Copy the user's UUID from the list

### Option B: Grant Moderator Role

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('your-user-id', 'moderator');
```

### Verify the role was assigned:

```sql
SELECT user_id, role FROM public.user_roles WHERE user_id = 'your-user-id';
```

## Step 3: Update Environment Variables (if needed)

No new environment variables are required for the admin portal. The existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are sufficient.

## Step 4: Start the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Step 5: Test the Admin Portal

1. **Login** with your admin user account
2. **Verify navigation** → You should be redirected to `/admin` automatically
3. **Check dashboard** → Stats should load from the database
4. **Test listings** → Review and approve/reject pending listings
5. **Verify authorization** → Try accessing `/admin` with a non-admin user (should be redirected to home)

## Troubleshooting

### "Access denied" error on `/admin`

- Ensure your user has been added to `user_roles` table
- Verify the `user_id` matches exactly (UUIDs are case-sensitive)
- Check that the role is 'admin' or 'moderator'

### Migration failed

```bash
# Check migration status
npx supabase migration list

# Reset migrations (development only!)
npx supabase db reset
```

### Dashboard stats showing 0 or errors

- Check browser console for fetch errors
- Verify RLS policies allow SELECT on tables
- Ensure `profile_stats` view exists (it's created by base migrations)

### Can't access other admin pages

- All pages are placeholders but should render
- Implement them following the pattern in `AdminListings.vue`
- Use functions from `src/lib/admin.js`

## For Production Deployment

1. **Test thoroughly in staging environment first**
2. **Back up your database before running migrations**
3. **Apply migrations:**
   ```bash
   npx supabase db push --remote
   ```
4. **Create admin users** via Supabase dashboard or CLI
5. **Test admin portal** in production environment
6. **Monitor** for any errors in the browser console or server logs

## Rollback (if needed)

If something goes wrong:

```bash
# Drop admin-specific tables (WARNING: destructive!)
DROP TABLE IF EXISTS public.featured_listings;
DROP TABLE IF EXISTS public.reports;

-- Or revert the entire migration by running:
-- Reset the database to the state before the migration
npx supabase db reset
```

## Architecture Notes

- Admin roles are **server-side only** - cannot be spoofed from the browser
- RLS policies enforce all access control
- Service role key should never be exposed to the frontend
- All admin operations use the anon key + RLS for security

## Questions or Issues?

1. Check [ADMIN_IMPLEMENTATION.md](ADMIN_IMPLEMENTATION.md) for architecture overview
2. Review [src/lib/admin.js](src/lib/admin.js) for available functions
3. Check browser console for JavaScript errors
4. Check Supabase logs for database errors

---

**Next:** Start implementing placeholder pages or deploy to production. The admin portal is now ready for use!
