'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

interface LoginFormProps {
  redirectTo: string
  initialMessage?: string | null
}

export function LoginForm({ redirectTo, initialMessage }: LoginFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(initialMessage ?? null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const clearError = () => {
    if (error) {
      setError(null)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')

    if (!email || !password) {
      setError('Enter your email and password to continue.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: redirectTo || '/',
    })

    if (!result || result.error) {
      const friendly = result?.error === 'CredentialsSignin' ? 'Invalid email or password.' : result?.error
      setError(friendly ?? 'Something went wrong. Please try again.')
      setIsSubmitting(false)
      return
    }

    const target = result.url || redirectTo || '/'
    router.push(target)
    router.refresh()
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && (
        <div
          className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      <label className="block space-y-2 text-sm font-medium text-text-primary">
        <span>Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          className="w-full rounded-2xl border border-border-subtle bg-surface-panel/40 px-4 py-3 text-base text-text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40"
          placeholder="you@example.com"
          onChange={clearError}
        />
      </label>

      <label className="block space-y-2 text-sm font-medium text-text-primary">
        <span>Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className="w-full rounded-2xl border border-border-subtle bg-surface-panel/40 px-4 py-3 text-base text-text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40"
          placeholder="••••••••"
          onChange={clearError}
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-black transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
