import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getParam<T>(params: Promise<T> | T) {
  return params instanceof Promise ? await params : params;
}

export default async function MagazineReadPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await getParam(params);
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("magazines")
    .select("id, title, issue_number, cover_image, pdf_url, published")
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return notFound();

  // Şimdilik PDF görüntüleyiciye girmiyoruz (zaten daha önce react-pdf ile sıkıntı yaşadın)
  // İlk hedef: link çalışsın ve PDF URL görünsün.
  const pdfUrl = data.pdf_url
    ? `https://<SUPABASE_PUBLIC_BUCKET_URL>/${data.pdf_url}`
    : null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-semibold">{data.title}</h1>
      <p className="mt-2 text-muted-foreground">{data.issue_number}</p>

      <div className="mt-8 rounded-3xl bg-white/70 border border-black/5 p-6">
        <div className="text-sm text-muted-foreground">PDF Path</div>
        <div className="mt-2 font-mono text-sm">{data.pdf_url ?? "Yok"}</div>

        {/* PDF url'i sonra düzgün kuracağız */}
        <p className="mt-4 text-muted-foreground">
          Okuyucu ekranını bir sonraki adımda bağlayacağız.
        </p>
      </div>
    </main>
  );
}
