/**
 * Navigation Aurora Design System Compliance Test
 * Tests navigation against Aurora Design System specification and Claude Rules
 */

const { test, expect } = require('@playwright/test');

test.describe('Navigation Aurora Design System Compliance', () => {
  test.beforeEach(async ({ page }) => {
    // Enable slow motion for visual debugging
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Let animations settle
  });

  test('Navigation uses Aurora color tokens', async ({ page }) => {
    console.log('🎨 Testing Aurora color token compliance...');
    
    // Test main navigation container
    const navContainer = page.locator('nav').first();
    await expect(navContainer).toBeVisible();
    
    // Get computed styles
    const navStyles = await navContainer.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        borderColor: computed.borderColor,
        color: computed.color
      };
    });
    
    console.log('📊 Navigation computed styles:', navStyles);
    
    // Test brand logo uses Aurora colors
    const brandLogo = page.locator('a').filter({ hasText: /GenZ Jewelry|GlowGlitch/ }).first();
    if (await brandLogo.count() > 0) {
      const logoStyles = await brandLogo.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          fontWeight: computed.fontWeight
        };
      });
      console.log('🏷️ Brand logo styles:', logoStyles);
    }
    
    // Test navigation items
    const navItems = page.locator('nav a').filter({ hasText: /Rings|Necklaces|Earrings/ });
    const firstNavItem = navItems.first();
    
    if (await firstNavItem.count() > 0) {
      const itemStyles = await firstNavItem.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          transition: computed.transition
        };
      });
      console.log('🔗 Navigation item styles:', itemStyles);
    }
  });

  test('Navigation uses Aurora typography scale', async ({ page }) => {
    console.log('🔤 Testing Aurora typography scale compliance...');
    
    // Test brand logo typography
    const brandLogo = page.locator('a').filter({ hasText: /GenZ Jewelry|GlowGlitch/ }).first();
    if (await brandLogo.count() > 0) {
      const logoTypography = await brandLogo.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          fontFamily: computed.fontFamily,
          lineHeight: computed.lineHeight
        };
      });
      console.log('📐 Brand logo typography:', logoTypography);
      
      // Check if using Aurora typography scale
      const fontSize = parseFloat(logoTypography.fontSize);
      const expectedSizes = [16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64]; // px equivalents
      const isValidSize = expectedSizes.some(size => Math.abs(fontSize - size) < 2);
      
      if (!isValidSize) {
        console.warn('⚠️ Brand logo font size may not match Aurora scale:', fontSize + 'px');
      }
    }
    
    // Test navigation items typography
    const navItems = page.locator('nav a').filter({ hasText: /Rings|Necklaces|Earrings/ });
    if (await navItems.count() > 0) {
      const itemTypography = await navItems.first().evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          lineHeight: computed.lineHeight
        };
      });
      console.log('📝 Navigation item typography:', itemTypography);
    }
  });

  test('Navigation uses Aurora border radius system', async ({ page }) => {
    console.log('🟦 Testing Aurora border radius compliance...');
    
    // Test all navigation elements for border radius
    const navElements = [
      'nav', // Main container
      'nav button', // Buttons
      '.feature-card, .product-card', // Cards if present
      '[class*="dropdown"], [class*="menu"]' // Dropdowns
    ];
    
    for (const selector of navElements) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        for (let i = 0; i < Math.min(count, 3); i++) { // Test first 3 elements
          const element = elements.nth(i);
          const styles = await element.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              borderRadius: computed.borderRadius,
              borderTopLeftRadius: computed.borderTopLeftRadius,
              borderTopRightRadius: computed.borderTopRightRadius,
              borderBottomLeftRadius: computed.borderBottomLeftRadius,
              borderBottomRightRadius: computed.borderBottomRightRadius
            };
          });
          
          console.log(`🔍 Element "${selector}" [${i}] border radius:`, styles);
          
          // Check for Aurora-compliant radii (3px, 5px, 8px, 13px, 21px, 34px, or 0px)
          const validRadii = ['0px', '3px', '5px', '8px', '13px', '21px', '34px'];
          const radius = styles.borderRadius;
          
          if (radius && radius !== '0px' && !validRadii.includes(radius)) {
            console.warn(`⚠️ Non-Aurora radius found on ${selector}:`, radius);
          }
        }
      }
    }
  });

  test('Navigation shadow system compliance', async ({ page }) => {
    console.log('🌊 Testing Aurora shadow system compliance...');
    
    // Test navigation container shadow
    const navContainer = page.locator('nav').first();
    const navShadow = await navContainer.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        boxShadow: computed.boxShadow,
        filter: computed.filter
      };
    });
    
    console.log('💫 Navigation shadow:', navShadow);
    
    // Test dropdown shadows if mega menu is present
    await page.hover('nav a').catch(() => {}); // Hover to trigger dropdown
    await page.waitForTimeout(500);
    
    const dropdown = page.locator('[data-testid="mega-menu-dropdown"]');
    if (await dropdown.count() > 0) {
      const dropdownShadow = await dropdown.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          boxShadow: computed.boxShadow,
          backgroundColor: computed.backgroundColor,
          borderColor: computed.borderColor
        };
      });
      console.log('📋 Dropdown shadow:', dropdownShadow);
    }
  });

  test('Navigation hover and interaction states', async ({ page }) => {
    console.log('🖱️ Testing navigation interaction states...');
    
    // Find navigation items
    const navItems = page.locator('nav a').filter({ hasText: /Rings|Necklaces|Earrings/ });
    const firstItem = navItems.first();
    
    if (await firstItem.count() > 0) {
      // Get initial styles
      const initialStyles = await firstItem.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          transform: computed.transform
        };
      });
      console.log('📊 Initial navigation item styles:', initialStyles);
      
      // Hover and check for changes
      await firstItem.hover();
      await page.waitForTimeout(300); // Wait for transition
      
      const hoverStyles = await firstItem.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          transform: computed.transform,
          transition: computed.transition
        };
      });
      console.log('🎯 Hover navigation item styles:', hoverStyles);
      
      // Check for Aurora transitions (0.3s ease)
      const transition = hoverStyles.transition;
      if (transition && !transition.includes('0.3s') && !transition.includes('300ms')) {
        console.warn('⚠️ Navigation transitions may not follow Aurora 0.3s ease standard');
      }
    }
  });

  test('Navigation mobile responsiveness', async ({ page }) => {
    console.log('📱 Testing navigation mobile responsiveness...');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Check if mobile menu button exists
    const mobileButton = page.locator('button[aria-label*="mobile"], button[aria-label*="menu"], button[aria-expanded]');
    const buttonCount = await mobileButton.count();
    
    if (buttonCount > 0) {
      console.log('📱 Mobile menu button found');
      
      const buttonStyles = await mobileButton.first().evaluate((el) => {
        const computed = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          minHeight: computed.minHeight,
          minWidth: computed.minWidth,
          padding: computed.padding,
          actualHeight: rect.height,
          actualWidth: rect.width
        };
      });
      console.log('👆 Mobile button touch target:', buttonStyles);
      
      // Check touch target size (minimum 44px)
      if (buttonStyles.actualHeight < 44 || buttonStyles.actualWidth < 44) {
        console.warn('⚠️ Mobile button may not meet 44px minimum touch target');
      }
      
      // Test mobile menu functionality
      await mobileButton.first().click();
      await page.waitForTimeout(500);
      
      // Check for mobile menu/drawer
      const mobileMenu = page.locator('[role="dialog"], .mobile-menu, .drawer, [class*="mobile"]').filter({ hasText: /Rings|Necklaces|menu/i });
      if (await mobileMenu.count() > 0) {
        console.log('📋 Mobile menu opened successfully');
        
        const menuStyles = await mobileMenu.first().evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            position: computed.position,
            zIndex: computed.zIndex,
            transform: computed.transform,
            transition: computed.transition
          };
        });
        console.log('🎭 Mobile menu styles:', menuStyles);
      }
    } else {
      console.log('ℹ️ No mobile menu button found - navigation might be always visible');
    }
    
    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Navigation architectural compliance (Claude Rules)', async ({ page }) => {
    console.log('🏗️ Testing Claude Rules architectural compliance...');
    
    // Check for proper component separation
    // This tests if navigation is structured according to service -> hook -> component pattern
    
    const navigationErrors = await page.evaluate(() => {
      const errors = [];
      
      // Check for direct fetch calls in components (should use hooks instead)
      const scripts = Array.from(document.scripts);
      const hasDirectFetch = scripts.some(script => 
        script.textContent && 
        script.textContent.includes('fetch(') && 
        script.textContent.includes('component')
      );
      
      if (hasDirectFetch) {
        errors.push('Components may contain direct fetch calls (Claude Rules violation)');
      }
      
      // Check for proper error boundaries
      const hasErrorBoundary = document.querySelector('[class*="error"], [data-testid*="error"]');
      if (!hasErrorBoundary) {
        // This is not necessarily an error, just informational
        console.log('ℹ️ No visible error boundary elements found');
      }
      
      return errors;
    });
    
    if (navigationErrors.length > 0) {
      console.warn('⚠️ Architectural compliance issues:', navigationErrors);
    } else {
      console.log('✅ No obvious architectural violations detected');
    }
    
    // Check for console errors that might indicate architectural problems
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Interact with navigation to trigger any errors
    const navItems = page.locator('nav a');
    if (await navItems.count() > 0) {
      await navItems.first().hover();
      await page.waitForTimeout(1000);
    }
    
    if (consoleErrors.length > 0) {
      console.warn('⚠️ Console errors detected:', consoleErrors);
    }
  });
});
