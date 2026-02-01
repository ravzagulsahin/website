"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function MagazineManager() {
  const [title, setTitle] = useState("");
  const [issueNumber, setIssueNumber] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
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
      
      // 1. Kapak Yükle
      const coverPath = `covers/${ts}_${coverFile?.name.replace(/\s+/g, '_')}`;
      const { error: coverErr } = await supabase.storage.from("magazines").upload(coverPath, coverFile!);
      if (coverErr) throw coverErr;
      const { data: cUrl } = supabase.storage.from("magazines").getPublicUrl(coverPath);

      // 2. PDF Yükle
      const pdfPath = `pdfs/${ts}_${pdfFile?.name.replace(/\s+/g, '_')}`;
      const { error: pdfErr } = await supabase.storage.from("magazines").upload(pdfPath, pdfFile!);
      if (pdfErr) throw pdfErr;
      const { data: pUrl } = supabase.storage.from("magazines").getPublicUrl(pdfPath);

      // 3. DB Kayıt
      const { error: dbErr } = await supabase.from("magazines").insert([{
        title,
        issue_number: issueNumber,
        description,
        cover_image: cUrl.publicUrl,
        pdf_url: pUrl.publicUrl,
        published: true
      }]);

      if (dbErr) throw dbErr;
      setSuccess("Dergi başarıyla yüklendi!");
      setTitle("");
      setIssueNumber("");
      setDescription("");
      setCoverFile(null);
      setPdfFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Dergi Yükle</h2>
      <input type="text" placeholder="Dergi Adı" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded text-black" required />
      <input type="text" placeholder="Sayı Numarası (Örn: 2 veya Sayı 2)" value={issueNumber} onChange={e => setIssueNumber(e.target.value)} className="w-full p-2 border rounded text-black" required />
      <textarea placeholder="Açıklama" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded text-black" />
      <div className="text-black">Kapak: <input type="file" onChange={e => setCoverFile(e.target.files![0])} accept="image/*" required /></div>
      <div className="text-black">PDF: <input type="file" onChange={e => setPdfFile(e.target.files![0])} accept="application/pdf" required /></div>
      <button type="submit" disabled={loading} className="bg-black text-white px-6 py-2 rounded w-full">{loading ? "Yükleniyor..." : "Dergi Yükle"}</button>
      {success && <p className="text-green-600 font-bold">{success}</p>}
      {error && <p className="text-red-600 font-bold">{error}</p>}
    </form>
  );
}
