# Create Admin User for Admin Panel

## Quick Steps

### 1. Create User in Supabase Auth

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Enter:
   - **Email**: `admin@luckydraw.pk`
   - **Password**: `aa`
   - ✅ **Auto Confirm User** (IMPORTANT: Check this!)
4. Click **"Create user"**
5. **Note the User ID** (UUID) - you'll need it

### 2. Add User to Public Users Table as Admin

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this SQL (replace `USER_ID_FROM_STEP_1` with the actual UUID):

```sql
-- Add user to public.users with admin privileges
INSERT INTO public.users (id, email, name, is_admin, created_at, updated_at)
VALUES (
  'USER_ID_FROM_STEP_1',  -- Paste the UUID from Step 1
  'admin@luckydraw.pk',
  'Admin User',
  TRUE,                   -- This makes them an admin
  NOW(),
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = TRUE,
  updated_at = NOW();
```

### 3. Login to Admin Panel

1. Go to **http://localhost:3001/login**
2. Login with:
   - Email: `admin@luckydraw.pk`
   - Password: `aa`
3. You should see the admin dashboard!

## Alternative: If User Already Exists

If the user already exists in `auth.users`, just run:

```sql
-- Make existing user an admin
UPDATE public.users 
SET is_admin = TRUE 
WHERE email = 'admin@luckydraw.pk';
```

## Verify It Worked

Run this to check:

```sql
SELECT id, email, name, is_admin 
FROM public.users 
WHERE email = 'admin@luckydraw.pk';
```

You should see `is_admin = true`.

