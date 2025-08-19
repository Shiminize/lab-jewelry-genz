/**
 * API Endpoint: Calculate Customization Price
 * Phase 3C: High-performance price calculation API with <300ms response time
 */

import { NextRequest, NextResponse } from 'next/server'
import { productCustomizationService } from '@/services/ProductCustomizationService'
import { ProductModel } from '@/lib/schemas/product.schema'
import { createSafeMaterial } from '@/lib/material-safety-utils'
import { connectToDatabase } from '@/lib/mongoose'

// Request interface for price calculation
interface PriceCalculationRequest {
  materialId: string
  customizations?: {
    [optionName: string]: string
  }
  quantity?: number
}

// Response interface for price calculation
interface PriceCalculationResponse {
  success: boolean
  pricing: {
    basePrice: number
    materialAdjustment: number
    customizationAdjustments: number
    totalPrice: number
    finalPrice: number
    quantity: number
  }
  breakdown: {
    material: {
      name: string
      multiplier: number
      adjustment: number
      percentage: number
    }
    customizations: Array<{
      option: string
      value: string
      adjustment: number
    }>
  }
  metadata: {
    productId: string
    calculationTimeMs: number
    cached: boolean
    errors: string[]
    warnings: string[]
  }
}

// Cache for price calculations
const priceCache = new Map<string, { data: any; timestamp: number }>()
const PRICE_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCachedPrice(key: string): any | null {
  const cached = priceCache.get(key)
  if (!cached) return null
  
  if (Date.now() - cached.timestamp > PRICE_CACHE_DURATION) {
    priceCache.delete(key)
    return null
  }
  
  return cached.data
}

function setCachedPrice(key: string, data: any): void {
  priceCache.set(key, {
    data,
    timestamp: Date.now()
  })
}

export async function POST(
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
          metadata: { errors: ['Invalid product ID provided'] }
        },
        { status: 400 }
      )
    }

    // Parse request body
    let requestData: PriceCalculationRequest
    try {
      requestData = await request.json()
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          metadata: { errors: ['Failed to parse request JSON'] }
        },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!requestData.materialId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Material ID is required',
          metadata: { errors: ['materialId field is required'] }
        },
        { status: 400 }
      )
    }

    const quantity = Math.max(1, requestData.quantity || 1)
    
    // Generate cache key
    const cacheKey = `price_${params.id}_${requestData.materialId}_${JSON.stringify(requestData.customizations || {})}_${quantity}`
    
    // Check cache first for performance
    const cachedResult = getCachedPrice(cacheKey)
    if (cachedResult) {
      const responseTime = performance.now() - startTime
      return NextResponse.json({
        ...cachedResult,
        metadata: {
          ...cachedResult.metadata,
          calculationTimeMs: responseTime,
          cached: true
        }
      }, {
        headers: {
          'X-Cache-Status': 'HIT',
          'X-Response-Time': `${responseTime.toFixed(2)}ms`
        }
      })
    }

    // Connect to database
    await connectToDatabase()

    // Query product with minimal projection for performance - handle both ObjectId and string lookups
    let product
    try {
      // First try by ObjectId
      product = await ProductModel.findById(params.id)
        .select('name basePrice isCustomizable customizationOptions customizerOptions status')
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
        .select('name basePrice isCustomizable customizationOptions customizerOptions status')
        .lean()
        .exec()
    }

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
          metadata: { errors: ['Product not found in database'] }
        },
        { status: 404 }
      )
    }

    if (!product.isCustomizable) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product does not support customization',
          metadata: { errors: ['Product is not customizable'] }
        },
        { status: 400 }
      )
    }

    // Find material option from product configuration
    let materialOption: any = null
    let selectedMaterialValue: any = null

    // Check enhanced customizer options
    if (product.customizerOptions) {
      const materialOptionsGroup = product.customizerOptions.find((opt: any) => opt.type === 'material')
      if (materialOptionsGroup) {
        selectedMaterialValue = materialOptionsGroup.options.find((opt: any) => opt.value === requestData.materialId)
        if (selectedMaterialValue) {
          materialOption = materialOptionsGroup
        }
      }
    }

    // Fallback to basic customization options
    if (!selectedMaterialValue && product.customizationOptions) {
      const materialOptionsGroup = product.customizationOptions.find((opt: any) => opt.type === 'material')
      if (materialOptionsGroup) {
        selectedMaterialValue = materialOptionsGroup.options.find((opt: any) => opt.value === requestData.materialId)
        if (selectedMaterialValue) {
          materialOption = materialOptionsGroup
        }
      }
    }

    if (!selectedMaterialValue) {
      return NextResponse.json(
        {
          success: false,
          error: 'Material not found',
          metadata: { errors: [`Material ${requestData.materialId} not found for this product`] }
        },
        { status: 404 }
      )
    }

    // Create safe material object
    const material = createSafeMaterial({
      id: requestData.materialId,
      name: selectedMaterialValue.label || 'Unknown Material',
      description: selectedMaterialValue.description || '',
      priceMultiplier: calculateMaterialMultiplier(selectedMaterialValue, product),
      color: selectedMaterialValue.hexColor || '#cccccc',
      properties: {
        metalness: 1.0,
        roughness: 0.1,
        reflectivity: 0.9,
        color: selectedMaterialValue.hexColor || '#cccccc'
      }
    })

    if (!material) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create material',
          metadata: { errors: ['Invalid material configuration'] }
        },
        { status: 500 }
      )
    }

    // Calculate base price with material
    const priceResult = productCustomizationService.calculatePrice(product as any, material, quantity)

    // Calculate customization adjustments
    let customizationAdjustments = 0
    const customizationBreakdown: Array<{ option: string; value: string; adjustment: number }> = []

    if (requestData.customizations) {
      for (const [optionName, optionValue] of Object.entries(requestData.customizations)) {
        // Find the customization option
        const customOption = findCustomizationOption(product, optionName)
        if (customOption) {
          const selectedOption = customOption.options.find((opt: any) => opt.value === optionValue)
          if (selectedOption && typeof selectedOption.priceModifier === 'number') {
            customizationAdjustments += selectedOption.priceModifier * quantity
            customizationBreakdown.push({
              option: optionName,
              value: optionValue,
              adjustment: selectedOption.priceModifier * quantity
            })
          }
        }
      }
    }

    const finalPrice = Math.max(0, priceResult.finalPrice + customizationAdjustments)
    const calculationTimeMs = performance.now() - startTime

    // Build response
    const response: PriceCalculationResponse = {
      success: true,
      pricing: {
        basePrice: priceResult.basePrice,
        materialAdjustment: priceResult.materialAdjustment,
        customizationAdjustments,
        totalPrice: priceResult.finalPrice + customizationAdjustments,
        finalPrice,
        quantity
      },
      breakdown: {
        material: {
          name: material.name,
          multiplier: material.priceMultiplier,
          adjustment: priceResult.materialAdjustment,
          percentage: priceResult.breakdown[0]?.percentage || 0
        },
        customizations: customizationBreakdown
      },
      metadata: {
        productId: params.id,
        calculationTimeMs,
        cached: false,
        errors: [],
        warnings: []
      }
    }

    // Cache the result
    setCachedPrice(cacheKey, response)

    const isPerformant = calculationTimeMs < 300
    const responseHeaders: HeadersInit = {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      'X-Cache-Status': 'MISS',
      'X-Response-Time': `${calculationTimeMs.toFixed(2)}ms`,
      'X-Performance-Target': isPerformant ? 'MET' : 'EXCEEDED'
    }

    return NextResponse.json(response, {
      status: 200,
      headers: responseHeaders
    })

  } catch (error: any) {
    const responseTime = performance.now() - startTime
    
    console.error(`[PRICE CALCULATION ERROR] Product ${params.id}:`, {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      responseTime
    })

    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        metadata: {
          errors: [error.message],
          calculationTimeMs: responseTime,
          cached: false
        }
      },
      { 
        status: 500,
        headers: {
          'X-Response-Time': `${responseTime.toFixed(2)}ms`,
          'X-Error': 'true'
        }
      }
    )
  }
}

// Helper function to calculate material price multiplier
function calculateMaterialMultiplier(materialValue: any, product: any): number {
  // Use price modifier from the option
  if (typeof materialValue.priceModifier === 'number') {
    const basePrice = product.basePrice || 1000
    return 1.0 + (materialValue.priceModifier / basePrice)
  }

  // Use material type mapping
  const materialTypeMultipliers: { [key: string]: number } = {
    'platinum': 1.2,
    'white-gold': 1.0,
    'yellow-gold': 0.95,
    'rose-gold': 0.95,
    'silver': 0.7,
    'titanium': 0.8
  }

  const materialId = materialValue.value?.toLowerCase() || ''
  for (const [type, multiplier] of Object.entries(materialTypeMultipliers)) {
    if (materialId.includes(type.replace('-', '')) || materialId.includes(type)) {
      return multiplier
    }
  }

  return 1.0
}

// Helper function to find customization option
function findCustomizationOption(product: any, optionName: string): any {
  // Check enhanced customizer options
  if (product.customizerOptions) {
    const option = product.customizerOptions.find((opt: any) => opt.name === optionName)
    if (option) return option
  }

  // Check basic customization options
  if (product.customizationOptions) {
    return product.customizationOptions.find((opt: any) => opt.name === optionName)
  }

  return null
}

// GET handler for retrieving supported materials and options
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = performance.now()
  
  try {
    await connectToDatabase()

    let product
    try {
      // First try by ObjectId
      product = await ProductModel.findById(params.id)
        .select('name isCustomizable customizationOptions customizerOptions')
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
        .select('name isCustomizable customizationOptions customizerOptions')
        .lean()
        .exec()
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    if (!product.isCustomizable) {
      return NextResponse.json(
        { success: false, error: 'Product does not support customization' },
        { status: 400 }
      )
    }

    // Extract available options
    const availableOptions = {
      materials: [],
      customizations: {}
    }

    // Get materials from customizer options or basic options
    const options = product.customizerOptions || product.customizationOptions || []
    
    for (const option of options) {
      if (option.type === 'material') {
        availableOptions.materials = option.options.map((opt: any) => ({
          id: opt.value,
          name: opt.label,
          description: opt.description,
          priceModifier: opt.priceModifier || 0,
          hexColor: opt.hexColor
        }))
      } else {
        availableOptions.customizations[option.name] = option.options.map((opt: any) => ({
          id: opt.value,
          name: opt.label,
          priceModifier: opt.priceModifier || 0
        }))
      }
    }

    const responseTime = performance.now() - startTime

    return NextResponse.json({
      success: true,
      productId: params.id,
      productName: product.name,
      availableOptions,
      metadata: {
        responseTimeMs: responseTime
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600', // Cache for 1 hour
        'X-Response-Time': `${responseTime.toFixed(2)}ms`
      }
    })

  } catch (error: any) {
    const responseTime = performance.now() - startTime
    
    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        metadata: { responseTimeMs: responseTime }
      },
      { status: 500 }
    )
  }
}