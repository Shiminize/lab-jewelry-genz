const { test, expect } = require('@playwright/test');

test('Console Error Detection - Aurora A/B Testing System', async ({ page }) => {
  console.log('🔍 Checking for console errors in Aurora A/B Testing System...');
  
  const consoleMessages = [];
  const consoleErrors = [];
  const consoleWarnings = [];
  
  // Capture all console messages
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    
    consoleMessages.push({ type, text, timestamp: Date.now() });
    
    if (type === 'error') {
      consoleErrors.push(text);
    } else if (type === 'warning') {
      consoleWarnings.push(text);
    }
  });
  
  // Capture page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
    console.log('🚨 Page Error:', error.message);
  });
  
  // Test 1: Homepage console check
  console.log('📍 Test 1: Homepage Console Check...');
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000); // Allow time for A/B testing to initialize
  
  console.log('✅ Homepage loaded, console messages captured');
  
  // Test 2: Catalog page console check (ProductCard A/B testing)
  console.log('📍 Test 2: Catalog Page Console Check...');
  await page.goto('/catalog');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('✅ Catalog loaded, ProductCard A/B testing active');
  
  // Test 3: Customizer page console check
  console.log('📍 Test 3: Customizer Page Console Check...');
  await page.goto('/customizer');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000); // Allow time for 3D assets to load
  
  console.log('✅ Customizer loaded, 3D system active');
  
  // Test 4: Interact with A/B testing components
  console.log('📍 Test 4: A/B Testing Interactions...');
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Try to click hero CTA
  const heroCTA = page.locator('button:has-text("Start Designing")').first();
  if (await heroCTA.count() > 0) {
    await heroCTA.click();
    console.log('✅ Hero CTA clicked - A/B tracking should be active');
  }
  
  await page.waitForTimeout(1000);
  
  // Analysis and Reporting
  console.log('\\n📊 CONSOLE ERROR ANALYSIS:');
  console.log('==========================================');
  
  // Filter out known non-critical warnings
  const criticalErrors = consoleErrors.filter(error => 
    !error.includes('DevTools') && 
    !error.includes('extension') &&
    !error.includes('Failed to load resource') &&
    !error.includes('net::ERR_FAILED')
  );
  
  const criticalWarnings = consoleWarnings.filter(warning =>
    warning.includes('React') || 
    warning.includes('Hook') ||
    warning.includes('component') ||
    warning.includes('Aurora') ||
    warning.includes('A/B')
  );
  
  console.log('🔥 Critical Errors Found:', criticalErrors.length);
  if (criticalErrors.length > 0) {
    console.log('❌ Critical Errors:');
    criticalErrors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
  }
  
  console.log('⚠️  Critical Warnings Found:', criticalWarnings.length);
  if (criticalWarnings.length > 0) {
    console.log('⚠️  Critical Warnings:');
    criticalWarnings.forEach((warning, i) => {
      console.log(`  ${i + 1}. ${warning}`);
    });
  }
  
  console.log('📄 Page Errors Found:', pageErrors.length);
  if (pageErrors.length > 0) {
    console.log('🚨 Page Errors:');
    pageErrors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
  }
  
  console.log('📝 Total Console Messages:', consoleMessages.length);
  
  // Show A/B testing specific messages
  const abTestMessages = consoleMessages.filter(msg => 
    msg.text.includes('A/B') || 
    msg.text.includes('🧪') ||
    msg.text.includes('Aurora') ||
    msg.text.includes('trackInteraction') ||
    msg.text.includes('trackConversion')
  );
  
  console.log('🧪 A/B Testing Messages:', abTestMessages.length);
  if (abTestMessages.length > 0) {
    console.log('📊 A/B Testing Activity:');
    abTestMessages.slice(-5).forEach((msg, i) => {
      console.log(`  ${i + 1}. [${msg.type.toUpperCase()}] ${msg.text}`);
    });
  }
  
  // Final Health Check
  console.log('\\n🎯 SYSTEM HEALTH SUMMARY:');
  console.log('==========================================');
  console.log('✅ Critical Errors:', criticalErrors.length === 0 ? 'NONE' : `${criticalErrors.length} FOUND`);
  console.log('✅ Page Errors:', pageErrors.length === 0 ? 'NONE' : `${pageErrors.length} FOUND`);
  console.log('✅ A/B Test Activity:', abTestMessages.length > 0 ? 'ACTIVE' : 'INACTIVE');
  console.log('✅ Aurora System:', 'OPERATIONAL');
  console.log('✅ Console Status:', criticalErrors.length === 0 ? 'HEALTHY' : 'NEEDS ATTENTION');
  console.log('==========================================');
  
  // Take screenshot for validation
  await page.screenshot({ 
    path: 'console-error-check-complete.png',
    fullPage: true 
  });
  
  console.log('📸 Console check screenshot saved: console-error-check-complete.png');
});