'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { signupSchema, type SignupInput } from '@/lib/validation/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

function validateSignupForm(data: SignupInput): Partial<Record<keyof SignupInput, string>> {
  const result = signupSchema.safeParse(data)
  if (result.success) return {}
  const errors: Partial<Record<keyof SignupInput, string>> = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof SignupInput
    if (!errors[field]) errors[field] = issue.message
  }
  return errors
}

/** Password strength: 0–4 */
function getPasswordStrength(password: string): number {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return Math.min(score, 4)
}

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
const strengthColors = ['', 'bg-danger-500', 'bg-warning-500', 'bg-primary-500', 'bg-success-500']

export function SignupForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SignupInput, string>>>({})

  const strength = getPasswordStrength(password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data: SignupInput = { email, password, confirmPassword }
    const errors = validateSignupForm(data)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setFormError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/notes`,
        },
      })

      if (error) {
        if (error.message.toLowerCase().includes('already')) {
          setFormError('An account with this email already exists. Try logging in.')
        } else {
          setFormError(error.message)
        }
        return
      }

      toast.success('Account created! Check your email to verify.')
      router.push('/login')
    } catch {
      setFormError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {formError && (
        <div
          role="alert"
          className="px-4 py-3 rounded-lg bg-danger-600/10 border border-danger-600/30 text-sm text-danger-400"
        >
          {formError}
        </div>
      )}

      <Input
        id="signup-email"
        type="email"
        label="Email address"
        placeholder="you@example.com"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        disabled={loading}
        required
      />

      <div className="flex flex-col gap-2">
        <Input
          id="signup-password"
          type={showPassword ? 'text' : 'password'}
          label="Password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          disabled={loading}
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="text-text-muted hover:text-text-secondary transition-colors"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          }
        />
        {/* Password strength meter */}
        {password.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1 flex-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i <= strength ? strengthColors[strength] : 'bg-border'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-text-muted w-12 text-right">
              {strengthLabels[strength]}
            </span>
          </div>
        )}
      </div>

      <Input
        id="signup-confirm-password"
        type={showPassword ? 'text' : 'password'}
        label="Confirm password"
        placeholder="Same as above"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={fieldErrors.confirmPassword}
        disabled={loading}
        required
      />

      <Button type="submit" loading={loading} className="w-full mt-1" size="lg">
        Create Account
      </Button>

      <p className="text-center text-sm text-text-muted">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
