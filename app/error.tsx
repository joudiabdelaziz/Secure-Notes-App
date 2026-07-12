'use client'

import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="bg-background text-text-primary min-h-screen flex items-center justify-center">
        <div className="text-center px-6 max-w-sm">
          <div className="text-5xl mb-4">💥</div>
          <h1 className="text-xl font-bold text-text-primary mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-text-muted mb-6">
            {error.message || 'An unexpected error occurred.'}
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
      </body>
    </html>
  )
}
