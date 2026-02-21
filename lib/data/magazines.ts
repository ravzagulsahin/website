import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Magazine = {
  id: string;
  title: string;
  pdf_url: string | null;
  cover_path: string | null;
  description: string | null;
  publish_date: string | null;
};

function safeString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function safeNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return String(value);
}

export async function getMagazines(): Promise<Magazine[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("magazines")
    .select("id, title, pdf_url, cover_path, description, publish_date")
    .eq("published", true)
    .order("publish_date", { ascending: false });

  // Graceful fallback: return empty list on error or unexpected shape.
  if (error || !Array.isArray(data)) {
    return [];
  }

  const rows = data as Array<Record<string, unknown>>;

  return rows
    .map((row) => {
      const id = safeString(row.id);
      const title = safeString(row.title);
      if (!id || !title) return null;

      const magazine: Magazine = {
        id,
        title,
        pdf_url: safeNullableString(row.pdf_url),
        cover_path: safeNullableString(row.cover_path),
        description: safeNullableString(row.description),
        publish_date: safeNullableString(row.publish_date),
      };
      return magazine;
    })
    .filter((m): m is Magazine => m !== null);
}
