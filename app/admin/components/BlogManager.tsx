"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function BlogManager() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [published, setPublished] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  function sanitizeFileName(name: string) {
    return name.replace(/[^a-z0-9.-]/gi, "_").toLowerCase();
  }

  function titleToSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0] ?? null;
    setCoverFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      setError("Lütfen başlık, özet ve içeriği doldurun.");
      return;
    }

    if (!coverFile) {
      setError("Lütfen kapak görseli seçin.");
      return;
    }

    setLoading(true);

    try {
      const slug = titleToSlug(title);

      // Upload cover image
      const ts = Date.now();
      const coverName = `${ts}_${sanitizeFileName(coverFile.name)}`;
      const coverPath = `covers/${coverName}`;

      const { error: coverErr } = await supabase.storage.from("blog_images").upload(coverPath, coverFile, { cacheControl: "3600", upsert: false });
      if (coverErr) throw new Error(coverErr.message);

      // Insert into database
      const { error: dbError } = await supabase.from("blog_posts").insert([
        {
          title: title.trim(),
          slug,
          excerpt: excerpt.trim(),
          content: { raw: content.trim() },
          cover_path: coverPath,
          published: published,
          published_at: published ? new Date().toISOString() : null,
        },
      ]);

      if (dbError) throw new Error(dbError.message);

      setSuccess("Blog yazısı başarıyla oluşturuldu.");
      setTitle("");
      setExcerpt("");
      setContent("");
      setCoverFile(null);
      setPublished(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err?.message ?? "Bilinmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Blog Yazısı Oluştur</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Başlık</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
            placeholder="Blog başlığı"
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Kısa Özet</label>
          <input
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
            placeholder="Yazının kısa özeti"
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>İçerik</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc", minHeight: 200, fontFamily: "monospace", fontSize: 13 }}
            placeholder="Blog içeriği"
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Kapak Görseli</label>
          <input type="file" accept="image/*" onChange={handleCoverChange} disabled={loading} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              disabled={loading}
            />
            <span style={{ fontWeight: 500 }}>Yayınla</span>
          </label>
        </div>

        {error && <div style={{ color: "#b00020", marginBottom: 12, fontWeight: 600 }}>{error}</div>}

        {success && <div style={{ color: "#166534", marginBottom: 12, fontWeight: 600 }}>{success}</div>}

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "10px 16px", borderRadius: 6, background: "#111827", color: "white", border: "none" }}
          >
            Oluştur
          </button>

          {loading && <div style={{ color: "#374151", fontWeight: 600 }}>Yükleniyor...</div>}
        </div>
      </form>

      <hr style={{ marginTop: 20 }} />

      <p style={{ marginTop: 12, color: "#6b7280" }}>Not: Görsel `blog_images` bucket'ına yüklenecek ve slug başlıktan otomatik oluşturulacaktır. published_at alanı otomatik doldurulur.</p>
    </div>
  );
}
