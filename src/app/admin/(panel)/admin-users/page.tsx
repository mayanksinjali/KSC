import { ShieldAlert } from "lucide-react";
import { PageTitle } from "@/components/admin/PageTitle";
import { AdminUsersManager } from "@/components/admin/AdminUsersManager";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAdminContext, isSuperAdmin } from "@/lib/auth";
import { listAdminUsers } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await getAdminContext();

  if (!isSuperAdmin(admin)) {
    return (
      <>
        <PageTitle title="Admin Users" breadcrumb={[{ href: "/admin/admin-users", label: "Admin Users" }]} />
        <EmptyState
          icon={ShieldAlert}
          title="Super Admin access required."
          description="Editors cannot manage admin accounts. This is enforced on the server and in database policies."
        />
      </>
    );
  }

  const admins = await listAdminUsers();

  return (
    <>
      <PageTitle
        title="Admin Users"
        description="Control who can access the CMS and what they are allowed to do."
        breadcrumb={[{ href: "/admin/admin-users", label: "Admin Users" }]}
      />
      <AdminUsersManager admins={admins} currentId={admin?.id ?? ""} />
    </>
  );
}
