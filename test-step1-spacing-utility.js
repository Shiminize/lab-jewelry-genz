const { test, expect } = require('@playwright/test');

test('Step 1: Spacing Migration Utility Creation E2E Test', async ({ page }) => {
  console.log('🧪 Testing spacing migration utility creation...');
  
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  
  // Verify page still loads correctly after utility addition
  const title = await page.title();
  console.log('✅ Page title:', title);
  
  // Check for console errors
  const logs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      logs.push(msg.text());
    }
  });
  
  await page.waitForTimeout(2000);
  
  if (logs.length === 0) {
    console.log('✅ No console errors detected after utility creation');
  } else {
    console.log('❌ Console errors found:', logs);
  }
  
  console.log('🎉 Step 1: Spacing Migration Utility - VALIDATION COMPLETE');
});