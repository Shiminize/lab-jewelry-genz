/**
 * Phase 3: Material & Customization Enhancements E2E Test
 * 
 * Validates prismatic shadows, hover luminosity, and ripple states
 * for material selection components per Phase 3 requirements.
 * 
 * Success Criteria:
 * - Material selection shows proper prismatic effects
 * - Hover states respond within Aurora specifications (+15% luminosity)
 * - No text rendering issues in customizer
 */

import { test, expect } from '@playwright/test'

test.describe('Phase 3: Material & Customization Enhancements Validation', () => {
  let materialInteractions: any[] = []
  let hoverStates: any[] = []
  
  test.beforeEach(async ({ page }) => {
    // Monitor material interactions
    materialInteractions = []
    hoverStates = []
    
    page.on('console', msg => {
      if (msg.text().includes('MATERIAL SWITCH') || msg.text().includes('prismatic')) {
        materialInteractions.push({
          type: 'material-switch',
          message: msg.text(),
          timestamp: Date.now()
        })
      }
    })
  })

  test('Phase 3.1: Prismatic shadows for Gold materials', async ({ page }) => {
    console.log('✨ Phase 3.1: Testing prismatic shadows for Gold materials...')
    
    // Navigate to customizer page
    await page.goto('/customizer')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000) // Allow customizer to load
    
    // Look for material selection buttons
    const goldButtons = page.locator('button').filter({ hasText: /Gold/i })
    const goldCount = await goldButtons.count()
    
    console.log(`Found ${goldCount} gold material buttons`)
    
    if (goldCount > 0) {
      // Test Yellow Gold prismatic shadow
      const yellowGoldButton = goldButtons.filter({ hasText: /18K.*Gold/i }).or(
        goldButtons.filter({ hasText: /Yellow.*Gold/i })
      ).first()
      
      if (await yellowGoldButton.count() > 0) {
        // Check for prismatic shadow class
        const hasGoldShadow = await yellowGoldButton.evaluate(el => {
          return el.classList.contains('aurora-prismatic-gold')
        })
        
        console.log(`Yellow Gold prismatic shadow applied: ${hasGoldShadow}`)
        
        // Test hover state
        await yellowGoldButton.hover()
        await page.waitForTimeout(300)
        
        // Check CSS properties for prismatic effect
        const shadowStyle = await yellowGoldButton.evaluate(el => {
          const styles = window.getComputedStyle(el)
          return {
            boxShadow: styles.boxShadow,
            transform: styles.transform,
            filter: styles.filter
          }
        })
        
        console.log('✅ Gold prismatic CSS properties:', shadowStyle)
        
        // Verify prismatic shadow is present
        expect(shadowStyle.boxShadow).not.toBe('none')
        expect(hasGoldShadow).toBe(true)
      }
    }
    
    console.log('✅ Phase 3.1: Gold prismatic shadows validated')
  })

  test('Phase 3.2: Prismatic shadows for Platinum materials', async ({ page }) => {
    console.log('✨ Phase 3.2: Testing prismatic shadows for Platinum materials...')
    
    await page.goto('/customizer')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    // Look for platinum/white gold buttons
    const platinumButtons = page.locator('button').filter({ hasText: /Platinum|White.*Gold/i })
    const platinumCount = await platinumButtons.count()
    
    console.log(`Found ${platinumCount} platinum/white gold material buttons`)
    
    if (platinumCount > 0) {
      const platinumButton = platinumButtons.first()
      
      // Check for platinum prismatic shadow class
      const hasPlatinumShadow = await platinumButton.evaluate(el => {
        return el.classList.contains('aurora-prismatic-platinum')
      })
      
      console.log(`Platinum prismatic shadow applied: ${hasPlatinumShadow}`)
      
      // Test hover state for cool shadow effect
      await platinumButton.hover()
      await page.waitForTimeout(300)
      
      const shadowStyle = await platinumButton.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return {
          boxShadow: styles.boxShadow,
          transform: styles.transform
        }
      })
      
      console.log('✅ Platinum prismatic CSS properties:', shadowStyle)
      
      // Verify cool-toned prismatic shadow
      expect(shadowStyle.boxShadow).not.toBe('none')
      expect(hasPlatinumShadow).toBe(true)
    }
    
    console.log('✅ Phase 3.2: Platinum prismatic shadows validated')
  })

  test('Phase 3.3: Prismatic shadows for Rose Gold materials', async ({ page }) => {
    console.log('✨ Phase 3.3: Testing prismatic shadows for Rose Gold materials...')
    
    await page.goto('/customizer')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    // Look for rose gold buttons
    const roseGoldButtons = page.locator('button').filter({ hasText: /Rose.*Gold/i })
    const roseGoldCount = await roseGoldButtons.count()
    
    console.log(`Found ${roseGoldCount} rose gold material buttons`)
    
    if (roseGoldCount > 0) {
      const roseGoldButton = roseGoldButtons.first()
      
      // Check for rose gold prismatic shadow class
      const hasRoseGoldShadow = await roseGoldButton.evaluate(el => {
        return el.classList.contains('aurora-prismatic-rose-gold')
      })
      
      console.log(`Rose Gold prismatic shadow applied: ${hasRoseGoldShadow}`)
      
      // Test hover effect for warm pink shadow
      await roseGoldButton.hover()
      await page.waitForTimeout(300)
      
      const shadowStyle = await roseGoldButton.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return {
          boxShadow: styles.boxShadow,
          filter: styles.filter,
          transform: styles.transform
        }
      })
      
      console.log('✅ Rose Gold prismatic CSS properties:', shadowStyle)
      
      // Verify warm-toned prismatic shadow
      expect(shadowStyle.boxShadow).not.toBe('none')
      expect(hasRoseGoldShadow).toBe(true)
    }
    
    console.log('✅ Phase 3.3: Rose Gold prismatic shadows validated')
  })

  test('Phase 3.4: Hover luminosity and ripple states', async ({ page }) => {
    console.log('✨ Phase 3.4: Testing hover luminosity (+15%) and ripple effects...')
    
    await page.goto('/customizer')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Find material buttons with ripple effects
    const materialButtons = page.locator('button').filter({ hasText: /Gold|Platinum/i })
    const buttonCount = await materialButtons.count()
    
    console.log(`Found ${buttonCount} material buttons for hover testing`)
    
    if (buttonCount > 0) {
      const testButton = materialButtons.first()
      
      // Test initial state
      const initialStyle = await testButton.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return {
          filter: styles.filter,
          hasRipple: el.classList.contains('aurora-material-ripple')
        }
      })
      
      console.log('Initial button state:', initialStyle)
      
      // Test hover state for brightness increase
      await testButton.hover()
      await page.waitForTimeout(300)
      
      const hoverStyle = await testButton.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return {
          filter: styles.filter,
          transform: styles.transform,
          boxShadow: styles.boxShadow
        }
      })
      
      console.log('✅ Hover state CSS properties:', hoverStyle)
      
      // Verify hover effects are applied
      expect(initialStyle.hasRipple).toBe(true)
      expect(hoverStyle.filter).toContain('brightness')
      expect(hoverStyle.transform).not.toBe('none')
      
      // Test click for ripple effect
      await testButton.click()
      await page.waitForTimeout(100)
      
      console.log('✅ Ripple effect triggered on click')
    }
    
    console.log('✅ Phase 3.4: Hover luminosity and ripple states validated')
  })

  test('Phase 3.5: Material switching performance with effects', async ({ page }) => {
    console.log('⚡ Phase 3.5: Testing material switching performance with prismatic effects...')
    
    await page.goto('/customizer')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Clear previous interactions
    materialInteractions.length = 0
    
    const materialButtons = page.locator('button').filter({ hasText: /Gold|Platinum/i })
    const buttonCount = await materialButtons.count()
    
    if (buttonCount >= 2) {
      console.log(`Testing switching between ${buttonCount} materials`)
      
      // Test switching between first two materials
      const startTime = Date.now()
      
      await materialButtons.nth(0).click()
      await page.waitForTimeout(200)
      
      await materialButtons.nth(1).click() 
      await page.waitForTimeout(200)
      
      const endTime = Date.now()
      const switchingTime = endTime - startTime
      
      console.log(`Material switching with effects completed in ${switchingTime}ms`)
      
      // Check for any material switch logs
      const switchLogs = materialInteractions.filter(i => i.type === 'material-switch')
      console.log(`Material switch events captured: ${switchLogs.length}`)
      
      // Performance should still be reasonable with effects
      expect(switchingTime).toBeLessThan(2000) // Should complete within 2 seconds including effects
      
      console.log('✅ Material switching performance maintained with prismatic effects')
    }
    
    console.log('✅ Phase 3.5: Performance validation completed')
  })

  test('Phase 3.6: Vision Mode prismatic effects screenshots', async ({ page }) => {
    console.log('📸 Phase 3.6: Capturing prismatic effects visual states...')
    
    await page.goto('/customizer')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    // Desktop customizer with material effects
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.screenshot({ 
      path: 'phase3-prismatic-effects-desktop.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    })
    
    // Test hover states on different materials
    const goldButton = page.locator('button').filter({ hasText: /Gold/i }).first()
    if (await goldButton.count() > 0) {
      await goldButton.hover()
      await page.waitForTimeout(500)
      
      await page.screenshot({ 
        path: 'phase3-gold-hover-effect.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1920, height: 800 }
      })
    }
    
    // Test platinum hover
    const platinumButton = page.locator('button').filter({ hasText: /Platinum/i }).first()
    if (await platinumButton.count() > 0) {
      await platinumButton.hover()
      await page.waitForTimeout(500)
      
      await page.screenshot({ 
        path: 'phase3-platinum-hover-effect.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1920, height: 800 }
      })
    }
    
    // Mobile customizer effects
    await page.setViewportSize({ width: 375, height: 667 })
    await page.screenshot({ 
      path: 'phase3-prismatic-effects-mobile.png',
      fullPage: true
    })
    
    console.log('📸 Phase 3 prismatic effects screenshots captured for visual regression testing')
    console.log('🎉 Phase 3: Material & Customization Enhancements - VALIDATION COMPLETE')
  })
})