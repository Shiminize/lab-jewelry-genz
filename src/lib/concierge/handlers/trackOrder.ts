'use client'

import { createMessage, type IntentResponse, type ModulePayload } from '../types'
import type { HandlerArgs } from './types'
import { postJson } from './types'

export async function handleTrackOrder({ data, state, requestId }: HandlerArgs): Promise<IntentResponse> {
  if (data.action !== 'submit-order-lookup') {
    return {
      messages: [
        createMessage(
          'concierge',
          "Drop your order number or the email + postal code you used at checkout—I'll pull the latest timing."
        ),
        createMessage(
          'concierge',
          {
            type: 'order-lookup',
            id: 'order-lookup',
            mode: 'orderId',
          },
          'track_order'
        ),
      ],
      sessionPatch: { lastIntent: 'track_order' },
    }
  }

  const lookup =
    typeof data.details === 'object' && data.details !== null ? (data.details as Record<string, unknown>) : {}
  const result = await postJson<{
    reference: string
    entries: Array<{ label: string; date?: string; status: 'complete' | 'current' | 'upcoming' }>
  }>('/api/support/order-status', {
    ...lookup,
    sessionId: state.session.id,
    ...(requestId ? { requestId } : {}),
  })

  const timeline: ModulePayload = {
    type: 'order-timeline',
    id: 'order-timeline',
    headline: 'Here’s your latest order status.',
    reference: result.reference,
    entries: result.entries,
    actions: [{ id: 'text-updates', label: 'Text me updates' }],
  }

  const lastOrderContext = {
    orderId: typeof lookup.orderId === 'string' ? lookup.orderId : undefined,
    orderNumber: typeof result.reference === 'string' ? result.reference : undefined,
    email: typeof lookup.email === 'string' ? lookup.email : undefined,
    postalCode: typeof lookup.postalCode === 'string' ? lookup.postalCode : undefined,
  }

  return {
    messages: [
      createMessage(
        'concierge',
        result.reference
          ? `Found it! Tracking order ${result.reference}. Here’s your timeline.`
          : 'Found it! Here’s your timeline.'
      ),
      createMessage('concierge', timeline, 'track_order'),
    ],
    sessionPatch: { lastIntent: 'track_order', lastOrder: lastOrderContext },
  }
}
