import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/data/blog";

async function getParam<T>(params: Promise<T>) {
  return await params;
}

export async function generateMetadata({ params }: { params: any }) {
  const { slug } = await getParam(params);
  const post = await getBlogPostBySlug(slug);

  if (!post) return { title: 'Yazı Bulunamadı' };

  return {
    title: `${post.title} | Psikoloji Dergisi`,
    description: post.excerpt,
    openGraph: {
      images: [post.cover_path],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await getParam(params);
  const post = await getBlogPostBySlug(slug);

  if (!post) return notFound();

  const cover = post.cover_path;

  return (
    <main className="min-h-screen bg-white">
      {/* Üst Alan: Başlık ve Özet */}
      <header className="max-w-4xl mx-auto px-6 pt-24 pb-12 text-center">
        <h1 className="text-5xl md:text-7xl font-serif leading-[1.1] mb-8">{post.title}</h1>
        <p className="text-xl text-zinc-500 font-light italic max-w-2xl mx-auto leading-relaxed">
          {post.excerpt}
        </p>
      </header>

      {/* Kapak Resmi */}
      {cover && (
        <div className="max-w-6xl mx-auto px-6 mb-16">
          <img
            src={cover}
            alt={post.title}
            className="w-full aspect-[21/9] object-cover rounded-[2rem] shadow-2xl"
          />
        </div>
      )}

      {/* Makale İçeriği */}
      <article className="max-w-3xl mx-auto px-6 pb-32">
        <div 
          dangerouslySetInnerHTML={{ __html: post.content?.raw || post.content }} 
          className="prose prose-zinc prose-lg lg:prose-xl max-w-none 
                     prose-headings:font-serif prose-headings:italic
                     prose-p:leading-[1.8] prose-p:text-zinc-800
                     prose-img:rounded-2xl prose-img:shadow-lg"
        />
      </article>
    </main>
  );
}
