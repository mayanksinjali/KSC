"use client";

import { useMemo, useState } from "react";
import { CalendarX2, Search, SlidersHorizontal } from "lucide-react";
import { EventCard } from "./EventCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { EVENT_CATEGORIES, EVENT_STATUSES, type EventRecord } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  all: "All",
  upcoming: "Upcoming",
  completed: "Past",
  postponed: "Postponed",
  cancelled: "Cancelled",
};

const CATEGORY_LABELS: Record<string, string> = {
  all: "All categories",
  Exhibition: "Exhibition",
  Quiz: "Quiz",
  Talk: "Talk",
  Inspire: "Inspire",
  Code: "Code",
  Art: "Art",
};

export function EventsExplorer({ events }: { events: EventRecord[] }) {
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return events.filter((event) => {
      if (status !== "all" && event.status !== status) return false;
      if (category !== "all" && event.category !== category) return false;
      if (!term) return true;
      return (
        event.title.toLowerCase().includes(term) ||
        event.description.toLowerCase().includes(term) ||
        event.venue.toLowerCase().includes(term)
      );
    });
  }, [events, status, category, query]);

  const hasFilters = status !== "all" || category !== "all" || query.trim() !== "";

  return (
    <div>
      <div className="card-surface p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm text-muted">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          <span>Filter events</span>
        </div>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
              aria-hidden="true"
            />
            <label htmlFor="event-search" className="sr-only">
              Search events
            </label>
            <input
              id="event-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, venue…"
              className="field pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
            {(["all", ...EVENT_STATUSES] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                aria-pressed={status === value}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                  status === value
                    ? "border-teal bg-teal text-paper"
                    : "border-line bg-surface text-muted hover:border-teal/50 hover:text-ink",
                )}
              >
                {STATUS_LABELS[value] ?? value}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {(["all", ...EVENT_CATEGORIES] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategory(value)}
              aria-pressed={category === value}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                category === value
                  ? "border-amber bg-amber/15 text-amber"
                  : "border-line bg-surface text-faint hover:border-amber/50 hover:text-ink",
              )}
            >
              {CATEGORY_LABELS[value] ?? value}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-faint" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "event" : "events"}
        {hasFilters ? " matching your filters" : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={CalendarX2}
            title={hasFilters ? "No events match those filters." : "No events yet. Check back soon."}
            description={
              hasFilters
                ? "Try clearing the search or choosing a different category."
                : "New programmes are added by the club committee throughout the year."
            }
            action={
              hasFilters ? (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setStatus("all");
                    setCategory("all");
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
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
