'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

interface RegisterFormProps {
  redirectTo: string
}

export function RegisterForm({ redirectTo }: RegisterFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
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
    const name = String(formData.get('name') ?? '').trim()
    const marketingOptIn = formData.get('marketingOptIn') === 'on'

    if (!email || !password) {
      setError('Enter your email and a password to continue.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password, name: name || undefined, marketingOptIn }),
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok || !payload?.ok) {
      setError(payload?.message ?? 'Unable to create your account. Try again or contact support.')
      setIsSubmitting(false)
      return
    }

    if (!payload.user) {
      try {
        await signIn('credentials', { redirect: false, email, password })
      } catch {
        // Fallback to manual navigation below
      }
    }

    const target = redirectTo || '/collections'
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
        <span>Full name</span>
        <input
          type="text"
          name="name"
          autoComplete="name"
          className="w-full rounded-2xl border border-border-subtle bg-surface-panel/40 px-4 py-3 text-base text-text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40"
          placeholder="Avery Neon"
          onChange={clearError}
        />
      </label>

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
          autoComplete="new-password"
          minLength={8}
          required
          className="w-full rounded-2xl border border-border-subtle bg-surface-panel/40 px-4 py-3 text-base text-text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40"
          placeholder="At least 8 characters"
          onChange={clearError}
        />
        <p className="text-xs font-normal text-text-tertiary">
          Use 8+ characters with a mix of letters, numbers, or symbols for stronger security.
        </p>
      </label>

      <label className="flex items-start gap-3 text-sm text-text-secondary">
        <input
          type="checkbox"
          name="marketingOptIn"
          className="mt-1 h-4 w-4 rounded border-border-subtle bg-surface-panel/40 text-accent focus:ring-accent/60"
          onChange={clearError}
        />
        <span>Send me launch previews, drop reminders, and personalized concierge tips.</span>
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-black transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  )
}
