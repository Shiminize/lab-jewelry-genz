/**
 * Customizable Products API
 * CLAUDE_RULES.md compliant endpoint to list all products available for customization
 * Integrates with seed product data for product selector interface
 */

import { NextRequest } from 'next/server'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling,
  calculatePagination
} from '@/lib/api-utils'
import { publicRoute } from '@/lib/auth-middleware'
import seedProducts from '../../../../../seed_data/ring_products.json'

/**
 * GET /api/products/customizable
 * Get all products available for 3D customization
 */
async function handler(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Apply rate limiting for catalog endpoints (100/min per CLAUDE_RULES)
    const authResult = await publicRoute(request)
    if (!authResult.success) {
      return authResult.error!
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50) // Max 50 per CLAUDE_RULES
    const category = searchParams.get('category')
    const featured = searchParams.get('featured') === 'true'

    // Filter products based on query parameters
    let filteredProducts = seedProducts.products

    if (category) {
      filteredProducts = filteredProducts.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      )
    }

    // Calculate pagination
    const total = filteredProducts.length
    const pagination = calculatePagination(page, limit, total)
    
    // Apply pagination
    const paginatedProducts = filteredProducts.slice(
      pagination.offset,
      pagination.offset + pagination.limit
    )

    // Transform products for customizer interface
    const customizableProducts = paginatedProducts.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      basePrice: product.base_price,
      // originalPrice: removed since not in seed data structure
      keyFeatures: product.key_features || [],
      socialAppeal: product.social_appeal,
      targetEmotion: product.target_emotion,
      sustainability: {
        materials: product.sustainability?.materials,
        carbonNeutral: product.sustainability?.carbon_neutral,
        certifications: product.sustainability?.certifications
      },
      customizationOptions: {
        materialsCount: product.customization?.materials?.length || 0,
        stonesCount: product.customization?.stone_options?.length || 0,
        hasEngraving: Boolean(product.customization?.engraving),
        sizeRange: product.customization?.sizes
      },
      metadata: {
        modelPath: '/Ringmodel.glb', // Use same model for all products in MVP
        previewImage: `/images/products/${product.id}-preview.jpg`,
        genZAppeal: product.social_appeal,
        instagramability: product.social_appeal
      }
    }))

    const responseTime = Date.now() - startTime
    
    // Log performance for CLAUDE_RULES <300ms target
    if (responseTime > 300) {
      console.warn(`CLAUDE_RULES VIOLATION: Customizable products API took ${responseTime}ms (target: <300ms)`)
    }

    const response = createSuccessResponse(
      customizableProducts,
      {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages
      }
    )
    
    // Add performance and caching headers
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
    response.headers.set('X-Response-Time', `${responseTime}ms`)
    response.headers.set('X-Total-Count', total.toString())
    
    // Add available filter options for frontend
    const availableCategories = Array.from(new Set(seedProducts.products.map(p => p.category)))
    response.headers.set('X-Available-Categories', JSON.stringify(availableCategories))
    
    return response

  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error('Customizable products API error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      responseTime
    })
    
    return createErrorResponse(
      'INTERNAL_ERROR',
      'An unexpected error occurred while loading customizable products',
      [],
      500
    )
  }
}

// Export with error handling wrapper
export const GET = withErrorHandling(handler, 'customizable_products_list')