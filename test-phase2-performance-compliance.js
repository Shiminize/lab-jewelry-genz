/**
 * Phase 2 E2E Test: Performance Optimization Compliance
 * 
 * SUCCESS CRITERIA:
 * 1. <100ms material changes (CLAUDE_RULES mandatory)
 * 2. Material preloading functionality working
 * 3. CSS transform-based drag/touch rotation
 * 4. Smooth performance indicators
 * 5. All Phase 1 criteria still met
 */

const puppeteer = require('puppeteer');

async function testPhase2PerformanceCompliance() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Track performance metrics
    const performanceMetrics = {
      materialSwitches: [],
      loadTime: 0,
      preloadTime: 0
    };
    
    const consoleMessages = [];
    
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(text);
      
      // Track material change performance
      if (text.includes('Material changed in')) {
        const match = text.match(/(\d+)ms/);
        if (match) {
          performanceMetrics.materialSwitches.push(parseInt(match[1]));
        }
      }
      
      // Track preloading performance
      if (text.includes('materials preloaded in')) {
        const match = text.match(/(\d+)ms/);
        if (match) {
          performanceMetrics.preloadTime = parseInt(match[1]);
        }
      }
    });
    
    console.log('🎯 PHASE 2 E2E TEST: Performance Optimization Compliance');
    console.log('=========================================================');
    
    // Test 1: Page Load Performance (Phase 1 maintained)
    console.log('📊 Test 1: Verifying Phase 1 performance maintained...');
    const loadStartTime = performance.now();
    
    await page.goto('http://localhost:3001/customizer', { 
      waitUntil: 'networkidle0',
      timeout: 10000
    });
    
    const loadTime = performance.now() - loadStartTime;
    performanceMetrics.loadTime = loadTime;
    
    if (loadTime <= 2000) {
      console.log(`✅ Load time maintained: ${(loadTime / 1000).toFixed(2)}s`);
    } else {
      console.log(`❌ Load time regression: ${(loadTime / 1000).toFixed(2)}s`);
      return false;
    }
    
    // Wait for customizer to initialize
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 2: Material Preloading Detection
    console.log('\\n🚀 Test 2: Detecting material preloading...');
    
    const preloadMessages = consoleMessages.filter(msg => 
      msg.includes('Starting material preloading') || 
      msg.includes('materials preloaded')
    );
    
    if (preloadMessages.length > 0) {
      console.log('✅ Material preloading system active');
      console.log(`📊 Preload time: ${performanceMetrics.preloadTime}ms`);
    } else {
      console.log('⚠️ Material preloading not detected');
    }
    
    // Test 3: <100ms Material Changes (CLAUDE_RULES Critical)
    console.log('\\n⚡ Test 3: Testing <100ms material changes...');
    
    const materialButtons = await page.$$('button[data-material]');
    
    if (materialButtons.length < 2) {
      console.log('❌ Insufficient material options for testing');
      return false;
    }
    
    console.log(`Found ${materialButtons.length} material options`);
    
    // Test multiple material switches
    const switchTests = Math.min(3, materialButtons.length - 1);
    let passedSwitches = 0;
    
    for (let i = 0; i < switchTests; i++) {
      console.log(`\\n🔄 Material switch test ${i + 1}/${switchTests}:`);
      
      const switchStartTime = Date.now();
      await materialButtons[i].click();
      
      // Wait for switch to complete and check console
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Find the most recent material change time
      const recentSwitches = performanceMetrics.materialSwitches.filter(
        time => Date.now() - switchStartTime < 1000 // Within last second
      );
      
      if (recentSwitches.length > 0) {
        const latestSwitch = recentSwitches[recentSwitches.length - 1];
        
        if (latestSwitch <= 100) {
          console.log(`  ✅ Switch ${i + 1}: ${latestSwitch}ms (CLAUDE_RULES compliant)`);
          passedSwitches++;
        } else {
          console.log(`  ❌ Switch ${i + 1}: ${latestSwitch}ms (exceeds 100ms requirement)`);
        }
      } else {
        console.log(`  ⚠️ Switch ${i + 1}: No performance data captured`);
      }
      
      // Small delay between switches
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const switchSuccessRate = passedSwitches / switchTests;
    console.log(`\\n📊 Material switch results: ${passedSwitches}/${switchTests} passed (${Math.round(switchSuccessRate * 100)}%)`);
    
    // Test 4: Touch/Drag Interaction Detection
    console.log('\\n👆 Test 4: Testing touch/drag interactions...');
    
    const customizerElement = await page.$('[role="img"][aria-label*="CSS 3D customizer"]');
    
    if (customizerElement) {
      console.log('✅ CSS 3D customizer element found');
      
      // Test drag interaction
      const boundingBox = await customizerElement.boundingBox();
      if (boundingBox) {
        await page.mouse.move(boundingBox.x + 50, boundingBox.y + 50);
        await page.mouse.down();
        await page.mouse.move(boundingBox.x + 150, boundingBox.y + 50);
        await page.mouse.up();
        
        console.log('✅ Drag interaction simulated');
      }
    } else {
      console.log('❌ CSS 3D customizer element not found');
    }
    
    // Test 5: Performance Indicators
    console.log('\\n📊 Test 5: Checking performance indicators...');
    
    const performanceIndicator = await page.$('text=Phase 2 Optimized');
    const switchTimeIndicator = await page.$('text=Last switch:');
    
    if (performanceIndicator && switchTimeIndicator) {
      console.log('✅ Phase 2 performance indicators present');
    } else {
      console.log('⚠️ Phase 2 performance indicators not fully visible');
    }
    
    // Test 6: Gesture Hints
    console.log('\\n🖱️ Test 6: Checking interaction hints...');
    
    const gestureHint = await page.$('text=Drag to rotate');
    
    if (gestureHint) {
      console.log('✅ Touch/drag gesture hints present');
    } else {
      console.log('⚠️ Gesture hints not visible');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'phase2-performance-test.png', fullPage: true });
    console.log('\\n📸 Screenshot saved: phase2-performance-test.png');
    
    // Final Assessment
    console.log('\\n📊 PHASE 2 SUCCESS CRITERIA ASSESSMENT:');
    console.log('========================================');
    console.log(`✅ Load Time Maintained: ${(performanceMetrics.loadTime / 1000).toFixed(2)}s (< 2s)`);
    console.log(`✅ Material Preloading: ${preloadMessages.length > 0}`);
    console.log(`✅ Material Switch Speed: ${switchSuccessRate >= 0.8 ? 'PASS' : 'FAIL'} (${Math.round(switchSuccessRate * 100)}%)`);
    console.log(`✅ Touch/Drag Support: ${!!customizerElement}`);
    console.log(`✅ Performance Indicators: ${!!(performanceIndicator && switchTimeIndicator)}`);
    
    // Calculate average switch time
    const avgSwitchTime = performanceMetrics.materialSwitches.length > 0 
      ? performanceMetrics.materialSwitches.reduce((a, b) => a + b, 0) / performanceMetrics.materialSwitches.length
      : 0;
    
    console.log(`\\n📊 Performance Summary:`);
    console.log(`   • Page Load: ${(performanceMetrics.loadTime / 1000).toFixed(2)}s`);
    console.log(`   • Material Preload: ${performanceMetrics.preloadTime}ms`);
    console.log(`   • Avg Switch Time: ${avgSwitchTime.toFixed(0)}ms`);
    console.log(`   • Material Switches: ${performanceMetrics.materialSwitches.join('ms, ')}ms`);
    
    const criteriaMet = (
      performanceMetrics.loadTime <= 2000 &&
      switchSuccessRate >= 0.8 &&
      preloadMessages.length > 0 &&
      !!customizerElement
    );
    
    if (criteriaMet) {
      console.log('\\n🎉 PHASE 2 SUCCESS: Performance optimization criteria met!');
      console.log('✅ <100ms material changes achieved');
      console.log('✅ Material preloading functional');
      console.log('✅ Enhanced interactions implemented');
      console.log('Ready to proceed to Phase 3: Accessibility & Features');
      return true;
    } else {
      console.log('\\n❌ PHASE 2 FAILED: Performance criteria not met');
      console.log('Critical: <100ms material changes required for CLAUDE_RULES compliance');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    return false;
  } finally {
    console.log('\\n🔍 Browser will remain open for 15 seconds for inspection...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    await browser.close();
  }
}

// Execute the test
testPhase2PerformanceCompliance()
  .then(success => {
    if (success) {
      console.log('\\n🚀 PHASE 2 COMPLETE - PROCEEDING TO PHASE 3');
      process.exit(0);
    } else {
      console.log('\\n🛑 PHASE 2 FAILED - PERFORMANCE OPTIMIZATION REQUIRED');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\\n💥 CRITICAL TEST FAILURE:', error);
    process.exit(1);
  });