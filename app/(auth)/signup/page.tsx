import type { Metadata } from 'next'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a SecureNotes account — free, private, and encrypted.',
}

export default function SignupPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Create account</h1>
        <p className="text-sm text-text-muted">
          Your notes will be encrypted before they ever leave your device
        </p>
      </div>
      <SignupForm />
    </>
  )
}
