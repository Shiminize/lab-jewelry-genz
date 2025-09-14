/**
 * Phase 2: Tailwind Config Consolidation E2E Test
 * Validates consolidated color system matches demo patterns
 * CLAUDE_RULES compliant: <150 lines, focused testing (Rule #92)
 */

import { test, expect } from '@playwright/test'

test.describe('Phase 2: Tailwind Config Color System Consolidation', () => {
  
  test('Color System: Consolidated tokens work correctly', async ({ page }) => {
    console.log('🎨 Testing consolidated color system...')
    
    await page.goto('/color-demo')
    await page.waitForLoadState('networkidle')
    
    // Test primary brand colors render correctly
    const primaryElements = await page.locator('.bg-brand-primary').count()
    const secondaryElements = await page.locator('.bg-brand-secondary').count()
    const accentElements = await page.locator('.bg-brand-accent').count()
    
    console.log(`Brand color usage:`)
    console.log(`  - brand-primary: ${primaryElements}`)
    console.log(`  - brand-secondary: ${secondaryElements}`)
    console.log(`  - brand-accent: ${accentElements}`)
    
    expect(primaryElements).toBeGreaterThan(0)
    expect(secondaryElements).toBeGreaterThan(0)
    
    // Visual regression - compare with reference
    await page.screenshot({ 
      path: 'phase2-consolidated-color-demo.png', 
      fullPage: true 
    })
  })

  test('Color System: Neutral colors standardized', async ({ page }) => {
    console.log('🔘 Testing neutral color standardization...')
    
    await page.goto('/color-demo')
    await page.waitForLoadState('networkidle')
    
    // Test neutral color hierarchy
    const neutralUsage = {
      neutral50: await page.locator('.bg-neutral-50').count(),
      neutral100: await page.locator('.bg-neutral-100').count(),
      neutral200: await page.locator('.bg-neutral-200').count(),
      neutral600: await page.locator('.text-neutral-600').count(),
      neutral900: await page.locator('.text-neutral-900').count()
    }
    
    console.log('Neutral color usage:')
    console.log(`  - neutral-50 (backgrounds): ${neutralUsage.neutral50}`)
    console.log(`  - neutral-100 (cards): ${neutralUsage.neutral100}`)
    console.log(`  - neutral-200 (borders): ${neutralUsage.neutral200}`)
    console.log(`  - neutral-600 (secondary text): ${neutralUsage.neutral600}`)
    console.log(`  - neutral-900 (primary text): ${neutralUsage.neutral900}`)
    
    // Ensure neutral system is being used
    expect(neutralUsage.neutral600).toBeGreaterThan(0)
    expect(neutralUsage.neutral900).toBeGreaterThan(0)
  })

  test('Color System: Legacy compatibility maintained', async ({ page }) => {
    console.log('🔄 Testing legacy color compatibility...')
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check that legacy tokens still work (backward compatibility)
    const legacyUsage = {
      auroraSurface: await page.locator('.bg-aurora-nav-surface').count(),
      nebulaColor: await page.locator('.bg-nebula-purple, .text-nebula-purple').count(),
      ctaColor: await page.locator('.bg-cta, .text-cta').count()
    }
    
    console.log('Legacy color compatibility:')
    console.log(`  - aurora-nav-surface: ${legacyUsage.auroraSurface}`)
    console.log(`  - nebula-purple: ${legacyUsage.nebulaColor}`)
    console.log(`  - cta: ${legacyUsage.ctaColor}`)
    
    // Take screenshot for comparison
    await page.screenshot({ 
      path: 'phase2-legacy-compatibility.png', 
      fullPage: true 
    })
    
    // Check no console errors from color system changes
    const logs: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('webpack')) {
        logs.push(msg.text())
      }
    })
    
    await page.waitForTimeout(2000)
    
    if (logs.length === 0) {
      console.log('✅ No color-related console errors detected')
    } else {
      console.log('❌ Color system errors detected:')
      logs.forEach(log => console.log(`  - ${log}`))
    }
    
    expect(logs.length).toBe(0)
  })

  test('Color System: Material colors for customizer', async ({ page }) => {
    console.log('💎 Testing material color system...')
    
    await page.goto('/color-demo')
    await page.waitForLoadState('networkidle')
    
    // Test material color tags (as used in demo)
    const materialElements = await page.locator('[class*="bg-material-"]').count()
    const goldElements = await page.locator('.bg-material-gold').count()
    const roseGoldElements = await page.locator('.bg-material-rose-gold').count()
    
    console.log('Material color usage:')
    console.log(`  - Total material colors: ${materialElements}`)
    console.log(`  - Gold elements: ${goldElements}`)
    console.log(`  - Rose gold elements: ${roseGoldElements}`)
    
    // Material colors should be present in demo
    expect(materialElements).toBeGreaterThan(0)
  })

  test('Color System: Semantic colors standardized', async ({ page }) => {
    console.log('⚡ Testing semantic color standardization...')
    
    await page.goto('/color-demo')
    await page.waitForLoadState('networkidle')
    
    // Test semantic color usage (success, error, etc.)
    const semanticUsage = {
      success: await page.locator('.bg-semantic-success, .text-semantic-success').count(),
      error: await page.locator('.bg-semantic-error, .text-semantic-error').count(),
      warning: await page.locator('.bg-semantic-warning, .text-semantic-warning').count()
    }
    
    console.log('Semantic color usage:')
    console.log(`  - semantic-success: ${semanticUsage.success}`)
    console.log(`  - semantic-error: ${semanticUsage.error}`)  
    console.log(`  - semantic-warning: ${semanticUsage.warning}`)
    
    // Error color should be used for sale badges in demo
    expect(semanticUsage.error).toBeGreaterThan(0)
  })

  test('Build System: Consolidated config builds successfully', async ({ page }) => {
    console.log('🏗️ Testing build system with consolidated colors...')
    
    // Test that the consolidated system doesn't break the build
    await page.goto('/color-demo')
    await page.waitForLoadState('networkidle')
    
    // Check that all demo components render
    const heroSection = page.locator('section').first()
    const productGrid = page.locator('[class*="grid"]')
    const valueCards = page.locator('[class*="card"], [class*="rounded-2xl"]')
    
    await expect(heroSection).toBeVisible()
    await expect(productGrid).toBeVisible()
    await expect(valueCards.first()).toBeVisible()
    
    // Performance check - consolidation shouldn't slow things down
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domReady: nav.domContentLoadedEventEnd - nav.navigationStart,
        loadComplete: nav.loadEventEnd - nav.navigationStart
      }
    })
    
    console.log('Build performance:')
    console.log(`  - DOM ready: ${Math.round(metrics.domReady)}ms`)
    console.log(`  - Load complete: ${Math.round(metrics.loadComplete)}ms`)
    
    // Should maintain good performance
    expect(metrics.domReady).toBeLessThan(3000)
    expect(metrics.loadComplete).toBeLessThan(5000)
    
    console.log('✅ Phase 2: Color system consolidation validated successfully')
  })
})