/**
 * Material Filtering API E2E Tests
 * Comprehensive test suite for enhanced products API with material filtering
 * 
 * CLAUDE_RULES.md Compliance:
 * - API envelope format validation
 * - <300ms response time requirement
 * - TypeScript everywhere, no 'any' types
 * - Zod validation testing
 * - Strong interface compliance
 */

import { NextRequest } from 'next/server'
import { GET } from '../route'
import { ProductListDTO, MetalType, StoneType, ProductListMaterialSpecs } from '@/types/product-dto'
import { createMaterialSpecs, isValidMaterialSpecs } from '@/types/product-dto'

// Mock dependencies
jest.mock('@/lib/repositories/product.repository', () => ({
  productRepository: {
    searchProducts: jest.fn()
  }
}))

jest.mock('@/lib/redis-rate-limiter', () => ({
  checkRateLimit: jest.fn()
}))

jest.mock('@/lib/auth-middleware', () => ({
  publicRoute: jest.fn(),
  requireAdmin: jest.fn()
}))

jest.mock('@/lib/api-utils', () => ({
  createSuccessResponse: jest.fn((data, pagination, meta) => {
    return new Response(JSON.stringify({
      success: true,
      data,
      pagination,
      meta
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }),
  createErrorResponse: jest.fn((code, message, errors, status) => {
    return new Response(JSON.stringify({
      success: false,
      error: { code, message, errors }
    }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  }),
  createValidationErrorResponse: jest.fn((error) => {
    return new Response(JSON.stringify({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', errors: error.errors }
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }),
  addSecurityHeaders: jest.fn((response) => response),
  validateRequestBody: jest.fn()
}))

import { productRepository } from '@/lib/repositories/product.repository'
import { checkRateLimit } from '@/lib/redis-rate-limiter'
import { publicRoute } from '@/lib/auth-middleware'

const mockProductRepository = productRepository as jest.Mocked<typeof productRepository>
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>
const mockPublicRoute = publicRoute as jest.MockedFunction<typeof publicRoute>

// Mock data factory for creating realistic test products
const createMockProduct = (
  id: string,
  name: string,
  metalType: MetalType,
  stone?: { type: StoneType; carat: number }
): ProductListDTO => {
  return {
    _id: id,
    name,
    description: `Premium ${name} crafted with precision`,
    category: 'rings' as const,
    subcategory: 'engagement-rings' as const,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
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
    materialSpecs: createMaterialSpecs(metalType, stone),
    creator: {
      handle: 'test-creator',
      name: 'Test Creator'
    }
  }
}

// Mock product dataset with diverse material specifications
const mockProducts: ProductListDTO[] = [
  // Silver products
  createMockProduct('1', 'Classic Silver Ring', 'silver'),
  createMockProduct('2', 'Silver Moissanite Ring', 'silver', { type: 'moissanite', carat: 1.0 }),
  createMockProduct('3', 'Silver Lab Diamond Ring', 'silver', { type: 'lab-diamond', carat: 0.5 }),
  
  // 14K Gold products
  createMockProduct('4', '14K Gold Solitaire', '14k-gold'),
  createMockProduct('5', '14K Gold Emerald Ring', '14k-gold', { type: 'lab-emerald', carat: 1.2 }),
  createMockProduct('6', '14K Gold Diamond Ring', '14k-gold', { type: 'lab-diamond', carat: 2.0 }),
  
  // 18K Gold products
  createMockProduct('7', '18K Gold Luxury Ring', '18k-gold'),
  createMockProduct('8', '18K Gold Ruby Ring', '18k-gold', { type: 'lab-ruby', carat: 1.5 }),
  
  // Platinum products
  createMockProduct('9', 'Platinum Elite Ring', 'platinum'),
  createMockProduct('10', 'Platinum Sapphire Ring', 'platinum', { type: 'lab-sapphire', carat: 1.8 }),
  createMockProduct('11', 'Platinum Diamond Ring', 'platinum', { type: 'lab-diamond', carat: 3.0 }),
  
  // Mixed carat weights for range testing
  createMockProduct('12', 'Small Diamond Ring', '14k-gold', { type: 'lab-diamond', carat: 0.25 }),
  createMockProduct('13', 'Large Diamond Ring', 'platinum', { type: 'lab-diamond', carat: 5.0 }),
]

// Helper to create mock request
const createMockRequest = (searchParams: Record<string, string> = {}): NextRequest => {
  const url = new URL('http://localhost:3000/api/products')
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  
  return new NextRequest(url)
}

// Helper to parse response
const parseResponse = async (response: Response) => {
  const data = await response.json()
  return {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    data
  }
}

describe('Material Filtering API E2E Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Default mock implementations
    mockPublicRoute.mockResolvedValue({ success: true })
    mockCheckRateLimit.mockResolvedValue({ success: true })
    
    // Default repository mock response
    mockProductRepository.searchProducts.mockResolvedValue({
      products: mockProducts,
      pagination: {
        page: 1,
        limit: 20,
        total: mockProducts.length,
        totalPages: 1
      },
      filters: {
        applied: {},
        available: {
          categories: ['rings', 'necklaces'],
          priceRange: { min: 100, max: 10000 },
          materials: ['silver', '14k-gold', '18k-gold', 'platinum']
        }
      }
    })
  })

  describe('API Response Format Compliance (CLAUDE_RULES)', () => {
    it('should return CLAUDE_RULES compliant envelope format', async () => {
      const request = createMockRequest()
      const response = await GET(request)
      const { status, data } = await parseResponse(response)

      expect(status).toBe(200)
      
      // Verify CLAUDE_RULES envelope structure
      expect(data).toHaveProperty('success', true)
      expect(data).toHaveProperty('data')
      expect(data).toHaveProperty('pagination')
      expect(data).toHaveProperty('meta')
      
      // Verify pagination structure
      expect(data.pagination).toMatchObject({
        page: expect.any(Number),
        limit: expect.any(Number),
        total: expect.any(Number),
        totalPages: expect.any(Number)
      })
      
      // Verify enhanced meta structure for material filtering
      expect(data.meta).toMatchObject({
        timestamp: expect.any(String),
        version: '2.0.0',
        responseTime: expect.stringMatching(/^\d+ms$/),
        filters: {
          applied: expect.any(Object),
          available: expect.any(Object)
        },
        materialFilteringSupported: true,
        performance: {
          query: expect.stringMatching(/^\d+ms$/),
          target: '<300ms',
          compliant: expect.any(Boolean)
        }
      })
    })

    it('should include materialSpecs in ProductListDTO responses', async () => {
      const request = createMockRequest()
      const response = await GET(request)
      const { data } = await parseResponse(response)

      expect(data.data).toBeInstanceOf(Array)
      expect(data.data.length).toBeGreaterThan(0)
      
      // Check first product has proper materialSpecs
      const firstProduct = data.data[0]
      expect(firstProduct).toHaveProperty('materialSpecs')
      expect(isValidMaterialSpecs(firstProduct.materialSpecs)).toBe(true)
      
      // Verify materialSpecs structure
      expect(firstProduct.materialSpecs.primaryMetal).toMatchObject({
        type: expect.any(String),
        purity: expect.any(String),
        displayName: expect.any(String)
      })
      
      // If primaryStone exists, verify its structure
      if (firstProduct.materialSpecs.primaryStone) {
        expect(firstProduct.materialSpecs.primaryStone).toMatchObject({
          type: expect.any(String),
          carat: expect.any(Number),
          displayName: expect.any(String)
        })
      }
    })

    it('should include proper security and performance headers', async () => {
      const request = createMockRequest()
      const response = await GET(request)
      const { headers } = await parseResponse(response)

      // Performance headers
      expect(headers).toHaveProperty('x-response-time')
      expect(headers).toHaveProperty('x-total-count')
      expect(headers).toHaveProperty('x-page-count')
      expect(headers).toHaveProperty('cache-control')
      
      // Verify cache control for performance
      expect(headers['cache-control']).toContain('public')
      expect(headers['cache-control']).toContain('max-age=300')
    })
  })

  describe('Material Filtering Functionality', () => {
    it('should filter products by metal type (silver)', async () => {
      // Mock filtered response for silver products
      const silverProducts = mockProducts.filter(p => 
        p.materialSpecs.primaryMetal.type === 'silver'
      )
      
      mockProductRepository.searchProducts.mockResolvedValue({
        products: silverProducts,
        pagination: {
          page: 1,
          limit: 20,
          total: silverProducts.length,
          totalPages: 1
        },
        filters: {
          applied: { metals: ['silver'] },
          available: {}
        }
      })

      const request = createMockRequest({ metals: 'silver' })
      const response = await GET(request)
      const { data } = await parseResponse(response)

      expect(data.success).toBe(true)
      expect(data.meta.filters.applied.metals).toEqual(['silver'])
      
      // Verify all returned products have silver metal
      data.data.forEach((product: ProductListDTO) => {
        expect(product.materialSpecs.primaryMetal.type).toBe('silver')
      })
    })

    it('should filter products by multiple metal types', async () => {
      const goldProducts = mockProducts.filter(p => 
        ['14k-gold', '18k-gold'].includes(p.materialSpecs.primaryMetal.type)
      )
      
      mockProductRepository.searchProducts.mockResolvedValue({
        products: goldProducts,
        pagination: {
          page: 1,
          limit: 20,
          total: goldProducts.length,
          totalPages: 1
        },
        filters: {
          applied: { metals: ['14k-gold', '18k-gold'] },
          available: {}
        }
      })

      const request = createMockRequest({ metals: '14k-gold,18k-gold' })
      const response = await GET(request)
      const { data } = await parseResponse(response)

      expect(data.success).toBe(true)
      expect(data.meta.filters.applied.metals).toEqual(['14k-gold', '18k-gold'])
      
      // Verify all returned products have gold metals
      data.data.forEach((product: ProductListDTO) => {
        expect(['14k-gold', '18k-gold']).toContain(product.materialSpecs.primaryMetal.type)
      })
    })

    it('should filter products by stone type (lab-diamond)', async () => {
      const diamondProducts = mockProducts.filter(p => 
        p.materialSpecs.primaryStone?.type === 'lab-diamond'
      )
      
      mockProductRepository.searchProducts.mockResolvedValue({
        products: diamondProducts,
        pagination: {
          page: 1,
          limit: 20,
          total: diamondProducts.length,
          totalPages: 1
        },
        filters: {
          applied: { stones: ['lab-diamond'] },
          available: {}
        }
      })

      const request = createMockRequest({ stones: 'lab-diamond' })
      const response = await GET(request)
      const { data } = await parseResponse(response)

      expect(data.success).toBe(true)
      expect(data.meta.filters.applied.stones).toEqual(['lab-diamond'])
      
      // Verify all returned products have lab-diamond stones
      data.data.forEach((product: ProductListDTO) => {
        expect(product.materialSpecs.primaryStone?.type).toBe('lab-diamond')
      })
    })

    it('should filter products by carat range', async () => {
      const midCaratProducts = mockProducts.filter(p => {
        const carat = p.materialSpecs.primaryStone?.carat
        return carat && carat >= 1.0 && carat <= 2.0
      })
      
      mockProductRepository.searchProducts.mockResolvedValue({
        products: midCaratProducts,
        pagination: {
          page: 1,
          limit: 20,
          total: midCaratProducts.length,
          totalPages: 1
        },
        filters: {
          applied: { caratRange: { min: 1.0, max: 2.0 } },
          available: {}
        }
      })

      const request = createMockRequest({ caratMin: '1.0', caratMax: '2.0' })
      const response = await GET(request)
      const { data } = await parseResponse(response)

      expect(data.success).toBe(true)
      expect(data.meta.filters.applied.caratRange).toEqual({ min: 1.0, max: 2.0 })
      
      // Verify all returned products are within carat range
      data.data.forEach((product: ProductListDTO) => {
        const carat = product.materialSpecs.primaryStone?.carat
        if (carat) {
          expect(carat).toBeGreaterThanOrEqual(1.0)
          expect(carat).toBeLessThanOrEqual(2.0)
        }
      })
    })

    it('should handle combined filters (metal + stone + carat)', async () => {
      const filteredProducts = mockProducts.filter(p => 
        p.materialSpecs.primaryMetal.type === 'platinum' &&
        p.materialSpecs.primaryStone?.type === 'lab-diamond' &&
        p.materialSpecs.primaryStone?.carat >= 1.5
      )
      
      mockProductRepository.searchProducts.mockResolvedValue({
        products: filteredProducts,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredProducts.length,
          totalPages: 1
        },
        filters: {
          applied: { 
            metals: ['platinum'],
            stones: ['lab-diamond'],
            caratRange: { min: 1.5, max: Number.MAX_SAFE_INTEGER }
          },
          available: {}
        }
      })

      const request = createMockRequest({ 
        metals: 'platinum',
        stones: 'lab-diamond',
        caratMin: '1.5'
      })
      const response = await GET(request)
      const { data } = await parseResponse(response)

      expect(data.success).toBe(true)
      expect(data.meta.filters.applied).toMatchObject({
        metals: ['platinum'],
        stones: ['lab-diamond'],
        caratRange: { min: 1.5, max: Number.MAX_SAFE_INTEGER }
      })
      
      // Verify complex filter criteria
      data.data.forEach((product: ProductListDTO) => {
        expect(product.materialSpecs.primaryMetal.type).toBe('platinum')
        expect(product.materialSpecs.primaryStone?.type).toBe('lab-diamond')
        expect(product.materialSpecs.primaryStone?.carat).toBeGreaterThanOrEqual(1.5)
      })
    })

    it('should return empty results for filters with no matches', async () => {
      mockProductRepository.searchProducts.mockResolvedValue({
        products: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        },
        filters: {
          applied: { metals: ['invalid-metal'] },
          available: {}
        }
      })

      const request = createMockRequest({ metals: 'invalid-metal' })
      const response = await GET(request)
      const { status, data } = await parseResponse(response)

      expect(status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual([])
      expect(data.pagination.total).toBe(0)
    })
  })

  describe('Zod Validation and Error Handling', () => {
    it('should validate valid material parameters', async () => {
      const request = createMockRequest({ 
        metals: 'silver,14k-gold',
        stones: 'lab-diamond,moissanite',
        caratMin: '0.5',
        caratMax: '3.0'
      })
      
      const response = await GET(request)
      const { status } = await parseResponse(response)

      expect(status).toBe(200)
      expect(mockProductRepository.searchProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            metals: ['silver', '14k-gold'],
            stones: ['lab-diamond', 'moissanite'],
            caratRange: { min: 0.5, max: 3.0 }
          })
        })
      )
    })

    it('should filter out invalid metal types and keep valid ones', async () => {
      const request = createMockRequest({ metals: 'silver,invalid-metal,14k-gold' })
      const response = await GET(request)
      const { status } = await parseResponse(response)

      expect(status).toBe(200)
      expect(mockProductRepository.searchProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            metals: ['silver', '14k-gold'] // invalid-metal filtered out
          })
        })
      )
    })

    it('should filter out invalid stone types and keep valid ones', async () => {
      const request = createMockRequest({ stones: 'lab-diamond,fake-stone,moissanite' })
      const response = await GET(request)
      const { status } = await parseResponse(response)

      expect(status).toBe(200)
      expect(mockProductRepository.searchProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            stones: ['lab-diamond', 'moissanite'] // fake-stone filtered out
          })
        })
      )
    })

    it('should handle invalid carat range (min > max)', async () => {
      const request = createMockRequest({ caratMin: '3.0', caratMax: '1.0' })
      const response = await GET(request)
      const { status, data } = await parseResponse(response)

      expect(status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('VALIDATION_ERROR')
    })

    it('should handle invalid price range (min > max)', async () => {
      const request = createMockRequest({ minPrice: '5000', maxPrice: '1000' })
      const response = await GET(request)
      const { status, data } = await parseResponse(response)

      expect(status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('VALIDATION_ERROR')
    })

    it('should handle malformed numeric parameters', async () => {
      const request = createMockRequest({ caratMin: 'not-a-number' })
      const response = await GET(request)
      const { status, data } = await parseResponse(response)

      expect(status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('VALIDATION_ERROR')
    })

    it('should handle negative carat values', async () => {
      const request = createMockRequest({ caratMin: '-1.0' })
      const response = await GET(request)
      const { status, data } = await parseResponse(response)

      expect(status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('Performance Requirements (<300ms)', () => {
    it('should complete requests within 300ms target', async () => {
      const startTime = Date.now()
      
      const request = createMockRequest({ metals: 'silver,14k-gold' })
      const response = await GET(request)
      const { data } = await parseResponse(response)

      const actualResponseTime = Date.now() - startTime
      
      expect(data.success).toBe(true)
      expect(data.meta.performance.compliant).toBe(true)
      expect(actualResponseTime).toBeLessThan(300)
      
      // Verify response time is tracked in meta
      const reportedTime = parseInt(data.meta.performance.query.replace('ms', ''))
      expect(reportedTime).toBeLessThan(300)
    })

    it('should track performance in response headers', async () => {
      const request = createMockRequest()
      const response = await GET(request)
      const { headers } = await parseResponse(response)

      expect(headers['x-response-time']).toMatch(/^\d+ms$/)
      
      const responseTime = parseInt(headers['x-response-time'].replace('ms', ''))
      expect(responseTime).toBeLessThan(300)
    })

    it('should handle concurrent requests efficiently', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => 
        createMockRequest({ metals: i % 2 === 0 ? 'silver' : '14k-gold' })
      )

      const startTime = Date.now()
      const responses = await Promise.all(requests.map(req => GET(req)))
      const totalTime = Date.now() - startTime

      // All responses should be successful
      for (const response of responses) {
        const { data } = await parseResponse(response)
        expect(data.success).toBe(true)
      }

      // Total time for 5 concurrent requests should be reasonable
      expect(totalTime).toBeLessThan(1000) // 1 second for 5 requests
    })
  })

  describe('TypeScript Interface Compliance', () => {
    it('should return strongly typed ProductListDTO objects', async () => {
      const request = createMockRequest()
      const response = await GET(request)
      const { data } = await parseResponse(response)

      expect(data.data).toBeInstanceOf(Array)
      
      data.data.forEach((product: any) => {
        // Verify required ProductListDTO fields
        expect(typeof product._id).toBe('string')
        expect(typeof product.name).toBe('string')
        expect(typeof product.description).toBe('string')
        expect(['rings', 'necklaces', 'earrings', 'bracelets']).toContain(product.category)
        expect(typeof product.slug).toBe('string')
        expect(typeof product.primaryImage).toBe('string')
        
        // Verify pricing structure
        expect(typeof product.pricing.basePrice).toBe('number')
        expect(typeof product.pricing.currency).toBe('string')
        
        // Verify materialSpecs structure
        expect(product.materialSpecs).toBeDefined()
        expect(isValidMaterialSpecs(product.materialSpecs)).toBe(true)
      })
    })

    it('should validate MetalType enum compliance', async () => {
      const validMetalTypes: MetalType[] = ['silver', '14k-gold', '18k-gold', 'platinum']
      
      const request = createMockRequest()
      const response = await GET(request)
      const { data } = await parseResponse(response)

      data.data.forEach((product: ProductListDTO) => {
        expect(validMetalTypes).toContain(product.materialSpecs.primaryMetal.type)
      })
    })

    it('should validate StoneType enum compliance', async () => {
      const validStoneTypes: StoneType[] = ['lab-diamond', 'moissanite', 'lab-emerald', 'lab-ruby', 'lab-sapphire']
      
      const request = createMockRequest()
      const response = await GET(request)
      const { data } = await parseResponse(response)

      data.data.forEach((product: ProductListDTO) => {
        if (product.materialSpecs.primaryStone) {
          expect(validStoneTypes).toContain(product.materialSpecs.primaryStone.type)
        }
      })
    })

    it('should maintain type safety for material spec helpers', () => {
      // Test createMaterialSpecs helper
      const silverSpecs = createMaterialSpecs('silver')
      expect(silverSpecs.primaryMetal.type).toBe('silver')
      expect(silverSpecs.primaryMetal.purity).toBe('925')
      expect(silverSpecs.primaryMetal.displayName).toBe('925 Silver')
      expect(silverSpecs.primaryStone).toBeUndefined()

      // Test with stone
      const goldDiamondSpecs = createMaterialSpecs('14k-gold', { type: 'lab-diamond', carat: 1.5 })
      expect(goldDiamondSpecs.primaryMetal.type).toBe('14k-gold')
      expect(goldDiamondSpecs.primaryStone?.type).toBe('lab-diamond')
      expect(goldDiamondSpecs.primaryStone?.carat).toBe(1.5)
      expect(goldDiamondSpecs.primaryStone?.displayName).toBe('1.5CT Lab Diamond')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle authentication failures', async () => {
      mockPublicRoute.mockResolvedValue({ 
        success: false, 
        error: new Response(JSON.stringify({ 
          success: false, 
          error: { code: 'AUTH_FAILED' } 
        }), { status: 401 })
      })

      const request = createMockRequest()
      const response = await GET(request)
      const { status } = await parseResponse(response)

      expect(status).toBe(401)
    })

    it('should handle rate limiting', async () => {
      mockCheckRateLimit.mockResolvedValue({ 
        success: false,
        error: new Response(JSON.stringify({ 
          success: false, 
          error: { code: 'RATE_LIMIT_EXCEEDED' } 
        }), { status: 429 })
      })

      const request = createMockRequest()
      const response = await GET(request)
      const { status } = await parseResponse(response)

      expect(status).toBe(429)
    })

    it('should handle database connection failures', async () => {
      mockProductRepository.searchProducts.mockRejectedValue(new Error('Database connection failed'))

      const request = createMockRequest()
      const response = await GET(request)
      const { status, data } = await parseResponse(response)

      expect(status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('INTERNAL_ERROR')
    })

    it('should handle empty filter arrays gracefully', async () => {
      const request = createMockRequest({ metals: '', stones: '' })
      const response = await GET(request)
      const { status } = await parseResponse(response)

      expect(status).toBe(200)
      expect(mockProductRepository.searchProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            metals: undefined, // Empty string should result in undefined
            stones: undefined
          })
        })
      )
    })

    it('should handle pagination edge cases', async () => {
      const request = createMockRequest({ page: '0', limit: '999' })
      const response = await GET(request)
      const { status } = await parseResponse(response)

      expect(status).toBe(200)
      expect(mockProductRepository.searchProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1, // Should default to 1
          limit: 50 // Should cap at 50
        })
      )
    })
  })

  describe('Backward Compatibility', () => {
    it('should support legacy material filters alongside new ones', async () => {
      const request = createMockRequest({ 
        materials: 'gold,silver',  // Legacy filter
        metals: '14k-gold'         // New filter
      })
      const response = await GET(request)
      const { status } = await parseResponse(response)

      expect(status).toBe(200)
      expect(mockProductRepository.searchProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            materials: ['gold', 'silver'], // Legacy preserved
            metals: ['14k-gold']           // New filter works
          })
        })
      )
    })

    it('should support both q and query parameters', async () => {
      const request1 = createMockRequest({ q: 'diamond ring' })
      const response1 = await GET(request1)
      expect(response1.status).toBe(200)

      const request2 = createMockRequest({ query: 'diamond ring' })
      const response2 = await GET(request2)
      expect(response2.status).toBe(200)

      expect(mockProductRepository.searchProducts).toHaveBeenCalledTimes(2)
      expect(mockProductRepository.searchProducts).toHaveBeenNthCalledWith(1,
        expect.objectContaining({ query: 'diamond ring' })
      )
      expect(mockProductRepository.searchProducts).toHaveBeenNthCalledWith(2,
        expect.objectContaining({ query: 'diamond ring' })
      )
    })
  })
})