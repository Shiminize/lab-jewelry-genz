import type { ConciergeIntent, IntentResponse, ModulePayload } from '@/lib/concierge/types'
import { trackEvent } from '@/lib/concierge/analytics'

type Meta = { sessionId?: string; requestId: string; orderNumber?: string }

export function logIntentSuccess(
  intent: ConciergeIntent,
  response: IntentResponse,
  meta: Meta,
  extra?: Record<string, unknown>
) {
  const { sessionId, requestId, orderNumber } = meta
  trackEvent('intent_complete', { intent, sessionId, requestId, orderNumber })

  if (intent === 'find_product') {
    const productModule = response.messages
      .filter((message) => message.type === 'module')
      .map((message) => message.payload as ModulePayload)
      .find((module) => module?.type === 'product-carousel')
    if (productModule && productModule.type === 'product-carousel') {
      trackEvent('products_shown', {
        intent,
        sessionId,
        requestId,
        productCount: productModule.products.length,
        orderNumber,
      })
    }
  }

  if (intent === 'return_exchange') {
    const selection = (extra as { selection?: { option?: string } } | undefined)?.selection
    trackEvent('return_initiated', {
      sessionId,
      requestId,
      option: typeof selection?.option === 'string' ? selection.option : undefined,
      orderNumber,
    })
  }

  if (intent === 'csat' && (extra as { action?: string } | undefined)?.action === 'submit-csat') {
    const responseData = (extra as { response?: Record<string, unknown> } | undefined)?.response
    const rating =
      responseData && typeof responseData === 'object'
        ? (responseData.score as number | undefined) ?? (responseData.rating as number | undefined)
        : undefined
    trackEvent('csat_submitted', { sessionId, requestId, rating, orderNumber })
  }
}
