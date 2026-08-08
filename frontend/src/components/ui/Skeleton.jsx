// Lightweight skeleton loaders used while data is fetching.

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-hidden">
      <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 flex gap-8">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 flex-1 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="border-t border-slate-100 dark:border-slate-800 px-4 py-4 flex gap-8"
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className={`h-3 flex-1 rounded animate-pulse ${
                c === 0
                  ? "bg-slate-200 dark:bg-slate-700"
                  : "bg-slate-100 dark:bg-slate-800"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 3, className = "" }) {
  return (
    <div className={`grid gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 rounded-xl shadow p-5 space-y-4"
        >
          <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="h-8 w-2/3 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
