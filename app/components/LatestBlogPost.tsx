import Link from "next/link";
import { getLatestBlogPost } from "@/lib/data/blog";
import { r2 } from "@/lib/r2";

export default async function LatestBlogPost() {
  const post = await getLatestBlogPost();

  if (!post) {
    return (
      <section className="mt-10">
        <h2 className="text-3xl font-semibold">Latest Blog Post</h2>
        <p className="mt-3 text-muted-foreground">Henüz yayınlanmış yazı yok.</p>
      </section>
    );
  }

  const cover = post.cover_path ? r2.blog(post.cover_path) : null;

  return (
    <section className="mt-10">
      <h2 className="text-3xl font-semibold">Latest Blog Post</h2>

      <div className="mt-5 rounded-3xl bg-white/70 shadow-sm border border-black/5 overflow-hidden">
        {cover && (
          <img src={cover} alt={post.title} className="h-56 w-full object-cover" />
        )}

        <div className="p-8">
          <h3 className="text-2xl font-semibold">{post.title}</h3>
          {post.excerpt && <p className="mt-3 text-lg text-muted-foreground">{post.excerpt}</p>}

          <div className="mt-6">
            <Link
              href={`/blog/${post.slug}`}
              className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-white hover:opacity-90"
            >
              Read More →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
