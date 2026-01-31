"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import MagazineManager from "./components/MagazineManager";
import BlogManager from "./components/BlogManager";
import GalleryManager from "./components/GalleryManager";

type TabType = "magazines" | "blog" | "gallery";

export default function AdminPage() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("magazines");

  // Session check on mount and listen for auth changes
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const isAdminUser = await verifyAdmin(session.user.email!);
        if (isAdminUser) {
          setIsLoggedIn(true);
          setIsAdmin(true);
          setUserEmail(session.user.email!);
        }
      }
    };

    checkSession();

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

  const verifyAdmin = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("email, is_super_admin")
        .eq("email", email)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return !!data && data.is_super_admin === true;
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
      const ok = await verifyAdmin(loginEmail);
      if (!ok) {
        setLoginError("Bu mail adresi admin olarak kayıtlı değil.");
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserEmail(null);
        setLoginLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: loginEmail,
        options: {
          emailRedirectTo: window.location.origin + "/admin",
        },
      });

      if (error) throw error;

      alert("Mailine giriş kodu gönderildi! Lütfen mailini kontrol et.");
      setLoginEmail("");
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

  const tabStyles = {
    container: { display: "flex", gap: 8, borderBottom: "1px solid #e6e6e6", marginBottom: 24 } as const,
    button: (isActive: boolean) => ({
      padding: "8px 16px",
      border: "none",
      background: isActive ? "#111827" : "white",
      color: isActive ? "white" : "#374151",
      borderRadius: "6px 6px 0 0",
      cursor: "pointer",
      fontWeight: isActive ? 600 : 400,
      fontSize: 14,
    } as const),
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

          {/* Tab Navigation */}
          <div style={tabStyles.container}>
            <button
              onClick={() => setActiveTab("magazines")}
              style={tabStyles.button(activeTab === "magazines")}
            >
              Dergiler
            </button>
            <button
              onClick={() => setActiveTab("blog")}
              style={tabStyles.button(activeTab === "blog")}
            >
              Blog
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              style={tabStyles.button(activeTab === "gallery")}
            >
              Galeri
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "magazines" && <MagazineManager />}
            {activeTab === "blog" && <BlogManager />}
            {activeTab === "gallery" && <GalleryManager />}
          </div>
        </div>
      )}
    </div>
  );
}
