import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Paperclip, Pin } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Notice } from "@/lib/types";

export function NoticeCard({ notice, featured = false }: { notice: Notice; featured?: boolean }) {
  return (
    <article
      className={`card-surface group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift ${
        featured ? "sm:flex-row" : ""
      }`}
    >
      {notice.image_url && (
        <div
          className={`relative bg-paper-2 ${
            featured ? "aspect-[16/10] sm:aspect-auto sm:w-2/5" : "aspect-[16/9]"
          }`}
        >
          <Image
            src={notice.image_url}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-faint">
          {notice.pinned && (
            <span className="inline-flex items-center gap-1 text-amber">
              <Pin className="h-3 w-3" aria-hidden="true" />
              Pinned
            </span>
          )}
          <time dateTime={notice.published_at}>{formatDate(notice.published_at)}</time>
        </div>

        <h3 className="mt-3 font-display text-xl leading-snug">
          <Link href={`/notices/${notice.id}`} className="transition-colors hover:text-teal">
            {notice.title}
          </Link>
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
          {notice.body}
        </p>

        <div className="mt-auto flex items-center justify-between pt-5 text-sm">
          <Link
            href={`/notices/${notice.id}`}
            className="inline-flex items-center gap-1.5 font-medium text-teal"
          >
            Read notice
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          {notice.attachment_url && (
            <span className="inline-flex items-center gap-1.5 text-xs text-faint">
              <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
              Attachment
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
