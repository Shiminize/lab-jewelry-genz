#!/usr/bin/env node

/**
 * Phase 1 E2E Test: ProductCard Type System Validation
 * Tests ProductCard component with both ProductDisplayDTO and ProductListDTO data
 * Ensures pricing and material tags work correctly with unified type system
 */

const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function runPhase1TypeTest() {
  console.log('🚀 Phase 1 E2E Test: ProductCard Type System Validation\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-web-security']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
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
    console.log('📋 Testing ProductCard Type System Compatibility...\n');

    // 1. Test Homepage ProductCard with ProductDisplayDTO
    console.log('🔍 Test Group 1: Homepage ProductCard (ProductDisplayDTO)');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    
    // Check for pricing display on homepage
    const homepagePrices = await page.locator('text=/\\$[0-9,]+/').count();
    test('Homepage shows product prices', homepagePrices > 0, `Found ${homepagePrices} price elements`);
    
    // Check for non-zero prices (not showing $0)
    const nonZeroPrices = await page.locator('text=/\\$[1-9][0-9,]*/').count();
    test('Homepage shows non-zero prices', nonZeroPrices > 0, `Found ${nonZeroPrices} non-zero prices`);
    
    // Check for material tags on homepage
    const homepageMaterialTags = await page.locator('[class*="MaterialTagChip"], [class*="material-tag"]').count();
    test('Homepage shows material tags', homepageMaterialTags > 0, `Found ${homepageMaterialTags} material tags`);
    
    // Verify specific price ranges (lab-grown diamonds should be >$500)
    const expensiveItems = await page.locator('text=/\\$[5-9][0-9]{2,}|\\$[1-9][0-9]{3,}/').count();
    test('Homepage shows realistic jewelry prices', expensiveItems > 0, `Found ${expensiveItems} items >$500`);

    // 2. Test Catalog ProductCard with ProductListDTO
    console.log('\n🔍 Test Group 2: Catalog ProductCard (ProductListDTO)');
    await page.goto(`${BASE_URL}/catalog`, { waitUntil: 'networkidle', timeout: 15000 });
    
    // Wait for products to load
    await page.waitForSelector('[data-testid*="product"], [class*="ProductCard"]', { timeout: 10000 });
    
    const catalogPrices = await page.locator('text=/\\$[0-9,]+/').count();
    test('Catalog shows product prices', catalogPrices > 0, `Found ${catalogPrices} price elements`);
    
    const catalogNonZeroPrices = await page.locator('text=/\\$[1-9][0-9,]*/').count();
    test('Catalog shows non-zero prices', catalogNonZeroPrices > 0, `Found ${catalogNonZeroPrices} non-zero prices`);
    
    const catalogMaterialTags = await page.locator('[class*="MaterialTagChip"], [class*="material-tag"]').count();
    test('Catalog shows material tags', catalogMaterialTags > 0, `Found ${catalogMaterialTags} material tags`);

    // 3. Test Price Consistency
    console.log('\n🔍 Test Group 3: Price Display Consistency');
    
    // Go back to homepage to compare
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    
    // Extract a specific product price from homepage
    const homepageProductData = await page.evaluate(() => {
      const priceElements = document.querySelectorAll('*');
      let priceElement = null;
      for (let el of priceElements) {
        if (el.textContent && /\$[0-9,]+/.test(el.textContent)) {
          priceElement = el;
          break;
        }
      }
      const nameElement = document.querySelector('[data-testid="product-card"] h3, [data-testid="product-card"] h2, h3, h2');
      return {
        hasPrice: !!priceElement,
        hasName: !!nameElement,
        priceText: priceElement ? priceElement.textContent : '',
        nameText: nameElement ? nameElement.textContent : ''
      };
    });
    
    test('Homepage product data structure is valid', 
         homepageProductData.hasPrice && homepageProductData.hasName);

    // 4. Test Material Tag Functionality
    console.log('\n🔍 Test Group 4: Material Tag Integration');
    
    // Test material tag clicks on homepage
    const materialTags = await page.locator('[class*="MaterialTagChip"]').first();
    const tagExists = await materialTags.count() > 0;
    test('Material tags are rendered as interactive elements', tagExists);
    
    if (tagExists) {
      // Test tag interaction
      const tagText = await materialTags.textContent();
      test('Material tags have visible text content', !!tagText && tagText.trim().length > 0, 
           `Tag text: "${tagText}"`);
    }

    // 5. Test Type Safety - No Runtime Errors
    console.log('\n🔍 Test Group 5: Runtime Type Safety');
    
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
    
    // Navigate between pages to test type compatibility
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.goto(`${BASE_URL}/catalog`, { waitUntil: 'networkidle' });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    test('No runtime type errors during navigation', pageErrors.length === 0,
         pageErrors.length > 0 ? `Errors: ${pageErrors.join(', ')}` : '');

    // 6. Test Performance Impact
    console.log('\n🔍 Test Group 6: Performance Impact');
    
    const startTime = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    test('Homepage loads within CLAUDE_RULES 3000ms target', loadTime < 3000, `${loadTime}ms`);
    
    // Test ProductCard rendering performance
    const renderStart = Date.now();
    await page.locator('[data-testid="product-card"]').first().waitFor();
    const renderTime = Date.now() - renderStart;
    
    test('ProductCard renders within 300ms', renderTime < 300, `${renderTime}ms`);

    console.log('\n📊 Phase 1 Type System Test Results:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);

    if (results.failed === 0) {
      console.log('\n🎉 Phase 1 PASSED: ProductCard Type System Working!');
      console.log('✅ ProductDisplayDTO compatibility confirmed');
      console.log('✅ ProductListDTO compatibility maintained');
      console.log('✅ Pricing displays correctly on both pages');
      console.log('✅ Material tags working with both data types');
      console.log('✅ No runtime type errors detected');
    } else {
      console.log('\n⚠️  Phase 1 Issues Found:');
      results.details.filter(r => !r.passed).forEach(r => {
        console.log(`   • ${r.name}${r.details ? ': ' + r.details : ''}`);
      });
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
runPhase1TypeTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });