/**
 * Performance Integration Tests for Material Filtering API
 * Focused on CLAUDE_RULES <300ms performance requirements
 */

import { GET } from '../route'
import { 
  PerformanceBenchmark, 
  RequestBuilder, 
  ResponseParser, 
  ConcurrentTester,
  MockDataFactory 
} from './test-utils'

// Mock dependencies
jest.mock('@/lib/repositories/product.repository')
jest.mock('@/lib/redis-rate-limiter')
jest.mock('@/lib/auth-middleware')

import { productRepository } from '@/lib/repositories/product.repository'
import { publicRoute } from '@/lib/auth-middleware'

const mockProductRepository = productRepository as jest.Mocked<typeof productRepository>
const mockPublicRoute = publicRoute as jest.MockedFunction<typeof publicRoute>

describe('Performance Integration Tests', () => {
  let benchmark: PerformanceBenchmark

  beforeEach(() => {
    jest.clearAllMocks()
    benchmark = new PerformanceBenchmark()
    
    // Default mock implementations
    mockPublicRoute.mockResolvedValue({ success: true })
    
    // Create realistic test dataset
    const mockProducts = MockDataFactory.createProductSet(100)
    
    mockProductRepository.searchProducts.mockResolvedValue({
      products: mockProducts.slice(0, 20), // Paginated results
      pagination: {
        page: 1,
        limit: 20,
        total: mockProducts.length,
        totalPages: Math.ceil(mockProducts.length / 20)
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

  describe('Single Request Performance', () => {
    it('should complete basic product list request within 300ms', async () => {
      benchmark.start()
      
      const request = RequestBuilder.create().build()
      const response = await GET(request)
      
      const responseTime = benchmark.end()
      const { data } = await ResponseParser.parse(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(responseTime).toBeLessThan(300)
      
      // Verify performance tracking in response
      expect(data.meta.performance.compliant).toBe(true)
    })

    it('should complete metal filtering request within 300ms', async () => {
      benchmark.start()
      
      const request = RequestBuilder.create()
        .withMetal(['silver', '14k-gold'])
        .build()
      const response = await GET(request)
      
      const responseTime = benchmark.end()
      const { data } = await ResponseParser.parse(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(responseTime).toBeLessThan(300)
      expect(data.meta.filters.applied.metals).toEqual(['silver', '14k-gold'])
    })

    it('should complete complex filtering request within 300ms', async () => {
      benchmark.start()
      
      const request = RequestBuilder.create()
        .withMetal('platinum')
        .withStone('lab-diamond')
        .withCaratRange(1.0, 3.0)
        .withPriceRange(2000, 8000)
        .withQuery('engagement ring')
        .build()
      const response = await GET(request)
      
      const responseTime = benchmark.end()
      const { data } = await ResponseParser.parse(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(responseTime).toBeLessThan(300)
      
      // Verify all filters are applied
      expect(data.meta.filters.applied).toMatchObject({
        metals: ['platinum'],
        stones: ['lab-diamond'],
        caratRange: { min: 1.0, max: 3.0 }
      })
    })

    it('should maintain performance with pagination', async () => {
      const requests = [
        RequestBuilder.create().withPagination(1, 20).build(),
        RequestBuilder.create().withPagination(2, 20).build(),
        RequestBuilder.create().withPagination(3, 20).build(),
        RequestBuilder.create().withPagination(1, 50).build()
      ]

      for (const request of requests) {
        benchmark.start()
        const response = await GET(request)
        const responseTime = benchmark.end()
        
        expect(response.status).toBe(200)
        expect(responseTime).toBeLessThan(300)
      }

      expect(benchmark.isCompliantWithClaudeRules()).toBe(true)
    })
  })

  describe('Concurrent Request Performance', () => {
    it('should handle 5 concurrent requests efficiently', async () => {
      const testFunction = async () => {
        const request = RequestBuilder.create()
          .withMetal('silver')
          .build()
        return await GET(request)
      }

      const result = await ConcurrentTester.runConcurrent(testFunction, 5, 1)

      expect(result.errors).toHaveLength(0)
      expect(result.successRate).toBe(1.0)
      expect(result.averageTime).toBeLessThan(300)
      expect(result.maxTime).toBeLessThan(500) // Allow some overhead for concurrency
      
      // Verify all responses are successful
      for (const response of result.results) {
        expect(response.status).toBe(200)
      }
    })

    it('should handle 10 concurrent filtering requests efficiently', async () => {
      const metals = ['silver', '14k-gold', '18k-gold', 'platinum']
      const stones = ['lab-diamond', 'moissanite']

      const testFunction = async () => {
        const metal = metals[Math.floor(Math.random() * metals.length)]
        const stone = stones[Math.floor(Math.random() * stones.length)]
        
        const request = RequestBuilder.create()
          .withMetal(metal)
          .withStone(stone)
          .build()
        return await GET(request)
      }

      const result = await ConcurrentTester.runConcurrent(testFunction, 10, 1)

      expect(result.errors).toHaveLength(0)
      expect(result.successRate).toBe(1.0)
      expect(result.averageTime).toBeLessThan(400) // Allow some overhead
      expect(result.totalTime).toBeLessThan(1000) // Total time should be reasonable
    })

    it('should maintain performance under sustained load', async () => {
      const testFunction = async () => {
        const request = RequestBuilder.create()
          .withMetal(['silver', '14k-gold'])
          .withPagination(1, 10)
          .build()
        return await GET(request)
      }

      // Run 3 batches of 5 concurrent requests
      const result = await ConcurrentTester.runConcurrent(testFunction, 5, 3)

      expect(result.errors).toHaveLength(0)
      expect(result.successRate).toBe(1.0)
      expect(result.averageTime).toBeLessThan(350) // Slightly higher threshold for sustained load
      
      // Check that performance doesn't degrade significantly over time
      const firstHalf = result.timings.slice(0, Math.floor(result.timings.length / 2))
      const secondHalf = result.timings.slice(Math.floor(result.timings.length / 2))
      
      const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
      const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
      
      // Second half shouldn't be more than 50% slower
      expect(secondHalfAvg).toBeLessThan(firstHalfAvg * 1.5)
    })
  })

  describe('Performance Edge Cases', () => {
    it('should handle large result sets efficiently', async () => {
      // Mock larger dataset
      const largeDataset = MockDataFactory.createProductSet(1000)
      mockProductRepository.searchProducts.mockResolvedValue({
        products: largeDataset.slice(0, 50), // Return max page size
        pagination: {
          page: 1,
          limit: 50,
          total: largeDataset.length,
          totalPages: Math.ceil(largeDataset.length / 50)
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

      benchmark.start()
      
      const request = RequestBuilder.create()
        .withPagination(1, 50)
        .build()
      const response = await GET(request)
      
      const responseTime = benchmark.end()
      const { data } = await ResponseParser.parse(response)

      expect(response.status).toBe(200)
      expect(data.data).toHaveLength(50)
      expect(responseTime).toBeLessThan(300)
      expect(data.pagination.total).toBe(1000)
    })

    it('should handle complex filter combinations efficiently', async () => {
      benchmark.start()
      
      const request = RequestBuilder.create()
        .withMetal(['silver', '14k-gold', '18k-gold', 'platinum'])
        .withStone(['lab-diamond', 'moissanite', 'lab-emerald'])
        .withCaratRange(0.5, 2.0)
        .withPriceRange(1000, 5000)
        .withQuery('luxury engagement ring premium')
        .withParams({
          featured: 'true',
          inStock: 'true',
          tags: 'premium,handcrafted,luxury'
        })
        .build()
      const response = await GET(request)
      
      const responseTime = benchmark.end()

      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(300)
    })

    it('should handle empty result sets efficiently', async () => {
      // Mock empty result set
      mockProductRepository.searchProducts.mockResolvedValue({
        products: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        },
        filters: {
          applied: { metals: ['platinum'] },
          available: {}
        }
      })

      benchmark.start()
      
      const request = RequestBuilder.create()
        .withMetal('platinum')
        .withStone('lab-diamond')
        .withCaratRange(10, 20) // Unrealistic range to ensure no results
        .build()
      const response = await GET(request)
      
      const responseTime = benchmark.end()
      const { data } = await ResponseParser.parse(response)

      expect(response.status).toBe(200)
      expect(data.data).toHaveLength(0)
      expect(responseTime).toBeLessThan(300)
    })
  })

  describe('Performance Regression Prevention', () => {
    it('should maintain consistent performance across different filter types', async () => {
      const testCases = [
        () => RequestBuilder.create().withMetal('silver').build(),
        () => RequestBuilder.create().withStone('lab-diamond').build(),
        () => RequestBuilder.create().withCaratRange(1, 2).build(),
        () => RequestBuilder.create().withPriceRange(1000, 3000).build(),
        () => RequestBuilder.create().withQuery('engagement').build(),
        () => RequestBuilder.create()
          .withMetal('14k-gold')
          .withStone('moissanite')
          .withCaratRange(0.5, 1.5)
          .build()
      ]

      const results: number[] = []

      for (const createRequest of testCases) {
        benchmark.start()
        const request = createRequest()
        const response = await GET(request)
        const responseTime = benchmark.end()
        
        expect(response.status).toBe(200)
        results.push(responseTime)
      }

      // All results should be under 300ms
      results.forEach(time => expect(time).toBeLessThan(300))
      
      // Performance variance shouldn't be too high
      const avg = results.reduce((a, b) => a + b, 0) / results.length
      const variance = results.reduce((acc, time) => acc + Math.pow(time - avg, 2), 0) / results.length
      const stdDev = Math.sqrt(variance)
      
      // Standard deviation should be reasonable (less than 50% of average)
      expect(stdDev).toBeLessThan(avg * 0.5)
    })

    it('should generate comprehensive performance report', () => {
      // Run multiple tests to populate benchmark
      const testRuns = [150, 75, 200, 120, 180, 95, 220, 140, 160, 110]
      testRuns.forEach(time => {
        benchmark['measurements'].push(time) // Access private property for testing
      })

      const report = benchmark.getReport()

      expect(report.count).toBe(10)
      expect(report.average).toBeCloseTo(145, 0)
      expect(report.min).toBe(75)
      expect(report.max).toBe(220)
      expect(report.p95).toBe(220) // Should be 95th percentile
      expect(report.claudeRulesCompliant).toBe(true) // All under 300ms
      expect(report.target).toBe('<300ms')
    })
  })

  afterEach(() => {
    if (benchmark) {
      const report = benchmark.getReport()
      if (report.count > 0) {
        console.log(`Performance Report: ${JSON.stringify(report, null, 2)}`)
      }
    }
  })
})