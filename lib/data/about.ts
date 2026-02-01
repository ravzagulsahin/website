import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAboutContent() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("about_content")
    .select("content")
    .single();

  if (error) {
    console.error("About content error:", error);
    return "Bilgi yüklenemedi.";
  }
  return data.content;
}
