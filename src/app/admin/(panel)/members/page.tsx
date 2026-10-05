import { PageTitle } from "@/components/admin/PageTitle";
import { MembersManager } from "@/components/admin/MembersManager";
import { listMembers } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const [{ new: isNew }, members] = await Promise.all([searchParams, listMembers()]);

  return (
    <>
      <PageTitle
        title="Members"
        description="Manage the student committee and teacher advisors. Order controls how they appear on the public Team page."
        breadcrumb={[{ href: "/admin/members", label: "Members" }]}
      />
      <MembersManager members={members} openNew={isNew === "1"} />
    </>
  );
}
