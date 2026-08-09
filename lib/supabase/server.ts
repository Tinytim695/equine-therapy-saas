import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Supabase client.
 * Safe placeholders allow static generation / prerender when env is
 * not injected at build time (e.g. first Vercel deploy before secrets).
 */
export async function createClient() {
  const cookieStore = await cookies();
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://placeholder.supabase.co";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }[]
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as never)
          );
        } catch {
          // Called from a Server Component — middleware refreshes sessions.
        }
      },
    },
  });
}
