import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/server'
import { findUserById } from '@/lib/auth/userRepository'
import { ProfileForm } from './ProfileForm'

export const metadata: Metadata = {
  title: 'Your GlowGlitch profile',
  description: 'Manage your GlowGlitch account details and communication preferences.',
}

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/login?from=${encodeURIComponent('/account')}`)
  }

  const user = await findUserById(session.user.id)
  if (!user) {
    redirect(`/login?from=${encodeURIComponent('/account')}`)
  }

  return (
    <section className="bg-gradient-to-b from-app via-app/95 to-app px-4 py-16">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 rounded-[32px] border border-border-subtle bg-surface-base/90 p-8 shadow-soft md:p-12">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Account</p>
          <h1 className="text-4xl font-semibold text-text-primary">Profile & preferences</h1>
          <p className="text-base text-text-secondary">
            Update your display name and marketing preferences. Email changes and password resets live under the security
            section.
          </p>
        </header>
        <div className="rounded-3xl border border-border-subtle bg-surface-panel/60 px-6 py-8">
          <div className="mb-6 space-y-1 text-sm">
            <p className="font-semibold text-text-primary">Email</p>
            <p className="text-text-secondary">{user.email}</p>
          </div>
          <ProfileForm initialName={user.name ?? ''} initialMarketingOptIn={user.marketingOptIn ?? false} />
        </div>
      </div>
    </section>
  )
}
