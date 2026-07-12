import Link from 'next/link'
import { cn, formatRelativeDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { NoteListItem } from '@/types/notes'

interface NoteCardProps {
  note: NoteListItem
  active?: boolean
}

export function NoteCard({ note, active }: NoteCardProps) {
  return (
    <Link
      href={`/notes/${note.id}`}
      className={cn(
        'block p-4 rounded-xl border transition-all duration-150',
        'hover:border-primary-700 hover:bg-surface-elevated',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
        active
          ? 'border-primary-600 bg-primary-950/40'
          : 'border-border bg-surface',
      )}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-sm text-text-primary leading-snug line-clamp-2 flex-1">
          {note.title}
        </h3>
        {/* Lock icon — visual cue that content is encrypted */}
        <span
          className="shrink-0 text-primary-500 mt-0.5"
          aria-label="Encrypted"
          title="Content encrypted with AES-GCM"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </span>
      </div>

      {/* Meta */}
      <p className="text-xs text-text-muted mb-2.5">
        {formatRelativeDate(note.updated_at)}
      </p>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="default" className="text-xs">
              #{tag}
            </Badge>
          ))}
          {note.tags.length > 4 && (
            <Badge variant="default" className="text-xs">
              +{note.tags.length - 4}
            </Badge>
          )}
        </div>
      )}
    </Link>
  )
}
