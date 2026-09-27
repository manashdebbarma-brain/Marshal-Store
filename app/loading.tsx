export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      {/* Header skeleton */}
      <div className="mb-8 flex items-center gap-3">
        <div className="skeleton h-12 w-12 rounded-2xl" />
        <div className="space-y-2">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-6 w-64" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
          >
            <div className="skeleton aspect-[16/10] w-full rounded-none" />
            <div className="space-y-3 p-4">
              <div className="skeleton h-3 w-16" />
              <div className="skeleton h-5 w-3/4" />
              <div className="skeleton h-3 w-full" />
              <div className="flex justify-between pt-1">
                <div className="skeleton h-4 w-20" />
                <div className="skeleton h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}