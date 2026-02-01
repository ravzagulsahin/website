"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function BlogManager() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);

  const fetchPosts = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    if (data) setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const ts = Date.now();
      const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
      const coverPath = `${ts}_${coverFile?.name.replace(/\s+/g, '_')}`;
      
      const { error: upErr } = await supabase.storage.from("blog_images").upload(coverPath, coverFile!);
      if (upErr) throw upErr;
      
      const { data: urlData } = supabase.storage.from("blog_images").getPublicUrl(coverPath);

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
      fetchPosts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu yazıyı silmek istediğine emin misin?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (!error) {
      setSuccess("Yazı silindi!");
      fetchPosts();
    }
  };

  return (
    <div className="space-y-6">
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

      <div className="border-t pt-6">
        <h3 className="text-xl font-bold mb-4">Mevcut Yazılar</h3>
        <div className="space-y-2">
          {posts.length === 0 ? (
            <p className="text-zinc-400">Henüz yazı yok</p>
          ) : (
            posts.map(p => (
              <div key={p.id} className="flex justify-between items-center p-3 bg-white border rounded text-black hover:bg-zinc-50">
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-zinc-500">{p.slug}</p>
                </div>
                <button onClick={() => handleDelete(p.id)} className="text-red-500 text-sm hover:text-red-700 font-bold">Sil</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
