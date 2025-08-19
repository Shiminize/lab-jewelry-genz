/**
 * Test Utilities for Material Filtering API Tests
 * Performance benchmarking and test helpers for CLAUDE_RULES compliance
 */

import { NextRequest } from 'next/server'
import { ProductListDTO, MetalType, StoneType } from '@/types/product-dto'

/**
 * Performance Benchmark Utility
 * Measures API response times and validates CLAUDE_RULES <300ms requirement
 */
export class PerformanceBenchmark {
  private measurements: number[] = []
  private startTime: number = 0

  start(): void {
    this.startTime = performance.now()
  }

  end(): number {
    const endTime = performance.now()
    const duration = endTime - this.startTime
    this.measurements.push(duration)
    return duration
  }

  getAverageTime(): number {
    if (this.measurements.length === 0) return 0
    return this.measurements.reduce((sum, time) => sum + time, 0) / this.measurements.length
  }

  getMaxTime(): number {
    return Math.max(...this.measurements)
  }

  getMinTime(): number {
    return Math.min(...this.measurements)
  }

  getP95Time(): number {
    if (this.measurements.length === 0) return 0
    const sorted = [...this.measurements].sort((a, b) => a - b)
    const index = Math.ceil(sorted.length * 0.95) - 1
    return sorted[index] || 0
  }

  isCompliantWithClaudeRules(): boolean {
    return this.getMaxTime() < 300 && this.getP95Time() < 300
  }

  getReport(): PerformanceReport {
    return {
      count: this.measurements.length,
      average: this.getAverageTime(),
      min: this.getMinTime(),
      max: this.getMaxTime(),
      p95: this.getP95Time(),
      claudeRulesCompliant: this.isCompliantWithClaudeRules(),
      target: '<300ms'
    }
  }

  reset(): void {
    this.measurements = []
    this.startTime = 0
  }
}

export interface PerformanceReport {
  count: number
  average: number
  min: number
  max: number
  p95: number
  claudeRulesCompliant: boolean
  target: string
}

/**
 * API Response Validator
 * Validates CLAUDE_RULES envelope format compliance
 */
export class ApiResponseValidator {
  static validateEnvelopeFormat(response: any): ValidationResult {
    const errors: string[] = []

    // Check required top-level properties
    if (typeof response.success !== 'boolean') {
      errors.push('Missing or invalid "success" property')
    }

    if (!response.data) {
      errors.push('Missing "data" property')
    }

    if (!response.pagination) {
      errors.push('Missing "pagination" property')
    } else {
      // Validate pagination structure
      const { page, limit, total, totalPages } = response.pagination
      if (typeof page !== 'number' || page < 1) {
        errors.push('Invalid pagination.page')
      }
      if (typeof limit !== 'number' || limit < 1) {
        errors.push('Invalid pagination.limit')
      }
      if (typeof total !== 'number' || total < 0) {
        errors.push('Invalid pagination.total')
      }
      if (typeof totalPages !== 'number' || totalPages < 0) {
        errors.push('Invalid pagination.totalPages')
      }
    }

    if (!response.meta) {
      errors.push('Missing "meta" property')
    } else {
      // Validate meta structure for material filtering
      const { timestamp, version, responseTime, filters, materialFilteringSupported, performance } = response.meta
      
      if (!timestamp || !Date.parse(timestamp)) {
        errors.push('Invalid meta.timestamp')
      }
      if (typeof version !== 'string') {
        errors.push('Invalid meta.version')
      }
      if (!responseTime || !responseTime.match(/^\d+ms$/)) {
        errors.push('Invalid meta.responseTime format')
      }
      if (!filters || typeof filters !== 'object') {
        errors.push('Invalid meta.filters')
      }
      if (typeof materialFilteringSupported !== 'boolean') {
        errors.push('Invalid meta.materialFilteringSupported')
      }
      if (!performance || typeof performance !== 'object') {
        errors.push('Invalid meta.performance')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static validateProductListDTO(product: any): ValidationResult {
    const errors: string[] = []

    // Required string fields
    const requiredStringFields = ['_id', 'name', 'description', 'category', 'subcategory', 'slug', 'primaryImage']
    for (const field of requiredStringFields) {
      if (typeof product[field] !== 'string' || product[field].length === 0) {
        errors.push(`Invalid or missing ${field}`)
      }
    }

    // Validate category enum
    if (!['rings', 'necklaces', 'earrings', 'bracelets'].includes(product.category)) {
      errors.push('Invalid category enum value')
    }

    // Validate pricing structure
    if (!product.pricing || typeof product.pricing !== 'object') {
      errors.push('Missing pricing object')
    } else {
      if (typeof product.pricing.basePrice !== 'number' || product.pricing.basePrice <= 0) {
        errors.push('Invalid pricing.basePrice')
      }
      if (typeof product.pricing.currency !== 'string' || product.pricing.currency.length === 0) {
        errors.push('Invalid pricing.currency')
      }
    }

    // Validate inventory structure
    if (!product.inventory || typeof product.inventory !== 'object') {
      errors.push('Missing inventory object')
    } else {
      if (typeof product.inventory.available !== 'boolean') {
        errors.push('Invalid inventory.available')
      }
    }

    // Validate metadata structure
    if (!product.metadata || typeof product.metadata !== 'object') {
      errors.push('Missing metadata object')
    } else {
      const booleanFields = ['featured', 'bestseller', 'newArrival']
      for (const field of booleanFields) {
        if (typeof product.metadata[field] !== 'boolean') {
          errors.push(`Invalid metadata.${field}`)
        }
      }
      if (!Array.isArray(product.metadata.tags)) {
        errors.push('Invalid metadata.tags - should be array')
      }
    }

    // Validate materialSpecs structure
    if (!product.materialSpecs || typeof product.materialSpecs !== 'object') {
      errors.push('Missing materialSpecs object')
    } else {
      const { primaryMetal, primaryStone } = product.materialSpecs
      
      if (!primaryMetal || typeof primaryMetal !== 'object') {
        errors.push('Missing materialSpecs.primaryMetal')
      } else {
        const validMetals: MetalType[] = ['silver', '14k-gold', '18k-gold', 'platinum']
        if (!validMetals.includes(primaryMetal.type)) {
          errors.push('Invalid materialSpecs.primaryMetal.type')
        }
        if (typeof primaryMetal.purity !== 'string') {
          errors.push('Invalid materialSpecs.primaryMetal.purity')
        }
        if (typeof primaryMetal.displayName !== 'string') {
          errors.push('Invalid materialSpecs.primaryMetal.displayName')
        }
      }

      if (primaryStone) {
        const validStones: StoneType[] = ['lab-diamond', 'moissanite', 'lab-emerald', 'lab-ruby', 'lab-sapphire']
        if (!validStones.includes(primaryStone.type)) {
          errors.push('Invalid materialSpecs.primaryStone.type')
        }
        if (typeof primaryStone.carat !== 'number' || primaryStone.carat <= 0) {
          errors.push('Invalid materialSpecs.primaryStone.carat')
        }
        if (typeof primaryStone.displayName !== 'string') {
          errors.push('Invalid materialSpecs.primaryStone.displayName')
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Mock Data Factory
 * Creates realistic test data for API testing
 */
export class MockDataFactory {
  private static idCounter = 1

  static createProduct(
    overrides: Partial<ProductListDTO> = {},
    metalType?: MetalType,
    stone?: { type: StoneType; carat: number }
  ): ProductListDTO {
    const id = String(this.idCounter++)
    const baseName = overrides.name || `Test Product ${id}`
    
    const defaultMaterial = metalType || 'silver'
    const materialSpecs = this.createMaterialSpecs(defaultMaterial, stone)

    return {
      _id: id,
      name: baseName,
      description: `Premium ${baseName} crafted with precision`,
      category: 'rings',
      subcategory: 'engagement-rings',
      slug: baseName.toLowerCase().replace(/\s+/g, '-'),
      primaryImage: `/images/${id}-primary.jpg`,
      pricing: {
        basePrice: 1500 + Math.random() * 3000,
        currency: 'USD'
      },
      inventory: {
        available: true,
        quantity: 10
      },
      metadata: {
        featured: Math.random() > 0.7,
        bestseller: Math.random() > 0.8,
        newArrival: Math.random() > 0.9,
        tags: ['premium', 'handcrafted']
      },
      materialSpecs,
      creator: {
        handle: 'test-creator',
        name: 'Test Creator'
      },
      ...overrides
    }
  }

  static createProductSet(count: number, metalDistribution?: Partial<Record<MetalType, number>>): ProductListDTO[] {
    const products: ProductListDTO[] = []
    const metals: MetalType[] = ['silver', '14k-gold', '18k-gold', 'platinum']
    const stones: StoneType[] = ['lab-diamond', 'moissanite', 'lab-emerald', 'lab-ruby', 'lab-sapphire']

    for (let i = 0; i < count; i++) {
      const metal = metals[i % metals.length]
      const hasStone = Math.random() > 0.3 // 70% chance of having a stone
      const stone = hasStone ? {
        type: stones[Math.floor(Math.random() * stones.length)],
        carat: 0.25 + Math.random() * 4.75 // 0.25 to 5.0 carats
      } : undefined

      products.push(this.createProduct(
        { name: `Product ${i + 1}` },
        metal,
        stone
      ))
    }

    return products
  }

  private static createMaterialSpecs(metalType: MetalType, stone?: { type: StoneType; carat: number }) {
    const metalSpecs: Record<MetalType, { purity: string; displayName: string }> = {
      'silver': { purity: '925', displayName: '925 Silver' },
      '14k-gold': { purity: '14K', displayName: '14K Gold' },
      '18k-gold': { purity: '18K', displayName: '18K Gold' },
      'platinum': { purity: 'PLAT', displayName: 'Platinum' }
    }

    const stoneNames: Record<StoneType, string> = {
      'lab-diamond': 'Lab Diamond',
      'moissanite': 'Moissanite',
      'lab-emerald': 'Lab Emerald',
      'lab-ruby': 'Lab Ruby',
      'lab-sapphire': 'Lab Sapphire'
    }

    return {
      primaryMetal: {
        type: metalType,
        ...metalSpecs[metalType]
      },
      primaryStone: stone ? {
        type: stone.type,
        carat: stone.carat,
        displayName: `${stone.carat}CT ${stoneNames[stone.type]}`
      } : undefined
    }
  }
}

/**
 * Request Builder Utility
 * Helps create mock NextRequest objects for testing
 */
export class RequestBuilder {
  private baseUrl = 'http://localhost:3000/api/products'
  private params: Record<string, string> = {}

  static create(): RequestBuilder {
    return new RequestBuilder()
  }

  withMetal(metal: MetalType | MetalType[]): RequestBuilder {
    const metals = Array.isArray(metal) ? metal.join(',') : metal
    this.params.metals = metals
    return this
  }

  withStone(stone: StoneType | StoneType[]): RequestBuilder {
    const stones = Array.isArray(stone) ? stone.join(',') : stone
    this.params.stones = stones
    return this
  }

  withCaratRange(min?: number, max?: number): RequestBuilder {
    if (min !== undefined) this.params.caratMin = min.toString()
    if (max !== undefined) this.params.caratMax = max.toString()
    return this
  }

  withPriceRange(min?: number, max?: number): RequestBuilder {
    if (min !== undefined) this.params.minPrice = min.toString()
    if (max !== undefined) this.params.maxPrice = max.toString()
    return this
  }

  withPagination(page?: number, limit?: number): RequestBuilder {
    if (page !== undefined) this.params.page = page.toString()
    if (limit !== undefined) this.params.limit = limit.toString()
    return this
  }

  withQuery(query: string): RequestBuilder {
    this.params.query = query
    return this
  }

  withParams(params: Record<string, string>): RequestBuilder {
    Object.assign(this.params, params)
    return this
  }

  build(): NextRequest {
    const url = new URL(this.baseUrl)
    Object.entries(this.params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
    return new NextRequest(url)
  }
}

/**
 * Test Response Parser
 * Utility for parsing and analyzing API responses
 */
export class ResponseParser {
  static async parse(response: Response) {
    const data = await response.json()
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data,
      responseTime: this.extractResponseTime(response.headers.get('x-response-time'))
    }
  }

  static extractResponseTime(headerValue: string | null): number {
    if (!headerValue) return 0
    const match = headerValue.match(/^(\d+)ms$/)
    return match ? parseInt(match[1]) : 0
  }

  static validatePerformance(responseTime: number, target: number = 300): PerformanceValidation {
    return {
      responseTime,
      target,
      compliant: responseTime < target,
      percentage: (responseTime / target) * 100
    }
  }
}

export interface PerformanceValidation {
  responseTime: number
  target: number
  compliant: boolean
  percentage: number
}

/**
 * Concurrent Testing Utility
 * Helps test API performance under concurrent load
 */
export class ConcurrentTester {
  static async runConcurrent<T>(
    testFunction: () => Promise<T>,
    concurrency: number,
    iterations: number = 1
  ): Promise<ConcurrentTestResult<T>> {
    const results: T[] = []
    const timings: number[] = []
    const errors: Error[] = []

    const startTime = performance.now()

    // Create batches of concurrent requests
    for (let i = 0; i < iterations; i++) {
      const batch = Array.from({ length: concurrency }, async () => {
        const batchStartTime = performance.now()
        try {
          const result = await testFunction()
          const duration = performance.now() - batchStartTime
          timings.push(duration)
          results.push(result)
          return result
        } catch (error) {
          const duration = performance.now() - batchStartTime
          timings.push(duration)
          errors.push(error as Error)
          throw error
        }
      })

      await Promise.allSettled(batch)
    }

    const totalTime = performance.now() - startTime

    return {
      results,
      timings,
      errors,
      totalTime,
      averageTime: timings.length > 0 ? timings.reduce((a, b) => a + b, 0) / timings.length : 0,
      maxTime: Math.max(...timings),
      minTime: Math.min(...timings),
      successRate: results.length / (results.length + errors.length)
    }
  }
}

export interface ConcurrentTestResult<T> {
  results: T[]
  timings: number[]
  errors: Error[]
  totalTime: number
  averageTime: number
  maxTime: number
  minTime: number
  successRate: number
}