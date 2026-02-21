// lib/supabase/server.ts
import { createClient } from "@supabase/supabase-js";

export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  // Server tarafında her istekte yeni bir istemci oluşturulur
  return createClient(url, anon, {
    auth: {
      persistSession: false,
    },
  });
}