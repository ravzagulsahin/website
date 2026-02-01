import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/data/blog";

async function getParam<T>(params: Promise<T>) {
  return await params;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await getParam(params);
  console.log("slug:", slug);
  const post = await getBlogPostBySlug(slug);

  if (!post) return notFound();

  const cover = post.cover_path;

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
        {/* JSON.stringify yerine doğrudan içeriği basıyoruz */}
        <p className="whitespace-pre-wrap leading-relaxed">
          {post.content?.raw || post.content}
        </p>
      </article>
    </main>
  );
}
