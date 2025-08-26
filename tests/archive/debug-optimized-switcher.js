/**
 * Debug OptimizedMaterialSwitcher Loading
 */

const { chromium } = require('playwright');

async function debugOptimizedSwitcher() {
  console.log('🔍 DEBUGGING OPTIMIZED MATERIAL SWITCHER');
  console.log('=======================================');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  const page = await browser.newPage();
  
  // Listen to all console messages
  page.on('console', msg => {
    const msgType = msg.type();
    if (msgType === 'log' || msgType === 'warn' || msgType === 'error') {
      console.log(`🗨️ ${msgType.toUpperCase()}: ${msg.text()}`);
    }
  });
  
  // Listen to network requests
  page.on('request', request => {
    if (request.url().includes('3d-sequences') || request.url().includes('.webp')) {
      console.log(`📡 REQUEST: ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('3d-sequences') || response.url().includes('.webp')) {
      console.log(`📡 RESPONSE: ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    console.log('🌐 Navigating to test-performance page...');
    await page.goto('http://localhost:3001/test-performance', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    console.log('✅ Page loaded, checking for OptimizedMaterialSwitcher...');
    
    // Wait for the component to appear
    const switcher = await page.waitForSelector('[data-testid="material-switcher"]', {
      timeout: 10000
    }).catch(() => null);
    
    if (!switcher) {
      console.log('❌ Material switcher not found');
      return;
    }
    
    console.log('✅ Material switcher found');
    
    // Check if it's still loading
    const loadingElements = await page.$$('.animate-spin');
    console.log(`🔄 Loading spinners: ${loadingElements.length}`);
    
    const loadingText = await page.textContent('body');
    const hasLoadingText = loadingText.includes('Optimizing for instant switches');
    console.log(`📝 Has loading text: ${hasLoadingText}`);
    
    // Check for material buttons
    const materialButtons = await page.$$('button');
    console.log(`🔘 Material buttons found: ${materialButtons.length}`);
    
    // Wait for up to 30 seconds for loading to complete
    console.log('⏳ Waiting for preloading to complete...');
    
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      const bodyText = await page.textContent('body');
      const stillLoading = bodyText.includes('Optimizing for instant switches') || 
                          bodyText.includes('Loading...') ||
                          bodyText.includes('%');
      
      if (!stillLoading) {
        console.log(`✅ Loading completed after ${attempts} seconds!`);
        break;
      }
      
      console.log(`⏳ Still loading... (${attempts + 1}/${maxAttempts})`);
      await page.waitForTimeout(1000);
      attempts++;
    }
    
    if (attempts >= maxAttempts) {
      console.log('❌ Timeout waiting for loading to complete');
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'debug-loading-timeout.png', fullPage: true });
      console.log('📸 Screenshot saved as debug-loading-timeout.png');
    } else {
      // Try clicking a material button
      const platinumButton = await page.$('button:has-text("Platinum")');
      if (platinumButton) {
        console.log('🎨 Testing Platinum material click...');
        await platinumButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ Material click test completed');
      }
      
      // Take success screenshot
      await page.screenshot({ path: 'debug-success.png', fullPage: true });
      console.log('📸 Success screenshot saved as debug-success.png');
    }
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
    
    // Take error screenshot
    await page.screenshot({ path: 'debug-error.png', fullPage: true });
    console.log('📸 Error screenshot saved as debug-error.png');
  } finally {
    console.log('🔍 Debug completed, keeping browser open for manual inspection...');
    
    // Keep browser open for 30 seconds for manual inspection
    await page.waitForTimeout(30000);
    await browser.close();
  }
}

// Run debug
debugOptimizedSwitcher().then(() => {
  console.log('🏁 Debug session completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Debug session failed:', error);
  process.exit(1);
});