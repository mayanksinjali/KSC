import type { MetadataRoute } from "next";
import { listEvents, listNotices } from "@/lib/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/events`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/journey`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/gallery`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/team`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/notices`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/join`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
  ];

  const [events, notices] = await Promise.all([listEvents(), listNotices()]);

  return [
    ...staticRoutes,
    ...events.map((event) => ({
      url: `${siteUrl}/events/${event.id}`,
      lastModified: new Date(event.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...notices.map((notice) => ({
      url: `${siteUrl}/notices/${notice.id}`,
      lastModified: new Date(notice.published_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
