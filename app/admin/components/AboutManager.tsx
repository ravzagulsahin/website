 "use client";
import { useState, useEffect } from "react";
import { useAdmin } from "@/lib/context/AdminContext";

export default function AboutManager() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, isAdmin, isEditMode } = useAdmin();

  useEffect(() => {
    async function loadAbout() {
      try {
        const res = await fetch("/api/admin/about");
        if (!res.ok) return;
        const data = await res.json();
        if (data?.content) setContent(data.content);
      } catch (e) {
        // ignore
      }
    }
    loadAbout();
  }, []);

  const handleUpdate = async () => {
    if (!isAdmin || !user?.email) {
      alert("Yetersiz yetki.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-email": user.email,
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert("Hata: " + (err?.error ?? "Güncelleme başarısız"));
      } else {
        alert("Hakkımızda yazısı güncellendi!");
      }
    } catch (e: any) {
      alert("Hata: " + e?.message ?? "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 border p-6 rounded-xl bg-white">
      <h2 className="text-xl font-bold text-black">Hakkımızda Yazısını Düzenle</h2>
      <textarea
        className="w-full h-64 p-4 border rounded-lg text-black focus:ring-2 focus:ring-black outline-none"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        onClick={handleUpdate}
        disabled={loading}
        className="bg-black text-white px-6 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
      >
        {loading ? "Güncelleniyor..." : "Yazıyı Kaydet"}
      </button>
    </div>
  );
}
