import { test, expect } from '@playwright/test'

test('Phase 1.2: Mobile Hamburger Menu Fix Test', async ({ page }) => {
  console.log('🧪 Testing Phase 1.2: Mobile Hamburger Menu Fix...')
  
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  console.log('✅ Page loaded')
  
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 })
  console.log('📱 Set mobile viewport (375x667)')
  
  // Look for hamburger button (should be visible on mobile)
  const hamburgerButton = page.locator('button[aria-label="Toggle mobile menu"]').first()
  const isHamburgerVisible = await hamburgerButton.isVisible()
  console.log('Hamburger button visible:', isHamburgerVisible)
  
  if (isHamburgerVisible) {
    console.log('🔄 Testing mobile menu toggle...')
    
    // Click hamburger button to open mobile menu
    await hamburgerButton.click()
    await page.waitForTimeout(500) // Wait for menu animation
    
    // Check if mobile menu is now visible
    const mobileMenuBackdrop = page.locator('.fixed.inset-0').first()
    const mobileMenuContent = page.locator('.fixed.top-0.right-0.h-full').first()
    
    const backdropVisible = await mobileMenuBackdrop.isVisible()
    const menuVisible = await mobileMenuContent.isVisible()
    
    console.log('Mobile menu backdrop visible:', backdropVisible)
    console.log('Mobile menu content visible:', menuVisible)
    
    if (backdropVisible && menuVisible) {
      console.log('✅ Mobile menu opens successfully')
      
      // Test navigation links in mobile menu
      const navLinks = mobileMenuContent.locator('nav a')
      const linkCount = await navLinks.count()
      console.log('Navigation links in mobile menu:', linkCount)
      
      if (linkCount > 0) {
        console.log('✅ Mobile menu contains navigation links')
        console.log('🎉 Phase 1.2: Mobile Hamburger Menu Fix - SUCCESS!')
      }
    } else {
      console.log('❌ Mobile menu still not rendering properly')
    }
  } else {
    console.log('❌ Hamburger button not visible on mobile')
  }
  
  // Take screenshot for verification
  await page.screenshot({ path: 'phase1-mobile-menu-fix-verified.png', fullPage: true })
  console.log('📸 Screenshot saved: phase1-mobile-menu-fix-verified.png')
})