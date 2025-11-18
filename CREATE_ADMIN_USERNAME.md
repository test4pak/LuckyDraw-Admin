# Create Admin User (Username + Password Only)

## Quick Setup

Since Supabase Auth requires an email, we'll use a simple format: `username@admin.local`

### Step 1: Create User in Supabase Auth

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Enter:
   - **Email**: `admin@admin.local` (this is your username)
   - **Password**: `aa`
   - ✅ **Auto Confirm User** (IMPORTANT!)
4. Click **"Create user"**
5. **Copy the User ID** (UUID) - you'll see it after creation

### Step 2: Add User to Public Users Table as Admin

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this SQL (replace `USER_ID_HERE` with the UUID from Step 1):

```sql
INSERT INTO public.users (id, email, name, is_admin, created_at, updated_at)
VALUES (
  'USER_ID_HERE',  -- Paste the UUID from Step 1
  'admin@admin.local',
  'Admin',
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = TRUE,
  email = 'admin@admin.local',
  name = 'Admin',
  updated_at = NOW();
```

### Step 3: Login to Admin Panel

1. Go to **http://localhost:3001/login**
2. Login with:
   - **Email**: `admin@admin.local`
   - **Password**: `aa`

## Custom Username

If you want a different username (e.g., "myadmin"):

1. Use email: `myadmin@admin.local`
2. Use name: `myadmin`
3. Update the SQL accordingly

## Verify

Run this to check:

```sql
SELECT id, email, name, is_admin 
FROM public.users 
WHERE email = 'admin@admin.local';
```

You should see `is_admin = true`.

