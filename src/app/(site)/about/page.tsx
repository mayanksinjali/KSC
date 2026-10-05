import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Compass, FlaskConical, GraduationCap, MapPin, Target, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/site/Reveal";
import { getSettings } from "@/lib/data";
import { createPageMetadata } from "@/lib/metadata";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const description = settings.about_intro.slice(0, 160);
  return createPageMetadata(settings, {
    title: "About",
    description,
    canonical: "/about",
  });
}

export default async function AboutPage() {
  const settings = await getSettings();

  const pillars = [
    { icon: Target, title: "Our mission", body: settings.mission_body },
    { icon: Compass, title: "Our vision", body: settings.vision },
    { icon: FlaskConical, title: "What we do", body: settings.what_we_do },
  ];

  return (
    <>
      <PageHeader
        eyebrow="About the club"
        title="About"
        description={settings.about_intro}
      />

      <section className="w-full py-20 sm:py-24">
        <div className="container-page">
          <Reveal>
            <div className="grid gap-6 md:grid-cols-3">
              {pillars.map((pillar) => (
                <div key={pillar.title} className="card-surface flex flex-col p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal/10 text-teal">
                    <pillar.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h2 className="mt-5 font-display text-xl">{pillar.title}</h2>
                  <p className="mt-3 text-pretty text-sm leading-relaxed text-muted">{pillar.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="w-full border-y border-line bg-paper-2/50">
        <div className="container-page grid gap-12 py-20 lg:grid-cols-[1fr_1.1fr] lg:py-24">
          <Reveal>
            <SectionHeader eyebrow="Our story" index="01" title="How the club began" />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-5 text-pretty leading-relaxed text-muted">
              <p>{settings.history}</p>
              <p>
                Today the club runs a year-round calendar of programmes and is led by a student
                committee that changes every academic session, supported by our teachers and the
                school administration.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="w-full py-20 sm:py-24">
        <div className="container-page">
          <Reveal>
            <SectionHeader
              eyebrow="How we work"
              index="02"
              title="Students lead, teachers guide"
              description="Every programme is organised by members with guidance from our advisors. Committee roles rotate each session so new students take on leadership each year."
            />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
              {
                icon: Users,
                title: "Student committee",
                body: "Members elect and appoint a committee each session to plan events, manage the club and represent KSC at school programmes.",
              },
              {
                icon: GraduationCap,
                title: "Teacher advisors",
                body: "Our science and computer science teachers guide the club, supervise laboratory work and help teams prepare for bigger events.",
              },
              {
                icon: MapPin,
                title: "Where we meet",
                body: settings.meeting_location,
              },
              ].map((item) => (
                <div key={item.title} className="border-t border-line pt-6">
                  <item.icon className="h-5 w-5 text-amber" aria-hidden="true" />
                  <h3 className="mt-4 font-display text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-14 flex flex-wrap gap-3">
              <Link href="/join" className="btn-primary">
                Join KSC
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/team" className="btn-ghost">
                Meet the team
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
