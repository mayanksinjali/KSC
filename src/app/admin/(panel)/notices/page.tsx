import { PageTitle } from "@/components/admin/PageTitle";
import { NoticesManager } from "@/components/admin/NoticesManager";
import { listNotices } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminNoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const [{ new: isNew }, notices] = await Promise.all([searchParams, listNotices()]);

  return (
    <>
      <PageTitle
        title="Notices"
        description="Announcements, registrations and results. Pinned notices always appear first on the public page."
        breadcrumb={[{ href: "/admin/notices", label: "Notices" }]}
      />
      <NoticesManager notices={notices} openNew={isNew === "1"} />
    </>
  );
}
