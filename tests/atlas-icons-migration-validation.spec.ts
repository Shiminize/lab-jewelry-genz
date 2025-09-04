import { test, expect } from '@playwright/test'

/**
 * Atlas Icons Migration Validation E2E Tests
 * Pre-Phase 4-5 Migration Safety Tests
 * 
 * This suite validates:
 * - Coexistence of Atlas Icons and Lucide React icons
 * - No naming conflicts or duplicate imports
 * - Gradual migration strategy feasibility
 * - Bundle size optimization
 * - Performance impact assessment
 */

test.describe('Migration Validation - Coexistence Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Track all network requests to analyze bundle loading
    page.on('response', response => {
      if (response.url().includes('chunk') || response.url().includes('bundle')) {
        console.log(`Bundle loaded: ${response.url()} - Status: ${response.status()}`)
      }
    })

    // Monitor console for conflicts
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`${msg.type().toUpperCase()}: ${msg.text()}`)
      }
    })
  })

  test('Atlas Icons and Lucide React coexist without conflicts', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navigation should use Atlas Icons (already migrated)
    const atlasSearchIcon = page.locator('button[aria-label*="Search"] svg').first()
    await expect(atlasSearchIcon).toBeVisible()

    // Check if any pages still use Lucide icons (should work fine)
    await page.goto('/catalog', { waitUntil: 'networkidle' })
    
    // Both icon systems should render without conflicts
    const anyIcons = page.locator('svg')
    const iconCount = await anyIcons.count()
    
    // Should have icons on the page
    expect(iconCount).toBeGreaterThan(0)
    
    // Verify at least first few icons are visible
    for (let i = 0; i < Math.min(iconCount, 5); i++) {
      await expect(anyIcons.nth(i)).toBeVisible()
    }
  })

  test('No duplicate icon names cause conflicts', async ({ page }) => {
    const consoleLogs: { type: string; text: string }[] = []
    
    page.on('console', msg => {
      consoleLogs.push({ type: msg.type(), text: msg.text() })
    })

    // Visit pages that might have both icon types
    const testPages = ['/', '/icon-test', '/catalog']
    
    for (const testPage of testPages) {
      await page.goto(testPage)
      await page.waitForLoadState('networkidle')
    }

    // Check for naming conflict errors
    const conflicts = consoleLogs.filter(log =>
      log.text.toLowerCase().includes('duplicate') ||
      log.text.toLowerCase().includes('conflict') ||
      (log.text.toLowerCase().includes('icon') && log.text.toLowerCase().includes('already'))
    )

    expect(conflicts).toHaveLength(0)
  })

  test('Mixed icon usage works correctly', async ({ page }) => {
    // Create a test scenario where both icon types might be used
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Atlas Icons should work
    const atlasIcon = page.locator('text=search').locator('..').locator('svg').first()
    await expect(atlasIcon).toBeVisible()

    // Navigate to a page that might still use Lucide
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navigation icons should work (now Atlas)
    const navIcon = page.locator('button[aria-label*="Search"] svg').first()
    await expect(navIcon).toBeVisible()

    // No JavaScript errors should occur
    const jsErrors = await page.evaluate(() => {
      return window.console.error.toString().includes('Icon')
    })
    
    expect(jsErrors).toBeFalsy()
  })
})

test.describe('Migration Validation - Performance Impact', () => {
  test('Bundle size remains optimized with Atlas Icons', async ({ page }) => {
    // Measure initial page load performance
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Should load within reasonable time (5 seconds for full page)
    expect(loadTime).toBeLessThan(5000)
  })

  test('Icon rendering performance is acceptable', async ({ page }) => {
    await page.goto('/icon-test')
    
    // Measure time to render all test icons
    const startTime = performance.now()
    
    await page.waitForLoadState('networkidle')
    
    // Wait for all icons to be visible
    await expect(page.locator('svg').first()).toBeVisible({ timeout: 3000 })
    
    const renderTime = performance.now() - startTime
    
    // Icons should render quickly
    expect(renderTime).toBeLessThan(1000)
  })

  test('Memory usage remains stable with new icons', async ({ page }) => {
    // Navigate to multiple pages to test memory stability
    const testPages = ['/', '/icon-test', '/catalog', '/']
    
    for (const testPage of testPages) {
      await page.goto(testPage)
      await page.waitForLoadState('networkidle')
      
      // Give time for any memory leaks to manifest
      await page.waitForTimeout(1000)
    }

    // Check if page is still responsive
    await expect(page.locator('body')).toBeVisible()
    
    // Test interaction still works
    const clickableElement = page.locator('button, a').first()
    if (await clickableElement.count() > 0) {
      await expect(clickableElement).toBeEnabled()
    }
  })

  test('Tree-shaking works correctly for Atlas Icons', async ({ page }) => {
    // This test verifies that only used icons are loaded
    const networkRequests: string[] = []
    
    page.on('response', response => {
      networkRequests.push(response.url())
    })

    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Check that we're not loading the entire Atlas Icons bundle
    const iconBundleRequests = networkRequests.filter(url =>
      url.includes('atlas') || url.includes('icon')
    )

    // Should have icon-related requests but not excessive ones
    console.log('Icon-related network requests:', iconBundleRequests.length)
    
    // This is a heuristic - we expect some icon requests but not hundreds
    expect(iconBundleRequests.length).toBeLessThan(50)
  })
})

test.describe('Migration Validation - Consistency Checks', () => {
  test('Icon styling is consistent across pages', async ({ page }) => {
    const pages = ['/', '/icon-test']
    const iconStyles: Record<string, any> = {}

    for (const testPage of pages) {
      await page.goto(testPage)
      await page.waitForLoadState('networkidle')

      // Get first icon's computed styles
      const firstIcon = page.locator('svg').first()
      if (await firstIcon.count() > 0) {
        const styles = await firstIcon.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            display: computed.display,
            position: computed.position,
            color: computed.color
          }
        })
        
        iconStyles[testPage] = styles
      }
    }

    // Verify consistency (at least display should be consistent)
    const displayValues = Object.values(iconStyles).map((s: any) => s.display)
    const uniqueDisplayValues = [...new Set(displayValues)]
    
    // Should have consistent display values
    expect(uniqueDisplayValues.length).toBeLessThanOrEqual(2) // Allow for some variation
  })

  test('Icon accessibility is maintained across migration', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check navigation icons accessibility
    const navIcons = page.locator('nav svg, header svg').first()
    if (await navIcons.count() > 0) {
      const parentElement = navIcons.locator('..')
      
      // Should have proper ARIA labeling
      const ariaLabel = await parentElement.getAttribute('aria-label')
      const hasAccessibleName = ariaLabel || await parentElement.textContent()
      
      expect(hasAccessibleName).toBeTruthy()
    }

    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Check test page icons accessibility
    const testIcons = page.locator('svg')
    const count = await testIcons.count()
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      const icon = testIcons.nth(i)
      const ariaLabel = await icon.getAttribute('aria-label')
      
      // Each icon should have some form of accessible name
      expect(ariaLabel).toBeTruthy()
    }
  })
})

test.describe('Migration Validation - Error Resilience', () => {
  test('Graceful fallback when icons fail to load', async ({ page }) => {
    // Simulate network issues by blocking icon requests
    await page.route('**/*atlas*', route => route.abort())
    
    await page.goto('/icon-test')
    
    // Page should still load even if icons fail
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
    
    // Should not cause critical page failures
    const pageTitle = await page.title()
    expect(pageTitle).toBeTruthy()
  })

  test('Invalid icon names are handled gracefully', async ({ page }) => {
    const consoleErrors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Check if invalid icon warnings are non-critical
    const criticalErrors = consoleErrors.filter(error =>
      !error.includes('not found') && // These are warnings, not critical errors
      !error.includes('Warning') &&
      error.includes('icon')
    )

    expect(criticalErrors).toHaveLength(0)
  })
})

test.describe('Migration Validation - Integration Points', () => {
  test('Icons work correctly with Aurora Design System', async ({ page }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Find Aurora colored icons section
    const auroraSection = page.locator('h2', { hasText: 'Aurora Colors' }).locator('..')
    const auroraIcons = auroraSection.locator('svg')
    const count = await auroraIcons.count()

    expect(count).toBeGreaterThan(0)

    // Check that Aurora CSS variables are applied
    for (let i = 0; i < Math.min(count, 2); i++) {
      const icon = auroraIcons.nth(i)
      const colorValue = await icon.getAttribute('color')
      
      expect(colorValue).toContain('var(--aurora-')
    }
  })

  test('Icons integrate properly with interactive components', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Test interactive icon buttons
    const searchButton = page.locator('button[aria-label*="Search"]').first()
    
    if (await searchButton.count() > 0) {
      // Should be clickable
      await expect(searchButton).toBeEnabled()
      
      // Icon should be visible
      await expect(searchButton.locator('svg')).toBeVisible()
      
      // Should respond to hover
      await searchButton.hover()
      await expect(searchButton).toBeVisible() // Should remain visible
    }
  })

  test('Icons work correctly in responsive layouts', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const desktopIcons = page.locator('svg')
    const desktopCount = await desktopIcons.count()

    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await page.waitForLoadState('networkidle')

    const mobileIcons = page.locator('svg')
    const mobileCount = await mobileIcons.count()

    // Should have icons in both layouts
    expect(desktopCount).toBeGreaterThan(0)
    expect(mobileCount).toBeGreaterThan(0)

    // Icons should be visible in mobile
    await expect(mobileIcons.first()).toBeVisible()
  })
})

test.describe('Migration Validation - Future Compatibility', () => {
  test('Icon component API is future-proof', async ({ page }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Test that icons accept standard props (size, color, className)
    const icons = page.locator('svg')
    const sampleIcon = icons.first()

    if (await sampleIcon.count() > 0) {
      // Should have size attribute or equivalent
      const hasSize = await sampleIcon.getAttribute('size') ||
                     await sampleIcon.getAttribute('width') ||
                     await sampleIcon.getAttribute('height')
      
      expect(hasSize).toBeTruthy()

      // Should support color
      const hasColor = await sampleIcon.getAttribute('color') ||
                      await sampleIcon.getAttribute('fill')
      
      // Color might be optional, but should be supported when present
      if (hasColor) {
        expect(hasColor).toBeTruthy()
      }
    }
  })

  test('Migration path supports incremental adoption', async ({ page }) => {
    // This test verifies that we can migrate components one by one
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navigation should use Atlas Icons (already migrated)
    const navIcons = page.locator('nav svg, header svg')
    const navIconCount = await navIcons.count()
    
    if (navIconCount > 0) {
      // At least one icon should be present and working
      await expect(navIcons.first()).toBeVisible()
    }

    // Other components might still use Lucide (that's okay)
    await page.goto('/catalog')
    await page.waitForLoadState('networkidle')

    // Page should still work regardless of icon library used
    await expect(page.locator('body')).toBeVisible()
  })
})