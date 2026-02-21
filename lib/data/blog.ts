import { createSupabaseServerClient } from "@/lib/supabase/server";

// Merkezi Tip Tanımları
export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_path: string | null;
  published: boolean;
  published_at: string | null;
  content: any; // jsonb
  // İlişkisel veri için author objesi ekliyoruz
  author?: {
    full_name: string;
  } | null;
};

// Yazar bilgisiyle birlikte dönen tip (UI tarafında kolaylık için)
export type BlogPostWithAuthor = BlogPost & { author_name: string };

/**
 * İlişkisel sorgu için kullanılan ortak sütun seçimi
 */
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

export async function getLatestBlogPost(): Promise<BlogPostWithAuthor | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(BLOG_SELECT_QUERY)
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
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

  if (error) throw new Error(error.message);
  return (data ?? []).map(formatAuthorName) as BlogPostWithAuthor[];
}

export async function getBlogPosts(): Promise<BlogPostWithAuthor[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(BLOG_SELECT_QUERY)
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(formatAuthorName) as BlogPostWithAuthor[];
}

/**
 * Slug üzerinden tekil yazı getiren ve ilişkisel yazar verisini işleyen ana fonksiyon
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPostWithAuthor | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(BLOG_SELECT_QUERY)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return formatAuthorName(data);
}

/**
 * Helper: Gelen verideki ilişkisel 'author' objesini 'author_name' string'ine dönüştürür
 * Eski koddaki fallback (Editör) mantığını da burada koruyoruz.
 */
function formatAuthorName(post: any): BlogPostWithAuthor | null {
  if (!post) return null;
  
  return {
    ...post,
    author_name: post.author?.full_name ?? "Editör"
  };
}