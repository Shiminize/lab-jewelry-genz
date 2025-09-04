import { test, expect, Page } from '@playwright/test';

test.describe('Navigation Flickering Fix - Apple-Style Transitions', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Phase 1: Baseline - Document current flickering behavior', async () => {
    console.log('🧪 Phase 1: Testing current navigation flickering behavior...');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'navigation-flicker-baseline-initial.png', 
      fullPage: true 
    });

    // Find navigation elements
    const navigation = page.locator('nav').first();
    const navItems = page.locator('nav a, nav button');

    if (await navItems.count() > 0) {
      console.log('✅ Navigation items found:', await navItems.count());
      
      // Test hover state transitions
      console.log('🔄 Testing hover transitions...');
      
      const startTime = Date.now();
      await navItems.first().hover();
      await page.waitForTimeout(500); // Allow transition to complete
      const hoverTime = Date.now() - startTime;
      
      console.log(`⏱️ Hover response time: ${hoverTime}ms`);
      
      // Capture hover state
      await page.screenshot({ 
        path: 'navigation-flicker-baseline-hover.png', 
        fullPage: true 
      });

      // Test multiple rapid hovers to detect flickering
      console.log('🎭 Testing for flickering with rapid hovers...');
      for (let i = 0; i < 5; i++) {
        await navItems.nth(i % await navItems.count()).hover();
        await page.waitForTimeout(100);
      }
      
      // Capture post-rapid-hover state
      await page.screenshot({ 
        path: 'navigation-flicker-baseline-rapid-hover.png', 
        fullPage: true 
      });

      // Check console for transition-related errors
      const logs: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error' || msg.text().includes('transition') || msg.text().includes('flicker')) {
          logs.push(msg.text());
        }
      });

      await page.waitForTimeout(2000);

      if (logs.length === 0) {
        console.log('✅ No transition-related console errors detected');
      } else {
        console.log('❌ Transition-related issues found:', logs);
      }
    } else {
      console.log('❌ Navigation items not found');
    }

    console.log('📸 Baseline documentation completed');
    console.log('📋 Screenshots saved: navigation-flicker-baseline-*.png');
  });

  test('Phase 1: Validate Apple-style transition performance', async () => {
    console.log('🍎 Testing for Apple-style smooth transitions...');
    
    const navigation = page.locator('nav').first();
    const navItems = page.locator('nav a, nav button');

    if (await navItems.count() > 0) {
      // Measure transition performance
      const measurements: number[] = [];
      
      for (let i = 0; i < 3; i++) {
        const startTime = performance.now();
        await navItems.first().hover();
        await page.waitForTimeout(300); // Apple standard transition time
        const endTime = performance.now();
        measurements.push(endTime - startTime);
        
        // Hover away
        await page.locator('body').hover();
        await page.waitForTimeout(300);
      }
      
      const avgTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      console.log(`⏱️ Average transition time: ${avgTime.toFixed(2)}ms`);
      
      // Check if we meet Apple-style performance targets
      if (avgTime <= 350) {
        console.log('✅ Meets Apple-style performance target (<350ms)');
      } else {
        console.log('❌ Does not meet Apple-style performance target');
      }
    }
  });

  test('Phase 1: Test dropdown animations', async () => {
    console.log('🔽 Testing dropdown animation smoothness...');
    
    // Look for dropdown triggers
    const dropdownTriggers = page.locator('[role="button"]:has-text("Collections"), [role="button"]:has-text("Browse"), nav button');
    
    if (await dropdownTriggers.count() > 0) {
      console.log('✅ Dropdown triggers found:', await dropdownTriggers.count());
      
      const trigger = dropdownTriggers.first();
      
      // Test dropdown open
      console.log('📂 Testing dropdown open animation...');
      await trigger.hover();
      await page.waitForTimeout(500);
      
      // Look for dropdown content
      const dropdownContent = page.locator('[role="menu"], .dropdown-content, .mega-menu');
      if (await dropdownContent.count() > 0) {
        console.log('✅ Dropdown opened successfully');
        
        // Capture dropdown state
        await page.screenshot({ 
          path: 'navigation-flicker-baseline-dropdown-open.png', 
          fullPage: true 
        });
      } else {
        console.log('⚠️ Dropdown content not found');
      }
      
      // Test dropdown close
      console.log('📁 Testing dropdown close animation...');
      await page.locator('body').hover();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'navigation-flicker-baseline-dropdown-closed.png', 
        fullPage: true 
      });
    } else {
      console.log('⚠️ No dropdown triggers found');
    }
  });

  test('Phase 1: Mobile navigation testing', async () => {
    console.log('📱 Testing mobile navigation behavior...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Look for mobile menu triggers
    const mobileMenuTrigger = page.locator('[aria-label*="menu"], .mobile-menu-trigger, button:has-text("Menu")');
    
    if (await mobileMenuTrigger.count() > 0) {
      console.log('✅ Mobile menu trigger found');
      
      // Test mobile menu animation
      await mobileMenuTrigger.first().click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'navigation-flicker-baseline-mobile-open.png', 
        fullPage: true 
      });
      
      // Close mobile menu
      const closeButton = page.locator('[aria-label*="close"], .mobile-menu-close, button:has-text("Close")');
      if (await closeButton.count() > 0) {
        await closeButton.first().click();
        await page.waitForTimeout(500);
      }
      
      await page.screenshot({ 
        path: 'navigation-flicker-baseline-mobile-closed.png', 
        fullPage: true 
      });
    } else {
      console.log('⚠️ Mobile menu trigger not found');
    }
  });

  test('Phase 1: Success criteria validation', async () => {
    console.log('✅ Validating Phase 1 success criteria...');
    
    const criteria = {
      navigationExists: false,
      hoverWorks: false,
      performanceAcceptable: false,
      noConsoleErrors: true
    };
    
    // Check navigation exists
    const navItems = page.locator('nav a, nav button');
    criteria.navigationExists = await navItems.count() > 0;
    
    // Check hover functionality
    if (criteria.navigationExists) {
      try {
        await navItems.first().hover();
        criteria.hoverWorks = true;
      } catch (error) {
        console.log('❌ Hover test failed:', error);
      }
    }
    
    // Monitor console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(3000);
    criteria.noConsoleErrors = errors.length === 0;
    
    console.log('📊 Phase 1 Success Criteria Results:');
    console.log(`✅ Navigation exists: ${criteria.navigationExists}`);
    console.log(`✅ Hover works: ${criteria.hoverWorks}`);
    console.log(`✅ No console errors: ${criteria.noConsoleErrors}`);
    
    console.log('🎉 Phase 1 baseline testing completed');
    
    // Overall phase success
    const phaseSuccess = Object.values(criteria).every(Boolean);
    console.log(`📈 Phase 1 Overall Success: ${phaseSuccess ? '✅ PASS' : '❌ FAIL'}`);
  });
});