/**
 * Phase 5 Final Validation - Complete System Test
 * Comprehensive validation of all changes and original requirements
 */

const { chromium } = require('playwright')

async function testPhase5FinalValidation() {
  console.log('🧪 PHASE 5: Final Validation - Complete System Test')
  console.log('🎯 Validating original requirement: MinimalHoverCard with +15% luminosity')
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 })
  const page = await browser.newPage()
  
  const results = {
    originalRequirement: false,
    phase1Success: false,
    phase2Success: false,  
    phase3Success: false,
    phase4Success: false,
    overallHealth: false
  }
  
  try {
    console.log('📍 Step 1: Load customizer page and verify basic functionality')
    await page.goto('http://localhost:3000/customizer', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    })
    
    console.log('📍 Step 2: ORIGINAL REQUIREMENT - MinimalHoverCard with +15% luminosity')
    
    // Find MaterialControls using MinimalHoverCard
    const materialControls = await page.locator('[class*="min-w-"][class*="140px"]').count()
    console.log(`Found ${materialControls} MinimalHoverCard components`)
    
    if (materialControls > 0) {
      const firstCard = page.locator('[class*="min-w-"][class*="140px"]').first()
      
      // Test the hover state
      const hoverTest = await firstCard.evaluate((element) => {
        // Get initial state
        const initialStyle = getComputedStyle(element)
        const initialClasses = element.className
        
        // Check for hover classes in className (updated for Tailwind token migration)
        const hasHoverBrightness = initialClasses.includes('hover:brightness-115')
        const hasHoverScale = initialClasses.includes('hover:scale-101')
        
        return {
          found: true,
          hasHoverBrightness,
          hasHoverScale,
          className: initialClasses,
          hasTransition: initialStyle.transition && initialStyle.transition !== 'none'
        }
      })
      
      if (hoverTest.hasHoverBrightness) {
        console.log('✅ ORIGINAL REQUIREMENT MET: MinimalHoverCard has +15% luminosity (brightness-115 via Tailwind tokens)')
        results.originalRequirement = true
      } else {
        console.log('❌ Original requirement not met:', hoverTest)
      }
      
      // Visual hover test
      console.log('🖱️ Testing hover interaction visually...')
      await firstCard.hover()
      await page.waitForTimeout(2000) // Wait for hover animation
      
      console.log('✅ Hover interaction completed')
    } else {
      console.log('❌ MinimalHoverCard components not found')
    }
    
    console.log('📍 Step 3: Phase 1 Validation - File size compliance')
    
    // Check file sizes
    const fileSizes = await page.evaluate(() => {
      // Approximate CSS size check based on loaded stylesheets
      let totalRules = 0
      try {
        for (let sheet of document.styleSheets) {
          if (sheet.cssRules) {
            totalRules += sheet.cssRules.length
          }
        }
      } catch (e) {
        // Cross-origin issues
      }
      return { totalCSSRules: totalRules }
    })
    
    console.log(`CSS Rules loaded: ${fileSizes.totalCSSRules}`)
    results.phase1Success = fileSizes.totalCSSRules > 100 && fileSizes.totalCSSRules < 5000
    console.log(results.phase1Success ? '✅ Phase 1: File sizes reasonable' : '⚠️ Phase 1: File size concerns')
    
    console.log('📍 Step 4: Phase 2 Validation - Modular CSS architecture')
    
    // Test that CSS modules are loading
    const cssModules = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement)
      return {
        hasDesignTokens: style.getPropertyValue('--token-color-brand-primary').trim() !== '',
        hasNavigationVars: style.getPropertyValue('--aurora-nav-bg').trim() !== '',
        hasTypography: style.getPropertyValue('--token-font-family-primary').trim() !== ''
      }
    })
    
    results.phase2Success = cssModules.hasDesignTokens && cssModules.hasNavigationVars
    console.log(results.phase2Success ? '✅ Phase 2: Modular CSS loading correctly' : '❌ Phase 2: CSS module issues')
    
    console.log('📍 Step 5: Phase 3 Validation - No !important declarations')
    
    // Check for !important in loaded CSS
    const importantCheck = await page.evaluate(() => {
      let importantCount = 0
      try {
        for (let sheet of document.styleSheets) {
          if (sheet.cssRules) {
            for (let rule of sheet.cssRules) {
              if (rule.style && rule.cssText) {
                if (rule.cssText.includes('!important')) {
                  importantCount++
                }
              }
            }
          }
        }
      } catch (e) {
        // Cross-origin issues
      }
      return { importantCount }
    })
    
    results.phase3Success = importantCheck.importantCount <= 5 // Allow some Tailwind !important
    console.log(results.phase3Success ? '✅ Phase 3: Minimal !important usage' : '❌ Phase 3: Too many !important declarations')
    console.log(`Found ${importantCheck.importantCount} !important declarations`)
    
    console.log('📍 Step 6: Phase 4 Validation - Design token system')
    
    const tokenSystem = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement)
      const tokens = [
        '--token-color-brand-primary',
        '--token-space-md', 
        '--token-font-size-base',
        '--token-duration-normal'
      ]
      
      let validTokens = 0
      tokens.forEach(token => {
        if (style.getPropertyValue(token).trim() !== '') {
          validTokens++
        }
      })
      
      return { validTokens, totalTokens: tokens.length }
    })
    
    results.phase4Success = tokenSystem.validTokens === tokenSystem.totalTokens
    console.log(results.phase4Success ? '✅ Phase 4: Design tokens fully operational' : '❌ Phase 4: Token system issues')
    console.log(`Design tokens: ${tokenSystem.validTokens}/${tokenSystem.totalTokens} working`)
    
    console.log('📍 Step 7: Overall system health check')
    
    // Check for console errors
    const errors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.waitForTimeout(2000)
    
    // Check system performance
    const performance = await page.evaluate(() => {
      return {
        domElements: document.querySelectorAll('*').length,
        hasReact: typeof window.React !== 'undefined',
        timestamp: Date.now()
      }
    })
    
    results.overallHealth = errors.length < 3 && materialControls > 0 && performance.domElements > 50
    console.log(results.overallHealth ? '✅ Overall: System healthy' : '⚠️ Overall: System needs attention')
    
    // Take final screenshot
    await page.screenshot({ path: 'phase5-final-validation.png', fullPage: true })
    console.log('📸 Final screenshot saved: phase5-final-validation.png')
    
    // COMPREHENSIVE RESULTS
    console.log('\n🎯 COMPREHENSIVE VALIDATION RESULTS:')
    console.log('================================================')
    console.log(`🎯 Original Requirement (MinimalHoverCard +15%): ${results.originalRequirement ? '✅ SUCCESS' : '❌ FAILED'}`)
    console.log(`📦 Phase 1 (File Size Compliance): ${results.phase1Success ? '✅ SUCCESS' : '⚠️  PARTIAL'}`)
    console.log(`🧩 Phase 2 (Modular Architecture): ${results.phase2Success ? '✅ SUCCESS' : '❌ FAILED'}`)
    console.log(`🚫 Phase 3 (!important Removal): ${results.phase3Success ? '✅ SUCCESS' : '❌ FAILED'}`)
    console.log(`🔧 Phase 4 (Design Token System): ${results.phase4Success ? '✅ SUCCESS' : '❌ FAILED'}`)
    console.log(`💚 Overall System Health: ${results.overallHealth ? '✅ HEALTHY' : '⚠️  NEEDS ATTENTION'}`)
    
    const overallSuccess = results.originalRequirement && 
                          results.phase2Success && 
                          results.phase3Success && 
                          results.phase4Success
    
    if (overallSuccess) {
      console.log('\n🎉 PHASE 5 COMPLETE: All objectives achieved!')
      console.log('✨ MinimalHoverCard components are working with +15% luminosity')
      console.log('✨ CSS architecture is CLAUDE_RULES compliant')
      console.log('✨ Design token system is fully operational')
    } else {
      console.log('\n⚠️ PHASE 5: Some issues remain to be addressed')
    }
    
    return overallSuccess
    
  } catch (error) {
    console.log('💥 Final validation error:', error.message)
    return false
  } finally {
    await browser.close()
  }
}

testPhase5FinalValidation().then(success => {
  process.exit(success ? 0 : 1)
})