import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, CalendarClock, CalendarDays, Clock, MapPin } from "lucide-react";
import { EventCategoryBadge, EventStatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatBsAd } from "@/lib/utils";
import type { EventRecord } from "@/lib/types";

export function NextEventBanner({ event }: { event: EventRecord | null }) {
  if (!event) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No upcoming event — check back soon."
        description="Our next programme is being planned. Follow the Notices page or our Facebook page so you don't miss the announcement."
        action={
          <Link href="/events" className="btn-ghost">
            Browse past events
          </Link>
        }
      />
    );
  }

  return (
    <article className="card-surface grid overflow-hidden lg:grid-cols-2">
      <div className="relative aspect-[16/11] bg-paper-2 lg:aspect-auto lg:min-h-[24rem]">
        {event.cover_url ? (
          <Image
            src={event.cover_url}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-teal/12 to-amber/12">
            <span className="font-display text-3xl text-teal/40">{event.category}</span>
          </div>
        )}
        <div className="absolute left-5 top-5 flex flex-wrap gap-2">
          <EventStatusBadge status={event.status} />
          <EventCategoryBadge category={event.category} />
        </div>
      </div>

      <div className="flex flex-col justify-center p-6 sm:p-9">
        <p className="eyebrow mb-3 flex items-center gap-2">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          Next event
        </p>
        <h3 className="font-display text-2xl leading-tight sm:text-3xl">{event.title}</h3>
        <p className="mt-4 line-clamp-3 text-pretty leading-relaxed text-muted">
          {event.description}
        </p>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2 text-muted">
            <CalendarDays className="h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
            <dt className="sr-only">Date</dt>
            <dd>{formatBsAd(event.date_bs, event.date_ad)}</dd>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <MapPin className="h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
            <dt className="sr-only">Venue</dt>
            <dd className="line-clamp-1">{event.venue}</dd>
          </div>
        </dl>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href={`/events/${event.id}`} className="btn-primary">
            Event details
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          {event.registration_url && (
            <a
              href={event.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              Register
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
