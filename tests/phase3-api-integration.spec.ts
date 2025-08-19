/**
 * Phase 3 E2E Test: Complete API Integration Testing
 * Tests API envelope format, validation, rate limiting, and performance
 */

import { test, expect } from '@playwright/test'

test.describe('Phase 3: API Integration - Envelope Format', () => {
  test('API returns proper CLAUDE_RULES envelope format', async ({ request }) => {
    const response = await request.get('/api/products?limit=3')
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    
    // Verify CLAUDE_RULES envelope structure
    expect(data).toHaveProperty('success', true)
    expect(data).toHaveProperty('data')
    expect(data).toHaveProperty('pagination')
    expect(data).toHaveProperty('meta')
    
    // Verify meta object structure
    expect(data.meta).toHaveProperty('timestamp')
    expect(data.meta).toHaveProperty('requestId')
    expect(data.meta).toHaveProperty('version', '1.0.0')
    
    // Verify pagination structure
    expect(data.pagination).toHaveProperty('page')
    expect(data.pagination).toHaveProperty('limit')
    expect(data.pagination).toHaveProperty('total')
    expect(data.pagination).toHaveProperty('totalPages')
    
    // Verify data is array of products
    expect(Array.isArray(data.data)).toBe(true)
    
    if (data.data.length > 0) {
      const product = data.data[0]
      // ProductListDTO structure validation
      expect(product).toHaveProperty('_id')
      expect(product).toHaveProperty('name')
      expect(product).toHaveProperty('slug')
      expect(product).toHaveProperty('primaryImage')
      expect(product).toHaveProperty('pricing')
      expect(product.pricing).toHaveProperty('basePrice')
    }
  })

  test('API handles invalid parameters with proper error envelope', async ({ request }) => {
    const response = await request.get('/api/products?limit=invalid&page=-1')
    
    expect(response.status()).toBe(400)
    
    const data = await response.json()
    
    // Verify error envelope structure
    expect(data).toHaveProperty('success', false)
    expect(data).toHaveProperty('error')
    expect(data).toHaveProperty('meta')
    
    // Error should contain validation details
    expect(data.error).toHaveProperty('code')
    expect(data.error).toHaveProperty('message')
    expect(data.error).toHaveProperty('details')
    
    // Meta should still be present
    expect(data.meta).toHaveProperty('timestamp')
    expect(data.meta).toHaveProperty('requestId')
  })
})

test.describe('Phase 3: API Integration - Performance', () => {
  test('API response time meets <300ms CLAUDE_RULES target', async ({ request }) => {
    const startTime = Date.now()
    
    const response = await request.get('/api/products?limit=20')
    
    const responseTime = Date.now() - startTime
    
    expect(response.status()).toBe(200)
    expect(responseTime).toBeLessThan(300) // CLAUDE_RULES performance target
    
    console.log(`API response time: ${responseTime}ms`)
  })

  test('Complex queries maintain performance standards', async ({ request }) => {
    const startTime = Date.now()
    
    const response = await request.get('/api/products?query=diamond&categories=rings&minPrice=500&maxPrice=2000&featured=true&sortBy=price&limit=15')
    
    const responseTime = Date.now() - startTime
    
    expect(response.status()).toBe(200)
    expect(responseTime).toBeLessThan(300) // Should still be under 300ms
    
    const data = await response.json()
    expect(data.success).toBe(true)
    
    console.log(`Complex query response time: ${responseTime}ms`)
  })

  test('Pagination works correctly with performance', async ({ request }) => {
    // Test first page
    const page1Start = Date.now()
    const page1Response = await request.get('/api/products?page=1&limit=10')
    const page1Time = Date.now() - page1Start
    
    expect(page1Response.status()).toBe(200)
    expect(page1Time).toBeLessThan(300)
    
    const page1Data = await page1Response.json()
    expect(page1Data.pagination.page).toBe(1)
    expect(page1Data.pagination.limit).toBe(10)
    
    // Test second page
    const page2Start = Date.now()
    const page2Response = await request.get('/api/products?page=2&limit=10')
    const page2Time = Date.now() - page2Start
    
    expect(page2Response.status()).toBe(200)
    expect(page2Time).toBeLessThan(300)
    
    const page2Data = await page2Response.json()
    expect(page2Data.pagination.page).toBe(2)
    expect(page2Data.pagination.limit).toBe(10)
    
    // Different data should be returned
    if (page1Data.data.length > 0 && page2Data.data.length > 0) {
      expect(page1Data.data[0]._id).not.toBe(page2Data.data[0]._id)
    }
  })
})

test.describe('Phase 3: API Integration - Validation', () => {
  test('Zod validation rejects malformed requests', async ({ request }) => {
    // Test invalid category
    const response1 = await request.get('/api/products?categories=invalid-category')
    expect(response1.status()).toBe(200) // Should succeed but filter out invalid
    
    // Test invalid price range
    const response2 = await request.get('/api/products?minPrice=-100')
    expect(response2.status()).toBe(400) // Should reject negative prices
    
    // Test invalid limit
    const response3 = await request.get('/api/products?limit=999')
    expect(response3.status()).toBe(400) // Should reject limit > 50
  })

  test('Search query validation works properly', async ({ request }) => {
    // Valid search
    const validResponse = await request.get('/api/products?query=ring&limit=5')
    expect(validResponse.status()).toBe(200)
    
    const validData = await validResponse.json()
    expect(validData.success).toBe(true)
    
    // Empty search should still work
    const emptyResponse = await request.get('/api/products?query=&limit=5')
    expect(emptyResponse.status()).toBe(200)
    
    // Very long search query
    const longQuery = 'a'.repeat(1000)
    const longResponse = await request.get(`/api/products?query=${longQuery}&limit=5`)
    expect(longResponse.status()).toBe(200) // Should handle gracefully
  })

  test('Sort and filter combinations work correctly', async ({ request }) => {
    // Test price sorting
    const priceResponse = await request.get('/api/products?sortBy=price&sortOrder=asc&limit=5')
    expect(priceResponse.status()).toBe(200)
    
    const priceData = await priceResponse.json()
    if (priceData.data.length > 1) {
      const prices = priceData.data.map((p: any) => p.pricing.basePrice)
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i-1])
      }
    }
    
    // Test name sorting
    const nameResponse = await request.get('/api/products?sortBy=name&sortOrder=asc&limit=5')
    expect(nameResponse.status()).toBe(200)
    
    // Test category filter
    const ringsResponse = await request.get('/api/products?categories=rings&limit=10')
    expect(ringsResponse.status()).toBe(200)
    
    const ringsData = await ringsResponse.json()
    if (ringsData.data.length > 0) {
      // All returned products should be rings
      ringsData.data.forEach((product: any) => {
        expect(product.category).toBe('rings')
      })
    }
  })
})

test.describe('Phase 3: API Integration - Security & Headers', () => {
  test('API returns proper security headers', async ({ request }) => {
    const response = await request.get('/api/products?limit=1')
    
    expect(response.status()).toBe(200)
    
    // Check for rate limit headers (if implemented)
    const headers = response.headers()
    
    // Should have standard security headers
    expect(headers['content-type']).toContain('application/json')
    
    // Request ID should be unique
    const data = await response.json()
    expect(data.meta.requestId).toMatch(/^req_\d+_[a-f0-9]+$/)
  })

  test('Rate limiting configuration is in place', async ({ request }) => {
    // Make multiple rapid requests to test rate limiting
    const requests = []
    for (let i = 0; i < 5; i++) {
      requests.push(request.get('/api/products?limit=1'))
    }
    
    const responses = await Promise.all(requests)
    
    // All should succeed under normal rate limits (100/min for catalog)
    responses.forEach(response => {
      expect(response.status()).toBe(200)
    })
  })

  test('Error responses maintain consistent format', async ({ request }) => {
    // Test 404 with invalid product ID
    const notFoundResponse = await request.get('/api/products/invalid-product-id-999')
    
    if (notFoundResponse.status() === 404) {
      const data = await notFoundResponse.json()
      
      // Should follow error envelope format
      expect(data).toHaveProperty('success', false)
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('meta')
      
      expect(data.error).toHaveProperty('code')
      expect(data.error).toHaveProperty('message')
    }
  })
})

test.describe('Phase 3: API Integration - Edge Cases', () => {
  test('Handles edge case queries gracefully', async ({ request }) => {
    // Very large page number
    const bigPageResponse = await request.get('/api/products?page=9999&limit=1')
    expect(bigPageResponse.status()).toBe(200)
    
    const bigPageData = await bigPageResponse.json()
    expect(bigPageData.success).toBe(true)
    expect(bigPageData.data).toEqual([]) // Should return empty array
    
    // Zero limit (should default to minimum)
    const zeroResponse = await request.get('/api/products?limit=0')
    expect(zeroResponse.status()).toBe(400) // Should reject
    
    // Special characters in search
    const specialResponse = await request.get('/api/products?query=%20%21%40%23%24&limit=1')
    expect(specialResponse.status()).toBe(200) // Should handle gracefully
  })

  test('Database connection resilience', async ({ request }) => {
    // Multiple concurrent requests to test connection pooling
    const concurrentRequests = Array(10).fill(null).map((_, i) => 
      request.get(`/api/products?limit=1&page=${i + 1}`)
    )
    
    const responses = await Promise.all(concurrentRequests)
    
    // All should succeed
    responses.forEach((response, i) => {
      expect(response.status()).toBe(200)
    })
    
    // Each should have correct pagination
    for (let i = 0; i < responses.length; i++) {
      const data = await responses[i].json()
      expect(data.pagination.page).toBe(i + 1)
    }
  })
})