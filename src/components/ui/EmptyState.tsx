import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-surface/60 text-center",
        compact ? "px-6 py-10" : "px-6 py-16",
        className,
      )}
    >
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal/10 text-teal">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="font-display text-lg text-ink">{title}</p>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
