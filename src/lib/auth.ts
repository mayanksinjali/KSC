import { cache } from "react";
import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import type { AdminRole } from "./types";

export interface AdminContext {
  id: string;
  email: string;
  role: AdminRole;
  preview: boolean;
}

/**
 * Resolves the signed-in admin and their role.
 *
 * When no Supabase project is configured the app runs in read-only preview
 * mode: the admin UI is browsable but every mutation is refused server-side.
 * With a project configured, this always reads the real session and role.
 */
export const getAdminContext = cache(async (): Promise<AdminContext | null> => {
  if (!isSupabaseConfigured) {
    return { id: "preview", email: "preview@kantiscienceclub.local", role: "super_admin", preview: true };
  }
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("admin_users")
    .select("id,email,role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("getAdminContext", error.message);
    return null;
  }
  if (!data) return null;
  return { id: data.id, email: data.email, role: data.role as AdminRole, preview: false };
});

export async function requireAdmin(): Promise<AdminContext> {
  const admin = await getAdminContext();
  if (!admin) throw new Error("UNAUTHORIZED");
  return admin;
}

export async function requireSuperAdmin(): Promise<AdminContext> {
  const admin = await requireAdmin();
  if (admin.role !== "super_admin") throw new Error("FORBIDDEN");
  return admin;
}

export function isSuperAdmin(admin: AdminContext | null) {
  return admin?.role === "super_admin";
}
