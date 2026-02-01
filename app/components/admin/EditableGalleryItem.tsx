"use client";

import { useState } from "react";
import { useAdmin } from "@/lib/context/AdminContext";
import { supabase } from "@/lib/supabaseClient";
import { Edit2, Trash2, X, Save, Eye, EyeOff, GripVertical } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  image_path: string | null;
  order_index: number | null;
  active: boolean | null;
}

interface EditableGalleryItemProps {
  item: GalleryItem;
  onUpdate?: () => void;
  children: React.ReactNode;
}

export default function EditableGalleryItem({
  item,
  onUpdate,
  children,
}: EditableGalleryItemProps) {
  const { isEditMode, isAdmin } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editData, setEditData] = useState({
    title: item.title || "",
    subtitle: item.subtitle || "",
    order_index: item.order_index || 0,
    active: item.active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("home_gallery")
        .update({
          title: editData.title || null,
          subtitle: editData.subtitle || null,
          order_index: editData.order_index,
          active: editData.active,
        })
        .eq("id", item.id);

      if (error) throw error;

      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating gallery item:", error);
      alert("Güncelleme başarısız oldu.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu görseli silmek istediğinizden emin misiniz?")) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("home_gallery")
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      onUpdate?.();
    } catch (error) {
      console.error("Error deleting gallery item:", error);
      alert("Silme başarısız oldu.");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleActive = async () => {
    try {
      const { error } = await supabase
        .from("home_gallery")
        .update({ active: !item.active })
        .eq("id", item.id);

      if (error) throw error;

      onUpdate?.();
    } catch (error) {
      console.error("Error toggling active:", error);
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
          <h4 className="font-semibold text-zinc-900">Görseli Düzenle</h4>
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
              placeholder="Görsel başlığı"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Alt Başlık
            </label>
            <input
              type="text"
              value={editData.subtitle}
              onChange={(e) =>
                setEditData({ ...editData, subtitle: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Alt başlık (opsiyonel)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Sıra
            </label>
            <input
              type="number"
              value={editData.order_index}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  order_index: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`active-${item.id}`}
              checked={editData.active}
              onChange={(e) =>
                setEditData({ ...editData, active: e.target.checked })
              }
              className="w-4 h-4"
            />
            <label
              htmlFor={`active-${item.id}`}
              className="text-sm text-zinc-700"
            >
              Aktif
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

      {/* Order indicator */}
      <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover/edit:opacity-100 transition-opacity">
        <GripVertical className="w-3 h-3" />
        <span>Sıra: {item.order_index}</span>
      </div>

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
          onClick={toggleActive}
          className="p-2 bg-white rounded-lg shadow-lg hover:bg-amber-50 transition-colors"
          title={item.active ? "Gizle" : "Göster"}
        >
          {item.active ? (
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

      {/* Inactive badge */}
      {!item.active && (
        <div className="absolute bottom-2 left-2 bg-zinc-500 text-white text-xs px-2 py-1 rounded-full">
          Gizli
        </div>
      )}
    </div>
  );
}
