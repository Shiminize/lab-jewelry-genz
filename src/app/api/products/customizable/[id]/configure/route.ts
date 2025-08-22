/**
 * Customizable Product Configuration API - Phase 1 Data Architecture Foundation
 * POST /api/products/customizable/[id]/configure - Create customization configuration
 * GET /api/products/customizable/[id]/configure - Get product customization options
 * 
 * Performance Target: <300ms response time (CLAUDE_RULES compliant)
 * Material Focus: Lab-grown diamonds, moissanite, lab gems only
 */

import { NextRequest, NextResponse } from 'next/server'
import { customizableProductService } from '@/lib/services/customizable-product.service'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling 
} from '@/lib/api-utils'
import { publicRoute } from '@/lib/auth-middleware'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/products/customizable/[id]/configure
 * Get customization options for a specific product
 */
async function getHandler(request: NextRequest, { params }: RouteParams) {
  const startTime = performance.now()
  
  try {
    // Apply rate limiting
    const authResult = await publicRoute(request)
    if (!authResult.success) {
      return authResult.error!
    }

    const { id } = params
    
    if (!id) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Product ID is required',
        [{ field: 'id', message: 'Product ID parameter is missing' }],
        400
      )
    }

    // Get product details with customization options
    const product = await customizableProductService.getCustomizableProductById(id, true)
    
    if (!product) {
      return createErrorResponse(
        'NOT_FOUND',
        'Customizable product not found',
        [{ field: 'id', message: `Product with ID ${id} not found or not customizable` }],
        404
      )
    }

    // Get available customization options
    const availableOptions = await customizableProductService.getAvailableOptions(product.jewelryType)
    
    const responseTime = performance.now() - startTime
    
    // Log performance warning if threshold exceeded
    if (responseTime > 300) {
      console.warn(`⚠️ CLAUDE_RULES violation: GET /api/products/customizable/${id}/configure response time ${responseTime}ms exceeds 300ms`)
    }

    const response = {
      success: true,
      data: {
        product,
        customizationOptions: {
          materials: availableOptions.materials,
          gemstones: availableOptions.gemstones,
          sizes: availableOptions.sizes,
          engravingEnabled: product.customizationOptions.engravingEnabled,
          specialFeatures: product.customizationOptions.specialFeatures || []
        },
        pricingInfo: {
          basePrice: product.pricingRules.basePrice,
          materialModifiers: product.pricingRules.materialModifiers,
          gemstoneModifiers: product.pricingRules.gemstoneModifiers,
          sizeModifiers: product.pricingRules.sizeModifiers,
          engravingCost: product.pricingRules.engravingCost
        },
        assetInfo: {
          baseModel3D: product.baseModel3D,
          assetPaths: product.assetPaths,
          renderingConfig: product.renderingConfig
        }
      },
      performance: {
        responseTime: `<${Math.round(responseTime)}ms`,
        cacheStatus: 'miss' // TODO: Implement caching
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=1200', // 10 min cache
        'X-Response-Time': `${Math.round(responseTime)}ms`,
        'X-CLAUDE-Rules-Compliant': responseTime < 300 ? 'true' : 'false',
        'X-Content-Type-Options': 'nosniff'
      }
    })

  } catch (error) {
    const responseTime = performance.now() - startTime
    console.error(`GET /api/products/customizable/${params.id}/configure error:`, error)
    
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch product customization options',
      [],
      500
    )
  }
}

/**
 * POST /api/products/customizable/[id]/configure
 * Create a customization configuration
 */
async function postHandler(request: NextRequest, { params }: RouteParams) {
  const startTime = performance.now()
  
  try {
    // Apply rate limiting
    const authResult = await publicRoute(request)
    if (!authResult.success) {
      return authResult.error!
    }

    const { id } = params
    
    if (!id) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Product ID is required',
        [{ field: 'id', message: 'Product ID parameter is missing' }],
        400
      )
    }

    // Parse request body
    let body: any
    try {
      body = await request.json()
    } catch (parseError) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid JSON in request body',
        [{ field: 'body', message: 'Request body must be valid JSON' }],
        400
      )
    }

    // Validate required fields
    const { selections, userId, sessionId } = body
    
    if (!selections) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Customization selections are required',
        [{ field: 'selections', message: 'selections field is required' }],
        400
      )
    }

    // Validate selections structure
    const { materialId, sizeId, gemstoneId, engravingText, specialFeatures } = selections
    
    if (!materialId) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Material selection is required',
        [{ field: 'selections.materialId', message: 'materialId is required' }],
        400
      )
    }
    
    if (!sizeId) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Size selection is required',
        [{ field: 'selections.sizeId', message: 'sizeId is required' }],
        400
      )
    }

    // Create customization configuration
    const configuration = await customizableProductService.createCustomizationConfiguration(
      id,
      {
        materialId,
        gemstoneId,
        sizeId,
        engravingText,
        specialFeatures
      },
      userId,
      sessionId
    )

    const responseTime = performance.now() - startTime
    
    // Log performance warning if threshold exceeded
    if (responseTime > 300) {
      console.warn(`⚠️ CLAUDE_RULES violation: POST /api/products/customizable/${id}/configure response time ${responseTime}ms exceeds 300ms`)
    }

    const response = {
      success: true,
      data: {
        configurationId: configuration._id,
        productId: configuration.productId,
        selections: configuration.selections,
        pricing: configuration.pricing,
        assetUrls: configuration.assetUrls,
        status: configuration.status,
        estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
        shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/customize/${configuration._id}`
      },
      performance: {
        responseTime: `<${Math.round(responseTime)}ms`,
        cacheStatus: 'miss'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    }

    return NextResponse.json(response, {
      status: 201,
      headers: {
        'X-Response-Time': `${Math.round(responseTime)}ms`,
        'X-CLAUDE-Rules-Compliant': responseTime < 300 ? 'true' : 'false',
        'X-Content-Type-Options': 'nosniff',
        'Location': `/api/products/customizable/configurations/${configuration._id}`
      }
    })

  } catch (error) {
    const responseTime = performance.now() - startTime
    console.error(`POST /api/products/customizable/${params.id}/configure error:`, error)
    
    // Handle specific validation errors
    if (error.message.includes('Invalid material selection') || 
        error.message.includes('Invalid size selection') ||
        error.message.includes('Invalid gemstone selection') ||
        error.message.includes('Traditional gems are forbidden')) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        error.message,
        [{ field: 'selections', message: error.message }],
        400
      )
    }
    
    if (error.message.includes('Product not found')) {
      return createErrorResponse(
        'NOT_FOUND',
        'Product not found or not customizable',
        [{ field: 'productId', message: error.message }],
        404
      )
    }
    
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to create customization configuration',
      [],
      500
    )
  }
}

// Export handlers
export const GET = withErrorHandling(getHandler, 'customizable_product_configure_get')
export const POST = withErrorHandling(postHandler, 'customizable_product_configure_post')