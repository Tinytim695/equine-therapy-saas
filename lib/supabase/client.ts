import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client.
 * Uses safe placeholders when env vars are missing so `next build` can
 * prerender client pages without crashing. Real auth still requires
 * NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY on Vercel.
 */
export function createClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://placeholder.supabase.co";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

  return createBrowserClient(url, key);
}
