import { PageTitle } from "@/components/admin/PageTitle";
import { ApplicationsInbox } from "@/components/admin/ApplicationsInbox";
import { listApplications } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  const applications = await listApplications();

  return (
    <>
      <PageTitle
        title="Applications"
        description="Review membership applications and accept a person into Members with one click. Only admins can read these applications."
        breadcrumb={[{ href: "/admin/applications", label: "Applications" }]}
      />
      <ApplicationsInbox applications={applications} />
    </>
  );
}
