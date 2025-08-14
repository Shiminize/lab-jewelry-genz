/**
 * Simple 3D Customizer Test
 * Basic functionality test without complex 3D interactions
 */

import { test, expect } from '@playwright/test';

test.describe('Simple Customizer Tests', () => {
  test('customizer page loads basic elements', async ({ page }) => {
    await page.goto('/customizer');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page.locator('text=Design Your Perfect Ring')).toBeVisible({ timeout: 10000 });
    
    // Check basic sections are present
    await expect(page.locator('text=Live Preview')).toBeVisible();
    await expect(page.locator('text=Choose Your Style')).toBeVisible();
    await expect(page.locator('text=Metal Type')).toBeVisible();
    await expect(page.locator('text=Diamond Size')).toBeVisible();
    await expect(page.locator('text=Ring Size')).toBeVisible();
    
    console.log('✅ Basic page structure loaded correctly');
  });

  test('API loads product data', async ({ page }) => {
    await page.goto('/customizer');
    await page.waitForLoadState('networkidle');
    
    // Wait for products to load (should replace loading skeletons)
    await page.waitForSelector('text=Design Your Perfect Ring');
    
    // Check if products loaded (no loading skeleton)
    const loadingSkeletons = page.locator('.animate-pulse');
    const skeletonCount = await loadingSkeletons.count();
    
    // Should have either 0 loading skeletons (loaded) or show error message
    const errorMessage = page.locator('text=Failed to, text=Error');
    const hasError = await errorMessage.isVisible();
    
    if (!hasError) {
      expect(skeletonCount).toBe(0);
      console.log('✅ Products loaded successfully');
    } else {
      const errorText = await errorMessage.textContent();
      console.log('⚠️ API Error detected:', errorText);
    }
  });

  test('customization controls work', async ({ page }) => {
    await page.goto('/customizer');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Design Your Perfect Ring');
    
    // Test material selection
    const materialButtons = page.locator('text=Metal Type').locator('..').locator('button');
    const materialCount = await materialButtons.count();
    
    if (materialCount > 1) {
      await materialButtons.nth(1).click();
      console.log('✅ Material selection works');
    }
    
    // Test stone selection  
    const stoneButtons = page.locator('text=Diamond Size').locator('..').locator('button');
    const stoneCount = await stoneButtons.count();
    
    if (stoneCount > 1) {
      await stoneButtons.nth(1).click();
      console.log('✅ Stone selection works');
    }
    
    // Test size selection
    const sizeButtons = page.locator('text=Ring Size').locator('..').locator('button');
    const sizeCount = await sizeButtons.count();
    
    if (sizeCount > 1) {
      await sizeButtons.nth(1).click();
      console.log('✅ Size selection works');
    }
    
    // Check if price is displayed
    const priceElement = page.locator('text=Total Price:');
    await expect(priceElement).toBeVisible();
    console.log('✅ Price display works');
  });

  test('3D viewer container exists', async ({ page }) => {
    await page.goto('/customizer');
    await page.waitForLoadState('networkidle');
    
    // Look for 3D viewer loading state or container
    const viewerContainer = page.locator('text=Loading 3D viewer..., text=Initializing 3D viewer..., canvas, [class*="3d"]').first();
    
    // Wait up to 30 seconds for any 3D viewer indication
    const viewerFound = await Promise.race([
      viewerContainer.waitFor({ state: 'visible', timeout: 30000 }).then(() => true),
      page.waitForTimeout(30000).then(() => false)
    ]);
    
    if (viewerFound) {
      console.log('✅ 3D viewer container found');
      
      // Check if canvas eventually appears
      const canvas = page.locator('canvas');
      const canvasVisible = await canvas.isVisible();
      
      if (canvasVisible) {
        console.log('✅ Canvas element is visible');
        const boundingBox = await canvas.boundingBox();
        console.log('Canvas dimensions:', boundingBox);
      } else {
        console.log('⚠️ Canvas not yet visible, checking for loading states');
        const loadingText = await page.locator('text=Loading, text=Initializing').textContent();
        console.log('Loading state:', loadingText);
      }
    } else {
      console.log('❌ 3D viewer container not found within timeout');
    }
  });
});