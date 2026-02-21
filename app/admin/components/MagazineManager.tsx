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
      
      if (!coverFile) throw new Error("Kapak dosyası gerekli");
      if (!pdfFile) throw new Error("PDF dosyası gerekli");

      // Client-side validations
      const maxImageBytes = 5 * 1024 * 1024;
      const maxPdfBytes = 40 * 1024 * 1024;
      if (!coverFile.type.startsWith("image/")) throw new Error("Kapak görüntüsü geçerli bir resim olmalı.");
      if (coverFile.size > maxImageBytes) throw new Error("Kapak 5MB'tan büyük olamaz.");
      if (pdfFile.type !== "application/pdf") throw new Error("Lütfen geçerli bir PDF seçin.");
      if (pdfFile.size > maxPdfBytes) throw new Error("PDF 40MB'tan büyük olamaz.");

      // Upload cover via server endpoint
      const coverBuf = await coverFile.arrayBuffer();
      const coverBase64 = Buffer.from(coverBuf).toString("base64");
      const coverRes = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: `covers/${ts}_${coverFile.name.replace(/\s+/g, "_")}`,
          file: coverBase64,
          contentType: coverFile.type,
          bucket: "magazines",
        }),
      });
      const coverJson = await coverRes.json();
      if (!coverRes.ok) throw new Error(coverJson.error ?? "Kapak yükleme başarısız");

      // Upload PDF via server endpoint
      const pdfBuf = await pdfFile.arrayBuffer();
      const pdfBase64 = Buffer.from(pdfBuf).toString("base64");
      const pdfRes = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: `pdfs/${ts}_${pdfFile.name.replace(/\s+/g, "_")}`,
          file: pdfBase64,
          contentType: pdfFile.type,
          bucket: "magazines",
        }),
      });
      const pdfJson = await pdfRes.json();
      if (!pdfRes.ok) throw new Error(pdfJson.error ?? "PDF yükleme başarısız");

      // 3. DB Kayıt
      const { error: dbErr } = await supabase.from("magazines").insert([{
        title,
        issue_number: issueNumber,
        description,
        cover_image: coverJson.publicUrl,
        pdf_url: pdfJson.publicUrl,
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
