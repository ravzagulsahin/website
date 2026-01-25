import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/data/blog";
import { r2 } from "@/lib/r2";

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) return notFound();

  const cover = post.cover_path ? r2.blog(post.cover_path) : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-4xl font-semibold">{post.title}</h1>

      {cover && (
        <img
          src={cover}
          alt={post.title}
          className="mt-8 w-full rounded-3xl object-cover"
        />
      )}

      {post.excerpt && (
        <p className="mt-6 text-lg text-muted-foreground">{post.excerpt}</p>
      )}

      <article className="prose prose-neutral mt-10 max-w-none">
        {/* Şimdilik content jsonb ise ham basmayalım. Geçici: */}
        <pre className="whitespace-pre-wrap rounded-2xl bg-black/5 p-4 text-sm">
          {JSON.stringify(post.content, null, 2)}
        </pre>
      </article>
    </main>
  );
}
