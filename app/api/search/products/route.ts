import { NextResponse } from 'next/server'

import { searchCatalogProducts } from '@/services/neon/catalogRepository'

interface SearchPayload {
  query?: string
  limit?: number
}

const FALLBACK_LIMIT = 60

function clampLimit(value: number | undefined) {
  if (!Number.isFinite(value) || typeof value !== 'number') {
    return FALLBACK_LIMIT
  }
  return Math.min(120, Math.max(1, Math.floor(value)))
}

async function executeSearch(query: string | null, limit?: number) {
  const trimmed = query?.trim()
  if (!trimmed) {
    return []
  }

  return searchCatalogProducts(trimmed, clampLimit(limit))
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? Number(limitParam) : undefined

  try {
    const products = await executeSearch(q, limit)
    return NextResponse.json({ products, total: products.length })
  } catch (error) {
    console.error('[api/search/products] GET failed', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SearchPayload
    const products = await executeSearch(body?.query ?? null, body?.limit)
    return NextResponse.json({ products, total: products.length })
  } catch (error) {
    console.error('[api/search/products] POST failed', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
