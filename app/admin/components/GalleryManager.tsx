 "use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAdmin } from "@/lib/context/AdminContext";

type GalleryItem = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  image_path: string;
  order_index: number;
  active: boolean;
};

export default function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [orderIndex, setOrderIndex] = useState<number>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const [status, setStatus] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingImagePath, setExistingImagePath] = useState<string | null>(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  const sanitizeFileName = (name: string) => name.replace(/[^a-z0-9.-]/gi, "_").toLowerCase();

  async function fetchGallery() {
    try {
      const { data, error } = await supabase.from("home_gallery").select("*").order("order_index", { ascending: true });
      if (error) throw error;
      setItems((data as GalleryItem[]) || []);
    } catch (err: any) {
      console.error("fetchGallery:", err);
      setStatus({ type: "error", msg: "Galeri öğeleri alınırken hata oluştu." });
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatus(null);
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
  };

  const { user, isAdmin } = useAdmin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!title.trim()) {
      setStatus({ type: "error", msg: "Lütfen başlık doldurun." });
      return;
    }
    // when creating a new item, image is required. When editing, image is optional.
    if (!editingId && !imageFile) {
      setStatus({ type: "error", msg: "Lütfen görsel seçin." });
      return;
    }

    setLoading(true);

    const imagePath = imageFile ? `gallery/${Date.now()}_${sanitizeFileName(imageFile.name)}` : null;

    try {
      let publicUrl: string | undefined = undefined;
      // If a new image was selected, upload it via admin upload endpoint
      if (imageFile && imagePath) {
        if (!isAdmin || !user?.email) {
          throw new Error("Yetersiz yetki.");
        }
        // convert file to base64
        const toBase64 = (file: File) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              const comma = result.indexOf(",");
              resolve(result.slice(comma + 1));
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

        const base64 = await toBase64(imageFile);
        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-admin-email": user.email,
          },
          body: JSON.stringify({
            filename: imagePath,
            file: base64,
            contentType: imageFile.type,
            bucket: "home_gallery",
          }),
        });
        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err?.error ?? "Upload failed");
        }
        const uploadData = await uploadRes.json();
        publicUrl = uploadData.publicUrl;
      }

      if (editingId) {
        // Update existing item
        const updateData: any = {
          title: title.trim(),
          subtitle: subtitle.trim() || null,
          order_index: orderIndex,
          active,
        };
        if (publicUrl && imagePath) {
          updateData.image_url = publicUrl;
          updateData.image_path = imagePath;
        }
        const galleryRes = await fetch("/api/admin/gallery", {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            "x-admin-email": user?.email ?? "",
          },
          body: JSON.stringify({ id: editingId, ...updateData }),
        });
        if (!galleryRes.ok) {
          // rollback new uploaded image if any
          if (publicUrl && imagePath) {
            await fetch("/api/admin/upload", {
              method: "DELETE",
              headers: { "content-type": "application/json", "x-admin-email": user?.email ?? "" },
              body: JSON.stringify({ bucket: "home_gallery", path: imagePath }),
            }).catch(() => {});
          }
          const err = await galleryRes.json();
          throw new Error(err?.error ?? "DB update failed");
        }
        // if image was replaced, remove the old file via server-side cleanup
        if (publicUrl && existingImagePath) {
          // best-effort: server-side gallery PUT should handle cleanup; optionally call upload delete
        }
      } else {
        // Insert into DB
        const galleryRes = await fetch("/api/admin/gallery", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-admin-email": user?.email ?? "",
          },
          body: JSON.stringify({
            title: title.trim(),
            subtitle: subtitle.trim() || null,
            image_url: publicUrl,
            image_path: imagePath,
            order_index: orderIndex,
            active,
          }),
        });
        if (!galleryRes.ok) {
          if (imagePath) {
            await fetch("/api/admin/upload", {
              method: "DELETE",
              headers: { "content-type": "application/json", "x-admin-email": user?.email ?? "" },
              body: JSON.stringify({ bucket: "home_gallery", path: imagePath }),
            }).catch(() => {});
          }
          const err = await galleryRes.json();
          throw new Error(err?.error ?? "DB insert failed");
        }
      }

      setStatus({ type: "success", msg: "Galeri öğesi başarıyla eklendi." });
      setTitle("");
      setSubtitle("");
      setOrderIndex(0);
      setImageFile(null);
      setActive(true);
      setEditingId(null);
      setExistingImagePath(null);
      fetchGallery();
    } catch (err: any) {
      console.error("handleSubmit:", err);
      setStatus({ type: "error", msg: err.message ?? "Bilinmeyen bir hata oluştu." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!confirm("Bu öğeyi silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    setStatus(null);
    try {
      // Delete from storage first
      const { error: delStorageErr } = await supabase.storage.from("home_gallery").remove([item.image_path]);
      if (delStorageErr) {
        // log but continue to attempt DB delete
        console.warn("Storage delete failed:", delStorageErr);
      }

      // Delete from DB
      const { error: delDbErr } = await supabase.from("home_gallery").delete().eq("id", item.id);
      if (delDbErr) throw delDbErr;

      setStatus({ type: "success", msg: "Öğe silindi." });
      fetchGallery();
    } catch (err: any) {
      console.error("handleDelete:", err);
      setStatus({ type: "error", msg: err.message || "Silme işlemi başarısız." });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setSubtitle(item.subtitle ?? "");
    setOrderIndex(item.order_index ?? 0);
    setActive(item.active ?? true);
    setExistingImagePath(item.image_path ?? null);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Galeri Yönetimi</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
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
            onChange={(e) => setOrderIndex(Number(e.target.value ?? 0))}
            style={{ width: 120, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
            placeholder="0"
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Görsel</label>
          <input type="file" accept="image/*" onChange={handleImageChange} disabled={loading} />
          {previewUrl && (
            <div style={{ marginTop: 8 }}>
              <img src={previewUrl} alt="preview" style={{ width: 160, height: 100, objectFit: "cover", borderRadius: 6 }} />
            </div>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} disabled={loading} />
            <span style={{ fontWeight: 500 }}>Etkin</span>
          </label>
        </div>

        {status && (
          <div style={{ marginBottom: 12, fontWeight: 600, color: status.type === "error" ? "#b00020" : "#166534" }}>
            {status.msg}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button type="submit" disabled={loading} style={{ padding: "10px 16px", borderRadius: 6, background: "#111827", color: "white", border: "none" }}>
            {loading ? "Yükleniyor..." : "Ekle"}
          </button>
        </div>
      </form>

      <hr style={{ marginTop: 20 }} />

      <div style={{ marginTop: 16 }}>
        <h3>Mevcut Galeri Öğeleri</h3>
        {items.length === 0 ? (
          <p style={{ color: "#6b7280" }}>Henüz öğe yok.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((it) => (
              <div key={it.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: 12, borderRadius: 8, border: "1px solid #eee" }}>
                <img src={it.image_url} alt={it.title} style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 6 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{it.title}</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>{it.subtitle}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>Sıra: {it.order_index} • {it.active ? "Aktif" : "Pasif"}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button onClick={() => handleEdit(it)} style={{ background: "none", border: "none", color: "#0ea5a4", cursor: "pointer" }}>
                    Düzenle
                  </button>
                  <button onClick={() => handleDelete(it)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
