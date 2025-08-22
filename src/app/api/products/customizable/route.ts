/**
 * Customizable Products API - Phase 1 Data Architecture Foundation
 * CLAUDE_RULES.md compliant endpoint for Category B scalable customizable products
 * 
 * Performance Target: <300ms response time (CLAUDE_RULES compliant)
 * Material Focus: Lab-grown diamonds, moissanite, lab gems only
 * Scalable Architecture: Supports 5-10 jewelry types with 3D customization
 */

import { NextRequest } from 'next/server'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling,
  calculatePagination
} from '@/lib/api-utils'
import { publicRoute } from '@/lib/auth-middleware'
import { customizableProductService } from '@/lib/services/customizable-product.service'
import { JewelryType } from '@/types/customizable-product'
// Fallback to seed data for MVP compatibility
import seedProducts from '../../../../../seed_data/ring_products.json'

/**
 * GET /api/products/customizable
 * Get Category B scalable customizable products with 3D asset integration
 * Supports jewelryType filtering: rings, necklaces, earrings, bracelets, pendants
 */
async function handler(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Apply rate limiting for catalog endpoints (100/min per CLAUDE_RULES)
    const authResult = await publicRoute(request)
    if (!authResult.success) {
      return authResult.error!
    }

    // Parse query parameters for scalable filtering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50) // Max 50 per CLAUDE_RULES
    const jewelryType = searchParams.get('jewelryType') as JewelryType || searchParams.get('category') as JewelryType
    const materials = searchParams.get('materials')?.split(',').filter(Boolean)
    const featured = searchParams.get('featured') === 'true'
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined

    // Try to fetch from scalable customizable product service first
    let useScalableService = true
    let scalableResult: any = null
    
    try {
      const filters = {
        jewelryType,
        materials,
        priceRange: minPrice && maxPrice ? { min: minPrice, max: maxPrice } : undefined,
        status: 'active' as const,
        featured
      }

      const pagination = { page, limit }
      
      scalableResult = await customizableProductService.getCustomizableProducts(filters, pagination)
      
      // Check if we have customizable products in database
      if (scalableResult && (scalableResult as any).products && (scalableResult as any).products.length > 0) {
        const responseTime = Date.now() - startTime
        
        console.log(`✅ Scalable customization service: ${(scalableResult as any).products.length} products, ${responseTime}ms`)
        
        // Transform for compatibility with existing frontend
        const transformedProducts = (scalableResult as any).products.map((product: any) => ({
          id: product._id || product.id,
          name: product.name,
          description: product.description,
          category: product.jewelryType, // Map jewelryType to category for compatibility
          basePrice: product.pricingRules?.basePrice || 0,
          keyFeatures: [`${product.jewelryType} customization`, 'Lab-grown materials', '3D preview'],
          socialAppeal: 'high',
          targetEmotion: 'confidence',
          sustainability: {
            materials: 'lab-grown only',
            carbonNeutral: true,
            certifications: ['CLAUDE_RULES compliant']
          },
          customizationOptions: {
            materialsCount: product.customizationOptions?.materials?.length || 0,
            stonesCount: product.customizationOptions?.gemstones?.length || 0,
            hasEngraving: product.customizationOptions?.engravingEnabled || false,
            sizeRange: product.customizationOptions?.sizes
          },
          metadata: {
            modelPath: product.baseModel3D?.glbUrl || '/Ringmodel.glb',
            previewImage: product.assetPaths?.sequencePath 
              ? `${product.assetPaths.sequencePath}preview.webp`
              : `/images/products/${product.id || product._id}-preview.jpg`,
            genZAppeal: 'high',
            instagramability: 'excellent',
            assetPaths: product.assetPaths,
            scalableCustomization: true // Flag for frontend
          }
        }))

        const response = createSuccessResponse(
          transformedProducts,
          {
            page: (scalableResult as any).pagination?.page || page,
            limit: (scalableResult as any).pagination?.limit || limit,
            total: (scalableResult as any).pagination?.total || transformedProducts.length,
            totalPages: (scalableResult as any).pagination?.pages || Math.ceil(transformedProducts.length / limit)
          }
        )
        
        // Add scalable service performance headers
        response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
        response.headers.set('X-Response-Time', `${responseTime}ms`)
        response.headers.set('X-Data-Source', 'scalable-customization-service')
        response.headers.set('X-CLAUDE-Rules-Compliant', responseTime < 300 ? 'true' : 'false')
        response.headers.set('X-Total-Count', ((scalableResult as any).pagination?.total || transformedProducts.length).toString())
        
        // Add available options from service
        if (scalableResult.data?.availableOptions) {
          response.headers.set('X-Available-Materials', JSON.stringify(scalableResult.data.availableOptions.materials.map((m: any) => m.id)))
          response.headers.set('X-Available-Gemstones', JSON.stringify(scalableResult.data.availableOptions.gemstones.map((g: any) => g.id)))
          response.headers.set('X-Available-Jewelry-Types', JSON.stringify(['rings', 'necklaces', 'earrings', 'bracelets', 'pendants']))
        }
        
        return response
      } else {
        console.log('ℹ️ No customizable products found in database, falling back to seed data')
        useScalableService = false
      }
      
    } catch (serviceError) {
      console.warn('⚠️ Scalable customization service error, falling back to seed data:', serviceError.message)
      useScalableService = false
    }

    // Fallback to seed data for MVP compatibility
    console.log('📦 Using seed data fallback for customizable products')
    
    // Filter products based on query parameters
    let filteredProducts = seedProducts.products

    if (jewelryType || searchParams.get('category')) {
      const categoryFilter = jewelryType || searchParams.get('category')
      filteredProducts = filteredProducts.filter(product => 
        product.category.toLowerCase() === categoryFilter?.toLowerCase()
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
        instagramability: product.social_appeal,
        scalableCustomization: false // Flag for legacy compatibility
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
    response.headers.set('X-Data-Source', 'seed-data-fallback')
    response.headers.set('X-CLAUDE-Rules-Compliant', responseTime < 300 ? 'true' : 'false')
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