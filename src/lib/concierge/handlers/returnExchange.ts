'use client'

import { createMessage, type IntentResponse, type ModulePayload } from '../types'
import type { HandlerArgs } from './types'
import { postJson } from './types'

export async function handleReturnExchange({ data, state, requestId }: HandlerArgs): Promise<IntentResponse> {
  if (data.action !== 'submit-return-option') {
    return {
      messages: [
        createMessage(
          'concierge',
          'Happy to help. Pick the option that fits best and I’ll take care of the paperwork instantly.'
        ),
        createMessage(
          'concierge',
          {
            type: 'return-options',
            id: 'return-options',
            options: [
              { id: 'resize', label: 'Resize my ring', description: 'Complimentary within 60 days.' },
              { id: 'return', label: 'Start a return', description: 'We’ll generate a prepaid label.' },
              { id: 'care', label: 'Schedule a care refresh', description: 'Studio clean & polish in five days.' },
            ],
          },
          'return_exchange'
        ),
      ],
      sessionPatch: { lastIntent: 'return_exchange' },
    }
  }

  const selection =
    typeof data.selection === 'object' && data.selection !== null ? (data.selection as Record<string, unknown>) : {}
  if (!selection.orderId && state.session.lastOrder?.orderNumber) {
    selection.orderId = state.session.lastOrder.orderNumber
  }
  if (!selection.orderNumber && state.session.lastOrder?.orderNumber) {
    selection.orderNumber = state.session.lastOrder.orderNumber
  }

  const response = await postJson<{ message: string }>('/api/support/returns', {
    ...selection,
    sessionId: state.session.id,
    ...(requestId ? { requestId } : {}),
  })

  const orderReference =
    selection.orderNumber ??
    selection.orderId ??
    state.session.lastOrder?.orderNumber ??
    state.session.lastOrder?.orderId
  const confirmationCopy =
    response.message ||
    (orderReference ? `Filed your request for order ${orderReference}.` : 'Filed your request.')

  const followUp: ModulePayload = {
    type: 'escalation-form',
    id: 'escalation-after-return',
    heading: 'Need help fine-tuning the plan?',
    description: 'Share a best email and I’ll route a stylist to double-check fit, pickup, or resizing details.',
    submitLabel: 'Invite stylist',
  }

  return {
    messages: [
      createMessage('concierge', orderReference ? `${confirmationCopy} (Order ${orderReference})` : confirmationCopy),
      createMessage('concierge', followUp, 'return_exchange'),
    ],
    sessionPatch: { lastIntent: 'return_exchange' },
    offerTriggered: false,
  }
}
