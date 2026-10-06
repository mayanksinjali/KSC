import { ShieldAlert } from "lucide-react";
import { PageTitle } from "@/components/admin/PageTitle";
import { AdminUsersManager } from "@/components/admin/AdminUsersManager";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAdminContext, isSuperAdmin } from "@/lib/auth";
import { listAdminUsers, listAppointableMembers } from "@/lib/data";

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

  const [admins, appointableMembers] = await Promise.all([
    listAdminUsers(),
    listAppointableMembers(),
  ]);

  return (
    <>
      <PageTitle
        title="Admin Users"
        description="Appoint accepted applicants as Editors or Super Admins. Manually added members are not eligible."
        breadcrumb={[{ href: "/admin/admin-users", label: "Admin Users" }]}
      />
      <AdminUsersManager
        admins={admins}
        appointableMembers={appointableMembers}
        currentId={admin?.id ?? ""}
      />
    </>
  );
}
