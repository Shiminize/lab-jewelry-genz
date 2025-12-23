'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Typography } from '@/components/ui'
import {
  QUICK_LINKS,
  type ConciergeIntent,
  type ModulePayload,
  type WidgetMessage,
} from '@/lib/concierge/types'
import { ModuleRenderer } from '../modules'

const SUPPORT_EMAIL = 'concierge@glowglitch.com'

interface WidgetConversationProps {
  messages: WidgetMessage[]
  showIntro: boolean
  isProcessing: boolean
  onQuickLink: (intent: ConciergeIntent, payload?: Record<string, unknown>) => void
  onModuleAction: (action: { type: string; data?: unknown }, originIntent?: ConciergeIntent) => void
}

export function WidgetConversation({
  messages,
  showIntro,
  isProcessing,
  onQuickLink,
  onModuleAction,
}: WidgetConversationProps) {
  const bodyRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight })
  }, [messages])

  return (
    <div ref={bodyRef} className="flex-1 space-y-3 overflow-y-auto bg-surface-base px-4 py-3" aria-live="polite" role="log">
      {showIntro ? (
        <div className="border border-border-subtle bg-surface-base px-3 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
          <Typography variant="eyebrow" className="text-[10px] uppercase tracking-[0.24em] text-text-muted">
            Aurora Concierge
          </Typography>
          <p className="mt-1 text-[12px] leading-relaxed text-text-primary">
            Select a topic or type your request below.
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {QUICK_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => onQuickLink(link.intent, link.payload)}
                className="inline-flex items-center justify-center gap-2 border border-border-subtle/70 bg-neutral-50 px-3 py-2 text-[11px] font-semibold text-text-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition hover:border-text-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-1"
              >
                {link.label}
              </button>
            ))}
            <Link
              href={`mailto:${SUPPORT_EMAIL}?subject=GlowGlitch%20Support%20Request`}
              className="inline-flex items-center justify-center gap-2 border border-border-subtle/70 bg-surface-base px-3 py-2 text-[11px] font-semibold text-text-primary transition hover:border-text-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-1"
            >
              Email concierge
            </Link>
          </div>
        </div>
      ) : null}

      {messages.map((message) => {
        if (message.type === 'text') {
          const text = message.payload as string
          const isGuest = message.role === 'guest'
          return (
            <div key={message.id} className={`flex ${isGuest ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${isGuest
                  ? 'border border-border-subtle bg-neutral-50 text-text-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]'
                  : 'border-l-2 border-accent-primary bg-surface-base pl-4 text-text-primary'
                  }`}
              >
                {text}
              </div>
            </div>
          )
        }

        return (
          <div key={message.id} className="flex justify-start">
            <ModuleRenderer
              module={message.payload as ModulePayload}
              isProcessing={isProcessing}
              onAction={(action) => onModuleAction(action, message.intent)}
            />
          </div>
        )
      })}

      {isProcessing && messages.length > 0 && (
        <div className="flex justify-start">
          <div className="border-l-2 border-accent-primary bg-surface-base px-4 py-3">
            <span className="inline-flex h-2 w-2 animate-pulse bg-text-muted" aria-hidden />
            <span className="inline-flex h-2 w-2 animate-pulse bg-text-muted/80 px-1" aria-hidden />
            <span className="inline-flex h-2 w-2 animate-pulse bg-text-muted/60" aria-hidden />
          </div>
        </div>
      )}

      {messages.length === 0 && !showIntro && (
        <div className="border border-border-subtle bg-surface-base px-4 py-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
          <p className="text-sm text-text-secondary">Begin a conversation.</p>
        </div>
      )}
    </div>
  )
}
