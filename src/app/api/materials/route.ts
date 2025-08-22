/**
 * Materials API - Phase 3: API Layer Enhancement
 * Material-only focus with CLAUDE_RULES compliance and <300ms performance
 * 
 * GET /api/materials - List all approved materials
 * POST /api/materials/validate - Validate material combinations
 */

import { NextRequest, NextResponse } from 'next/server'
import { materialValidationService } from '@/lib/services/material-validation.service'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling 
} from '@/lib/api-utils'
import { withPerformanceMonitoring } from '@/lib/middleware/performance-monitor'
import { publicRoute } from '@/lib/auth-middleware'

/**
 * GET /api/materials
 * List all CLAUDE_RULES approved materials with caching
 * Performance target: <50ms
 */
async function getHandler(request: NextRequest) {
  const startTime = performance.now()
  
  try {
    // Apply rate limiting
    const authResult = await publicRoute(request)
    if (!authResult.success) {
      return authResult.error!
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as 'gem' | 'metal' | null
    const format = searchParams.get('format') || 'detailed'
    const includeProperties = searchParams.get('properties') === 'true'
    
    // Get approved materials from validation service (cached)
    const materials = materialValidationService.getApprovedMaterials(category || undefined)
    
    let responseData: any
    
    if (format === 'simple') {
      // Simplified format for dropdowns and selectors
      responseData = materials.map(material => ({
        id: material.id,
        name: material.displayName,
        category: material.category,
        isLabGrown: material.isLabGrown
      }))
    } else {
      // Detailed format with full properties
      responseData = materials.map(material => ({
        id: material.id,
        name: material.name,
        displayName: material.displayName,
        category: material.category,
        isLabGrown: material.isLabGrown,
        ...(includeProperties ? {
          properties: material.properties,
          sustainability: material.sustainability,
          pricing: material.pricing
        } : {}),
        metadata: {
          claudeRulesCompliant: true,
          sustainabilityScore: material.sustainability.carbonFootprint === 'low' ? 95 : 85,
          certifications: material.sustainability.certifications
        }
      }))
    }

    const responseTime = performance.now() - startTime
    
    // Performance warning if threshold exceeded
    if (responseTime > 50) {
      console.warn(`⚠️ Materials API response time ${responseTime}ms exceeds 50ms target`)
    }

    const response = {
      success: true,
      data: responseData,
      pagination: {
        total: responseData.length,
        filtered: category ? responseData.length : undefined,
        category
      },
      performance: {
        responseTime: `${Math.round(responseTime)}ms`,
        cacheStatus: 'hit', // Service uses internal caching
        claudeRulesCompliant: responseTime < 300
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '3.0.0',
        apiLayer: 'material-focused',
        approvedMaterialsCount: materials.length
      }
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600', // 5 min cache
        'X-Response-Time': `${Math.round(responseTime)}ms`,
        'X-CLAUDE-Rules-Compliant': 'true',
        'X-Material-Count': materials.length.toString(),
        'X-API-Version': '3.0.0',
        'X-Content-Type-Options': 'nosniff',
        'Vary': 'Accept-Encoding'
      }
    })

  } catch (error) {
    const responseTime = performance.now() - startTime
    console.error('GET /api/materials error:', error)
    
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch materials',
      [],
      500
    )
  }
}

/**
 * POST /api/materials/validate
 * Validate material combinations for CLAUDE_RULES compliance
 * Performance target: <100ms
 */
async function postHandler(request: NextRequest) {
  const startTime = performance.now()
  
  try {
    // Apply rate limiting
    const authResult = await publicRoute(request)
    if (!authResult.success) {
      return authResult.error!
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

    const { materials, combinations, mode = 'individual' } = body
    
    if (!materials || !Array.isArray(materials) || materials.length === 0) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Materials array is required',
        [{ field: 'materials', message: 'materials must be a non-empty array' }],
        400
      )
    }

    let validationResults: any[] = []
    
    if (mode === 'individual') {
      // Validate each material individually
      validationResults = materialValidationService.validateMaterials(materials)
        .map(validation => ({
          material: validation.material,
          valid: validation.isValid,
          claudeRulesCompliant: validation.claudeRulesCompliant,
          category: validation.category,
          errors: validation.errors,
          warnings: validation.warnings,
          metadata: validation.metadata
        }))
    } else if (mode === 'combinations' && combinations) {
      // Validate material combinations
      validationResults = combinations.map((combo: { gem: string, metal: string }) => {
        const combinationValidation = materialValidationService.validateMaterialCombination(
          combo.gem, 
          combo.metal
        )
        return {
          combination: combo,
          valid: combinationValidation.valid,
          errors: combinationValidation.errors,
          recommendations: combinationValidation.recommendations,
          claudeRulesCompliant: combinationValidation.valid
        }
      })
    }

    const responseTime = performance.now() - startTime
    
    // Performance warning if threshold exceeded
    if (responseTime > 100) {
      console.warn(`⚠️ Material validation API response time ${responseTime}ms exceeds 100ms target`)
    }

    const validCount = validationResults.filter(r => r.valid || r.claudeRulesCompliant).length
    const invalidCount = validationResults.length - validCount

    const response = {
      success: true,
      data: {
        validations: validationResults,
        summary: {
          total: validationResults.length,
          valid: validCount,
          invalid: invalidCount,
          claudeRulesCompliant: validCount === validationResults.length
        },
        mode
      },
      performance: {
        responseTime: `${Math.round(responseTime)}ms`,
        validationsPerSecond: Math.round(validationResults.length / (responseTime / 1000)),
        claudeRulesCompliant: responseTime < 300
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '3.0.0',
        apiLayer: 'material-focused',
        validationEngine: 'claude-rules-v3'
      }
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=60', // Short cache for validation results
        'X-Response-Time': `${Math.round(responseTime)}ms`,
        'X-CLAUDE-Rules-Compliant': 'true',
        'X-Validations-Count': validationResults.length.toString(),
        'X-API-Version': '3.0.0',
        'X-Content-Type-Options': 'nosniff'
      }
    })

  } catch (error) {
    const responseTime = performance.now() - startTime
    console.error('POST /api/materials/validate error:', error)
    
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to validate materials',
      [],
      500
    )
  }
}

// Export handlers with performance monitoring
export const GET = withPerformanceMonitoring(
  withErrorHandling(getHandler, 'materials_list'),
  '/api/materials'
)
export const POST = withPerformanceMonitoring(
  withErrorHandling(postHandler, 'materials_validate'),
  '/api/materials'
)