"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images, Search, X } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import type { EventRecord, GalleryImage } from "@/lib/types";

export function GalleryGrid({
  images,
  categories,
  events,
}: {
  images: GalleryImage[];
  categories: string[];
  events: Pick<EventRecord, "id" | "title">[];
}) {
  const [category, setCategory] = useState("all");
  const [eventId, setEventId] = useState("all");
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return images.filter((img) => {
      if (category !== "all" && img.category !== category) return false;
      if (eventId !== "all" && img.event_id !== eventId) return false;
      if (!term) return true;
      return img.caption.toLowerCase().includes(term) || img.alt_text.toLowerCase().includes(term);
    });
  }, [images, category, eventId, query]);

  const close = useCallback(() => setActiveIndex(null), []);
  const next = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i + 1) % filtered.length)),
    [filtered.length],
  );
  const prev = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length)),
    [filtered.length],
  );

  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeIndex === null) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Tab" && dialogRef.current) {
        const nodes = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        );
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [activeIndex, close, next, prev]);

  const active = activeIndex === null ? null : filtered[activeIndex];
  const hasFilters = category !== "all" || eventId !== "all" || query.trim() !== "";

  return (
    <div>
      <div className="card-surface p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <div>
            <label htmlFor="gallery-search" className="label">
              Search photos
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
                aria-hidden="true"
              />
              <input
                id="gallery-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search captions…"
                className="field pl-9"
              />
            </div>
          </div>

          <div>
            <label htmlFor="gallery-category" className="label">
              Category
            </label>
            <select
              id="gallery-category"
              className="field min-w-[10rem]"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="gallery-event" className="label">
              Event
            </label>
            <select
              id="gallery-event"
              className="field min-w-[12rem]"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
            >
              <option value="all">All events</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-faint" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "photo" : "photos"}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Images}
            title={hasFilters ? "No photos match those filters." : "No gallery photos have been published yet."}
            description={
              hasFilters
                ? "Try a different category, event or search term."
                : "Photos from our programmes will appear here once the committee publishes them."
            }
            action={
              hasFilters ? (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setCategory("all");
                    setEventId("all");
                    setQuery("");
                  }}
                >
                  Clear filters
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Open photo: ${image.caption}`}
                className="group relative block aspect-[4/3] w-full overflow-hidden rounded-card border border-line bg-paper-2 text-left"
              >
                <Image
                  src={image.image_url}
                  alt={image.alt_text}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="block text-xs uppercase tracking-[0.14em] text-amber-soft">
                    {image.category}
                  </span>
                  <span className="mt-1 block text-sm text-white">{image.caption}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {active && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Photo viewer: ${active.caption}`}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-ink/85 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />
          <div className="relative z-10 flex w-full max-w-4xl flex-col">
            <div className="mb-3 flex items-center justify-between text-white">
              <span className="text-sm text-white/70">
                {activeIndex! + 1} / {filtered.length} · {active.category}
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close photo viewer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card bg-black/40">
              <Image
                src={active.image_url}
                alt={active.alt_text}
                fill
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-contain"
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-4">
              <p className="text-sm text-white">{active.caption}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous photo"
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10",
                  )}
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next photo"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
