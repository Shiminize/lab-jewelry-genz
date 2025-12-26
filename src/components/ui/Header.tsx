'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from './Button'
import { CartIndicator } from '@/components/cart/CartIndicator'
import { GlowGlitchLogo } from './Logo'
import { MegaNav } from './MegaNav'
import { MobileNav } from './MobileNav'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 border-b border-brand-ink/10 bg-brand-bg/90 backdrop-blur-md">
      <div className="relative flex items-center justify-between px-4 py-5 sm:px-6">
        <GlowGlitchLogo className="text-brand-ink" />
        <MegaNav />
        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <Link
              href="/account"
              className="text-sm font-medium text-brand-text/80 transition-colors duration-200 hover:text-brand-ink"
            >
              Account
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-brand-text/80 transition-colors duration-200 hover:text-brand-ink"
            >
              Sign in
            </Link>
          )}
          <CartIndicator />
          <Button tone="coral" variant="accent">
            Start customizing
          </Button>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <CartIndicator />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
