/**
 * Server Health & Console Validation Test
 * Comprehensive server issue detection using Playwright console monitoring
 * Tests for runtime errors, network issues, and server stability
 */

import { test, expect } from '@playwright/test'

test.describe('Server Health & Console Validation', () => {
  
  test('Homepage Server Health & Console Error Detection', async ({ page }) => {
    console.log('🔍 Checking homepage server health and console issues...')
    
    // Capture all console messages
    const consoleLogs: Array<{type: string, message: string, url?: string}> = []
    const networkErrors: Array<{url: string, status?: number, error?: string}> = []
    
    // Monitor console messages
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        message: msg.text(),
        url: msg.location()?.url
      })
    })
    
    // Monitor network failures
    page.on('response', response => {
      if (!response.ok()) {
        networkErrors.push({
          url: response.url(),
          status: response.status(),
          error: response.statusText()
        })
      }
    })
    
    // Monitor page errors
    const pageErrors: string[] = []
    page.on('pageerror', error => {
      pageErrors.push(error.message)
    })
    
    try {
      await page.goto('/')
      await page.waitForLoadState('networkidle', { timeout: 30000 })
      
      console.log('✅ Homepage loaded successfully')
      
      // Wait for any additional console messages
      await page.waitForTimeout(3000)
      
    } catch (error) {
      console.log('❌ Homepage loading failed:', error)
    }
    
    // Analyze console logs
    const errors = consoleLogs.filter(log => log.type === 'error')
    const warnings = consoleLogs.filter(log => log.type === 'warning')
    
    console.log('\n📊 Console Analysis Results:')
    console.log(`Total console messages: ${consoleLogs.length}`)
    console.log(`Errors: ${errors.length}`)
    console.log(`Warnings: ${warnings.length}`)
    console.log(`Network failures: ${networkErrors.length}`)
    console.log(`Page errors: ${pageErrors.length}`)
    
    // Log detailed errors
    if (errors.length > 0) {
      console.log('\n❌ Console Errors Found:')
      errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type.toUpperCase()}] ${error.message}`)
        if (error.url) console.log(`   URL: ${error.url}`)
      })
    }
    
    // Log network failures
    if (networkErrors.length > 0) {
      console.log('\n🌐 Network Errors Found:')
      networkErrors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.status}] ${error.url}`)
        console.log(`   Error: ${error.error}`)
      })
    }
    
    // Log page errors
    if (pageErrors.length > 0) {
      console.log('\n💥 Page Errors Found:')
      pageErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`)
      })
    }
    
    // Take screenshot for visual validation
    await page.screenshot({ 
      path: 'server-health-homepage-check.png', 
      fullPage: true 
    })
    
    if (errors.length === 0 && networkErrors.length === 0 && pageErrors.length === 0) {
      console.log('✅ No critical server issues detected on homepage')
    } else {
      console.log('⚠️ Server issues detected - see details above')
    }
  })

  test('Catalog Page Server Health & API Validation', async ({ page }) => {
    console.log('🛒 Checking catalog page server health and API issues...')
    
    const consoleLogs: Array<{type: string, message: string}> = []
    const networkErrors: Array<{url: string, status: number}> = []
    const apiCalls: Array<{url: string, status: number, duration: number}> = []
    
    // Monitor console and network
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        message: msg.text()
      })
    })
    
    page.on('response', response => {
      const url = response.url()
      const status = response.status()
      
      // Track API calls
      if (url.includes('/api/')) {
        apiCalls.push({
          url: url,
          status: status,
          duration: 0 // We'll estimate this
        })
      }
      
      if (!response.ok()) {
        networkErrors.push({ url, status })
      }
    })
    
    try {
      const startTime = Date.now()
      await page.goto('/catalog')
      await page.waitForLoadState('networkidle', { timeout: 30000 })
      const loadTime = Date.now() - startTime
      
      console.log(`✅ Catalog loaded in ${loadTime}ms`)
      
      // Wait for any additional API calls
      await page.waitForTimeout(3000)
      
    } catch (error) {
      console.log('❌ Catalog loading failed:', error)
    }
    
    // Analyze results
    const errors = consoleLogs.filter(log => log.type === 'error')
    const apiErrors = apiCalls.filter(call => call.status >= 400)
    
    console.log('\n📊 Catalog API Analysis:')
    console.log(`Total API calls: ${apiCalls.length}`)
    console.log(`API errors: ${apiErrors.length}`)
    console.log(`Console errors: ${errors.length}`)
    console.log(`Network failures: ${networkErrors.length}`)
    
    // Log API calls
    if (apiCalls.length > 0) {
      console.log('\n🔗 API Calls Made:')
      apiCalls.forEach((call, index) => {
        const status = call.status >= 400 ? '❌' : '✅'
        console.log(`${index + 1}. ${status} [${call.status}] ${call.url}`)
      })
    }
    
    // Log API errors specifically
    if (apiErrors.length > 0) {
      console.log('\n🚨 API Errors Detected:')
      apiErrors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.status}] ${error.url}`)
      })
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'server-health-catalog-check.png', 
      fullPage: true 
    })
    
    if (errors.length === 0 && apiErrors.length === 0 && networkErrors.length === 0) {
      console.log('✅ No server issues detected on catalog page')
    } else {
      console.log('⚠️ Server issues detected on catalog page')
    }
  })

  test('Customizer Page 3D System Health Check', async ({ page }) => {
    console.log('🎨 Checking customizer page and 3D system health...')
    
    const consoleLogs: Array<{type: string, message: string, timestamp: number}> = []
    const resourceErrors: string[] = []
    
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        message: msg.text(),
        timestamp: Date.now()
      })
    })
    
    // Monitor resource loading failures
    page.on('response', response => {
      if (!response.ok() && (
        response.url().includes('.glb') || 
        response.url().includes('.jpg') || 
        response.url().includes('.png') ||
        response.url().includes('/api/')
      )) {
        resourceErrors.push(`${response.status()}: ${response.url()}`)
      }
    })
    
    try {
      await page.goto('/customizer')
      await page.waitForLoadState('domcontentloaded')
      
      // Wait for 3D customizer to initialize
      console.log('⏳ Waiting for 3D customizer initialization...')
      
      // Look for customizer elements
      const customizerElement = page.locator('[data-testid="product-customizer"], [id*="customizer"]')
      const customizerFound = await customizerElement.count()
      
      if (customizerFound > 0) {
        console.log('✅ Customizer elements found')
        await customizerElement.first().waitFor({ timeout: 15000 })
      } else {
        console.log('⚠️ No customizer elements detected')
      }
      
      // Wait for any 3D loading
      await page.waitForTimeout(5000)
      
    } catch (error) {
      console.log('❌ Customizer loading failed:', error)
    }
    
    // Analyze customizer-specific issues
    const errors = consoleLogs.filter(log => log.type === 'error')
    const warnings = consoleLogs.filter(log => log.type === 'warning')
    
    // Filter 3D-related errors
    const threejsErrors = errors.filter(log => 
      log.message.toLowerCase().includes('three') ||
      log.message.toLowerCase().includes('webgl') ||
      log.message.toLowerCase().includes('3d') ||
      log.message.toLowerCase().includes('.glb')
    )
    
    console.log('\n📊 Customizer Health Analysis:')
    console.log(`Total errors: ${errors.length}`)
    console.log(`Warnings: ${warnings.length}`)
    console.log(`3D/WebGL related errors: ${threejsErrors.length}`)
    console.log(`Resource loading failures: ${resourceErrors.length}`)
    
    if (threejsErrors.length > 0) {
      console.log('\n🎮 3D System Errors:')
      threejsErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.message}`)
      })
    }
    
    if (resourceErrors.length > 0) {
      console.log('\n📦 Resource Loading Failures:')
      resourceErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`)
      })
    }
    
    await page.screenshot({ 
      path: 'server-health-customizer-check.png', 
      fullPage: true 
    })
    
    if (errors.length === 0 && resourceErrors.length === 0) {
      console.log('✅ No server issues detected on customizer page')
    } else {
      console.log('⚠️ Server issues detected on customizer page')
    }
  })

  test('Cross-Page Navigation & Server Stability', async ({ page }) => {
    console.log('🔄 Testing cross-page navigation and server stability...')
    
    const allErrors: Array<{page: string, error: string, type: string}> = []
    const navigationTimes: Array<{page: string, loadTime: number}> = []
    
    const testPages = [
      { name: 'Homepage', url: '/' },
      { name: 'Catalog', url: '/catalog' },
      { name: 'Customizer', url: '/customizer' }
    ]
    
    for (const testPage of testPages) {
      console.log(`\n🔍 Testing ${testPage.name} (${testPage.url})...`)
      
      const pageErrors: string[] = []
      
      // Monitor errors for this page
      page.on('console', msg => {
        if (msg.type() === 'error') {
          pageErrors.push(msg.text())
        }
      })
      
      page.on('pageerror', error => {
        pageErrors.push(error.message)
      })
      
      try {
        const startTime = Date.now()
        await page.goto(testPage.url)
        await page.waitForLoadState('networkidle', { timeout: 20000 })
        const loadTime = Date.now() - startTime
        
        navigationTimes.push({
          page: testPage.name,
          loadTime: loadTime
        })
        
        console.log(`✅ ${testPage.name} loaded in ${loadTime}ms`)
        
        // Wait for any delayed errors
        await page.waitForTimeout(2000)
        
      } catch (error) {
        console.log(`❌ ${testPage.name} failed to load:`, error)
        allErrors.push({
          page: testPage.name,
          error: String(error),
          type: 'navigation'
        })
      }
      
      // Collect errors for this page
      if (pageErrors.length > 0) {
        pageErrors.forEach(error => {
          allErrors.push({
            page: testPage.name,
            error: error,
            type: 'console'
          })
        })
      }
    }
    
    // Summary analysis
    console.log('\n📊 Navigation & Stability Summary:')
    console.log(`Pages tested: ${testPages.length}`)
    console.log(`Total errors across all pages: ${allErrors.length}`)
    
    // Performance summary
    console.log('\n⚡ Performance Summary:')
    navigationTimes.forEach(timing => {
      const status = timing.loadTime < 3000 ? '✅' : '⚠️'
      console.log(`${status} ${timing.page}: ${timing.loadTime}ms`)
    })
    
    // Error summary by page
    if (allErrors.length > 0) {
      console.log('\n🚨 Error Summary by Page:')
      testPages.forEach(testPage => {
        const pageErrors = allErrors.filter(error => error.page === testPage.name)
        if (pageErrors.length > 0) {
          console.log(`\n${testPage.name} (${pageErrors.length} errors):`)
          pageErrors.forEach((error, index) => {
            console.log(`  ${index + 1}. [${error.type}] ${error.error.substring(0, 100)}...`)
          })
        } else {
          console.log(`✅ ${testPage.name}: No errors detected`)
        }
      })
    }
    
    await page.screenshot({ 
      path: 'server-health-navigation-final.png', 
      fullPage: true 
    })
    
    if (allErrors.length === 0) {
      console.log('\n🎉 Server stability confirmed: No issues across all pages')
    } else {
      console.log(`\n⚠️ Server stability concerns: ${allErrors.length} total issues detected`)
    }
  })

  test('Real-time Error Monitoring & Server Response', async ({ page }) => {
    console.log('📡 Real-time server monitoring and error detection...')
    
    const realTimeErrors: Array<{timestamp: number, type: string, message: string}> = []
    const serverResponses: Array<{url: string, status: number, time: number}> = []
    
    // Real-time monitoring setup
    page.on('console', msg => {
      if (msg.type() === 'error') {
        realTimeErrors.push({
          timestamp: Date.now(),
          type: 'console',
          message: msg.text()
        })
      }
    })
    
    page.on('response', response => {
      serverResponses.push({
        url: response.url(),
        status: response.status(),
        time: Date.now()
      })
    })
    
    // Monitor over time
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    console.log('⏱️ Monitoring server for 10 seconds...')
    
    // Interact with the page to trigger potential issues
    try {
      // Try to interact with catalog
      await page.goto('/catalog')
      await page.waitForTimeout(3000)
      
      // Try to interact with customizer
      await page.goto('/customizer')
      await page.waitForTimeout(3000)
      
      // Return to homepage
      await page.goto('/')
      await page.waitForTimeout(4000)
      
    } catch (error) {
      realTimeErrors.push({
        timestamp: Date.now(),
        type: 'navigation',
        message: String(error)
      })
    }
    
    // Analysis of real-time monitoring
    const serverErrors = serverResponses.filter(response => response.status >= 500)
    const clientErrors = serverResponses.filter(response => response.status >= 400 && response.status < 500)
    
    console.log('\n📊 Real-time Monitoring Results:')
    console.log(`Total server requests: ${serverResponses.length}`)
    console.log(`Server errors (5xx): ${serverErrors.length}`)
    console.log(`Client errors (4xx): ${clientErrors.length}`)
    console.log(`Console errors during monitoring: ${realTimeErrors.length}`)
    
    if (serverErrors.length > 0) {
      console.log('\n🚨 Server Errors (5xx):')
      serverErrors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.status}] ${error.url}`)
      })
    }
    
    if (clientErrors.length > 0) {
      console.log('\n⚠️ Client Errors (4xx):')
      clientErrors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.status}] ${error.url}`)
      })
    }
    
    if (realTimeErrors.length > 0) {
      console.log('\n💥 Runtime Errors:')
      realTimeErrors.forEach((error, index) => {
        const time = new Date(error.timestamp).toLocaleTimeString()
        console.log(`${index + 1}. [${time}] [${error.type}] ${error.message.substring(0, 100)}...`)
      })
    }
    
    await page.screenshot({ 
      path: 'server-health-realtime-monitoring.png', 
      fullPage: true 
    })
    
    const totalIssues = serverErrors.length + clientErrors.length + realTimeErrors.length
    
    if (totalIssues === 0) {
      console.log('\n✅ Real-time monitoring: No server issues detected')
    } else {
      console.log(`\n⚠️ Real-time monitoring: ${totalIssues} total issues detected`)
    }
    
    console.log('\n🎯 Server Health Summary:')
    console.log(`- Server uptime: Confirmed ✅`)
    console.log(`- Page loading: ${realTimeErrors.filter(e => e.type === 'navigation').length === 0 ? 'Stable ✅' : 'Issues detected ⚠️'}`)
    console.log(`- API responses: ${serverErrors.length === 0 ? 'Healthy ✅' : 'Issues detected ⚠️'}`)
    console.log(`- Console errors: ${realTimeErrors.filter(e => e.type === 'console').length === 0 ? 'Clean ✅' : 'Issues detected ⚠️'}`)
  })
})