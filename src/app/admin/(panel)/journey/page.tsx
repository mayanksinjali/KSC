import { PageTitle } from "@/components/admin/PageTitle";
import { JourneyManager } from "@/components/admin/JourneyManager";
import { listJourneyMilestones } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminJourneyPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const [{ new: isNew }, milestones] = await Promise.all([
    searchParams,
    listJourneyMilestones(),
  ]);

  return (
    <>
      <PageTitle
        title="Journey"
        description="Add the club’s history from its beginnings. Lower order numbers appear first on the public Journey page."
        breadcrumb={[{ href: "/admin/journey", label: "Journey" }]}
      />
      <JourneyManager milestones={milestones} openNew={isNew === "1"} />
    </>
  );
}
