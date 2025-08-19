/**
 * API Endpoint: Get Product Customization Variants
 * Phase 3C: High-performance API for customizer data with <300ms response time
 */

import { NextRequest, NextResponse } from 'next/server'
import { productCustomizationService } from '@/services/ProductCustomizationService'
import { ProductModel } from '@/lib/schemas/product.schema'
import { connectToDatabase } from '@/lib/mongoose'

// Response interface for type safety
interface CustomizerVariantsResponse {
  success: boolean
  variants: any[]
  productInfo: {
    id: string
    name: string
    basePrice: number
    isCustomizable: boolean
  }
  metadata: {
    generatedCount: number
    cached: boolean
    processingTimeMs: number
    errors: string[]
    warnings: string[]
  }
  performance: {
    databaseQueryMs: number
    variantGenerationMs: number
    totalResponseMs: number
  }
}

// Cache configuration
const CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=600' // 5min cache, 10min stale
const API_TIMEOUT_MS = 10000 // 10 second API timeout
const TARGET_RESPONSE_TIME_MS = 300 // Target <300ms response time

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = performance.now()
  
  try {
    // Validate product ID
    if (!params.id || typeof params.id !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid product ID',
          variants: [],
          metadata: { errors: ['Invalid product ID provided'] }
        },
        { 
          status: 400,
          headers: { 'Cache-Control': 'no-cache' }
        }
      )
    }

    // Check cache first for performance
    const cachedVariants = productCustomizationService.getCachedVariants(params.id)
    if (cachedVariants) {
      const responseTime = performance.now() - startTime
      
      return NextResponse.json({
        success: true,
        variants: cachedVariants,
        productInfo: {
          id: params.id,
          name: 'Cached Product',
          basePrice: 0,
          isCustomizable: true
        },
        metadata: {
          generatedCount: cachedVariants.length,
          cached: true,
          processingTimeMs: responseTime,
          errors: [],
          warnings: []
        },
        performance: {
          databaseQueryMs: 0,
          variantGenerationMs: 0,
          totalResponseMs: responseTime
        }
      }, {
        status: 200,
        headers: { 
          'Cache-Control': CACHE_CONTROL,
          'X-Cache-Status': 'HIT',
          'X-Response-Time': `${responseTime.toFixed(2)}ms`
        }
      })
    }

    // Connect to database with timeout
    const dbStartTime = performance.now()
    await Promise.race([
      connectToDatabase(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 5000)
      )
    ])
    const dbConnectionTime = performance.now() - dbStartTime

    // Query product from database with optimized projection - handle both ObjectId and string lookups
    const queryStartTime = performance.now()
    let product
    try {
      // First try by ObjectId
      product = await ProductModel.findById(params.id)
        .select('name basePrice isCustomizable customizationOptions customizerOptions customizerAssets variantGeneration status seo shortDescription description')
        .lean()
        .exec()
    } catch (castError) {
      // If ObjectId cast fails, try by seo.slug or custom string ID
      product = await ProductModel.findOne({
        $or: [
          { 'seo.slug': params.id },
          { 'inventory.sku': new RegExp(params.id, 'i') }
        ]
      })
        .select('name basePrice isCustomizable customizationOptions customizerOptions customizerAssets variantGeneration status seo shortDescription description')
        .lean()
        .exec()
    }

    const databaseQueryMs = performance.now() - queryStartTime

    if (!product) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Product not found',
          variants: [],
          metadata: { 
            errors: ['Product not found in database'],
            cached: false,
            processingTimeMs: performance.now() - startTime 
          }
        },
        { 
          status: 404,
          headers: { 'Cache-Control': 'no-cache' }
        }
      )
    }

    // Check if product supports customization
    if (!product.isCustomizable) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product does not support customization',
          variants: [],
          metadata: {
            errors: ['Product is not customizable'],
            cached: false,
            processingTimeMs: performance.now() - startTime
          }
        },
        { 
          status: 400,
          headers: { 'Cache-Control': 'public, s-maxage=3600' } // Cache non-customizable for 1 hour
        }
      )
    }

    // Generate variants using the customization service
    const variantGenerationStart = performance.now()
    const variantResult = await Promise.race([
      productCustomizationService.generateVariantsFromProduct(product as any),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Variant generation timeout')), 8000)
      )
    ])
    const variantGenerationMs = performance.now() - variantGenerationStart

    const totalResponseMs = performance.now() - startTime

    // Build response
    const response: CustomizerVariantsResponse = {
      success: true,
      variants: variantResult.variants,
      productInfo: {
        id: product._id.toString(),
        name: product.name,
        basePrice: product.basePrice,
        isCustomizable: product.isCustomizable
      },
      metadata: {
        generatedCount: variantResult.generatedCount,
        cached: false,
        processingTimeMs: variantResult.processingTimeMs,
        errors: variantResult.errors,
        warnings: variantResult.warnings
      },
      performance: {
        databaseQueryMs,
        variantGenerationMs,
        totalResponseMs
      }
    }

    // Determine response status and caching based on performance
    const isPerformant = totalResponseMs < TARGET_RESPONSE_TIME_MS
    const hasErrors = variantResult.errors.length > 0

    let statusCode = 200
    if (hasErrors && variantResult.variants.length === 0) {
      statusCode = 500
    } else if (hasErrors) {
      statusCode = 206 // Partial content due to errors
    }

    const responseHeaders: HeadersInit = {
      'Cache-Control': hasErrors ? 'no-cache' : CACHE_CONTROL,
      'X-Cache-Status': 'MISS',
      'X-Response-Time': `${totalResponseMs.toFixed(2)}ms`,
      'X-Performance-Target': isPerformant ? 'MET' : 'EXCEEDED',
      'X-Database-Time': `${databaseQueryMs.toFixed(2)}ms`,
      'X-Generation-Time': `${variantGenerationMs.toFixed(2)}ms`,
      'X-Variants-Count': variantResult.variants.length.toString()
    }

    // Add performance warning if response is slow
    if (!isPerformant) {
      responseHeaders['X-Performance-Warning'] = `Response time ${totalResponseMs.toFixed(2)}ms exceeded target ${TARGET_RESPONSE_TIME_MS}ms`
      
      // Log performance issues in development
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[PERFORMANCE] Customizer API slow response: ${totalResponseMs.toFixed(2)}ms for product ${params.id}`)
        console.warn(`[PERFORMANCE] Database: ${databaseQueryMs.toFixed(2)}ms, Generation: ${variantGenerationMs.toFixed(2)}ms`)
      }
    }

    return NextResponse.json(response, {
      status: statusCode,
      headers: responseHeaders
    })

  } catch (error: any) {
    const totalResponseMs = performance.now() - startTime
    
    // Log error with context
    console.error(`[CUSTOMIZER API ERROR] Product ${params.id}:`, {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      responseTime: totalResponseMs
    })

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === 'development' 
          ? error.message 
          : 'Internal server error',
        variants: [],
        metadata: {
          errors: [error.message],
          cached: false,
          processingTimeMs: totalResponseMs
        },
        performance: {
          databaseQueryMs: 0,
          variantGenerationMs: 0,
          totalResponseMs
        }
      },
      { 
        status: 500,
        headers: { 
          'Cache-Control': 'no-cache',
          'X-Response-Time': `${totalResponseMs.toFixed(2)}ms`,
          'X-Error': 'true'
        }
      }
    )
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}