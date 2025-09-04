import { test, expect } from '@playwright/test'

/**
 * Atlas Icons Visual Regression E2E Tests
 * Pre-Phase 4-5 Visual Validation Tests
 * 
 * This suite validates:
 * - Visual consistency of Atlas Icons
 * - Icon rendering quality and sharpness
 * - Color accuracy and Aurora Design System integration
 * - Responsive icon behavior
 * - Cross-browser visual consistency
 */

test.describe('Visual Regression - Icon Rendering Quality', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure consistent rendering conditions
    await page.setViewportSize({ width: 1200, height: 800 })
  })

  test('Icon test page renders correctly', async ({ page }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Wait for all icons to load
    await page.waitForFunction(() => {
      const icons = document.querySelectorAll('svg')
      return icons.length > 0 && Array.from(icons).every(icon => 
        icon.getBoundingClientRect().width > 0
      )
    }, { timeout: 5000 })

    // Take full page screenshot for baseline comparison
    await expect(page).toHaveScreenshot('atlas-icons-test-page.png', {
      fullPage: true,
      threshold: 0.2, // Allow small differences for anti-aliasing
    })
  })

  test('Navigation icons render consistently', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Focus on navigation area
    const navArea = page.locator('nav, header').first()
    await expect(navArea).toBeVisible()

    // Take screenshot of navigation area only
    await expect(navArea).toHaveScreenshot('navigation-atlas-icons.png', {
      threshold: 0.1
    })
  })

  test('Individual icon categories render correctly', async ({ page }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Test each icon section individually
    const sections = [
      { name: 'common-icons', text: 'Common Icons (via mappings)' },
      { name: 'preset-components', text: 'Preset Components' },
      { name: 'direct-atlas-icons', text: 'Direct Atlas Icon Names' },
      { name: 'size-variations', text: 'Size Variations' },
      { name: 'aurora-colors', text: 'Aurora Colors' }
    ]

    for (const section of sections) {
      const sectionElement = page.locator('h2', { hasText: section.text }).locator('..')
      await expect(sectionElement).toBeVisible()

      // Screenshot each section
      await expect(sectionElement).toHaveScreenshot(`${section.name}-section.png`, {
        threshold: 0.15
      })
    }
  })
})

test.describe('Visual Regression - Icon Size and Scaling', () => {
  test('Icon size variations display correctly', async ({ page }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Focus on size variations section
    const sizeSection = page.locator('h2', { hasText: 'Size Variations' }).locator('..')
    await expect(sizeSection).toBeVisible()

    // Verify size progression is visually correct
    await expect(sizeSection).toHaveScreenshot('icon-size-variations.png', {
      threshold: 0.1
    })
  })

  test('Icons scale properly at different viewport sizes', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    const commonSection = page.locator('h2', { hasText: 'Common Icons' }).locator('..')
    await expect(commonSection).toHaveScreenshot('common-icons-desktop.png', {
      threshold: 0.1
    })

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await page.waitForLoadState('networkidle')

    await expect(commonSection).toHaveScreenshot('common-icons-tablet.png', {
      threshold: 0.1
    })

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await page.waitForLoadState('networkidle')

    await expect(commonSection).toHaveScreenshot('common-icons-mobile.png', {
      threshold: 0.1
    })
  })
})

test.describe('Visual Regression - Color Accuracy', () => {
  test('Aurora Design System colors render correctly', async ({ page }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Focus on Aurora colors section
    const colorSection = page.locator('h2', { hasText: 'Aurora Colors' }).locator('..')
    await expect(colorSection).toBeVisible()

    // Wait for CSS variables to be applied
    await page.waitForTimeout(500)

    // Screenshot color section with high precision
    await expect(colorSection).toHaveScreenshot('aurora-color-icons.png', {
      threshold: 0.05 // Strict threshold for color accuracy
    })
  })

  test('Color consistency across different icons', async ({ page }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Test heart icon with red color
    const heartIconContainer = page.locator('text=heart').locator('..').first()
    await expect(heartIconContainer).toHaveScreenshot('red-heart-icon.png', {
      threshold: 0.05
    })

    // Test another colored icon for comparison
    const coloredSection = page.locator('h2', { hasText: 'Aurora Colors' }).locator('..')
    const firstColoredIcon = coloredSection.locator('div').first()
    await expect(firstColoredIcon).toHaveScreenshot('aurora-colored-gem-icon.png', {
      threshold: 0.05
    })
  })
})

test.describe('Visual Regression - Interactive States', () => {
  test('Icon hover states render correctly', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Find interactive navigation icon
    const searchButton = page.locator('button[aria-label*="Search"]').first()
    
    if (await searchButton.count() > 0) {
      // Normal state
      await expect(searchButton).toHaveScreenshot('search-icon-normal.png', {
        threshold: 0.1
      })

      // Hover state
      await searchButton.hover()
      await page.waitForTimeout(200) // Allow transition to complete
      
      await expect(searchButton).toHaveScreenshot('search-icon-hover.png', {
        threshold: 0.1
      })
    }
  })

  test('Focus states are visually correct', async ({ page }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Focus on any interactive icon element
    const firstInteractiveElement = page.locator('button, a').filter({ has: page.locator('svg') }).first()
    
    if (await firstInteractiveElement.count() > 0) {
      await firstInteractiveElement.focus()
      await page.waitForTimeout(200)

      await expect(firstInteractiveElement).toHaveScreenshot('icon-focus-state.png', {
        threshold: 0.1
      })
    }
  })
})

test.describe('Visual Regression - Cross-Browser Consistency', () => {
  test('Icons render consistently across browsers', async ({ page, browserName }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Take screenshot specific to browser
    const commonSection = page.locator('h2', { hasText: 'Common Icons' }).locator('..')
    await expect(commonSection).toHaveScreenshot(`common-icons-${browserName}.png`, {
      threshold: 0.2 // Allow for browser rendering differences
    })
  })

  test('Navigation icons consistent across browsers', async ({ page, browserName }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const navArea = page.locator('nav, header').first()
    await expect(navArea).toHaveScreenshot(`navigation-${browserName}.png`, {
      threshold: 0.2
    })
  })
})

test.describe('Visual Regression - Icon Sharpness and Quality', () => {
  test('Icons maintain sharpness at different zoom levels', async ({ page }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Test at normal zoom
    const sizeSection = page.locator('h2', { hasText: 'Size Variations' }).locator('..')
    await expect(sizeSection).toHaveScreenshot('icons-normal-zoom.png', {
      threshold: 0.1
    })

    // Test at higher zoom (simulated by larger viewport)
    await page.setViewportSize({ width: 1600, height: 1200 })
    await page.reload()
    await page.waitForLoadState('networkidle')

    await expect(sizeSection).toHaveScreenshot('icons-high-zoom.png', {
      threshold: 0.15 // Allow for scaling differences
    })
  })

  test('SVG icons render crisply', async ({ page }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Focus on a large icon for quality inspection
    const largeIconSection = page.locator('h2', { hasText: 'Size Variations' }).locator('..')
    const largestIcon = largeIconSection.locator('svg').last() // Should be 48px icon

    await expect(largestIcon).toHaveScreenshot('large-icon-quality.png', {
      threshold: 0.05 // Strict for quality check
    })
  })
})

test.describe('Visual Regression - Layout Integration', () => {
  test('Icons integrate properly with surrounding layout', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Test full homepage to ensure icons don't break layout
    await expect(page).toHaveScreenshot('homepage-with-atlas-icons.png', {
      fullPage: true,
      threshold: 0.3 // Allow for dynamic content
    })
  })

  test('Icon spacing and alignment is correct', async ({ page }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Focus on preset components to check alignment
    const presetSection = page.locator('h2', { hasText: 'Preset Components' }).locator('..')
    await expect(presetSection).toHaveScreenshot('icon-alignment-spacing.png', {
      threshold: 0.1
    })
  })
})

test.describe('Visual Regression - Error Handling', () => {
  test('Missing icons render gracefully', async ({ page }) => {
    // Block Atlas icon requests to simulate missing icons
    await page.route('**/*atlas*', route => route.abort())
    
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Page should still look reasonable even without icons
    await expect(page).toHaveScreenshot('page-without-atlas-icons.png', {
      fullPage: true,
      threshold: 0.4 // Large threshold as layout will change
    })
  })

  test('Fallback behavior is visually acceptable', async ({ page }) => {
    // Simulate slow loading
    await page.route('**/*atlas*', route => {
      setTimeout(() => route.continue(), 2000)
    })
    
    await page.goto('/icon-test')
    
    // Take screenshot before icons load
    await expect(page).toHaveScreenshot('page-loading-atlas-icons.png', {
      fullPage: true,
      threshold: 0.4
    })
    
    // Wait for icons to load and take final screenshot
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    await expect(page).toHaveScreenshot('page-after-atlas-icons-load.png', {
      fullPage: true,
      threshold: 0.3
    })
  })
})

test.describe('Visual Regression - Accessibility Visual Indicators', () => {
  test('Focus indicators are visible', async ({ page }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Navigate with keyboard to test focus visibility
    await page.keyboard.press('Tab')
    await page.waitForTimeout(200)

    // Check if focus is visible
    const focusedElement = page.locator(':focus')
    if (await focusedElement.count() > 0) {
      await expect(focusedElement).toHaveScreenshot('focused-icon-element.png', {
        threshold: 0.1
      })
    }
  })

  test('High contrast mode compatibility', async ({ page }) => {
    // Simulate high contrast mode with CSS
    await page.addStyleTag({
      content: `
        @media (prefers-contrast: high) {
          * { 
            filter: contrast(2) !important; 
            border: 1px solid currentColor !important;
          }
        }
      `
    })

    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Test first section in high contrast
    const commonSection = page.locator('h2', { hasText: 'Common Icons' }).locator('..')
    await expect(commonSection).toHaveScreenshot('icons-high-contrast.png', {
      threshold: 0.3 // Large threshold for contrast changes
    })
  })
})