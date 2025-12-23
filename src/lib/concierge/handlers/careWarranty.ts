'use client'

import { createMessage, type IntentResponse } from '../types'
import type { HandlerArgs } from './types'

export async function handleCareWarranty(): Promise<IntentResponse> {
  return {
    messages: [
      createMessage(
        'concierge',
        'Here are the studio’s best practices: use the microfiber cloth weekly, avoid ultrasonic cleaners for opals, and schedule our complimentary clean & polish every 6 months.'
      ),
      createMessage(
        'concierge',
        {
          type: 'escalation-form',
          id: 'care-escalation',
          heading: 'Schedule a care refresh',
          description: 'We can arrange a clean & polish kit or a studio visit—share your best contact.',
          submitLabel: 'Request care support',
        },
        'care_warranty'
      ),
    ],
    sessionPatch: { lastIntent: 'care_warranty' },
  }
}
