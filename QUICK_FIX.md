# Quick Fix for Login Issue

The error `406 (Not Acceptable)` and `PGRST116` means the query is returning 0 rows, likely due to RLS (Row Level Security) blocking access.

## Immediate Fix

Run this SQL in **Supabase SQL Editor**:

```sql
-- Drop and recreate the RLS policy
DROP POLICY IF EXISTS "Allow public read access for admin authentication" ON public.admin;

CREATE POLICY "Allow public read access for admin authentication"
ON public.admin FOR SELECT
TO anon, authenticated
USING (true);
```

## Verify It Works

After running the above, test with:

```sql
-- This should return the admin user
SELECT id, username, password, status
FROM public.admin
WHERE username = 'admin';
```

## If Still Not Working

1. **Check if RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'admin';
   ```

2. **Check existing policies:**
   ```sql
   SELECT policyname, roles, cmd, qual
   FROM pg_policies
   WHERE tablename = 'admin';
   ```

3. **Temporarily disable RLS to test (NOT for production):**
   ```sql
   ALTER TABLE public.admin DISABLE ROW LEVEL SECURITY;
   ```
   Then try logging in. If it works, the issue is with RLS policies.

4. **Re-enable RLS and fix policy:**
   ```sql
   ALTER TABLE public.admin ENABLE ROW LEVEL SECURITY;
   
   DROP POLICY IF EXISTS "Allow public read access for admin authentication" ON public.admin;
   
   CREATE POLICY "Allow public read access for admin authentication"
   ON public.admin FOR SELECT
   TO anon, authenticated
   USING (true);
   ```

## Alternative: Use Service Role (For Testing Only)

If RLS continues to be an issue, you can temporarily use the service role key in your `.env.local` for testing (NOT recommended for production):

```
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_service_role_key_here
```

⚠️ **Warning**: Never use service role key in production or commit it to git!

