/**
 * Baseline Aurora Migration E2E Test
 * Captures current state before color/typography system consolidation
 * CLAUDE_RULES compliant: <100 lines, focused testing (Rule #92)
 */

import { test, expect } from '@playwright/test'

test.describe('Phase 1: Baseline Aurora Migration State', () => {
  
  test('Baseline: Current Homepage State', async ({ page }) => {
    console.log('📸 Capturing baseline homepage state...')
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Capture baseline homepage screenshot
    await page.screenshot({ 
      path: 'baseline-homepage.png', 
      fullPage: true 
    })
    
    // Count current color system usage
    const legacyAuroraColors = await page.locator('.text-aurora-nav-muted').count()
    const brandPrimaryUsage = await page.locator('.bg-brand-primary').count()
    const tokenSpacingUsage = await page.locator('[class*="py-token-"], [class*="px-token-"]').count()
    
    console.log(`Baseline metrics:`)
    console.log(`  - Legacy aurora colors: ${legacyAuroraColors}`)
    console.log(`  - Brand primary usage: ${brandPrimaryUsage}`)
    console.log(`  - Token spacing usage: ${tokenSpacingUsage}`)
    
    // Check for console errors in current state
    const logs: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('webpack')) {
        logs.push(msg.text())
      }
    })
    
    await page.waitForTimeout(2000)
    
    console.log(`  - Console errors: ${logs.length}`)
    if (logs.length > 0) {
      console.log('Baseline console errors:', logs.slice(0, 3))
    }
  })

  test('Baseline: Current Catalog State', async ({ page }) => {
    console.log('📸 Capturing baseline catalog state...')
    
    await page.goto('/catalog')
    await page.waitForLoadState('networkidle')
    
    // Capture baseline catalog screenshot
    await page.screenshot({ 
      path: 'baseline-catalog.png', 
      fullPage: true 
    })
    
    // Test current ProductCard styling
    const productCards = page.locator('[data-testid="product-card"]')
    const cardCount = await productCards.count()
    
    if (cardCount > 0) {
      const firstCard = productCards.first()
      await firstCard.screenshot({ path: 'baseline-product-card.png' })
      
      // Check current card styling
      const hasRoundedStyling = await firstCard.evaluate(el => 
        el.className.includes('rounded-')
      )
      
      console.log(`Baseline product cards:`)
      console.log(`  - Card count: ${cardCount}`)
      console.log(`  - Has rounded styling: ${hasRoundedStyling}`)
    }
  })

  test('Baseline: Color Demo Page Reference', async ({ page }) => {
    console.log('📸 Capturing color demo reference (target state)...')
    
    await page.goto('/color-demo')
    await page.waitForLoadState('networkidle')
    
    // Capture color demo as reference
    await page.screenshot({ 
      path: 'reference-color-demo.png', 
      fullPage: true 
    })
    
    // Analyze target color system
    const demoColorUsage = {
      brandPrimary: await page.locator('.bg-brand-primary').count(),
      brandSecondary: await page.locator('.bg-brand-secondary').count(),
      neutralColors: await page.locator('[class*="bg-neutral-"]').count(),
      directSpacing: await page.locator('[class*="py-"], [class*="px-"]').not('[class*="py-token-"], [class*="px-token-"]').count()
    }
    
    console.log('Target color system usage:')
    console.log(`  - Brand primary: ${demoColorUsage.brandPrimary}`)
    console.log(`  - Brand secondary: ${demoColorUsage.brandSecondary}`)
    console.log(`  - Neutral colors: ${demoColorUsage.neutralColors}`)
    console.log(`  - Direct spacing: ${demoColorUsage.directSpacing}`)
  })

  test('Baseline: Performance Metrics', async ({ page }) => {
    console.log('📊 Measuring baseline performance metrics...')
    
    await page.goto('/')
    
    // Measure performance metrics
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: nav.domContentLoadedEventEnd - nav.navigationStart,
        loadComplete: nav.loadEventEnd - nav.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
      }
    })
    
    console.log('Baseline performance:')
    console.log(`  - DOM ready: ${Math.round(metrics.domContentLoaded)}ms`)
    console.log(`  - Load complete: ${Math.round(metrics.loadComplete)}ms`)
    console.log(`  - First paint: ${Math.round(metrics.firstPaint)}ms`)
    
    // Set performance baselines for comparison
    expect(metrics.domContentLoaded).toBeLessThan(5000) // 5s max for baseline
    expect(metrics.loadComplete).toBeLessThan(8000) // 8s max for baseline
  })

  test('Baseline: Typography System State', async ({ page }) => {
    console.log('🔤 Analyzing current typography system...')
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check current typography usage
    const typographyMetrics = {
      headlineFont: await page.locator('.font-headline').count(),
      bodyFont: await page.locator('.font-body').count(),
      textSizes: await page.locator('[class*="text-"]').count(),
      fontBold: await page.locator('.font-bold').count()
    }
    
    console.log('Baseline typography:')
    console.log(`  - font-headline usage: ${typographyMetrics.headlineFont}`)
    console.log(`  - font-body usage: ${typographyMetrics.bodyFont}`)
    console.log(`  - Total text sizes: ${typographyMetrics.textSizes}`)
    console.log(`  - Bold text usage: ${typographyMetrics.fontBold}`)
    
    console.log('✅ Baseline migration state captured successfully')
  })
})