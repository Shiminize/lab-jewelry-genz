'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'

export type SocialProvider = 'google' | 'apple' | 'facebook'

interface SocialSignInButtonsProps {
  redirectTo: string
  providers?: SocialProvider[]
}

const PROVIDER_LABELS: Record<SocialProvider, string> = {
  google: 'Continue with Google',
  apple: 'Continue with Apple',
  facebook: 'Continue with Facebook',
}

export function SocialSignInButtons({ redirectTo, providers = ['google'] }: SocialSignInButtonsProps) {
  const [isLoading, setIsLoading] = useState<SocialProvider | null>(null)

  const availableProviders = providers.filter(Boolean)
  if (availableProviders.length === 0) {
    return null
  }

  async function handleSignIn(provider: SocialProvider) {
    setIsLoading(provider)
    try {
      await signIn(provider, { callbackUrl: redirectTo || '/' })
    } catch (error) {
      console.error('Social sign-in failed', error)
      setIsLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      {availableProviders.map((provider) => (
        <button
          key={provider}
          type="button"
          onClick={() => handleSignIn(provider)}
          disabled={isLoading !== null}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border-subtle bg-surface-base/80 px-4 py-3 text-sm font-semibold text-text-primary transition hover:bg-surface-panel disabled:opacity-70"
        >
          {isLoading === provider ? 'Connecting…' : PROVIDER_LABELS[provider]}
        </button>
      ))}
    </div>
  )
}
