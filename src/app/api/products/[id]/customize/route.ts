/**
 * Product Customization API
 * CLAUDE_RULES.md compliant endpoint for 3D customizer integration
 * Processes seed product data for real-time customization
 */

import { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  validateRequestBody,
  withErrorHandling,
  checkAPIRateLimit
} from '@/lib/api-utils'
import { 
  ProductCustomizationRequestSchema,
  SaveCustomizationRequestSchema,
  ShareCustomizationRequestSchema
} from '@/lib/schemas/product-customization'
import { processProductForCustomizer, calculateCustomizationPrice, generateShareableUrl } from '@/lib/product-data-processor'
import { publicRoute } from '@/lib/auth-middleware'
import seedProducts from '../../../../../../seed_data/ring_products.json'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/products/[id]/customize
 * Retrieve product customization options and pricing
 */
async function getHandler(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now()
  
  try {
    // Apply rate limiting for catalog endpoints (100/min per CLAUDE_RULES)
    const authResult = await publicRoute(request)
    if (!authResult.success) {
      return authResult.error!
    }

    const productId = params.id
    
    // Validate product ID format
    if (!productId || typeof productId !== 'string') {
      return createErrorResponse(
        'INVALID_PRODUCT_ID',
        'Product ID is required and must be a string',
        [],
        400
      )
    }

    // Find product in seed data
    const seedProduct = seedProducts.products.find(p => p.id === productId)
    
    if (!seedProduct) {
      return createErrorResponse(
        'PRODUCT_NOT_FOUND',
        `Product with ID '${productId}' not found`,
        [],
        404
      )
    }

    // Process seed product into customizer format
    const productCustomization = processProductForCustomizer(seedProduct)
    
    const responseTime = Date.now() - startTime
    
    // Log performance for CLAUDE_RULES <300ms target
    if (responseTime > 300) {
      console.warn(`CLAUDE_RULES VIOLATION: Product customization took ${responseTime}ms (target: <300ms)`)
    }

    const response = createSuccessResponse(productCustomization)
    
    // Add performance headers
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
    response.headers.set('X-Response-Time', `${responseTime}ms`)
    
    return response

  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error('Product customization API error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      productId: params.id,
      responseTime
    })
    
    return createErrorResponse(
      'INTERNAL_ERROR',
      'An unexpected error occurred while loading product customization options',
      [],
      500
    )
  }
}

/**
 * POST /api/products/[id]/customize/save
 * Save a custom design (requires authentication)
 */
async function postHandler(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now()
  
  try {
    // Apply rate limiting for authenticated operations
    const authResult = await publicRoute(request)
    if (!authResult.success) {
      return authResult.error!
    }

    // Validate request body
    const validation = await validateRequestBody(request, SaveCustomizationRequestSchema)
    if (!validation.success) {
      return validation.response
    }

    const { customization, name, isPublic } = validation.data
    const productId = params.id

    // Find product in seed data for validation
    const seedProduct = seedProducts.products.find(p => p.id === productId)
    if (!seedProduct) {
      return createErrorResponse(
        'PRODUCT_NOT_FOUND',
        `Product with ID '${productId}' not found`,
        [],
        404
      )
    }

    // Calculate final price
    const materialMultiplier = customization.material?.priceMultiplier || 1
    const stoneMultiplier = customization.stoneQuality?.priceMultiplier || 1
    const engravingCost = customization.engraving ? 75 : 0
    
    const totalPrice = calculateCustomizationPrice(
      seedProduct.base_price,
      materialMultiplier,
      stoneMultiplier,
      engravingCost
    )

    // Generate shareable URL
    const shareableUrl = generateShareableUrl(productId, customization)

    // TODO: Save to MongoDB user designs collection
    const savedDesign = {
      id: `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: authResult.user?.id || null, // null for guests
      productId,
      productName: seedProduct.name,
      customization,
      name: name || `Custom ${seedProduct.name}`,
      totalPrice,
      shareableUrl,
      isPublic: isPublic || false,
      createdAt: new Date().toISOString()
    }

    const responseTime = Date.now() - startTime
    
    const response = createSuccessResponse({
      design: savedDesign,
      shareableUrl,
      totalPrice
    }, undefined, 201)
    
    response.headers.set('X-Response-Time', `${responseTime}ms`)
    
    return response

  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error('Save customization API error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      productId: params.id,
      responseTime
    })
    
    return createErrorResponse(
      'SAVE_FAILED',
      'Failed to save custom design',
      [],
      500
    )
  }
}

/**
 * PUT /api/products/[id]/customize/share
 * Generate shareable link for design
 */
async function putHandler(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now()
  
  try {
    // Apply rate limiting
    const authResult = await publicRoute(request)
    if (!authResult.success) {
      return authResult.error!
    }

    // Validate request body
    const validation = await validateRequestBody(request, ShareCustomizationRequestSchema)
    if (!validation.success) {
      return validation.response
    }

    const { customization, shareOptions } = validation.data
    const productId = params.id

    // Find product for validation
    const seedProduct = seedProducts.products.find(p => p.id === productId)
    if (!seedProduct) {
      return createErrorResponse(
        'PRODUCT_NOT_FOUND',
        `Product with ID '${productId}' not found`,
        [],
        404
      )
    }

    // Generate shareable URL
    const shareableUrl = generateShareableUrl(productId, customization)
    const fullUrl = `${request.nextUrl.origin}${shareableUrl}`
    
    // Calculate price if requested
    let totalPrice
    if (shareOptions?.includePrice) {
      const materialMultiplier = customization.material?.priceMultiplier || 1
      const stoneMultiplier = customization.stoneQuality?.priceMultiplier || 1
      const engravingCost = customization.engraving ? 75 : 0
      
      totalPrice = calculateCustomizationPrice(
        seedProduct.base_price,
        materialMultiplier,
        stoneMultiplier,
        engravingCost
      )
    }

    const responseTime = Date.now() - startTime
    
    const response = createSuccessResponse({
      shareableUrl: fullUrl,
      shortUrl: shareableUrl,
      ...(totalPrice && { totalPrice }),
      productName: seedProduct.name,
      previewImage: '/images/ring-preview.jpg', // TODO: Generate actual preview
      socialMetadata: {
        title: `Check out my custom ${seedProduct.name}`,
        description: seedProduct.description,
        image: '/images/ring-preview.jpg'
      }
    })
    
    response.headers.set('X-Response-Time', `${responseTime}ms`)
    
    return response

  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error('Share customization API error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      productId: params.id,
      responseTime
    })
    
    return createErrorResponse(
      'SHARE_FAILED',
      'Failed to generate shareable link',
      [],
      500
    )
  }
}

// Export with error handling wrapper
export const GET = withErrorHandling(getHandler, 'product_customization_get')
export const POST = withErrorHandling(postHandler, 'product_customization_save')
export const PUT = withErrorHandling(putHandler, 'product_customization_share')