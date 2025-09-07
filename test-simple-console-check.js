const { test } = require('@playwright/test');

test('Simple Console Error Check', async ({ page }) => {
  const errors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(`PAGE ERROR: ${error.message}`);
  });
  
  console.log('🔍 Checking homepage for console errors...');
  await page.goto('/', { timeout: 10000 });
  await page.waitForTimeout(3000);
  
  console.log('📊 Console Errors Found:', errors.length);
  
  if (errors.length > 0) {
    console.log('❌ Errors:');
    errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
  } else {
    console.log('✅ No critical console errors detected');
  }
  
  await page.screenshot({ path: 'console-check.png' });
});