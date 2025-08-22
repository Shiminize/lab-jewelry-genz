/**
 * Material Properties API - Phase 3: API Layer Enhancement
 * Individual material details with caching and performance optimization
 * 
 * GET /api/materials/[id] - Get detailed material properties
 * Performance target: <30ms
 */

import { NextRequest, NextResponse } from 'next/server'
import { materialValidationService } from '@/lib/services/material-validation.service'
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
 * GET /api/materials/[id]
 * Get detailed properties for a specific material
 * Performance target: <30ms (cached lookup)
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
    const { searchParams } = new URL(request.url)
    const includeRendering = searchParams.get('rendering') === 'true'
    const includePricing = searchParams.get('pricing') === 'true'
    const includeSustainability = searchParams.get('sustainability') === 'true'
    
    if (!id) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Material ID is required',
        [{ field: 'id', message: 'Material ID parameter is missing' }],
        400
      )
    }

    // Validate material exists and is CLAUDE_RULES compliant
    const validation = materialValidationService.validateMaterial(id)
    
    if (!validation.isValid || !validation.claudeRulesCompliant) {
      return createErrorResponse(
        'NOT_FOUND',
        'Material not found or not CLAUDE_RULES compliant',
        [{ 
          field: 'id', 
          message: `Material '${id}' is not approved: ${validation.errors.join(', ')}`
        }],
        404
      )
    }

    // Get detailed properties
    const properties = materialValidationService.getMaterialProperties(id)
    
    if (!properties) {
      return createErrorResponse(
        'NOT_FOUND',
        'Material properties not available',
        [{ field: 'id', message: `Properties for material '${id}' not found` }],
        404
      )
    }

    const responseTime = performance.now() - startTime
    
    // Performance warning if threshold exceeded  
    if (responseTime > 30) {
      console.warn(`⚠️ Material properties API response time ${responseTime}ms exceeds 30ms target`)
    }

    // Build response data based on requested includes
    const responseData = {
      id: properties.id,
      name: properties.name,
      displayName: properties.displayName,
      category: properties.category,
      isLabGrown: properties.isLabGrown,
      
      // Always include basic properties
      properties: {
        color: properties.properties.color,
        ...(includeRendering ? {
          metalness: properties.properties.metalness,
          roughness: properties.properties.roughness,
          reflectivity: properties.properties.reflectivity,
          density: properties.properties.density,
          hardness: properties.properties.hardness
        } : {})
      },
      
      // Conditional includes
      ...(includeSustainability ? {
        sustainability: properties.sustainability
      } : {}),
      
      ...(includePricing ? {
        pricing: properties.pricing
      } : {}),
      
      // Validation metadata
      validation: {
        claudeRulesCompliant: true,
        isApproved: true,
        category: validation.category,
        sustainabilityScore: properties.sustainability.carbonFootprint === 'low' ? 95 : 85,
        certifications: properties.sustainability.certifications
      },
      
      // Usage recommendations
      recommendations: {
        bestPairedWith: getMaterialRecommendations(properties),
        idealFor: getUsageRecommendations(properties),
        styleNotes: getStyleNotes(properties)
      }
    }

    const response = {
      success: true,
      data: responseData,
      performance: {
        responseTime: `${Math.round(responseTime)}ms`,
        cacheStatus: 'hit', // Service uses caching
        claudeRulesCompliant: responseTime < 300
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '3.0.0',
        apiLayer: 'material-focused',
        materialId: id
      }
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=1800', // 10 min cache
        'X-Response-Time': `${Math.round(responseTime)}ms`,
        'X-CLAUDE-Rules-Compliant': 'true',
        'X-Material-Category': properties.category,
        'X-Lab-Grown': properties.isLabGrown.toString(),
        'X-API-Version': '3.0.0',
        'X-Content-Type-Options': 'nosniff',
        'Vary': 'Accept-Encoding'
      }
    })

  } catch (error) {
    const responseTime = performance.now() - startTime
    console.error(`GET /api/materials/${params.id} error:`, error)
    
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch material properties',
      [],
      500
    )
  }
}

/**
 * Get material pairing recommendations
 */
function getMaterialRecommendations(material: any): string[] {
  const recommendations: string[] = []
  
  if (material.category === 'gem') {
    switch (material.id) {
      case 'lab-grown-diamond':
        recommendations.push('recycled-platinum', 'recycled-gold-18k', 'recycled-silver')
        break
      case 'lab-ruby':
        recommendations.push('recycled-rose-gold', 'recycled-gold-14k', 'recycled-silver')
        break
      case 'lab-emerald':
        recommendations.push('recycled-gold-18k', 'recycled-silver', 'recycled-platinum')
        break
      case 'lab-sapphire':
        recommendations.push('recycled-gold-18k', 'recycled-platinum', 'recycled-silver')
        break
      case 'moissanite':
        recommendations.push('recycled-silver', 'recycled-gold-14k', 'recycled-rose-gold')
        break
    }
  } else if (material.category === 'metal') {
    switch (material.id) {
      case 'recycled-platinum':
        recommendations.push('lab-grown-diamond', 'lab-sapphire', 'moissanite')
        break
      case 'recycled-gold-18k':
        recommendations.push('lab-grown-diamond', 'lab-emerald', 'lab-sapphire')
        break
      case 'recycled-rose-gold':
        recommendations.push('lab-ruby', 'moissanite', 'lab-grown-diamond')
        break
      case 'recycled-silver':
        recommendations.push('moissanite', 'lab-emerald', 'lab-ruby')
        break
    }
  }
  
  return recommendations
}

/**
 * Get usage recommendations for material
 */
function getUsageRecommendations(material: any): string[] {
  const recommendations: string[] = []
  
  if (material.category === 'gem') {
    if (material.properties.hardness >= 9) {
      recommendations.push('engagement rings', 'daily wear jewelry', 'heirloom pieces')
    } else if (material.properties.hardness >= 7) {
      recommendations.push('occasional wear', 'earrings', 'pendants')
    }
    
    if (material.id === 'lab-grown-diamond') {
      recommendations.push('bridal jewelry', 'investment pieces', 'milestone gifts')
    }
  } else if (material.category === 'metal') {
    if (material.id.includes('platinum')) {
      recommendations.push('wedding bands', 'luxury pieces', 'sensitive skin')
    }
    if (material.id.includes('gold')) {
      recommendations.push('versatile jewelry', 'stackable pieces', 'everyday wear')
    }
    if (material.id.includes('silver')) {
      recommendations.push('fashion jewelry', 'trendy pieces', 'budget-conscious choices')
    }
  }
  
  return recommendations
}

/**
 * Get style notes for material
 */
function getStyleNotes(material: any): string[] {
  const notes: string[] = []
  
  if (material.category === 'gem') {
    switch (material.id) {
      case 'lab-grown-diamond':
        notes.push('Timeless elegance', 'Maximum brilliance', 'Versatile color pairing')
        break
      case 'lab-ruby':
        notes.push('Bold and passionate', 'Warm color palette', 'Statement piece potential')
        break
      case 'lab-emerald':
        notes.push('Sophisticated luxury', 'Cool color palette', 'Natural aesthetic')
        break
      case 'lab-sapphire':
        notes.push('Classic refinement', 'Royal elegance', 'Professional appropriate')
        break
      case 'moissanite':
        notes.push('High brilliance', 'Budget-friendly luxury', 'Modern choice')
        break
    }
  }
  
  return notes
}

// Export handlers
export const GET = withErrorHandling(getHandler, 'material_properties_get')