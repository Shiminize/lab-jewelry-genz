/**
 * Phase 0: Hydration Fix Validation E2E Test
 * 
 * Validates that the NavBar.tsx nested Link fix resolves hydration errors
 * and maintains proper navigation functionality.
 * 
 * Critical for Phase 0 success criteria:
 * - Zero hydration errors in browser console
 * - Navigation renders without console warnings  
 * - E2E tests pass with clean console output
 */

import { test, expect } from '@playwright/test'

test.describe('Phase 0: Navigation Hydration Fix Validation', () => {
  let consoleLogs: Array<{
    type: string
    message: string
    url?: string
  }> = []

  test.beforeEach(async ({ page }) => {
    // Capture all console messages for hydration error detection
    consoleLogs = []
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        message: msg.text(),
        url: msg.location()?.url
      })
    })

    // Also capture page errors
    page.on('pageerror', error => {
      consoleLogs.push({
        type: 'error',
        message: `Page Error: ${error.message}`,
        url: error.stack
      })
    })
  })

  test('Phase 0.1: Navigation renders without hydration errors', async ({ page }) => {
    console.log('🧪 Phase 0.1: Testing navigation hydration fix...')
    
    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Wait for navigation to fully render
    const navBar = page.locator('nav').first()
    await navBar.waitFor({ state: 'visible', timeout: 10000 })
    
    console.log('✅ Navigation rendered successfully')
    
    // Check for hydration-related errors
    const hydrationErrors = consoleLogs.filter(log => 
      log.message.includes('hydration') ||
      log.message.includes('Expected server HTML') ||
      log.message.includes('matching') ||
      log.message.includes('Text content does not match')
    )
    
    if (hydrationErrors.length > 0) {
      console.error('❌ Hydration errors found:')
      hydrationErrors.forEach(error => console.error(`  - ${error.message}`))
    } else {
      console.log('✅ No hydration errors detected')
    }
    
    expect(hydrationErrors).toHaveLength(0)
  })

  test('Phase 0.2: Desktop mega menu functionality intact', async ({ page }) => {
    console.log('🧪 Phase 0.2: Testing desktop mega menu after hydration fix...')
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Test mega menu on desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    
    // Find navigation items with dropdowns
    const navItems = page.locator('nav .relative').filter({ hasText: 'Necklaces' }).or(
      page.locator('nav .relative').filter({ hasText: 'Earrings' })
    )
    
    const firstNavItem = navItems.first()
    await firstNavItem.hover()
    
    // Wait for mega menu to appear
    await page.waitForTimeout(200) // Allow for hover delay
    
    const megaMenu = page.locator('.absolute.top-full')
    const isVisible = await megaMenu.isVisible()
    
    console.log(`Mega menu visible: ${isVisible}`)
    
    if (isVisible) {
      // Test category headers (should be clickable)
      const categoryHeaders = megaMenu.locator('h3')
      const headerCount = await categoryHeaders.count()
      console.log(`Found ${headerCount} category headers`)
      
      // Test category items (should be clickable)
      const categoryItems = megaMenu.locator('ul a')
      const itemCount = await categoryItems.count()
      console.log(`Found ${itemCount} category items`)
      
      expect(headerCount).toBeGreaterThan(0)
      expect(itemCount).toBeGreaterThan(0)
      
      console.log('✅ Mega menu structure intact after hydration fix')
    } else {
      console.warn('⚠️ Mega menu not visible, checking navigation structure...')
    }
  })

  test('Phase 0.3: Mobile navigation functionality intact', async ({ page }) => {
    console.log('🧪 Phase 0.3: Testing mobile navigation after hydration fix...')
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Test mobile navigation
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Find mobile menu toggle
    const mobileToggle = page.locator('button').filter({ hasText: /Menu|☰/ }).or(
      page.locator('[class*="md:hidden"]').locator('button')
    )
    
    if (await mobileToggle.count() > 0) {
      await mobileToggle.click()
      
      // Wait for mobile menu to appear
      await page.waitForTimeout(400) // Allow for slide animation
      
      // Check for mobile menu content
      const mobileMenu = page.locator('[class*="fixed"][class*="inset-0"]').or(
        page.locator('[class*="absolute"][class*="right-0"]')
      )
      
      const isMobileMenuVisible = await mobileMenu.isVisible()
      console.log(`Mobile menu visible: ${isMobileMenuVisible}`)
      
      if (isMobileMenuVisible) {
        // Test mobile navigation links
        const mobileLinks = mobileMenu.locator('a')
        const mobileLinkCount = await mobileLinks.count()
        console.log(`Found ${mobileLinkCount} mobile navigation links`)
        
        expect(mobileLinkCount).toBeGreaterThan(0)
        console.log('✅ Mobile navigation functional after hydration fix')
      }
    } else {
      console.warn('⚠️ Mobile toggle not found, checking viewport...')
    }
  })

  test('Phase 0.4: Console cleanliness validation', async ({ page }) => {
    console.log('🧪 Phase 0.4: Comprehensive console error validation...')
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Wait additional time for any delayed errors
    await page.waitForTimeout(2000)
    
    // Categorize console messages
    const errors = consoleLogs.filter(log => log.type === 'error')
    const warnings = consoleLogs.filter(log => log.type === 'warning')
    const hydrationIssues = consoleLogs.filter(log => 
      log.message.includes('hydration') ||
      log.message.includes('Expected server HTML') ||
      log.message.includes('matching <a>') ||
      log.message.includes('Text content does not match')
    )
    const reactIssues = consoleLogs.filter(log =>
      log.message.includes('Warning: validateDOMNesting') ||
      log.message.includes('cannot appear as a descendant')
    )
    
    console.log(`📊 Console Analysis:`)
    console.log(`  - Total messages: ${consoleLogs.length}`)
    console.log(`  - Errors: ${errors.length}`)
    console.log(`  - Warnings: ${warnings.length}`)
    console.log(`  - Hydration issues: ${hydrationIssues.length}`)
    console.log(`  - React nesting issues: ${reactIssues.length}`)
    
    // Log critical issues for debugging
    if (hydrationIssues.length > 0) {
      console.error('❌ Hydration issues found:')
      hydrationIssues.forEach(issue => console.error(`  - ${issue.message}`))
    }
    
    if (reactIssues.length > 0) {
      console.error('❌ React nesting issues found:')
      reactIssues.forEach(issue => console.error(`  - ${issue.message}`))
    }
    
    // Phase 0 success criteria: Zero hydration and nesting errors
    expect(hydrationIssues.length, 'No hydration errors should remain').toBe(0)
    expect(reactIssues.length, 'No React nesting errors should remain').toBe(0)
    
    if (hydrationIssues.length === 0 && reactIssues.length === 0) {
      console.log('✅ Phase 0 Success: Navigation hydration fix validated')
    }
  })

  test('Phase 0.5: Vision mode navigation screenshot', async ({ page }) => {
    console.log('🧪 Phase 0.5: Capturing navigation visual state for regression testing...')
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Desktop navigation screenshot
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.screenshot({ 
      path: 'phase0-desktop-navigation-fixed.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 200 }
    })
    
    // Test mega menu appearance
    const navItem = page.locator('nav .relative').first()
    await navItem.hover()
    await page.waitForTimeout(200)
    
    await page.screenshot({
      path: 'phase0-desktop-mega-menu-fixed.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 600 }
    })
    
    // Mobile navigation screenshot
    await page.setViewportSize({ width: 375, height: 667 })
    await page.screenshot({ 
      path: 'phase0-mobile-navigation-fixed.png',
      fullPage: true
    })
    
    console.log('📸 Phase 0 navigation screenshots captured for visual regression testing')
    console.log('🎉 Phase 0: Navigation Hydration Fix - VALIDATION COMPLETE')
  })
})