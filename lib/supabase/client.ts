import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During SSR/build, return a mock client that won't throw errors
  // This is a workaround for Next.js trying to pre-render pages
  if (typeof window === 'undefined' || !supabaseUrl || !supabaseAnonKey) {
    const mockClient = {
      from: () => ({
        select: () => ({
          eq: () => ({ data: null, error: null }),
          order: () => ({ data: null, error: null }),
          limit: () => ({ data: null, error: null }),
          single: () => ({ data: null, error: null }),
          maybeSingle: () => ({ data: null, error: null }),
          not: () => ({ data: null, error: null }),
          in: () => ({ data: null, error: null }),
          or: () => ({ data: null, error: null }),
          update: () => ({ data: null, error: null }),
          insert: () => ({ data: null, error: null }),
          delete: () => ({ data: null, error: null }),
        }),
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithOAuth: () => Promise.resolve({ data: null, error: null }),
      },
    } as any;
    return mockClient;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

