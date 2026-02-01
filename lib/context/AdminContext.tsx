"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

interface AdminContextType {
  user: User | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isEditMode: boolean;
  isLoading: boolean;
  setEditMode: (mode: boolean) => void;
  signOut: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          await verifyAdminStatus(session.user.email);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await verifyAdminStatus(session.user.email);
        } else {
          setUser(null);
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setIsEditMode(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const verifyAdminStatus = async (email: string | undefined) => {
    if (!email) {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("admins")
        .select("is_super_admin")
        .eq("email", email)
        .single();

      if (error || !data) {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        return;
      }

      setIsAdmin(true);
      setIsSuperAdmin(data.is_super_admin === true);
    } catch (error) {
      console.error("Error verifying admin:", error);
      setIsAdmin(false);
      setIsSuperAdmin(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setIsEditMode(false);
  };

  const setEditMode = (mode: boolean) => {
    if (isAdmin) {
      setIsEditMode(mode);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        user,
        isAdmin,
        isSuperAdmin,
        isEditMode,
        isLoading,
        setEditMode,
        signOut,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
