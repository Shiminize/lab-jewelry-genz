/**
 * Server 500 Error Detection & Health Validation Test
 * CLAUDE_RULES Compliant: Simple feature implementation, max 300 lines
 * Tests all critical routes for 500 errors, console errors, and performance
 */

import { test, expect } from '@playwright/test'

interface TestResult {
  url: string
  status: number
  responseTime: number
  consoleErrors: string[]
  networkErrors: string[]
  pageErrors: string[]
}

test.describe('Server 500 Error Detection & Health Validation', () => {
  
  test('Critical API Endpoints Health Check', async ({ page }) => {
    console.log('🔍 Testing critical API endpoints for 500 errors...')
    
    const apiEndpoints = [
      '/api/health',
      '/api/products',
      '/api/products/featured', 
      '/api/cart',
      '/api/auth/session',
      '/api/materials',
      '/api/navigation/data'
    ]
    
    const results: TestResult[] = []
    
    for (const endpoint of apiEndpoints) {
      console.log(`Testing API: ${endpoint}`)
      
      const startTime = Date.now()
      const consoleErrors: string[] = []
      const networkErrors: string[] = []
      const pageErrors: string[] = []
      
      // Monitor errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })
      
      page.on('response', response => {
        if (!response.ok() && response.url().includes(endpoint)) {
          networkErrors.push(`${response.status()}: ${response.statusText()}`)
        }
      })
      
      page.on('pageerror', error => {
        pageErrors.push(error.message)
      })
      
      try {
        const response = await page.request.get(endpoint)
        const responseTime = Date.now() - startTime
        
        results.push({
          url: endpoint,
          status: response.status(),
          responseTime,
          consoleErrors: [...consoleErrors],
          networkErrors: [...networkErrors], 
          pageErrors: [...pageErrors]
        })
        
        // Validate no 500 errors
        expect(response.status(), `${endpoint} should not return 500 error`).toBeLessThan(500)
        
        // Validate performance (CLAUDE_RULES compliance)
        expect(responseTime, `${endpoint} should respond within 300ms`).toBeLessThan(300)
        
        console.log(`✅ ${endpoint}: ${response.status()} (${responseTime}ms)`)
        
      } catch (error) {
        console.error(`❌ ${endpoint} failed:`, error)
        results.push({
          url: endpoint,
          status: 500,
          responseTime: Date.now() - startTime,
          consoleErrors: [...consoleErrors, error.message],
          networkErrors: [...networkErrors],
          pageErrors: [...pageErrors]
        })
        
        // Fail test if critical API returns 500
        throw new Error(`Critical API ${endpoint} returned 500 error: ${error.message}`)
      }
    }
    
    // Log summary
    console.log(`\n📊 API Health Summary:`)
    results.forEach(result => {
      console.log(`  ${result.url}: ${result.status} (${result.responseTime}ms)`)
    })
  })
  
  test('Critical Pages Health Check', async ({ page }) => {
    console.log('🔍 Testing critical pages for 500 errors...')
    
    const criticalPages = [
      { url: '/', name: 'Homepage' },
      { url: '/catalog', name: 'Product Catalog' },
      { url: '/customizer', name: '3D Customizer' },
      { url: '/cart', name: 'Shopping Cart' }
    ]
    
    const results: TestResult[] = []
    
    for (const { url, name } of criticalPages) {
      console.log(`Testing page: ${name} (${url})`)
      
      const startTime = Date.now()
      const consoleErrors: string[] = []
      const networkErrors: string[] = []
      const pageErrors: string[] = []
      
      // Monitor all types of errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })
      
      page.on('response', response => {
        if (response.status() >= 500) {
          networkErrors.push(`${response.url()}: ${response.status()}`)
        }
      })
      
      page.on('pageerror', error => {
        pageErrors.push(error.message)
      })
      
      try {
        const response = await page.goto(url)
        const responseTime = Date.now() - startTime
        
        // Wait for page to be fully loaded
        await page.waitForLoadState('networkidle', { timeout: 10000 })
        
        const status = response?.status() || 200
        
        results.push({
          url,
          status,
          responseTime,
          consoleErrors: [...consoleErrors],
          networkErrors: [...networkErrors],
          pageErrors: [...pageErrors]
        })
        
        // Validate no 500 errors
        expect(status, `${name} should not return 500 error`).toBeLessThan(500)
        
        // Validate page loads successfully
        expect(status, `${name} should load successfully`).toBe(200)
        
        // Check for critical console errors
        const criticalErrors = consoleErrors.filter(error => 
          error.includes('500') || 
          error.includes('MODULE_NOT_FOUND') ||
          error.includes('Cannot find module')
        )
        
        expect(criticalErrors.length, `${name} should have no critical console errors`).toBe(0)
        
        // Check for network 500 errors
        expect(networkErrors.length, `${name} should have no 500 network errors`).toBe(0)
        
        console.log(`✅ ${name}: ${status} (${responseTime}ms) - ${consoleErrors.length} console msgs`)
        
        if (consoleErrors.length > 0) {
          console.log(`   Console messages: ${consoleErrors.slice(0, 3).join(', ')}`)
        }
        
      } catch (error) {
        console.error(`❌ ${name} failed:`, error)
        results.push({
          url,
          status: 500,
          responseTime: Date.now() - startTime,
          consoleErrors: [...consoleErrors, error.message],
          networkErrors: [...networkErrors],
          pageErrors: [...pageErrors]
        })
        
        // Fail test if critical page returns 500
        throw new Error(`Critical page ${name} returned 500 error: ${error.message}`)
      }
    }
    
    // Log comprehensive summary
    console.log(`\n📊 Page Health Summary:`)
    results.forEach(result => {
      const errorCount = result.consoleErrors.length + result.networkErrors.length + result.pageErrors.length
      console.log(`  ${result.url}: ${result.status} (${result.responseTime}ms) - ${errorCount} errors`)
      
      if (result.consoleErrors.length > 0) {
        console.log(`    Console errors: ${result.consoleErrors.slice(0, 2).join(', ')}`)
      }
      if (result.networkErrors.length > 0) {
        console.log(`    Network errors: ${result.networkErrors.slice(0, 2).join(', ')}`)
      }
      if (result.pageErrors.length > 0) {
        console.log(`    Page errors: ${result.pageErrors.slice(0, 2).join(', ')}`)
      }
    })
  })
  
  test('Server Health Status Check', async ({ page }) => {
    console.log('🔍 Checking overall server health status...')
    
    // Test the dedicated health endpoint
    const response = await page.request.get('/api/health')
    const status = response.status()
    const body = await response.json()
    
    console.log('Health endpoint response:', { status, body })
    
    // Validate health endpoint
    expect(status).toBe(200)
    expect(body.status).toBe('healthy')
    
    // Test performance analytics endpoint
    const perfResponse = await page.request.get('/api/analytics/performance')
    const perfStatus = perfResponse.status()
    
    if (perfStatus === 200) {
      const perfBody = await perfResponse.json()
      console.log('Performance health score:', perfBody.data?.healthScore)
      
      // Validate good performance health
      if (perfBody.data?.healthScore !== undefined) {
        expect(perfBody.data.healthScore, 'Server health score should be good').toBeGreaterThan(70)
      }
    }
    
    console.log('✅ Server health check passed')
  })
})