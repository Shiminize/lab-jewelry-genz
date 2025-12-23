'use client'

import { useState, type FormEvent } from 'react'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setError(null)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) {
        throw new Error('Unable to request reset link. Please try again.')
      }
      setStatus('success')
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-border-subtle bg-surface-panel/60 px-6 py-8 text-center">
        <h2 className="text-2xl font-semibold text-text-primary">Check your inbox</h2>
        <p className="mt-3 text-sm text-text-secondary">
          If an account exists for <strong>{email}</strong>, we sent a reset link. It expires in 30 minutes.
        </p>
      </div>
    )
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>
      )}
      <label className="block space-y-2 text-sm font-medium text-text-primary">
        <span>Email address</span>
        <input
          type="email"
          required
          className="w-full rounded-2xl border border-border-subtle bg-surface-panel/40 px-4 py-3 text-base text-text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-black transition hover:bg-accent/90 disabled:opacity-70"
      >
        {status === 'loading' ? 'Sending link…' : 'Send reset link'}
      </button>
    </form>
  )
}
