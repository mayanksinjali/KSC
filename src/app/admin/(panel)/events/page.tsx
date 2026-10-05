import { PageTitle } from "@/components/admin/PageTitle";
import { EventsManager } from "@/components/admin/EventsManager";
import { listEvents } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const [{ new: isNew }, events] = await Promise.all([searchParams, listEvents()]);

  return (
    <>
      <PageTitle
        title="Events"
        description="Events power the home page, the events listing, the Journey timeline and related galleries."
        breadcrumb={[{ href: "/admin/events", label: "Events" }]}
      />
      <EventsManager events={events} openNew={isNew === "1"} />
    </>
  );
}
