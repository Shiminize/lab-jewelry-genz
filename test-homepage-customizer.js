const { test, expect } = require('@playwright/test');

test('Homepage customizer visual and console check', async ({ page }) => {
  console.log('🔍 Testing homepage customizer visual and console issues...');
  
  // Capture console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text()
    });
  });
  
  // Navigate to homepage
  await page.goto('http://localhost:3000');
  console.log('✅ Navigation to homepage complete');
  
  // Wait for page load
  await page.waitForLoadState('networkidle');
  console.log('✅ Page load complete');
  
  // Look for CustomizerPreviewSection
  const customizerSection = page.locator('section').filter({ hasText: 'Experience 3D' });
  const customizerCount = await customizerSection.count();
  
  if (customizerCount > 0) {
    console.log('✅ CustomizerPreviewSection found');
    
    // Scroll to customizer section
    await customizerSection.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);
    
    // Check if material switcher loads
    const materialSwitcher = page.locator('[data-testid="material-switcher"]');
    const switcherVisible = await materialSwitcher.isVisible().catch(() => false);
    
    if (switcherVisible) {
      console.log('✅ Material switcher is visible');
    } else {
      console.log('❌ Material switcher not visible');
    }
  } else {
    console.log('❌ CustomizerPreviewSection not found');
  }
  
  // Check for console errors
  const errors = consoleMessages.filter(msg => 
    msg.type === 'error' || 
    (msg.type === 'warn' && msg.text.includes('Error'))
  );
  
  if (errors.length > 0) {
    console.log('🚨 Console errors/warnings found:');
    errors.forEach(error => {
      console.log(`  [${error.type.toUpperCase()}] ${error.text}`);
    });
  } else {
    console.log('✅ No console errors detected');
  }
  
  // Check for specific analytics messages
  const analyticsLogs = consoleMessages.filter(msg => 
    msg.text.includes('Analytics') || msg.text.includes('CustomizerAnalytics')
  );
  
  if (analyticsLogs.length > 0) {
    console.log('📊 Analytics logs found:');
    analyticsLogs.forEach(log => {
      console.log(`  ${log.text}`);
    });
  }
  
  // Take full page screenshot
  await page.screenshot({ 
    path: 'homepage-customizer-visual-check.png', 
    fullPage: true 
  });
  console.log('📸 Full page screenshot saved as homepage-customizer-visual-check.png');
  
  // Take screenshot of customizer section if found
  if (customizerCount > 0) {
    await customizerSection.first().screenshot({ 
      path: 'customizer-section-detail.png' 
    });
    console.log('📸 Customizer section screenshot saved as customizer-section-detail.png');
  }
  
  // Summary
  console.log('📋 Test Summary:');
  console.log(`  - Customizer section found: ${customizerCount > 0 ? 'Yes' : 'No'}`);
  console.log(`  - Console errors: ${errors.length}`);
  console.log(`  - Analytics logs: ${analyticsLogs.length}`);
  console.log(`  - Total console messages: ${consoleMessages.length}`);
});