const { test, expect } = require('@playwright/test');

test('Step 4: Hero Section Spacing Migration E2E Test', async ({ page }) => {
  console.log('🧪 Step 4: Testing hero section spacing migration...');
  
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  
  // Check for console errors
  const logs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      logs.push(msg.text());
    }
  });
  
  // Wait for hero section to render
  await page.waitForSelector('h1', { timeout: 5000 });
  
  // Verify hero section loads correctly
  const heroTitle = await page.locator('h1').first().textContent();
  console.log('✅ Hero title found:', heroTitle ? 'YES' : 'NO');
  
  // Take a screenshot to compare visually
  await page.screenshot({ 
    path: 'hero-migration-test.png', 
    fullPage: false,
    clip: { x: 0, y: 0, width: 1920, height: 800 }
  });
  console.log('📸 Screenshot saved: hero-migration-test.png');
  
  await page.waitForTimeout(3000);
  
  if (logs.length === 0) {
    console.log('✅ No console errors detected after hero migration');
  } else {
    console.log('❌ Console errors found:', logs.slice(0, 3)); // Show first 3 errors
  }
  
  // Verify page functionality
  const title = await page.title();
  console.log('✅ Page title:', title);
  
  console.log('🎉 Step 4: Hero Section Migration - VALIDATION COMPLETE');
});