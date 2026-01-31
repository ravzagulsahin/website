"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function MagazineManager() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB

  function sanitizeFileName(name: string) {
    return name.replace(/[^a-z0-9.-]/gi, "_").toLowerCase();
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_PDF_SIZE) {
      setPdfFile(null);
      setError("PDF dosyası 50MB'dan büyük olamaz.");
      return;
    }
    setPdfFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim() || !description.trim()) {
      setError("Lütfen başlık ve açıklamayı doldurun.");
      return;
    }

    if (!imageFile) {
      setError("Lütfen kapak görseli seçin.");
      return;
    }

    if (!pdfFile) {
      setError("Lütfen PDF dosyasını seçin.");
      return;
    }

    if (pdfFile.size > MAX_PDF_SIZE) {
      setError("PDF dosyası 50MB'dan büyük olamaz.");
      return;
    }

    setLoading(true);

    try {
      const ts = Date.now();
      
      // Upload image
      const imageName = `${ts}_${sanitizeFileName(imageFile.name)}`;
      const imagePath = `covers/${imageName}`;
      const { error: imageErr } = await supabase.storage.from("magazines").upload(imagePath, imageFile, { cacheControl: "3600", upsert: false });
      if (imageErr) throw new Error(imageErr.message);

      const { data: imageUrlData } = supabase.storage.from("magazines").getPublicUrl(imagePath);
      const imageUrl = (imageUrlData as any).publicUrl;

      // Upload PDF
      const pdfName = `${ts}_${sanitizeFileName(pdfFile.name)}`;
      const pdfPath = `pdfs/${pdfName}`;
      const { error: pdfErr } = await supabase.storage.from("magazines").upload(pdfPath, pdfFile, { cacheControl: "3600", upsert: false });
      if (pdfErr) throw new Error(pdfErr.message);

      const { data: pdfUrlData } = supabase.storage.from("magazines").getPublicUrl(pdfPath);
      const pdfUrl = (pdfUrlData as any).publicUrl;

      // Insert into database
      const { error: dbError } = await supabase.from("magazines").insert([
        {
          title: title.trim(),
          description: description.trim(),
          image_url: imageUrl,
          pdf_url: pdfUrl,
          is_featured: isFeatured,
          published: published,
        },
      ]);

      if (dbError) throw new Error(dbError.message);

      setSuccess("Dergi başarıyla oluşturuldu.");
      setTitle("");
      setDescription("");
      setImageFile(null);
      setPdfFile(null);
      setIsFeatured(false);
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
      <h2 style={{ marginTop: 0 }}>Dergi Yükle</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Başlık</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
            placeholder="Dergi başlığı"
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Açıklama</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc", minHeight: 80 }}
            placeholder="Dergi açıklaması"
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Kapak Görseli</label>
          <input type="file" accept="image/*" onChange={handleImageChange} disabled={loading} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>PDF Dosyası</label>
          <input type="file" accept="application/pdf" onChange={handlePdfChange} disabled={loading} />
          <div style={{ marginTop: 6, fontSize: 13, color: "#666" }}>Maksimum 50MB</div>
        </div>

        <div style={{ marginBottom: 12, display: "flex", gap: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              disabled={loading}
            />
            <span style={{ fontWeight: 500 }}>Öne Çıkar</span>
          </label>
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
            Yükle
          </button>

          {loading && <div style={{ color: "#374151", fontWeight: 600 }}>Yükleniyor...</div>}
        </div>
      </form>

      <hr style={{ marginTop: 20 }} />

      <p style={{ marginTop: 12, color: "#6b7280" }}>Not: Dosyalar `magazines` bucket'ına yüklenecek ve URL'ler veritabanına kaydedilecek.</p>
    </div>
  );
}
