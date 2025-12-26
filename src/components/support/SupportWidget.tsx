'use client'

import { useEffect, useState } from 'react'
import { isWidgetEnabled } from '@/lib/feature-flags'
import type { ConciergeIntent } from '@/lib/concierge/types'
import { useWidgetState } from './hooks/useWidgetState'
import { useWidgetActions } from './hooks/useWidgetActions'
import { useCart } from '@/features/cart/context/CartContext'
import { WidgetShell } from './Widget/WidgetShell'
import { WidgetConversation } from './Widget/WidgetConversation'
import { WidgetComposer } from './Widget/WidgetComposer'
import { WidgetErrorBoundary } from './ErrorBoundary'
import { ShortlistDrawer } from './Widget/ShortlistDrawer'
import { trackEvent } from '@/lib/concierge/analytics'
import { conciergeDataMode, allowStubInProd } from '@/lib/concierge/config'
import { analyticsConfig } from '@/lib/concierge/analyticsConfig'

export function SupportWidget({ userId }: { userId?: string } = {}) {
  // Feature flag check - don't render if widget is disabled for this user
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    setShouldRender(isWidgetEnabled(userId))
  }, [userId])

  // Health telemetry on mount
  useEffect(() => {
    trackEvent('concierge_health', {
      dataMode: conciergeDataMode,
      analyticsSink: analyticsConfig.sink,
      analyticsEndpoint: analyticsConfig.endpoint,
      stubAllowedInProd: allowStubInProd,
      env: process.env.NODE_ENV,
    })
    if (conciergeDataMode === 'stub' && process.env.NODE_ENV === 'production') {
      trackEvent('concierge_stub_prod', { allowed: allowStubInProd })
    }
  }, [])

  // State management
  const widgetState = useWidgetState()
  const [showIntro, setShowIntro] = useState(!widgetState.session.introDismissedAt)
  const [inputValue, setInputValue] = useState('')
  const [isShortlistOpen, setIsShortlistOpen] = useState(false)

  useEffect(() => {
    setShowIntro(!widgetState.session.introDismissedAt)
  }, [widgetState.session.introDismissedAt])

  useEffect(() => {
    if (!widgetState.isOpen) {
      setIsShortlistOpen(false)
    }
  }, [widgetState.isOpen])

  useEffect(() => {
    if (widgetState.session.shortlist.length === 0) {
      setIsShortlistOpen(false)
    }
  }, [widgetState.session.shortlist.length])

  const dismissIntro = (value: boolean) => {
    setShowIntro(value)
    widgetState.updateSession({
      introDismissedAt: value ? null : widgetState.session.introDismissedAt ?? Date.now(),
    })
  }

  // Actions
  const { addItem: cartAddItem } = useCart()
  const actions = useWidgetActions({
    stateRef: widgetState.stateRef,
    appendMessages: widgetState.appendMessages,
    replaceMessages: widgetState.replaceMessages,
    updateSession: widgetState.updateSession,
    setProcessing: widgetState.setProcessing,
    setShowIntro: dismissIntro,
    ensureOpen: widgetState.openWidget,
    cartAddItem,
  })

  useEffect(() => {
    function handleSetFilters(event: Event) {
      const custom = event as CustomEvent<Record<string, unknown>>
      if (!custom.detail) return
      actions.runIntent('find_product', {
        source: 'debug-event',
        filters: custom.detail,
      })
    }

    function handleAddToShortlist(event: Event) {
      const custom = event as CustomEvent<{ product: import('@/lib/concierge/types').ProductSummary }>
      if (!custom.detail?.product) return
      actions.handleModuleAction({ type: 'shortlist-product', data: { product: custom.detail.product } })
      widgetState.openWidget()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('widget:setFilters', handleSetFilters as EventListener)
      window.addEventListener('widget:addToShortlist', handleAddToShortlist as EventListener)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('widget:setFilters', handleSetFilters as EventListener)
        window.removeEventListener('widget:addToShortlist', handleAddToShortlist as EventListener)
      }
    }
  }, [actions])

  useEffect(() => {
    function handleToggle() {
      // If closed, open. If open, close.
      widgetState.toggleWidget()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('widget:toggle', handleToggle)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('widget:toggle', handleToggle)
      }
    }
  }, [widgetState.toggleWidget])

  const handleModuleAction = (action: { type: string; data?: unknown }, originIntent?: ConciergeIntent) => {
    if (action.type === 'shortlist-open-drawer') {
      setIsShortlistOpen(true)
      trackEvent('shortlist_drawer_open', {
        sessionId: widgetState.session.id,
        shortlistCount: widgetState.session.shortlist.length,
      })
      return
    }
    actions.handleModuleAction(action, originIntent)
  }

  // Don't render if feature flag is disabled
  if (!shouldRender) {
    return null
  }

  const handleSend = () => {
    if (!inputValue.trim()) return
    actions.handleSendMessage(inputValue)
    setInputValue('')
  }

  const toggleShortlist = () => {
    const next = !isShortlistOpen
    setIsShortlistOpen(next)
    trackEvent(next ? 'shortlist_drawer_open' : 'shortlist_drawer_close', {
      sessionId: widgetState.session.id,
      shortlistCount: widgetState.session.shortlist.length,
    })
  }

  const shortlistDrawer = (
    <ShortlistDrawer
      isOpen={isShortlistOpen}
      items={widgetState.session.shortlist}
      disabled={widgetState.isProcessing}
      onClose={() => {
        setIsShortlistOpen(false)
        trackEvent('shortlist_drawer_close', {
          sessionId: widgetState.session.id,
          shortlistCount: widgetState.session.shortlist.length,
        })
      }}
      onAction={(action) => handleModuleAction(action)}
    />
  )

  return (
    <WidgetErrorBoundary>
      <WidgetShell
        isOpen={widgetState.isOpen}
        sessionId={widgetState.session.id}
        shortlistCount={widgetState.session.shortlist.length}
        onShortlistToggle={toggleShortlist}
        isShortlistOpen={isShortlistOpen}
        onToggle={widgetState.toggleWidget}
        onClose={widgetState.closeWidget}
      >
        <WidgetConversation
          messages={widgetState.messages}
          showIntro={showIntro}
          isProcessing={widgetState.isProcessing}
          onQuickLink={actions.handleQuickLink}
          onModuleAction={handleModuleAction}
        />
        <WidgetComposer
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSend}
          onQuickLink={actions.handleQuickLink}
          onInlineAction={actions.handleInlineAction}
          onOpenShortlist={toggleShortlist}
          shortlistCount={widgetState.session.shortlist.length}
          isProcessing={widgetState.isProcessing}
          isOpen={widgetState.isOpen}
          onFocusInput={widgetState.openWidget}
        />
      </WidgetShell>
      {shortlistDrawer}
    </WidgetErrorBoundary>
  )
}
