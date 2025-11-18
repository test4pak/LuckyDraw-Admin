-- Test script to verify admin table setup
-- Run this in Supabase SQL Editor to check if everything is set up correctly

-- 1. Check if admin table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'admin'
) AS table_exists;

-- 2. Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'admin'
ORDER BY ordinal_position;

-- 3. Check if admin user exists
SELECT id, username, status, created_at
FROM public.admin
WHERE username = 'admin';

-- 4. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'admin';

-- 5. Test query (should return the admin user)
SELECT id, username, status
FROM public.admin
WHERE username = 'admin' AND status = 'active';

