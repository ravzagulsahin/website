import { createSupabaseServerClient } from "@/lib/supabase/server";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_path: string | null;
  published: boolean;
  published_at: string | null;
  content: any; // jsonb
  author_name?: string | null;
};

export async function getLatestBlogPost() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,title,slug,excerpt,cover_path,published,published_at")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as BlogPost | null;
}

export async function getLatestBlogPosts(limit: number = 2): Promise<BlogPost[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,title,slug,excerpt,cover_path,published,published_at")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as BlogPost[];
}

export async function getBlogPosts() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,title,slug,excerpt,cover_path,published,published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as BlogPost[];
}

export async function getBlogPostBySlug(slug: string) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,title,slug,excerpt,cover_path,published,published_at,content")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as BlogPost | null;
}
