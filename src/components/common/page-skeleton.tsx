/** Neutral loading state shown while request-time page content streams in. */
export function PageSkeleton() {
  return (
    <div className="container-page animate-pulse py-8" aria-busy="true">
      <div className="h-3 w-40 rounded bg-surface-2" />
      <div className="mt-8 h-8 w-80 rounded-lg bg-surface-2" />
      <div className="mt-12 grid grid-cols-4 gap-8">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-72 rounded-xl bg-surface" />
        ))}
      </div>
    </div>
  )
}
