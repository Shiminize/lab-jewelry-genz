import { test, expect } from '@playwright/test'

test.describe('Navigation Vision Mode Comprehensive Audit', () => {
  test('Complete Navigation System E2E Test', async ({ page }) => {
    console.log('🎭 VISION MODE: Comprehensive Navigation Audit Starting...')
    console.log('=' .repeat(60))
    
    // Navigate to the site
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Phase 1: Desktop Navigation Testing
    console.log('\n📊 PHASE 1: Desktop Navigation Testing')
    console.log('-'.repeat(40))
    
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    console.log('✅ Desktop viewport set (1920x1080)')
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'vision-mode-1-desktop-initial.png', 
      fullPage: false 
    })
    console.log('📸 Screenshot: vision-mode-1-desktop-initial.png')
    
    // Check navigation bar visibility
    const navBar = page.locator('nav').first()
    const isNavVisible = await navBar.isVisible()
    console.log(`Navigation bar visible: ${isNavVisible ? '✅' : '❌'}`)
    
    // Check for navigation items
    const navItems = page.locator('[data-testid*="-nav-item"]')
    const navItemCount = await navItems.count()
    console.log(`Navigation items found: ${navItemCount}`)
    
    // Test hover on Rings navigation item
    console.log('\n🔍 Testing dropdown hover functionality...')
    const ringsNavItem = page.locator('[data-testid="rings-nav-item"]').first()
    
    if (await ringsNavItem.isVisible()) {
      console.log('Found Rings navigation item')
      
      // Hover and wait for dropdown
      await ringsNavItem.hover()
      console.log('Hovering over Rings...')
      await page.waitForTimeout(1000) // Wait for dropdown animation
      
      // Take screenshot during hover
      await page.screenshot({ 
        path: 'vision-mode-2-desktop-hover.png', 
        fullPage: false 
      })
      console.log('📸 Screenshot: vision-mode-2-desktop-hover.png')
      
      // Check for dropdown portal
      const dropdownPortal = page.locator('#dropdown-portal-root')
      const portalExists = await dropdownPortal.count() > 0
      console.log(`Dropdown portal exists: ${portalExists ? '✅' : '❌'}`)
      
      if (portalExists) {
        // Check portal properties
        const portalStyle = await dropdownPortal.getAttribute('style')
        console.log('Portal style properties:')
        if (portalStyle) {
          console.log(`  - pointer-events: ${portalStyle.includes('pointer-events: auto') ? '✅ auto' : '❌ not auto'}`)
          console.log(`  - z-index: ${portalStyle.includes('z-index') ? portalStyle.match(/z-index:\s*(\d+)/)?.[1] || 'unknown' : 'not set'}`)
        }
      }
      
      // Check for mega menu content
      const megaMenu = page.locator('[data-testid="mega-menu"]').first()
      const megaMenuVisible = await megaMenu.isVisible()
      console.log(`Mega menu visible: ${megaMenuVisible ? '✅' : '❌'}`)
      
      if (megaMenuVisible) {
        // Check mega menu content
        const menuLinks = megaMenu.locator('a')
        const linkCount = await menuLinks.count()
        console.log(`Links in dropdown: ${linkCount}`)
        
        // Take screenshot of open dropdown
        await page.screenshot({ 
          path: 'vision-mode-3-desktop-dropdown-open.png', 
          fullPage: false 
        })
        console.log('📸 Screenshot: vision-mode-3-desktop-dropdown-open.png')
        
        // Test clicking a link
        if (linkCount > 0) {
          const firstLink = menuLinks.first()
          const linkText = await firstLink.textContent()
          console.log(`First link text: "${linkText}"`)
          
          // Check if link is interactive
          try {
            await firstLink.hover()
            console.log('✅ Dropdown links are hoverable')
          } catch (e) {
            console.log('❌ Dropdown links not interactive')
          }
        }
      } else {
        console.log('⚠️ Mega menu not visible after hover')
        
        // Debug: Check what's in the DOM
        const allDropdowns = page.locator('[data-testid="dropdown-portal"]')
        const dropdownCount = await allDropdowns.count()
        console.log(`Dropdown portals in DOM: ${dropdownCount}`)
      }
      
      // Move mouse away to close dropdown
      await page.mouse.move(100, 100)
      await page.waitForTimeout(500)
    }
    
    // Phase 2: Mobile Navigation Testing
    console.log('\n📊 PHASE 2: Mobile Navigation Testing')
    console.log('-'.repeat(40))
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    console.log('✅ Mobile viewport set (375x667)')
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: 'vision-mode-4-mobile-initial.png', 
      fullPage: false 
    })
    console.log('📸 Screenshot: vision-mode-4-mobile-initial.png')
    
    // Check for hamburger menu button
    const hamburgerButton = page.locator('button[aria-label="Toggle mobile menu"]').first()
    const isHamburgerVisible = await hamburgerButton.isVisible()
    console.log(`Hamburger button visible: ${isHamburgerVisible ? '✅' : '❌'}`)
    
    if (isHamburgerVisible) {
      // Click hamburger to open mobile menu
      await hamburgerButton.click()
      console.log('Clicked hamburger button')
      await page.waitForTimeout(500) // Wait for animation
      
      // Take screenshot with mobile menu open
      await page.screenshot({ 
        path: 'vision-mode-5-mobile-menu-open.png', 
        fullPage: false 
      })
      console.log('📸 Screenshot: vision-mode-5-mobile-menu-open.png')
      
      // Check for mobile menu
      const mobileMenuBackdrop = page.locator('.fixed.inset-0.bg-black\\/50').first()
      const mobileMenuPanel = page.locator('.fixed.top-0.right-0.h-full').first()
      
      const backdropVisible = await mobileMenuBackdrop.isVisible()
      const panelVisible = await mobileMenuPanel.isVisible()
      
      console.log(`Mobile menu backdrop visible: ${backdropVisible ? '✅' : '❌'}`)
      console.log(`Mobile menu panel visible: ${panelVisible ? '✅' : '❌'}`)
      
      if (panelVisible) {
        // Check mobile menu content
        const mobileNavLinks = mobileMenuPanel.locator('nav a')
        const mobileLinkCount = await mobileNavLinks.count()
        console.log(`Mobile navigation links: ${mobileLinkCount}`)
        
        // Test close button
        const closeButton = mobileMenuPanel.locator('button[aria-label="Close menu"]').first()
        if (await closeButton.isVisible()) {
          await closeButton.click()
          await page.waitForTimeout(500)
          
          const stillVisible = await mobileMenuPanel.isVisible()
          console.log(`Mobile menu closed properly: ${!stillVisible ? '✅' : '❌'}`)
        }
      }
    }
    
    // Phase 3: Performance & Accessibility Check
    console.log('\n📊 PHASE 3: Performance & Accessibility')
    console.log('-'.repeat(40))
    
    // Check for console errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    await page.waitForTimeout(1000)
    
    if (consoleErrors.length === 0) {
      console.log('✅ No console errors detected')
    } else {
      console.log(`❌ Console errors found: ${consoleErrors.length}`)
      consoleErrors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error.substring(0, 100)}...`)
      })
    }
    
    // Check for ARIA attributes
    const ariaLabels = await page.locator('[aria-label]').count()
    const ariaRoles = await page.locator('[role]').count()
    console.log(`ARIA labels found: ${ariaLabels}`)
    console.log(`ARIA roles found: ${ariaRoles}`)
    
    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 NAVIGATION AUDIT SUMMARY')
    console.log('='.repeat(60))
    
    const issues: string[] = []
    
    if (!isNavVisible) issues.push('Navigation bar not visible')
    if (navItemCount === 0) issues.push('No navigation items found')
    if (!megaMenuVisible) issues.push('Dropdown menu not showing on hover')
    if (!isHamburgerVisible) issues.push('Mobile hamburger button not visible')
    if (!panelVisible) issues.push('Mobile menu panel not opening')
    
    if (issues.length === 0) {
      console.log('✅ ALL NAVIGATION FEATURES WORKING CORRECTLY')
    } else {
      console.log('❌ ISSUES FOUND:')
      issues.forEach(issue => console.log(`  - ${issue}`))
    }
    
    console.log('\n📸 Vision Mode Screenshots Generated:')
    console.log('  1. vision-mode-1-desktop-initial.png')
    console.log('  2. vision-mode-2-desktop-hover.png')
    console.log('  3. vision-mode-3-desktop-dropdown-open.png')
    console.log('  4. vision-mode-4-mobile-initial.png')
    console.log('  5. vision-mode-5-mobile-menu-open.png')
    
    console.log('\n🎭 Vision Mode Audit Complete!')
  })
})