'use client'

import { useEffect, type ReactNode } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { Typography } from '@/components/ui'
import { conciergeDataMode, allowStubInProd } from '@/lib/concierge/config'
import { analyticsConfig } from '@/lib/concierge/analyticsConfig'
import { trackEvent } from '@/lib/concierge/analytics'

interface WidgetShellProps {
  isOpen: boolean
  sessionId?: string
  shortlistCount?: number
  onShortlistToggle?: () => void
  isShortlistOpen?: boolean
  onToggle: () => void
  onClose: () => void
  children: React.ReactNode
}

export function WidgetShell({
  isOpen,
  sessionId,
  shortlistCount,
  onShortlistToggle,
  isShortlistOpen,
  onToggle,
  onClose,
  children,
}: WidgetShellProps) {

  // Handle escape key
  useEffect(() => {
    if (!isOpen) {
      return
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        trackEvent('widget_close')
      }
    }

    // Focus Trap (Simple Implementation)
    const handleTabKey = (e: KeyboardEvent) => {
      if (!isOpen || e.key !== 'Tab') return
      e.stopPropagation()
      // Note: A full robust focus trap would act here.
      // For now, relies on native sequential nav, but we ensure 'Escape' works.
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keydown', handleTabKey)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keydown', handleTabKey)
    }
  }, [isOpen, onClose])

  return (
    <>
      <button
        type="button"
        onClick={() => {
          onToggle()
          trackEvent(isOpen ? 'widget_close' : 'widget_open', { sessionId })
        }}
        aria-expanded={isOpen}
        aria-controls="glowglitch-aurora-widget"
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-3 border border-border-subtle/70 bg-neutral-50 px-6 py-3 text-sm font-semibold text-text-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition hover:border-text-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
      >
        <span className="inline-flex h-5 items-center justify-center bg-surface-base/20 px-2 text-[10px] font-semibold uppercase tracking-[0.25em]">
          New
        </span>
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Concierge
      </button>

      <section
        id="glowglitch-aurora-widget"
        role="dialog"
        aria-modal="true"
        className={`supports-backdrop:backdrop-blur-lg fixed bottom-4 right-3 z-40 grid h-[min(640px,88vh)] max-h-[88vh] w-[calc(100vw_-_1rem)] max-w-[480px] grid-rows-[auto,1fr,auto] overflow-hidden border border-border-subtle bg-surface-base text-text-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition sm:bottom-20 sm:right-6 sm:w-[460px] ${isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
          }`}
      >
        <header className="flex items-center justify-between border-b border-border-subtle/10 bg-accent-primary px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-surface-base" />
            </div>
            <Typography as="h2" variant="heading" className="text-sm font-semibold text-surface-base">
              Concierge
            </Typography>
          </div>

          <div className="flex items-center gap-2">
            {onShortlistToggle && (
              <button
                type="button"
                onClick={() => {
                  onShortlistToggle()
                  trackEvent(isShortlistOpen ? 'shortlist_drawer_close' : 'shortlist_drawer_open', {
                    sessionId,
                    shortlistCount,
                  })
                }}
                className="text-[11px] font-semibold text-surface-base/80 transition hover:text-surface-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-base focus-visible:ring-offset-1"
              >
                Saved Items ({shortlistCount ?? 0})
              </button>
            )}
            <div className="h-4 w-px bg-surface-base/20" aria-hidden="true" />
            <button
              type="button"
              onClick={() => {
                onClose()
                trackEvent('widget_close', { sessionId })
              }}
              aria-label="Close Aurora Concierge"
              className="text-surface-base/80 transition hover:text-surface-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-base focus-visible:ring-offset-1"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>


      </section>
    </>
  )
}
