import type { Metadata } from "next";
import { BellOff } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { NoticeCard } from "@/components/notices/NoticeCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/site/Reveal";
import { getSettings, listNotices } from "@/lib/data";
import { createPageMetadata } from "@/lib/metadata";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [settings, notices] = await Promise.all([getSettings(), listNotices()]);
  return createPageMetadata(settings, {
    title: "Notices",
    description: `Announcements and updates from ${settings.club_name} — registrations, results, meetings and programme notices.`,
    canonical: "/notices",
    image: notices.find((notice) => notice.image_url)?.image_url,
  });
}

export default async function NoticesPage() {
  const notices = await listNotices();
  const [latest, ...rest] = notices;

  return (
    <>
      <PageHeader
        eyebrow="Announcements"
        title="Notices"
        description="Registrations, results, meeting times and programme updates — newest first, with pinned notices at the top."
      />

      <section className="w-full py-14 sm:py-16">
        <div className="container-page">
          {notices.length === 0 ? (
              <EmptyState
                icon={BellOff}
                title="No notices have been posted yet."
                description="Club announcements will appear here as soon as the committee publishes them."
              />
          ) : (
              <div className="space-y-6">
                {latest && (
                  <Reveal>
                    <NoticeCard notice={latest} featured />
                  </Reveal>
                )}
                {rest.length > 0 && (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {rest.map((notice, i) => (
                      <Reveal key={notice.id} delay={i * 0.04}>
                        <NoticeCard notice={notice} />
                      </Reveal>
                    ))}
                  </div>
                )}
              </div>
          )}
        </div>
      </section>
    </>
  );
}
