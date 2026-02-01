import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import PdfViewer from "./PdfViewer";

export default async function MagazineReadPage({ params }: { params: any }) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("magazines")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-4xl font-serif mb-2">{data.title}</h1>
      <p className="opacity-50 mb-8">{data.issue_number}</p>
      
      <div className="w-full min-h-[800px] border rounded-3xl overflow-hidden shadow-xl">
        {data.pdf_url ? (
          <PdfViewer url={data.pdf_url} />
        ) : (
          <div className="p-12 text-center">PDF Bulunamadı.</div>
        )}
      </div>
    </main>
  );
}
