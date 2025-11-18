# Fix: Publish Directory Error

## Error Message
```
Error: Your publish directory cannot be the same as the base directory of your site.
```

## Solution

The Next.js plugin (`@netlify/plugin-nextjs`) automatically handles the publish directory. You **MUST** remove any publish directory setting from Netlify's UI.

### Steps to Fix:

1. Go to your Netlify site dashboard
2. Click **Site settings**
3. Go to **Build & deploy** → **Build settings**
4. Find the **Publish directory** field
5. **DELETE** any value in that field (make it completely empty)
6. Click **Save**
7. Go to **Deploys** tab
8. Click **Trigger deploy** → **Clear cache and deploy site**

### Why This Happens

The Next.js plugin needs to control where files are published. If you set a publish directory manually in the UI, it conflicts with the plugin's automatic handling.

### After Fixing

Once you've cleared the publish directory setting and redeployed, the build should succeed and your admin panel should work correctly.

