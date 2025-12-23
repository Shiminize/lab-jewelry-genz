import { NextResponse } from 'next/server'
import { getCatalogProducts } from '@/services/neon'

export async function GET() {
  const products = await getCatalogProducts()
  return NextResponse.json({ success: true, data: products })
}
