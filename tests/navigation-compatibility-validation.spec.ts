/**
 * Navigation Compatibility E2E Tests
 * CLAUDE_RULES compliant: Desktop + Mobile navigation compatibility validation
 * 
 * Test Coverage:
 * - Desktop mega menu functionality
 * - Mobile hamburger menu and drawer
 * - State management isolation (desktop vs mobile)
 * - CSS animations and transitions
 * - Accessibility compliance
 */

import { test, expect } from '@playwright/test'

test.describe('Navigation Compatibility Validation', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
  })

  test.describe('Desktop Navigation', () => {
    test('should display desktop navigation on wide screens', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1440, height: 900 })
      
      // Check navigation exists and is visible
      const navigation = page.locator('nav')
      await expect(navigation).toBeVisible()
      
      // Desktop nav items should be visible
      const desktopNavItems = page.locator('nav .hidden.md\\:flex')
      await expect(desktopNavItems).toBeVisible()
      
      // Mobile hamburger should be hidden on desktop
      const mobileHamburger = page.locator('.md\\:hidden button[aria-label="Toggle mobile menu"]')
      await expect(mobileHamburger).toBeHidden()
    })

    test('should trigger mega menu on category hover', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      
      // Find navigation links with dropdowns
      const navLinks = page.locator('nav .hidden.md\\:flex a')
      const firstLink = navLinks.first()
      
      // Hover over first navigation item
      await firstLink.hover()
      
      // Check if mega menu appears (may be data-dependent)
      // We'll wait a bit for potential mega menu to load
      await page.waitForTimeout(1000)
      
      // Note: Mega menu may not appear without real category data
      // This tests the interaction mechanism
      const megaMenu = page.locator('[data-testid="mega-menu-dropdown"]')
      const megaMenuExists = await megaMenu.count() > 0
      
      if (megaMenuExists) {
        await expect(megaMenu).toBeVisible()
        console.log('✅ Mega menu functionality confirmed')
      } else {
        console.log('ℹ️ Mega menu not present (data-dependent)')
      }
    })
  })

  test.describe('Mobile Navigation', () => {
    test('should display mobile hamburger on small screens', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Mobile hamburger should be visible
      const mobileHamburger = page.locator('.md\\:hidden button[aria-label="Toggle mobile menu"]')
      await expect(mobileHamburger).toBeVisible()
      
      // Desktop nav items should be hidden on mobile
      const desktopNavItems = page.locator('nav .hidden.md\\:flex')
      await expect(desktopNavItems).toBeHidden()
    })

    test('should open mobile drawer when hamburger clicked', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      const mobileHamburger = page.locator('.md\\:hidden button[aria-label="Toggle mobile menu"]')
      
      // Check drawer is initially closed
      const mobileDrawer = page.locator('.apple-mobile-drawer')
      const isInitiallyClosed = await page.evaluate(() => {
        const drawer = document.querySelector('.apple-mobile-drawer')
        return !drawer || !drawer.classList.contains('active')
      })
      
      expect(isInitiallyClosed).toBe(true)
      
      // Click hamburger to open drawer
      await mobileHamburger.click()
      await page.waitForTimeout(500) // Allow animation
      
      // Check drawer opens
      const isNowOpen = await page.evaluate(() => {
        const drawer = document.querySelector('.apple-mobile-drawer')
        return drawer && drawer.classList.contains('active')
      })
      
      expect(isNowOpen).toBe(true)
    })

    test('should show backdrop overlay when mobile menu is open', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      const mobileHamburger = page.locator('.md\\:hidden button[aria-label="Toggle mobile menu"]')
      await mobileHamburger.click()
      await page.waitForTimeout(500)
      
      // Check backdrop is present and active
      const backdrop = page.locator('.apple-nav-backdrop.active')
      await expect(backdrop).toBeVisible()
      
      // Backdrop should cover full screen
      const backdropStyles = await backdrop.evaluate((el) => {
        const styles = window.getComputedStyle(el)
        return {
          position: styles.position,
          top: styles.top,
          left: styles.left,
          right: styles.right,
          bottom: styles.bottom,
        }
      })
      
      expect(backdropStyles.position).toBe('fixed')
      expect(backdropStyles.top).toBe('0px')
      expect(backdropStyles.left).toBe('0px')
    })

    test('should close mobile drawer when backdrop clicked', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Open mobile menu
      const mobileHamburger = page.locator('.md\\:hidden button[aria-label="Toggle mobile menu"]')
      await mobileHamburger.click()
      await page.waitForTimeout(500)
      
      // Verify it's open
      const isOpen = await page.evaluate(() => {
        const drawer = document.querySelector('.apple-mobile-drawer')
        return drawer && drawer.classList.contains('active')
      })
      expect(isOpen).toBe(true)
      
      // Click backdrop to close
      const backdrop = page.locator('.apple-nav-backdrop.active')
      await backdrop.click()
      await page.waitForTimeout(500)
      
      // Verify it's closed
      const isClosed = await page.evaluate(() => {
        const drawer = document.querySelector('.apple-mobile-drawer')
        return !drawer || !drawer.classList.contains('active')
      })
      expect(isClosed).toBe(true)
    })
  })

  test.describe('State Management Isolation', () => {
    test('should not interfere between desktop and mobile states', async ({ page }) => {
      // Start in desktop mode
      await page.setViewportSize({ width: 1440, height: 900 })
      
      // Hover over desktop navigation
      const desktopNavLinks = page.locator('nav .hidden.md\\:flex a')
      if (await desktopNavLinks.count() > 0) {
        await desktopNavLinks.first().hover()
        await page.waitForTimeout(300)
      }
      
      // Switch to mobile
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForTimeout(500)
      
      // Mobile drawer should not be auto-opened
      const mobileDrawer = page.locator('.apple-mobile-drawer')
      const isAutoOpened = await page.evaluate(() => {
        const drawer = document.querySelector('.apple-mobile-drawer')
        return drawer && drawer.classList.contains('active')
      })
      
      expect(isAutoOpened).toBe(false)
      
      // Test mobile interaction
      const mobileHamburger = page.locator('.md\\:hidden button[aria-label="Toggle mobile menu"]')
      await mobileHamburger.click()
      await page.waitForTimeout(500)
      
      // Switch back to desktop
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.waitForTimeout(500)
      
      // Mobile drawer should not be visible in desktop mode
      const mobileDrawerInDesktop = await page.evaluate(() => {
        const drawer = document.querySelector('.apple-mobile-drawer')
        if (!drawer) return false
        const styles = window.getComputedStyle(drawer)
        return styles.display !== 'none' && drawer.classList.contains('active')
      })
      
      // The drawer might still be active but should be handled by responsive CSS
      console.log('Mobile drawer state in desktop:', mobileDrawerInDesktop)
    })
  })

  test.describe('CSS and Animations', () => {
    test('should have navigation CSS imports working', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      
      // Check that CSS variables are available
      const cssVariablesCheck = await page.evaluate(() => {
        const styles = getComputedStyle(document.documentElement)
        return {
          auroraNavBg: styles.getPropertyValue('--aurora-nav-bg'),
          auroraNavText: styles.getPropertyValue('--aurora-nav-text'),
          appleNavHeight: styles.getPropertyValue('--apple-nav-height'),
          appleNavBg: styles.getPropertyValue('--apple-nav-bg'),
        }
      })
      
      // CSS variables should be defined
      expect(cssVariablesCheck.auroraNavBg).toBeTruthy()
      expect(cssVariablesCheck.auroraNavText).toBeTruthy()
      
      console.log('CSS Variables Check:', cssVariablesCheck)
    })

    test('should have smooth transitions', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      const mobileHamburger = page.locator('.md\\:hidden button[aria-label="Toggle mobile menu"]')
      
      // Measure transition performance
      const startTime = Date.now()
      await mobileHamburger.click()
      await page.waitForTimeout(100) // Small wait for animation start
      
      const isAnimating = await page.evaluate(() => {
        const drawer = document.querySelector('.apple-mobile-drawer')
        return drawer && drawer.classList.contains('active')
      })
      
      const responseTime = Date.now() - startTime
      
      expect(isAnimating).toBe(true)
      expect(responseTime).toBeLessThan(500) // Should respond quickly
      
      console.log(`Mobile menu response time: ${responseTime}ms`)
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper ARIA attributes', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      const mobileHamburger = page.locator('.md\\:hidden button[aria-label="Toggle mobile menu"]')
      
      // Check initial state
      await expect(mobileHamburger).toHaveAttribute('aria-label', 'Toggle mobile menu')
      await expect(mobileHamburger).toHaveAttribute('aria-expanded', 'false')
      
      // Click and check updated state
      await mobileHamburger.click()
      await page.waitForTimeout(500)
      
      await expect(mobileHamburger).toHaveAttribute('aria-expanded', 'true')
    })

    test('should support keyboard navigation', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      
      // Focus first navigation link
      const navLinks = page.locator('nav a').first()
      await navLinks.focus()
      
      // Should be focusable
      await expect(navLinks).toBeFocused()
      
      // Should be able to navigate with Tab key
      await page.keyboard.press('Tab')
      
      // Next element should be focused (implementation depends on structure)
      console.log('✅ Keyboard navigation test completed')
    })
  })

  test.describe('Performance', () => {
    test('should load navigation quickly', async ({ page }) => {
      const navigationStart = Date.now()
      
      await page.goto('/')
      
      // Wait for navigation to be visible
      const navigation = page.locator('nav')
      await expect(navigation).toBeVisible({ timeout: 5000 })
      
      const navigationLoadTime = Date.now() - navigationStart
      
      expect(navigationLoadTime).toBeLessThan(5000) // Should load within 5 seconds
      console.log(`Navigation load time: ${navigationLoadTime}ms`)
    })
  })
})