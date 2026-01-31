"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function GalleryManager() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [orderIndex, setOrderIndex] = useState<number>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [active, setActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  function sanitizeFileName(name: string) {
    return name.replace(/[^a-z0-9.-]/gi, "_").toLowerCase();
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError("Lütfen başlık doldurun.");
      return;
    }

    if (!imageFile) {
      setError("Lütfen görsel seçin.");
      return;
    }

    setLoading(true);

    try {
      // Upload image
      const ts = Date.now();
      const imageName = `${ts}_${sanitizeFileName(imageFile.name)}`;
      const imagePath = `gallery/${imageName}`;

      const { error: imgErr } = await supabase.storage.from("home_gallery").upload(imagePath, imageFile, { cacheControl: "3600", upsert: false });
      if (imgErr) throw new Error(imgErr.message);

      const { data: imgUrlData } = supabase.storage.from("home_gallery").getPublicUrl(imagePath);
      const imageUrl = (imgUrlData as any).publicUrl;

      // Insert into database
      const { error: dbError } = await supabase.from("home_gallery").insert([
        {
          title: title.trim(),
          subtitle: subtitle.trim() || null,
          image_url: imageUrl,
          image_path: imagePath,
          order_index: orderIndex,
          active: active,
        },
      ]);

      if (dbError) throw new Error(dbError.message);

      setSuccess("Galeri öğesi başarıyla eklendi.");
      setTitle("");
      setSubtitle("");
      setOrderIndex(0);
      setImageFile(null);
      setActive(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err?.message ?? "Bilinmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Galeri Öğesi Ekle</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Başlık</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
            placeholder="Görsel başlığı"
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Alt Başlık (Opsiyonel)</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
            placeholder="Alt başlık"
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Sıra Numarası</label>
          <input
            type="number"
            value={orderIndex}
            onChange={(e) => setOrderIndex(Number(e.target.value))}
            style={{ width: 120, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
            placeholder="0"
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Görsel</label>
          <input type="file" accept="image/*" onChange={handleImageChange} disabled={loading} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              disabled={loading}
            />
            <span style={{ fontWeight: 500 }}>Etkin</span>
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
            Ekle
          </button>

          {loading && <div style={{ color: "#374151", fontWeight: 600 }}>Yükleniyor...</div>}
        </div>
      </form>

      <hr style={{ marginTop: 20 }} />

      <p style={{ marginTop: 12, color: "#6b7280" }}>Not: Görsel `home_gallery` bucket'ına yüklenecek. image_url ve image_path otomatik doldurulacaktır.</p>
    </div>
  );
}
