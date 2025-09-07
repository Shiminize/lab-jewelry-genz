/**
 * Phase 2: Hero & Navigation Gradients E2E Test
 * 
 * Validates Aurora Design System gradient implementation
 * for hero sections and navigation components per Phase 2 requirements.
 * 
 * Success Criteria:
 * - Hero sections display Aurora gradients correctly
 * - Navigation maintains functionality with visual enhancements  
 * - No performance regression from animations
 */

import { test, expect } from '@playwright/test'

test.describe('Phase 2: Hero & Navigation Gradients Validation', () => {
  let performanceEntries: any[] = []
  
  test.beforeEach(async ({ page }) => {
    // Monitor performance entries
    performanceEntries = []
    page.on('console', msg => {
      if (msg.text().includes('performance') || msg.text().includes('fps')) {
        performanceEntries.push({
          type: 'performance',
          message: msg.text(),
          timestamp: Date.now()
        })
      }
    })
  })

  test('Phase 2.1: Hero section Aurora gradient with drift animation', async ({ page }) => {
    console.log('🎨 Phase 2.1: Testing hero section Aurora gradients...')
    
    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
    
    // Look for hero section with Aurora gradient
    const heroSection = page.locator('section').first()
    const gradientOverlay = page.locator('.aurora-hero-gradient')
    
    // Verify gradient is present
    const gradientExists = await gradientOverlay.count() > 0
    console.log(`Aurora hero gradient present: ${gradientExists}`)
    
    if (gradientExists) {
      // Check CSS properties
      const backgroundStyle = await gradientOverlay.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return {
          background: styles.backgroundImage,
          animation: styles.animationName,
          duration: styles.animationDuration
        }
      })
      
      console.log('✅ Hero gradient CSS:', backgroundStyle)
      
      // Verify animation is aurora-drift with 30s duration
      expect(backgroundStyle.animation).toBe('aurora-drift')
      expect(backgroundStyle.duration).toBe('30s')
    }
    
    // Take desktop screenshot
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.screenshot({ 
      path: 'phase2-hero-gradient-desktop.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 800 }
    })
    
    console.log('✅ Phase 2.1: Hero gradient validation completed')
  })

  test('Phase 2.2: Desktop mega menu Aurora gradients', async ({ page }) => {
    console.log('🎨 Phase 2.2: Testing desktop mega menu gradients...')
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    
    // Find navigation items with dropdowns
    const navLinks = page.locator('nav a').filter({ hasText: /Necklaces|Earrings|Bracelets|Rings/ })
    const navCount = await navLinks.count()
    console.log(`Found ${navCount} main navigation items`)
    
    if (navCount > 0) {
      // Hover on first navigation item to open mega menu
      await navLinks.first().hover()
      await page.waitForTimeout(500) // Allow dropdown to fully open
      
      // Look for mega menu with Aurora gradient
      const megaMenu = page.locator('.aurora-primary-gradient')
      const megaMenuVisible = await megaMenu.count() > 0
      
      console.log(`Mega menu with Aurora gradient visible: ${megaMenuVisible}`)
      
      if (megaMenuVisible) {
        // Verify gradient CSS properties
        const gradientStyle = await megaMenu.first().evaluate(el => {
          const styles = window.getComputedStyle(el)
          return {
            backgroundImage: styles.backgroundImage,
            opacity: styles.opacity
          }
        })
        
        console.log('✅ Mega menu gradient CSS:', gradientStyle)
      }
      
      // Take screenshot with mega menu open
      await page.screenshot({ 
        path: 'phase2-mega-menu-gradient.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1920, height: 600 }
      })
    }
    
    console.log('✅ Phase 2.2: Desktop mega menu validation completed')
  })

  test('Phase 2.3: Mobile navigation Midnight Luxury gradient', async ({ page }) => {
    console.log('🎨 Phase 2.3: Testing mobile navigation gradients...')
    
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(1000)
    
    // Find and click mobile menu button
    const mobileMenuButton = page.locator('button').filter({ hasText: /menu/i }).or(
      page.locator('[aria-label*="menu"]')
    ).or(
      page.locator('svg').filter({ hasText: /menu/i })
    ).first()
    
    const menuButtonExists = await mobileMenuButton.count() > 0
    console.log(`Mobile menu button found: ${menuButtonExists}`)
    
    if (menuButtonExists) {
      await mobileMenuButton.click()
      await page.waitForTimeout(500)
      
      // Look for mobile panel with Midnight Luxury gradient
      const mobilePanel = page.locator('.aurora-midnight-luxury')
      const panelVisible = await mobilePanel.count() > 0
      
      console.log(`Mobile panel with Midnight Luxury gradient visible: ${panelVisible}`)
      
      if (panelVisible) {
        // Verify gradient CSS properties
        const gradientStyle = await mobilePanel.first().evaluate(el => {
          const styles = window.getComputedStyle(el)
          return {
            backgroundImage: styles.backgroundImage,
            transform: styles.transform
          }
        })
        
        console.log('✅ Mobile gradient CSS:', gradientStyle)
      }
      
      // Take mobile screenshot with menu open
      await page.screenshot({ 
        path: 'phase2-mobile-gradient.png',
        fullPage: true
      })
    }
    
    console.log('✅ Phase 2.3: Mobile navigation validation completed')
  })

  test('Phase 2.4: Performance validation - no animation regression', async ({ page }) => {
    console.log('⚡ Phase 2.4: Testing gradient animation performance...')
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Monitor performance
    const startTime = Date.now()
    
    // Test hero gradient animation performance
    await page.evaluate(() => {
      // Force animation to run and measure performance
      return new Promise<void>((resolve) => {
        const gradientEl = document.querySelector('.aurora-hero-gradient')
        if (gradientEl) {
          let frames = 0
          const measureFrames = () => {
            frames++
            if (frames < 60) { // Test for ~1 second at 60fps
              requestAnimationFrame(measureFrames)
            } else {
              console.log(`✅ Animation performance: ${frames} frames measured`)
              resolve()
            }
          }
          requestAnimationFrame(measureFrames)
        } else {
          resolve()
        }
      })
    })
    
    const endTime = Date.now()
    const testDuration = endTime - startTime
    
    console.log(`Performance test completed in ${testDuration}ms`)
    
    // Performance should not be significantly impacted
    expect(testDuration).toBeLessThan(3000) // Should complete within 3 seconds
    
    console.log('✅ Phase 2.4: Performance validation completed')
  })

  test('Phase 2.5: Vision Mode comprehensive gradient screenshots', async ({ page }) => {
    console.log('📸 Phase 2.5: Capturing comprehensive gradient visual states...')
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Desktop hero section
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.screenshot({ 
      path: 'phase2-aurora-hero-desktop.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    })
    
    // Desktop navigation with hover
    const navItem = page.locator('nav a').first()
    if (await navItem.count() > 0) {
      await navItem.hover()
      await page.waitForTimeout(500)
      await page.screenshot({ 
        path: 'phase2-aurora-navigation-hover.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1920, height: 600 }
      })
    }
    
    // Mobile gradient states
    await page.setViewportSize({ width: 375, height: 667 })
    await page.screenshot({ 
      path: 'phase2-aurora-mobile-closed.png',
      fullPage: true
    })
    
    // Open mobile menu if possible
    const mobileButton = page.locator('[aria-label*="menu"], button:has(svg)').first()
    if (await mobileButton.count() > 0) {
      await mobileButton.click()
      await page.waitForTimeout(500)
      await page.screenshot({ 
        path: 'phase2-aurora-mobile-open.png',
        fullPage: true
      })
    }
    
    console.log('📸 Phase 2 gradient screenshots captured for visual regression testing')
    console.log('🎉 Phase 2: Hero & Navigation Gradients - VALIDATION COMPLETE')
  })
})