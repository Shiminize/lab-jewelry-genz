import { useCallback, useRef, type RefObject } from 'react'
import { createMessage, type ConciergeIntent, type WidgetState, type ModulePayload } from '@/lib/concierge/types'
import type { SortBy } from '@/lib/concierge/providers/types'
import { detectIntent } from '@/lib/concierge/intentRules'
import { executeIntent } from '@/lib/concierge/scripts'
import { trackEvent } from '@/lib/concierge/analytics'
import { handleShortlistAction } from './shortlistActions'
import { logIntentSuccess } from './intentAnalytics'

function createRequestId(scope: string) {
  const suffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  return `${scope}-${suffix}`
}

interface UseWidgetActionsParams {
  stateRef: RefObject<WidgetState>
  appendMessages: (messages: import('@/lib/concierge/types').WidgetMessage[]) => void
  replaceMessages: (messages: import('@/lib/concierge/types').WidgetMessage[]) => void
  updateSession: (patch: Partial<WidgetState['session']>) => void
  setProcessing: (value: boolean) => void
  setShowIntro?: (value: boolean) => void
  ensureOpen?: () => void
  cartAddItem?: (slug: string, quantity?: number) => Promise<boolean>
}

export function useWidgetActions({
  stateRef,
  appendMessages,
  replaceMessages,
  updateSession,
  setProcessing,
  setShowIntro,
  ensureOpen,
  cartAddItem,
}: UseWidgetActionsParams) {
  const purgeModules = useCallback(() => {
    const currentMessages = stateRef.current?.messages ?? []
    const keptTypes = new Set<string>()
    const prunedReversed: typeof currentMessages = []
    for (let i = currentMessages.length - 1; i >= 0; i--) {
      const msg = currentMessages[i]
      if (msg.type === 'module') {
        const payload = msg.payload as ModulePayload | undefined
        const moduleType = payload?.type ?? 'unknown-module'
        if (keptTypes.has(moduleType)) {
          continue
        }
        keptTypes.add(moduleType)
        prunedReversed.push(msg)
        continue
      }
      prunedReversed.push(msg)
    }
    const pruned = prunedReversed.reverse()
    if (pruned.length !== currentMessages.length) {
      replaceMessages(pruned)
      trackEvent('intent_modules_pruned', {
        sessionId: stateRef.current?.session.id,
        before: currentMessages.length,
        after: pruned.length,
      })
    }
  }, [replaceMessages, stateRef])

  const missCountRef = useRef(0)

  const showDisambiguation = useCallback(
    (
      reason: 'no_match' | 'low_confidence',
      detected?: { intent: ConciergeIntent; confidence?: number; reason?: string },
      text?: string,
      options?: { forceHuman?: boolean }
    ) => {
      const nextMissCount = missCountRef.current + 1
      missCountRef.current = nextMissCount
      const emphasizeHuman = options?.forceHuman || nextMissCount >= 2

      const chooser: ModulePayload = {
        type: 'intent-chooser',
        id: `intent-chooser-${Date.now()}`,
        headline: 'What do you need?',
        description: 'Pick an option to jump right into the right flow.',
        emphasizeHuman,
      }

      appendMessages([
        createMessage(
          'concierge',
          nextMissCount >= 2
            ? "I want to be sure I'm helping with the right thing. Choose one below—or I can bring in a stylist."
            : "Got it. Pick what you need and I’ll route you quickly."
        ),
        createMessage('concierge', chooser),
      ])

      trackEvent('intent_disambiguation_shown', {
        reason,
        text,
        intent: detected?.intent,
        confidence: detected?.confidence,
        detectedReason: detected?.reason,
        lastIntent: stateRef.current?.session.lastIntent,
        missCount: nextMissCount,
        sessionId: stateRef.current?.session.id,
      })
    },
    [appendMessages, stateRef]
  )

  const runIntent = useCallback(
    async (intent: ConciergeIntent, extra?: Record<string, unknown>) => {
      ensureOpen?.()
      const sessionId = stateRef.current?.session.id
      const orderNumber =
        stateRef.current?.session.lastOrder?.orderNumber ?? stateRef.current?.session.lastOrder?.orderId
      const requestId = createRequestId(intent)
      const payload = { ...(extra ?? {}), requestId }

      trackEvent('intent_detected', {
        intent,
        source: extra?.source,
        reason: (extra as { reason?: string } | undefined)?.reason,
        sessionId,
        requestId,
        orderNumber,
      })
      setProcessing(true)
      try {
        const response = await executeIntent({ intent, payload, state: stateRef.current! })
        appendMessages(response.messages)
        if (response.sessionPatch) {
          updateSession(response.sessionPatch)
        }
        setTimeout(() => purgeModules(), 0)
        if (response.error) {
          trackEvent('intent_error', { intent, error: response.error, sessionId, requestId, orderNumber })
        } else {
          logIntentSuccess(intent, response, { sessionId, requestId, orderNumber }, extra)
        }
      } catch (error) {
        appendMessages([createMessage('concierge', 'I ran into a snag—mind trying that again?')])
        trackEvent('intent_error', {
          intent,
          sessionId,
          requestId,
          error: error instanceof Error ? error.message : 'unknown',
          orderNumber,
        })
      } finally {
        setProcessing(false)
      }
    },
    [stateRef, appendMessages, purgeModules, updateSession, setProcessing, ensureOpen]
  )

  const handleModuleAction = useCallback(
    async (action: { type: string; data?: unknown }, originIntent?: ConciergeIntent) => {
      ensureOpen?.()
      const dataRecord =
        action.data && typeof action.data === 'object' && !Array.isArray(action.data)
          ? (action.data as Record<string, unknown>)
          : undefined

      const handledShortlist = await handleShortlistAction(
        { ...action, data: dataRecord },
        originIntent,
        {
          stateRef,
          updateSession,
          appendMessages,
          runIntent,
          createRequestId,
        }
      )
      if (handledShortlist) return

      switch (action.type) {
        case 'submit-product-filters':
          setShowIntro?.(false)
          return runIntent('find_product', { action: action.type, ...(dataRecord ?? {}) })
        case 'submit-order-lookup':
          setShowIntro?.(false)
          return runIntent('track_order', { action: action.type, ...(dataRecord ?? {}) })
        case 'submit-return-option': {
          setShowIntro?.(false)
          const lastOrder = stateRef.current?.session.lastOrder
          if (!lastOrder?.orderId && !lastOrder?.orderNumber) {
            appendMessages([
              createMessage(
                'concierge',
                'I need an order number first—tap “Track order” so I can file the return with the studio.'
              ),
            ])
            return
          }
          return runIntent('return_exchange', {
            action: action.type,
            ...((dataRecord ?? {}) as Record<string, unknown>),
            orderId: lastOrder.orderId ?? lastOrder.orderNumber,
            orderNumber: lastOrder.orderNumber ?? lastOrder.orderId,
          })
        }
        case 'submit-escalation':
          return runIntent('stylist_contact', { action: action.type, ...(dataRecord ?? {}) })
        case 'submit-csat':
          return runIntent('csat', { action: action.type, ...(dataRecord ?? {}) })
        case 'offer-action':
          return
        case 'view-product': {
          const product = dataRecord?.product as { id: string; title?: string; slug?: string } | undefined
          trackEvent('product_view', { productId: product?.id })
          if (product && typeof window !== 'undefined') {
            const url = product.slug ? `/products/${product.slug}` : `/collections?search=${encodeURIComponent(product.title || product.id)}`
            window.open(url, '_blank', 'noopener')
          }
          return
        }
        case 'shortlist-add-to-cart': {
          const product = dataRecord?.product as { id: string; title?: string; slug?: string; price?: number } | undefined
          if (!product?.slug || !cartAddItem) return
          setProcessing(true)
          try {
            await cartAddItem(product.slug, 1)
            appendMessages([createMessage('concierge', `Added ${product.title || 'item'} to your cart.`)])
            trackEvent('shortlist_add_to_cart', {
              productId: product.id,
              slug: product.slug,
              sessionId: stateRef.current?.session.id,
            })
          } catch (e) {
            appendMessages([createMessage('concierge', `Could not add ${product.title} to cart right now.`)])
          } finally {
            setProcessing(false)
          }
          return
        }
        case 'shortlist-checkout': {
          const shortlist = stateRef.current?.session.shortlist || []
          const sessionId = stateRef.current?.session.id

          trackEvent('shortlist_checkout_click', {
            sessionId,
            shortlistCount: shortlist.length,
          })

          if (cartAddItem && shortlist.length > 0) {
            setProcessing(true)
            appendMessages([createMessage('concierge', 'Adding your saved items to the cart...')])
            try {
              let successCount = 0
              let failCount = 0
              let missingSlugCount = 0

              // Add all items sequentially to ensure order
              for (const item of shortlist) {
                if (item.slug) {
                  const success = await cartAddItem(item.slug, 1)
                  if (success) successCount++
                  else failCount++
                } else {
                  missingSlugCount++
                }
              }

              if (successCount > 0) {
                appendMessages([createMessage('concierge', `Added ${successCount} item${successCount === 1 ? '' : 's'} to your cart. Heading to checkout.`)])
              } else {
                appendMessages([createMessage('concierge', 'Could not add items to cart. Taking you to cart anyway.')])
              }

              if (missingSlugCount > 0) {
                console.warn(`Shortlist contains ${missingSlugCount} items without slugs.`)
              }

            } catch (e) {
              console.error('Failed to add some shortlist items to cart', e)
              appendMessages([createMessage('concierge', 'Some items might not have added, but taking you to cart now.')])
            } finally {
              setProcessing(false)
            }
          }

          if (typeof window !== 'undefined') {
            window.open('/cart', '_blank', 'noopener')
          }
          return
        }
        case 'apply-filters': {
          const suggestion = dataRecord as { slug?: string; filters?: Record<string, unknown> } | undefined
          setShowIntro?.(false)
          trackEvent('concierge_empty_state_cta_clicked', {
            suggestion: suggestion?.slug ?? 'unknown',
            filtersApplied: suggestion?.filters,
          })
          return runIntent('find_product', {
            source: 'quickstart',
            slug: suggestion?.slug,
            filters: suggestion?.filters,
          })
        }
        case 'intent-chooser-select': {
          const intent = dataRecord?.intent as ConciergeIntent | undefined
          if (!intent) return
          setShowIntro?.(false)
          missCountRef.current = 0
          trackEvent('intent_disambiguation_selected', {
            intent,
            source: typeof dataRecord?.source === 'string' ? dataRecord.source : 'intent-chooser',
            sessionId: stateRef.current?.session.id,
          })
          const intentCopy: Record<ConciergeIntent, string> = {
            find_product: "On it—I'll open product recommendations.",
            track_order: 'On it—opening order lookup.',
            return_exchange: 'On it—starting returns & resizing.',
            sizing_repairs: 'On it—starting sizing help.',
            care_warranty: 'On it—sharing care & warranty info.',
            financing: 'On it—pulling financing options.',
            stylist_contact: 'On it—bringing in a stylist.',
            csat: 'Happy to take feedback.',
          }

          const isProductIntent = intent === 'find_product'
          const payloadFromChooser = (dataRecord?.payload ?? {}) as Record<string, unknown>
          const shouldDefaultReadyToShip =
            isProductIntent && (!payloadFromChooser || Object.keys(payloadFromChooser).length === 0)
          const payload = isProductIntent
            ? {
              source: 'intent-chooser',
              ...(shouldDefaultReadyToShip ? { slug: 'ready-to-ship', filters: { readyToShip: true } } : {}),
              ...payloadFromChooser,
            }
            : { source: 'intent-chooser', ...payloadFromChooser }

          const confirmationCopy =
            shouldDefaultReadyToShip && isProductIntent
              ? 'On it—pulling ready-to-ship picks to get you started.'
              : intentCopy[intent] ?? 'On it.'
          appendMessages([createMessage('concierge', confirmationCopy)])
          return runIntent(intent, payload)
        }
        case 'filter_change': {
          setShowIntro?.(false)
          const filters =
            dataRecord && typeof dataRecord.filters === 'object' && dataRecord.filters !== null
              ? (dataRecord.filters as Record<string, unknown>)
              : {}
          const sortBy =
            typeof dataRecord?.sortBy === 'string' ? (dataRecord.sortBy as SortBy) : undefined
          return runIntent('find_product', {
            source: 'module',
            filters,
            ...(sortBy ? { sortBy } : {}),
          })
        }
        case 'text-updates': {
          const sessionId = stateRef.current?.session.id
          const requestId = createRequestId('order-updates')
          try {
            const response = await fetch('/api/support/order-updates', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-request-id': requestId,
              },
              body: JSON.stringify({
                sessionId: stateRef.current?.session.id,
                originIntent,
                orderId: stateRef.current?.session.lastOrder?.orderId,
                orderNumber: stateRef.current?.session.lastOrder?.orderNumber,
              }),
            })
            const data = response.ok ? await response.json() : null
            appendMessages([
              createMessage('concierge', data?.message || "Perfect—I'll text studio milestones to you in real time."),
            ])
            trackEvent('timeline_text_updates', {
              success: response.ok,
              sessionId,
              requestId,
              orderNumber: stateRef.current?.session.lastOrder?.orderNumber,
            })
          } catch (error) {
            appendMessages([
              createMessage(
                'concierge',
                "I wasn't able to subscribe you just now. We can still email updates if that helps."
              ),
            ])
            trackEvent('timeline_text_updates_error', {
              sessionId,
              requestId,
              orderNumber: stateRef.current?.session.lastOrder?.orderNumber,
            })
          }
          return
        }
        default:
          return
      }
    },
    [appendMessages, ensureOpen, missCountRef, runIntent, setShowIntro, stateRef, updateSession]
  )

  const handleSendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return

      ensureOpen?.()
      setShowIntro?.(false)
      appendMessages([createMessage('guest', trimmed)])

      const context = {
        lastIntent: stateRef.current?.session.lastIntent,
        lastFilters: (stateRef.current?.session.lastFilters as Record<string, unknown> | null) ?? null,
      }

      const detected = detectIntent(trimmed, undefined, context)

      if (!detected) {
        trackEvent('intent_miss', {
          reason: 'no_match',
          text: trimmed,
          lastIntent: context.lastIntent,
          missCount: missCountRef.current + 1,
          sessionId: stateRef.current?.session.id,
        })
        showDisambiguation('no_match', undefined, trimmed)
        return
      }

      if (typeof detected.confidence === 'number' && detected.confidence < 0.7) {
        trackEvent('intent_miss', {
          reason: 'low_confidence',
          text: trimmed,
          confidence: detected.confidence,
          intent: detected.intent,
          detectedReason: detected.reason,
          lastIntent: context.lastIntent,
          missCount: missCountRef.current + 1,
          sessionId: stateRef.current?.session.id,
        })
        showDisambiguation('low_confidence', detected, trimmed, { forceHuman: detected.confidence < 0.5 })
        return
      }

      missCountRef.current = 0
      runIntent(detected.intent, { ...(detected.payload ?? {}), source: detected.source, reason: detected.reason })
    },
    [appendMessages, runIntent, setShowIntro, showDisambiguation, stateRef, ensureOpen]
  )

  const handleQuickLink = useCallback(
    (intent: ConciergeIntent, payload?: Record<string, unknown>) => {
      ensureOpen?.()
      setShowIntro?.(false)

      const slug =
        payload && typeof (payload as { slug?: unknown }).slug === 'string'
          ? (payload as { slug: string }).slug
          : undefined
      const filtersApplied =
        payload && typeof (payload as { filters?: unknown }).filters === 'object'
          ? (payload as { filters?: Record<string, unknown> }).filters
          : undefined

      trackEvent('concierge_quickstart_clicked', {
        slug: slug ?? intent,
        filtersApplied,
      })

      runIntent(intent, { source: 'explicit', ...(payload ?? {}) })
    },
    [ensureOpen, runIntent, setShowIntro]
  )

  const handleInlineAction = useCallback(
    (action: 'track' | 'stylist') => {
      ensureOpen?.()
      setShowIntro?.(false)
      if (action === 'track') {
        trackEvent('inline_track_order')
        return runIntent('track_order', { source: 'inline' })
      }
      trackEvent('inline_stylist')
      return runIntent('stylist_contact', { source: 'inline' })
    },
    [ensureOpen, runIntent, setShowIntro]
  )

  return {
    runIntent,
    handleModuleAction,
    handleSendMessage,
    handleQuickLink,
    handleInlineAction,
  }
}
