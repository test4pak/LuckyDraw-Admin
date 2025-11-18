# Create Admin Table and User

## Step 1: Run the Migration

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run the migration file: `supabase/migrations/007_create_admin_table.sql`
3. This will:
   - Create the `admin` table with `username`, `password`, and `status` columns
   - Insert a default admin user (username: `admin`, password: `aa`)

## Step 2: Verify Admin User

Run this SQL to check:

```sql
SELECT id, username, status FROM public.admin;
```

You should see:
- username: `admin`
- status: `active`

## Step 3: Login to Admin Panel

1. Go to **http://localhost:3001/login**
2. Login with:
   - **Username**: `admin`
   - **Password**: `aa`

## Add More Admin Users

To add more admin users, run:

```sql
INSERT INTO public.admin (username, password, status)
VALUES ('newadmin', 'password123', 'active');
```

## Update Admin Status

```sql
-- Deactivate an admin
UPDATE public.admin SET status = 'inactive' WHERE username = 'admin';

-- Suspend an admin
UPDATE public.admin SET status = 'suspended' WHERE username = 'admin';

-- Activate an admin
UPDATE public.admin SET status = 'active' WHERE username = 'admin';
```

## Change Password

```sql
UPDATE public.admin 
SET password = 'newpassword' 
WHERE username = 'admin';
```

## Security Note

⚠️ **Important**: Currently passwords are stored in plain text. For production, you should:
1. Hash passwords using bcrypt
2. Update the authentication function to compare hashed passwords
3. Never store plain text passwords in production

