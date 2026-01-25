import { supabaseServer } from "@/lib/supabaseServer";

export type Magazine = {
  id: string;
  title: string;
  issue: string;
  coverUrl: string | null;
  pdfPath: string | null;
};

export async function getMagazines(): Promise<Magazine[]> {
  const { data, error } = await supabaseServer
    .from("magazines")
    .select("id, title, issue, cover_url, pdf_path")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMagazines error:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    issue: row.issue,
    coverUrl: row.cover_url ?? null,
    pdfPath: row.pdf_path ?? null,
  }));
}
