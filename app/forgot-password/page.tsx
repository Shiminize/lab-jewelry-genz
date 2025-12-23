import type { Metadata } from 'next'
import Link from 'next/link'
import { ForgotPasswordForm } from './ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Forgot password | GlowGlitch',
  description: 'Request a password reset link for your GlowGlitch account.',
}

export default function ForgotPasswordPage() {
  return (
    <section className="bg-gradient-to-b from-app via-app/95 to-app px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-border-subtle bg-surface-base/90 p-8 shadow-soft md:p-12" role="form" aria-label="Account recovery form">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Account recovery</p>
        <h1 className="mt-3 text-4xl font-semibold text-text-primary">Forgot your password?</h1>
        <p className="mt-2 text-base text-text-secondary">
          Enter the email linked to your GlowGlitch account and we&apos;ll send you a secure link to set a new password.
        </p>
        <div className="mt-8">
          <ForgotPasswordForm />
        </div>
        <div className="mt-6 text-center text-sm text-text-secondary">
          Remembered your password?{' '}
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </section>
  )
}
