import type { Metadata } from "next";
import Image from "next/image";
import { GraduationCap, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/site/Reveal";
import { getSettings, listMembers } from "@/lib/data";
import type { Member } from "@/lib/types";
import { createPageMetadata } from "@/lib/metadata";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return createPageMetadata(settings, {
    title: "Team",
    description: `The student committee and teacher advisors behind ${settings.club_name}.`,
    canonical: "/team",
  });
}

function MemberCard({ member }: { member: Member }) {
  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-card border border-line bg-paper-2">
        {member.photo_url ? (
          <Image
            src={member.photo_url}
            alt={`${member.name}, ${member.role}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-teal/10 to-amber/10">
            <span className="font-display text-3xl text-teal/40" aria-hidden="true">
              {member.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <h3 className="mt-4 font-display text-lg leading-snug">{member.name}</h3>
      <p className="mt-1 text-sm text-teal">{member.role}</p>
      {(member.class || member.session) && (
        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-faint">
          {[member.class, member.session].filter(Boolean).join(" · ")}
        </p>
      )}
    </article>
  );
}

export default async function TeamPage() {
  const [students, teachers] = await Promise.all([
    listMembers({ type: "student", activeOnly: true }),
    listMembers({ type: "teacher", activeOnly: true }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="The people behind KSC"
        title="Team"
        description="Meet the students and teachers who contribute to KSC, with roles and details maintained by the club."
      />

      <section className="container-page py-16 sm:py-20" aria-label="Student committee">
        <Reveal>
          <SectionHeader
            eyebrow="Current members"
            index="01"
            title="Student Committee"
            description="Current student committee members and their roles, maintained by the club."
          />
        </Reveal>

        <div className="mt-10">
          {students.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Student committee information will be published soon."
              description="The current committee is being finalised for this session."
            />
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {students.map((member, i) => (
                <Reveal key={member.id} delay={i * 0.04}>
                  <MemberCard member={member} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-line bg-paper-2/50" aria-label="Advisors and teachers">
        <div className="container-page py-16 sm:py-20">
          <Reveal>
            <SectionHeader
              eyebrow="Guidance and support"
              index="02"
              title="Advisors & Teachers"
              description="Teacher and advisor profiles currently listed by the club."
            />
          </Reveal>

          <div className="mt-10">
            {teachers.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="Advisor information will be published soon."
              />
            ) : (
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {teachers.map((member, i) => (
                  <Reveal key={member.id} delay={i * 0.04}>
                    <MemberCard member={member} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
