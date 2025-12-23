'use client'

import {
  createMessage,
  type ConciergeIntent,
  type ExecuteIntentArgs,
  type IntentResponse,
} from './types'
import { intentHandlers, type ScriptPayload } from './handlers'

export function getInitialMessages() {
  return [
    createMessage(
      'concierge',
      'Hello! I’m Aurora, your GlowGlitch concierge. I can surface product ideas, track orders, or connect you with a stylist.',
      undefined,
      { id: 'aurora-concierge-welcome-message', timestamp: 0 }
    ),
  ]
}

function buildErrorMessage(intent: ConciergeIntent): IntentResponse {
  return {
    messages: [
      createMessage(
        'concierge',
        'I ran into a snag reaching the studio services. Want me to pull in a stylist to finish this?'
      ),
    ],
    sessionPatch: { lastIntent: intent },
    error: 'request_failed',
  }
}

export async function executeIntent({ intent, payload, state }: ExecuteIntentArgs): Promise<IntentResponse> {
  const data = (payload ?? {}) as ScriptPayload
  const requestId = typeof data.requestId === 'string' ? data.requestId : undefined

  const handler = intentHandlers[intent]
  if (!handler) {
    return {
      messages: [
        createMessage(
          'concierge',
          "I want to help with that, but I don't have the flow built yet. Tap \"Talk to stylist\" and I'll bring in the team."
        ),
      ],
      sessionPatch: { lastIntent: intent },
    }
  }

  try {
    return await handler({ data, state, requestId })
  } catch (error) {
    console.error('[executeIntent] handler error', intent, error)
    return buildErrorMessage(intent)
  }
}
