import Link from "next/link";
import { getBlogPosts } from "@/lib/data/blog";
import { r2 } from "@/lib/r2";

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-5xl font-semibold">Blog</h1>

      <div className="mt-10 grid gap-8">
        {posts.map((p) => {
          const cover = p.cover_path ? r2.blog(p.cover_path) : null;

          return (
            <article key={p.id} className="rounded-3xl bg-white/70 border border-black/5 shadow-sm overflow-hidden">
              {cover && <img src={cover} alt={p.title} className="h-64 w-full object-cover" />}

              <div className="p-8">
                <h2 className="text-2xl font-semibold">
                  <Link href={`/blog/${p.slug}`} className="hover:underline">
                    {p.title}
                  </Link>
                </h2>

                {p.excerpt && <p className="mt-3 text-lg text-muted-foreground">{p.excerpt}</p>}

                <div className="mt-6">
                  <Link href={`/blog/${p.slug}`} className="inline-flex items-center font-medium">
                    Oku →
                  </Link>
                </div>
              </div>
            </article>
          );
        })}

        {posts.length === 0 && <p className="text-muted-foreground">Henüz yazı yok.</p>}
      </div>
    </main>
  );
}
