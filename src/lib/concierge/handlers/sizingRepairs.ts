'use client'

import { createMessage, type IntentResponse } from '../types'
import type { HandlerArgs } from './types'

export async function handleSizingRepairs(): Promise<IntentResponse> {
  return {
    messages: [
      createMessage(
        'concierge',
        'Most rings include a complimentary resize within 60 days. Share the current fit and desired size and I’ll prep a shipping kit.'
      ),
      createMessage(
        'concierge',
        {
          type: 'escalation-form',
          id: 'sizing-escalation',
          heading: 'Request a resize appointment',
          description: 'A stylist will confirm exact measurements and timing within the hour.',
          submitLabel: 'Request resize support',
        },
        'sizing_repairs'
      ),
    ],
    sessionPatch: { lastIntent: 'sizing_repairs' },
  }
}
