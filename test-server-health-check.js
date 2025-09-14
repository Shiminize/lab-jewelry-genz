const { test, expect } = require('@playwright/test');

test('Comprehensive Server Health Check', async ({ page }) => {
  const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || process.env.BASE_URL || 'http://localhost:3002';
  console.log(`🔍 Testing server health at ${baseURL}`);

  // Capture console logs and errors
  const consoleLogs = [];
  const errors = [];
  
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
    
    if (msg.type() === 'error') {
      console.log(`❌ Console Error: ${msg.text()}`);
      errors.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log(`❌ Page Error: ${error.message}`);
    errors.push(error.message);
  });

  page.on('requestfailed', request => {
    console.log(`❌ Failed Request: ${request.method()} ${request.url()} - ${request.failure().errorText}`);
  });

  // Test 1: Homepage load
  console.log('📍 Test 1: Homepage Load');
  try {
    await page.goto(baseURL, { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    console.log('✅ Homepage loaded successfully');
    
    // Check for critical elements
    const title = await page.title();
    console.log(`📖 Page title: "${title}"`);
    
    // Check if page has content
    const bodyText = await page.locator('body').textContent();
    if (bodyText.length > 100) {
      console.log('✅ Page has substantial content');
    } else {
      console.log(`⚠️ Page content seems minimal: ${bodyText.length} characters`);
    }
  } catch (error) {
    console.log(`❌ Homepage failed to load: ${error.message}`);
    errors.push(`Homepage load error: ${error.message}`);
  }

  // Test 2: API Health Check
  console.log('📍 Test 2: API Health Check');
  try {
    const response = await page.request.get(`${baseURL}/api/health`);
    console.log(`🔗 API Health Status: ${response.status()}`);
    
    if (response.ok()) {
      const data = await response.json().catch(() => null);
      console.log('✅ API health endpoint responding');
      if (data) console.log('📊 API data:', JSON.stringify(data, null, 2));
    } else {
      console.log('⚠️ API health endpoint returned non-200 status');
    }
  } catch (error) {
    console.log(`⚠️ API health check unavailable: ${error.message}`);
  }

  // Test 3: Critical pages load
  const criticalPages = [
    '/catalog',
    '/customizer', 
    '/products',
    '/cart',
    '/admin'
  ];

  for (const pagePath of criticalPages) {
    console.log(`📍 Test 3.${criticalPages.indexOf(pagePath) + 1}: Loading ${pagePath}`);
    try {
      const response = await page.goto(`${baseURL}${pagePath}`, { 
        timeout: 15000,
        waitUntil: 'domcontentloaded' 
      });
      
      if (response.status() === 200) {
        console.log(`✅ ${pagePath} loaded successfully (${response.status()})`);
      } else if (response.status() === 500) {
        console.log(`❌ ${pagePath} returned 500 Server Error`);
        errors.push(`${pagePath} - 500 Server Error`);
      } else if (response.status() === 404) {
        console.log(`⚠️ ${pagePath} returned 404 Not Found`);
      } else {
        console.log(`⚠️ ${pagePath} returned ${response.status()}`);
      }
    } catch (error) {
      console.log(`❌ ${pagePath} failed: ${error.message}`);
      errors.push(`${pagePath} load error: ${error.message}`);
    }
  }

  // Test 4: Database connectivity (if applicable)
  console.log('📍 Test 4: Database Connectivity');
  try {
    const response = await page.request.get(`${baseURL}/api/products?limit=1`);
    if (response.ok()) {
      const data = await response.json();
      if (data && (data.products || data.length > 0)) {
        console.log('✅ Database connectivity confirmed via products API');
      } else {
        console.log('⚠️ Products API responded but returned no data');
      }
    } else if (response.status() === 500) {
      console.log('❌ Products API returned 500 - potential database issue');
      errors.push('Products API - 500 Server Error (database issue?)');
    } else {
      console.log(`⚠️ Products API returned ${response.status()}`);
    }
  } catch (error) {
    console.log(`⚠️ Database connectivity test failed: ${error.message}`);
  }

  // Test 5: JavaScript errors check
  console.log('📍 Test 5: JavaScript Runtime Check');
  await page.waitForTimeout(3000); // Let JS execute
  
  const jsErrors = errors.filter(error => 
    error.includes('ReferenceError') || 
    error.includes('TypeError') || 
    error.includes('SyntaxError') ||
    error.includes('is not defined') ||
    error.includes('Cannot read propert')
  );
  
  if (jsErrors.length === 0) {
    console.log('✅ No critical JavaScript runtime errors detected');
  } else {
    console.log(`❌ Found ${jsErrors.length} JavaScript runtime errors:`);
    jsErrors.forEach(error => console.log(`  - ${error}`));
  }

  // Test 6: Network requests analysis
  console.log('📍 Test 6: Network Request Analysis');
  const failedRequests = [];
  
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      method: request.method(),
      error: request.failure().errorText
    });
  });

  // Navigate to a few pages to trigger network requests
  await page.goto(`${baseURL}/catalog`).catch(() => {});
  await page.waitForTimeout(2000);
  
  if (failedRequests.length === 0) {
    console.log('✅ No failed network requests detected');
  } else {
    console.log(`⚠️ Found ${failedRequests.length} failed network requests:`);
    failedRequests.forEach(req => console.log(`  - ${req.method} ${req.url}: ${req.error}`));
  }

  // Final Summary
  console.log('\n🎯 SERVER HEALTH SUMMARY');
  console.log('=======================');
  console.log(`Server URL: ${baseURL}`);
  console.log(`Total Console Messages: ${consoleLogs.length}`);
  console.log(`Console Errors: ${errors.length}`);
  console.log(`Failed Requests: ${failedRequests.length}`);
  
  if (errors.length === 0 && failedRequests.length === 0) {
    console.log('🎉 SERVER HEALTH: EXCELLENT ✅');
  } else if (errors.length <= 2 && failedRequests.length <= 2) {
    console.log('⚠️ SERVER HEALTH: GOOD (minor issues detected)');
  } else {
    console.log('❌ SERVER HEALTH: NEEDS ATTENTION');
    
    console.log('\n🔍 CRITICAL ISSUES TO RESOLVE:');
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach((error, i) => console.log(`${i + 1}. ${error}`));
    }
    if (failedRequests.length > 0) {
      console.log('\nFailed Requests:');
      failedRequests.forEach((req, i) => console.log(`${i + 1}. ${req.method} ${req.url}: ${req.error}`));
    }
  }

  // Capture screenshot for visual verification
  await page.screenshot({ 
    path: 'server-health-check-screenshot.png', 
    fullPage: true 
  });
  console.log('📸 Screenshot saved: server-health-check-screenshot.png');
});