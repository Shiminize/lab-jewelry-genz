import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from './RegisterForm'
import { SocialSignInButtons, type SocialProvider } from '@/components/auth/SocialSignInButtons'

export const metadata: Metadata = {
  title: 'Create account | GlowGlitch',
  description: 'Save your custom jewelry designs and get concierge support with a GlowGlitch login.',
}

type SearchParams = Record<string, string | string[] | undefined>

function firstValue(value: string | string[] | undefined) {
  if (!value) return undefined
  return Array.isArray(value) ? value[0] : value
}

function sanitizePath(value: string | undefined, fallback = '/collections') {
  if (value && value.startsWith('/')) {
    return value
  }
  return fallback
}

export default function RegisterPage({ searchParams }: { searchParams?: SearchParams }) {
  const redirectTo = sanitizePath(firstValue(searchParams?.from))
  const socialProviders: SocialProvider[] = []
  if (process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID) {
    socialProviders.push('google')
  }
  if (process.env.AUTH_APPLE_ID || process.env.APPLE_CLIENT_ID) {
    socialProviders.push('apple')
  }
  if (process.env.AUTH_FACEBOOK_ID || process.env.FACEBOOK_CLIENT_ID) {
    socialProviders.push('facebook')
  }

  return (
    <section className="bg-gradient-to-b from-app via-app/95 to-app px-4 py-16">
      <div className="mx-auto grid max-w-5xl gap-10 rounded-[32px] border border-border-subtle bg-surface-base/80 p-8 shadow-soft md:grid-cols-2 md:p-12">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">GlowGlitch accounts</p>
          <h1 className="text-4xl font-semibold text-text-primary md:text-5xl">Bring your designs everywhere</h1>
          <p className="text-base text-text-secondary">
            Save concierge chats, pick up custom builds across devices, and unlock early previews for limited drops.
          </p>
          <ul className="space-y-3 text-sm text-text-primary">
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-border-subtle text-[10px] font-semibold text-accent">
                1
              </span>
              Track bespoke order timelines in a dedicated dashboard.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-border-subtle text-[10px] font-semibold text-accent">
                2
              </span>
              Sync collections and saved looks with Aurora Concierge recommendations.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-border-subtle text-[10px] font-semibold text-accent">
                3
              </span>
              Get notified the second new sustainable materials or glow finishes drop.
            </li>
          </ul>
          <div className="rounded-2xl border border-border-subtle bg-surface-panel/40 px-4 py-3 text-sm text-text-tertiary">
            Already part of the GlowGlitch collective?{' '}
            <Link href="/login" className="font-semibold text-accent hover:underline">
              Sign in here
            </Link>
            .
          </div>
        </div>

        <div className="rounded-3xl border border-border-subtle bg-surface-panel/60 px-6 py-8 backdrop-blur">
          <div className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Create account</p>
            <h2 className="text-2xl font-semibold text-text-primary">Start building with Aurora</h2>
          </div>
          <div className="mt-6 space-y-6">
            {socialProviders.length > 0 && (
              <>
                <SocialSignInButtons redirectTo={redirectTo} providers={socialProviders} />
                <div className="text-center text-xs uppercase tracking-[0.3em] text-text-tertiary">or</div>
              </>
            )}
            <RegisterForm redirectTo={redirectTo} />
            <p className="text-center text-xs text-text-tertiary">
              By creating an account you agree to GlowGlitch&apos;s{' '}
              <Link href="/support/help?topic=terms" className="font-semibold text-accent hover:underline">
                community guidelines
              </Link>{' '}
              and data policies.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
