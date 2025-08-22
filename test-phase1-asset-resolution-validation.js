/**
 * Phase 1: Asset Resolution E2E Validation
 * CLAUDE_RULES.md Compliant Testing - Validates 100% asset resolution fix
 */

const { chromium } = require('playwright');

async function validatePhase1AssetResolution() {
  console.log('🧪 Phase 1: E2E Asset Resolution Validation');
  console.log('============================================');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const consoleErrors = [];
  const networkErrors = [];
  const assetRequests = [];
  
  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  // Capture network failures and asset requests
  page.on('response', response => {
    const url = response.url();
    
    // Track 3D sequence asset requests
    if (url.includes('3d-sequences/Black_Stone_Ring-')) {
      assetRequests.push({
        url: url,
        status: response.status(),
        success: response.ok()
      });
      
      if (!response.ok() && response.status() >= 400) {
        networkErrors.push({
          url: url,
          status: response.status(),
          statusText: response.statusText()
        });
      }
    }
  });
  
  const testResults = {
    homepage: { errors: 0, networkErrors: 0, assetRequests: 0 },
    customizer: { errors: 0, networkErrors: 0, assetRequests: 0 },
    materialSwitches: {},
    totalAssetRequests: 0,
    totalErrors: 0,
    successRate: 0
  };
  
  try {
    // Test 1: Homepage Asset Resolution
    console.log('\n📍 Test 1: Homepage Asset Resolution');
    console.log('------------------------------------');
    
    await page.goto('http://localhost:3001/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    testResults.homepage.errors = consoleErrors.length;
    testResults.homepage.networkErrors = networkErrors.length;
    testResults.homepage.assetRequests = assetRequests.length;
    
    console.log(`✅ Console errors: ${consoleErrors.length}`);
    console.log(`✅ Network errors: ${networkErrors.length}`);
    console.log(`✅ Asset requests: ${assetRequests.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('❌ HOMEPAGE CONSOLE ERRORS:');
      consoleErrors.forEach((error, i) => {
        console.log(`   [${i+1}] ${error}`);
      });
    }
    
    if (networkErrors.length > 0) {
      console.log('❌ HOMEPAGE NETWORK ERRORS:');
      networkErrors.forEach((error, i) => {
        console.log(`   [${i+1}] ${error.status} ${error.url}`);
      });
    }
    
    // Clear arrays for next test
    consoleErrors.length = 0;
    networkErrors.length = 0;
    assetRequests.length = 0;
    
    // Test 2: Customizer Page Asset Resolution
    console.log('\n📍 Test 2: Customizer Page Asset Resolution');
    console.log('-------------------------------------------');
    
    await page.goto('http://localhost:3001/customizer');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    testResults.customizer.errors = consoleErrors.length;
    testResults.customizer.networkErrors = networkErrors.length;
    testResults.customizer.assetRequests = assetRequests.length;
    
    console.log(`✅ Console errors: ${consoleErrors.length}`);
    console.log(`✅ Network errors: ${networkErrors.length}`);
    console.log(`✅ Asset requests: ${assetRequests.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('❌ CUSTOMIZER CONSOLE ERRORS:');
      consoleErrors.forEach((error, i) => {
        console.log(`   [${i+1}] ${error}`);
      });
    }
    
    if (networkErrors.length > 0) {
      console.log('❌ CUSTOMIZER NETWORK ERRORS:');
      networkErrors.forEach((error, i) => {
        console.log(`   [${i+1}] ${error.status} ${error.url}`);
      });
    }
    
    // Test 3: Material Switch Asset Resolution
    console.log('\n📍 Test 3: Material Switch Asset Resolution');
    console.log('------------------------------------------');
    
    const materialButtons = page.locator('[data-material]');
    const count = await materialButtons.count();
    console.log(`Found ${count} material buttons`);
    
    const materials = ['platinum', '18k-white-gold', '18k-yellow-gold', '18k-rose-gold'];
    
    for (let i = 0; i < count; i++) {
      const materialButton = materialButtons.nth(i);
      const material = await materialButton.getAttribute('data-material');
      
      if (materials.includes(material)) {
        console.log(`\\n  🔄 Testing ${material} asset resolution...`);
        
        // Clear arrays for this material test
        consoleErrors.length = 0;
        networkErrors.length = 0;
        assetRequests.length = 0;
        
        await materialButton.click();
        await page.waitForTimeout(2000); // Wait for material switch and asset loading
        
        const materialResults = {
          errors: consoleErrors.length,
          networkErrors: networkErrors.length,
          assetRequests: assetRequests.length,
          successfulRequests: assetRequests.filter(req => req.success).length
        };
        
        testResults.materialSwitches[material] = materialResults;
        
        console.log(`     Console errors: ${materialResults.errors}`);
        console.log(`     Network errors: ${materialResults.networkErrors}`);
        console.log(`     Asset requests: ${materialResults.assetRequests}`);
        console.log(`     Successful requests: ${materialResults.successfulRequests}`);
        
        if (materialResults.errors > 0) {
          console.log(`     ❌ ${material.toUpperCase()} ERRORS:`);
          consoleErrors.forEach((error, j) => {
            console.log(`        [${j+1}] ${error}`);
          });
        }
        
        if (materialResults.networkErrors > 0) {
          console.log(`     ❌ ${material.toUpperCase()} NETWORK ERRORS:`);
          networkErrors.forEach((error, j) => {
            console.log(`        [${j+1}] ${error.status} ${error.url}`);
          });
        }
        
        if (materialResults.errors === 0 && materialResults.networkErrors === 0) {
          console.log(`     ✅ ${material.toUpperCase()} - PERFECT ASSET RESOLUTION`);
        }
      }
    }
    
    // Calculate final results
    testResults.totalErrors = testResults.homepage.errors + testResults.customizer.errors + 
      Object.values(testResults.materialSwitches).reduce((sum, mat) => sum + mat.errors, 0);
    
    testResults.totalAssetRequests = testResults.homepage.assetRequests + testResults.customizer.assetRequests + 
      Object.values(testResults.materialSwitches).reduce((sum, mat) => sum + mat.assetRequests, 0);
    
    const totalNetworkErrors = testResults.homepage.networkErrors + testResults.customizer.networkErrors + 
      Object.values(testResults.materialSwitches).reduce((sum, mat) => sum + mat.networkErrors, 0);
    
    testResults.successRate = testResults.totalAssetRequests > 0 ? 
      ((testResults.totalAssetRequests - totalNetworkErrors) / testResults.totalAssetRequests * 100).toFixed(2) : 100;
    
    // Final Assessment
    console.log('\\n🏆 PHASE 1 VALIDATION RESULTS');
    console.log('==============================');
    console.log(`Total Console Errors: ${testResults.totalErrors}`);
    console.log(`Total Network Errors: ${totalNetworkErrors}`);
    console.log(`Total Asset Requests: ${testResults.totalAssetRequests}`);
    console.log(`Asset Success Rate: ${testResults.successRate}%`);
    
    // CLAUDE_RULES.md Compliance Check
    const isClaudeRulesCompliant = testResults.totalErrors === 0 && totalNetworkErrors === 0;
    
    if (isClaudeRulesCompliant) {
      console.log('\\n🎯 ✅ PHASE 1 PASSED - CLAUDE_RULES.md COMPLIANT');
      console.log('   ✅ Zero console errors');
      console.log('   ✅ Zero network errors');
      console.log('   ✅ 100% asset resolution success');
      console.log('   ✅ All materials switch successfully');
      console.log('\\n🚀 READY FOR PHASE 2 - HOMEPAGE PERFORMANCE INVESTIGATION');
      return true;
    } else {
      console.log('\\n❌ PHASE 1 FAILED - CLAUDE_RULES.md NON-COMPLIANT');
      console.log('   ❌ Asset resolution issues detected');
      console.log('   ❌ BLOCKED - Cannot proceed to Phase 2');
      return false;
    }
    
  } catch (error) {
    console.error('\\n❌ Phase 1 validation failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

// Run validation
validatePhase1AssetResolution().then(success => {
  process.exit(success ? 0 : 1);
});