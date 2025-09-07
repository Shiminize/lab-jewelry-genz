const { chromium } = require('playwright');

(async () => {
  console.log('🧪 Phase 7 Day 2: Console Error Check Starting...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const consoleMessages = [];
  
  // Capture all console messages
  page.on('console', (msg) => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
  });
  
  try {
    // Test homepage
    console.log('📍 Testing homepage...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Test customizer page (our main target)
    console.log('📍 Testing customizer page...');
    await page.goto('http://localhost:3000/customizer', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test catalog page
    console.log('📍 Testing catalog page...');
    await page.goto('http://localhost:3000/catalog', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Analyze console messages
    const errors = consoleMessages.filter(m => m.type === 'error');
    const warnings = consoleMessages.filter(m => m.type === 'warning');
    
    // Filter critical errors (excluding expected development warnings)
    const criticalErrors = errors.filter(msg => 
      !msg.text.includes('401') && 
      !msg.text.includes('NextAuth Warning') &&
      !msg.text.includes('REDIS_URL not found') &&
      !msg.text.includes('fast-refresh') &&
      !msg.text.includes('chunk-') &&
      !msg.text.includes('NetworkError') &&
      !msg.text.includes('localhost:3000/_next') &&
      !msg.text.includes('favicon.ico')
    );
    
    // Filter token-related errors
    const tokenErrors = errors.filter(msg => 
      msg.text.includes('token-') ||
      msg.text.includes('spacing') ||
      msg.text.includes('Tailwind CSS')
    );
    
    // Filter customizer-related errors
    const customizerErrors = errors.filter(msg =>
      msg.text.includes('customizer') ||
      msg.text.includes('MaterialStatusBar') ||
      msg.text.includes('StickyBoundary') ||
      msg.text.includes('ViewerControls') ||
      msg.text.includes('ProductCustomizer')
    );
    
    console.log('📊 Console Analysis Results:');
    console.log('════════════════════════════════════');
    console.log(`Total messages: ${consoleMessages.length}`);
    console.log(`Total errors: ${errors.length}`);
    console.log(`Total warnings: ${warnings.length}`);
    console.log(`Critical errors: ${criticalErrors.length}`);
    console.log(`Token-related errors: ${tokenErrors.length}`);
    console.log(`Customizer-related errors: ${customizerErrors.length}`);
    
    if (criticalErrors.length > 0) {
      console.log('\\n❌ Critical Errors Found:');
      console.log('═══════════════════════════');
      criticalErrors.slice(0, 5).forEach((error, index) => {
        console.log(`${index + 1}. ${error.text.substring(0, 120)}...`);
      });
    } else {
      console.log('\\n✅ No Critical Errors Found');
    }
    
    if (tokenErrors.length > 0) {
      console.log('\\n⚠️ Token-Related Errors:');
      console.log('══════════════════════════');
      tokenErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.text}`);
      });
    } else {
      console.log('\\n✅ No Token-Related Errors Found');
    }
    
    if (customizerErrors.length > 0) {
      console.log('\\n🎛️ Customizer-Related Errors:');
      console.log('════════════════════════════════');
      customizerErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.text}`);
      });
    } else {
      console.log('\\n✅ No Customizer-Related Errors Found');
    }
    
    // Take screenshot of customizer for visual validation
    await page.goto('http://localhost:3000/customizer', { waitUntil: 'networkidle' });
    await page.screenshot({ 
      path: 'phase7-day2-console-validation.png', 
      fullPage: true 
    });
    console.log('\\n📸 Screenshot saved: phase7-day2-console-validation.png');
    
    // Summary
    console.log('\\n🎉 Phase 7 Day 2 Console Check Summary:');
    console.log('═══════════════════════════════════════════');
    if (criticalErrors.length === 0 && tokenErrors.length === 0 && customizerErrors.length === 0) {
      console.log('✅ PASS: No critical, token, or customizer errors detected');
      console.log('✅ Token migration appears successful');
      console.log('✅ 3D Customizer system functioning without console errors');
    } else {
      console.log('❌ ISSUES DETECTED:');
      if (criticalErrors.length > 0) console.log(`  - ${criticalErrors.length} critical errors`);
      if (tokenErrors.length > 0) console.log(`  - ${tokenErrors.length} token-related errors`);
      if (customizerErrors.length > 0) console.log(`  - ${customizerErrors.length} customizer errors`);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();