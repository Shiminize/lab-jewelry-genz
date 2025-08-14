/**
 * Category-specific Products API Route
 * Returns products filtered by category with optional subcategory
 */

import { NextRequest, NextResponse } from 'next/server'
import { productRepository } from '@/lib/database'
import { ProductCategory } from '@/types/product'

interface RouteParams {
  params: {
    category: ProductCategory
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { category } = params
    const { searchParams } = new URL(request.url)
    
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50)
    const subcategory = searchParams.get('subcategory')

    // Validate category
    const validCategories: ProductCategory[] = ['rings', 'necklaces', 'earrings', 'bracelets']
    if (!validCategories.includes(category)) {
      return NextResponse.json({
        error: 'Invalid category',
        message: `Category must be one of: ${validCategories.join(', ')}`
      }, { status: 400 })
    }

    // Get products by category
    const products = await productRepository.getByCategory(category, limit)

    // Filter by subcategory if specified
    const filteredProducts = subcategory 
      ? products.filter(p => p.subcategory === subcategory)
      : products

    // Add category-specific cache headers
    const responseHeaders = new Headers()
    responseHeaders.set('Cache-Control', 'public, max-age=900, stale-while-revalidate=1800') // 15min cache
    responseHeaders.set('X-Category', category)
    responseHeaders.set('X-Product-Count', filteredProducts.length.toString())
    
    if (subcategory) {
      responseHeaders.set('X-Subcategory', subcategory)
    }

    return NextResponse.json({
      products: filteredProducts,
      category,
      subcategory,
      count: filteredProducts.length
    }, {
      headers: responseHeaders
    })

  } catch (error) {
    console.error('Category products API error:', error)
    
    return NextResponse.json({
      error: 'Failed to fetch category products',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    })
  }
}