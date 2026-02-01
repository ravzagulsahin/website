import Link from "next/link";
import { getBlogPosts } from "@/lib/data/blog";
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

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-16">
          <h1 className="text-5xl md:text-7xl font-serif leading-tight mb-4">
            Blog
          </h1>
          <p className="text-lg text-zinc-500 max-w-2xl">
            Psikoloji alanında güncel yazılar, araştırmalar ve makaleler.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => {
            const cover = post.cover_path ? r2.blog(post.cover_path) : null;

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block no-underline text-inherit"
              >
                <article className="h-full">
                  {/* Cover Image - 4:3 Aspect Ratio */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 rounded-xl mb-4">
                    {cover ? (
                      <img
                        src={cover}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-zinc-400 text-xs uppercase tracking-widest">
                        Görsel Yok
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    {/* Date */}
                    {post.published_at && (
                      <time
                        dateTime={post.published_at}
                        className="text-xs text-zinc-500 mb-2 block"
                      >
                        {formatDate(post.published_at)}
                      </time>
                    )}

                    {/* Title */}
                    <h2 className="text-xl font-bold leading-tight mb-2 group-hover:opacity-70 transition-opacity">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-sm text-zinc-600 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-24 text-zinc-500">
            Henüz yayınlanmış yazı bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
}
