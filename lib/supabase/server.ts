// lib/supabase/server.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client factory.
 * Uses a service role key when available, otherwise falls back to anon key.
 * Do NOT expose service role key to the browser.
 */
export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key = serviceRole ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });
}

// Convenience export for code that expects a server client instance
export const supabaseServer = createSupabaseServerClient();