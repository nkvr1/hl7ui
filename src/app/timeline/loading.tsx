export default function TimelineLoading() {
  return (
    <div className="flex-1 flex h-screen animate-fade-in">
      {/* Sidebar skeleton */}
      <aside className="w-80 border-r border-gray-200 bg-white p-4 space-y-4">
        <div className="h-10 skeleton rounded-xl" />
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-7 w-16 skeleton rounded-lg" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2 py-2">
            <div className="h-4 skeleton rounded-lg w-3/4" />
            <div className="h-3 skeleton rounded-lg w-1/2" />
          </div>
        ))}
      </aside>

      {/* Main skeleton */}
      <main className="flex-1 p-6 space-y-4 bg-gray-50/50">
        <div className="h-32 skeleton rounded-2xl" />
        <div className="h-14 skeleton rounded-2xl w-full" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 skeleton rounded-xl"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
