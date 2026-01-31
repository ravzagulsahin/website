"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminPage() {
  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Upload
  const [title, setTitle] = useState("");
  const [issueNumber, setIssueNumber] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB

  // Oturum durumunu kontrol et ve Magic Link giriş yapan kullanıcıları tanı
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Kullanıcı varsa admin tablosunda mı kontrol et
        const isAdminUser = await verifyAdmin(session.user.email!);
        if (isAdminUser) {
          setIsLoggedIn(true);
          setIsAdmin(true);
          setUserEmail(session.user.email!);
        }
      }
    };

    checkSession();

    // Oturum durumunu canlı olarak dinle (Giriş yapınca anında formu değiştirir)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkSession();
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserEmail(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  function sanitizeFileName(name: string) {
    return name.replace(/[^a-z0-9.-]/gi, "_").toLowerCase();
  }

  const verifyAdmin = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("email")
        .eq("email", email)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      // First verify if this email is in the admins list
      const ok = await verifyAdmin(loginEmail);
      if (!ok) {
        setLoginError("Bu mail adresi admin olarak kayıtlı değil.");
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserEmail(null);
        setLoginLoading(false);
        return;
      }

      // Send OTP to the email
      const { error } = await supabase.auth.signInWithOtp({
        email: loginEmail,
        options: {
          emailRedirectTo: window.location.origin + "/admin",
        },
      });

      if (error) throw error;

      alert("Mailine giriş kodu gönderildi! Lütfen mailini kontrol et.");
      setLoginEmail("");
      setLoginPassword("");
    } catch (err: any) {
      console.error(err);
      setLoginError(err?.message ?? "Giriş kodu gönderilemedi.");
      setIsLoggedIn(false);
      setIsAdmin(false);
      setUserEmail(null);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserEmail(null);
    setLoginError(null);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0] ?? null;
    setCoverFile(file);
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

    if (!title.trim() || !issueNumber.trim() || !coverFile || !pdfFile) {
      setError("Lütfen tüm alanları doldurun ve dosyaları seçin.");
      return;
    }

    if (pdfFile.size > MAX_PDF_SIZE) {
      setError("PDF dosyası 50MB'dan büyük olamaz.");
      return;
    }

    setLoading(true);

    try {
      const ts = Date.now();
      const coverName = `${ts}_${sanitizeFileName(coverFile.name)}`;
      const pdfName = `${ts}_${sanitizeFileName(pdfFile.name)}`;

      const coverPath = `covers/${coverName}`;
      const { error: coverErr } = await supabase.storage.from("magazines").upload(coverPath, coverFile, { cacheControl: "3600", upsert: false });
      if (coverErr) throw new Error(coverErr.message);

      const pdfPath = `pdfs/${pdfName}`;
      const { error: pdfErr } = await supabase.storage.from("magazines").upload(pdfPath, pdfFile, { cacheControl: "3600", upsert: false });
      if (pdfErr) throw new Error(pdfErr.message);

      const { data: coverUrlData } = supabase.storage.from("magazines").getPublicUrl(coverPath);
      const coverUrl = (coverUrlData as any).publicUrl;

      const { data: pdfUrlData } = supabase.storage.from("magazines").getPublicUrl(pdfPath);
      const pdfUrl = (pdfUrlData as any).publicUrl;

      const { error: dbError } = await supabase.from("magazines").insert([
        {
          title: title.trim(),
          issue_number: Number(issueNumber),
          cover_image: coverUrl,
          pdf_url: pdfUrl,
        },
      ]);

      if (dbError) throw new Error(dbError.message);

      setSuccess("Dergi başarıyla yüklendi.");
      setTitle("");
      setIssueNumber("");
      setCoverFile(null);
      setPdfFile(null);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err?.message ?? "Bilinmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: "40px auto", padding: 24, border: "1px solid #e6e6e6", borderRadius: 8 }}>
      <h1 style={{ marginBottom: 12 }}>Admin Paneli</h1>

      {!isLoggedIn || !isAdmin ? (
        <div style={{ maxWidth: 420 }}>
          <h2 style={{ marginTop: 0 }}>Giriş Yap</h2>
          <form onSubmit={handleSignIn}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
                placeholder="you@example.com"
                disabled={loginLoading}
              />
            </div>

            {loginError && <div style={{ color: "#b00020", marginBottom: 12, fontWeight: 600 }}>{loginError}</div>}

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button
                type="submit"
                disabled={loginLoading}
                style={{ padding: "10px 16px", borderRadius: 6, background: "#111827", color: "white", border: "none" }}
              >
                Giriş Yap
              </button>

              {loginLoading && <div style={{ color: "#374151", fontWeight: 600 }}>Yükleniyor...</div>}
            </div>
          </form>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div style={{ fontSize: 14, color: "#6b7280" }}>{userEmail}</div>
            <button onClick={handleSignOut} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", background: "white" }}>
              Çıkış
            </button>
          </div>

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
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Sayı Numarası</label>
              <input
                type="number"
                value={issueNumber}
                onChange={(e) => setIssueNumber(e.target.value)}
                required
                style={{ width: 180, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
                placeholder="1"
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Kapak Görseli</label>
              <input type="file" accept="image/*" onChange={handleCoverChange} disabled={loading} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>PDF Dosyası</label>
              <input type="file" accept="application/pdf" onChange={handlePdfChange} disabled={loading} />
              <div style={{ marginTop: 6, fontSize: 13, color: "#666" }}>Maksimum 50MB</div>
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

          <p style={{ marginTop: 12, color: "#6b7280" }}>Not: Dosyalar `magazines` bucket'ına yüklenecek ve URL'ler `magazines` tablosuna kaydedilecek.</p>
        </div>
      )}
    </div>
  );
}
