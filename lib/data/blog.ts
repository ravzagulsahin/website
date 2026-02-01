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

export type BlogPostWithAuthor = BlogPost & { author_full_name?: string | null };

export async function getBlogPostBySlug(slug: string): Promise<BlogPostWithAuthor | null> {
  const supabase = createSupabaseServerClient();

  const { data: postData, error } = await supabase
    .from("blog_posts")
    .select("id,title,slug,excerpt,cover_path,published,published_at,content")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!postData) return null;

  const post = postData as BlogPost & { author_id?: string | null };
  const authorId = "author_id" in postData ? (postData as { author_id?: string }).author_id : null;

  let authorFullName: string | null = null;

  if (authorId) {
    const { data: author } = await supabase
      .from("admins")
      .select("full_name")
      .eq("id", authorId)
      .single();
    authorFullName = (author as { full_name?: string } | null)?.full_name ?? null;
  }

  if (authorFullName == null) {
    const { data: firstAdmin } = await supabase
      .from("admins")
      .select("full_name")
      .limit(1)
      .maybeSingle();
    authorFullName = (firstAdmin as { full_name?: string } | null)?.full_name ?? "Editör";
  }

  return {
    ...post,
    author_name: authorFullName,
    author_full_name: authorFullName,
  } as BlogPostWithAuthor;
}
