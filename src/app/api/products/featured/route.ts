/**
 * Featured Products API Route
 * Returns featured products for homepage and marketing
 * Follows CLAUDE_RULES.md envelope format
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { productRepository } from '@/lib/database'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  checkRateLimit,
  getClientIP,
  addSecurityHeaders
} from '@/lib/api-utils'
import { RateLimitConfigs } from '@/lib/schemas/api-validation'

// Schema for featured products query parameters
const FeaturedQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).optional().default(8)
})

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Rate limiting for catalog endpoints
    const clientIP = getClientIP(request)
    const rateLimitResult = await checkRateLimit(
      `catalog:${clientIP}`,
      RateLimitConfigs.CATALOG
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

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const rawParams = Object.fromEntries(searchParams.entries())
    
    const { limit } = FeaturedQuerySchema.parse(rawParams)
    const featuredProducts = await productRepository.getFeatured(limit)

    const responseTime = Date.now() - startTime
    const response = createSuccessResponse(featuredProducts)

    // Add performance and cache headers
    response.headers.set('Cache-Control', 'public, max-age=1800, stale-while-revalidate=3600') // 30min cache
    response.headers.set('X-Response-Time', `${responseTime}ms`)
    response.headers.set('X-Product-Count', featuredProducts.length.toString())
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())

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