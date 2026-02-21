import { createSupabaseServerClient } from "@/lib/supabase/server";

// Centralized Type Definitions
export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_path: string | null;
  published: boolean;
  published_at: string | null;
  content: unknown; // jsonb stored as unknown
  author?: { full_name?: string | null } | null;
};

export type BlogPostWithAuthor = BlogPost & { author_name: string };

const BLOG_SELECT_QUERY = `
  id,
  title,
  slug,
  excerpt,
  cover_path,
  published,
  published_at,
  content,
  author:admins (full_name)
`;

function formatAuthorName(post: BlogPost | null): BlogPostWithAuthor | null {
  if (!post) return null;
  const authorName = post.author?.full_name ?? "Editör";
  return {
    ...post,
    author_name: authorName,
  };
}

export async function getLatestBlogPost(): Promise<BlogPostWithAuthor | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(BLOG_SELECT_QUERY)
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Graceful fallback: return null when an error occurs
  if (error || !data) return null;
  return formatAuthorName(data);
}

export async function getLatestBlogPosts(limit: number = 2): Promise<BlogPostWithAuthor[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(BLOG_SELECT_QUERY)
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !Array.isArray(data)) return [];
  return (data as BlogPost[]).map((d) => formatAuthorName(d)).filter((p): p is BlogPostWithAuthor => p !== null);
}

export async function getBlogPosts(): Promise<BlogPostWithAuthor[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(BLOG_SELECT_QUERY)
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error || !Array.isArray(data)) return [];
  return (data as BlogPost[]).map((d) => formatAuthorName(d)).filter((p): p is BlogPostWithAuthor => p !== null);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostWithAuthor | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(BLOG_SELECT_QUERY)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return null;
  return formatAuthorName(data);
}