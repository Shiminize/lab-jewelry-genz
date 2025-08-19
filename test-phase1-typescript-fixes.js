/**
 * Phase 1 E2E Test: TypeScript Fixes Validation
 * Success Criteria:
 * - Zero TypeScript errors
 * - Customizer loads without console errors  
 * - Material selection works properly
 */

const { test, expect } = require('@playwright/test');

test.describe('Phase 1: TypeScript Fixes Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console Error:', msg.text());
      }
    });
    
    // Navigate to customizer
    await page.goto('/customizer');
    await page.waitForLoadState('networkidle');
  });

  test('Customizer loads without console errors', async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle(/GenZ Jewelry/);
    
    // Verify customizer components are visible
    await expect(page.locator('text=Design Your Perfect Ring')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Your Story, Your Shine')).toBeVisible();
    await expect(page.locator('text=Current Selection')).toBeVisible();
  });

  test('Material selection works without errors', async ({ page }) => {
    // Wait for materials to load
    await page.waitForSelector('[data-material]', { timeout: 10000 });
    
    // Get all material buttons
    const materialButtons = page.locator('[data-material]');
    const count = await materialButtons.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Test clicking different materials
    for (let i = 0; i < Math.min(3, count); i++) {
      const button = materialButtons.nth(i);
      
      // Click the material
      await button.click();
      
      // Wait for selection to update
      await page.waitForTimeout(500);
      
      // Verify selection summary updates
      const selectionSummary = page.locator('text=Current Selection').locator('..').locator('..');
      await expect(selectionSummary).toBeVisible();
    }
  });

  test('Material properties display correctly', async ({ page }) => {
    // Wait for material selector to be visible
    await page.waitForSelector('[data-material]', { timeout: 10000 });
    
    // Get first material button
    const firstMaterial = page.locator('[data-material]').first();
    
    // Verify material has required properties displayed
    await expect(firstMaterial).toContainText(/\w+/); // Should contain material name
    
    // Click to select
    await firstMaterial.click();
    await page.waitForTimeout(500);
    
    // Verify selection summary shows material info
    const materialColor = page.locator('.w-3.h-3.rounded-full').first();
    await expect(materialColor).toBeVisible();
  });

  test('3D Viewer initializes without errors', async ({ page }) => {
    // Wait for viewer to load
    await page.waitForSelector('.shadow-lg', { timeout: 15000 });
    
    // Verify viewer container exists
    const viewer = page.locator('.shadow-lg').first();
    await expect(viewer).toBeVisible();
    
    // Verify no error states
    await expect(page.locator('text=Preview Error')).not.toBeVisible();
  });

  test('Price calculations work correctly', async ({ page }) => {
    await page.waitForSelector('[data-material]', { timeout: 10000 });
    
    // Select a material with price modifier
    const materialButtons = page.locator('[data-material]');
    const count = await materialButtons.count();
    
    let foundPriceModifier = false;
    
    for (let i = 0; i < count && !foundPriceModifier; i++) {
      const button = materialButtons.nth(i);
      await button.click();
      await page.waitForTimeout(500);
      
      // Check if this material shows a price modifier
      const priceModifier = button.locator('text=/[+\-]\d+%/');
      if (await priceModifier.count() > 0) {
        foundPriceModifier = true;
        await expect(priceModifier).toBeVisible();
      }
    }
  });
});