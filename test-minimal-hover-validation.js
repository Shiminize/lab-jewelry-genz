/**
 * Minimal Hover State Validation Test
 * Tests the new MinimalHoverCard component matches target design
 */

const { chromium } = require('playwright')

async function testMinimalHover() {
  console.log('🎨 Minimal Hover State Validation Test')
  console.log('='.repeat(50))
  
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  
  try {
    // Navigate to customizer page
    console.log('📍 Navigating to customizer...')
    await page.goto('http://localhost:3000/customizer', { waitUntil: 'domcontentloaded', timeout: 15000 })
    
    // Wait for components to load
    await page.waitForTimeout(3000)
    
    // Take initial screenshot
    await page.screenshot({ path: 'minimal-hover-initial.png', fullPage: false })
    console.log('📸 Initial screenshot: minimal-hover-initial.png')
    
    // Look for MinimalHoverCard components
    console.log('🔍 Looking for MinimalHoverCard components...')
    
    // Find material buttons (they should now be MinimalHoverCards)
    const materialCards = await page.locator('[class*="min-w-\\[140px\\]"]').count()
    console.log(`✅ Found ${materialCards} MinimalHoverCard components`)
    
    if (materialCards > 0) {
      const firstCard = page.locator('[class*="min-w-\\[140px\\]"]').first()
      
      // Test 1: Check base styling matches target design
      console.log('🎯 Test 1: Base styling validation...')
      const baseStyles = await firstCard.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          borderRadius: computed.borderRadius,
          transition: computed.transition,
          background: computed.background,
          backdropFilter: computed.backdropFilter
        }
      })
      
      console.log(`  Border radius: ${baseStyles.borderRadius}`)
      console.log(`  Transition: ${baseStyles.transition}`)
      console.log(`  Backdrop filter: ${baseStyles.backdropFilter}`)
      
      // Test 2: Hover effect with +15% luminosity
      console.log('🌟 Test 2: Hover luminosity enhancement...')
      
      // Trigger hover
      await firstCard.hover()
      await page.waitForTimeout(500) // Wait for transition
      
      // Check if brightness filter is applied
      const hoverStyles = await firstCard.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          filter: computed.filter,
          boxShadow: computed.boxShadow,
          background: computed.background
        }
      })
      
      console.log(`  Hover filter: ${hoverStyles.filter}`)
      const hasBrightnessFilter = hoverStyles.filter.includes('brightness') && hoverStyles.filter.includes('1.15')
      console.log(`  ✅ +15% brightness applied: ${hasBrightnessFilter ? 'YES' : 'NO'}`)
      
      // Test 3: Soft glow effect
      console.log('💫 Test 3: Soft glow shadow validation...')
      const hasGlowShadow = hoverStyles.boxShadow && hoverStyles.boxShadow.includes('60px') && hoverStyles.boxShadow.includes('20px')
      console.log(`  ✅ Soft glow shadow applied: ${hasGlowShadow ? 'YES' : 'NO'}`)
      
      // Test 4: Click interaction performance
      console.log('⚡ Test 4: Click performance test...')
      const startTime = Date.now()
      await firstCard.click()
      const clickTime = Date.now() - startTime
      
      console.log(`  Click response time: ${clickTime}ms`)
      const isPerformant = clickTime < 100
      console.log(`  ✅ CLAUDE_RULES performance (<100ms): ${isPerformant ? 'PASS' : 'FAIL'}`)
      
      // Test 5: Selection state validation
      console.log('🎯 Test 5: Selection state visualization...')
      await page.waitForTimeout(300)
      
      const selectionState = await firstCard.evaluate(el => {
        const computed = window.getComputedStyle(el)
        const hasCheckmark = el.querySelector('[class*="absolute"][class*="top-2"]')
        return {
          hasCheckmark: !!hasCheckmark,
          outline: computed.outline,
          ring: computed.boxShadow.includes('purple') || el.className.includes('ring')
        }
      })
      
      console.log(`  ✅ Selection checkmark: ${selectionState.hasCheckmark ? 'VISIBLE' : 'NOT VISIBLE'}`)
      console.log(`  ✅ Selection ring/outline: ${selectionState.ring ? 'APPLIED' : 'NOT APPLIED'}`)
      
      // Take final screenshot with selection
      await page.screenshot({ path: 'minimal-hover-selected.png', fullPage: false })
      console.log('📸 Final screenshot: minimal-hover-selected.png')
      
      // Summary Results
      console.log('\n' + '='.repeat(50))
      console.log('📊 VALIDATION RESULTS')
      console.log('='.repeat(50))
      
      const results = {
        componentsFound: materialCards > 0,
        brightnessEffect: hasBrightnessFilter,
        glowShadow: hasGlowShadow,
        performance: isPerformant,
        selectionState: selectionState.hasCheckmark || selectionState.ring
      }
      
      Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASS' : 'FAIL'}`)
      })
      
      const passCount = Object.values(results).filter(Boolean).length
      const totalTests = Object.keys(results).length
      
      console.log(`\n🎯 Overall Score: ${passCount}/${totalTests} tests passed`)
      
      if (passCount >= 4) {
        console.log('🎉 MinimalHoverCard successfully matches target design!')
      } else {
        console.log('⚠️ Some aspects may need adjustment')
      }
      
    } else {
      console.log('❌ No MinimalHoverCard components found')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    await page.screenshot({ path: 'minimal-hover-error.png', fullPage: true })
    console.log('📸 Error screenshot saved: minimal-hover-error.png')
  } finally {
    await browser.close()
  }
}

// Run the validation test
testMinimalHover().catch(console.error)