/**
 * Debug Customizer Console Errors
 */

import { test, expect } from '@playwright/test';

test('debug customizer console errors', async ({ page }) => {
  const errors: string[] = [];
  const logs: string[] = [];
  
  // Capture console errors and logs
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`ERROR: ${msg.text()}`);
    } else if (msg.type() === 'log') {
      logs.push(`LOG: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    errors.push(`PAGE ERROR: ${error.message}`);
  });
  
  await page.goto('/customizer');
  await page.waitForLoadState('networkidle');
  
  // Wait a bit for React hydration and API calls
  await page.waitForTimeout(5000);
  
  // Log all captured errors and logs
  console.log('\n=== CONSOLE ERRORS ===');
  errors.forEach(error => console.log(error));
  
  console.log('\n=== CONSOLE LOGS ===');
  logs.forEach(log => console.log(log));
  
  // Check current page state
  const pageTitle = await page.title();
  console.log('\n=== PAGE STATE ===');
  console.log('Page title:', pageTitle);
  
  const skeletons = await page.locator('.animate-pulse').count();
  console.log('Loading skeletons:', skeletons);
  
  const hasErrorText = await page.locator('text=Failed to, text=Error').isVisible();
  console.log('Has error text:', hasErrorText);
  
  if (hasErrorText) {
    const errorText = await page.locator('text=Failed to, text=Error').textContent();
    console.log('Error message:', errorText);
  }
  
  // Check if 3D viewer container exists
  const viewer3D = await page.locator('[class*="3d"], canvas, text=Loading 3D viewer').count();
  console.log('3D viewer elements found:', viewer3D);
  
  // Check network requests
  const apiResponsePromise = page.waitForResponse('/api/products/customizable');
  await page.reload();
  
  try {
    const apiResponse = await apiResponsePromise;
    console.log('API response status:', apiResponse.status());
    const responseBody = await apiResponse.json();
    console.log('API response success:', responseBody.success);
    console.log('API data count:', responseBody.data?.length || 0);
  } catch (error) {
    console.log('API request failed:', error);
  }
});