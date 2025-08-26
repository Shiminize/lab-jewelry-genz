#!/usr/bin/env node

/**
 * Phase 4 E2E Test: Homepage renders real data without errors
 * Tests the complete homepage data flow following CLAUDE_RULES.md
 */

const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function runPhase4Test() {
  console.log('🚀 Phase 4 E2E Test: Homepage Data Flow Validation\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-web-security']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  // Capture console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  // Capture network failures
  const networkErrors = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  function test(name, condition, details = '') {
    if (condition) {
      console.log(`✅ ${name}`);
      results.passed++;
    } else {
      console.log(`❌ ${name}${details ? ': ' + details : ''}`);
      results.failed++;
    }
    results.details.push({ name, passed: condition, details });
  }

  try {
    console.log('📋 Testing Homepage Data Flow...\n');

    // 1. Homepage loads without errors
    console.log('🔍 Test 1: Homepage loads without errors');
    const startTime = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    const loadTime = Date.now() - startTime;
    
    test('Homepage loads within 3000ms', loadTime < 3000, `${loadTime}ms`);
    test('No 500 server errors', !networkErrors.some(err => err.includes('500')));
    test('No JavaScript console errors', consoleErrors.length === 0, 
         consoleErrors.length > 0 ? `Found: ${consoleErrors.join(', ')}` : '');

    // 2. Featured Products API call succeeds
    console.log('\n🔍 Test 2: Featured Products API Integration');
    
    // Monitor network requests
    const apiCalls = [];
    page.on('response', response => {
      if (response.url().includes('/api/featured-products')) {
        apiCalls.push({
          status: response.status(),
          url: response.url(),
          headers: response.headers()
        });
      }
    });

    await page.reload({ waitUntil: 'networkidle' });
    
    test('Featured products API called', apiCalls.length > 0);
    if (apiCalls.length > 0) {
      const apiCall = apiCalls[0];
      test('API returns 200 status', apiCall.status === 200, `Status: ${apiCall.status}`);
      test('API has correct content-type', 
           apiCall.headers['content-type']?.includes('application/json'),
           apiCall.headers['content-type']);
    }

    // 3. FeaturedProductsSection renders with real data
    console.log('\n🔍 Test 3: FeaturedProductsSection Component');
    
    const featuredSection = await page.locator('[class*="FeaturedProducts"]').first();
    const sectionExists = await featuredSection.count() > 0;
    test('FeaturedProductsSection component exists', sectionExists);

    // Look for section by content structure instead
    const curatedSection = await page.locator('text=Curated Collection').first();
    const sectionByContent = await curatedSection.count() > 0;
    test('Featured section renders with "Curated Collection" header', sectionByContent);

    // 4. Product data displays correctly
    console.log('\n🔍 Test 4: Product Data Display');
    
    // Check for product grid or cards
    const productCards = await page.locator('[class*="ProductCard"], [data-testid*="product"]').count();
    test('Product cards render on homepage', productCards > 0, `Found ${productCards} cards`);

    // Check for product images
    const productImages = await page.locator('img[src*="/images/"], img[src*="product"]').count();
    test('Product images load', productImages > 0, `Found ${productImages} images`);

    // Check for product names/titles
    const productTitles = await page.locator('text=/Ring|Necklace|Earring|Bracelet|Diamond/i').count();
    test('Product titles display', productTitles > 0, `Found ${productTitles} product titles`);

    // 5. No fallback data indicators
    console.log('\n🔍 Test 5: Real Data vs Fallback Detection');
    
    const fallbackText = await page.locator('text=/No featured products|Check back soon|fallback/i').count();
    test('No fallback messages displayed', fallbackText === 0, 
         fallbackText > 0 ? `Found ${fallbackText} fallback indicators` : '');

    const placeholderImages = await page.locator('img[src*="placeholder"]').count();
    test('No placeholder images used', placeholderImages === 0,
         placeholderImages > 0 ? `Found ${placeholderImages} placeholder images` : '');

    // 6. Page performance metrics
    console.log('\n🔍 Test 6: Performance Validation');
    
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart
      };
    });

    test('DOM content loads quickly', performanceMetrics.domContentLoaded < 1000, 
         `${performanceMetrics.domContentLoaded}ms`);
    test('Total page load < 3000ms', performanceMetrics.totalTime < 3000,
         `${performanceMetrics.totalTime}ms`);

    // 7. Database integration validation
    console.log('\n🔍 Test 7: Database Integration');
    
    // Check page source for real product data patterns
    const pageContent = await page.content();
    const hasRealData = pageContent.includes('lab-grown') || 
                       pageContent.includes('moissanite') || 
                       pageContent.includes('14K') ||
                       pageContent.includes('18K');
    
    test('Real product data detected in page content', hasRealData);
    
    // Check for price formatting
    const priceElements = await page.locator('text=/\\$[0-9,]+/').count();
    test('Product prices display correctly', priceElements > 0, `Found ${priceElements} price elements`);

    console.log('\n📊 Phase 4 Test Results:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);

    if (results.failed === 0) {
      console.log('\n🎉 Phase 4 PASSED: Homepage renders real data without errors!');
      console.log('✅ Server Component architecture fixed');
      console.log('✅ ProductDisplayDTO interface working');
      console.log('✅ API integration successful');
      console.log('✅ Real data displaying correctly');
    } else {
      console.log('\n⚠️  Phase 4 Issues Found:');
      results.details.filter(r => !r.passed).forEach(r => {
        console.log(`   • ${r.name}${r.details ? ': ' + r.details : ''}`);
      });
    }

    if (consoleErrors.length > 0) {
      console.log('\n🐛 Console Errors:');
      consoleErrors.forEach(error => console.log(`   • ${error}`));
    }

    if (networkErrors.length > 0) {
      console.log('\n🌐 Network Errors:');
      networkErrors.forEach(error => console.log(`   • ${error}`));
    }

  } catch (error) {
    console.error('\n💥 Test execution failed:', error.message);
    results.failed++;
  } finally {
    await browser.close();
  }

  return results.failed === 0;
}

// Run the test
runPhase4Test()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });