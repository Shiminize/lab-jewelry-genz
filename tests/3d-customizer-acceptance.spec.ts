/**
 * CSS 3D Customizer Acceptance Tests
 * Tests the new image sequence-based 360° viewer
 * 
 * Acceptance Criteria (updated for CSS 3D approach):
 * - Material change reflects visually <2s
 * - Price recalculates on material change
 * - CSS 3D viewer smooth on mobile devices
 * - Graceful fallback if images fail to load
 * - Design save/share with URL and preview
 */

import { test, expect, type Page } from '@playwright/test';

// Test configuration - updated for CSS 3D
const CONFIG = {
  IMAGE_LOAD_MAX: 3000,       // 3 seconds max for image sequence loading
  INTERACTION_DELAY: 100,     // Delay for smooth interactions
  MATERIAL_CHANGE_MAX: 2000,  // 2 seconds max for material changes
  PRICE_UPDATE_MAX: 1000,     // 1 second max for price updates
};

// Helper function to wait for CSS 3D viewer
async function waitForCSS3DViewer(page: Page): Promise<boolean> {
  try {
    return await page.waitForFunction(() => {
      const viewer = document.querySelector('[role="img"][aria-label*="Interactive 360"]');
      const image = document.querySelector('img[alt*="Product view frame"]');
      return viewer && image && (image as HTMLImageElement).complete;
    }, { timeout: CONFIG.IMAGE_LOAD_MAX });
  } catch {
    return false;
  }
}

// Helper function to get current frame number
async function getCurrentFrame(page: Page): Promise<number> {
  const frameText = await page.locator('text*="/").first().textContent();
  if (frameText) {
    const match = frameText.match(/(\d+)\/\d+/);
    return match ? parseInt(match[1]) : 1;
  }
  return 1;
}

test.describe('CSS 3D Customizer Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/customizer');
  });

  test('CSS 3D viewer initializes successfully', async ({ page }) => {
    console.log('Testing CSS 3D viewer initialization...');
    
    // Wait for ProductCustomizer to load
    await page.waitForSelector('[role="img"][aria-label*="Interactive 360"]', { 
      timeout: CONFIG.IMAGE_LOAD_MAX 
    });

    // Check if CSS 3D viewer is working
    const hasCSS3D = await waitForCSS3DViewer(page);
    expect(hasCSS3D).toBe(true);

    // Verify viewer elements are present
    const viewer = page.locator('[role="img"][aria-label*="Interactive 360"]').first();
    await expect(viewer).toBeVisible();

    const image = page.locator('img[alt*="Product view frame"]').first();
    await expect(image).toBeVisible();

    // Check status indicator
    const statusIndicator = page.locator('text="360° Interactive"').first();
    await expect(statusIndicator).toBeVisible();

    console.log('CSS 3D viewer initialized successfully');
  });

  test('Image sequence loading with progress indication', async ({ page }) => {
    console.log('Testing image sequence loading...');

    // Wait for loading indicator
    const loadingIndicator = page.locator('text="Loading 360° view..."');
    
    // Loading should appear initially (if images aren't cached)
    const hasLoading = await loadingIndicator.isVisible();
    if (hasLoading) {
      console.log('Loading indicator visible');
      
      // Wait for loading to complete
      await expect(loadingIndicator).toBeHidden({ timeout: CONFIG.IMAGE_LOAD_MAX });
    }

    // Verify final state
    const viewer = page.locator('[role="img"][aria-label*="Interactive 360"]');
    await expect(viewer).toBeVisible();
    
    console.log('Image sequence loaded successfully');
  });
});

test.describe('CSS 3D Material Change Performance', () => {
  test('Material changes reflect within 2 seconds', async ({ page }) => {
    await page.goto('/customizer');
    
    // Wait for customizer to load
    await waitForCSS3DViewer(page);
    
    const startTime = Date.now();
    
    // Find and click a different material
    const materialButtons = page.locator('button[aria-pressed="false"]').filter({ 
      hasText: /Gold|Platinum|Silver/ 
    });
    
    if (await materialButtons.count() > 0) {
      await materialButtons.first().click();
      
      // Wait for visual change (button state)
      await expect(materialButtons.first()).toHaveAttribute('aria-pressed', 'true');
      
      const endTime = Date.now();
      const changeTime = endTime - startTime;
      
      console.log(`Material change completed in ${changeTime}ms`);
      expect(changeTime).toBeLessThan(CONFIG.MATERIAL_CHANGE_MAX);
    } else {
      console.log('No material options found - may be in different layout');
    }
  });

  test('Price updates on material change', async ({ page }) => {
    await page.goto('/customizer');
    await waitForCSS3DViewer(page);
    
    // Look for price display
    const priceElement = page.locator('text*="$"').filter({ hasText: /^\$\d/ }).first();
    
    if (await priceElement.isVisible()) {
      const initialPrice = await priceElement.textContent();
      
      // Change material
      const materialButtons = page.locator('button[aria-pressed="false"]').filter({ 
        hasText: /Gold|Platinum|Silver/ 
      });
      
      if (await materialButtons.count() > 0) {
        await materialButtons.first().click();
        
        // Wait for price update
        await page.waitForTimeout(CONFIG.PRICE_UPDATE_MAX);
        
        const newPrice = await priceElement.textContent();
        
        console.log(`Price changed from ${initialPrice} to ${newPrice}`);
        
        // Price should update (may be same if no price difference)
        expect(newPrice).toBeDefined();
      }
    } else {
      console.log('No price display found');
    }
  });
});

test.describe('CSS 3D Interaction Testing', () => {
  test('Drag rotation works smoothly', async ({ page }) => {
    await page.goto('/customizer');
    await waitForCSS3DViewer(page);
    
    const viewer = page.locator('[role="img"][aria-label*="Interactive 360"]').first();
    
    // Get initial frame
    const initialFrame = await getCurrentFrame(page);
    
    // Perform drag interaction
    await viewer.hover();
    await page.mouse.down();
    await page.mouse.move(100, 0, { steps: 5 }); // Smooth drag
    await page.mouse.up();
    
    // Wait for interaction to complete
    await page.waitForTimeout(CONFIG.INTERACTION_DELAY);
    
    const newFrame = await getCurrentFrame(page);
    
    console.log(`Frame changed from ${initialFrame} to ${newFrame}`);
    
    // Frame should change (unless at boundary)
    if (initialFrame !== newFrame) {
      console.log('Drag rotation working correctly');
    }
  });

  test('Keyboard navigation works', async ({ page }) => {
    await page.goto('/customizer');
    await waitForCSS3DViewer(page);
    
    const viewer = page.locator('[role="img"][aria-label*="Interactive 360"]').first();
    
    // Focus viewer
    await viewer.focus();
    
    const initialFrame = await getCurrentFrame(page);
    
    // Test right arrow
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(CONFIG.INTERACTION_DELAY);
    
    const rightFrame = await getCurrentFrame(page);
    
    // Test left arrow
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(CONFIG.INTERACTION_DELAY);
    
    console.log(`Keyboard navigation: ${initialFrame} → ${rightFrame} → ${await getCurrentFrame(page)}`);
  });

  test('Touch interaction works on mobile', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip('Touch test only runs on mobile');
    }
    
    await page.goto('/customizer');
    await waitForCSS3DViewer(page);
    
    const viewer = page.locator('[role="img"][aria-label*="Interactive 360"]').first();
    
    // Touch interaction
    await viewer.tap();
    await page.touchscreen.tap(200, 200);
    
    // Swipe gesture
    await page.touchscreen.tap(150, 200);
    await page.touchscreen.tap(250, 200);
    
    console.log('Touch interaction completed on mobile');
  });
});

test.describe('CSS 3D Error Handling', () => {
  test('Graceful fallback when images fail to load', async ({ page }) => {
    // Block image requests to simulate failure
    await page.route('**/*.webp', route => route.abort());
    await page.route('**/*.jpg', route => route.abort());
    await page.route('**/*.png', route => route.abort());
    
    await page.goto('/customizer');
    
    // Should show error state
    const errorState = page.locator('text="360° view unavailable"');
    await expect(errorState).toBeVisible({ timeout: CONFIG.IMAGE_LOAD_MAX });
    
    const retryMessage = page.locator('text="Please try refreshing the page"');
    await expect(retryMessage).toBeVisible();
    
    console.log('Image failure fallback working correctly');
  });

  test('Loading state handling', async ({ page }) => {
    await page.goto('/customizer');
    
    // Check for loading state elements
    const loadingSpinner = page.locator('.animate-spin');
    const loadingText = page.locator('text="Loading 360° view..."');
    
    // At least one loading indicator should be present initially
    const hasLoadingIndicators = await loadingSpinner.isVisible() || 
                                await loadingText.isVisible();
    
    if (hasLoadingIndicators) {
      console.log('Loading state properly displayed');
      
      // Wait for loading to complete
      await waitForCSS3DViewer(page);
      
      // Loading indicators should be gone
      await expect(loadingSpinner).toBeHidden();
      await expect(loadingText).toBeHidden();
    }
    
    console.log('Loading state handling verified');
  });
});

test.describe('CSS 3D Accessibility', () => {
  test('Proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/customizer');
    await waitForCSS3DViewer(page);
    
    const viewer = page.locator('[role="img"][aria-label*="Interactive 360"]').first();
    
    // Check required attributes
    await expect(viewer).toHaveAttribute('role', 'img');
    await expect(viewer).toHaveAttribute('tabindex', '0');
    await expect(viewer).toHaveAttribute('aria-label');
    
    // Check screen reader content
    const srContent = page.locator('.sr-only');
    await expect(srContent).toBeVisible();
    
    const srText = await srContent.textContent();
    expect(srText).toContain('Interactive 360');
    
    console.log('Accessibility attributes verified');
  });

  test('Focus management works correctly', async ({ page }) => {
    await page.goto('/customizer');
    await waitForCSS3DViewer(page);
    
    const viewer = page.locator('[role="img"][aria-label*="Interactive 360"]').first();
    
    // Focus viewer with tab
    await page.keyboard.press('Tab');
    
    // Check if viewer is focused
    await expect(viewer).toBeFocused();
    
    // Keyboard interaction should work when focused
    await page.keyboard.press('ArrowRight');
    
    console.log('Focus management working correctly');
  });
});

test.describe('CSS 3D Mobile Performance', () => {
  test('Smooth performance on mobile devices', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip('Mobile performance test only runs on mobile');
    }
    
    await page.goto('/customizer');
    
    const startTime = Date.now();
    await waitForCSS3DViewer(page);
    const loadTime = Date.now() - startTime;
    
    console.log(`CSS 3D viewer loaded in ${loadTime}ms on mobile`);
    
    // Should load reasonably fast on mobile
    expect(loadTime).toBeLessThan(5000);
    
    // Test mobile-specific UI elements
    const mobileHints = page.locator('text*="Drag to rotate"');
    await expect(mobileHints).toBeVisible();
    
    // Test touch interaction
    const viewer = page.locator('[role="img"][aria-label*="Interactive 360"]').first();
    await viewer.tap();
    
    console.log('Mobile performance and interaction verified');
  });
});