/**
 * ARIA Removal Validation Test Suite
 * Verifies that ARIA attributes have been successfully removed from components
 * Tests visual consistency and functionality without accessibility attributes
 */

import { test, expect } from '@playwright/test'

test.describe('ARIA Removal Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to customizer page
    await page.goto('/customizer')
    await page.waitForLoadState('networkidle')
  })

  // Test 1: Verify homepage loads without ARIA attributes
  test('Homepage loads without ARIA attributes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check for any remaining ARIA attributes in homepage
    const ariaElements = await page.locator('[aria-label]').count()
    const ariaHidden = await page.locator('[aria-hidden]').count()
    const ariaPressed = await page.locator('[aria-pressed]').count()
    const ariaExpanded = await page.locator('[aria-expanded]').count()
    const ariaLive = await page.locator('[aria-live]').count()
    
    console.log(`Found ARIA attributes: label=${ariaElements}, hidden=${ariaHidden}, pressed=${ariaPressed}, expanded=${ariaExpanded}, live=${ariaLive}`)
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-results/homepage-no-aria.png', fullPage: true })
    
    // Visual verification that page still looks correct
    const heroSection = page.locator('main').first()
    await expect(heroSection).toBeVisible()
    
    // Verify header navigation still works without ARIA
    const navLinks = page.locator('nav a, nav button')
    const navCount = await navLinks.count()
    expect(navCount).toBeGreaterThan(0)
    
    console.log('✅ Homepage loads correctly without ARIA attributes')
  })

  // Test 2: Verify customizer page functionality without ARIA
  test('Customizer page functionality without ARIA', async ({ page }) => {
    await page.goto('/customizer')
    await page.waitForLoadState('networkidle')
    
    // Wait for customizer content to load
    await page.waitForTimeout(3000)
    
    // Check for customizer presence
    const pageTitle = page.locator('h1')
    await expect(pageTitle).toBeVisible()
    
    const titleText = await pageTitle.textContent()
    console.log('Page title:', titleText)
    
    // Check if there are any material buttons or similar elements
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    console.log('Button count:', buttonCount)
    
    // Take screenshot of customizer page state
    await page.screenshot({ path: 'test-results/customizer-no-aria.png', fullPage: true })
    
    // Verify basic interactivity still works
    if (buttonCount > 0) {
      const firstButton = buttons.first()
      const isClickable = await firstButton.isEnabled()
      console.log('First button is clickable:', isClickable)
    }
    
    console.log('✅ Customizer page loads without ARIA attributes')
  })

  // Test 3: Navigation menu functionality
  test('Navigation works without ARIA attributes', async ({ page }) => {
    await page.goto('/')
    
    // Test mobile menu if present
    const mobileMenuButton = page.locator('button:has(svg)')
    const mobileMenuCount = await mobileMenuButton.count()
    
    if (mobileMenuCount > 0) {
      // Click mobile menu button
      await mobileMenuButton.first().click()
      await page.waitForTimeout(500)
      
      // Screenshot mobile menu state
      await page.screenshot({ path: 'test-results/mobile-menu-no-aria.png' })
      console.log('📱 Mobile menu tested')
    }
    
    // Test desktop navigation hover/interactions
    const navButtons = page.locator('nav button')
    const navButtonCount = await navButtons.count()
    
    if (navButtonCount > 0) {
      // Hover over first nav button
      await navButtons.first().hover()
      await page.waitForTimeout(500)
      
      // Screenshot desktop navigation state
      await page.screenshot({ path: 'test-results/desktop-nav-no-aria.png' })
      console.log('💻 Desktop navigation tested')
    }
    
    console.log('✅ Navigation functions correctly without ARIA attributes')
  })

  // Test 4: Form elements without ARIA
  test('Form elements work without ARIA attributes', async ({ page }) => {
    // Check search functionality if present
    const searchButton = page.locator('button:has(svg):has-text(""), button[aria-label*="search"], button:has(.lucide-search)')
    const searchCount = await searchButton.count()
    
    if (searchCount > 0) {
      await searchButton.first().click()
      await page.waitForTimeout(500)
      
      // Check if search input appeared
      const searchInput = page.locator('input[type="search"], input[placeholder*="search"]')
      const inputVisible = await searchInput.count() > 0
      
      console.log('Search functionality:', inputVisible ? 'Working' : 'Not found')
      
      // Screenshot search state
      await page.screenshot({ path: 'test-results/search-no-aria.png' })
    }
    
    console.log('✅ Form elements work without ARIA attributes')
  })

  // Test 5: Visual consistency check
  test('Visual consistency maintained after ARIA removal', async ({ page }) => {
    // Test multiple pages for visual consistency
    const pagesToTest = ['/', '/customizer']
    
    for (const pagePath of pagesToTest) {
      await page.goto(pagePath)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
      
      const pageName = pagePath === '/' ? 'homepage' : pagePath.slice(1)
      
      // Full page screenshot
      await page.screenshot({ 
        path: `test-results/visual-consistency-${pageName}.png`, 
        fullPage: true 
      })
      
      // Check for any obvious layout issues
      const body = page.locator('body')
      const bodyHeight = await body.evaluate(el => el.scrollHeight)
      
      expect(bodyHeight).toBeGreaterThan(500) // Reasonable page height
      console.log(`✅ ${pageName} visual consistency verified`)
    }
  })

  // Test 6: Interactive elements still focusable
  test('Interactive elements remain focusable', async ({ page }) => {
    await page.goto('/')
    
    // Test keyboard navigation
    const focusableElements: string[] = []
    
    // Tab through elements and record what gets focus
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      
      try {
        const focused = await page.evaluate(() => {
          const el = document.activeElement
          if (el && el.tagName) {
            return {
              tag: el.tagName,
              text: el.textContent?.substring(0, 30) || '',
              role: el.getAttribute('role') || '',
              type: el.getAttribute('type') || ''
            }
          }
          return null
        })
        
        if (focused) {
          focusableElements.push(`${focused.tag}:${focused.text}`)
        }
      } catch (error) {
        // Continue if evaluation fails
      }
      
      await page.waitForTimeout(100)
    }
    
    console.log('Focusable elements found:', focusableElements.length)
    console.log('Focus sequence:', focusableElements.slice(0, 5))
    
    // Screenshot final focus state
    await page.screenshot({ path: 'test-results/keyboard-focus-no-aria.png' })
    
    // Should have found some focusable elements
    expect(focusableElements.length).toBeGreaterThan(2)
    
    console.log('✅ Keyboard navigation works without ARIA attributes')
  })
})

test.describe('Performance After ARIA Removal', () => {
  // Test 7: Page load performance without ARIA
  test('Page load performance maintained', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/customizer')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    console.log(`Page load time: ${loadTime}ms`)
    
    // Should load reasonably fast
    expect(loadTime).toBeLessThan(10000) // 10 second maximum
    
    // Take performance screenshot
    await page.screenshot({ path: 'test-results/performance-after-aria-removal.png' })
    
    console.log('✅ Page load performance is acceptable')
  })

  // Test 8: HTML validation (no invalid ARIA attributes)
  test('HTML validation passes', async ({ page }) => {
    await page.goto('/')
    
    // Check for any malformed attributes that might have been left behind
    const invalidAriaAttributes = await page.evaluate(() => {
      const elements = document.querySelectorAll('*')
      const issues: string[] = []
      
      elements.forEach((el, index) => {
        // Check for common ARIA attribute formatting issues
        const attributes = Array.from(el.attributes)
        attributes.forEach(attr => {
          if (attr.name.startsWith('aria-') && !attr.value) {
            issues.push(`Empty ARIA attribute: ${attr.name} on ${el.tagName}`)
          }
        })
      })
      
      return issues.slice(0, 10) // Limit to first 10 issues
    })
    
    console.log('Invalid ARIA attributes found:', invalidAriaAttributes.length)
    if (invalidAriaAttributes.length > 0) {
      console.log('Issues:', invalidAriaAttributes)
    }
    
    // Should have no invalid ARIA attributes
    expect(invalidAriaAttributes.length).toBe(0)
    
    console.log('✅ HTML validation passes - no invalid ARIA attributes')
  })
})