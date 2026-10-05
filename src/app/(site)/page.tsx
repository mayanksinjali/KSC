import Link from "next/link";
import { ArrowUpRight, FlaskConical, Sparkles } from "lucide-react";
import { HeroOrbit } from "@/components/site/HeroOrbit";
import { Reveal, RevealGroup } from "@/components/site/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { NextEventBanner } from "@/components/events/NextEventBanner";
import { EventCard } from "@/components/events/EventCard";
import { Stats } from "@/components/site/Stats";
import { getSettings, getStats, listEvents } from "@/lib/data";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, stats, recentEvents] = await Promise.all([getSettings(), getStats(), listEvents()]);
  const today = new Date().toISOString().slice(0, 10);
  const nextEvent =
    recentEvents
      .filter((event) => event.status === "upcoming" && event.date_ad >= today)
      .sort((a, b) => (a.date_ad < b.date_ad ? -1 : 1))[0] ?? null;

  // Flagship programmes come straight from the database — never filler cards.
  const programmes = recentEvents.slice(0, 3);
  const highlights = settings.home_highlights
    .split(/\r?\n/)
    .map((text) => text.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <>
      {/* ------------------------------- Hero ------------------------------- */}
      <section className="relative isolate overflow-hidden bg-[#0b1526] text-[#f7f3ea]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[#0b1526]/20"
        />
        <div className="relative aspect-[742/455] lg:absolute lg:inset-0 lg:aspect-auto">
          <HeroOrbit />
        </div>
        <div className="container-page relative z-10 grid items-center gap-8 pb-12 pt-4 sm:gap-10 sm:pb-16 lg:min-h-[min(820px,calc(100svh-5rem))] lg:grid-cols-[1.1fr_.9fr] lg:py-20">
          <div className="lg:col-start-2 lg:pl-24">
            <Reveal>
              <p className="eyebrow !text-white/65">
                <span className="h-1.5 w-1.5 rounded-full bg-amber" aria-hidden="true" />
                {settings.club_name} · Kanti Secondary School, Butwal
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="mt-6 max-w-[13ch] text-balance text-[2.8rem] leading-[1.02] sm:text-6xl lg:text-7xl">
                {settings.hero_heading}
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p lang="ne" className="mt-6 max-w-xl text-lg leading-relaxed text-teal-soft sm:text-xl">
                {settings.tagline_ne}
              </p>
            </Reveal>

            <Reveal delay={0.22}>
              <p className="mt-3 max-w-xl text-sm font-medium text-teal-soft">{settings.tagline_en}</p>
              <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/75 sm:text-lg">
                {settings.hero_text}
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/join" className="btn-primary px-6 py-3 text-base">
                  Join KSC
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/events"
                  className="btn-ghost !border-white/30 !text-white hover:!border-white/60 hover:!text-white px-6 py-3 text-base"
                >
                  Explore Events
                </Link>
              </div>
            </Reveal>
          </div>

          {highlights.length > 0 && (
            <Reveal delay={0.4} className="relative z-10 lg:col-span-2">
              <ul className="grid gap-4 border-t border-white/20 pt-6 sm:grid-cols-3 sm:pt-8">
                {highlights.map((text, index) => {
                  const Icon = [FlaskConical, Sparkles, ArrowUpRight][index];
                  return (
                    <li key={text} className="flex items-start gap-2.5 text-sm text-white/75">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden="true" />
                      {text}
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          )}
        </div>
      </section>

      {/* ----------------------------- Next event --------------------------- */}
      <section className="container-page pb-20 sm:pb-24" aria-labelledby="next-event-heading">
        <h2 id="next-event-heading" className="sr-only">
          Next event
        </h2>
        <Reveal>
          <NextEventBanner event={nextEvent} />
        </Reveal>
      </section>

      {/* ------------------------------ Mission ----------------------------- */}
      <section className="border-y border-line bg-paper-2/50" aria-labelledby="mission-heading">
        <div className="container-page grid gap-12 py-20 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:py-24">
          <Reveal>
            <SectionHeader
              eyebrow="Who we are"
              index="01"
              title={settings.mission_title}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-5 text-pretty text-base leading-relaxed text-muted sm:text-lg">
              <p>{settings.mission_body}</p>
              <p>{settings.about_intro}</p>
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-teal"
              >
                More about KSC
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------- Programmes ----------------------------- */}
      {programmes.length > 0 && (
        <section className="container-page py-20 sm:py-24" aria-labelledby="programmes-heading">
          <Reveal>
            <SectionHeader
              eyebrow="Flagship programmes"
              index="02"
              title="What we actually run"
              description="A selection of the exhibitions, quizzes, talks and build events organised by our members."
              action={
                <Link href="/events" className="btn-ghost">
                  All events
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              }
            />
          </Reveal>
          <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programmes.map((event, i) => (
              <Reveal key={event.id} as="div" delay={i * 0.06} className="h-full">
                <EventCard event={event} />
              </Reveal>
            ))}
          </RevealGroup>
        </section>
      )}

      {/* ------------------------------- Stats ------------------------------ */}
      {stats.activeMembers + stats.eventsHeld + stats.yearsRunning > 0 && (
        <section className="container-page pb-20 sm:pb-24" aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">
            Club at a glance
          </h2>
          <Reveal>
            <Stats stats={stats} />
          </Reveal>
        </section>
      )}

      {/* ------------------------------- CTA -------------------------------- */}
      <section className="container-page pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-card border border-line bg-gradient-to-br from-teal/[0.08] via-surface to-amber/[0.08] px-6 py-14 text-center sm:px-12 sm:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-teal/10 blur-3xl"
            />
            <p className="eyebrow justify-center">Be part of what comes next</p>
            <h2 className="mx-auto mt-4 max-w-2xl text-balance text-3xl leading-tight sm:text-4xl">
              Bring your curiosity. We&apos;ll bring the experiments.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted">
              Membership is open to every student at Kanti Secondary School. Tell us a little about
              what you want to explore and we&apos;ll get you into a team.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/join" className="btn-primary px-6 py-3 text-base">
                Join KSC
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
