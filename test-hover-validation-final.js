/**
 * Final Hover State Validation
 * Quick test to validate hover effects match target design
 */

const { chromium } = require('playwright')

async function validateHoverState() {
  console.log('🎯 FINAL HOVER STATE VALIDATION')
  console.log('='.repeat(40))
  
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  
  try {
    await page.goto('http://localhost:3000/customizer', { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)
    
    const materialCards = page.locator('[class*="min-w-\\[140px\\]"]')
    const cardCount = await materialCards.count()
    console.log(`Found ${cardCount} MinimalHoverCard components`)
    
    if (cardCount > 0) {
      const firstCard = materialCards.first()
      
      // Test hover effects
      await firstCard.hover()
      await page.waitForTimeout(350)
      
      const hoverState = await firstCard.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          brightness: computed.filter.includes('brightness(1.15)'),
          glowShadow: computed.boxShadow.includes('60px'),
          transition: computed.transition.includes('0.3s'),
          backdrop: computed.backdropFilter.includes('blur'),
          hasScale: computed.transform !== 'none'
        }
      })
      
      // Test click interaction
      const startTime = Date.now()
      await firstCard.click()
      const clickTime = Date.now() - startTime
      
      await page.waitForTimeout(200)
      
      const selectionState = await firstCard.evaluate(el => {
        const hasCheckmark = el.querySelector('[class*="absolute"][class*="top-2"]') !== null
        const hasRing = el.className.includes('ring-1')
        return { hasCheckmark, hasRing }
      })
      
      // Results
      console.log('\n✅ Hover Effects Validation:')
      console.log(`  +15% Brightness: ${hoverState.brightness ? '✅' : '❌'}`)
      console.log(`  Soft Glow (60px): ${hoverState.glowShadow ? '✅' : '❌'}`)
      console.log(`  0.3s Transition: ${hoverState.transition ? '✅' : '❌'}`)
      console.log(`  Backdrop Blur: ${hoverState.backdrop ? '✅' : '❌'}`)
      console.log(`  Scale Transform: ${hoverState.hasScale ? '✅' : '❌'}`)
      
      console.log('\n✅ Interaction Validation:')
      console.log(`  Click Performance: ${clickTime}ms ${clickTime < 100 ? '✅' : '⚠️'}`)
      console.log(`  Selection Checkmark: ${selectionState.hasCheckmark ? '✅' : '⚠️'}`)
      console.log(`  Selection Ring: ${selectionState.hasRing ? '✅' : '⚠️'}`)
      
      const totalTests = 8
      const passedTests = Object.values(hoverState).filter(Boolean).length + 
                          (clickTime < 100 ? 1 : 0) + 
                          (selectionState.hasCheckmark || selectionState.hasRing ? 1 : 0)
      
      const score = Math.round((passedTests / totalTests) * 100)
      
      console.log(`\n🎯 Overall Validation Score: ${score}% (${passedTests}/${totalTests})`)
      
      if (score >= 90) {
        console.log('🎉 EXCELLENT: Hover effects match target design perfectly!')
      } else if (score >= 75) {
        console.log('✅ GOOD: Hover effects work well with minor differences')
      } else {
        console.log('⚠️ NEEDS ATTENTION: Some hover effects may need adjustment')
      }
      
      // Test material-specific colors
      console.log('\n💎 Material-Specific Glow Test:')
      const materials = await page.locator('[class*="min-w-\\[140px\\]"]').count()
      for (let i = 0; i < Math.min(materials, 3); i++) {
        const card = page.locator('[class*="min-w-\\[140px\\]"]').nth(i)
        const text = await card.textContent()
        const material = text.split('$')[0].trim()
        
        await card.hover()
        await page.waitForTimeout(100)
        
        const shadowColor = await card.evaluate(el => el.style.boxShadow)
        const hasColoredGlow = shadowColor && shadowColor.includes('rgba')
        
        console.log(`  ${material}: ${hasColoredGlow ? '✅ Colored glow' : '⚠️ Default glow'}`)
        
        await page.mouse.move(0, 0)
        await page.waitForTimeout(50)
      }
      
    } else {
      console.log('❌ No MinimalHoverCard components found')
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message)
  } finally {
    await browser.close()
  }
}

validateHoverState().catch(console.error)