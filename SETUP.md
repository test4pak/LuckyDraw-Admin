# Admin Panel Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd admin-panel
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the `admin-panel` folder:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Get these values from:**
- Supabase Dashboard → Project Settings → API
- Copy the "Project URL" and "anon public" key

### 3. Run the Development Server

```bash
npm run dev
```

The admin panel will be available at: **http://localhost:3001**

### 4. Create Admin User

Before you can login, you need to create an admin user:

1. **Create a user account** in Supabase (via your main site registration or directly in Supabase Auth)
2. **Set admin flag** in Supabase Dashboard:
   - Go to **Table Editor** → `users` table
   - Find your user
   - Set `is_admin = TRUE`
   - Save

### 5. Login

1. Go to **http://localhost:3001/login**
2. Enter your email and password
3. You'll be redirected to the dashboard if you're an admin

## 📁 Project Structure

```
admin-panel/
├── app/
│   ├── page.tsx              # Root (redirects to dashboard)
│   ├── login/                # Login page
│   ├── dashboard/            # Main admin dashboard
│   └── unauthorized/         # Access denied page
├── components/
│   ├── ui/                   # Reusable UI components
│   ├── admin/                # Admin-specific components
│   └── layout/               # Layout components
├── lib/
│   ├── supabase/             # Supabase client
│   └── utils.ts              # Utility functions
└── hooks/
    └── use-toast.ts          # Toast notifications
```

## 🔒 Security

- ✅ Admin-only access (checks `is_admin` flag)
- ✅ Database-level security via RLS policies
- ✅ Automatic redirect for unauthorized users
- ✅ Separate authentication from main site

## 🎨 Features

- **Event Management**: Create, edit, delete events
- **Prize Management**: Manage prizes for each event
- **Statistics Dashboard**: View event and participant stats
- **Dark Theme**: Modern dark UI design
- **Responsive**: Works on all devices

## 🚢 Production Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to Vercel, Netlify, or your preferred hosting

3. Set environment variables in your hosting platform

4. The admin panel runs independently on its own domain/subdomain

## 📝 Notes

- Runs on port **3001** by default (to avoid conflicts with main site on 3000)
- Uses the same Supabase database as the main site
- All admin operations are secured with RLS policies
- Make sure to run the migration `005_add_admin_role.sql` in Supabase

