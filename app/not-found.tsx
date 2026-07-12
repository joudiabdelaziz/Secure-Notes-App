import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background bg-dot-grid flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-8xl font-black gradient-text mb-4">404</p>
        <h1 className="text-xl font-bold text-text-primary mb-2">
          Page not found
        </h1>
        <p className="text-sm text-text-muted mb-8">
          This page doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors"
        >
          ← Go home
        </Link>
      </div>
    </div>
  )
}
