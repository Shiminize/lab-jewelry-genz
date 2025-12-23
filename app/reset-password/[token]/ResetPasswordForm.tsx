'use client'

import { useState, type FormEvent } from 'react'

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password !== confirm) {
      setError('Passwords must match.')
      return
    }
    setStatus('loading')
    setError(null)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.message || 'Unable to reset password. Request a new link.')
      }
      setStatus('success')
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (status === 'success') {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-semibold text-text-primary">Password updated</h2>
        <p className="text-sm text-text-secondary">You can now sign in with your new password.</p>
        <a
          href="/login"
          className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-black"
        >
          Return to sign in
        </a>
      </div>
    )
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>
      )}
      <label className="block space-y-2 text-sm font-medium text-text-primary">
        <span>New password</span>
        <input
          type="password"
          minLength={8}
          required
          className="w-full rounded-2xl border border-border-subtle bg-surface-panel/40 px-4 py-3 text-base text-text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40"
          placeholder="At least 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <label className="block space-y-2 text-sm font-medium text-text-primary">
        <span>Confirm password</span>
        <input
          type="password"
          minLength={8}
          required
          className="w-full rounded-2xl border border-border-subtle bg-surface-panel/40 px-4 py-3 text-base text-text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />
      </label>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-black transition hover:bg-accent/90 disabled:opacity-70"
      >
        {status === 'loading' ? 'Updating…' : 'Update password'}
      </button>
    </form>
  )
}
