import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export function PageTitle({
  title,
  description,
  breadcrumb,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumb?: { href: string; label: string }[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex items-center gap-1.5 text-xs text-faint">
            <li>
              <Link href="/admin/dashboard" className="transition-colors hover:text-ink">
                Admin
              </Link>
            </li>
            {breadcrumb.map((crumb, i) => (
              <li key={crumb.href} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
                {i === breadcrumb.length - 1 ? (
                  <span className="text-muted">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="transition-colors hover:text-ink">
                    {crumb.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
