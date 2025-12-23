'use client'

import quickstart from '@/config/quickstart.json'
import { createMessage, type IntentResponse, type ModulePayload } from '../types'
import { normalizeFilters } from '../intent/normalizer'
import { buildProductFallbacks } from '../intent/fallback'
import { conciergeDataMode } from '../config'
import type { HandlerArgs } from './types'
import { postJson } from './types'

function resolveQuickStartFilters(slug?: string): Record<string, unknown> | null {
  if (!slug) return null
  const entry = (quickstart as Array<{ slug: string; filters?: Record<string, unknown> }>).find(
    (item) => item.slug === slug
  )
  return entry?.filters ? { ...entry.filters } : null
}

function mergeQuickStartFilters(data: Record<string, unknown>) {
  const preset = resolveQuickStartFilters(typeof data.slug === 'string' ? (data.slug as string) : undefined)
  if (preset) {
    data.filters = {
      ...preset,
      ...((data.filters as Record<string, unknown> | undefined) ?? {}),
    }
  }
}

export async function handleFindProduct({ data, state, requestId }: HandlerArgs): Promise<IntentResponse> {
  mergeQuickStartFilters(data)
  const hasExplicitFilters = data.action === 'submit-product-filters' || data.filters || data.sortBy

  if (!hasExplicitFilters) {
    return {
      messages: [
        createMessage(
          'concierge',
          "Tell me what you’re shopping for, your budget, and style—I’ll recommend ready-to-ship pieces."
        ),
        createMessage(
          'concierge',
          {
            type: 'product-filter',
            id: 'product-filter',
            heading: 'What are you shopping for?',
            subheading: 'Choose category, budget, and metal to tailor the selections.',
          },
          'find_product'
        ),
      ],
      sessionPatch: { lastIntent: 'find_product' },
    }
  }

  const baseFilters =
    typeof data.filters === 'object' && data.filters !== null
      ? (data.filters as Record<string, unknown>)
      : (data as Record<string, unknown>)

  const combinedFilters: Record<string, unknown> = { ...baseFilters }
  if (typeof data.sortBy === 'string') {
    combinedFilters.sortBy = data.sortBy
  }

  const normalizedFilters = normalizeFilters(combinedFilters)

  const attempts = [
    { filters: normalizedFilters, reason: 'initial' as const },
    ...buildProductFallbacks(normalizedFilters),
  ]

  let products: Array<{
    id: string
    title: string
    price: number
    image?: string
    tags?: string[]
    shippingPromise?: string
    slug?: string
  }> = []
  let appliedReason: string | undefined
  let appliedFilters = normalizedFilters

  for (const attempt of attempts) {
    products = await postJson('/api/support/products', {
      ...attempt.filters,
      sessionId: state.session.id,
      ...(requestId ? { requestId } : {}),
    })
    if (Array.isArray(products) && products.length > 0) {
      appliedReason = attempt.reason !== 'initial' ? attempt.reason : undefined
      appliedFilters = attempt.filters
      break
    }
  }

  const { limit: _limit, offset: _offset, ...filtersForModule } = appliedFilters

  const carousel: ModulePayload = {
    type: 'product-carousel',
    id: 'product-carousel',
    products,
    footerCtaLabel: 'Save to shortlist',
    filters: filtersForModule,
    sortBy: appliedFilters.sortBy,
  }

  if (!products.length) {
    const messages = [
      createMessage(
        'concierge',
        "I broadened the search but couldn't find a match. Want me to pull best-sellers for you instead?"
      ),
    ]
    if (conciergeDataMode === 'stub') {
      messages.push(
        createMessage(
          'concierge',
          'Heads up: we are in stub mode, so live inventory may differ. Try fewer filters or ready-to-ship best-sellers.'
        )
      )
    }
    return {
      messages,
      sessionPatch: {
        lastIntent: 'find_product',
        lastFilters: filtersForModule,
      },
    }
  }

  return {
    messages: [
      createMessage(
        'concierge',
        appliedReason
          ? 'I loosened the filters to get you options—tweak them anytime.'
          : 'Here are ready-to-ship pieces that match your preferences.'
      ),
      createMessage('concierge', carousel, 'find_product'),
    ],
    sessionPatch: {
      lastIntent: 'find_product',
      lastFilters: filtersForModule,
    },
    offerTriggered: true,
  }
}
