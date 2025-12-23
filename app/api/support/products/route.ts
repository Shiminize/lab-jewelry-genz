import { NextResponse } from 'next/server'
import { fetchProducts } from '@/lib/concierge/services'

// Legacy alias for /api/concierge/products
export { GET } from '@/app/api/concierge/products/route';

/**
 * POST handler for product search (JSON body)
 * Used by widget for product recommendations
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const products = await fetchProducts(body)
    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error('[api/support/products] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
