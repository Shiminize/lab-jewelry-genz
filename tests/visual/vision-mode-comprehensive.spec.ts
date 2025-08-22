/**
 * Playwright Vision Mode E2E Test Suite
 * Visual regression testing for 3D customizer after ARIA removal
 * Tests UI consistency, visual hierarchy, and accessibility without ARIA attributes
 */

import { test, expect, Page } from '@playwright/test'
import path from 'path'

// Configure visual comparison options
const VISUAL_OPTIONS = {
  threshold: 0.3,  // Allow slight differences in anti-aliasing
  animations: 'disabled' as const,
  mode: 'rgb' as const
}

// Test viewport configurations
const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },  
  { name: 'desktop', width: 1440, height: 900 }
]

// Material variations to test
const TEST_MATERIALS = [
  { id: 'platinum', name: 'Platinum' },
  { id: 'white-gold', name: '18K White Gold' },
  { id: 'rose-gold', name: '18K Rose Gold' },
  { id: 'yellow-gold', name: '18K Yellow Gold' }
]

test.describe('Vision Mode: 3D Customizer Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Disable animations for consistent screenshots
    await page.addInitScript(() => {
      document.documentElement.style.setProperty('--animation-duration', '0s')
      document.documentElement.style.setProperty('--transition-duration', '0s')
    })
    
    // Navigate to customizer page
    await page.goto('/customizer')
    
    // Wait for 3D customizer to fully load
    await page.waitForSelector('[data-testid="material-switcher"]', { timeout: 30000 })
    await page.waitForTimeout(2000) // Allow for image loading
  })

  // Test 1: Full page visual consistency across viewports
  for (const viewport of VIEWPORTS) {
    test(`Full page visual consistency - ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.waitForTimeout(1000) // Allow layout to settle
      
      // Take full page screenshot
      const screenshot = await page.screenshot({ 
        fullPage: true,
        ...VISUAL_OPTIONS
      })
      
      await expect(screenshot).toMatchSnapshot(`customizer-fullpage-${viewport.name}.png`)
    })
  }

  // Test 2: Material switching visual verification
  test('Material switching visual states', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    
    for (const material of TEST_MATERIALS) {
      // Click material button
      await page.click(`button:has-text("${material.name}")`)
      await page.waitForTimeout(1500) // Allow for material switch animation
      
      // Screenshot the viewer area
      const viewer = page.locator('[data-testid="material-switcher"] > div:first-child')
      await expect(viewer).toBeVisible()
      
      const screenshot = await viewer.screenshot(VISUAL_OPTIONS)
      await expect(screenshot).toMatchSnapshot(`material-${material.id}.png`)
    }
  })

  // Test 3: Loading states visual verification
  test('Loading states visual consistency', async ({ page, context }) => {
    // Create new page to catch loading state
    const newPage = await context.newPage()
    
    // Navigate with network throttling to catch loading state
    await newPage.route('**/*.webp', route => {
      // Delay image loading by 2 seconds
      setTimeout(() => route.continue(), 2000)
    })
    
    await newPage.goto('/customizer')
    
    // Screenshot loading state
    const loadingElement = newPage.locator('text=Optimizing for instant switches')
    await expect(loadingElement).toBeVisible({ timeout: 5000 })
    
    const loadingScreenshot = await newPage.screenshot(VISUAL_OPTIONS)
    await expect(loadingScreenshot).toMatchSnapshot('customizer-loading-state.png')
    
    await newPage.close()
  })

  // Test 4: Error states visual verification
  test('Error states visual consistency', async ({ page }) => {
    // Force an error by navigating to invalid material path
    await page.route('**/images/products/3d-sequences/**/*.webp', route => {
      route.abort('failed')
    })
    
    await page.reload()
    await page.waitForTimeout(3000) // Allow error state to appear
    
    // Screenshot error state
    const errorElement = page.locator('text=Loading Failed')
    await expect(errorElement).toBeVisible({ timeout: 10000 })
    
    const errorScreenshot = await page.screenshot(VISUAL_OPTIONS)
    await expect(errorScreenshot).toMatchSnapshot('customizer-error-state.png')
  })

  // Test 5: Mobile touch controls visual verification
  test('Mobile touch controls visual layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    
    // Screenshot mobile layout with touch controls
    const mobileScreenshot = await page.screenshot(VISUAL_OPTIONS)
    await expect(mobileScreenshot).toMatchSnapshot('customizer-mobile-touch.png')
    
    // Test touch instruction modal
    await page.click('button[class*="fixed top-20 right-4"]') // Help button
    await page.waitForTimeout(500)
    
    const modalScreenshot = await page.screenshot(VISUAL_OPTIONS)
    await expect(modalScreenshot).toMatchSnapshot('customizer-touch-instructions.png')
  })

  // Test 6: Material selector button states
  test('Material selector visual states', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    
    const selectorArea = page.locator('[data-testid="material-switcher"] > div:last-child')
    
    // Default state
    let screenshot = await selectorArea.screenshot(VISUAL_OPTIONS)
    await expect(screenshot).toMatchSnapshot('material-selector-default.png')
    
    // Hover state (simulate with focus)
    await page.focus('button:has-text("18K White Gold")')
    await page.waitForTimeout(200)
    
    screenshot = await selectorArea.screenshot(VISUAL_OPTIONS)
    await expect(screenshot).toMatchSnapshot('material-selector-hover.png')
    
    // Selected state
    await page.click('button:has-text("18K White Gold")')
    await page.waitForTimeout(500)
    
    screenshot = await selectorArea.screenshot(VISUAL_OPTIONS)
    await expect(screenshot).toMatchSnapshot('material-selector-selected.png')
  })

  // Test 7: Visual hierarchy without ARIA attributes
  test('Visual hierarchy and focus indicators', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    
    // Test keyboard navigation visual feedback
    await page.keyboard.press('Tab') // Focus first interactive element
    await page.waitForTimeout(200)
    
    let screenshot = await page.screenshot(VISUAL_OPTIONS)
    await expect(screenshot).toMatchSnapshot('focus-first-element.png')
    
    // Navigate through material buttons
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(200)
    }
    
    screenshot = await page.screenshot(VISUAL_OPTIONS)
    await expect(screenshot).toMatchSnapshot('focus-material-buttons.png')
  })

  // Test 8: Performance visual indicators  
  test('Performance indicators visual display', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    
    // Wait for performance stats to appear
    await page.waitForSelector('text=CLAUDE_RULES Optimized', { timeout: 15000 })
    
    // Screenshot performance section
    const performanceArea = page.locator('text=CLAUDE_RULES Optimized').locator('..')
    const screenshot = await performanceArea.screenshot(VISUAL_OPTIONS)
    await expect(screenshot).toMatchSnapshot('performance-indicators.png')
  })

  // Test 9: Zoom controls visual verification
  test('Zoom controls visual states', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    
    // Wait for zoom controls to be visible
    const zoomControls = page.locator('[data-testid="material-switcher"] button:has-text("+")')
    await expect(zoomControls).toBeVisible()
    
    // Default zoom state
    const viewer = page.locator('[data-testid="material-switcher"] > div:first-child')
    let screenshot = await viewer.screenshot(VISUAL_OPTIONS)
    await expect(screenshot).toMatchSnapshot('zoom-default.png')
    
    // Zoom in twice
    await zoomControls.click()
    await page.waitForTimeout(300)
    await zoomControls.click()
    await page.waitForTimeout(300)
    
    screenshot = await viewer.screenshot(VISUAL_OPTIONS)
    await expect(screenshot).toMatchSnapshot('zoom-in-2x.png')
  })

  // Test 10: Cross-browser visual consistency
  test('Cross-browser visual consistency check', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    
    // Take screenshot of main customizer interface
    const customizerArea = page.locator('[data-testid="material-switcher"]')
    const screenshot = await customizerArea.screenshot(VISUAL_OPTIONS)
    
    await expect(screenshot).toMatchSnapshot(`customizer-${browserName}.png`)
  })
})

test.describe('Vision Mode: Accessibility Visual Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/customizer')
    await page.waitForSelector('[data-testid="material-switcher"]', { timeout: 30000 })
  })

  // Test 11: High contrast mode visual verification  
  test('High contrast mode compatibility', async ({ page }) => {
    // Enable high contrast simulation
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' })
    await page.waitForTimeout(500)
    
    const screenshot = await page.screenshot(VISUAL_OPTIONS)
    await expect(screenshot).toMatchSnapshot('customizer-high-contrast.png')
  })

  // Test 12: Reduced motion visual verification
  test('Reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    
    // Switch materials to test animation reduction
    await page.click('button:has-text("18K Rose Gold")')
    await page.waitForTimeout(1000)
    
    const screenshot = await page.screenshot(VISUAL_OPTIONS)
    await expect(screenshot).toMatchSnapshot('customizer-reduced-motion.png')
  })

  // Test 13: Color blindness simulation
  test('Color blindness compatibility', async ({ page }) => {
    // Test material differentiation without relying solely on color
    const materialButtons = page.locator('[data-testid="material-switcher"] button')
    
    // Take screenshot showing material visual differences
    const materialsArea = page.locator('[data-testid="material-switcher"] > div:last-child')
    const screenshot = await materialsArea.screenshot(VISUAL_OPTIONS)
    await expect(screenshot).toMatchSnapshot('materials-color-blind-friendly.png')
  })
})

test.describe('Vision Mode: Performance Visual Indicators', () => {
  // Test 14: Frame rate visual smoothness
  test('Material switching smoothness verification', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    
    // Record performance during rapid material switching
    const materialsToTest = ['Platinum', '18K White Gold', '18K Rose Gold', '18K Yellow Gold']
    
    for (const material of materialsToTest) {
      const startTime = Date.now()
      
      await page.click(`button:has-text("${material}")`)
      await page.waitForTimeout(100) // Minimal wait to capture switch
      
      const viewer = page.locator('[data-testid="material-switcher"] > div:first-child')
      const screenshot = await viewer.screenshot(VISUAL_OPTIONS)
      
      const switchTime = Date.now() - startTime
      console.log(`${material} switch time: ${switchTime}ms`)
      
      // Verify switch completed within performance budget
      expect(switchTime).toBeLessThan(200) // 200ms max switch time
      
      await expect(screenshot).toMatchSnapshot(`quick-switch-${material.toLowerCase().replace(/\s+/g, '-')}.png`)
    }
  })

  // Test 15: Loading progress visual indicators
  test('Loading progress visual feedback', async ({ page, context }) => {
    const newPage = await context.newPage()
    
    // Throttle network to capture progress states
    await newPage.route('**/images/products/3d-sequences/**/*.webp', route => {
      setTimeout(() => route.continue(), Math.random() * 1000 + 500)
    })
    
    await newPage.goto('/customizer')
    
    // Capture various loading progress states
    const progressChecks = [25, 50, 75, 100]
    
    for (const progress of progressChecks) {
      await newPage.waitForFunction(
        (targetProgress) => {
          const progressText = document.querySelector('text*="% materials ready"')
          if (!progressText) return false
          const currentProgress = parseInt(progressText.textContent?.match(/(\d+)%/)?.[1] || '0')
          return currentProgress >= targetProgress
        },
        progress,
        { timeout: 30000 }
      )
      
      const screenshot = await newPage.screenshot(VISUAL_OPTIONS)
      await expect(screenshot).toMatchSnapshot(`loading-progress-${progress}percent.png`)
    }
    
    await newPage.close()
  })
})