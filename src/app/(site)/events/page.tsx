import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { EventsExplorer } from "@/components/events/EventsExplorer";
import { getSettings, listEvents } from "@/lib/data";
import { createPageMetadata } from "@/lib/metadata";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [settings, events] = await Promise.all([getSettings(), listEvents()]);
  return createPageMetadata(settings, {
    title: "Events",
    description: `Upcoming and past programmes from ${settings.club_name} — exhibitions, quizzes, talks, inspire sessions, coding and art events.`,
    canonical: "/events",
    image: events.find((event) => event.cover_url)?.cover_url,
  });
}

export default async function EventsPage() {
  const events = await listEvents();

  return (
    <>
      <PageHeader
        eyebrow="Programmes"
        title="Events"
        description="Everything the club runs — exhibitions, quizzes, talks, inspire sessions, coding events and art competitions. Filter by status or category to find what you're looking for."
      />
      <section className="w-full py-14 sm:py-16">
        <div className="container-page">
          <EventsExplorer events={events} />
        </div>
      </section>
    </>
  );
}
