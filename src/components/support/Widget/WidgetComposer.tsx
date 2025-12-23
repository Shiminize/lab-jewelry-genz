'use client'

import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { QUICK_LINKS, type ConciergeIntent } from '@/lib/concierge/types'

interface WidgetComposerProps {
  inputValue: string
  onInputChange: (value: string) => void
  onSend: () => void
  onQuickLink: (intent: ConciergeIntent, payload?: Record<string, unknown>) => void
  onInlineAction: (action: 'track' | 'stylist') => void
  isProcessing: boolean
  isOpen: boolean
  onOpenShortlist: () => void
  shortlistCount: number
  onFocusInput?: () => void
}

export function WidgetComposer({
  inputValue,
  onInputChange,
  onSend,
  onQuickLink,
  onInlineAction,
  onOpenShortlist,
  shortlistCount,
  isProcessing,
  isOpen,
  onFocusInput,
}: WidgetComposerProps) {
  const composerRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const timeout = window.setTimeout(() => composerRef.current?.focus(), 180)
    return () => window.clearTimeout(timeout)
  }, [isOpen])

  return (
    <footer className="space-y-3 border-t border-border-subtle/10 bg-accent-primary px-4 py-3">
      <div className="flex gap-3">
        <input
          ref={composerRef}
          type="text"
          placeholder="Type a message..."
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onFocus={() => onFocusInput?.()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              onSend()
            }
          }}
          className="w-full border border-surface-base/20 bg-surface-base px-4 py-2 text-sm text-text-primary placeholder:text-text-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-base focus-visible:ring-offset-2 focus-visible:ring-offset-accent-primary disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isProcessing}
        />
        <button
          type="button"
          onClick={onSend}
          disabled={isProcessing}
          className="inline-flex items-center justify-center border border-surface-base/20 bg-surface-base text-sm font-semibold text-accent-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition hover:bg-surface-base/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-base focus-visible:ring-offset-2 focus-visible:ring-offset-accent-primary disabled:cursor-not-allowed disabled:opacity-60 px-4"
        >
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : 'Send'}
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => onInlineAction('track')}
          className="whitespace-nowrap border border-surface-base/10 bg-surface-base/10 px-3 py-1.5 text-[11px] font-semibold text-surface-base/80 transition hover:bg-surface-base/20 hover:text-surface-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-surface-base"
        >
          Order Status
        </button>
        <button
          type="button"
          onClick={() => onInlineAction('stylist')}
          className="whitespace-nowrap border border-surface-base/10 bg-surface-base/10 px-3 py-1.5 text-[11px] font-semibold text-surface-base/80 transition hover:bg-surface-base/20 hover:text-surface-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-surface-base"
        >
          Stylist Request
        </button>
        {QUICK_LINKS.map((link) => (
          <button
            key={link.id}
            type="button"
            onClick={() => onQuickLink(link.intent, link.payload)}
            disabled={isProcessing}
            className="whitespace-nowrap border border-surface-base/10 bg-surface-base/10 px-3 py-1.5 text-[11px] font-semibold text-surface-base/80 transition hover:bg-surface-base/20 hover:text-surface-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-surface-base disabled:cursor-not-allowed disabled:opacity-60"
          >
            {link.label}
          </button>
        ))}
      </div>
    </footer>
  )
}
