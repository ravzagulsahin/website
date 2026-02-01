"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AboutManager() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAbout() {
      const { data } = await supabase.from("about_content").select("content").single();
      if (data) setContent(data.content);
    }
    loadAbout();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("about_content")
      .update({ content })
      .match({ id: (await supabase.from("about_content").select("id").single()).data?.id });

    if (error) alert("Hata: " + error.message);
    else alert("Hakkımızda yazısı güncellendi!");
    setLoading(false);
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
