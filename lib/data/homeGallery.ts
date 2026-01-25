import { createSupabaseServerClient } from "@/lib/supabase/server";

export type HomeSlide = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  image_path: string | null;
  order_index: number | null;
  active: boolean | null;
};

export async function getHomeSlides() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("home_gallery")
    .select("id,title,subtitle,image_url,image_path,order_index,active")
    .eq("active", true)
    .order("order_index", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as HomeSlide[];
}
