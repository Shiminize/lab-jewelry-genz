'use client'

import { createMessage, type IntentResponse } from '../types'
import type { HandlerArgs } from './types'
import { postJson } from './types'

export async function handleCsat({ data, state, requestId }: HandlerArgs): Promise<IntentResponse> {
  if (data.action === 'submit-csat') {
    const response =
      typeof data.response === 'object' && data.response !== null ? (data.response as Record<string, unknown>) : {}
    try {
      const rawRating = response.rating ?? response.score
      const ratingMap: Record<string, number> = {
        great: 5,
        good: 4,
        okay: 3,
        needs_follow_up: 2,
        poor: 1,
      }
      const numericRating =
        typeof rawRating === 'number'
          ? rawRating
          : typeof rawRating === 'string'
            ? ratingMap[rawRating] ?? 3
            : undefined

      await postJson('/api/support/csat', {
        ...response,
        ...(numericRating ? { rating: numericRating } : {}),
        sessionId: state.session.id,
        intent: state.session.lastIntent,
        orderNumber: state.session.lastOrder?.orderNumber,
        ...(requestId ? { requestId } : {}),
      })
    } catch (error) {
      // non-blocking
    }
    return {
      messages: [
        createMessage(
          'concierge',
          'Thank you for the feedback. I’ll keep refining the experience and bring in a stylist whenever you need one.'
        ),
      ],
      sessionPatch: { lastIntent: 'csat', hasShownCsat: true },
    }
  }

  return {
    messages: [
      createMessage(
        'concierge',
        {
          type: 'csat-prompt',
          id: 'csat-inline',
          question: 'How did Aurora do today?',
        },
        'csat'
      ),
    ],
    sessionPatch: { lastIntent: 'csat', hasShownCsat: true },
  }
}
