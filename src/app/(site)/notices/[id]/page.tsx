import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Pin } from "lucide-react";
import { getNotice, getSettings } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { createPageMetadata } from "@/lib/metadata";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const [notice, settings] = await Promise.all([getNotice(id), getSettings()]);
  if (!notice) {
    return createPageMetadata(settings, {
      title: "Notice not found",
      description: `Notices from ${settings.club_name}.`,
      canonical: `/notices/${id}`,
      type: "article",
    });
  }
  return createPageMetadata(settings, {
    title: notice.title,
    description: notice.body.slice(0, 160),
    canonical: `/notices/${notice.id}`,
    image: notice.image_url,
    type: "article",
  });
}

export default async function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [notice, settings] = await Promise.all([getNotice(id), getSettings()]);
  if (!notice) notFound();

  return (
    <section className="w-full py-14 sm:py-20">
      <article className="container-page max-w-prose">
      <Link
        href="/notices"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All notices
      </Link>

      <div className="mt-8 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.14em] text-faint">
        {notice.pinned && (
          <span className="inline-flex items-center gap-1 text-amber">
            <Pin className="h-3 w-3" aria-hidden="true" />
            Pinned
          </span>
        )}
        <time dateTime={notice.published_at}>{formatDate(notice.published_at)}</time>
      </div>

      <h1 className="mt-4 text-balance text-3xl leading-tight sm:text-4xl">{notice.title}</h1>

      {notice.image_url && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-card border border-line bg-paper-2">
          <Image
            src={notice.image_url}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 700px"
            className="object-cover"
          />
        </div>
      )}

      <div className="mt-8 whitespace-pre-line text-pretty text-base leading-relaxed text-muted sm:text-lg">
        {notice.body}
      </div>

      {notice.attachment_url && (
        <a
          href={notice.attachment_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost mt-10"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download attachment
        </a>
      )}

      <p className="mt-14 border-t border-line pt-6 text-sm text-faint">
        Posted by {settings.club_name} · {settings.meeting_location}
      </p>
      </article>
    </section>
  );
}
