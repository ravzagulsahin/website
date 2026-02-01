"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function BlogManager() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const ts = Date.now();
      const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
      const coverPath = `${ts}_${coverFile?.name.replace(/\s+/g, '_')}`;
      
      // 1. Görseli Yükle
      const { error: upErr } = await supabase.storage.from("blog_images").upload(coverPath, coverFile!);
      if (upErr) throw upErr;
      
      // 2. Tam URL'i Al
      const { data: urlData } = supabase.storage.from("blog_images").getPublicUrl(coverPath);

      // 3. DB'ye Kaydet
      const { error: dbErr } = await supabase.from("blog_posts").insert([{
        title,
        slug,
        excerpt,
        content: { raw: content },
        cover_path: urlData.publicUrl, 
        published: true,
        published_at: new Date().toISOString()
      }]);

      if (dbErr) throw dbErr;
      setSuccess("Blog başarıyla yayınlandı!");
      setTitle("");
      setExcerpt("");
      setContent("");
      setCoverFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Blog Yazısı Oluştur</h2>
      <input type="text" placeholder="Başlık" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded text-black" required />
      <input type="text" placeholder="Kısa Özet" value={excerpt} onChange={e => setExcerpt(e.target.value)} className="w-full p-2 border rounded text-black" required />
      <textarea placeholder="İçerik..." value={content} onChange={e => setContent(e.target.value)} className="w-full p-2 border rounded h-40 text-black" required />
      <div className="text-black">Kapak: <input type="file" onChange={e => setCoverFile(e.target.files![0])} accept="image/*" required /></div>
      <button type="submit" disabled={loading} className="bg-black text-white px-6 py-2 rounded w-full">{loading ? "Yayınlanıyor..." : "Blog Yayınla"}</button>
      {success && <p className="text-green-600 font-bold">{success}</p>}
      {error && <p className="text-red-600 font-bold">{error}</p>}
    </form>
  );
}
