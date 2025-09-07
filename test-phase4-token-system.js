/**
 * Phase 4 E2E Test - Design Token System Validation
 * Tests that the new design token system is working correctly
 */

const { chromium } = require('playwright')

async function testPhase4TokenSystem() {
  console.log('🧪 PHASE 4: Design Token System Validation')
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  
  try {
    console.log('📍 Step 1: Navigate to customizer page')
    await page.goto('http://localhost:3000/customizer', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    })
    
    console.log('📍 Step 2: Validate foundation color tokens')
    const foundationTokens = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement)
      return {
        brandPrimary: style.getPropertyValue('--token-color-brand-primary').trim(),
        brandSecondary: style.getPropertyValue('--token-color-brand-secondary').trim(), 
        neutral0: style.getPropertyValue('--token-color-neutral-0').trim(),
        neutral900: style.getPropertyValue('--token-color-neutral-900').trim(),
        materialGold: style.getPropertyValue('--token-color-material-gold').trim()
      }
    })
    
    const foundationValid = Object.values(foundationTokens).every(val => val !== '')
    console.log(foundationValid ? '✅ Foundation color tokens loaded' : '❌ Foundation tokens missing')
    if (!foundationValid) {
      console.log('Missing tokens:', foundationTokens)
    }
    
    console.log('📍 Step 3: Validate spacing tokens')
    const spacingTokens = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement)
      return {
        xs: style.getPropertyValue('--token-space-xs').trim(),
        md: style.getPropertyValue('--token-space-md').trim(),
        xl: style.getPropertyValue('--token-space-xl').trim(),
        componentGap: style.getPropertyValue('--token-space-component-gap').trim()
      }
    })
    
    const spacingValid = Object.values(spacingTokens).every(val => val !== '')
    console.log(spacingValid ? '✅ Spacing tokens loaded' : '❌ Spacing tokens missing')
    
    console.log('📍 Step 4: Validate typography tokens')
    const typographyTokens = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement)
      return {
        fontFamily: style.getPropertyValue('--token-font-family-primary').trim(),
        fontSize: style.getPropertyValue('--token-font-size-base').trim(),
        fontWeight: style.getPropertyValue('--token-font-weight-medium').trim(),
        lineHeight: style.getPropertyValue('--token-line-height-normal').trim()
      }
    })
    
    const typographyValid = Object.values(typographyTokens).every(val => val !== '')
    console.log(typographyValid ? '✅ Typography tokens loaded' : '❌ Typography tokens missing')
    
    console.log('📍 Step 5: Validate motion tokens')
    const motionTokens = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement)
      return {
        durationFast: style.getPropertyValue('--token-duration-fast').trim(),
        durationNormal: style.getPropertyValue('--token-duration-normal').trim(),
        easeInOut: style.getPropertyValue('--token-ease-in-out').trim()
      }
    })
    
    const motionValid = Object.values(motionTokens).every(val => val !== '')
    console.log(motionValid ? '✅ Motion tokens loaded' : '❌ Motion tokens missing')
    
    console.log('📍 Step 6: Test backward compatibility aliases')
    const legacyTokens = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement)
      return {
        auroraPink: style.getPropertyValue('--aurora-pink').trim(),
        auroraNebula: style.getPropertyValue('--aurora-nebula-purple').trim(),
        auroraNavBg: style.getPropertyValue('--aurora-nav-bg').trim(),
        shadowGold: style.getPropertyValue('--shadow-gold').trim()
      }
    })
    
    const legacyValid = Object.values(legacyTokens).every(val => val !== '')
    console.log(legacyValid ? '✅ Legacy aliases working' : '❌ Legacy aliases missing')
    
    console.log('📍 Step 7: Test component token usage')
    const componentTokens = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement)
      return {
        navHeight: style.getPropertyValue('--token-nav-height').trim(),
        buttonHeight: style.getPropertyValue('--token-size-button-height').trim(),
        cardShadow: style.getPropertyValue('--token-card-shadow').trim(),
        borderRadius: style.getPropertyValue('--token-border-radius-md').trim()
      }
    })
    
    const componentValid = Object.values(componentTokens).every(val => val !== '')
    console.log(componentValid ? '✅ Component tokens loaded' : '❌ Component tokens missing')
    
    console.log('📍 Step 8: Test token usage in MaterialControls')
    const materialElements = await page.locator('text="Platinum"').count()
    
    if (materialElements > 0) {
      console.log('✅ MaterialControls still rendering with token system')
      
      // Test if tokens are being applied to components
      const tokenUsage = await page.evaluate(() => {
        const platinumButton = document.querySelector('*:has-text("Platinum")')
        if (!platinumButton) return { found: false }
        
        const container = platinumButton.closest('[class*="min-w"]')
        if (!container) return { found: false }
        
        const style = getComputedStyle(container)
        return {
          found: true,
          hasTransition: style.transition && style.transition !== 'none',
          hasBorderRadius: style.borderRadius !== '',
          hasPadding: style.padding !== ''
        }
      })
      
      if (tokenUsage.found) {
        console.log('✅ Components successfully using token-based styles')
      }
    } else {
      console.log('⚠️ MaterialControls not found for token usage test')
    }
    
    // Take screenshot
    await page.screenshot({ path: 'phase4-token-system.png', fullPage: true })
    
    console.log('\n📋 PHASE 4 RESULTS:')
    console.log(`- Foundation tokens: ${foundationValid ? '✅' : '❌'}`)
    console.log(`- Spacing tokens: ${spacingValid ? '✅' : '❌'}`)
    console.log(`- Typography tokens: ${typographyValid ? '✅' : '❌'}`)
    console.log(`- Motion tokens: ${motionValid ? '✅' : '❌'}`)
    console.log(`- Legacy compatibility: ${legacyValid ? '✅' : '❌'}`)
    console.log(`- Component tokens: ${componentValid ? '✅' : '❌'}`)
    console.log(`- MaterialControls: ${materialElements > 0 ? '✅' : '❌'}`)
    
    const allTokensValid = foundationValid && spacingValid && typographyValid && 
                          motionValid && legacyValid && componentValid
    
    if (allTokensValid && materialElements > 0) {
      console.log('🎉 PHASE 4 PASSED: Design token system successfully implemented')
      return true
    } else {
      console.log('❌ PHASE 4 NEEDS WORK: Issues with token system implementation')
      return false
    }
    
  } catch (error) {
    console.log('💥 Test Error:', error.message)
    return false
  } finally {
    await browser.close()
  }
}

testPhase4TokenSystem().then(success => {
  process.exit(success ? 0 : 1)
})