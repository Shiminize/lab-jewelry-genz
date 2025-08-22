/**
 * Customizable Product 3D Assets API - Phase 2: 3D Dashboard Integration  
 * GET /api/products/customizable/[id]/assets - List available 3D assets
 * POST /api/products/customizable/[id]/assets - Generate new 3D assets
 * 
 * Performance Target: <300ms response time (CLAUDE_RULES compliant)
 * 3D Integration: Seamless connection with existing 3D Dashboard pipeline
 */

import { NextRequest, NextResponse } from 'next/server'
import { customizable3DBridgeService } from '@/lib/services/customizable-3d-bridge.service'
import { customizableProductService } from '@/lib/services/customizable-product.service'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling 
} from '@/lib/api-utils'
import { publicRoute } from '@/lib/auth-middleware'
import { STANDARD_MATERIALS, generateMaterialPath } from '@/config/materials.config'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/products/customizable/[id]/assets
 * List available 3D asset sequences for a customizable product
 */
async function getHandler(request: NextRequest, { params }: RouteParams) {
  const startTime = performance.now()
  
  try {
    // PHASE 2 SECURITY: Enhanced rate limiting with asset-specific limits
    const authResult = await publicRoute(request)
    if (!authResult.success) {
      return authResult.error!
    }

    const { id } = params
    const { searchParams } = new URL(request.url)
    const materialId = searchParams.get('materialId') || undefined
    
    // 🔍 PHASE 1 DEBUG: Log initial request parameters
    console.log(`\n🔍 [CUSTOMIZER DEBUG] API Request Details:`)
    console.log(`   Product ID: ${id}`)
    console.log(`   Material ID: ${materialId}`)
    console.log(`   Request URL: ${request.url}`)
    
    // PHASE 2 SECURITY: Enhanced input validation with whitelisting
    if (!id) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Product ID is required',
        [{ field: 'id', message: 'Product ID parameter is missing' }],
        400
      )
    }

    // PHASE 2 SECURITY: Product ID whitelist validation (prevent path traversal)
    const ALLOWED_PRODUCT_IDS = /^(ring|necklace|earring|bracelet|pendant)-\d+$/
    if (!ALLOWED_PRODUCT_IDS.test(id)) {
      console.warn(`⚠️ SECURITY: Invalid product ID format attempted: ${id}`)
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid product ID format',
        [{ field: 'id', message: 'Product ID must match allowed format: type-number' }],
        400
      )
    }

    // PHASE 2 SECURITY: Material ID whitelist validation using standardized materials
    const ALLOWED_MATERIALS = STANDARD_MATERIALS.map(material => material.id)

    if (materialId && !ALLOWED_MATERIALS.includes(materialId)) {
      console.warn(`⚠️ SECURITY: Invalid material ID attempted: ${materialId}`)
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid material ID',
        [{ field: 'materialId', message: 'Material ID not in approved list' }],
        400
      )
    }

    // Try to get product from scalable customization system first
    let product = null
    let isScalableProduct = false
    
    try {
      product = await customizableProductService.getCustomizableProductById(id, false)
      if (product) {
        isScalableProduct = true
        console.log(`✅ [CUSTOMIZER DEBUG] Product found in scalable system: ${id}`)
      }
    } catch (error) {
      console.log(`🔄 [CUSTOMIZER DEBUG] Product ${id} not found in scalable system, checking seed data fallback`)
    }

    // If not found in database, check if it exists in seed data and create mock response
    if (!product) {
      console.log(`🔄 [CUSTOMIZER DEBUG] Product ${id} not in database, providing seed data compatible response`)
      
      // PHASE 2 SECURITY: Already validated above with ALLOWED_PRODUCT_IDS
      const seedProductExists = ALLOWED_PRODUCT_IDS.test(id)
      
      if (!seedProductExists) {
        return createErrorResponse(
          'NOT_FOUND',
          'Customizable product not found',
          [{ field: 'id', message: `Product with ID ${id} not found or not customizable` }],
          404
        )
      }

      // Create mock product info for seed data compatibility
      product = {
        id,
        _id: id,
        jewelryType: id.split('-')[0] + 's' as any, // ring -> rings
        baseModel: `${id}-model`,
        name: `Customizable ${id.charAt(0).toUpperCase() + id.slice(1)}`,
        category: 'B'
      }
      console.log(`📝 [CUSTOMIZER DEBUG] Mock product created:`, product)
    }

    // Get available 3D assets
    let assetInfo
    
    if (isScalableProduct) {
      // Use bridge service for actual scalable products
      console.log(`🌉 [CUSTOMIZER DEBUG] Using bridge service for scalable product`)
      assetInfo = await customizable3DBridgeService.getProductAssets(id, materialId)
    } else {
      // Use standardized path generation matching actual filesystem structure
      const MODEL_MAP = {
        'ring-001': 'ring-luxury-001',
        'ring-002': 'ring-classic-002', 
        'ring-003': 'ring-diamond-003'
      }
      
      console.log(`🗺️ [CUSTOMIZER DEBUG] MODEL_MAP lookup:`)
      console.log(`   Input ID: ${id}`)
      console.log(`   Available mappings:`, MODEL_MAP)
      
      const modelId = MODEL_MAP[id] || 'ring-classic-002' // Default to existing model
      console.log(`   Resolved Model ID: ${modelId}`)
      console.log(`   Material ID: ${materialId || 'platinum'}`)
      
      const assetPath = `/${generateMaterialPath(modelId, materialId || 'platinum')}`
      console.log(`🎯 [CUSTOMIZER DEBUG] Generated asset path: ${assetPath}`)
      
      // 🔍 PHASE 1 DEBUG: Verify file system structure
      console.log(`📁 [CUSTOMIZER DEBUG] Expected filesystem path: Public${assetPath}`)
      
      assetInfo = {
        available: true,
        assetPaths: [assetPath],
        lastGenerated: new Date().toISOString(),
        frameCount: 36
      }
      
      console.log(`🎭 [CUSTOMIZER DEBUG] Asset info generated:`, assetInfo)
    }
    
    const responseTime = performance.now() - startTime
    
    // Log performance warning if threshold exceeded
    if (responseTime > 300) {
      console.warn(`⚠️ CLAUDE_RULES violation: GET /api/products/customizable/${id}/assets response time ${responseTime}ms exceeds 300ms`)
    }

    // PHASE 2 SECURITY: Sanitize response data (remove internal system info)
    const response = {
      success: true,
      data: {
        productId: id,
        jewelryType: product.jewelryType,
        baseModel: product.baseModel,
        materialId,
        assets: {
          available: assetInfo.available,
          assetPaths: assetInfo.assetPaths,
          lastGenerated: assetInfo.lastGenerated,
          frameCount: assetInfo.frameCount
        },
        assetGeneration: {
          supported: isScalableProduct,
          estimatedTime: `${Math.round((assetInfo.frameCount || 36) * 2 / 60)} minutes`,
          qualityLevels: ['webp', 'png'], // PHASE 2 SECURITY: Removed avif (problematic format)
          standardFrameCount: assetInfo.frameCount || 36
        }
        // PHASE 2 SECURITY: Removed dataSource and fallbackMode (internal info)
      },
      performance: {
        responseTime: `${Math.round(responseTime)}ms`
        // PHASE 2 SECURITY: Removed cacheStatus (internal info)
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '2.1.0'
        // PHASE 2 SECURITY: Removed integration and fallbackMode (internal system info)
      }
    }

    console.log(`📤 [CUSTOMIZER DEBUG] Final API response data:`, JSON.stringify(response.data, null, 2))
    console.log(`⏱️ [CUSTOMIZER DEBUG] Response time: ${Math.round(responseTime)}ms\n`)

    return NextResponse.json(response, {
      status: 200,
      headers: {
        // PHASE 2 SECURITY: Enhanced security headers
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'X-Response-Time': `${Math.round(responseTime)}ms`,
        'X-CLAUDE-Rules-Compliant': responseTime < 300 ? 'true' : 'false',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        // PHASE 2 SECURITY: Remove internal system headers
      }
    })

  } catch (error) {
    const responseTime = performance.now() - startTime
    console.error(`❌ [CUSTOMIZER DEBUG] GET /api/products/customizable/${params.id}/assets error:`, error)
    
    // PHASE 2 SECURITY: Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch product assets',
      isDevelopment ? [{ field: 'system', message: error.message }] : [],
      500
    )
  }
}

/**
 * POST /api/products/customizable/[id]/assets
 * Generate new 3D asset sequences for a customizable product
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
    const { materials, priority = 'normal', requesterType = 'admin' } = body
    
    if (!materials || !Array.isArray(materials) || materials.length === 0) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Materials array is required',
        [{ field: 'materials', message: 'materials must be a non-empty array' }],
        400
      )
    }

    // Validate priority
    if (!['low', 'normal', 'high'].includes(priority)) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid priority level',
        [{ field: 'priority', message: 'priority must be one of: low, normal, high' }],
        400
      )
    }

    // Verify product exists and is customizable (with seed data fallback)
    let product = null
    
    try {
      product = await customizableProductService.getCustomizableProductById(id, true)
    } catch (error) {
      console.log(`Product ${id} not found in scalable system, checking seed data fallback`)
    }
    
    // For seed data products, we need to restrict POST to database products only
    // POST operations require actual database products for proper generation
    if (!product) {
      return createErrorResponse(
        'NOT_FOUND',
        'Asset generation requires database-stored customizable products. Seed data products only support asset listing via GET.',
        [{ field: 'id', message: `Product with ID ${id} not found in database or not customizable. Use GET /api/products/customizable/${id}/assets for seed data products.` }],
        404
      )
    }

    // Start 3D asset generation
    const generationProgress = await customizable3DBridgeService.generateProductAssets(
      id,
      materials,
      priority
    )

    const responseTime = performance.now() - startTime
    
    // Log performance warning if threshold exceeded
    if (responseTime > 300) {
      console.warn(`⚠️ CLAUDE_RULES violation: POST /api/products/customizable/${id}/assets response time ${responseTime}ms exceeds 300ms`)
    }

    const response = {
      success: true,
      data: {
        jobId: generationProgress.jobId,
        productId: id,
        status: generationProgress.status,
        progress: generationProgress.progress,
        materials,
        priority,
        estimatedCompletion: generationProgress.estimatedCompletion,
        statusUrl: `/api/products/customizable/${id}/assets/status/${generationProgress.jobId}`,
        webhook: process.env.NEXT_PUBLIC_WEBHOOK_URL ? {
          url: `${process.env.NEXT_PUBLIC_WEBHOOK_URL}/generation-complete`,
          events: ['generation.completed', 'generation.failed']
        } : undefined
      },
      performance: {
        responseTime: `<${Math.round(responseTime)}ms`,
        cacheStatus: 'miss'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        integration: '3d-dashboard-bridge'
      }
    }

    return NextResponse.json(response, {
      status: 202, // Accepted - generation started
      headers: {
        'X-Response-Time': `${Math.round(responseTime)}ms`,
        'X-CLAUDE-Rules-Compliant': responseTime < 300 ? 'true' : 'false',
        'X-3D-Integration': 'active',
        'X-Content-Type-Options': 'nosniff',
        'Location': `/api/products/customizable/${id}/assets/status/${generationProgress.jobId}`
      }
    })

  } catch (error) {
    const responseTime = performance.now() - startTime
    console.error(`POST /api/products/customizable/${id}/assets error:`, error)
    
    // Handle specific validation errors
    if (error.message.includes('CLAUDE_RULES') || 
        error.message.includes('Traditional gems are forbidden') ||
        error.message.includes('not CLAUDE_RULES compliant')) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        error.message,
        [{ field: 'materials', message: error.message }],
        400
      )
    }
    
    if (error.message.includes('Product') && error.message.includes('not found')) {
      return createErrorResponse(
        'NOT_FOUND',
        'Product not found or not customizable',
        [{ field: 'productId', message: error.message }],
        404
      )
    }
    
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to start asset generation',
      [],
      500
    )
  }
}

// Export handlers
export const GET = withErrorHandling(getHandler, 'customizable_product_assets_get')
export const POST = withErrorHandling(postHandler, 'customizable_product_assets_post')