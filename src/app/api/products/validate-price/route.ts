/**
 * Price Validation API - Server-side price calculation and validation
 * Prevents client-side price manipulation attacks
 * CLAUDE_RULES compliant with security-first approach
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateMaterialId, validatePrice, ValidationSchemas, validateInput, validateCSRFToken } from '@/lib/security'

// Server-side material pricing configuration
// This should never be exposed to client-side code
const MATERIAL_PRICING_CONFIG = {
  'platinum': { basePrice: 1500, priceModifier: 0 },
  '18k-white-gold': { basePrice: 1500, priceModifier: -200 },
  '18k-yellow-gold': { basePrice: 1500, priceModifier: -300 },
  '18k-rose-gold': { basePrice: 1500, priceModifier: -250 }
} as const

interface PriceValidationRequest {
  productId: string
  materialId: string
  requestedPrice?: number
}

interface PriceValidationResponse {
  success: boolean
  data?: {
    validatedPrice: number
    materialId: string
    priceBreakdown: {
      basePrice: number
      materialModifier: number
      finalPrice: number
    }
  }
  error?: {
    code: string
    message: string
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<PriceValidationResponse>> {
  try {
    // CSRF Protection for state-changing requests
    const csrfToken = request.headers.get('x-csrf-token')
    const csrfCookie = request.cookies.get('csrf-token')?.value
    
    if (!csrfToken || !csrfCookie || !validateCSRFToken(csrfToken, csrfCookie)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CSRF_TOKEN_INVALID',
          message: 'Invalid CSRF token'
        }
      }, { status: 403 })
    }
    
    // Parse and validate request body
    const body: PriceValidationRequest = await request.json()
    
    // Validate input using security schema
    const validation = validateInput('materialSelection', {
      productId: body.productId,
      materialId: body.materialId,
      price: body.requestedPrice || 0
    })
    
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: `Validation failed: ${validation.errors.join(', ')}`
        }
      }, { status: 400 })
    }
    
    // Validate material ID against server config
    const validMaterialId = validateMaterialId(body.materialId)
    if (!validMaterialId || !(validMaterialId in MATERIAL_PRICING_CONFIG)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_MATERIAL',
          message: 'Invalid or unsupported material type'
        }
      }, { status: 400 })
    }
    
    // Calculate server-side price (authoritative)
    const materialConfig = MATERIAL_PRICING_CONFIG[validMaterialId]
    const calculatedPrice = materialConfig.basePrice + materialConfig.priceModifier
    const validatedPrice = validatePrice(calculatedPrice)
    
    // If client provided a price, verify it matches server calculation
    if (body.requestedPrice && Math.abs(body.requestedPrice - validatedPrice) > 0.01) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'PRICE_MISMATCH',
          message: 'Client price does not match server calculation'
        }
      }, { status: 400 })
    }
    
    // Return validated price data
    return NextResponse.json({
      success: true,
      data: {
        validatedPrice,
        materialId: validMaterialId,
        priceBreakdown: {
          basePrice: materialConfig.basePrice,
          materialModifier: materialConfig.priceModifier,
          finalPrice: validatedPrice
        }
      }
    })
    
  } catch (error) {
    console.error('[PRICE_VALIDATION_ERROR]', error)
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to validate price'
      }
    }, { status: 500 })
  }
}

// GET endpoint for retrieving valid material pricing
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const materialId = searchParams.get('materialId')
    
    if (materialId) {
      // Return single material pricing
      const validMaterialId = validateMaterialId(materialId)
      if (!validMaterialId || !(validMaterialId in MATERIAL_PRICING_CONFIG)) {
        return NextResponse.json({
          success: false,
          error: { code: 'INVALID_MATERIAL', message: 'Invalid material ID' }
        }, { status: 400 })
      }
      
      const config = MATERIAL_PRICING_CONFIG[validMaterialId]
      return NextResponse.json({
        success: true,
        data: {
          materialId: validMaterialId,
          basePrice: config.basePrice,
          priceModifier: config.priceModifier,
          finalPrice: config.basePrice + config.priceModifier
        }
      })
    }
    
    // Return all material pricing (for preloading)
    const allMaterialPricing = Object.entries(MATERIAL_PRICING_CONFIG).map(([id, config]) => ({
      materialId: id,
      basePrice: config.basePrice,
      priceModifier: config.priceModifier,
      finalPrice: config.basePrice + config.priceModifier
    }))
    
    return NextResponse.json({
      success: true,
      data: allMaterialPricing
    })
    
  } catch (error) {
    console.error('[PRICE_FETCH_ERROR]', error)
    
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch pricing' }
    }, { status: 500 })
  }
}