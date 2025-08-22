/**
 * CLAUDE_RULES Performance Test: Material Switch Speed
 * Validates <100ms material changes requirement
 * Tests with generated sequences from Phase 2A
 */

const { chromium } = require('playwright');

async function testMaterialSwitchPerformance() {
  console.log('🎯 TESTING CLAUDE_RULES <100MS MATERIAL SWITCH REQUIREMENT');
  console.log('=======================================================');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100 
  });
  const page = await browser.newPage();
  
  // Enable performance monitoring
  await page.addInitScript(() => {
    window.performanceResults = [];
    window.materialSwitchTimes = [];
  });
  
  try {
    console.log('🚀 Opening CSS 3D Customizer...');
    await page.goto('http://localhost:3001/customizer', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    
    // Wait for customizer to load
    await page.waitForSelector('[role="img"][aria-label*="Interactive 360° jewelry view"]', { 
      timeout: 10000 
    });
    console.log('✅ CSS 3D Customizer loaded');
    
    // Wait for initial images to load
    await page.waitForTimeout(3000);
    
    // Test materials (using correct material IDs from Phase 2A)
    const materials = [
      { id: 'platinum', name: 'Platinum' },
      { id: 'white-gold', name: 'White Gold' }, 
      { id: 'yellow-gold', name: 'Yellow Gold' },
      { id: 'rose-gold', name: 'Rose Gold' }
    ];
    
    const switchTimes = [];
    let testCount = 0;
    const maxTests = 8; // 2 rounds of all materials
    
    console.log(`\n🔄 Testing ${maxTests} material switches for CLAUDE_RULES compliance...`);
    
    for (let round = 0; round < 2; round++) {
      console.log(`\n📋 Round ${round + 1}: Testing material switches`);
      
      for (const material of materials) {
        if (testCount >= maxTests) break;
        
        console.log(`\n🎨 Testing switch to ${material.name}...`);
        
        try {
          // Look for material selector button
          const materialSelector = page.locator(`button:has-text("${material.name}"), [data-material="${material.id}"]`).first();
          
          const isVisible = await materialSelector.isVisible().catch(() => false);
          if (!isVisible) {
            console.log(`⚠️ Material selector for ${material.name} not found, trying alternative selectors`);
            
            // Try alternative selectors
            const alternatives = [
              `button[data-testid="${material.id}"]`,
              `button:has([data-material="${material.id}"])`,
              `.material-option[data-value="${material.id}"]`
            ];
            
            let found = false;
            for (const selector of alternatives) {
              const alt = page.locator(selector).first();
              if (await alt.isVisible().catch(() => false)) {
                console.log(`✅ Found alternative selector: ${selector}`);
                await performMaterialSwitch(page, alt, material, switchTimes, testCount);
                found = true;
                break;
              }
            }
            
            if (!found) {
              console.log(`❌ No selector found for ${material.name}, skipping`);
              continue;
            }
          } else {
            await performMaterialSwitch(page, materialSelector, material, switchTimes, testCount);
          }
          
          testCount++;
          
        } catch (error) {
          console.error(`❌ Error testing ${material.name}:`, error.message);
          switchTimes.push({
            material: material.name,
            time: 999, // Mark as failed
            success: false,
            error: error.message
          });
          testCount++;
        }
        
        // Wait between switches
        await page.waitForTimeout(1000);
      }
    }
    
    // Analyze Results
    console.log('\n📊 CLAUDE_RULES PERFORMANCE ANALYSIS');
    console.log('=====================================');
    
    const successfulSwitches = switchTimes.filter(t => t.success);
    const failedSwitches = switchTimes.filter(t => !t.success);
    
    if (successfulSwitches.length === 0) {
      console.log('❌ No successful material switches detected');
      console.log('🔧 Possible issues:');
      console.log('   - Material selectors not found in UI');
      console.log('   - Images not properly generated/loaded');
      console.log('   - JavaScript errors preventing switching');
      return false;
    }
    
    const avgTime = successfulSwitches.reduce((sum, t) => sum + t.time, 0) / successfulSwitches.length;
    const maxTime = Math.max(...successfulSwitches.map(t => t.time));
    const minTime = Math.min(...successfulSwitches.map(t => t.time));
    const under100ms = successfulSwitches.filter(t => t.time < 100).length;
    
    console.log(`📈 Test Results:`);
    console.log(`   Total Tests: ${switchTimes.length}`);
    console.log(`   Successful: ${successfulSwitches.length}`);
    console.log(`   Failed: ${failedSwitches.length}`);
    console.log(`   Success Rate: ${Math.round((successfulSwitches.length / switchTimes.length) * 100)}%`);
    console.log(`\n⚡ Performance Metrics:`);
    console.log(`   Average Switch Time: ${avgTime.toFixed(1)}ms`);
    console.log(`   Fastest Switch: ${minTime.toFixed(1)}ms`);  
    console.log(`   Slowest Switch: ${maxTime.toFixed(1)}ms`);
    console.log(`   Under 100ms: ${under100ms}/${successfulSwitches.length} (${Math.round((under100ms/successfulSwitches.length)*100)}%)`);
    
    // CLAUDE_RULES Compliance Check
    const claudeRulesCompliant = avgTime < 100 && under100ms >= Math.floor(successfulSwitches.length * 0.8);
    
    console.log(`\n🎯 CLAUDE_RULES COMPLIANCE: ${claudeRulesCompliant ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Requirement: <100ms average material switches`);
    console.log(`   Result: ${avgTime.toFixed(1)}ms average`);
    console.log(`   Target: 80%+ switches under 100ms`);
    console.log(`   Achieved: ${Math.round((under100ms/successfulSwitches.length)*100)}%`);
    
    // Detailed Results
    console.log(`\n📝 Detailed Switch Results:`);
    switchTimes.forEach((result, index) => {
      const status = result.success ? 
        (result.time < 100 ? '✅' : '⚠️') : '❌';
      console.log(`   ${index + 1}. ${status} ${result.material}: ${result.time.toFixed(1)}ms${result.error ? ` (${result.error})` : ''}`);
    });
    
    return claudeRulesCompliant;
    
  } catch (error) {
    console.error('\n❌ Performance test failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

async function performMaterialSwitch(page, materialSelector, material, switchTimes, testIndex) {
  // Record performance timing
  const startTime = Date.now();
  
  // Click material selector
  await materialSelector.click();
  
  // Wait for visual change (image update)
  // We'll use a simple timeout since we can't easily detect image changes
  await page.waitForTimeout(200); // Allow time for switch to complete
  
  const endTime = Date.now();
  const switchTime = endTime - startTime;
  
  console.log(`   ⚡ ${material.name}: ${switchTime}ms ${switchTime < 100 ? '✅' : '⚠️'}`);
  
  switchTimes.push({
    material: material.name,
    time: switchTime,
    success: true,
    testIndex: testIndex + 1
  });
}

// Run the performance test
testMaterialSwitchPerformance().then(success => {
  const exitCode = success ? 0 : 1;
  console.log(`\n🏁 Performance test ${success ? 'PASSED' : 'FAILED'}`);
  process.exit(exitCode);
});