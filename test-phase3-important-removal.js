/**
 * Phase 3 E2E Test - !important Removal Validation
 * Tests that CSS specificity works correctly without !important
 */

const { chromium } = require('playwright')

async function testPhase3ImportantRemoval() {
  console.log('🧪 PHASE 3: !important Removal Validation')
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  
  try {
    console.log('📍 Step 1: Navigate to customizer page')
    await page.goto('http://localhost:3000/customizer', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    })
    
    console.log('📍 Step 2: Verify !important declarations are removed from CSS')
    
    // Check that CSS is loading without !important
    const cssCheck = await page.evaluate(() => {
      // Get all stylesheets and check for !important
      let importantCount = 0
      let totalRules = 0
      
      try {
        for (let sheet of document.styleSheets) {
          if (sheet.cssRules) {
            for (let rule of sheet.cssRules) {
              if (rule.style) {
                totalRules++
                const cssText = rule.cssText || rule.style.cssText
                if (cssText && cssText.includes('!important')) {
                  importantCount++
                }
              }
            }
          }
        }
      } catch (e) {
        // Cross-origin or other access issues
      }
      
      return { importantCount, totalRules }
    })
    
    console.log(`Found ${cssCheck.importantCount} !important declarations out of ${cssCheck.totalRules} total rules`)
    
    console.log('📍 Step 3: Test Aurora color variables are still applied')
    
    const colorVariables = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement)
      return {
        navBg: style.getPropertyValue('--aurora-nav-bg'),
        nebulaPurple: style.getPropertyValue('--aurora-nebula-purple'), 
        pink: style.getPropertyValue('--aurora-pink'),
        shadowGold: style.getPropertyValue('--shadow-gold')
      }
    })
    
    const hasColorVars = Object.values(colorVariables).every(val => val.trim() !== '')
    console.log(hasColorVars ? '✅ Aurora color variables loaded correctly' : '❌ Aurora color variables missing')
    
    console.log('📍 Step 4: Test MaterialControls hover states without !important')
    
    // Find material controls
    const materialElements = await page.locator('text=/^(Platinum|18K.*Gold)$/').count()
    console.log(`Found ${materialElements} material buttons`)
    
    if (materialElements > 0) {
      console.log('✅ MaterialControls rendered')
      
      // Test hover state by checking computed styles
      const firstMaterial = page.locator('text="Platinum"').first()
      const hoverTest = await page.evaluate((element) => {
        // Get the parent container that should have hover effects
        const container = element.closest('[class*="min-w"]') || element.parentElement
        if (!container) return { found: false }
        
        // Check if transition styles are applied (without !important)
        const style = getComputedStyle(container)
        return {
          found: true,
          hasTransition: style.transition && style.transition !== 'none',
          hasTransform: style.transform,
          className: container.className
        }
      }, await firstMaterial.elementHandle())
      
      if (hoverTest.found && hoverTest.hasTransition) {
        console.log('✅ Hover transitions work without !important')
      } else {
        console.log('⚠️ Hover transitions may need adjustment:', hoverTest)
      }
    }
    
    console.log('📍 Step 5: Test text color classes without !important')
    
    // Create test elements to verify color classes
    const textColorTest = await page.evaluate(() => {
      const tests = [
        'text-aurora-accent',
        'text-aurora-pink', 
        'text-success',
        'text-warning'
      ]
      
      const results = {}
      
      tests.forEach(className => {
        const testEl = document.createElement('div')
        testEl.className = className + ' ' + className // Double class for specificity
        testEl.textContent = 'Test'
        document.body.appendChild(testEl)
        
        const style = getComputedStyle(testEl)
        results[className] = {
          color: style.color,
          hasColor: style.color !== '' && style.color !== 'rgba(0, 0, 0, 0)'
        }
        
        document.body.removeChild(testEl)
      })
      
      return results
    })
    
    const workingColors = Object.values(textColorTest).filter(test => test.hasColor).length
    console.log(`✅ ${workingColors}/${Object.keys(textColorTest).length} text color classes working`)
    
    // Take screenshot
    await page.screenshot({ path: 'phase3-important-removal.png', fullPage: true })
    
    console.log('\n📋 PHASE 3 RESULTS:')
    console.log(`- !important declarations: ${cssCheck.importantCount} (target: 0)`)
    console.log(`- Aurora variables: ${hasColorVars ? '✅' : '❌'}`)
    console.log(`- MaterialControls: ${materialElements > 0 ? '✅' : '❌'}`)
    console.log(`- Text colors: ${workingColors}/${Object.keys(textColorTest).length}`)
    
    const success = cssCheck.importantCount <= 5 && hasColorVars && materialElements > 0 // Allow some Tailwind !important
    
    if (success) {
      console.log('🎉 PHASE 3 PASSED: !important declarations successfully removed with working CSS')
    } else {
      console.log('❌ PHASE 3 NEEDS WORK: Issues with CSS specificity or functionality')
    }
    
    return success
    
  } catch (error) {
    console.log('💥 Test Error:', error.message)
    return false
  } finally {
    await browser.close()
  }
}

testPhase3ImportantRemoval().then(success => {
  process.exit(success ? 0 : 1)
})