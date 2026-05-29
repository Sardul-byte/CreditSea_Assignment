export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`skeleton-shimmer rounded-lg ${className}`}
      aria-hidden
    />
  );
}

export function TableSkeleton({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-card">
      <div className="min-w-[640px] border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="flex gap-4 px-4 py-4">
            {Array.from({ length: cols }).map((_, col) => (
              <Skeleton key={col} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="surface-card">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-3/4" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
      <Skeleton className="mt-6 h-11 w-full rounded-xl" />
    </div>
  );
}

export function FormSkeleton() {
  return <CardSkeleton />;
}

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-44" />
      <Skeleton className="h-4 w-80 max-w-full" />
    </div>
  );
}
