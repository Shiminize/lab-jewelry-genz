import { NextResponse } from 'next/server'
import { getCatalogProductBySlug } from '@/services/neon'

interface Params {
  params: { slug: string }
}

export async function GET(_request: Request, { params }: Params) {
  const product = await getCatalogProductBySlug(params.slug)

  if (!product) {
    return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: product })
}
