/**
 * API Test Utilities
 * Helper functions for testing API endpoints
 */

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
  console.log('Testing Product API endpoints...\n')

  // Test 1: GET /api/products (basic)
  console.log('1. Testing GET /api/products (basic):')
  const startTime1 = Date.now()
  try {
    const response = await fetch(`${baseUrl}/api/products`)
    const data: ApiResponse = await response.json()
    const responseTime1 = Date.now() - startTime1
    
    console.log(`   Status: ${response.status}`)
    console.log(`   Response Time: ${responseTime1}ms`)
    console.log(`   Success: ${data.success}`)
    console.log(`   Has Data: ${!!data.data}`)
    console.log(`   Has Pagination: ${!!data.pagination}`)
    console.log(`   Has Meta: ${!!data.meta}`)
    console.log(`   Rate Limit Headers: ${response.headers.get('X-RateLimit-Limit')}/${response.headers.get('X-RateLimit-Remaining')}`)
    console.log('')
  } catch (error) {
    console.log(`   Error: ${error}`)
  }

  // Test 2: GET /api/products with filters
  console.log('2. Testing GET /api/products (with filters):')
  const startTime2 = Date.now()
  try {
    const response = await fetch(`${baseUrl}/api/products?page=1&limit=5&sortBy=price&sortOrder=asc&featured=true`)
    const data: ApiResponse = await response.json()
    const responseTime2 = Date.now() - startTime2
    
    console.log(`   Status: ${response.status}`)
    console.log(`   Response Time: ${responseTime2}ms`)
    console.log(`   Success: ${data.success}`)
    console.log(`   Data Count: ${Array.isArray(data.data) ? data.data.length : 'N/A'}`)
    console.log(`   Pagination: page ${data.pagination?.page}/${data.pagination?.totalPages} (${data.pagination?.total} total)`)
    console.log('')
  } catch (error) {
    console.log(`   Error: ${error}`)
  }

  // Test 3: GET /api/products with search
  console.log('3. Testing GET /api/products (with search):')
  const startTime3 = Date.now()
  try {
    const response = await fetch(`${baseUrl}/api/products?q=ring&categories=rings&limit=3`)
    const data: ApiResponse = await response.json()
    const responseTime3 = Date.now() - startTime3
    
    console.log(`   Status: ${response.status}`)
    console.log(`   Response Time: ${responseTime3}ms`)
    console.log(`   Success: ${data.success}`)
    console.log(`   Search Results: ${Array.isArray(data.data) ? data.data.length : 'N/A'}`)
    console.log('')
  } catch (error) {
    console.log(`   Error: ${error}`)
  }

  // Test 4: GET /api/products/[id] (individual product)
  console.log('4. Testing GET /api/products/[id]:')
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
      
      console.log(`   Status: ${response.status}`)
      console.log(`   Response Time: ${responseTime4}ms`)
      console.log(`   Success: ${data.success}`)
      console.log(`   Product ID: ${productId}`)
      console.log(`   Product Name: ${data.data?.name || 'N/A'}`)
    } else {
      console.log(`   Error: No products found to test with`)
    }
    console.log('')
  } catch (error) {
    console.log(`   Error: ${error}`)
  }

  // Test 5: Invalid product ID
  console.log('5. Testing GET /api/products/[invalid-id]:')
  const startTime5 = Date.now()
  try {
    const response = await fetch(`${baseUrl}/api/products/invalid-id-123`)
    const data: ApiResponse = await response.json()
    const responseTime5 = Date.now() - startTime5
    
    console.log(`   Status: ${response.status}`)
    console.log(`   Response Time: ${responseTime5}ms`)
    console.log(`   Success: ${data.success}`)
    console.log(`   Error Code: ${data.error?.code}`)
    console.log(`   Error Message: ${data.error?.message}`)
    console.log('')
  } catch (error) {
    console.log(`   Error: ${error}`)
  }

  // Test 6: Rate limiting (if applicable)
  console.log('6. Testing rate limiting:')
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
    
    console.log(`   Total Requests: 10`)
    console.log(`   Response Time: ${responseTime6}ms`)
    console.log(`   Successful: ${successfulRequests}`)
    console.log(`   Rate Limited: ${rateLimitedRequests}`)
    console.log(`   Rate Limit Header: ${responses[0]?.headers.get('X-RateLimit-Limit')}`)
    console.log('')
  } catch (error) {
    console.log(`   Error: ${error}`)
  }

  console.log('API testing completed!')
}

// Export for use in other files
export default testProductsApi