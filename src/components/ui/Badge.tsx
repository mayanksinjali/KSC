import { cn } from "@/lib/utils";
import type { EventCategory, EventStatus } from "@/lib/types";

const statusStyles: Record<EventStatus, string> = {
  upcoming: "bg-teal/12 text-teal border-teal/30",
  completed: "bg-forest/12 text-forest border-forest/25",
  postponed: "bg-amber/15 text-amber border-amber/35",
  cancelled: "bg-danger/12 text-danger border-danger/30",
};

const statusLabels: Record<EventStatus, string> = {
  upcoming: "Upcoming",
  completed: "Completed",
  postponed: "Postponed",
  cancelled: "Cancelled",
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.14em]",
        statusStyles[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {statusLabels[status]}
    </span>
  );
}

export function EventCategoryBadge({ category }: { category: EventCategory }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-surface px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted">
      {category}
    </span>
  );
}

export function Pill({
  children,
  active = false,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        active
          ? "border-teal bg-teal text-paper"
          : "border-line bg-surface text-muted hover:border-teal/50 hover:text-ink",
        className,
      )}
      aria-pressed={active}
      {...props}
    >
      {children}
    </button>
  );
}
