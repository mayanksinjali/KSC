import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { EventCategoryBadge, EventStatusBadge } from "@/components/ui/Badge";
import { formatBsAd } from "@/lib/utils";
import type { EventRecord } from "@/lib/types";

export function EventCard({ event, priority = false }: { event: EventRecord; priority?: boolean }) {
  return (
    <article className="group card-surface flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link href={`/events/${event.id}`} className="flex h-full flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-paper-2">
          {event.cover_url ? (
            <Image
              src={event.cover_url}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-teal/10 to-amber/10">
              <span className="font-display text-2xl text-teal/40">{event.category}</span>
            </div>
          )}
          <div className="absolute left-4 top-4">
            <EventStatusBadge status={event.status} />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-2">
            <EventCategoryBadge category={event.category} />
          </div>
          <h3 className="mt-3 font-display text-xl leading-snug text-ink transition-colors group-hover:text-teal">
            {event.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
            {event.description}
          </p>

          <div className="mt-4 space-y-2 text-sm text-muted">
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
              {formatBsAd(event.date_bs, event.date_ad)}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
              <span className="line-clamp-1">{event.venue}</span>
            </p>
          </div>

          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-teal">
            View event
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  );
}
