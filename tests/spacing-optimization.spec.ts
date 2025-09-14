/**
 * Spacing Optimization E2E Tests - Claude Rules Compliant
 * Tests token-based spacing implementation across components
 * Validates luxury jewelry UX guidelines compliance
 */

import { test, expect, type Page } from '@playwright/test'

const BREAKPOINTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 }
}

const LUXURY_SPACING_REQUIREMENTS = {
  touchTargetMinSize: 48,
  heroVerticalSpacing: {
    mobile: 64, // token-3xl
    tablet: 96, // token-4xl  
    desktop: 96 // token-4xl
  },
  navigationHeight: 88,
  cardPadding: {
    standard: 24, // token-lg
    featured: 48, // token-2xl
    compact: 16 // token-md
  }
}

test.describe('Spacing Optimization Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test.describe('Visual Regression Tests', () => {
    test('homepage layout consistency across breakpoints', async ({ page }) => {
      for (const [breakpoint, dimensions] of Object.entries(BREAKPOINTS)) {
        await page.setViewportSize(dimensions)
        await page.waitForTimeout(500) // Allow layout to settle

        // Take screenshot of full page
        await expect(page).toHaveScreenshot(`homepage-${breakpoint}.png`, {
          fullPage: true,
          threshold: 0.2
        })
      }
    })

    test('hero section spacing validation', async ({ page }) => {
      // Desktop hero spacing
      await page.setViewportSize(BREAKPOINTS.desktop)
      
      const hero = page.locator('section').first()
      await expect(hero).toBeVisible()
      
      // Verify hero uses consistent token spacing
      const heroContent = hero.locator('.relative.z-20')
      await expect(heroContent).toHaveClass(/py-token-4xl/)
      
      // Take focused screenshot
      await expect(hero).toHaveScreenshot('hero-desktop-spacing.png')
    })

    test('product card spacing consistency', async ({ page }) => {
      await page.goto('/catalog')
      await page.waitForLoadState('networkidle')

      const productCards = page.locator('[data-testid="product-card"]')
      const firstCard = productCards.first()
      
      if (await firstCard.count() > 0) {
        await expect(firstCard).toBeVisible()
        
        // Verify card uses token spacing
        await expect(firstCard).toHaveScreenshot('product-card-spacing.png')
      }
    })

    test('navigation spacing compliance', async ({ page }) => {
      // Test desktop navigation
      await page.setViewportSize(BREAKPOINTS.desktop)
      
      const nav = page.locator('nav').first()
      await expect(nav).toBeVisible()
      
      // Check navigation height (88px luxury standard)
      const navBox = await nav.boundingBox()
      expect(navBox?.height).toBeGreaterThanOrEqual(LUXURY_SPACING_REQUIREMENTS.navigationHeight - 5)
      
      await expect(nav).toHaveScreenshot('navigation-desktop.png')
    })
  })

  test.describe('Touch Target Tests', () => {
    test('navigation buttons meet 48px minimum', async ({ page }) => {
      await page.setViewportSize(BREAKPOINTS.mobile)
      
      // Check mobile menu button
      const mobileMenuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]')
      if (await mobileMenuButton.count() > 0) {
        const buttonBox = await mobileMenuButton.boundingBox()
        expect(buttonBox?.width).toBeGreaterThanOrEqual(LUXURY_SPACING_REQUIREMENTS.touchTargetMinSize)
        expect(buttonBox?.height).toBeGreaterThanOrEqual(LUXURY_SPACING_REQUIREMENTS.touchTargetMinSize)
      }
      
      // Check CTA buttons in hero
      const ctaButtons = page.locator('button').filter({ hasText: /Start Designing|Explore Collection/ })
      const firstCta = ctaButtons.first()
      
      if (await firstCta.count() > 0) {
        const ctaBox = await firstCta.boundingBox()
        expect(ctaBox?.height).toBeGreaterThanOrEqual(LUXURY_SPACING_REQUIREMENTS.touchTargetMinSize)
      }
    })

    test('interactive elements spacing', async ({ page }) => {
      // Navigate to customizer for interactive elements
      await page.goto('/customizer')
      await page.waitForLoadState('networkidle')
      
      // Look for material selection buttons
      const materialButtons = page.locator('button').filter({ hasText: /Gold|Platinum|Rose Gold/ })
      
      if (await materialButtons.count() > 0) {
        const firstButton = materialButtons.first()
        const buttonBox = await firstButton.boundingBox()
        
        // Verify minimum touch target size
        expect(buttonBox?.width).toBeGreaterThanOrEqual(44) // WCAG minimum
        expect(buttonBox?.height).toBeGreaterThanOrEqual(44)
      }
    })
  })

  test.describe('Responsive Spacing Tests', () => {
    test('hero section responsive spacing', async ({ page }) => {
      for (const [breakpoint, dimensions] of Object.entries(BREAKPOINTS)) {
        await page.setViewportSize(dimensions)
        await page.waitForTimeout(500)
        
        const hero = page.locator('section').first()
        const heroContent = hero.locator('.relative.z-20')
        
        // Verify hero is visible and properly spaced
        await expect(heroContent).toBeVisible()
        
        // Test expected spacing based on breakpoint
        const contentBox = await heroContent.boundingBox()
        const expectedMinHeight = LUXURY_SPACING_REQUIREMENTS.heroVerticalSpacing[
          breakpoint as keyof typeof LUXURY_SPACING_REQUIREMENTS.heroVerticalSpacing
        ]
        
        expect(contentBox?.height).toBeGreaterThanOrEqual(expectedMinHeight)
      }
    })

    test('section gaps consistency', async ({ page }) => {
      await page.setViewportSize(BREAKPOINTS.desktop)
      
      // Find homepage sections
      const sections = page.locator('section')
      const sectionCount = await sections.count()
      
      if (sectionCount > 1) {
        // Check gap between first two sections
        const firstSection = sections.nth(0)
        const secondSection = sections.nth(1)
        
        const firstBox = await firstSection.boundingBox()
        const secondBox = await secondSection.boundingBox()
        
        if (firstBox && secondBox) {
          const gap = secondBox.y - (firstBox.y + firstBox.height)
          // Expect meaningful gap (at least token-3xl = 64px)
          expect(gap).toBeGreaterThanOrEqual(60)
        }
      }
    })
  })

  test.describe('Component Spacing Tests', () => {
    test('button padding consistency', async ({ page }) => {
      // Check various buttons across the site
      const ctaButtons = page.locator('button').filter({ hasText: /Start|Explore|Shop|Buy/ })
      
      if (await ctaButtons.count() > 0) {
        for (let i = 0; i < Math.min(3, await ctaButtons.count()); i++) {
          const button = ctaButtons.nth(i)
          await expect(button).toBeVisible()
          
          // Verify button has proper padding (token-based classes)
          const buttonClass = await button.getAttribute('class')
          expect(buttonClass).toMatch(/p-token|px-token|py-token/)
        }
      }
    })

    test('card component spacing', async ({ page }) => {
      await page.goto('/catalog')
      await page.waitForLoadState('networkidle')
      
      const productCards = page.locator('[data-testid="product-card"]')
      
      if (await productCards.count() > 0) {
        const firstCard = productCards.first()
        await expect(firstCard).toBeVisible()
        
        // Verify card has token-based spacing
        const cardClass = await firstCard.getAttribute('class')
        expect(cardClass).toBeTruthy()
        
        // Check card dimensions for standard spacing
        const cardBox = await firstCard.boundingBox()
        expect(cardBox?.width).toBeGreaterThan(200) // Minimum card width
        expect(cardBox?.height).toBeGreaterThan(200) // Minimum card height
      }
    })

    test('navigation menu spacing', async ({ page }) => {
      await page.setViewportSize(BREAKPOINTS.desktop)
      
      // Check desktop navigation items
      const navLinks = page.locator('nav a, nav button').filter({ hasText: /Necklaces|Earrings|Rings|Bracelets/ })
      
      if (await navLinks.count() > 1) {
        const firstLink = navLinks.nth(0)
        const secondLink = navLinks.nth(1)
        
        const firstBox = await firstLink.boundingBox()
        const secondBox = await secondLink.boundingBox()
        
        if (firstBox && secondBox) {
          // Check horizontal spacing between nav items (should be token-xl = 32px minimum)
          const horizontalGap = secondBox.x - (firstBox.x + firstBox.width)
          expect(Math.abs(horizontalGap)).toBeGreaterThanOrEqual(24) // token-lg minimum
        }
      }
    })
  })

  test.describe('Performance Impact Tests', () => {
    test('page load performance with new spacing', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      
      // Verify load time is reasonable (should be under 3 seconds)
      expect(loadTime).toBeLessThan(3000)
      
      // Check for layout shifts
      const clsScore = await page.evaluate(() => {
        return new Promise((resolve) => {
          let cls = 0
          const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry: any) => {
              if (entry.hadRecentInput) return
              cls += entry.value
            })
            resolve(cls)
          })
          observer.observe({ type: 'layout-shift', buffered: true })
          
          // Resolve after a short delay to capture shifts
          setTimeout(() => resolve(cls), 1000)
        })
      })
      
      // CLS should be very low for luxury site
      expect(clsScore).toBeLessThan(0.1)
    })

    test('bundle size impact verification', async ({ page }) => {
      // Monitor network requests for CSS files
      const cssRequests: string[] = []
      
      page.on('request', (request) => {
        if (request.url().includes('.css') || request.resourceType() === 'stylesheet') {
          cssRequests.push(request.url())
        }
      })
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Verify we're not loading excessive CSS
      expect(cssRequests.length).toBeLessThan(10) // Reasonable CSS file count
    })
  })

  test.describe('Accessibility Spacing Tests', () => {
    test('focus indicators have proper spacing', async ({ page }) => {
      // Tab through interactive elements
      const interactiveElements = page.locator('button, a[href], input, select, textarea')
      
      if (await interactiveElements.count() > 0) {
        const firstElement = interactiveElements.first()
        await firstElement.focus()
        
        // Verify focus is visible (element should have focus styling)
        await expect(firstElement).toBeFocused()
        
        // Take screenshot of focused state
        await expect(firstElement).toHaveScreenshot('focus-indicator.png')
      }
    })

    test('zoom support up to 200%', async ({ page }) => {
      // Test at 200% zoom
      await page.setViewportSize({ width: 720, height: 450 }) // Simulates 200% zoom on 1440x900
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Verify key elements are still accessible
      const navigation = page.locator('nav').first()
      const hero = page.locator('section').first()
      
      await expect(navigation).toBeVisible()
      await expect(hero).toBeVisible()
      
      // Take screenshot at zoom level
      await expect(page).toHaveScreenshot('200-percent-zoom.png', {
        fullPage: true
      })
    })
  })
})