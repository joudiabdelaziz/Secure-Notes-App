import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  robots: { index: false },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background bg-dot-grid flex flex-col">
      {/* Top nav */}
      <header className="px-6 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary hover:text-primary-400 transition-colors"
        >
          <span className="text-xl">🔒</span>
          <span>SecureNotes</span>
        </Link>
      </header>

      {/* Centered card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Glow ring */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary-600/20 to-transparent pointer-events-none"
            />
            <div className="relative bg-surface border border-border rounded-2xl px-6 py-8 shadow-lg">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-text-muted">
          End-to-end encrypted · Your data, your key
        </p>
      </footer>
    </div>
  )
}
