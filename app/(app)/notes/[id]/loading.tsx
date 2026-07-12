export default function NoteLoading() {
  return (
    <div className="flex h-full overflow-hidden">
      {/* List panel skeleton */}
      <div className="hidden md:flex md:w-80 lg:w-96 border-r border-border flex-col">
        <div className="px-4 py-3 border-b border-border">
          <div className="skeleton h-4 w-24" />
        </div>
        <div className="flex-1 px-3 py-3 flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-4">
              <div className="skeleton h-4 w-3/4 mb-2" />
              <div className="skeleton h-3 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Editor skeleton */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b border-border">
          <div className="skeleton h-4 w-12" />
          <div className="skeleton h-8 w-24 rounded-md" />
        </div>
        <div className="flex-1 px-6 py-6 flex flex-col gap-5">
          <div className="skeleton h-10 w-full rounded-md" />
          <div className="flex gap-4">
            <div className="skeleton h-10 flex-1 rounded-md" />
            <div className="skeleton h-10 flex-1 rounded-md" />
          </div>
          <div className="skeleton flex-1 rounded-md min-h-[300px]" />
        </div>
      </div>
    </div>
  )
}
