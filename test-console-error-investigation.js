/**
 * Phase 1: Console Error Investigation
 * Investigating actual root cause of console errors on customization pages
 */

const { chromium } = require('playwright');

async function investigateConsoleErrors() {
  console.log('🔍 Phase 1: Investigating console errors on customization pages...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const consoleErrors = [];
  const networkErrors = [];
  
  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  // Capture network failures
  page.on('response', response => {
    if (!response.ok() && response.status() >= 400) {
      networkErrors.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });
  
  try {
    // Test 1: Homepage customization preview
    console.log('\n📱 Testing Homepage Customization Preview...');
    await page.goto('http://localhost:3001/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Allow time for 3D loading
    
    console.log(`Homepage errors found: ${consoleErrors.length}`);
    consoleErrors.forEach((error, i) => {
      console.log(`  ❌ [${i+1}] ${error}`);
    });
    
    console.log(`Homepage network errors: ${networkErrors.length}`);
    networkErrors.forEach((error, i) => {
      console.log(`  🌐 [${i+1}] ${error.status} ${error.url}`);
    });
    
    // Clear arrays for next test
    consoleErrors.length = 0;
    networkErrors.length = 0;
    
    // Test 2: Dedicated customizer page
    console.log('\n🎨 Testing Dedicated Customizer Page...');
    await page.goto('http://localhost:3001/customizer');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // Allow more time for 3D customizer
    
    console.log(`Customizer errors found: ${consoleErrors.length}`);
    consoleErrors.forEach((error, i) => {
      console.log(`  ❌ [${i+1}] ${error}`);
    });
    
    console.log(`Customizer network errors: ${networkErrors.length}`);
    networkErrors.forEach((error, i) => {
      console.log(`  🌐 [${i+1}] ${error.status} ${error.url}`);
    });
    
    // Test 3: Material switching behavior
    console.log('\n⚗️ Testing Material Switch Operations...');
    const materialButtons = page.locator('[data-material]');
    const count = await materialButtons.count();
    console.log(`Found ${count} material buttons`);
    
    if (count > 0) {
      // Clear arrays for material switch test
      consoleErrors.length = 0;
      networkErrors.length = 0;
      
      // Click each material button
      for (let i = 0; i < count; i++) {
        const materialButton = materialButtons.nth(i);
        const material = await materialButton.getAttribute('data-material');
        console.log(`\n  🔄 Switching to material: ${material}`);
        
        await materialButton.click();
        await page.waitForTimeout(1000); // Wait for material switch
        
        const switchErrors = consoleErrors.length;
        const switchNetworkErrors = networkErrors.length;
        
        if (switchErrors > 0 || switchNetworkErrors > 0) {
          console.log(`    ⚠️ Material ${material} errors: ${switchErrors} console, ${switchNetworkErrors} network`);
          consoleErrors.forEach((error, j) => {
            console.log(`      ❌ ${error}`);
          });
          networkErrors.forEach((error, j) => {
            console.log(`      🌐 ${error.status} ${error.url}`);
          });
        } else {
          console.log(`    ✅ Material ${material} switched successfully`);
        }
        
        // Clear for next material
        consoleErrors.length = 0;
        networkErrors.length = 0;
      }
    }
    
    console.log('\n🏁 Console error investigation completed');
    
  } catch (error) {
    console.error('Investigation failed:', error);
  } finally {
    await browser.close();
  }
}

// Run investigation
investigateConsoleErrors();