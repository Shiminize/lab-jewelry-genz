'use client'

import { createMessage, type ModulePayload, type WidgetState, type ConciergeIntent } from '@/lib/concierge/types'
import { trackEvent } from '@/lib/concierge/analytics'
import type { RefObject } from 'react'

type ShortlistCtx = {
  stateRef: RefObject<WidgetState>
  updateSession: (patch: Partial<WidgetState['session']>) => void
  appendMessages: (messages: ReturnType<typeof createMessage>[]) => void
  runIntent: (intent: ConciergeIntent, extra?: Record<string, unknown>) => Promise<void>
  createRequestId: (scope: string) => string
}

export async function handleShortlistAction(
  action: { type: string; data?: Record<string, unknown> | undefined },
  originIntent: ConciergeIntent | undefined,
  ctx: ShortlistCtx
): Promise<boolean> {
  const { stateRef, updateSession, appendMessages, runIntent, createRequestId } = ctx
  const dataRecord =
    action.data && typeof action.data === 'object' && !Array.isArray(action.data)
      ? (action.data as Record<string, unknown>)
      : undefined

  switch (action.type) {
    case 'shortlist-product': {
      const product = dataRecord?.product as import('@/lib/concierge/types').ProductSummary | undefined
      if (!product) return true
      const shortlist = stateRef.current?.session.shortlist || []
      const sessionId = stateRef.current?.session.id
      const orderNumber = stateRef.current?.session.lastOrder?.orderNumber
      const requestId = createRequestId('shortlist')

      const updatedShortlist = shortlist.some((item) => item.id === product.id)
        ? shortlist
        : [...shortlist, product]

      updateSession({ shortlist: updatedShortlist, lastIntent: originIntent })

      try {
        await fetch('/api/support/shortlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-request-id': requestId,
          },
          body: JSON.stringify({
            sessionId: stateRef.current?.session.id,
            items: updatedShortlist,
          }),
        })
        appendMessages([
          createMessage('concierge', `Saved ${product.title} to your shortlist.`),
          createMessage(
            'concierge',
            `You now have ${updatedShortlist.length} item${updatedShortlist.length === 1 ? '' : 's'} saved.`
          ),
          createMessage(
            'concierge',
            {
              type: 'shortlist-panel',
              id: 'shortlist-panel',
              title: 'My shortlist',
              items: updatedShortlist,
              ctaLabel: 'Invite stylist to review',
            },
            originIntent
          ),
        ])
        trackEvent('product_shortlisted', {
          productId: product.id,
          sessionId,
          requestId,
          shortlistCount: updatedShortlist.length,
          orderNumber,
        })
      } catch (error) {
        appendMessages([
          createMessage('concierge', 'I could not save that shortlist item just now—mind trying again in a moment?'),
        ])
        trackEvent('product_shortlist_error', { productId: product.id, sessionId, requestId })
      }
      return true
    }
    case 'shortlist-escalate': {
      const shortlist = stateRef.current?.session.shortlist || []
      trackEvent('shortlist_escalate', {
        sessionId: stateRef.current?.session.id,
        shortlistCount: shortlist.length,
        orderNumber: stateRef.current?.session.lastOrder?.orderNumber,
      })
      await runIntent('stylist_contact', { source: 'shortlist', shortlist })
      return true
    }
    case 'shortlist-share': {
      const shortlist = stateRef.current?.session.shortlist || []
      const sessionId = stateRef.current?.session.id
      const requestId = createRequestId('shortlist-share')
      const lines = shortlist.map((item) => `${item.title} — $${item.price?.toLocaleString?.() ?? ''}`)
      const shareText = `Here are my saved pieces:\n\n${lines.join('\n') || 'No items saved yet.'}\n\nSent from Aurora Concierge`
      const shareUrl = typeof window !== 'undefined' ? window.location.href : undefined
      const mailtoHref =
        typeof window !== 'undefined'
          ? `mailto:?subject=My GlowGlitch shortlist&body=${encodeURIComponent(shareText)}`
          : undefined

      try {
        if (typeof navigator !== 'undefined' && 'share' in navigator && shortlist.length > 0) {
          await (navigator as Navigator & { share?: (data: { title?: string; text?: string; url?: string }) => Promise<void> }).share(
            {
              title: 'My GlowGlitch shortlist',
              text: shareText,
              url: shareUrl,
            }
          )
          appendMessages([createMessage('concierge', 'Shared your shortlist. A stylist will have the same view.')])
          trackEvent('shortlist_share', {
            sessionId,
            shortlistCount: shortlist.length,
            requestId,
            method: 'native-share',
          })
        } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareText)
          appendMessages([
            createMessage('concierge', 'Copied your shortlist. Paste it anywhere to share with the studio.'),
          ])
          trackEvent('shortlist_share', {
            sessionId,
            shortlistCount: shortlist.length,
            requestId,
            method: 'clipboard',
          })
        } else if (mailtoHref) {
          window.location.href = mailtoHref
          appendMessages([createMessage('concierge', 'Opened your email app with the shortlist attached.')])
          trackEvent('shortlist_share', {
            sessionId,
            shortlistCount: shortlist.length,
            requestId,
            method: 'mailto',
          })
        } else {
          appendMessages([
            createMessage(
              'concierge',
              'Here is your shortlist to copy:\n' + shareText + '\n\nTip: paste this into chat or email so a stylist can jump in.'
            ),
          ])
          trackEvent('shortlist_share', {
            sessionId,
            shortlistCount: shortlist.length,
            requestId,
            method: 'fallback',
          })
        }
      } catch (error) {
        appendMessages([createMessage('concierge', 'I could not share that just now—mind trying again in a moment?')])
        trackEvent('shortlist_share_error', { sessionId, shortlistCount: shortlist.length, requestId })
      }
      return true
    }
    case 'shortlist-copy-link': {
      const shortlist = stateRef.current?.session.shortlist || []
      const sessionId = stateRef.current?.session.id
      const requestId = createRequestId('shortlist-copy')
      const url =
        typeof window !== 'undefined'
          ? `${window.location.origin}/collections?shortlist=${encodeURIComponent(
              shortlist.map((i) => i.id).join(',')
            )}`
          : ''
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText && url) {
          await navigator.clipboard.writeText(url)
          appendMessages([
            createMessage('concierge', 'Copied a link to reopen your saved pieces. Share it with your crew or stylist.'),
          ])
          trackEvent('shortlist_share', {
            sessionId,
            shortlistCount: shortlist.length,
            requestId,
            method: 'link-copy',
          })
        } else {
          appendMessages([
            createMessage(
              'concierge',
              url
                ? `Here’s your shortlist link:\n${url}\n\nCopy and share to reopen these picks on any device.`
                : 'Shortlist link unavailable right now—mind trying again in a moment?'
            ),
          ])
          trackEvent('shortlist_share', {
            sessionId,
            shortlistCount: shortlist.length,
            requestId,
            method: 'link-fallback',
          })
        }
      } catch (error) {
        appendMessages([createMessage('concierge', 'I could not copy that link—mind trying again in a moment?')])
        trackEvent('shortlist_share_error', { sessionId, shortlistCount: shortlist.length, requestId })
      }
      return true
    }
    case 'shortlist-view-links': {
      const title = typeof dataRecord?.title === 'string' ? dataRecord.title : 'this piece'
      const productId = typeof dataRecord?.productId === 'string' ? dataRecord.productId : ''
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const pdpUrl = productId ? `${baseUrl}/products/${productId}` : `${baseUrl}/collections`
      const collectionUrl = `${baseUrl}/collections?highlight=${encodeURIComponent(productId || 'shortlist')}`

      appendMessages([
        createMessage(
          'concierge',
          `Reopen ${title}:\n• PDP: ${pdpUrl}\n• Collection: ${collectionUrl}\n\nTip: Save or share these links to revisit your shortlist.`
        ),
      ])
      trackEvent('shortlist_view_links', {
        productId,
        sessionId: stateRef.current?.session.id,
      })
      return true
    }
    case 'shortlist-clear': {
      const sessionId = stateRef.current?.session.id
      const requestId = createRequestId('shortlist')
      if (typeof window !== 'undefined') {
        const confirmed = window.confirm('Remove all saved pieces?')
        if (!confirmed) {
          trackEvent('shortlist_clear_cancel', {
            sessionId,
            requestId,
            shortlistCount: stateRef.current?.session.shortlist?.length ?? 0,
          })
          return true
        }
      }
      updateSession({ shortlist: [], lastIntent: originIntent })
      try {
        await fetch('/api/support/shortlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-request-id': requestId,
          },
          body: JSON.stringify({
            sessionId,
            items: [],
          }),
        })
        appendMessages([
          createMessage('concierge', 'Cleared your shortlist. Save any new pieces you like.'),
          createMessage(
            'concierge',
            {
              type: 'shortlist-panel',
              id: 'shortlist-panel',
              title: 'My shortlist',
              items: [],
              ctaLabel: 'Invite stylist to review',
            } as ModulePayload,
            originIntent
          ),
        ])
        trackEvent('product_shortlisted', {
          productId: undefined,
          sessionId,
          requestId,
          shortlistCount: 0,
          cleared: true,
          orderNumber: stateRef.current?.session.lastOrder?.orderNumber,
        })
      } catch (error) {
        appendMessages([createMessage('concierge', 'I could not clear your shortlist right now—mind trying again in a moment?')])
        trackEvent('product_shortlist_error', { sessionId, requestId })
      }
      return true
    }
    case 'shortlist-remove': {
      const productId = typeof dataRecord?.productId === 'string' ? dataRecord.productId : undefined
      if (!productId) return true
      const shortlist = (stateRef.current?.session.shortlist || []).filter((item) => item.id !== productId)
      const sessionId = stateRef.current?.session.id
      const requestId = createRequestId('shortlist')
      updateSession({ shortlist, lastIntent: originIntent })
      try {
        await fetch('/api/support/shortlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-request-id': requestId,
          },
          body: JSON.stringify({
            sessionId,
            items: shortlist,
          }),
        })
        appendMessages(
          [
            createMessage(
              'concierge',
              shortlist.length === 0
                ? 'Removed that item. Your shortlist is now empty.'
                : `Removed that item. You now have ${shortlist.length} item${shortlist.length === 1 ? '' : 's'} saved.`
            ),
            shortlist.length > 0
              ? createMessage(
                  'concierge',
                  {
                    type: 'shortlist-panel',
                    id: 'shortlist-panel',
                    title: 'My shortlist',
                    items: shortlist,
                    ctaLabel: 'Invite stylist to review',
                  },
                  originIntent
                )
              : null,
          ].filter(Boolean) as ReturnType<typeof createMessage>[]
        )
        trackEvent('product_shortlisted', {
          productId,
          sessionId,
          requestId,
          shortlistCount: shortlist.length,
          removed: true,
          orderNumber: stateRef.current?.session.lastOrder?.orderNumber,
        })
      } catch (error) {
        appendMessages([createMessage('concierge', 'I could not update your shortlist just now—mind trying again in a moment?')])
        trackEvent('product_shortlist_error', { productId, sessionId, requestId })
      }
      return true
    }
    default:
      return false
  }
}
