export function AuditRegisterSkeleton() {
  return (
    <div className="divide-y divide-border-subtle/50">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="grid min-h-[82px] gap-4 px-5 py-4 md:grid-cols-[minmax(220px,1.5fr)_120px_110px_130px_120px_110px_100px] md:items-center"
        >
          {Array.from({ length: 7 }).map((__, cell) => (
            <span
              key={cell}
              className={`h-4 animate-pulse rounded bg-bg-elevated ${cell > 0 ? 'hidden md:block' : ''}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
export function AuditDetailSkeleton() {
  return (
    <div className="space-y-7">
      <div className="h-4 w-20 animate-pulse rounded bg-bg-elevated" />
      <div className="space-y-3 border-b border-border-subtle/70 pb-7">
        <div className="h-3 w-24 animate-pulse rounded bg-bg-elevated" />
        <div className="h-10 w-96 max-w-full animate-pulse rounded bg-bg-elevated" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-bg-elevated" />
      </div>
      <div className="h-44 animate-pulse border-y border-border-subtle/70 bg-bg-card/30" />
    </div>
  );
}
