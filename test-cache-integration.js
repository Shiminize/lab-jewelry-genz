/**
 * Test to verify AssetCacheService integration
 */

const puppeteer = require('puppeteer')

async function testCacheIntegration() {
  console.log('🔍 Testing cache integration...')
  
  const browser = await puppeteer.launch({ headless: false, slowMo: 100 })
  const page = await browser.newPage()
  
  // Listen to console logs
  page.on('console', msg => {
    console.log(`🖥️ BROWSER: ${msg.text()}`)
  })
  
  // Listen to errors
  page.on('pageerror', err => {
    console.log(`❌ PAGE ERROR: ${err.message}`)
  })
  
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' })
    console.log('✅ Homepage loaded')
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Check if cache service is available
    const cacheStatus = await page.evaluate(() => {
      // Check if our cache service was imported and initialized
      return {
        hasAssetCacheInWindow: typeof window.assetCache !== 'undefined',
        hasConsoleHits: performance.getEntriesByType('measure').filter(m => m.name.includes('cache')).length > 0,
        prefetchLogs: performance.getEntriesByType('navigation').length,
        // Try to access the service through React DevTools or global
        reactDevTools: typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined'
      }
    })
    
    console.log('📊 Cache status:', cacheStatus)
    
    // Look for cache-related logs
    await page.evaluate(() => {
      console.log('[TEST] Checking for prefetch completion...')
      
      // Check if ProductCustomizer is rendering
      const customizer = document.querySelector('#customizer-3d-container')
      if (customizer) {
        console.log('[TEST] 3D container found:', customizer.innerHTML.length, 'characters')
      } else {
        console.log('[TEST] 3D container NOT found')
      }
      
      // Look for material buttons
      const buttons = document.querySelectorAll('button')
      const materialButtons = Array.from(buttons).filter(btn => 
        btn.textContent && (
          btn.textContent.toLowerCase().includes('gold') ||
          btn.textContent.toLowerCase().includes('platinum')
        )
      )
      console.log('[TEST] Found material buttons:', materialButtons.length)
      materialButtons.forEach(btn => {
        console.log('[TEST] Material button:', btn.textContent?.substring(0, 30))
      })
    })
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
  
  await browser.close()
}

testCacheIntegration().catch(console.error)