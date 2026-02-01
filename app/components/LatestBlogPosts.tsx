import Link from "next/link";
import { getLatestBlogPosts } from "@/lib/data/blog";
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

export default async function LatestBlogPosts() {
  const posts = await getLatestBlogPosts(2);

  if (posts.length === 0) {
    return (
      <section className="py-16">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl font-serif italic">Son Yazılar</h2>
          <Link
            href="/blog"
            className="text-xs uppercase tracking-widest hover:opacity-50 transition-opacity"
          >
            Hepsini Gör →
          </Link>
        </div>
        <p className="text-zinc-500">Henüz yayınlanmış yazı yok.</p>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="flex justify-between items-end mb-12">
        <h2 className="text-3xl font-serif italic">Son Yazılar</h2>
        <Link
          href="/blog"
          className="text-xs uppercase tracking-widest hover:opacity-50 transition-opacity"
        >
          Hepsini Gör →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post) => {
          const cover = post.cover_path ? r2.blog(post.cover_path) : null;

          return (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block no-underline text-inherit"
            >
              <article className="overflow-hidden">
                {/* Cover Image - 4:3 Aspect Ratio */}
                <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 rounded-lg">
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
                <div className="mt-5">
                  {/* Author & Date */}
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
                    <span className="font-medium">
                      {post.author_name || "Editör"}
                    </span>
                    {post.published_at && (
                      <>
                        <span>•</span>
                        <time dateTime={post.published_at}>
                          {formatDate(post.published_at)}
                        </time>
                      </>
                    )}
                  </div>

                  {/* Title - Bold */}
                  <h3 className="text-xl font-bold leading-tight mb-2 group-hover:opacity-70 transition-opacity">
                    {post.title}
                  </h3>

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
    </section>
  );
}
