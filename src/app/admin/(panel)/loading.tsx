import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminPanelLoading() {
  return (
    <section aria-busy="true" aria-labelledby="admin-loading-title">
      <span id="admin-loading-title" className="sr-only">
        Loading admin page
      </span>
      <div className="mb-8">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-4 h-9 w-56 max-w-full" />
        <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      </div>

      <div className="flex flex-wrap items-center gap-3" aria-hidden="true">
        <Skeleton className="h-10 w-64 max-w-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="card-surface flex items-center gap-4 p-5">
            <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-36 max-w-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="card-surface flex items-center gap-4 p-4">
            <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40 max-w-full" />
              <Skeleton className="h-3 w-56 max-w-full" />
            </div>
            <Skeleton className="hidden h-8 w-20 sm:block" />
          </div>
        ))}
      </div>
    </section>
  );
}
