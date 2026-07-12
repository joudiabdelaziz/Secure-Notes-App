import { PageSpinner } from '@/components/ui/spinner'

export default function NotesLoading() {
  return (
    <div className="flex h-full">
      <div className="w-full md:w-80 lg:w-96 border-r border-border flex flex-col">
        <div className="px-4 py-3 border-b border-border">
          <div className="skeleton h-4 w-24" />
        </div>
        <div className="flex-1 px-3 py-3 flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-4">
              <div className="skeleton h-4 w-3/4 mb-2" />
              <div className="skeleton h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
      <div className="hidden md:flex flex-1 items-center justify-center">
        <PageSpinner />
      </div>
    </div>
  )
}
