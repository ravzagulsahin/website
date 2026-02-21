import { createClient } from "@supabase/supabase-js";

/**
 * Browser/client-side Supabase client factory.
 * Use this inside client components only.
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon);
}

// Default export convenience (common import pattern)
export const supabaseBrowser = createSupabaseBrowserClient();

