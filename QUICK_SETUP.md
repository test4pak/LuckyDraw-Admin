# ⚡ Quick Setup - Fix Environment Variables Error

## The Error
```
Error: Your project's URL and Key are required to create a Supabase client!
```

## Quick Fix (2 Steps)

### Step 1: Get Your Supabase Credentials

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 2: Create `.env.local` File

Create a file named `.env.local` in the `admin-panel` folder with this content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Replace:**
- `https://your-project-id.supabase.co` with your actual Project URL
- `your-anon-key-here` with your actual anon public key

### Step 3: Restart the Dev Server

After creating the file:
1. Stop the dev server (Ctrl+C)
2. Run `npm run dev` again

## Example `.env.local` File

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example_key_here
```

## ⚠️ Important Notes

- The `.env.local` file should be in the `admin-panel` folder (not the root folder)
- Never commit `.env.local` to git (it's already in `.gitignore`)
- Restart the dev server after creating/modifying `.env.local`

## Still Having Issues?

1. Make sure the file is named exactly `.env.local` (not `.env.local.txt`)
2. Make sure there are no extra spaces or quotes around the values
3. Make sure you're in the `admin-panel` folder when running `npm run dev`
4. Try restarting your terminal/IDE

