'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState } from 'react'

type NavItem = {
  href: string
  label: string
  icon: string
}

type SessionPreview = {
  user: {
    name?: string | null
    email?: string | null
  }
}

interface AdminSidebarProps {
  navItems: NavItem[]
  session: SessionPreview
  signOutAction: () => Promise<void>
}

export function AdminSidebar({ navItems, session, signOutAction }: AdminSidebarProps) {
  const pathname = usePathname()
  const [confirming, setConfirming] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  function isActive(href: string) {
    if (!pathname) return false
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  function handleConfirm() {
    formRef.current?.requestSubmit()
  }

  return (
    <aside className="hidden w-72 flex-col border-r border-border-subtle bg-surface-base/80 px-6 py-10 shadow-soft lg:flex">
      <div className="space-y-4 pb-8">
        <div>
          <p className="text-lg font-semibold text-text-primary">GlowGlitch Admin</p>
          <p className="text-xs text-text-secondary">
            Manage products, homepage, creator program, orders, and support analytics.
          </p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-surface-panel/40 px-4 py-3 text-left">
          <p className="text-sm font-semibold text-text-primary">{session.user.name ?? 'Admin'}</p>
          <p className="text-xs text-text-secondary">{session.user.email ?? 'admin@glowglitch.com'}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={[
              'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition',
              isActive(item.href)
                ? 'bg-accent-primary/15 text-text-primary'
                : 'text-text-secondary hover:bg-accent-primary/10 hover:text-text-primary',
            ].join(' ')}
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <form ref={formRef} action={signOutAction}>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-8 w-full rounded-full border border-border-subtle px-4 py-2 text-sm font-semibold text-text-secondary transition hover:border-accent-primary hover:text-text-primary"
        >
          Sign out
        </button>
      </form>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-border-subtle bg-surface-base p-6 text-center shadow-soft">
            <p className="text-lg font-semibold text-text-primary">Sign out?</p>
            <p className="mt-2 text-sm text-text-secondary">You’ll need to log in again to return to the dashboard.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-2xl border border-border-subtle px-4 py-2 text-sm font-semibold text-text-secondary transition hover:border-accent-primary hover:text-text-primary"
              >
                Stay here
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-accent/90"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
