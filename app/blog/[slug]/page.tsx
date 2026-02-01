import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/data/blog";
import { r2 } from "@/lib/r2";

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const post = await getBlogPostBySlug(slug);

  if (!post) return { title: "Yazı Bulunamadı" };

  return {
    title: `${post.title} | Psikoloji Dergisi`,
    description: post.excerpt ?? undefined,
    openGraph: {
      images: post.cover_path ? [r2.blog(post.cover_path)] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) return notFound();

  const cover = post.cover_path ? r2.blog(post.cover_path) : null;
  const authorName = post.author_full_name ?? post.author_name ?? "Editör";
  const publishedAtFormatted = formatDate(post.published_at);

  return (
    <main className="min-h-screen relative">
      {/* Hyperland-style fixed background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundColor: "rgba(243, 234, 203, 0.2)",
          backdropFilter: "blur(40px)",
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-32">
        {/* Blue glassmorphism metadata card */}
        <div
          className="mb-8 rounded-2xl p-6"
          style={{
            background: "rgba(59, 130, 246, 0.1)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(59, 130, 246, 0.15)",
          }}
        >
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-700">
            <span className="font-medium">{authorName}</span>
            {publishedAtFormatted && (
              <>
                <span className="text-zinc-400">•</span>
                <time dateTime={post.published_at ?? undefined}>
                  {publishedAtFormatted}
                </time>
              </>
            )}
          </div>
        </div>

        {/* Main content - white page container */}
        <div
          className="rounded-3xl p-8 md:p-12 shadow-lg"
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
          }}
        >
          {/* Title - font-black */}
          <h1 className="text-4xl md:text-6xl font-black font-serif leading-tight mb-6 text-zinc-900">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-xl text-zinc-500 font-light italic mb-8 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Cover image */}
          {cover && (
            <div className="mb-10 rounded-2xl overflow-hidden shadow-xl">
              <img
                src={cover}
                alt={post.title}
                className="w-full aspect-[21/9] object-cover"
              />
            </div>
          )}

          {/* Article body - prose-lg */}
          <article
            dangerouslySetInnerHTML={{
              __html:
                typeof post.content === "string"
                  ? post.content
                  : (post.content?.raw as string) ?? "",
            }}
            className="prose prose-zinc prose-lg max-w-none
                       prose-headings:font-serif prose-headings:italic
                       prose-p:leading-[1.8] prose-p:text-zinc-800
                       prose-img:rounded-2xl prose-img:shadow-lg"
          />
        </div>
      </div>
    </main>
  );
}
