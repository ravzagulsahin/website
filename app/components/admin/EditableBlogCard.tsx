"use client";

import { useState } from "react";
import { useAdmin } from "@/lib/context/AdminContext";
import { supabase } from "@/lib/supabaseClient";
import { Edit2, Trash2, X, Save, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_path: string | null;
  published: boolean;
  published_at: string | null;
}

interface EditableBlogCardProps {
  post: BlogPost;
  coverUrl: string | null;
  onUpdate?: () => void;
  children: React.ReactNode;
}

export default function EditableBlogCard({
  post,
  coverUrl,
  onUpdate,
  children,
}: EditableBlogCardProps) {
  const { isEditMode, isAdmin } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editData, setEditData] = useState({
    title: post.title,
    excerpt: post.excerpt || "",
    published: post.published,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({
          title: editData.title,
          excerpt: editData.excerpt,
          published: editData.published,
        })
        .eq("id", post.id);

      if (error) throw error;

      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Güncelleme başarısız oldu.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu yazıyı silmek istediğinizden emin misiniz?")) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", post.id);

      if (error) throw error;

      onUpdate?.();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Silme başarısız oldu.");
    } finally {
      setIsDeleting(false);
    }
  };

  const togglePublish = async () => {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({ published: !post.published })
        .eq("id", post.id);

      if (error) throw error;

      onUpdate?.();
    } catch (error) {
      console.error("Error toggling publish:", error);
    }
  };

  // If not in edit mode or not admin, just render children
  if (!isEditMode || !isAdmin) {
    return <>{children}</>;
  }

  // Edit mode UI
  if (isEditing) {
    return (
      <div className="relative bg-white border-2 border-blue-500 rounded-xl p-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-zinc-900">Yazıyı Düzenle</h4>
          <button
            onClick={() => setIsEditing(false)}
            className="p-1 hover:bg-zinc-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Başlık
            </label>
            <input
              type="text"
              value={editData.title}
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Özet
            </label>
            <textarea
              value={editData.excerpt}
              onChange={(e) =>
                setEditData({ ...editData, excerpt: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`published-${post.id}`}
              checked={editData.published}
              onChange={(e) =>
                setEditData({ ...editData, published: e.target.checked })
              }
              className="w-4 h-4"
            />
            <label
              htmlFor={`published-${post.id}`}
              className="text-sm text-zinc-700"
            >
              Yayında
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <Link
              href={`/admin?tab=blog`}
              className="flex items-center justify-center gap-2 bg-zinc-100 text-zinc-700 py-2 px-4 rounded-lg hover:bg-zinc-200"
            >
              Tam Düzenle
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Overlay UI
  return (
    <div className="relative group/edit">
      {children}

      {/* Edit overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover/edit:bg-black/20 transition-colors rounded-lg pointer-events-none" />

      {/* Edit controls */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/edit:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          className="p-2 bg-white rounded-lg shadow-lg hover:bg-blue-50 transition-colors"
          title="Düzenle"
        >
          <Edit2 className="w-4 h-4 text-blue-600" />
        </button>
        <button
          onClick={togglePublish}
          className="p-2 bg-white rounded-lg shadow-lg hover:bg-amber-50 transition-colors"
          title={post.published ? "Yayından Kaldır" : "Yayınla"}
        >
          {post.published ? (
            <EyeOff className="w-4 h-4 text-amber-600" />
          ) : (
            <Eye className="w-4 h-4 text-green-600" />
          )}
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 bg-white rounded-lg shadow-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          title="Sil"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>

      {/* Status badge */}
      {!post.published && (
        <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
          Taslak
        </div>
      )}
    </div>
  );
}
