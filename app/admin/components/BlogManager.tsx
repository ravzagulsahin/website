"use client";
import React, { useState, useEffect } from "react";
import TiptapEditor from "./TiptapEditor";
export default function BlogManager() {
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [existingCover, setExistingCover] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<{ id: string; title: string; excerpt?: string; content?: { raw?: string }; cover_path?: string; slug?: string }[]>([]);

  // Centralized API endpoints are used instead of direct supabase usage from the client.
  const fetchPosts = async () => {
    const res = await fetch("/api/admin/blogs");
    if (!res.ok) return setPosts([]);
    const data = await res.json();
    setPosts(data ?? []);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Düzenleme modunu açar
  const handleEdit = (post: { id: string; title: string; excerpt?: string; content?: { raw?: string }; cover_path?: string }) => {
    setEditingId(post.id);
    setTitle(post.title);
    setExcerpt(post.excerpt ?? "");
    setContent(post.content?.raw || (typeof post.content === "string" ? post.content : "") || "");
    setExistingCover(post.cover_path ?? null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Formu temizle
  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setExcerpt("");
    setContent("");
    setCoverFile(null);
    setExistingCover(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let coverUrl = existingCover;

      // Eğer yeni kapak seçilmişse, önce API üzerinden yükle ve public URL al
      if (coverFile) {
        // Client-side basic validation
        const maxImageBytes = 5 * 1024 * 1024;
        if (!coverFile.type.startsWith("image/")) throw new Error("Kapak görseli geçerli bir resim olmalı.");
        if (coverFile.size > maxImageBytes) throw new Error("Kapak görseli 5MB'tan büyük olamaz.");

        const buf = await coverFile.arrayBuffer();
        const base64 = Buffer.from(buf).toString("base64");
        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: `covers/${Date.now()}_${coverFile.name.replace(/\s+/g, "_")}`,
            file: base64,
            contentType: coverFile.type,
            bucket: "blog_images",
          }),
        });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadJson.error ?? "Kapak yükleme hatası");
        coverUrl = uploadJson.publicUrl ?? coverUrl;
      }

      const blogData = {
        title,
        excerpt,
        content: { raw: content },
        cover_path: coverUrl,
        slug: title.toLowerCase().replace(/ /g, "-").replace(/[^\\w-]+/g, ""),
      };

      if (editingId) {
        await fetch(`/api/admin/blogs`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...blogData }),
        });
      } else {
        await fetch(`/api/admin/blogs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...blogData, published: true, published_at: new Date().toISOString() }),
        });
      }

      resetForm();
      fetchPosts();
      alert("Başarıyla kaydedildi!");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu yazıyı silmek istediğine emin misin?")) return;
    const res = await fetch(`/api/admin/blogs`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      fetchPosts();
      alert("Yazı silindi!");
    } else {
      alert("Silme işlemi başarısız.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* SOL: FORM */}
      <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6 bg-white p-8 rounded-2xl border shadow-sm">
        <h2 className="text-2xl font-serif italic">{editingId ? 'Yazıyı Düzenle' : 'Yeni Yazı Oluştur'}</h2>
        
        <input 
          type="text" 
          placeholder="Başlık" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          className="w-full text-3xl font-serif border-b py-2 focus:outline-none focus:border-black text-black" 
          required 
        />
        
        <textarea 
          placeholder="Kısa özet..." 
          value={excerpt} 
          onChange={e => setExcerpt(e.target.value)} 
          className="w-full p-3 border rounded-xl text-sm text-black" 
          rows={2} 
          required 
        />
        
        <TiptapEditor content={content} onChange={setContent} key={editingId || 'new'} />

        <div className="flex items-center justify-between border-t pt-6">
          <div className="flex items-center gap-4">
            <input type="file" onChange={e => setCoverFile(e.target.files?.[0] || null)} accept="image/*" />
            {existingCover && !coverFile && (
              <span className="text-xs text-zinc-500">Mevcut kapak kullanılacak</span>
            )}
          </div>
          <div className="space-x-4">
            {editingId && (
              <button type="button" onClick={resetForm} className="text-zinc-400 underline hover:text-zinc-600">
                İptal
              </button>
            )}
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-black text-white px-10 py-3 rounded-full hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              {loading ? 'Yükleniyor...' : editingId ? 'Güncelle' : 'Yayınla'}
            </button>
          </div>
        </div>
      </form>

      {/* SAĞ: LİSTE */}
      <div className="lg:col-span-4 space-y-4">
        <h3 className="font-bold text-zinc-400 uppercase text-xs tracking-widest">Mevcut Yazılar</h3>
        {posts.length === 0 ? (
          <p className="text-zinc-400 text-sm">Henüz yazı yok</p>
        ) : (
          posts.map(p => (
            <div key={p.id} className="p-4 bg-zinc-50 rounded-xl border group hover:bg-zinc-100 transition-colors">
              <h4 className="font-medium text-sm mb-1 text-black">{p.title}</h4>
              <p className="text-xs text-zinc-500 mb-3">{p.slug}</p>
              <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(p)} className="text-blue-600 text-xs font-bold hover:underline">
                  DÜZENLE
                </button>
                <button onClick={() => handleDelete(p.id)} className="text-red-500 text-xs font-bold hover:underline">
                  SİL
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
