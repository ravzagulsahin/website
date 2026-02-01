"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Admin {
  id: string;
  email: string;
  is_super_admin: boolean;
}

export default function AdminManager() {
  const [email, setEmail] = useState("");
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdmins = async () => {
    const { data } = await supabase.from("admins").select("*");
    if (data) setAdmins(data);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const addAdmin = async () => {
    if (!email.trim()) {
      setError("Lütfen e-posta adresi girin");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.from("admins").insert([{ email: email.trim(), is_super_admin: false }]);
    if (err) {
      setError(err.message);
    } else {
      setEmail("");
      fetchAdmins();
    }
    setLoading(false);
  };

  const deleteAdmin = async (id: string) => {
    if (!confirm("Bu admini silmek istediğine emin misin?")) return;
    const { error: err } = await supabase.from("admins").delete().eq("id", id);
    if (!err) fetchAdmins();
  };

  const toggleSuperAdmin = async (id: string, isSuperAdmin: boolean) => {
    const { error: err } = await supabase.from("admins").update({ is_super_admin: !isSuperAdmin }).eq("id", id);
    if (!err) fetchAdmins();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Admin Yönetimi</h2>
      
      <div className="flex gap-2">
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="E-posta adresi"
          className="flex-1 border p-2 rounded text-black"
        />
        <button 
          onClick={addAdmin} 
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Ekleniyor..." : "Ekle"}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="border-t pt-4">
        <h3 className="font-bold mb-3">Mevcut Adminler</h3>
        <div className="space-y-2">
          {admins.map((admin) => (
            <div key={admin.id} className="flex justify-between items-center p-3 bg-white border rounded text-black hover:bg-zinc-50">
              <div>
                <p className="font-medium">{admin.email}</p>
                <p className="text-xs text-zinc-500">
                  {admin.is_super_admin ? "🔴 Super Admin" : "⚪ Normal Admin"}
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => toggleSuperAdmin(admin.id, admin.is_super_admin)}
                  className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                >
                  {admin.is_super_admin ? "Normal Yap" : "Super Yap"}
                </button>
                <button 
                  onClick={() => deleteAdmin(admin.id)}
                  className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
