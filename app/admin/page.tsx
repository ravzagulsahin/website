"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminPage() {
  // Auth states
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Upload states
  const [title, setTitle] = useState("");
  const [issueNumber, setIssueNumber] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // New admin (super admin only)
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminLoading, setNewAdminLoading] = useState(false);
  const [newAdminError, setNewAdminError] = useState<string | null>(null);
  const [newAdminSuccess, setNewAdminSuccess] = useState<string | null>(null);

  // Admin list
  const [admins, setAdmins] = useState<Array<{ email: string; is_super_admin?: boolean }>>([]);
  const [adminListLoading, setAdminListLoading] = useState(false);

  const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB

  useEffect(() => {
    // Check session on mount
    (async () => {
      setAuthLoading(true);
      setLoginError(null);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        const session = (data as any)?.session;
        if (session?.user?.email) {
          const email = session.user.email;
          setIsLoggedIn(true);
          setUserEmail(email);
          await verifyAdmin(email);
        } else {
          setIsLoggedIn(false);
          setIsAdmin(false);
        }
      } catch (err: any) {
        console.error("Session check failed", err);
        setLoginError("Oturum kontrolü sırasında hata oluştu.");
        setIsLoggedIn(false);
        setIsAdmin(false);
      } finally {
        setAuthLoading(false);
      }
    })();
  }, []);

  async function verifyAdmin(email: string) {
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("email, is_super_admin")
        .eq("email", email)
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Not an admin
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setUserEmail(null);
        setLoginError("Yetkiniz yok.");
      } else {
        setIsAdmin(true);
        setIsSuperAdmin(Boolean((data as any).is_super_admin));
        setLoginError(null);
      }
    } catch (err: any) {
      console.error("Admin verification failed", err);
      setLoginError("Yetki kontrolü sırasında hata oluştu.");
      setIsAdmin(false);
      setIsSuperAdmin(false);
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      const session = (data as any)?.session;
      const email = session?.user?.email ?? loginEmail;
      setIsLoggedIn(true);
      setUserEmail(email);
      await verifyAdmin(email);
    } catch (err: any) {
      console.error("Sign in error", err);
      setLoginError(err?.message ?? "Giriş yapılamadı.");
      setIsLoggedIn(false);
      setIsAdmin(false);
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

  function sanitizeFileName(name: string) {
    return name.replace(/[^a-z0-9.-]/gi, "_").toLowerCase();
  }

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
      // Create unique filenames
      const timestamp = Date.now();
      const coverName = `${timestamp}_${sanitizeFileName(coverFile.name)}`;
      const pdfName = `${timestamp}_${sanitizeFileName(pdfFile.name)}`;

      // Upload cover
      const coverPath = `covers/${coverName}`;
      const { error: coverUploadError } = await supabase.storage
        .from("magazines")
        .upload(coverPath, coverFile, { cacheControl: "3600", upsert: false });

      if (coverUploadError) throw new Error(coverUploadError.message);

      // Upload PDF
      const pdfPath = `pdfs/${pdfName}`;
      const { error: pdfUploadError } = await supabase.storage
        .from("magazines")
        .upload(pdfPath, pdfFile, { cacheControl: "3600", upsert: false });

      if (pdfUploadError) throw new Error(pdfUploadError.message);

      // Get public URLs
      const { data: coverUrlData } = supabase.storage.from("magazines").getPublicUrl(coverPath);
      const coverUrl = (coverUrlData as any).publicUrl;

      const { data: pdfUrlData } = supabase.storage.from("magazines").getPublicUrl(pdfPath);
      const pdfUrl = (pdfUrlData as any).publicUrl;

      // Insert into magazines table
      const { error: dbError } = await supabase.from("magazines").insert([
        {
          title: title.trim(),
          issue_number: Number(issueNumber),
          cover_url: coverUrl,
          pdf_url: pdfUrl,
        },
      ]);

      if (dbError) throw new Error(dbError.message);

      setSuccess("Dergi başarıyla yüklendi.");
      setTitle("");
      setIssueNumber("");
      setCoverFile(null);
      setPdfFile(null);
      // reset file inputs by resetting the form (or use refs)
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err?.message ?? "Bilinmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewAdminError(null);
    setNewAdminSuccess(null);
    if (!newAdminEmail.trim()) {
      setNewAdminError("Lütfen bir e-posta girin.");
      return;
    }
    setNewAdminLoading(true);
    try {
      const email = newAdminEmail.trim().toLowerCase();
      const { error } = await supabase.from("admins").insert([{ email }]);
      if (error) throw error;
      setNewAdminSuccess("Yeni admin eklendi.");
      setNewAdminEmail("");
      await fetchAdmins();
    } catch (err: any) {
      console.error("Add admin error", err);
      const msg = err?.message ?? "Admin eklenirken hata oluştu.";
      setNewAdminError(msg);
    } finally {
      setNewAdminLoading(false);
    }
  };

  const fetchAdmins = async () => {
    setAdminListLoading(true);
    setNewAdminError(null);
    try {
      const { data, error } = await supabase.from("admins").select("email, is_super_admin").order("email");
      if (error) throw error;
      setAdmins((data as any) || []);
    } catch (err: any) {
      console.error("Fetch admins error", err);
      setNewAdminError(err?.message ?? "Admin listesi alınırken hata oluştu.");
      setAdmins([]);
    } finally {
      setAdminListLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins();
    }
  }, [isSuperAdmin]);

  const handleRemoveAdmin = async (emailToRemove: string) => {
    setNewAdminError(null);
    setNewAdminSuccess(null);

    if (!emailToRemove) return;

    if (emailToRemove === userEmail) {
      setNewAdminError("Kendi yetkinizi kaldıramazsınız.");
      return;
    }

    if (!confirm(`\"${emailToRemove}\" adresini adminlikten çıkarmak istediğinize emin misiniz?`)) {
      return;
    }

    setNewAdminLoading(true);
    try {
      const { error } = await supabase.from("admins").delete().eq("email", emailToRemove);
      if (error) throw error;
      setNewAdminSuccess("Admin kaldırıldı.");
      await fetchAdmins();
    } catch (err: any) {
      console.error("Remove admin error", err);
      setNewAdminError(err?.message ?? "Admin kaldırılırken hata oluştu.");
    } finally {
      setNewAdminLoading(false);
    }
  };

  // Render
  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 24, border: "1px solid #e6e6e6", borderRadius: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h1 style={{ margin: 0 }}>Admin Paneli</h1>
        <div style={{ fontSize: 14, color: "#6b7280" }}>
          {isLoggedIn && userEmail ? (
            <>
              <span style={{ marginRight: 12 }}>{userEmail}</span>
              <button onClick={handleSignOut} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", background: "white" }}>
                Çıkış
              </button>
            </>
          ) : null}
        </div>
      </div>

      {authLoading ? (
        <div style={{ color: "#374151", fontWeight: 600 }}>Yükleniyor...</div>
      ) : !isLoggedIn ? (
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

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Şifre</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
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
      ) : isAdmin ? (
        // Upload form (same as before)
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

          {isSuperAdmin && (
            <>
              <hr style={{ marginTop: 20 }} />

              <div style={{ marginTop: 12, maxWidth: 720 }}>
                <h3 style={{ marginTop: 0 }}>Admin Yönetimi</h3>

                <div style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 320 }}>
                    <form onSubmit={handleAddAdmin}>
                      <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Yeni Admin Ekle (Email)</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="email"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          required
                          placeholder="newadmin@example.com"
                          disabled={newAdminLoading}
                          style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
                        />
                        <button
                          type="submit"
                          disabled={newAdminLoading}
                          style={{ padding: "8px 12px", borderRadius: 6, background: "#0f172a", color: "white", border: "none" }}
                        >
                          Admin Ekle
                        </button>
                      </div>

                      {newAdminError && <div style={{ color: "#b00020", marginTop: 8, fontWeight: 600 }}>{newAdminError}</div>}
                      {newAdminSuccess && <div style={{ color: "#166534", marginTop: 8, fontWeight: 600 }}>{newAdminSuccess}</div>}
                    </form>
                  </div>

                  <div style={{ width: 200 }}>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>Not: Kendi yetkinizi kaldırmak mümkün değildir.</div>
                  </div>
                </div>

                <div style={{ border: "1px solid #e6e6e6", borderRadius: 8, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "#f9fafb" }}>
                      <tr>
                        <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #eee" }}>Email</th>
                        <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #eee" }}>Süper</th>
                        <th style={{ textAlign: "right", padding: "10px 12px", borderBottom: "1px solid #eee" }}>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminListLoading ? (
                        <tr>
                          <td colSpan={3} style={{ padding: 12 }}>Yükleniyor...</td>
                        </tr>
                      ) : admins.length === 0 ? (
                        <tr>
                          <td colSpan={3} style={{ padding: 12 }}>Kayıtlı admin yok.</td>
                        </tr>
                      ) : (
                        admins.map((a) => (
                          <tr key={a.email}>
                            <td style={{ padding: 12, borderTop: "1px solid #f3f4f6" }}>{a.email}</td>
                            <td style={{ padding: 12, borderTop: "1px solid #f3f4f6" }}>{a.is_super_admin ? "Evet" : "-"}</td>
                            <td style={{ padding: 12, borderTop: "1px solid #f3f4f6", textAlign: "right" }}>
                              <button
                                onClick={() => handleRemoveAdmin(a.email)}
                                disabled={newAdminLoading || a.email === userEmail}
                                style={{ padding: "6px 10px", borderRadius: 6, background: a.email === userEmail ? "#9ca3af" : "#dc2626", color: "white", border: "none" }}
                                title={a.email === userEmail ? "Kendi yetkinizi kaldıramazsınız" : "Yetkiyi Kaldır"}
                              >
                                Yetkiyi Kaldır
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div style={{ color: "#b00020", fontWeight: 600 }}>Yetkiniz yok. Oturum kapatıldı.</div>
      )}
    </div>
  );
}
