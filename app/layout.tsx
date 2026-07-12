import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'SecureNotes — End-to-End Encrypted Note Taking',
    template: '%s — SecureNotes',
  },
  description:
    'SecureNotes is a zero-knowledge, end-to-end encrypted note-taking app. ' +
    'Your notes are encrypted in your browser before they ever reach the server. ' +
    'Even we cannot read them.',
  keywords: ['encrypted notes', 'private notes', 'zero knowledge', 'secure notes', 'AES-GCM'],
  authors: [{ name: 'SecureNotes' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'SecureNotes — End-to-End Encrypted Note Taking',
    description: 'Zero-knowledge encrypted notes. Only you can read them.',
    siteName: 'SecureNotes',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SecureNotes — End-to-End Encrypted Note Taking',
    description: 'Zero-knowledge encrypted notes. Only you can read them.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'hsl(217 33% 17%)',
              color: 'hsl(210 40% 98%)',
              border: '1px solid hsl(215 25% 27%)',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: 'hsl(160 84% 39%)',
                secondary: 'hsl(210 40% 98%)',
              },
            },
            error: {
              iconTheme: {
                primary: 'hsl(347 77% 50%)',
                secondary: 'hsl(210 40% 98%)',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
