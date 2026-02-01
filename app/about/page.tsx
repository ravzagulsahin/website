import { getAboutContent } from "@/lib/data/about";

export default async function AboutPage() {
  const content = await getAboutContent();

  return (
    <main className="max-w-3xl mx-auto px-6 py-24">
      <h1 className="text-5xl font-serif italic mb-12">Hakkımızda</h1>
      <div className="prose prose-zinc leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </main>
  );
}
