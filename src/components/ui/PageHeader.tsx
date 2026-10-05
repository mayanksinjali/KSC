import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="relative w-full overflow-hidden border-b border-line bg-paper-2/60">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal/[0.06] blur-3xl"
      />
      <div className="container-page relative py-16 sm:py-20 lg:py-24">
        <p className="eyebrow mb-4">{eyebrow}</p>
        <h1 className="max-w-3xl text-balance text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted">
            {description}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </header>
  );
}
