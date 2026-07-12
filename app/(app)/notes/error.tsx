'use client'

import Link from 'next/link'

export default function NotesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="mb-4 inline-flex p-4 rounded-2xl bg-danger-600/10 text-danger-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-text-primary mb-2">
          Failed to load notes
        </h2>
        <p className="text-sm text-text-muted mb-6">
          {error.message || 'Something went wrong. Please try again.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
