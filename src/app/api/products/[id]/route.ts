/**
 * Individual Product API Routes
 * Handles single product operations by ID or slug
 * Follows CLAUDE_RULES.md envelope format and performance requirements
 */

import { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { productRepository } from '@/lib/repositories/product.repository'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createValidationErrorResponse,
  checkRateLimit,
  getClientIP,
  addSecurityHeaders
} from '@/lib/api-utils'
import { ProductIdSchema, RateLimitConfigs } from '@/lib/schemas/api-validation'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now()
  
  try {
    // Rate limiting for product detail endpoints (200/min/IP)
    const clientIP = getClientIP(request)
    const rateLimitResult = await checkRateLimit(
      `product-detail:${clientIP}`,
      RateLimitConfigs.PRODUCT_DETAIL
    )
    
    if (!rateLimitResult.allowed) {
      return createErrorResponse(
        'RATE_LIMIT_EXCEEDED',
        'Too many requests. Please try again later.',
        [],
        429,
        rateLimitResult
      )
    }

    // Validate product ID parameter
    let validatedParams
    try {
      validatedParams = ProductIdSchema.parse(params)
    } catch (error) {
      if (error instanceof ZodError) {
        return createValidationErrorResponse(error)
      }
      return createErrorResponse(
        'INVALID_PRODUCT_ID',
        'Invalid product ID format',
        [],
        400
      )
    }

    const { id } = validatedParams
    
    // Try to get product by ID first, then by slug
    let product = await productRepository.getProductById(id)
    
    // If not found by ID, try by slug
    if (!product) {
      product = await productRepository.getProductBySlug(id)
    }
    
    if (!product) {
      return createErrorResponse(
        'PRODUCT_NOT_FOUND',
        `No product found with ID or slug: ${id}`,
        [],
        404
      )
    }

    const responseTime = Date.now() - startTime
    const response = createSuccessResponse(product)

    // Add performance and cache headers
    response.headers.set('Cache-Control', 'public, max-age=600, stale-while-revalidate=1800') // 10min cache
    response.headers.set('X-Response-Time', `${responseTime}ms`)
    response.headers.set('X-Product-ID', product._id)
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())

    return addSecurityHeaders(response)

  } catch (error) {
    console.error('Product fetch API error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      productId: params.id,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    })
    
    return createErrorResponse(
      'INTERNAL_ERROR',
      'An unexpected error occurred while fetching product',
      [],
      500
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now()
  
  try {
    // Rate limiting for admin operations
    const clientIP = getClientIP(request)
    const rateLimitResult = await checkRateLimit(
      `admin:${clientIP}`,
      RateLimitConfigs.ADMIN
    )
    
    if (!rateLimitResult.allowed) {
      return createErrorResponse(
        'RATE_LIMIT_EXCEEDED',
        'Too many requests. Please try again later.',
        [],
        429,
        rateLimitResult
      )
    }

    // TODO: Add admin authentication check here
    // const userRole = request.headers.get('x-user-role')
    // if (userRole !== 'admin') {
    //   return createErrorResponse('FORBIDDEN', 'Admin access required', [], 403)
    // }

    // Validate product ID parameter
    let validatedParams
    try {
      validatedParams = ProductIdSchema.parse(params)
    } catch (error) {
      if (error instanceof ZodError) {
        return createValidationErrorResponse(error)
      }
      return createErrorResponse(
        'INVALID_PRODUCT_ID',
        'Invalid product ID format',
        [],
        400
      )
    }

    const { id } = validatedParams
    const updates = await request.json()
    
    const updatedProduct = await productRepository.updateProduct(id, updates)
    
    if (!updatedProduct) {
      return createErrorResponse(
        'PRODUCT_NOT_FOUND',
        `No product found with ID: ${id}`,
        [],
        404
      )
    }

    const response = createSuccessResponse(updatedProduct)
    response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`)
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())
    
    return addSecurityHeaders(response)

  } catch (error) {
    console.error('Product update API error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      productId: params.id,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    })
    
    return createErrorResponse(
      'INTERNAL_ERROR',
      'An unexpected error occurred while updating product',
      [],
      500
    )
  }
}