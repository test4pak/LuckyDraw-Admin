# ⚡ Quick Admin Setup (Username + Password)

## Login Credentials
- **Email/Username**: `admin@admin.local`
- **Password**: `aa`

## Setup Steps

### 1. Create User in Supabase Auth

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Enter:
   - **Email**: `admin@admin.local`
   - **Password**: `aa`
   - ✅ **Auto Confirm User**
4. Click **"Create user"**
5. **Copy the User ID** (UUID)

### 2. Run SQL to Make Admin

Go to **SQL Editor** and run (replace `USER_ID_HERE`):

```sql
INSERT INTO public.users (id, email, name, is_admin, created_at, updated_at)
VALUES (
  'USER_ID_HERE',
  'admin@admin.local',
  'Admin',
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET is_admin = TRUE;
```

### 3. Login

Go to **http://localhost:3001/login** and login with:
- Email: `admin@admin.local`
- Password: `aa`

Done! 🎉

