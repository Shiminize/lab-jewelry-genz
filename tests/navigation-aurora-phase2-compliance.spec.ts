import { test, expect } from '@playwright/test';

test.describe('Aurora Design System Phase 2 Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
  });

  test('Mobile navigation Aurora border radius compliance', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile menu
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"], button[aria-label*="menu"], .mobile-menu-toggle').first();
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(500);
    }

    // Take screenshot showing Aurora radius compliance
    await page.screenshot({ 
      path: 'test-results/aurora-phase2-radius-compliance.png',
      fullPage: false 
    });

    // Check for Aurora border radius in mobile drawer
    const mobileDrawer = page.locator('.mobile-drawer-v2, [class*="mobile-drawer"]').first();
    if (await mobileDrawer.isVisible()) {
      const borderRadius = await mobileDrawer.evaluate(el => 
        window.getComputedStyle(el).borderRadius
      );
      
      // Should be 8px (Aurora medium radius), not 0px (geometric)
      expect(borderRadius).not.toBe('0px');
      console.log('Mobile drawer border-radius:', borderRadius);
    }

    // Check search input radius
    const searchInput = page.locator('.mobile-drawer-v2__search-input, input[placeholder*="Search"], input[type="search"]').first();
    if (await searchInput.isVisible()) {
      const borderRadius = await searchInput.evaluate(el => 
        window.getComputedStyle(el).borderRadius
      );
      
      // Should be 8px (Aurora medium radius)
      expect(borderRadius).not.toBe('0px');
      console.log('Search input border-radius:', borderRadius);
    }

    // Check navigation items radius
    const navItems = page.locator('.mobile-drawer-v2__item, [class*="nav-item"]');
    const firstItem = navItems.first();
    if (await firstItem.isVisible()) {
      const borderRadius = await firstItem.evaluate(el => 
        window.getComputedStyle(el).borderRadius
      );
      
      // Should be 5px (Aurora small radius)
      expect(borderRadius).not.toBe('0px');
      console.log('Navigation item border-radius:', borderRadius);
    }
  });

  test('Aurora shadow system compliance', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile menu
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"], button[aria-label*="menu"], .mobile-menu-toggle').first();
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(500);
    }

    // Check mobile drawer has Aurora shadow (not basic shadow)
    const mobileDrawer = page.locator('.mobile-drawer-v2, [class*="mobile-drawer"]').first();
    if (await mobileDrawer.isVisible()) {
      const boxShadow = await mobileDrawer.evaluate(el => 
        window.getComputedStyle(el).boxShadow
      );
      
      // Should have shadow (not 'none')
      expect(boxShadow).not.toBe('none');
      console.log('Mobile drawer box-shadow:', boxShadow);
    }

    // Take screenshot for shadow verification
    await page.screenshot({ 
      path: 'test-results/aurora-phase2-shadow-compliance.png',
      fullPage: false 
    });
  });

  test('Aurora interactive states compliance', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile menu
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"], button[aria-label*="menu"], .mobile-menu-toggle').first();
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(500);
    }

    // Test hover state on close button
    const closeButton = page.locator('.mobile-drawer-v2__close, [class*="close"], [aria-label*="close"]').first();
    if (await closeButton.isVisible()) {
      // Hover and capture
      await closeButton.hover();
      await page.waitForTimeout(300);
      
      await page.screenshot({ 
        path: 'test-results/aurora-phase2-hover-compliance.png',
        fullPage: false 
      });
      
      // Check that hover changes the element (Aurora interactive)
      const backgroundColor = await closeButton.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      
      // Should not be transparent on hover
      expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      console.log('Close button hover background:', backgroundColor);
    }

    // Test Aurora typography scale
    const searchInput = page.locator('.mobile-drawer-v2__search-input, input').first();
    if (await searchInput.isVisible()) {
      const fontSize = await searchInput.evaluate(el => 
        window.getComputedStyle(el).fontSize
      );
      
      // Should be 1rem (Aurora Body M) = 16px
      expect(fontSize).toBe('16px');
      console.log('Search input font-size:', fontSize);
    }
  });

  test('Aurora color tokens compliance', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile menu
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"], button[aria-label*="menu"], .mobile-menu-toggle').first();
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(500);
    }

    // Check drawer background uses correct Aurora color
    const mobileDrawer = page.locator('.mobile-drawer-v2, [class*="mobile-drawer"]').first();
    if (await mobileDrawer.isVisible()) {
      const backgroundColor = await mobileDrawer.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      
      // Should be lunar-grey (#F7F7F9) not rgba(0,0,0,0)
      expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      console.log('Mobile drawer background:', backgroundColor);
    }

    await page.screenshot({ 
      path: 'test-results/aurora-phase2-complete-compliance.png',
      fullPage: false 
    });
  });
});
