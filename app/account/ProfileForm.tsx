'use client'

import { useState, type FormEvent } from 'react'

interface ProfileFormProps {
  initialName: string
  initialMarketingOptIn: boolean
}

export function ProfileForm({ initialName, initialMarketingOptIn }: ProfileFormProps) {
  const [name, setName] = useState(initialName)
  const [marketingOptIn, setMarketingOptIn] = useState(initialMarketingOptIn)
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('saving')
    setError(null)
    try {
      const response = await fetch('/api/account/profile', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, marketingOptIn }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.message || 'Unable to update profile')
      }
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>
      )}
      <label className="block space-y-2 text-sm font-semibold text-text-primary">
        <span>Display name</span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={120}
          className="w-full rounded-2xl border border-border-subtle bg-surface-panel/40 px-4 py-3 text-base text-text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40"
        />
      </label>
      <label className="flex items-start gap-3 text-sm text-text-secondary">
        <input
          type="checkbox"
          checked={marketingOptIn}
          onChange={(event) => setMarketingOptIn(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-border-subtle text-accent focus:ring-accent/60"
        />
        <span>
          Send me previews, drop reminders, and concierge tips. You can opt out anytime from this page or the email footer.
        </span>
      </label>
      <button
        type="submit"
        disabled={status === 'saving'}
        className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-black transition hover:bg-accent/90 disabled:opacity-70"
      >
        {status === 'saving' ? 'Saving…' : 'Save changes'}
      </button>
      {status === 'success' && (
        <p className="text-center text-sm font-semibold text-accent">Profile updated</p>
      )}
    </form>
  )
}
