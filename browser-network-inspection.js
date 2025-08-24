/**
 * Browser Network Inspection for Cache-Busting Verification
 * Direct inspection of actual network requests to verify cache-busting is working
 */

const { chromium } = require('playwright');

async function inspectNetworkActivity() {
  console.log('🌐 BROWSER NETWORK INSPECTION FOR CACHE-BUSTING');
  console.log('===============================================\n');

  const browser = await chromium.launch({ 
    headless: false,
    devtools: true // Open DevTools for manual inspection
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  // Network monitoring
  const networkRequests = [];
  const imageRequests = [];
  
  page.on('request', request => {
    const url = request.url();
    networkRequests.push({
      url,
      method: request.method(),
      resourceType: request.resourceType(),
      timestamp: Date.now()
    });
    
    if (request.resourceType() === 'image' || 
        url.includes('.webp') || url.includes('.avif') || url.includes('.png')) {
      imageRequests.push({
        url,
        method: request.method(),
        timestamp: Date.now(),
        hasCacheBusting: url.includes('?v=') && /\?v=\d{13}/.test(url)
      });
      console.log(`📸 IMAGE REQUEST: ${url}`);
      console.log(`   Cache-busting: ${url.includes('?v=') && /\?v=\d{13}/.test(url) ? '✅' : '❌'}`);
    }
  });

  page.on('response', response => {
    const url = response.url();
    if (response.request().resourceType() === 'image' || 
        url.includes('.webp') || url.includes('.avif') || url.includes('.png')) {
      console.log(`📥 IMAGE RESPONSE: ${url} - Status: ${response.status()}`);
      console.log(`   From cache: ${response.status() === 304 ? 'YES' : 'NO'}`);
    }
  });

  try {
    console.log('🚀 Opening customizer page with DevTools...');
    await page.goto('http://localhost:3000/customizer', { 
      waitUntil: 'load',
      timeout: 20000 
    });
    
    console.log('⏳ Waiting for page to fully load...');
    await page.waitForTimeout(5000);

    console.log('\n🔍 Looking for material control buttons...');
    
    // Try different selectors for material buttons
    const buttonSelectors = [
      'button:has-text("Platinum")',
      'button:has-text("Gold")',  
      'button:has-text("White")',
      'button:has-text("Yellow")',
      'button:has-text("Rose")',
      '[data-testid*="material"]',
      '.material-button',
      'button[class*="material"]'
    ];

    let materialsFound = false;
    
    for (const selector of buttonSelectors) {
      try {
        const buttons = await page.locator(selector).all();
        if (buttons.length > 0) {
          console.log(`✅ Found ${buttons.length} buttons with selector: ${selector}`);
          materialsFound = true;
          
          // Click first few buttons to test material switching
          for (let i = 0; i < Math.min(3, buttons.length); i++) {
            try {
              const buttonText = await buttons[i].textContent();
              console.log(`🔄 Clicking material button: "${buttonText}"`);
              await buttons[i].click();
              await page.waitForTimeout(2000); // Wait for images to load
            } catch (e) {
              console.log(`⚠️  Could not click button ${i + 1}: ${e.message}`);
            }
          }
          break; // Found working selector, stop trying others
        }
      } catch (e) {
        // Try next selector
      }
    }

    if (!materialsFound) {
      console.log('ℹ️  No specific material buttons found, but initial image loading test is still valid');
    }

    console.log('\n📊 NETWORK ANALYSIS RESULTS');
    console.log('============================');
    console.log(`Total network requests: ${networkRequests.length}`);
    console.log(`Image requests: ${imageRequests.length}`);
    
    if (imageRequests.length > 0) {
      const cacheBustedImages = imageRequests.filter(req => req.hasCacheBusting);
      const cacheBustingRate = (cacheBustedImages.length / imageRequests.length) * 100;
      
      console.log(`Cache-busted images: ${cacheBustedImages.length}/${imageRequests.length} (${cacheBustingRate.toFixed(1)}%)`);
      
      console.log('\n📋 DETAILED IMAGE REQUEST ANALYSIS:');
      imageRequests.forEach((req, i) => {
        console.log(`${i + 1}. ${req.url}`);
        console.log(`   Cache-busting: ${req.hasCacheBusting ? '✅ YES' : '❌ NO'}`);
        if (req.hasCacheBusting) {
          const timestamp = req.url.match(/\?v=(\d+)/);
          if (timestamp) {
            const ts = parseInt(timestamp[1]);
            const date = new Date(ts);
            console.log(`   Timestamp: ${ts} (${date.toISOString()})`);
          }
        }
      });

      // FINAL ASSESSMENT
      console.log(`\n🎯 CACHE-BUSTING ASSESSMENT:`);
      if (cacheBustingRate >= 95) {
        console.log('✅ EXCELLENT: Cache-busting is working perfectly');
      } else if (cacheBustingRate >= 80) {
        console.log('✅ GOOD: Cache-busting is working for most images');
      } else if (cacheBustingRate >= 50) {
        console.log('⚠️  PARTIAL: Cache-busting is partially working');
      } else {
        console.log('❌ ISSUE: Cache-busting may not be working correctly');
      }
    } else {
      console.log('⚠️  No image requests detected - this could indicate:');
      console.log('   1. Images are not loading (server issue)');
      console.log('   2. Different asset path structure');  
      console.log('   3. Images are embedded/cached differently');
    }

    // Take screenshot for manual verification
    await page.screenshot({ 
      path: '/Users/decepticonmanager/Projects/GenZJewelry_AUG_12/network-inspection-screenshot.png',
      fullPage: true 
    });
    console.log('\n📸 Screenshot saved: network-inspection-screenshot.png');

    console.log('\n👀 MANUAL VERIFICATION INSTRUCTIONS:');
    console.log('=====================================');
    console.log('1. The browser and DevTools are now open');
    console.log('2. Go to the Network tab in DevTools');
    console.log('3. Filter by "Img" to see only image requests');
    console.log('4. Look for requests with ?v=<timestamp> parameters');
    console.log('5. Try switching materials and observe new requests');
    console.log('6. Verify images appear bright and colorful');
    console.log('\nPress Ctrl+C to close browser and end test');

    // Keep browser open for manual inspection
    await page.waitForTimeout(300000); // 5 minutes for manual inspection

  } catch (error) {
    console.error('❌ Error during inspection:', error.message);
    await page.screenshot({ 
      path: '/Users/decepticonmanager/Projects/GenZJewelry_AUG_12/network-inspection-error.png' 
    });
  } finally {
    await browser.close();
    console.log('\n🏁 Network inspection completed');
  }
}

inspectNetworkActivity().catch(console.error);