import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ResetPasswordForm } from './ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset password | GlowGlitch',
}

export default function ResetPasswordPage({ params }: { params: { token?: string } }) {
  const token = params?.token
  if (!token) {
    notFound()
  }

  return (
    <section className="bg-gradient-to-b from-app via-app/95 to-app px-4 py-16">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-border-subtle bg-surface-base/90 p-8 shadow-soft md:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Secure link</p>
        <h1 className="mt-3 text-4xl font-semibold text-text-primary">Set a new password</h1>
        <p className="mt-2 text-base text-text-secondary">Create a fresh password to access your GlowGlitch account.</p>
        <div className="mt-8">
          <ResetPasswordForm token={token} />
        </div>
        <div className="mt-6 text-center text-sm text-text-secondary">
          Need a new link?{' '}
          <Link href="/forgot-password" className="font-semibold text-accent hover:underline">
            Request another reset
          </Link>
        </div>
      </div>
    </section>
  )
}
