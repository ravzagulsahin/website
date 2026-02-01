"use client";

import { useAdmin } from "@/lib/context/AdminContext";
import { Settings, LogOut, Edit3, Eye, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AdminToolbar() {
  const { user, isAdmin, isSuperAdmin, isEditMode, setEditMode, signOut, isLoading } = useAdmin();
  const [isMinimized, setIsMinimized] = useState(false);

  // Don't show anything while loading or if not an admin
  if (isLoading || !isAdmin || !user) {
    return null;
  }

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-50 bg-zinc-900 text-white p-3 rounded-full shadow-lg hover:bg-zinc-800 transition-colors"
        title="Admin Toolbar'ı Aç"
      >
        <Settings className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-zinc-900 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-3">
        {/* User info */}
        <div className="flex items-center gap-2 pr-3 border-r border-zinc-700">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-zinc-400">
            {user.email?.split("@")[0]}
          </span>
          {isSuperAdmin && (
            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
              Super
            </span>
          )}
        </div>

        {/* Edit mode toggle */}
        <button
          onClick={() => setEditMode(!isEditMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
            isEditMode
              ? "bg-blue-500 text-white"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          }`}
        >
          {isEditMode ? (
            <>
              <Edit3 className="w-4 h-4" />
              <span>Düzenleme Modu</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>Görüntüleme</span>
            </>
          )}
        </button>

        {/* Admin panel link */}
        <Link
          href="/admin"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Panel</span>
        </Link>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-zinc-800 text-zinc-300 hover:bg-red-500 hover:text-white transition-colors"
          title="Çıkış Yap"
        >
          <LogOut className="w-4 h-4" />
        </button>

        {/* Minimize */}
        <button
          onClick={() => setIsMinimized(true)}
          className="p-1.5 rounded-full text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Küçült"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
