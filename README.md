# LuckyDraw.pk Admin Panel

A completely separate admin panel application for managing LuckyDraw.pk events and prizes.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run the Development Server

```bash
npm run dev
```

The admin panel will be available at: **http://localhost:3001**

### 4. Build for Production

```bash
npm run build
npm start
```

## 🔐 Admin Access

1. **Create an admin user** in your Supabase database:
   - Go to Supabase Dashboard → Table Editor → `users` table
   - Find your user and set `is_admin = TRUE`

2. **Login** at `/login` with your admin credentials

3. **Access the dashboard** at `/dashboard`

## 📁 Project Structure

```
admin-panel/
├── app/
│   ├── page.tsx          # Root page (redirects to dashboard)
│   ├── login/            # Login page
│   ├── dashboard/        # Main admin dashboard
│   └── unauthorized/     # Access denied page
├── components/
│   ├── ui/               # Reusable UI components
│   ├── admin/            # Admin-specific components
│   └── layout/           # Layout components
├── lib/
│   ├── supabase/         # Supabase client
│   └── utils.ts          # Utility functions
└── hooks/
    └── use-toast.ts      # Toast notification hook
```

## ✨ Features

- ✅ **Separate Application** - Completely independent from main site
- ✅ **Admin Authentication** - Login with email/password
- ✅ **Event Management** - Create, edit, delete events
- ✅ **Prize Management** - Manage prizes for each event
- ✅ **Statistics Dashboard** - View event and participant stats
- ✅ **Dark Theme** - Modern dark UI design
- ✅ **Responsive Design** - Works on all devices

## 🔒 Security

- Only users with `is_admin = TRUE` can access the admin panel
- Database-level security via RLS policies
- Automatic redirect for unauthorized users

## 📝 Notes

- Runs on port **3001** by default (to avoid conflicts with main site on 3000)
- Uses the same Supabase database as the main site
- All admin operations are logged and secured

