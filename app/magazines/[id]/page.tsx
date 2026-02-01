import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import PdfViewer from "./PdfViewer";
import { ArrowLeft } from "lucide-react";

export default async function MagazineReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("magazines")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return notFound();

  const hasPdf = Boolean(data.pdf_url);

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header with back link */}
        <header className="mb-8">
          <Link
            href="/magazines"
            className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dergilere Dön
          </Link>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-zinc-900 mb-1">
            {data.title}
          </h1>
          {data.issue_number && (
            <p className="text-zinc-500 text-sm uppercase tracking-wider">
              {data.issue_number}
            </p>
          )}
        </header>

        {/* PDF viewer container */}
        <div className="w-full min-h-[600px] bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
          {hasPdf ? (
            <PdfViewer url={data.pdf_url} />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-12 text-center">
              <p className="text-zinc-500 mb-4">Bu sayı için PDF henüz yüklenmemiş.</p>
              <Link
                href="/magazines"
                className="text-zinc-700 underline hover:no-underline font-medium"
              >
                Dergi listesine dön
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
