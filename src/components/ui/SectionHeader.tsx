import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  index,
  title,
  description,
  align = "left",
  action,
  className,
}: {
  eyebrow?: string;
  index?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        action && "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {(eyebrow || index) && (
          <p className="eyebrow mb-3">
            {index && <span className="text-amber">{index}</span>}
            {eyebrow}
          </p>
        )}
        <h2 className="text-balance text-3xl leading-[1.1] sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h2>
        {description && (
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted sm:text-lg">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
