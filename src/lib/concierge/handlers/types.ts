'use client'

import type { WidgetState, ConciergeIntent, IntentResponse } from '../types'

export type ScriptPayload = {
  action?: string
  [key: string]: unknown
}

export type HandlerArgs = {
  data: ScriptPayload
  state: WidgetState
  requestId?: string
}

export type IntentHandler = (args: HandlerArgs) => Promise<IntentResponse>

export async function postJson<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const { requestId, ...payload } = body as Record<string, unknown> & { requestId?: string }
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (typeof requestId === 'string') {
    headers['x-request-id'] = requestId
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`${url} responded with ${response.status}`)
  }
  return (await response.json()) as T
}
