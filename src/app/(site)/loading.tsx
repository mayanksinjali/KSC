import { GridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container-page py-20">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-5 h-10 w-2/3 max-w-xl" />
      <Skeleton className="mt-4 h-4 w-1/2 max-w-md" />
      <div className="mt-12">
        <GridSkeleton count={6} />
      </div>
    </div>
  );
}
