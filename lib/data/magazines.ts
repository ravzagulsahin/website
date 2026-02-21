import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Magazine = {
  id: string;
  title: string;
  pdf_url: string | null;
  cover_path: string | null;
  description: string | null;
  publish_date: string | null;
};

export async function getMagazines(): Promise<Magazine[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("magazines")
    .select("id, title, pdf_url, cover_path, description, publish_date")
    .eq("published", true)
    .order("publish_date", { ascending: false });

  if (error) {
    console.error("getMagazines error:", error);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    title: row.title,
    pdf_url: row.pdf_url ?? null,
    cover_path: row.cover_path ?? null,
    description: row.description ?? null,
    publish_date: row.publish_date ?? null,
  }));
}
