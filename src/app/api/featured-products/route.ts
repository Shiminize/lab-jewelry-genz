/**
 * Featured Products API Endpoint
 * Optimized endpoint for homepage featured products with <300ms performance target
 * Follows CLAUDE_RULES.md envelope format and material-only filtering
 */

import { NextRequest } from 'next/server'
import { productRepository } from '@/lib/repositories/product.repository'
import { 
  createSuccessResponse, 
  createErrorResponse,
  addSecurityHeaders
} from '@/lib/api-utils'
import { publicRoute } from '@/lib/auth-middleware'
import { mapFeaturedProductsToDisplayDTO } from '@/lib/mappers/product-display.mapper'
import type { ProductDisplayDTO } from '@/types/product-dto'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Apply authentication middleware for public route with rate limiting
    const authResult = await publicRoute(request)
    
    if (!authResult.success) {
      return authResult.error!
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? Math.min(parseInt(limitParam), 20) : 6

    // Fetch featured products using existing repository method
    const featuredProductsFromDB = await productRepository.getFeaturedProducts(limit)
    
    // Transform to unified ProductDisplayDTO format using our mapper
    // This ensures material-only compliance and unified data structure
    const featuredProducts: ProductDisplayDTO[] = mapFeaturedProductsToDisplayDTO(featuredProductsFromDB)
    
    const responseTime = Date.now() - startTime

    // Additional material-only compliance validation (CLAUDE_RULES.md enforcement)
    const materialCompliantProducts = featuredProducts.filter(product => {
      // Ensure only lab-grown and ethical materials
      const hasCompliantMaterials = product.materialSpecs.primaryMetal.type && 
        ['silver', '14k-gold', '18k-gold', 'platinum'].includes(product.materialSpecs.primaryMetal.type)
      
      const hasCompliantStones = !product.materialSpecs.primaryStone || 
        ['lab-diamond', 'moissanite', 'lab-emerald', 'lab-ruby', 'lab-sapphire'].includes(product.materialSpecs.primaryStone.type)
      
      // Validate material-only tags (no sustainability/marketing tags)
      const hasOnlyMaterialTags = product.metadata.tags.every(tag =>
        ['lab-grown', 'moissanite', 'lab-diamond', 'lab-emerald', 'lab-ruby', 'lab-sapphire', 'customizable'].includes(tag)
      )
      
      return hasCompliantMaterials && hasCompliantStones && hasOnlyMaterialTags
    })

    // Create CLAUDE_RULES compliant response
    const response = createSuccessResponse(
      materialCompliantProducts,
      undefined, // No pagination for featured products
      {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        responseTime: `${responseTime}ms`,
        totalProducts: materialCompliantProducts.length,
        materialFilteringCompliant: true,
        performance: {
          query: `${responseTime}ms`,
          target: '<300ms',
          compliant: responseTime < 300
        },
        materialCompliance: {
          exclusions: ['natural-diamonds', 'mined-gems'],
          inclusions: ['lab-grown-diamonds', 'moissanite', 'lab-gemstones'],
          filteredCount: featuredProducts.length - materialCompliantProducts.length
        }
      }
    )

    // Add performance and caching headers
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
    response.headers.set('X-Response-Time', `${responseTime}ms`)
    response.headers.set('X-Total-Count', materialCompliantProducts.length.toString())
    
    return addSecurityHeaders(response)

  } catch (error) {
    console.error('Featured products API error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    })
    
    return createErrorResponse(
      'INTERNAL_ERROR',
      'An unexpected error occurred while fetching featured products',
      [],
      500
    )
  }
}