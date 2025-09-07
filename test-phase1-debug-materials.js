/**
 * Phase 1 Debug Test - Material Loading Diagnosis
 * Deep diagnosis of MaterialControls loading failure
 */

const { chromium } = require('playwright')

async function debugMaterialsLoading() {
  console.log('🔍 PHASE 1 DEBUG: MaterialControls Loading Diagnosis')
  const browser = await chromium.launch({ headless: false, slowMo: 1000 })
  const page = await browser.newPage()
  
  // Capture all console messages
  const consoleMessages = []
  const errors = []
  const warnings = []
  
  page.on('console', msg => {
    const text = msg.text()
    consoleMessages.push(text)
    
    if (msg.type() === 'error') {
      errors.push(text)
      console.log('❌ Console Error:', text)
    } else if (msg.type() === 'warning') {
      warnings.push(text)
      console.log('⚠️ Console Warning:', text)
    } else {
      console.log('ℹ️ Console:', text)
    }
  })
  
  // Capture network failures
  page.on('requestfailed', request => {
    console.log('🚫 Request Failed:', request.url(), request.failure()?.errorText)
  })
  
  try {
    console.log('📍 Step 1: Navigate to customizer page')
    await page.goto('http://localhost:3000/customizer', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    })
    
    console.log('📍 Step 2: Wait for initial page load')
    await page.waitForTimeout(5000)
    
    // Take initial screenshot
    await page.screenshot({ path: 'debug-step1-initial.png', fullPage: true })
    console.log('📸 Initial screenshot saved: debug-step1-initial.png')
    
    console.log('📍 Step 3: Check if ProductCustomizer is mounted')
    const customizerContainer = await page.locator('[data-testid="product-customizer"]').count()
    console.log('ProductCustomizer containers found:', customizerContainer)
    
    console.log('📍 Step 4: Check for loading states')
    const loadingStates = await page.locator('text="Building your masterpiece"').count()
    console.log('Loading states found:', loadingStates)
    
    if (loadingStates > 0) {
      console.log('⏳ Found loading state - waiting for it to resolve...')
      await page.waitForTimeout(10000)
      
      const stillLoading = await page.locator('text="Building your masterpiece"').count()
      if (stillLoading > 0) {
        console.log('❌ CRITICAL: Loading state never resolves')
        
        // Check what the customization hook is doing
        const hookState = await page.evaluate(() => {
          // Try to access the hook state from window if available
          return {
            hasCustomizationService: typeof window.customizationService !== 'undefined',
            hasReact: typeof window.React !== 'undefined'
          }
        })
        console.log('Hook state check:', hookState)
      }
    }
    
    console.log('📍 Step 5: Look for MaterialControls with different strategies')
    
    // Strategy 1: Check for any material-related elements
    const materialElements = await page.locator('*').evaluateAll(elements => {
      return elements.filter(el => {
        const text = el.textContent?.toLowerCase() || ''
        const classes = el.className?.toLowerCase() || ''
        return text.includes('gold') || text.includes('platinum') || 
               classes.includes('material') || text.includes('material')
      }).map(el => ({
        tagName: el.tagName,
        textContent: el.textContent?.substring(0, 100),
        className: el.className,
        id: el.id
      }))
    })
    console.log('Material-related elements:', materialElements.length)
    materialElements.forEach(el => console.log('  -', el))
    
    // Strategy 2: Check for dynamic import loading
    const dynamicImports = await page.evaluate(() => {
      // Check if there are any pending dynamic imports
      return {
        hasMaterialControls: document.querySelectorAll('*').length,
        bodyContent: document.body.innerHTML.includes('MaterialControls'),
        scriptTags: document.querySelectorAll('script').length
      }
    })
    console.log('Dynamic import check:', dynamicImports)
    
    // Strategy 3: Check customization service directly
    const serviceCheck = await page.evaluate(() => {
      try {
        // Try to manually call the service
        const materials = [
          { id: 'platinum', displayName: 'Platinum', priceModifier: 0 },
          { id: '18k-rose-gold', displayName: '18K Rose Gold', priceModifier: -250 },
          { id: '18k-white-gold', displayName: '18K White Gold', priceModifier: -200 },
          { id: '18k-yellow-gold', displayName: '18K Yellow Gold', priceModifier: -300 }
        ]
        
        return {
          materialsAvailable: materials.length,
          sampleMaterial: materials[0]
        }
      } catch (e) {
        return { error: e.message }
      }
    })
    console.log('Service check:', serviceCheck)
    
    // Take final screenshot
    await page.screenshot({ path: 'debug-step5-final.png', fullPage: true })
    console.log('📸 Final screenshot saved: debug-step5-final.png')
    
    // Summary
    console.log('\n📋 DIAGNOSIS SUMMARY:')
    console.log(`- Console Errors: ${errors.length}`)
    console.log(`- Console Warnings: ${warnings.length}`)
    console.log(`- Material Elements Found: ${materialElements.length}`)
    console.log(`- Still in Loading State: ${loadingStates > 0}`)
    
    if (errors.length === 0 && materialElements.length === 0) {
      console.log('🔧 LIKELY CAUSE: React component mounting issue or hook failure')
    }
    
  } catch (error) {
    console.log('💥 Test Error:', error.message)
  } finally {
    await browser.close()
  }
}

debugMaterialsLoading()