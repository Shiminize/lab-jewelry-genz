'use client'

import { createMessage, type IntentResponse, type WidgetState } from '../types'
import type { HandlerArgs } from './types'
import { postJson } from './types'

export async function handleStylistContact({ data, state, requestId }: HandlerArgs): Promise<IntentResponse> {
  if (data.action !== 'submit-escalation') {
    return {
      messages: [
        createMessage(
          'concierge',
          'I’ll bring a human stylist into the loop. Share your best contact and any notes so we can tailor the session.'
        ),
        createMessage(
          'concierge',
          {
            type: 'escalation-form',
            id: 'direct-escalation',
            heading: 'Introduce me to a stylist',
            description: 'We’ll reply within one studio hour with renders, pricing, and sizing confirmations.',
            submitLabel: 'Send my request',
          },
          'stylist_contact'
        ),
      ],
      sessionPatch: { lastIntent: 'stylist_contact' },
    }
  }

  const escalation =
    typeof data.escalation === 'object' && data.escalation !== null
      ? (data.escalation as Record<string, unknown>)
      : (data as Record<string, unknown>)

  const payload = {
    sessionId: state.session.id,
    shortlist: state.session.shortlist,
    ...escalation,
    ...(requestId ? { requestId } : {}),
  }

  const ticket = await postJson<{ message?: string }>('/api/support/stylist', payload)
  const shortlistCount = state.session.shortlist?.length ?? 0
  const shortlistNote =
    shortlistCount > 0
      ? ` I’ve shared your ${shortlistCount}-item shortlist with them so they can tailor recs instantly.`
      : ''

  return {
    messages: [
      createMessage(
        'concierge',
        ticket?.message ??
          `Perfect. A GlowGlitch stylist will reach out shortly with renders and next steps.${shortlistNote}`
      ),
      createMessage(
        'concierge',
        {
          type: 'csat-prompt',
          id: 'stylist-csat',
          question: 'Was this handoff helpful?',
        },
        'stylist_contact'
      ),
    ],
    sessionPatch: { lastIntent: 'stylist_contact', hasShownCsat: true },
  }
}
