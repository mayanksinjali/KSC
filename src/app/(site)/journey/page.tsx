import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Milestone } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/site/Reveal";
import { EventCategoryBadge } from "@/components/ui/Badge";
import { getSettings, listTimeline } from "@/lib/data";
import { formatBsAd } from "@/lib/utils";
import { createPageMetadata } from "@/lib/metadata";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [settings, events] = await Promise.all([getSettings(), listTimeline()]);
  return createPageMetadata(settings, {
    title: "Journey",
    description: `The KSC story so far — a chronological timeline of the programmes, exhibitions and research days ${settings.club_name} has completed.`,
    canonical: "/journey",
    image: events.find((event) => event.cover_url)?.cover_url,
  });
}

export default async function JourneyPage() {
  const events = await listTimeline();

  return (
    <>
      <PageHeader
        eyebrow="Our story so far"
        title="Journey"
        description="Every programme the club has completed, newest first. Each milestone links back to the full event record."
      />

      <section className="container-page py-16 sm:py-20">
        {events.length === 0 ? (
          <EmptyState
            icon={Milestone}
            title="No completed programmes yet."
            description="As soon as the club finishes its first programme this year it will appear here."
          />
        ) : (
          <ol className="relative space-y-10 border-l border-line pl-6 sm:pl-10">
            {events.map((event, index) => (
              <Reveal as="li" key={event.id} delay={index * 0.04} className="relative">
                <span
                  className="absolute -left-[1.9rem] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-paper bg-teal sm:-left-[3.15rem]"
                  aria-hidden="true"
                />
                <div className="grid gap-5 sm:grid-cols-[10rem_1fr] sm:gap-8">
                  <div>
                    <p className="font-display text-lg text-teal">
                      {formatBsAd(event.date_bs, event.date_ad)}
                    </p>
                    <div className="mt-2">
                      <EventCategoryBadge category={event.category} />
                    </div>
                  </div>

                  <article className="card-surface overflow-hidden">
                    <div className="grid sm:grid-cols-[1fr_11rem]">
                      <div className="p-6">
                        <h2 className="font-display text-xl leading-snug">
                          <Link
                            href={`/events/${event.id}`}
                            className="transition-colors hover:text-teal"
                          >
                            {event.title}
                          </Link>
                        </h2>
                        <p className="mt-3 text-pretty text-sm leading-relaxed text-muted">
                          {event.description}
                        </p>
                        {event.result && (
                          <p className="mt-4 border-l-2 border-amber/50 pl-4 text-sm italic text-muted">
                            {event.result}
                          </p>
                        )}
                        <p className="mt-4 text-xs uppercase tracking-[0.14em] text-faint">
                          {event.venue}
                        </p>
                        <Link
                          href={`/events/${event.id}`}
                          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-teal"
                        >
                          View record
                          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </div>

                      {event.cover_url && (
                        <div className="relative hidden sm:block">
                          <Image
                            src={event.cover_url}
                            alt=""
                            fill
                            sizes="180px"
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </article>
                </div>
              </Reveal>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
