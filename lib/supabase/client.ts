import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please create a .env.local file in the admin-panel folder with:\n" +
      "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url\n" +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key\n\n" +
      "Get these from: https://supabase.com/dashboard/project/_/settings/api"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

