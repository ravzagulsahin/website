import { createClient } from "@supabase/supabase-js";

// Backwards-compatible client used across existing client-side modules.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default supabase;

