# Enable Realtime for User Entries

The admin panel uses Supabase Realtime to automatically update the user entries table when new registrations are made. To enable this feature, you need to enable Realtime replication for the `facebook_logins` table in Supabase.

## Method 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard

2. **Open Database Settings**
   - Click on **Database** in the left sidebar
   - Click on **Replication** (or **Realtime** in some versions)

3. **Enable Realtime for facebook_logins table**
   - Find the `facebook_logins` table in the list
   - Toggle the switch to **enable** replication for this table
   - The switch should turn green/blue when enabled

4. **Verify it's working**
   - Go back to your admin panel
   - You should see a green "Live" indicator next to "User Entries" title
   - Open the browser console (F12) and look for: `✅ Successfully subscribed to realtime updates`

## Method 2: Using SQL (Alternative)

If you prefer using SQL, you can run this in the Supabase SQL Editor:

```sql
-- Enable Realtime publication for facebook_logins table
ALTER PUBLICATION supabase_realtime ADD TABLE public.facebook_logins;
```

**Note:** This method may not work if you don't have the necessary permissions or if the publication doesn't exist. Method 1 (Dashboard) is more reliable.

## Troubleshooting

### Status shows "Offline" or "Error"

1. **Check if Realtime is enabled:**
   - Go to Database > Replication in Supabase Dashboard
   - Make sure `facebook_logins` table has replication enabled

2. **Check browser console:**
   - Open Developer Tools (F12)
   - Look for error messages related to Realtime subscription
   - Common errors:
     - `CHANNEL_ERROR`: Realtime is not enabled for the table
     - `TIMED_OUT`: Network connection issue
     - `CLOSED`: Subscription was closed

3. **Check Supabase project settings:**
   - Make sure your Supabase project has Realtime enabled
   - Some free tier projects may have Realtime disabled

4. **Verify environment variables:**
   - Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
   - These should be in your `.env.local` file

### Realtime works but updates don't appear

- Make sure you're on **page 1** of the user entries table
- New entries will only auto-refresh if you're viewing the first page
- If you're on another page, the total count will update, but you'll need to go to page 1 to see new entries

## Testing Realtime

1. Open the admin panel in one browser tab
2. Open your website in another tab
3. Complete a registration on the website
4. The admin panel should automatically show the new entry without refreshing (if you're on page 1)

## Status Indicators

- **🟢 Live**: Realtime is connected and working
- **🟡 Connecting...**: Attempting to connect to Realtime
- **🔴 Offline**: Realtime connection failed or is disabled

