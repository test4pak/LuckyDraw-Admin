# Installing Netlify Next.js Plugin

## Important: You DON'T Need to Install via UI!

The Next.js plugin is **automatically installed** when specified in `netlify.toml`. You don't need to find or install it in the Netlify UI.

## How It Works

1. **`netlify.toml`** specifies the plugin:
   ```toml
   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

2. **`package.json`** includes it as a devDependency (for local development)

3. **Netlify automatically installs it** during the build process

## What You Need to Do

1. ✅ Make sure `netlify.toml` exists in your repo (it does)
2. ✅ Make sure `package.json` has the plugin (we just added it)
3. ✅ **Clear the Publish directory** in Netlify UI (Site settings → Build & deploy → Build settings)
4. ✅ Push your code and deploy

## If You Still See Issues

If the plugin still doesn't work after clearing the publish directory:

1. Make sure you've pushed the latest code (including `netlify.toml` and updated `package.json`)
2. In Netlify, go to **Site settings** → **Build & deploy** → **Build settings**
3. Make sure **Publish directory** is **EMPTY** (this is critical!)
4. Trigger a new deploy with cache cleared

The plugin will be automatically installed during the build - you'll see it in the build logs.

