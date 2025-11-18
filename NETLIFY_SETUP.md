# Netlify Setup for Admin Panel

## Important Configuration Steps

### 1. Install Next.js Plugin
Make sure the **@netlify/plugin-nextjs** plugin is installed in your Netlify site settings:
- Go to your site → **Site settings** → **Build & deploy** → **Plugins**
- If not installed, click **Add plugin** and search for "Next.js"
- Install **@netlify/plugin-nextjs**

### 2. Build Settings
In **Site settings** → **Build & deploy** → **Build settings**:
- **Build command**: `npm run build` (or leave empty, netlify.toml handles it)
- **Publish directory**: Leave empty (Next.js plugin handles this automatically)
- **Node version**: `18` (or higher)

### 3. Environment Variables
Add these in **Site settings** → **Environment variables**:
- `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key

### 4. Deploy
After making changes:
1. Push to GitHub
2. Netlify will auto-deploy, OR
3. Manually trigger deploy from Netlify dashboard

## Troubleshooting "Page Not Found"

If you're still seeing "Page not found":

1. **Check Build Logs**: Go to **Deploys** tab → Click on the latest deploy → Check for errors
2. **Verify Plugin**: Make sure `@netlify/plugin-nextjs` is installed
3. **Clear Cache**: In **Deploys** → **Trigger deploy** → **Clear cache and deploy site**
4. **Check Routes**: Verify that `app/page.tsx`, `app/login/page.tsx`, etc. exist
5. **Verify Build**: The build should complete successfully without errors

## Common Issues

### Issue: Build succeeds but 404 on all pages
**Solution**: Make sure the Next.js plugin is installed and enabled

### Issue: Build fails with "Cannot find module"
**Solution**: Make sure `package.json` has all dependencies and run `npm install` locally to verify

### Issue: Environment variables not working
**Solution**: 
- Make sure variable names are exactly `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Make sure they're set for the correct environment (Production, Deploy previews, Branch deploys)
- Trigger a new deploy after adding variables

