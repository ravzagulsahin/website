import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function ensureAdminHeader(email?: string | null) {
  if (!email) return false;
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from("admins").select("id").eq("email", email).limit(1).maybeSingle();
    if (error || !data) return false;
    return true;
  } catch {
    return false;
  }
}

