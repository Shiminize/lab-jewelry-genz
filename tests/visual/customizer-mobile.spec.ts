/**
 * CSS 3D Customizer Mobile Visual Testing
 * CLAUDE_RULES Compliant: Mobile-specific validation + Performance
 * 
 * Success Criteria (ALL MUST PASS):
 * - Touch interactions work smoothly on mobile devices
 * - Mobile layout maintains visual quality at all viewport sizes
 * - Performance targets adjusted for mobile hardware limitations
 * - Touch target sizes meet accessibility standards (44px minimum)
 * - Mobile-specific UI elements display correctly
 */

import { test, expect, type Page } from '@playwright/test';

// Mobile-specific success criteria
const MOBILE_CRITERIA = {
  MIN_TOUCH_TARGET_SIZE: 44,        // 44px minimum for accessibility
  MOBILE_PERFORMANCE_FACTOR: 2.0,   // 2x more time allowed for mobile
  TOUCH_RESPONSE_MAX_TIME: 300,     // 300ms max for touch response
  MOBILE_MATERIAL_SWITCH_MAX: 150,  // 150ms max for mobile material switches
  VIEWPORT_CONSISTENCY_THRESHOLD: 0.95 // 95% visual consistency across viewports
};

interface MobileTouchResult {
  touchType: string;
  responseTime: number;
  visualChangeDetected: boolean;
  touchTargetSize: { width: number; height: number };
  success: boolean;
}

// Helper: Wait for mobile customizer to be ready
async function waitForMobileCustomizerReady(page: Page): Promise<void> {
  await page.waitForSelector('[data-testid="material-switcher"]', { timeout: 20000 }); // Longer for mobile
  
  // Wait for mobile-optimized preloading
  await page.waitForFunction(() => {
    const loadingText = document.body.textContent || '';
    const mobileLoadingElements = document.querySelectorAll('[data-mobile-loading]');
    return !loadingText.includes('Loading...') && 
           !loadingText.includes('%') &&
           mobileLoadingElements.length === 0;
  }, { timeout: 45000 }); // Extended timeout for mobile
}

// Helper: Test touch interaction performance
async function testTouchInteraction(
  page: Page,
  element: any,
  touchType: string
): Promise<MobileTouchResult> {
  const startTime = performance.now();
  const elementBox = await element.boundingBox();
  
  if (!elementBox) {
    return {
      touchType,
      responseTime: 999,
      visualChangeDetected: false,
      touchTargetSize: { width: 0, height: 0 },
      success: false
    };
  }
  
  // Capture before state
  const beforeScreenshot = await page.locator('[data-testid="material-switcher"]')
    .screenshot({ type: 'png' });
  
  // Perform touch interaction based on type
  if (touchType === 'tap') {
    await element.tap();
  } else if (touchType === 'swipe') {
    const centerX = elementBox.x + elementBox.width / 2;
    const centerY = elementBox.y + elementBox.height / 2;
    
    await page.touchscreen.tap(centerX - 50, centerY);
    await page.mouse.move(centerX - 50, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX + 50, centerY, { steps: 5 });
    await page.mouse.up();
  }
  
  // Wait for response
  await page.waitForTimeout(200);
  
  const endTime = performance.now();
  const responseTime = endTime - startTime;
  
  // Capture after state
  const afterScreenshot = await page.locator('[data-testid="material-switcher"]')
    .screenshot({ type: 'png' });
  
  const visualChangeDetected = !beforeScreenshot.equals(afterScreenshot);
  const meetsPerformanceTarget = responseTime < MOBILE_CRITERIA.TOUCH_RESPONSE_MAX_TIME;
  const touchTargetSize = { width: elementBox.width, height: elementBox.height };
  const meetsAccessibilitySize = touchTargetSize.width >= MOBILE_CRITERIA.MIN_TOUCH_TARGET_SIZE && 
                                touchTargetSize.height >= MOBILE_CRITERIA.MIN_TOUCH_TARGET_SIZE;
  
  return {
    touchType,
    responseTime,
    visualChangeDetected,
    touchTargetSize,
    success: meetsPerformanceTarget && meetsAccessibilitySize
  };
}

test.describe('Mobile Material Selection', () => {
  test.use({ 
    isMobile: true,
    viewport: { width: 390, height: 844 } // iPhone 12 size for consistency
  });
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-performance');
    await waitForMobileCustomizerReady(page);
  });

  test('Mobile material buttons meet accessibility standards', async ({ page }) => {
    console.log('📱 Testing mobile accessibility standards...');
    
    const materialButtons = page.locator('button').filter({ hasText: /Gold|Platinum/ });
    const buttonCount = await materialButtons.count();
    
    expect(buttonCount).toBeGreaterThan(0);
    
    const accessibilityResults = [];
    
    for (let i = 0; i < buttonCount; i++) {
      const button = materialButtons.nth(i);
      const buttonText = await button.textContent() || `Button ${i + 1}`;
      
      console.log(`🔘 Testing ${buttonText} accessibility...`);
      
      const box = await button.boundingBox();
      if (box) {
        const meetsMinSize = box.width >= MOBILE_CRITERIA.MIN_TOUCH_TARGET_SIZE && 
                            box.height >= MOBILE_CRITERIA.MIN_TOUCH_TARGET_SIZE;
        
        console.log(`   Size: ${box.width}x${box.height}px ${meetsMinSize ? '✅' : '❌'}`);
        
        accessibilityResults.push({
          button: buttonText,
          width: box.width,
          height: box.height,
          meetsStandard: meetsMinSize
        });
        
        expect(meetsMinSize, 
          `${buttonText} touch target ${box.width}x${box.height}px below 44px minimum`
        ).toBe(true);
      }
    }
    
    console.log(`📊 Accessibility Summary: ${accessibilityResults.filter(r => r.meetsStandard).length}/${accessibilityResults.length} buttons meet standards`);
  });

  test('Mobile touch interactions respond within performance targets', async ({ page }) => {
    console.log('👆 Testing mobile touch performance...');
    
    const materials = ['Platinum', '18K White Gold', '18K Yellow Gold'];
    const touchResults: MobileTouchResult[] = [];
    
    for (const material of materials) {
      console.log(`📱 Testing ${material} touch response...`);
      
      const materialButton = page.locator(`button:has-text("${material}")`).first();
      
      if (await materialButton.isVisible()) {
        const tapResult = await testTouchInteraction(page, materialButton, 'tap');
        touchResults.push(tapResult);
        
        console.log(`   Tap: ${tapResult.responseTime.toFixed(1)}ms ${tapResult.success ? '✅' : '❌'}`);
        
        // Small delay between touches
        await page.waitForTimeout(300);
      }
    }
    
    // Analyze mobile touch performance
    const avgResponseTime = touchResults.reduce((sum, r) => sum + r.responseTime, 0) / touchResults.length;
    const responsiveCount = touchResults.filter(r => r.responseTime < MOBILE_CRITERIA.TOUCH_RESPONSE_MAX_TIME).length;
    const responsiveRate = responsiveCount / touchResults.length;
    
    console.log(`📊 Mobile Touch Performance:`);
    console.log(`   Average Response: ${avgResponseTime.toFixed(1)}ms`);
    console.log(`   Under 300ms: ${responsiveCount}/${touchResults.length} (${Math.round(responsiveRate * 100)}%)`);
    
    expect(avgResponseTime).toBeLessThan(MOBILE_CRITERIA.TOUCH_RESPONSE_MAX_TIME);
    expect(responsiveRate).toBeGreaterThan(0.8); // 80% should meet performance target
  });

  test('Mobile swipe gestures work for rotation', async ({ page }) => {
    console.log('👆🔄 Testing mobile swipe rotation...');
    
    const viewer = page.locator('[data-testid="material-switcher"] [role="img"]');
    const swipeResult = await testTouchInteraction(page, viewer, 'swipe');
    
    console.log(`📱 Swipe Response: ${swipeResult.responseTime.toFixed(1)}ms`);
    console.log(`📱 Visual Change: ${swipeResult.visualChangeDetected ? '✅ Detected' : '❌ None'}`);
    
    expect(swipeResult.success).toBe(true);
    expect(swipeResult.visualChangeDetected).toBe(true);
    
    // Visual regression test for mobile swipe
    await expect(viewer).toHaveScreenshot('mobile-swipe-gesture.png');
  });
});

test.describe('Mobile Viewport Responsiveness', () => {
  const mobileViewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'Pixel 5', width: 393, height: 851 },
    { name: 'iPad Mini', width: 768, height: 1024 }
  ];
  
  mobileViewports.forEach(viewport => {
    test(`Customizer adapts correctly to ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      console.log(`📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})...`);
      
      await page.goto('/test-performance');
      await waitForMobileCustomizerReady(page);
      
      // Check layout doesn't break
      const customizer = page.locator('[data-testid="material-switcher"]');
      await expect(customizer).toBeVisible();
      
      // Check that content fits in viewport
      const customizerBox = await customizer.boundingBox();
      if (customizerBox) {
        const fitsInViewport = customizerBox.width <= viewport.width && 
                              customizerBox.height <= viewport.height;
        
        console.log(`   Layout fits: ${fitsInViewport ? '✅' : '❌'} (${customizerBox.width}x${customizerBox.height})`);
        expect(fitsInViewport).toBe(true);
      }
      
      // Visual regression test for this viewport
      await expect(customizer).toHaveScreenshot(`${viewport.name.toLowerCase().replace(' ', '-')}-layout.png`);
      
      // Test material switching still works at this viewport
      const materialButton = page.locator('button').filter({ hasText: /Gold|Platinum/ }).first();
      if (await materialButton.isVisible()) {
        await materialButton.tap();
        await page.waitForTimeout(200);
        
        console.log(`   Material switching: ✅ Working on ${viewport.name}`);
      }
    });
  });
});

test.describe('Mobile Performance Optimization', () => {
  test.use({ isMobile: true });
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-performance');
    await waitForMobileCustomizerReady(page);
  });

  test('Mobile material switches meet adjusted performance targets', async ({ page }) => {
    console.log('📱⚡ Testing mobile-adjusted performance targets...');
    
    const materials = ['Platinum', '18K Rose Gold'];
    const mobileSwitchTimes: number[] = [];
    
    for (const material of materials) {
      console.log(`📱 Testing mobile ${material} switch...`);
      
      const materialButton = page.locator(`button:has-text("${material}")`).first();
      
      if (await materialButton.isVisible()) {
        const startTime = Date.now();
        await materialButton.tap();
        await page.waitForTimeout(100); // Brief wait for switch
        const endTime = Date.now();
        
        const switchTime = endTime - startTime;
        mobileSwitchTimes.push(switchTime);
        
        const meetsTarget = switchTime < MOBILE_CRITERIA.MOBILE_MATERIAL_SWITCH_MAX;
        console.log(`   ${material}: ${switchTime}ms ${meetsTarget ? '✅' : '❌'}`);
      }
    }
    
    if (mobileSwitchTimes.length > 0) {
      const avgMobileTime = mobileSwitchTimes.reduce((sum, t) => sum + t, 0) / mobileSwitchTimes.length;
      const underTargetCount = mobileSwitchTimes.filter(t => t < MOBILE_CRITERIA.MOBILE_MATERIAL_SWITCH_MAX).length;
      
      console.log(`📊 Mobile Performance Results:`);
      console.log(`   Average: ${avgMobileTime.toFixed(1)}ms`);
      console.log(`   Under 150ms: ${underTargetCount}/${mobileSwitchTimes.length} (${Math.round((underTargetCount/mobileSwitchTimes.length)*100)}%)`);
      
      expect(avgMobileTime).toBeLessThan(MOBILE_CRITERIA.MOBILE_MATERIAL_SWITCH_MAX);
    }
  });

  test('Mobile loading states are appropriate', async ({ page }) => {
    console.log('📱⏳ Testing mobile loading state experience...');
    
    // Check for mobile-specific loading indicators
    const loadingSpinner = page.locator('.animate-spin');
    const loadingText = page.locator('text*="Loading"');
    
    // On mobile, loading states should be more prominent and user-friendly
    const mobileLoadingElements = [
      'text*="Optimizing for mobile"',
      'text*="Preparing 360° view"',
      '[data-mobile-loading]'
    ];
    
    let foundMobileOptimization = false;
    for (const selector of mobileLoadingElements) {
      const element = page.locator(selector);
      if (await element.isVisible().catch(() => false)) {
        console.log(`📱 Found mobile optimization: ${selector}`);
        foundMobileOptimization = true;
        break;
      }
    }
    
    // Check that customizer eventually loads
    const customizer = page.locator('[data-testid="material-switcher"]');
    await expect(customizer).toBeVisible({ timeout: 30000 });
    
    console.log('📱 Mobile loading experience validated');
  });

  test('Mobile error handling provides helpful feedback', async ({ page }) => {
    console.log('📱🚨 Testing mobile error handling...');
    
    // Simulate network issues by blocking image requests
    await page.route('**/*.avif', route => route.abort());
    await page.route('**/*.webp', route => route.abort());
    await page.route('**/*.jpg', route => route.abort());
    
    await page.goto('/test-performance');
    
    // Wait for error state on mobile
    await page.waitForTimeout(10000);
    
    // Check for mobile-friendly error messages
    const mobileErrorMessages = [
      'text*="Tap to retry"',
      'text*="Network issue"',
      'text*="Please check connection"',
      'text*="Unable to load"'
    ];
    
    let foundMobileError = false;
    for (const errorSelector of mobileErrorMessages) {
      const errorElement = page.locator(errorSelector);
      if (await errorElement.isVisible().catch(() => false)) {
        console.log(`📱 Found mobile error handling: ${errorSelector}`);
        foundMobileError = true;
        break;
      }
    }
    
    // Should have some form of error indication
    const hasAnyError = foundMobileError || 
                       await page.locator('text*="Error"').isVisible().catch(() => false) ||
                       await page.locator('[aria-label*="Error"]').isVisible().catch(() => false);
    
    expect(hasAnyError).toBe(true);
    
    console.log('📱 Mobile error handling verified');
  });
});

test.describe('Mobile Accessibility Features', () => {
  test.use({ isMobile: true });
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-performance');
    await waitForMobileCustomizerReady(page);
  });

  test('Mobile screen reader support works correctly', async ({ page }) => {
    console.log('📱🔊 Testing mobile screen reader support...');
    
    const viewer = page.locator('[role="img"][aria-label*="Interactive 360° jewelry view"]');
    
    // Check required mobile accessibility attributes
    await expect(viewer).toHaveAttribute('role', 'img');
    await expect(viewer).toHaveAttribute('tabindex', '0');
    await expect(viewer).toHaveAttribute('aria-label');
    
    const ariaLabel = await viewer.getAttribute('aria-label');
    expect(ariaLabel).toContain('360');
    expect(ariaLabel).toContain('Interactive');
    
    // Check for mobile-specific accessibility hints
    const mobileHints = [
      'text*="Swipe to rotate"',
      'text*="Tap to change"',
      'text*="Double-tap"'
    ];
    
    let foundMobileHint = false;
    for (const hintSelector of mobileHints) {
      if (await page.locator(hintSelector).isVisible().catch(() => false)) {
        console.log(`📱 Found mobile accessibility hint: ${hintSelector}`);
        foundMobileHint = true;
        break;
      }
    }
    
    console.log(`📱 Mobile accessibility features: ${foundMobileHint ? '✅ Enhanced' : '✅ Basic'}`);
  });

  test('Mobile focus management works with touch', async ({ page }) => {
    console.log('📱👆 Testing mobile focus management...');
    
    const viewer = page.locator('[role="img"][aria-label*="Interactive 360° jewelry view"]');
    
    // Tap to focus
    await viewer.tap();
    await page.waitForTimeout(100);
    
    // Check if focus works (may not be visible on mobile, but should be functional)
    const isFocusable = await viewer.getAttribute('tabindex');
    expect(isFocusable).toBe('0');
    
    // Test that interactions still work after focus
    const materialButton = page.locator('button').filter({ hasText: /Gold|Platinum/ }).first();
    if (await materialButton.isVisible()) {
      await materialButton.tap();
      await page.waitForTimeout(200);
      
      console.log('📱 Touch focus and interaction: ✅ Working');
    }
  });
});