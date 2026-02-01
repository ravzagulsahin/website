"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import MagazineManager from "./components/MagazineManager";
import BlogManager from "./components/BlogManager";
import GalleryManager from "./components/GalleryManager";
import AdminManager from "./components/AdminManager";
import AboutManager from "./components/AboutManager";
import {
  BookOpen,
  FileText,
  Image,
  Users,
  Info,
  LogOut,
  Mail,
  Lock,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";

type TabType = "dashboard" | "magazines" | "blog" | "gallery" | "admins" | "about";

const menuItems = [
  { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { id: "magazines" as const, label: "Dergiler", icon: BookOpen },
  { id: "blog" as const, label: "Blog Yazıları", icon: FileText },
  { id: "gallery" as const, label: "Galeri", icon: Image },
  { id: "admins" as const, label: "Yöneticiler", icon: Users },
  { id: "about" as const, label: "Hakkımızda", icon: Info },
];

export default function AdminPage() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // Stats for dashboard
  const [stats, setStats] = useState({
    magazines: 0,
    blogs: 0,
    gallery: 0,
    admins: 0,
  });

  // Session check on mount and listen for auth changes
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const isAdminUser = await verifyAdmin(session.user.email!);
        if (isAdminUser) {
          setIsLoggedIn(true);
          setIsAdmin(true);
          setUserEmail(session.user.email!);
          fetchStats();
        }
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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

  const fetchStats = async () => {
    try {
      const [magazinesRes, blogsRes, galleryRes, adminsRes] = await Promise.all([
        supabase.from("magazines").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("home_gallery").select("id", { count: "exact", head: true }),
        supabase.from("admins").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        magazines: magazinesRes.count || 0,
        blogs: blogsRes.count || 0,
        gallery: galleryRes.count || 0,
        admins: adminsRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

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
        setLoginError("Bu e-posta adresi admin olarak kayıtlı değil.");
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

      setOtpSent(true);
    } catch (err: any) {
      console.error(err);
      setLoginError(err?.message ?? "Giriş kodu gönderilemedi.");
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
    setOtpSent(false);
  };

  // Login Screen
  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Logo/Brand */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900">Admin Girişi</h1>
              <p className="text-zinc-500 text-sm mt-2">
                Yönetim paneline erişmek için giriş yapın
              </p>
            </div>

            {otpSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-zinc-900 mb-2">
                  E-posta Gönderildi!
                </h2>
                <p className="text-zinc-500 text-sm mb-6">
                  <strong>{loginEmail}</strong> adresine giriş linki gönderdik.
                  Lütfen e-postanızı kontrol edin.
                </p>
                <button
                  onClick={() => {
                    setOtpSent(false);
                    setLoginEmail("");
                  }}
                  className="text-zinc-600 hover:text-zinc-900 text-sm underline"
                >
                  Farklı bir e-posta dene
                </button>
              </div>
            ) : (
              <form onSubmit={handleSignIn} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    E-posta Adresi
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="admin@example.com"
                    disabled={loginLoading}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 outline-none transition-all"
                  />
                </div>

                {loginError && (
                  <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-zinc-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loginLoading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    "Giriş Linki Gönder"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-zinc-900 min-h-screen fixed left-0 top-0 flex flex-col">
          {/* Brand */}
          <div className="p-6 border-b border-zinc-800">
            <h1 className="text-white text-xl font-bold">Admin Panel</h1>
            <p className="text-zinc-500 text-xs mt-1">Yönetim Sistemi</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                        isActive
                          ? "bg-white text-zinc-900 font-medium shadow-lg"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center gap-3 px-4 py-3 bg-zinc-800 rounded-xl mb-3">
              <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {userEmail?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {userEmail?.split("@")[0]}
                </p>
                <p className="text-zinc-500 text-xs truncate">{userEmail}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-xl transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Çıkış Yap
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          {/* Dashboard View */}
          {activeTab === "dashboard" && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-zinc-900">Dashboard</h2>
                <p className="text-zinc-500 mt-1">
                  Hoş geldiniz! İşte sitenizin genel durumu.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div
                  className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveTab("magazines")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-3xl font-bold text-zinc-900">
                      {stats.magazines}
                    </span>
                  </div>
                  <h3 className="text-zinc-600 font-medium">Dergiler</h3>
                </div>

                <div
                  className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveTab("blog")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-3xl font-bold text-zinc-900">
                      {stats.blogs}
                    </span>
                  </div>
                  <h3 className="text-zinc-600 font-medium">Blog Yazıları</h3>
                </div>

                <div
                  className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveTab("gallery")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Image className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-3xl font-bold text-zinc-900">
                      {stats.gallery}
                    </span>
                  </div>
                  <h3 className="text-zinc-600 font-medium">Galeri Görseli</h3>
                </div>

                <div
                  className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveTab("admins")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-amber-600" />
                    </div>
                    <span className="text-3xl font-bold text-zinc-900">
                      {stats.admins}
                    </span>
                  </div>
                  <h3 className="text-zinc-600 font-medium">Yöneticiler</h3>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
                <h3 className="text-lg font-semibold text-zinc-900 mb-4">
                  Hızlı İşlemler
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab("blog")}
                    className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-zinc-600" />
                    <span className="text-sm font-medium text-zinc-700">
                      Yeni Yazı
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("magazines")}
                    className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
                  >
                    <BookOpen className="w-5 h-5 text-zinc-600" />
                    <span className="text-sm font-medium text-zinc-700">
                      Yeni Dergi
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("gallery")}
                    className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
                  >
                    <Image className="w-5 h-5 text-zinc-600" />
                    <span className="text-sm font-medium text-zinc-700">
                      Görsel Ekle
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("about")}
                    className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
                  >
                    <Info className="w-5 h-5 text-zinc-600" />
                    <span className="text-sm font-medium text-zinc-700">
                      Hakkımızda
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Manager Views */}
          {activeTab === "magazines" && (
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">
                Dergi Yönetimi
              </h2>
              <MagazineManager />
            </div>
          )}

          {activeTab === "blog" && (
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">
                Blog Yönetimi
              </h2>
              <BlogManager />
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">
                Galeri Yönetimi
              </h2>
              <GalleryManager />
            </div>
          )}

          {activeTab === "admins" && (
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">
                Yönetici Ayarları
              </h2>
              <AdminManager />
            </div>
          )}

          {activeTab === "about" && (
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">
                Hakkımızda Sayfası
              </h2>
              <AboutManager />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
