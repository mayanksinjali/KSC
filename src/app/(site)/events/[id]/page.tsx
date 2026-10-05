import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarDays, MapPin, Trophy } from "lucide-react";
import { EventCategoryBadge, EventStatusBadge } from "@/components/ui/Badge";
import { EventCard } from "@/components/events/EventCard";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getEvent, getSettings, listEvents, listGallery } from "@/lib/data";
import { formatBsAd } from "@/lib/utils";
import { createPageMetadata } from "@/lib/metadata";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const [event, settings] = await Promise.all([getEvent(id), getSettings()]);
  if (!event) {
    return createPageMetadata(settings, {
      title: "Event not found",
      description: `Events from ${settings.club_name}.`,
      canonical: `/events/${id}`,
      type: "article",
    });
  }
  const description = `${event.description} ${formatBsAd(event.date_bs, event.date_ad)} · ${event.venue}`.slice(
    0,
    200,
  );
  return createPageMetadata(settings, {
    title: event.title,
    description,
    canonical: `/events/${event.id}`,
    image: event.cover_url,
    type: "article",
  });
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, settings] = await Promise.all([getEvent(id), getSettings()]);
  if (!event) notFound();

  const [eventGallery, allEvents] = await Promise.all([
    listGallery({ eventId: event.id }),
    listEvents(),
  ]);

  const related = allEvents
    .filter((e) => e.id !== event.id && e.category === event.category)
    .slice(0, 3);

  const registrationOpen = event.status === "upcoming" && Boolean(event.registration_url);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.date_ad,
    eventStatus:
      event.status === "cancelled"
        ? "https://schema.org/EventCancelled"
        : event.status === "postponed"
          ? "https://schema.org/EventPostponed"
          : "https://schema.org/EventScheduled",
    location: { "@type": "Place", name: event.venue, address: "Butwal, Nepal" },
    organizer: { "@type": "Organization", name: settings.club_name },
  };

  return (
    <>
      <div className="border-b border-line bg-paper-2/50">
        <div className="container-page py-8">            <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-teal">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All events
            </Link>
        </div>
      </div>

      <article>
        <header className="container-page py-12 sm:py-16">
          <div className="flex flex-wrap items-center gap-2">
            <EventStatusBadge status={event.status} />
            <EventCategoryBadge category={event.category} />
          </div>
          <h1 className="mt-5 max-w-3xl text-balance text-4xl leading-[1.05] sm:text-5xl">
            {event.title}
          </h1>

          <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-teal" aria-hidden="true" />
              <dt className="sr-only">Date</dt>
              <dd>{formatBsAd(event.date_bs, event.date_ad)}</dd>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-teal" aria-hidden="true" />
              <dt className="sr-only">Venue</dt>
              <dd>{event.venue}</dd>
            </div>
          </dl>

          {registrationOpen && event.registration_url && (
            <a
              href={event.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-8"
            >
              Register for this event
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </header>

        {event.cover_url && (
          <div className="container-page">
            <div className="relative aspect-[16/9] overflow-hidden rounded-card border border-line bg-paper-2">
              <Image
                src={event.cover_url}
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1100px"
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div>
            <h2 className="eyebrow mb-4">About this event</h2>
            <div className="whitespace-pre-line text-pretty text-base leading-relaxed text-muted sm:text-lg">
              {event.description}
            </div>

            {event.result && (
              <div className="mt-10 rounded-card border border-amber/30 bg-amber/[0.07] p-6">
                <h2 className="flex items-center gap-2 font-display text-lg text-ink">
                  <Trophy className="h-4 w-4 text-amber" aria-hidden="true" />
                  Outcome
                </h2>
                <p className="mt-3 text-pretty leading-relaxed text-muted">{event.result}</p>
              </div>
            )}
          </div>

          <aside className="lg:pt-1">
            <div className="card-surface p-6">
              <h2 className="eyebrow mb-4">Details</h2>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-faint">Date (BS + AD)</dt>
                  <dd className="mt-0.5 text-ink">{formatBsAd(event.date_bs, event.date_ad)}</dd>
                </div>
                <div>
                  <dt className="text-faint">Venue</dt>
                  <dd className="mt-0.5 text-ink">{event.venue}</dd>
                </div>
                <div>
                  <dt className="text-faint">Status</dt>
                  <dd className="mt-0.5 capitalize text-ink">{event.status}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>

        {eventGallery.length > 0 && (
          <section className="container-page pb-16" aria-labelledby="event-gallery">
            <h2 id="event-gallery" className="eyebrow mb-4">
              Photos from this event
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {eventGallery.map((image) => (
                <figure
                  key={image.id}
                  className="group relative aspect-square overflow-hidden rounded-soft border border-line bg-paper-2"
                >
                  <Image
                    src={image.image_url}
                    alt={image.alt_text}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-3 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {image.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}
      </article>

      {related.length > 0 && (
        <section className="border-t border-line bg-paper-2/50">
          <div className="container-page py-16">
            <Reveal>
              <SectionHeader eyebrow="Keep exploring" title="Related events" />
            </Reveal>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <EventCard key={item.id} event={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
