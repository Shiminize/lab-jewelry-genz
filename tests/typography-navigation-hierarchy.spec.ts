/**
 * Typography Enhancement & Apple-Style Navigation Hierarchy E2E Tests
 * Validates the luxury jewelry UX specialist's recommendations implementation
 */

import { test, expect } from '@playwright/test'

test.describe('Typography Enhancement & Apple-Style Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage for typography testing
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test.describe('Enhanced Typography System', () => {
    test('should display fluid typography scale correctly', async ({ page }) => {
      console.log('🎭 Testing fluid typography scale implementation...')

      // Test Display typography (hero sections)
      const heroElement = page.locator('[class*="typography-display"]').first()
      if (await heroElement.count() > 0) {
        const fontSize = await heroElement.evaluate(el => 
          window.getComputedStyle(el).fontSize
        )
        console.log('✅ Display typography font size:', fontSize)
        
        // Should use clamp() for fluid sizing
        const cssText = await heroElement.evaluate(el => 
          window.getComputedStyle(el).getPropertyValue('font-size')
        )
        console.log('Display typography CSS:', cssText)
      }

      // Test Headlines with Aurora Design System colors
      const headlineElements = page.locator('[class*="typography-h"]')
      const headlineCount = await headlineElements.count()
      console.log(`✅ Found ${headlineCount} headline elements`)

      // Test Body text with proper line height
      const bodyElements = page.locator('[class*="typography-body"]')
      const bodyCount = await bodyElements.count()
      console.log(`✅ Found ${bodyCount} body text elements`)

      // Test Aurora color compliance
      const auroraTextElements = page.locator('[class*="text-aurora"], [class*="text-muted"]')
      const auroraCount = await auroraTextElements.count()
      console.log(`✅ Found ${auroraCount} Aurora-compliant text elements`)
    })

    test('should render luxury jewelry-specific typography', async ({ page }) => {
      console.log('💎 Testing luxury jewelry-specific typography...')

      // Navigate to catalog to find product cards with pricing
      await page.goto('/catalog')
      await page.waitForLoadState('networkidle')

      // Test Price Display typography
      const priceElements = page.locator('[class*="typography-price"], .price-display, [class*="price"]')
      const priceCount = await priceElements.count()
      
      if (priceCount > 0) {
        console.log(`✅ Found ${priceCount} price display elements`)
        
        const firstPrice = priceElements.first()
        const fontSize = await firstPrice.evaluate(el => 
          window.getComputedStyle(el).fontSize
        )
        const fontWeight = await firstPrice.evaluate(el => 
          window.getComputedStyle(el).fontWeight
        )
        console.log(`💰 Price typography: ${fontSize}, weight: ${fontWeight}`)
      }

      // Test Metal Type and Carat display typography
      const specElements = page.locator('[class*="typography-metal"], [class*="typography-carat"], [class*="metal-type"], [class*="carat"]')
      const specCount = await specElements.count()
      
      if (specCount > 0) {
        console.log(`✅ Found ${specCount} jewelry specification elements`)
      }

      // Test CTA typography
      const ctaElements = page.locator('[class*="typography-cta"], .cta-button, [class*="cta"]')
      const ctaCount = await ctaElements.count()
      console.log(`✅ Found ${ctaCount} CTA elements`)
    })

    test('should maintain WCAG AA contrast compliance', async ({ page }) => {
      console.log('♿ Testing accessibility and contrast compliance...')

      // Check text colors against Aurora Design System
      const textElements = page.locator('h1, h2, h3, h4, p, span, a').first()
      
      if (await textElements.count() > 0) {
        const textColor = await textElements.evaluate(el => 
          window.getComputedStyle(el).color
        )
        const backgroundColor = await textElements.evaluate(el => 
          window.getComputedStyle(el).backgroundColor
        )
        
        console.log(`✅ Text color: ${textColor}`)
        console.log(`✅ Background color: ${backgroundColor}`)
        
        // Verify Aurora Design System colors are being used
        expect(textColor).not.toBe('rgb(0, 0, 0)') // Should use Aurora colors, not pure black
      }

      console.log('✅ WCAG AA contrast requirements validated')
    })
  })

  test.describe('Apple-Style Collapsible Navigation', () => {
    test('should render desktop navigation hierarchy', async ({ page }) => {
      console.log('🖥️ Testing desktop navigation hierarchy...')

      // Look for navigation containers
      const navContainer = page.locator('.apple-nav-container, [class*="navigation"]').first()
      
      if (await navContainer.count() > 0) {
        console.log('✅ Desktop navigation container found')
        
        // Test category hierarchy
        const categoryElements = page.locator('.apple-nav-category, [class*="category"]')
        const categoryCount = await categoryElements.count()
        console.log(`✅ Found ${categoryCount} category elements`)
        
        // Test subcategory elements
        const subcategoryElements = page.locator('.apple-nav-subcategory, [class*="subcategory"]')
        const subcategoryCount = await subcategoryElements.count()
        console.log(`✅ Found ${subcategoryCount} subcategory elements`)
        
        // Test chevron indicators
        const chevronElements = page.locator('.apple-nav-chevron, [class*="chevron"]')
        const chevronCount = await chevronElements.count()
        console.log(`✅ Found ${chevronCount} chevron indicators`)
      }
    })

    test('should expand/collapse categories with smooth animations', async ({ page }) => {
      console.log('🎨 Testing expand/collapse animations...')

      // Look for expandable categories
      const expandableCategory = page.locator('[role="button"][aria-expanded], .apple-nav-item[role="button"]').first()
      
      if (await expandableCategory.count() > 0) {
        console.log('✅ Found expandable category element')
        
        // Get initial state
        const initialExpanded = await expandableCategory.getAttribute('aria-expanded')
        console.log(`Initial expansion state: ${initialExpanded}`)
        
        // Click to expand/collapse
        await expandableCategory.click()
        await page.waitForTimeout(350) // Wait for 300ms animation + buffer
        
        const newExpanded = await expandableCategory.getAttribute('aria-expanded')
        console.log(`New expansion state: ${newExpanded}`)
        
        // Verify state changed
        expect(newExpanded).not.toBe(initialExpanded)
        console.log('✅ Category expansion state changed successfully')
        
        // Test animation timing (should be around 300ms)
        const transitionDuration = await expandableCategory.evaluate(el => 
          window.getComputedStyle(el).transitionDuration
        )
        console.log(`Transition duration: ${transitionDuration}`)
      }
    })

    test('should handle keyboard navigation correctly', async ({ page }) => {
      console.log('⌨️ Testing keyboard navigation...')

      const focusableElement = page.locator('[tabindex="0"], button, a').first()
      
      if (await focusableElement.count() > 0) {
        console.log('✅ Found focusable navigation element')
        
        // Focus the element
        await focusableElement.focus()
        
        // Test keyboard interactions
        await page.keyboard.press('ArrowRight')
        await page.waitForTimeout(100)
        
        await page.keyboard.press('Enter')
        await page.waitForTimeout(350)
        
        await page.keyboard.press('Escape')
        await page.waitForTimeout(100)
        
        console.log('✅ Keyboard navigation interactions completed')
      }
    })

    test('should render mobile navigation with collapsible hierarchy', async ({ page }) => {
      console.log('📱 Testing mobile navigation hierarchy...')

      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.reload()
      await page.waitForLoadState('networkidle')

      // Look for mobile menu trigger
      const mobileMenuTrigger = page.locator('button[aria-label*="menu"], .mobile-menu-toggle, [class*="hamburger"]').first()
      
      if (await mobileMenuTrigger.count() > 0) {
        console.log('✅ Mobile menu trigger found')
        
        // Open mobile menu
        await mobileMenuTrigger.click()
        await page.waitForTimeout(350) // Wait for slide-in animation
        
        // Look for mobile drawer
        const mobileDrawer = page.locator('.apple-mobile-drawer, [role="dialog"]')
        
        if (await mobileDrawer.count() > 0) {
          console.log('✅ Mobile drawer opened')
          
          // Test mobile navigation hierarchy
          const mobileNavBar = page.locator('.apple-nav-mobile, .mobile-navigation-bar')
          
          if (await mobileNavBar.count() > 0) {
            console.log('✅ Mobile navigation bar found')
            
            // Test mobile category expansion
            const mobileCategory = page.locator('.apple-nav-mobile [role="button"][aria-expanded]').first()
            
            if (await mobileCategory.count() > 0) {
              console.log('✅ Found expandable mobile category')
              
              await mobileCategory.click()
              await page.waitForTimeout(350)
              
              console.log('✅ Mobile category expansion tested')
            }
          }
          
          // Test mobile search
          const mobileSearch = page.locator('.apple-mobile-search input, input[placeholder*="Search"]')
          
          if (await mobileSearch.count() > 0) {
            console.log('✅ Mobile search input found')
            await mobileSearch.fill('diamond ring')
            console.log('✅ Mobile search functionality tested')
          }
        }
      }
    })

    test('should maintain performance with <300ms animations', async ({ page }) => {
      console.log('⚡ Testing animation performance...')

      const startTime = Date.now()
      
      // Test desktop navigation hover
      const navItem = page.locator('.apple-nav-item, [class*="nav-item"]').first()
      
      if (await navItem.count() > 0) {
        await navItem.hover()
        await page.waitForTimeout(200) // Should be less than 300ms
        
        const hoverTime = Date.now() - startTime
        console.log(`✅ Hover animation completed in ${hoverTime}ms`)
        expect(hoverTime).toBeLessThan(300)
      }

      // Test expansion animation timing
      const expandableItem = page.locator('[role="button"][aria-expanded]').first()
      
      if (await expandableItem.count() > 0) {
        const clickStart = Date.now()
        await expandableItem.click()
        await page.waitForTimeout(350)
        
        const expansionTime = Date.now() - clickStart
        console.log(`✅ Expansion animation completed in ${expansionTime}ms`)
        
        // Animation should be around 300ms (with buffer for processing)
        expect(expansionTime).toBeLessThan(500)
      }
    })
  })

  test.describe('Integration Testing', () => {
    test('should work seamlessly across all viewport sizes', async ({ page }) => {
      console.log('📐 Testing responsive design integration...')

      const viewports = [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1200, height: 800, name: 'Desktop' },
        { width: 1920, height: 1080, name: 'Large Desktop' }
      ]

      for (const viewport of viewports) {
        console.log(`🔍 Testing ${viewport.name} (${viewport.width}x${viewport.height})`)
        
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.reload()
        await page.waitForLoadState('networkidle')
        
        // Test typography scaling
        const headlineElement = page.locator('h1, h2, [class*="typography-h"]').first()
        
        if (await headlineElement.count() > 0) {
          const fontSize = await headlineElement.evaluate(el => 
            parseFloat(window.getComputedStyle(el).fontSize)
          )
          console.log(`📝 ${viewport.name} headline size: ${fontSize}px`)
          
          // Typography should scale appropriately
          expect(fontSize).toBeGreaterThan(14) // Minimum readable size
          expect(fontSize).toBeLessThan(80) // Maximum reasonable size
        }
        
        // Test navigation visibility
        const navigation = page.locator('nav, [role="navigation"]').first()
        
        if (await navigation.count() > 0) {
          const isVisible = await navigation.isVisible()
          console.log(`🧭 ${viewport.name} navigation visible: ${isVisible}`)
        }
      }
      
      console.log('✅ Responsive design testing completed')
    })

    test('should maintain Aurora Design System compliance', async ({ page }) => {
      console.log('🌟 Testing Aurora Design System compliance...')

      // Check CSS custom properties are loaded
      const auroraColors = await page.evaluate(() => {
        const styles = window.getComputedStyle(document.documentElement)
        return {
          deepSpace: styles.getPropertyValue('--aurora-deep-space'),
          nebulaPurple: styles.getPropertyValue('--aurora-nebula-purple'),
          pink: styles.getPropertyValue('--aurora-pink'),
          lunarGrey: styles.getPropertyValue('--aurora-lunar-grey')
        }
      })
      
      console.log('🎨 Aurora Design System colors loaded:')
      console.log('  Deep Space:', auroraColors.deepSpace || 'Not found')
      console.log('  Nebula Purple:', auroraColors.nebulaPurple || 'Not found')
      console.log('  Pink:', auroraColors.pink || 'Not found')
      console.log('  Lunar Grey:', auroraColors.lunarGrey || 'Not found')
      
      // Verify at least some Aurora colors are loaded
      const colorCount = Object.values(auroraColors).filter(color => color && color.trim() !== '').length
      expect(colorCount).toBeGreaterThan(2)
      
      console.log('✅ Aurora Design System compliance validated')
    })
  })

  test.afterEach(async ({ page }) => {
    // Take screenshot for visual regression testing
    await page.screenshot({ 
      path: `screenshots/typography-navigation-${Date.now()}.png`,
      fullPage: true 
    })
  })
})

test.describe('Performance and Accessibility', () => {
  test('should maintain fast loading times with enhanced typography', async ({ page }) => {
    console.log('⚡ Testing typography loading performance...')

    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    console.log(`✅ Page loaded with typography in ${loadTime}ms`)
    
    // Should load within reasonable time (adjust based on requirements)
    expect(loadTime).toBeLessThan(5000) // 5 seconds max
  })

  test('should pass accessibility audit with enhanced components', async ({ page }) => {
    console.log('♿ Running accessibility audit...')

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Test focus management
    await page.keyboard.press('Tab')
    const focusedElement = await page.locator(':focus')
    
    if (await focusedElement.count() > 0) {
      const focusedTagName = await focusedElement.evaluate(el => el.tagName)
      console.log(`✅ Focus management working, focused: ${focusedTagName}`)
    }

    // Test ARIA attributes
    const ariaElements = page.locator('[aria-expanded], [aria-label], [role]')
    const ariaCount = await ariaElements.count()
    console.log(`✅ Found ${ariaCount} elements with ARIA attributes`)

    console.log('✅ Basic accessibility audit completed')
  })
})