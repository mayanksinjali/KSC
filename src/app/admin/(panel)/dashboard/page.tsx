import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  CalendarPlus,
  FileText,
  Images,
  ImagePlus,
  MessageSquarePlus,
  UserPlus,
  Users,
} from "lucide-react";
import { PageTitle } from "@/components/admin/PageTitle";
import { getAdminContext } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/data";
import { formatBsAd, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [admin, dashboard] = await Promise.all([getAdminContext(), getAdminDashboardData()]);

  const cards = [
    { label: "Active members", value: dashboard.activeMembers, href: "/admin/members", icon: Users },
    { label: "Total events", value: dashboard.totalEvents, href: "/admin/events", icon: CalendarDays },
    { label: "Upcoming events", value: dashboard.upcomingEvents, href: "/admin/events", icon: CalendarDays },
    { label: "Pending applications", value: dashboard.pendingApplications, href: "/admin/applications", icon: BadgeCheck },
    { label: "Published notices", value: dashboard.publishedNotices, href: "/admin/notices", icon: FileText },
    { label: "Gallery photos", value: dashboard.galleryPhotos, href: "/admin/gallery", icon: Images },
  ];

  const { recentApplications, recentEvents } = dashboard;

  return (
    <>
      <PageTitle
        title={`Welcome back${admin ? `, ${admin.email.split("@")[0]}` : ""}`}
        description="Everything you publish here appears on the public website immediately."
      />

      <section aria-label="Overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="card-surface group flex items-center gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
              <card.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-display text-2xl">{card.value}</span>
              <span className="block text-sm text-muted">{card.label}</span>
            </span>
          </Link>
        ))}
      </section>

      <section className="mt-10" aria-label="Quick actions">
        <h2 className="eyebrow mb-4">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/events?new=1" className="btn-primary">
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            Add event
          </Link>
          <Link href="/admin/members?new=1" className="btn-ghost">
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Add member
          </Link>
          <Link href="/admin/notices?new=1" className="btn-ghost">
            <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
            Post notice
          </Link>
          <Link href="/admin/gallery" className="btn-ghost">
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            Upload photos
          </Link>
          <Link href="/admin/applications" className="btn-ghost">
            <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            Review applications
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2" aria-label="Recent activity">
        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Latest applications</h2>
            <Link href="/admin/applications" className="text-sm text-teal">
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {recentApplications.length === 0 && (
              <li className="py-6 text-sm text-faint">No applications yet.</li>
            )}
            {recentApplications.map((app) => (
              <li key={app.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{app.name}</p>
                  <p className="text-xs text-faint">
                    {app.class} · {formatDate(app.created_at)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs ${
                    app.status === "new"
                      ? "border-amber/40 bg-amber/10 text-amber"
                      : "border-line text-faint"
                  }`}
                >
                  {app.status === "new" ? "New" : "Reviewed"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Recently added events</h2>
            <Link href="/admin/events" className="text-sm text-teal">
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {recentEvents.length === 0 && (
              <li className="py-6 text-sm text-faint">No events yet.</li>
            )}
            {recentEvents.map((event) => (
              <li key={event.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{event.title}</p>
                  <p className="text-xs text-faint">
                    {formatBsAd(event.date_bs, event.date_ad)} · {event.category}
                  </p>
                </div>
                <span className="shrink-0 text-xs capitalize text-faint">{event.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
