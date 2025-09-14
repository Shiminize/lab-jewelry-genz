import { test, expect } from '@playwright/test';

test.describe('Webpack Module Error Fix Verification', () => {
  test('no webpack runtime module errors on homepage', async ({ page }) => {
    const errors = [];
    const consoleMessages = [];
    
    page.on('console', msg => { 
      consoleMessages.push(msg.text());
      if (msg.type() === 'error') errors.push(msg.text()); 
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for webpack module errors
    const webpackErrors = errors.filter(e => e.includes('__webpack_modules__'));
    expect(webpackErrors).toHaveLength(0);
    
    // Verify page loaded correctly
    await expect(page.locator('h1')).toBeVisible();
  });

  test('no webpack runtime module errors on customizer page', async ({ page }) => {
    const errors = [];
    
    page.on('console', msg => { 
      if (msg.type() === 'error') errors.push(msg.text()); 
    });
    
    await page.goto('/customizer');
    await page.waitForLoadState('networkidle');
    
    // Wait for dynamic imports to load
    await page.waitForTimeout(3000);
    
    // Check for webpack module errors
    const webpackErrors = errors.filter(e => e.includes('__webpack_modules__'));
    expect(webpackErrors).toHaveLength(0);
    
    // Verify customizer components loaded
    await expect(page.locator('[data-testid="product-customizer"]')).toBeVisible();
  });

  test('no webpack runtime module errors on catalog page', async ({ page }) => {
    const errors = [];
    
    page.on('console', msg => { 
      if (msg.type() === 'error') errors.push(msg.text()); 
    });
    
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    
    // Check for webpack module errors
    const webpackErrors = errors.filter(e => e.includes('__webpack_modules__'));
    expect(webpackErrors).toHaveLength(0);
    
    // Verify catalog loaded
    await expect(page.locator('h1')).toBeVisible();
  });

  test('dynamic imports work correctly', async ({ page }) => {
    const errors = [];
    
    page.on('console', msg => { 
      if (msg.type() === 'error') errors.push(msg.text()); 
    });
    
    await page.goto('/customizer');
    await page.waitForLoadState('networkidle');
    
    // Wait for all dynamic components to load
    await page.waitForTimeout(5000);
    
    // Verify dynamic components are present
    const hasCustomizer = await page.locator('[data-testid="product-customizer"]').count() > 0;
    expect(hasCustomizer).toBe(true);
    
    // Check no module resolution errors
    const moduleErrors = errors.filter(e => 
      e.includes('module') && 
      (e.includes('not found') || e.includes('undefined'))
    );
    expect(moduleErrors).toHaveLength(0);
  });
});