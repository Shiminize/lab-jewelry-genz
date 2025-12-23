'use client'

import { createMessage, type IntentResponse } from '../types'
import type { HandlerArgs } from './types'

export async function handleFinancing(): Promise<IntentResponse> {
  return {
    messages: [
      createMessage(
        'concierge',
        'We partner with LuminousPay for 0% plans up to 12 months. Pre-qualifying takes two minutes and never impacts credit.'
      ),
      createMessage(
        'concierge',
        {
          type: 'escalation-form',
          id: 'financing-escalation',
          heading: 'Request financing options',
          description: 'A stylist will share the application link and answer eligibility questions.',
          submitLabel: 'Send financing details',
        },
        'financing'
      ),
    ],
    sessionPatch: { lastIntent: 'financing' },
  }
}
