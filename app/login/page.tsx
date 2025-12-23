import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from './LoginForm'
import { SocialSignInButtons, type SocialProvider } from '@/components/auth/SocialSignInButtons'

export const metadata: Metadata = {
  title: 'Sign in | GlowGlitch',
  description: 'Access your GlowGlitch account to track orders and customize designs.',
}

type SearchParams = Record<string, string | string[] | undefined>

const friendlyErrors: Record<string, string> = {
  CredentialsSignin: 'Double-check your email and password and try again.',
  SessionRequired: 'Please sign in to continue.',
}

function firstValue(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined
  return Array.isArray(value) ? value[0] : value
}

function sanitizePath(value: string | undefined, fallback = '/collections') {
  if (value && value.startsWith('/')) {
    return value
  }
  return fallback
}

function resolveMessage(params?: SearchParams) {
  const explicit = firstValue(params?.message)
  if (explicit) return explicit
  const error = firstValue(params?.error)
  if (error && friendlyErrors[error]) {
    return friendlyErrors[error]
  }
  return null
}

export default function LoginPage({ searchParams }: { searchParams?: SearchParams }) {
  const redirectTo = sanitizePath(firstValue(searchParams?.from) ?? firstValue(searchParams?.callbackUrl))
  const message = resolveMessage(searchParams)
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
      <div className="mx-auto flex max-w-4xl flex-col gap-10 rounded-[32px] border border-border-subtle bg-surface-base/80 p-8 shadow-soft md:flex-row md:p-12">
        <div className="flex-1 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">Welcome back</p>
          <h1 className="text-4xl font-semibold text-text-primary md:text-5xl">Sign in to GlowGlitch</h1>
          <p className="text-base text-text-secondary">
            Track your made-to-order pieces, chat with Aurora Concierge, and continue customizing designs across devices.
          </p>
          <div className="rounded-2xl border border-border-subtle bg-surface-panel/40 px-4 py-3 text-sm text-text-tertiary">
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className="font-semibold text-accent hover:underline">
              Create one in seconds
            </Link>
            .
          </div>
        </div>

        <div className="flex-1 rounded-3xl border border-border-subtle bg-surface-panel/60 px-6 py-8 backdrop-blur">
          <div className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Account access</p>
            <h2 className="text-2xl font-semibold text-text-primary">Customer login</h2>
          </div>
          <div className="mt-6 space-y-6">
            {socialProviders.length > 0 && (
              <>
                <SocialSignInButtons redirectTo={redirectTo} providers={socialProviders} />
                <div className="text-center text-xs uppercase tracking-[0.3em] text-text-tertiary">or</div>
              </>
            )}
            <LoginForm redirectTo={redirectTo} initialMessage={message} />
            <div className="text-center text-sm text-text-secondary">
              <span>Forgot your password? </span>
              <Link href="/forgot-password" className="font-semibold text-accent hover:underline">
                Reset it here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
