# Fix Admin Login Issues

If you're getting "Invalid username or password", follow these steps:

## Step 1: Verify Admin Table Exists

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this query:

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'admin'
) AS table_exists;
```

If it returns `false`, the table doesn't exist. Go to Step 2.

## Step 2: Run the Migration

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the entire contents of `supabase/migrations/007_create_admin_table.sql`
3. Click **Run**
4. You should see "Success. No rows returned"

## Step 3: Verify Admin User Exists

Run this query:

```sql
SELECT id, username, status FROM public.admin WHERE username = 'admin';
```

You should see:
- username: `admin`
- status: `active`

If no rows are returned, insert the admin user:

```sql
INSERT INTO public.admin (username, password, status)
VALUES ('admin', 'aa', 'active');
```

## Step 4: Check RLS Policies

Run this to see if RLS is blocking access:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'admin';
```

You should see a policy allowing SELECT for `anon` and `authenticated` roles.

If the policy doesn't exist, run:

```sql
CREATE POLICY "Allow public read access for admin authentication"
ON public.admin FOR SELECT
TO anon, authenticated
USING (true);
```

## Step 5: Test Direct Query

Run this to test if you can query the table:

```sql
SELECT id, username, password, status
FROM public.admin
WHERE username = 'admin';
```

This should return the admin user with password 'aa'.

## Step 6: Check Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Try logging in again
4. Look for any error messages

Common errors:
- `relation "public.admin" does not exist` → Table not created, run migration
- `new row violates row-level security policy` → RLS policy issue, check Step 4
- `permission denied for table admin` → RLS policy issue, check Step 4

## Step 7: Verify Environment Variables

Make sure `admin-panel/.env.local` exists and has:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Still Not Working?

1. Check the browser console for detailed error messages
2. Verify you're using the correct Supabase project
3. Make sure the admin panel dev server is running: `cd admin-panel && npm run dev`
4. Try clearing browser cache and cookies

