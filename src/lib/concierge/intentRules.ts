import type { ConciergeIntent, DetectedIntent } from './types'
import { decideIntent, type IntentContext, type IntentDecision } from './engine'

export function detectIntent(
  message: string,
  explicitIntent?: ConciergeIntent,
  context?: IntentContext
): DetectedIntent | null {
  if (explicitIntent) {
    return {
      intent: explicitIntent,
      source: 'explicit',
      confidence: 1,
    }
  }

  const decision = decideIntent(message, context)

  if (decision.intent === 'clarify') {
    return null
  }

  return {
    intent: decision.intent,
    source: 'engine',
    payload: decision.filters ? { filters: decision.filters } : undefined,
    confidence: decision.confidence,
    reason: decision.reason,
  }
}
