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
        description="Membership applications submitted through the Join Us form. Only admins can read this data."
        breadcrumb={[{ href: "/admin/applications", label: "Applications" }]}
      />
      <ApplicationsInbox applications={applications} />
    </>
  );
}
