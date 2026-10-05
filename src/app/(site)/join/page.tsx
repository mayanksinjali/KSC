import type { Metadata } from "next";
import { CalendarCheck, Facebook, Mail, MapPin, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { JoinForm } from "@/components/forms/JoinForm";
import { getSettings } from "@/lib/data";
import { createPageMetadata } from "@/lib/metadata";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return createPageMetadata(settings, {
    title: "Join Us",
    description: `Apply to join ${settings.club_name} at Kanti Secondary School, Butwal. Open to every student.`,
    canonical: "/join",
  });
}

export default async function JoinPage() {
  const settings = await getSettings();

  const details = [
    { icon: MapPin, label: "School", value: "Kanti Secondary School, Butwal" },
    { icon: CalendarCheck, label: "Meetings", value: settings.meeting_location, hint: "Regular meetings are held after school — check Notices for the current schedule." },
    { icon: Mail, label: "Email", value: settings.contact_email, href: `mailto:${settings.contact_email}` },
    ...(settings.facebook_url
      ? [{ icon: Facebook, label: "Facebook", value: "Follow KSC for updates", href: settings.facebook_url }]
      : []),
  ];

  return (
    <>
      <PageHeader
        eyebrow="Get involved"
        title="Join Us"
        description="Membership is open to every student at Kanti Secondary School — no prior experience needed. Tell us a little about what you'd like to do and we'll get you into a team."
      />

      <section className="w-full py-16">
        <div className="container-page grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div>
            <JoinForm />
            <p className="mt-4 text-sm text-faint">
              After you submit, the committee reviews your application and contacts you using the
              details you provided. If you don&apos;t hear back within a week, speak to any committee
              member at school.
            </p>
          </div>

          <aside className="space-y-6">
            <div className="card-surface p-6">
              <h2 className="flex items-center gap-2 font-display text-lg">
                <Users className="h-4 w-4 text-amber" aria-hidden="true" />
                What happens next
              </h2>
              <ol className="mt-4 space-y-4 text-sm">
                {[
                  "You submit this form.",
                  "A committee member reviews your application.",
                  "We contact you to invite you to the next club meeting.",
                  "You join a project team and start building.",
                ].map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/10 text-xs font-medium text-teal">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed text-muted">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="card-surface divide-y divide-line">
              {details.map((item) => (
                <div key={item.label} className="flex gap-4 p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-faint">{item.label}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="mt-1 block text-sm text-ink transition-colors hover:text-teal"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-ink">{item.value}</p>
                    )}
                    {item.hint && (
                      <p className="mt-1 text-xs leading-relaxed text-faint">{item.hint}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
