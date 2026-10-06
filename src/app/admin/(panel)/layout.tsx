import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminContext } from "@/lib/auth";
import { getSettings } from "@/lib/data";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const [admin, settings] = await Promise.all([getAdminContext(), getSettings()]);
  if (!admin) redirect("/admin/login");

  return (
    <AdminShell
      admin={{ email: admin.email, role: admin.role, preview: admin.preview }}
      clubName={settings.club_name}
    >
      {children}
    </AdminShell>
  );
}
