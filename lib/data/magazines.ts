import { supabaseServer } from "@/lib/supabaseServer";

export type Magazine = {
  id: string;
  title: string;
  issue_number: string;
  cover_image: string | null;
  pdf_url: string | null;
  created_at: string;
};

export async function getMagazines(): Promise<Magazine[]> {
  const { data, error } = await supabaseServer
    .from("magazines")
    .select("id, title, issue_number, cover_image, pdf_url, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMagazines error:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    issue_number: row.issue_number,
    cover_image: row.cover_image ?? null,
    pdf_url: row.pdf_url ?? null,
    created_at: row.created_at,
  }));
}
