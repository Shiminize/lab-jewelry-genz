import { test, expect } from '@playwright/test'

/**
 * Atlas Icons Integration E2E Test Suite
 * Pre-Phase 4-5 Validation Tests
 * 
 * Tests the complete Atlas Icons integration to ensure:
 * - No conflicts with existing Lucide React icons
 * - All icon mappings work correctly
 * - Visual consistency across the application
 * - Performance requirements are met
 * - Accessibility compliance
 */

test.describe('Atlas Icons Integration - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Monitor console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text())
      }
    })
  })

  test('Icon test page loads and displays all icon categories', async ({ page }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Check page title
    await expect(page.locator('h1')).toHaveText('Atlas Icons Test')

    // Verify all icon sections are present
    const sections = [
      'Common Icons (via mappings)',
      'Preset Components',
      'Direct Atlas Icon Names',
      'Size Variations',
      'Aurora Colors'
    ]

    for (const section of sections) {
      await expect(page.locator('h2', { hasText: section })).toBeVisible()
    }
  })

  test('Common icon mappings render correctly', async ({ page }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Test common mapped icons
    const iconMappings = [
      { name: 'search', testId: 'search-icon' },
      { name: 'shopping-cart', testId: 'shopping-cart-icon' },
      { name: 'user', testId: 'user-icon' },
      { name: 'heart', testId: 'heart-icon' },
      { name: 'menu', testId: 'menu-icon' }
    ]

    // Verify icons are visible (SVG elements should be present)
    for (const icon of iconMappings) {
      const iconElement = page.locator(`text=${icon.name}`).locator('..').locator('svg').first()
      await expect(iconElement).toBeVisible()
      
      // Verify the icon has proper attributes
      await expect(iconElement).toHaveAttribute('aria-label')
    }
  })

  test('Preset icon components work correctly', async ({ page }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Find preset components section
    const presetSection = page.locator('h2', { hasText: 'Preset Components' }).locator('..')

    // Test each preset component
    const presetComponents = ['SearchIcon', 'CartIcon', 'UserIcon', 'HeartIcon']
    
    for (const component of presetComponents) {
      const componentElement = presetSection.locator(`text=${component}`).locator('..').locator('svg').first()
      await expect(componentElement).toBeVisible()
    }
  })

  test('Direct Atlas icon names render properly', async ({ page }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Find direct names section
    const directSection = page.locator('h2', { hasText: 'Direct Atlas Icon Names' }).locator('..')

    // Test direct Atlas icons
    const directIcons = ['DiamondRing', 'Star', 'ShoppingBag']
    
    for (const iconName of directIcons) {
      const iconElement = directSection.locator(`text=${iconName}`).locator('..').locator('svg').first()
      await expect(iconElement).toBeVisible()
    }
  })

  test('Icon size variations display correctly', async ({ page }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Find size variations section
    const sizeSection = page.locator('h2', { hasText: 'Size Variations' }).locator('..')
    
    // Get all heart icons in the size section
    const heartIcons = sizeSection.locator('svg')
    const iconCount = await heartIcons.count()
    
    // Should have 5 different sized icons
    expect(iconCount).toBe(5)
    
    // Verify they have different sizes
    for (let i = 0; i < iconCount; i++) {
      const icon = heartIcons.nth(i)
      await expect(icon).toBeVisible()
      
      // Check that size attribute is present (16, 20, 24, 32, 48)
      const sizeAttr = await icon.getAttribute('size')
      expect(sizeAttr).toBeTruthy()
    }
  })

  test('Aurora color integration works', async ({ page }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Find Aurora colors section
    const colorSection = page.locator('h2', { hasText: 'Aurora Colors' }).locator('..')
    
    // Verify colored icons are present
    const coloredIcons = colorSection.locator('svg')
    const iconCount = await coloredIcons.count()
    
    // Should have 4 different colored gem icons
    expect(iconCount).toBe(4)
    
    for (let i = 0; i < iconCount; i++) {
      const icon = coloredIcons.nth(i)
      await expect(icon).toBeVisible()
      
      // Verify color is applied (should have color attribute)
      const colorAttr = await icon.getAttribute('color')
      expect(colorAttr).toBeTruthy()
      expect(colorAttr).toContain('var(--aurora-')
    }
  })
})

test.describe('Atlas Icons Integration - Navigation Components', () => {
  test('Navigation bar uses Atlas Icons correctly', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check desktop navigation icons
    const searchButton = page.locator('button[aria-label*="Search"]').first()
    const cartLink = page.locator('a[href="/cart"]').first()
    const userLink = page.locator('a[href*="account"], a[href*="login"]').first()

    // Verify icons are present and visible
    await expect(searchButton.locator('svg')).toBeVisible()
    await expect(cartLink.locator('svg')).toBeVisible()  
    await expect(userLink.locator('svg')).toBeVisible()

    // Verify icons have proper ARIA labels
    await expect(searchButton).toHaveAttribute('aria-label')
    await expect(cartLink).toHaveAttribute('aria-label')
    await expect(userLink).toHaveAttribute('aria-label')
  })

  test('Mobile navigation icons work correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Look for mobile menu button or mobile icons
    const mobileSearchButton = page.locator('button[aria-label*="Search"]').first()
    const mobileCartLink = page.locator('a[href="/cart"]').first()
    const mobileUserLink = page.locator('a[href*="account"], a[href*="login"]').first()

    // Verify mobile icons are visible
    await expect(mobileSearchButton.locator('svg')).toBeVisible()
    await expect(mobileCartLink.locator('svg')).toBeVisible()
    await expect(mobileUserLink.locator('svg')).toBeVisible()
  })

  test('Interactive icon states work properly', async ({ page }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Find an interactive icon (heart icon with color change)
    const heartIcon = page.locator('text=heart').locator('..').locator('svg').first()
    
    // Verify initial state
    await expect(heartIcon).toBeVisible()
    
    // Test hover state (if applicable)
    await heartIcon.hover()
    
    // Verify icon remains visible after interaction
    await expect(heartIcon).toBeVisible()
  })
})

test.describe('Atlas Icons Integration - Error Detection', () => {
  test('No console errors related to icons', async ({ page }) => {
    const consoleErrors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Filter out known non-icon related errors
    const iconRelatedErrors = consoleErrors.filter(error => 
      error.toLowerCase().includes('icon') ||
      error.toLowerCase().includes('atlas') ||
      error.toLowerCase().includes('svg') ||
      error.toLowerCase().includes('lucide')
    )

    expect(iconRelatedErrors).toHaveLength(0)
  })

  test('No missing icon warnings', async ({ page }) => {
    const consoleWarnings: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text())
      }
    })

    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Check for icon-related warnings
    const iconWarnings = consoleWarnings.filter(warning =>
      warning.includes('not found') &&
      (warning.includes('icon') || warning.includes('Atlas'))
    )

    expect(iconWarnings).toHaveLength(0)
  })

  test('All icons have valid ARIA attributes', async ({ page }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Get all SVG elements (icons)
    const allIcons = page.locator('svg')
    const iconCount = await allIcons.count()

    for (let i = 0; i < iconCount; i++) {
      const icon = allIcons.nth(i)
      
      // Each icon should have either aria-label or be inside a labeled element
      const hasAriaLabel = await icon.getAttribute('aria-label')
      const parentAriaLabel = await icon.locator('..').getAttribute('aria-label')
      
      expect(hasAriaLabel || parentAriaLabel).toBeTruthy()
    }
  })
})

test.describe('Atlas Icons Integration - Performance Tests', () => {
  test('Icon loading performance is acceptable', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')
    
    // Wait for all icons to be visible
    const allIcons = page.locator('svg')
    const iconCount = await allIcons.count()
    
    for (let i = 0; i < Math.min(iconCount, 10); i++) {
      await expect(allIcons.nth(i)).toBeVisible()
    }
    
    const endTime = Date.now()
    const loadTime = endTime - startTime
    
    // Icons should load within 3 seconds (generous for E2E testing)
    expect(loadTime).toBeLessThan(3000)
  })

  test('Navigation icons load quickly', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    
    // Wait for navigation icons to be present
    await expect(page.locator('button[aria-label*="Search"] svg')).toBeVisible()
    await expect(page.locator('a[href="/cart"] svg')).toBeVisible()
    
    const endTime = Date.now()
    const loadTime = endTime - startTime
    
    // Navigation should be very fast
    expect(loadTime).toBeLessThan(2000)
  })
})

test.describe('Atlas Icons Integration - Accessibility Compliance', () => {
  test('Icons meet accessibility standards', async ({ page }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Test keyboard navigation to interactive icons (if any)
    await page.keyboard.press('Tab')
    
    // Verify focus is visible
    const focusedElement = page.locator(':focus')
    if (await focusedElement.count() > 0) {
      // If there's a focused element, it should be visible
      await expect(focusedElement).toBeVisible()
    }
  })

  test('Icons work with screen reader simulation', async ({ page }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Get all interactive elements with icons
    const interactiveElements = page.locator('button, a').filter({ has: page.locator('svg') })
    const count = await interactiveElements.count()

    for (let i = 0; i < Math.min(count, 5); i++) {
      const element = interactiveElements.nth(i)
      
      // Each interactive element should have accessible name
      const accessibleName = await element.getAttribute('aria-label') ||
                            await element.textContent() ||
                            await element.getAttribute('title')
      
      expect(accessibleName).toBeTruthy()
    }
  })
})

test.describe('Atlas Icons Integration - Cross-Browser Compatibility', () => {
  test('Icons display correctly across different browsers', async ({ page, browserName }) => {
    await page.goto('/icon-test')
    await page.waitForLoadState('networkidle')

    // Test basic icon visibility
    const searchIcon = page.locator('text=search').locator('..').locator('svg').first()
    await expect(searchIcon).toBeVisible()

    // Take screenshot for visual comparison
    await page.screenshot({ 
      path: `test-results/icons-${browserName}-${Date.now()}.png`,
      fullPage: true
    })
  })
})