import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

/** Simulates the FastAPI round-trip so every data view shows a real loading state. */
export function useLoaded(delay = 550) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return loaded;
}

export function CardSkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-card">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-6 w-40" />
          <div className="mt-5 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RowSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-4 shadow-card">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  );
}

export function BlockSkeleton({ className = "h-72" }: { className?: string }) {
  return <Skeleton className={`w-full rounded-xl ${className}`} />;
}
