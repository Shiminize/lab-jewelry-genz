/**
 * API Test Utilities
 * Helper functions for testing API endpoints
 * Includes URL validation to prevent SSRF attacks
 */

// SECURITY NOTE: This file contains test utilities that should NOT be included in production builds
// Consider excluding this file from production bundles or moving to a separate test directory

// URL validation for SSRF protection
function validateBaseUrl(baseUrl: string): boolean {
  try {
    const url = new URL(baseUrl)
    
    // Allowlist of permitted hosts for API testing
    const allowedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      process.env.VERCEL_URL?.replace('https://', ''),
      process.env.NEXT_PUBLIC_APP_URL?.replace(/https?:\/\//, ''),
      'api.stripe.com' // Required for Stripe integration testing
    ].filter(Boolean)
    
    // Check if hostname is in allowlist
    const isAllowedHost = allowedHosts.some(host => 
      url.hostname === host || url.hostname.endsWith(`.${host}`)
    )
    
    if (!isAllowedHost) {
      throw new Error(`Unauthorized host: ${url.hostname}. Allowed hosts: ${allowedHosts.join(', ')}`)
    }
    
    // Additional security checks
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error(`Unsupported protocol: ${url.protocol}`)
    }
    
    // Prevent access to private IP ranges (additional protection)
    const hostname = url.hostname
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      if (hostname.match(/^10\./) || 
          hostname.match(/^192\.168\./) || 
          hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./) ||
          hostname.match(/^169\.254\./)) {
        throw new Error(`Access to private IP ranges is not allowed: ${hostname}`)
      }
    }
    
    return true
  } catch (error) {
    console.error('URL validation failed:', error.message)
    return false
  }
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any[]
  }
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  meta: {
    timestamp: string
    requestId?: string
    version: string
  }
  rateLimit?: {
    limit: number
    remaining: number
    reset: number
    retryAfter?: number
  }
}

export async function testProductsApi(baseUrl: string = 'http://localhost:3000') {

  // Validate baseUrl to prevent SSRF attacks
  if (!validateBaseUrl(baseUrl)) {
    console.error('❌ Security Error: Invalid or unauthorized baseUrl provided')
    console.error('Allowed hosts: localhost, 127.0.0.1, 0.0.0.0, Vercel domains, api.stripe.com')
    return
  }

  // Test 1: GET /api/products (basic)

  const startTime1 = Date.now()
  try {
    const response = await fetch(`${baseUrl}/api/products`)
    const data: ApiResponse = await response.json()
    const responseTime1 = Date.now() - startTime1

  } catch (error) {

  }

  // Test 2: GET /api/products with filters

  const startTime2 = Date.now()
  try {
    const response = await fetch(`${baseUrl}/api/products?page=1&limit=5&sortBy=price&sortOrder=asc&featured=true`)
    const data: ApiResponse = await response.json()
    const responseTime2 = Date.now() - startTime2

  } catch (error) {

  }

  // Test 3: GET /api/products with search

  const startTime3 = Date.now()
  try {
    const response = await fetch(`${baseUrl}/api/products?q=ring&categories=rings&limit=3`)
    const data: ApiResponse = await response.json()
    const responseTime3 = Date.now() - startTime3

  } catch (error) {

  }

  // Test 4: GET /api/products/[id] (individual product)

  const startTime4 = Date.now()
  try {
    // First get a product ID from the list
    const listResponse = await fetch(`${baseUrl}/api/products?limit=1`)
    const listData: ApiResponse = await listResponse.json()
    
    if (listData.success && Array.isArray(listData.data) && listData.data.length > 0) {
      const productId = listData.data[0]._id || listData.data[0].id
      
      const response = await fetch(`${baseUrl}/api/products/${productId}`)
      const data: ApiResponse = await response.json()
      const responseTime4 = Date.now() - startTime4

    } else {

    }

  } catch (error) {

  }

  // Test 5: Invalid product ID

  const startTime5 = Date.now()
  try {
    const response = await fetch(`${baseUrl}/api/products/invalid-id-123`)
    const data: ApiResponse = await response.json()
    const responseTime5 = Date.now() - startTime5

  } catch (error) {

  }

  // Test 6: Rate limiting (if applicable)

  const startTime6 = Date.now()
  try {
    const promises = Array.from({ length: 10 }, () => 
      fetch(`${baseUrl}/api/products?limit=1`)
    )
    const responses = await Promise.all(promises)
    const responseTime6 = Date.now() - startTime6
    
    const statusCodes = responses.map(r => r.status)
    const rateLimitedRequests = statusCodes.filter(s => s === 429).length
    const successfulRequests = statusCodes.filter(s => s === 200).length

  } catch (error) {

  }

}

// Export for use in other files
export default testProductsApi