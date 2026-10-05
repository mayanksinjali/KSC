import { PageTitle } from "@/components/admin/PageTitle";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAdminContext, isSuperAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await getAdminContext();

  if (!isSuperAdmin(admin)) {
    return (
      <>
        <PageTitle
          title="Settings"
          breadcrumb={[{ href: "/admin/settings", label: "Settings" }]}
        />
        <EmptyState
          icon={ShieldAlert}
          title="Super Admin access required."
          description="Only teachers with the Super Admin role can change site settings. Ask a Super Admin if something needs updating."
        />
      </>
    );
  }

  const settings = await getSettings();

  return (
    <>
      <PageTitle
        title="Settings"
        description="Site-wide content used across every page — no code changes needed."
        breadcrumb={[{ href: "/admin/settings", label: "Settings" }]}
      />
      <SettingsForm settings={settings} />
    </>
  );
}
