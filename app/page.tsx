import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SecureNotes — End-to-End Encrypted Note Taking',
  description:
    'SecureNotes is a zero-knowledge encrypted note-taking app. Your notes are encrypted in your browser using AES-GCM before they ever reach the server.',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 px-6 py-4 glass border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-text-primary">
            <span className="text-2xl">🔒</span>
            <span>SecureNotes</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors"
            >
              Get Started →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 bg-dot-grid relative overflow-hidden">
        {/* Glow blobs */}
        <div
          aria-hidden="true"
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
          style={{
            background:
              'radial-gradient(ellipse, hsl(245 58% 51% / 0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        <div className="relative z-10 max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-800 bg-primary-950/60 text-primary-300 text-xs font-medium mb-6">
            <span>🔒</span>
            <span>Zero-knowledge · End-to-end encrypted</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-none">
            <span className="text-text-primary">Your thoughts,</span>
            <br />
            <span className="gradient-text">truly private.</span>
          </h1>

          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            SecureNotes encrypts every word in your browser before it leaves your device.
            Even we can&apos;t read your notes — by design, not by policy.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary-600 text-white font-semibold text-base hover:bg-primary-500 transition-all hover:shadow-glow active:scale-95"
            >
              Start for free
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-border text-text-secondary font-medium text-base hover:bg-surface-elevated hover:text-text-primary transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-text-primary mb-3">
            Built on uncompromising security
          </h2>
          <p className="text-center text-text-muted mb-12 max-w-xl mx-auto">
            Every architectural decision prioritises your privacy over convenience.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-surface p-6 hover:border-primary-700 hover:bg-surface-elevated transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-950 border border-primary-800 flex items-center justify-center text-primary-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-text-primary mb-2 text-sm">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security model callout */}
      <section className="py-16 px-6 border-t border-border bg-surface">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            The honest security model
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 text-left mt-8">
            {[
              {
                label: 'What we protect',
                color: 'success',
                items: [
                  'Note body encrypted with AES-GCM (256-bit)',
                  'Key derived via PBKDF2 (310k SHA-256 iterations)',
                  'Unique IV per note save — no IV reuse',
                  'Supabase RLS — you can only access your data',
                  'Server never sees plaintext content',
                ],
              },
              {
                label: 'Known limitations',
                color: 'warning',
                items: [
                  'Note titles stored as cleartext (for search)',
                  'Forgotten passphrase = permanent data loss',
                  'No passphrase change in V1 (re-encryption TBD)',
                  'Single-device key memory — refreshing the tab clears the key',
                  'Metadata (creation time, tag names) are not encrypted',
                ],
              },
            ].map(({ label, color, items }) => (
              <div
                key={label}
                className={`rounded-xl border p-5 ${
                  color === 'success'
                    ? 'border-success-600/30 bg-success-600/5'
                    : 'border-warning-600/30 bg-warning-600/5'
                }`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                    color === 'success' ? 'text-success-400' : 'text-warning-400'
                  }`}
                >
                  {label}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {items.map((item) => (
                    <li key={item} className="flex gap-2 text-xs text-text-muted">
                      <span
                        className={`shrink-0 mt-0.5 ${
                          color === 'success' ? 'text-success-400' : 'text-warning-400'
                        }`}
                      >
                        {color === 'success' ? '✓' : '△'}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 px-6 border-t border-border text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-4">
          Ready to take private notes?
        </h2>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-500 transition-all hover:shadow-glow"
        >
          Create free account →
        </Link>
        <p className="mt-4 text-xs text-text-muted">
          No credit card · No tracking · Open source encryption primitives
        </p>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <span>© {new Date().getFullYear()} SecureNotes</span>
          <span>Built with Next.js · Supabase · Web Crypto API</span>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: 'AES-GCM Encryption',
    description:
      'Every note body is encrypted in your browser using AES-GCM 256-bit — a authenticated cipher that detects tampering. The server only ever stores ciphertext.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: 'Zero Knowledge',
    description:
      'Your passphrase never leaves your device. Keys are derived via PBKDF2 (310k iterations) and stored only in memory — cleared when you close the tab.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    ),
  },
  {
    title: 'Organised & Searchable',
    description:
      'Tag your notes and organise them into folders. Search by title (stored as cleartext for performance). The body stays encrypted — you trade some metadata for usability.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h3.172a2 2 0 011.414.586l1.828 1.828A2 2 0 0012.828 8H19a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
    ),
  },
]
