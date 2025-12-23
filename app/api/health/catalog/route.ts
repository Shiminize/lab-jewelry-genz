import { NextResponse } from 'next/server'
import { getCatalogProducts } from '@/services/neon'

export async function GET() {
  try {
    const products = await getCatalogProducts(1)

    return NextResponse.json({
      ok: true,
      productsSampled: products.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[health/catalog] neon catalog unreachable', error)
    return NextResponse.json(
      {
        ok: false,
        error: 'catalog_unavailable',
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}

