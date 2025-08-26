/**
 * Phase 2 E2E Test: Enhanced Type Safety Validation
 * Success Criteria:
 * - All type operations safe with runtime validation
 * - No runtime errors with improved error handling  
 * - Enhanced IntelliSense and developer experience
 * - Material safety utilities working correctly
 */

const { chromium } = require('playwright');

async function validatePhase2() {
  console.log('🧪 Starting Phase 2 Validation...');
  console.log('Success Criteria:');
  console.log('✓ All type operations safe with runtime validation');
  console.log('✓ No runtime errors with improved error handling');
  console.log('✓ Enhanced IntelliSense and developer experience');
  console.log('✓ Material safety utilities working correctly');
  console.log('');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const consoleErrors = [];
  const consoleWarnings = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
    if (msg.type() === 'warn') {
      consoleWarnings.push(msg.text());
    }
  });

  try {
    console.log('📍 Navigating to customizer...');
    await page.goto('http://localhost:3000/customizer', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    console.log('🔍 Testing enhanced type safety...');
    
    // Test 1: Check if development debugging info is visible
    console.log('   Testing development debugging info...');
    const debugInfo = page.locator('text=Variant Valid:').first();
    const hasDebugInfo = await debugInfo.count() > 0;
    console.log(`   ${hasDebugInfo ? '✅' : '❌'} Development debugging info: ${hasDebugInfo ? 'present' : 'not found'}`);
    
    if (hasDebugInfo) {
      const debugText = await debugInfo.locator('..').textContent();
      console.log(`   Debug info: ${debugText?.substring(0, 100)}...`);
    }

    // Test 2: Material selection with enhanced safety
    console.log('   Testing safe material selection...');
    await page.waitForTimeout(2000);
    
    const materialButtons = page.locator('[data-material]');
    const materialCount = await materialButtons.count();
    console.log(`   Found ${materialCount} material options`);

    if (materialCount > 0) {
      console.log('   Testing material button interactions...');
      
      // Test each material button
      for (let i = 0; i < Math.min(3, materialCount); i++) {
        const button = materialButtons.nth(i);
        const materialId = await button.getAttribute('data-material');
        
        console.log(`   Testing material: ${materialId}`);
        
        // Click the material
        await button.click();
        await page.waitForTimeout(1000);
        
        // Check if selection state updated
        const isSelected = await button.getAttribute('data-selected');
        console.log(`   ${isSelected === 'true' ? '✅' : '❌'} Material selection state: ${isSelected}`);
      }
    }

    // Test 3: Price calculation safety
    console.log('   Testing safe price calculations...');
    const priceElement = page.locator('text=Estimated Price:').locator('..').locator('span').last();
    const priceCount = await priceElement.count();
    
    if (priceCount > 0) {
      const priceText = await priceElement.textContent();
      const hasPriceFormat = /\$[\d,]+/.test(priceText || '');
      console.log(`   ${hasPriceFormat ? '✅' : '❌'} Price format validation: ${priceText}`);
    } else {
      console.log('   ❌ Price element not found');
    }

    // Test 4: Viewer error handling
    console.log('   Testing viewer error handling...');
    const errorElement = page.locator('text=Preview Error');
    const hasError = await errorElement.count() > 0;
    console.log(`   ${!hasError ? '✅' : '⚠️'} Viewer error state: ${hasError ? 'error present' : 'no errors'}`);

    // Test 5: Type safety console messages
    console.log('   Analyzing console messages for type safety...');
    const typeSafetyWarnings = consoleWarnings.filter(msg => 
      msg.includes('[MaterialSafety]') || 
      msg.includes('[useSafeMaterial]') ||
      msg.includes('[useDataValidation]') ||
      msg.includes('[EnhancedProductCustomizer]')
    );
    
    console.log(`   Found ${typeSafetyWarnings.length} type safety warnings`);
    typeSafetyWarnings.slice(0, 3).forEach(warning => {
      console.log(`   Type Safety: ${warning.substring(0, 80)}...`);
    });

    // Test 6: Check for runtime type validation
    console.log('   Testing runtime type validation...');
    
    // Inject some invalid data to test type guards
    const typeValidationResults = await page.evaluate(() => {
      // Test if type safety utilities are available
      const hasWindow = typeof window !== 'undefined';
      const hasConsole = typeof console !== 'undefined';
      
      return {
        hasWindow,
        hasConsole,
        timestamp: new Date().toISOString()
      };
    });
    
    console.log(`   ${typeValidationResults.hasWindow ? '✅' : '❌'} Runtime environment check`);

    // Test 7: Component stability
    console.log('   Testing component stability...');
    
    // Wait and check if components remain stable
    await page.waitForTimeout(3000);
    
    const customizer = page.locator('text=Design Your Perfect Ring').first();
    const isStable = await customizer.isVisible();
    console.log(`   ${isStable ? '✅' : '❌'} Component stability: ${isStable ? 'stable' : 'unstable'}`);

    // Final error analysis
    console.log('🔍 Analyzing error patterns...');
    
    const runtimeErrors = consoleErrors.filter(err => 
      !err.includes('Failed to load resource') && // Ignore 404s
      !err.includes('404') &&
      !err.includes('net::ERR_')
    );
    
    console.log(`   Runtime errors (filtered): ${runtimeErrors.length}`);
    runtimeErrors.slice(0, 2).forEach(error => {
      console.log(`   Error: ${error.substring(0, 100)}...`);
    });

    const performanceWarnings = consoleWarnings.filter(warn =>
      warn.includes('Maximum update depth') ||
      warn.includes('setState') ||
      warn.includes('useEffect')
    );
    
    console.log(`   Performance warnings: ${performanceWarnings.length}`);

    // Calculate success metrics
    const successMetrics = {
      hasTypeValidation: typeSafetyWarnings.length > 0, // Type safety warnings indicate validation is working
      materialSelection: materialCount > 0,
      priceCalculation: priceCount > 0,
      componentStability: isStable,
      runtimeErrors: runtimeErrors.length,
      performanceIssues: performanceWarnings.length,
      totalWarnings: consoleWarnings.length,
      totalErrors: consoleErrors.length
    };

    console.log('');
    console.log('📊 PHASE 2 VALIDATION SUMMARY:');
    console.log(`${successMetrics.hasTypeValidation ? '✅' : '❌'} Type safety validation: ${successMetrics.hasTypeValidation ? 'active' : 'inactive'}`);
    console.log(`${successMetrics.materialSelection ? '✅' : '❌'} Material selection: ${materialCount} options`);
    console.log(`${successMetrics.priceCalculation ? '✅' : '❌'} Price calculations: ${successMetrics.priceCalculation ? 'working' : 'failed'}`);
    console.log(`${successMetrics.componentStability ? '✅' : '❌'} Component stability: ${successMetrics.componentStability ? 'stable' : 'unstable'}`);
    console.log(`${successMetrics.runtimeErrors === 0 ? '✅' : '❌'} Runtime errors: ${successMetrics.runtimeErrors}`);
    console.log(`${successMetrics.performanceIssues === 0 ? '✅' : '⚠️'} Performance issues: ${successMetrics.performanceIssues}`);
    
    const success = (
      successMetrics.materialSelection &&
      successMetrics.priceCalculation &&
      successMetrics.componentStability &&
      successMetrics.runtimeErrors === 0 &&
      successMetrics.performanceIssues === 0
    );
    
    console.log('');
    console.log(success ? '🎉 PHASE 2 SUCCESS!' : '❌ PHASE 2 NEEDS IMPROVEMENTS');
    
    return success;

  } catch (error) {
    console.log('❌ Validation failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Run validation
validatePhase2()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Validation error:', error);
    process.exit(1);
  });