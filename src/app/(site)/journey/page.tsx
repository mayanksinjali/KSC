import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Milestone } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/site/Reveal";
import { EventCategoryBadge } from "@/components/ui/Badge";
import { getSettings, listJourneyMilestones, listTimeline } from "@/lib/data";
import { formatBsAd } from "@/lib/utils";
import { createPageMetadata } from "@/lib/metadata";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [settings, events] = await Promise.all([getSettings(), listTimeline()]);
  return createPageMetadata(settings, {
    title: "Journey",
    description: `The story of ${settings.club_name}, from its beginnings through the milestones and programmes that shaped the club.`,
    canonical: "/journey",
    image: events.find((event) => event.cover_url)?.cover_url ?? undefined,
  });
}

export default async function JourneyPage() {
  const [events, milestones] = await Promise.all([listTimeline(), listJourneyMilestones()]);

  return (
    <>
      <PageHeader
        eyebrow="Our story so far"
        title="Journey"
        description="From the club’s earliest days to the programmes and people shaping its future."
      />

      {milestones.length > 0 && (
        <section className="w-full pt-14 sm:pt-16" aria-labelledby="journey-story-heading">
          <div className="container-page">
            <h2 id="journey-story-heading" className="font-display text-2xl sm:text-3xl">
              Our story from the beginning
            </h2>
            <ol className="relative mt-8 space-y-8 border-l border-line pl-6 sm:pl-10">
              {milestones.map((milestone, index) => (
                <Reveal as="li" key={milestone.id} delay={index * 0.04} className="relative">
                  <span
                    className="absolute -left-[1.9rem] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-paper bg-amber sm:-left-[3.15rem]"
                    aria-hidden="true"
                  />
                  <p className="font-display text-lg text-teal">{milestone.year_label}</p>
                  <article className="card-surface mt-3 p-6">
                    <h3 className="font-display text-xl leading-snug">{milestone.title}</h3>
                    <p className="mt-3 whitespace-pre-line text-pretty text-sm leading-relaxed text-muted">
                      {milestone.description}
                    </p>
                  </article>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section className="w-full py-16 sm:py-20">
        <div className="container-page">
          {events.length === 0 && milestones.length === 0 ? (
          <EmptyState
            icon={Milestone}
            title="The club’s story is ready to begin."
            description="The club president can add its founding story and milestones from Admin → Journey. Completed events will also appear here."
          />
          ) : events.length > 0 ? (
            <>
            <h2 className="mb-8 font-display text-2xl sm:text-3xl">Completed programmes</h2>
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
            </>
          ) : null}
        </div>
      </section>
    </>
  );
}
