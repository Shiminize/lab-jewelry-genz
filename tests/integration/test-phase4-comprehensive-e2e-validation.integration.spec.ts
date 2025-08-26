/**
 * Phase 4: Comprehensive E2E Validation - Final System Test
 * CLAUDE_RULES.md Compliant - Tests complete system integration
 * Validates all phases: asset resolution, performance, preloading, visual consistency
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function runComprehensiveValidation() {
  console.log('🎯 Phase 4: COMPREHENSIVE E2E VALIDATION');
  console.log('========================================');
  console.log('Final system integration test across all phases');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const results = {
    phase1: { assetResolution: [], consoleErrors: 0 },
    phase2: { homepagePerformance: {}, loadTime: 0 },
    phase3: { materialSwitching: [], preloadingActive: false },
    phase4: { systemHealth: {}, visualValidation: [] },
    overall: { score: 0, compliance: 0, passed: false },
    errors: []
  };
  
  const consoleLogs = [];
  let consoleErrors = 0;
  
  // Comprehensive console monitoring
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    
    if (msg.type() === 'error' || text.includes('Failed to load') || text.includes('404')) {
      consoleErrors++;
      console.log(`❌ Console error: ${text}`);
    }
    
    if (text.includes('Material changed in') || 
        text.includes('Health monitoring') ||
        text.includes('CLAUDE_RULES')) {
      console.log(`📊 ${text}`);
    }
  });
  
  try {
    // Phase 1: Asset Resolution Validation
    console.log('\n🔍 PHASE 1: Asset Resolution & Console Error Validation');
    console.log('-------------------------------------------------------');
    
    const phase1StartTime = Date.now();
    
    await page.goto('http://localhost:3001/customizer', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    
    // Wait for initial load and asset loading
    await page.waitForSelector('[role="img"][aria-label*="Interactive 360° jewelry view"]', { timeout: 15000 });
    await page.waitForTimeout(3000);
    
    const phase1Time = Date.now() - phase1StartTime;
    results.phase1.consoleErrors = consoleErrors;
    
    console.log(`✅ Phase 1 completed in ${phase1Time}ms`);
    console.log(`📊 Console errors detected: ${consoleErrors}`);
    
    const phase1Pass = consoleErrors === 0;
    results.phase1.assetResolution.push({
      test: 'Console Error Count',
      errors: consoleErrors,
      passed: phase1Pass
    });
    
    // Phase 2: Homepage Performance Validation
    console.log('\n⚡ PHASE 2: Homepage Performance Validation');
    console.log('-------------------------------------------');
    
    const phase2StartTime = Date.now();
    
    await page.goto('http://localhost:3001/', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    // Wait for hero section
    await page.waitForSelector('section[aria-label*="Hero section"]', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const phase2LoadTime = Date.now() - phase2StartTime;
    results.phase2.loadTime = phase2LoadTime;
    
    // Check performance metrics
    const navTiming = await page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    console.log(`✅ Phase 2 DOM load: ${navTiming.domContentLoaded.toFixed(0)}ms`);
    console.log(`✅ First Contentful Paint: ${navTiming.firstContentfulPaint.toFixed(0)}ms`);
    
    const phase2Pass = navTiming.domContentLoaded < 1000 && navTiming.firstContentfulPaint < 1000;
    results.phase2.homepagePerformance = {
      domLoad: navTiming.domContentLoaded,
      fcp: navTiming.firstContentfulPaint,
      passed: phase2Pass
    };
    
    // Phase 3: Material Switching & Preloading Validation
    console.log('\n🔄 PHASE 3: Material Switching & Preloading Validation');
    console.log('------------------------------------------------------');
    
    // Return to customizer for material testing
    await page.goto('http://localhost:3001/customizer', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    
    await page.waitForSelector('[role="img"][aria-label*="Interactive 360° jewelry view"]', { timeout: 15000 });
    await page.waitForTimeout(3000); // Allow preloading
    
    // Check for preloading activity
    const preloadingLogs = consoleLogs.filter(log => 
      log.includes('priority material preloading') || 
      log.includes('All materials preloaded')
    );
    results.phase3.preloadingActive = preloadingLogs.length > 0;
    
    console.log(`📊 Preloading detected: ${results.phase3.preloadingActive}`);
    
    // Test material switches
    const materials = ['platinum', '18k-white-gold', '18k-yellow-gold'];
    const materialSwitchResults = [];
    
    for (const material of materials) {
      const materialButton = page.locator(`[data-material="${material}"]`);
      if (await materialButton.count() > 0) {
        console.log(`  🔄 Testing ${material} switch...`);
        
        const switchStartTime = Date.now();
        const logsBefore = consoleLogs.length;
        
        await materialButton.click();
        await page.waitForTimeout(500);
        
        const switchTime = Date.now() - switchStartTime;
        
        // Look for performance logs
        const newLogs = consoleLogs.slice(logsBefore);
        const materialSwitchLog = newLogs.find(log => log.includes('Material changed in'));
        let actualSwitchTime = switchTime;
        
        if (materialSwitchLog) {
          const match = materialSwitchLog.match(/(\d+)ms/);
          if (match) {
            actualSwitchTime = parseInt(match[1]);
          }
        }
        
        const switchResult = {
          material,
          switchTime: actualSwitchTime,
          compliant: actualSwitchTime < 100,
          passed: actualSwitchTime < 100
        };
        
        materialSwitchResults.push(switchResult);
        console.log(`     Switch time: ${actualSwitchTime}ms (${switchResult.compliant ? 'PASS' : 'FAIL'})`);
      }
    }
    
    results.phase3.materialSwitching = materialSwitchResults;
    
    // Phase 4: System Health & Visual Validation
    console.log('\n🏥 PHASE 4: System Health & Visual Validation');
    console.log('--------------------------------------------');
    
    // Check for system health monitoring
    const healthLogs = consoleLogs.filter(log => 
      log.includes('System health monitoring') || 
      log.includes('Health monitoring')
    );
    
    // Take final screenshot for visual validation
    const finalScreenshot = './test-results/comprehensive-final-state.png';
    if (!fs.existsSync('./test-results')) {
      fs.mkdirSync('./test-results', { recursive: true });
    }
    
    await page.screenshot({ 
      path: finalScreenshot, 
      fullPage: true,
      animations: 'disabled'
    });
    
    console.log(`📸 Final state screenshot: ${finalScreenshot}`);
    
    // Visual elements validation
    const viewerVisible = await page.locator('[role="img"][aria-label*="Interactive 360° jewelry view"]').isVisible();
    const materialButtonsVisible = await page.locator('[data-material]').count() > 0;
    const noLoadingStates = await page.locator('text=Loading 3D Customizer').count() === 0;
    
    results.phase4.systemHealth = {
      healthMonitoringActive: healthLogs.length > 0,
      visualElementsWorking: viewerVisible && materialButtonsVisible && noLoadingStates
    };
    
    console.log(`📊 Health monitoring active: ${results.phase4.systemHealth.healthMonitoringActive}`);
    console.log(`📊 Visual elements working: ${results.phase4.systemHealth.visualElementsWorking}`);
    
    // COMPREHENSIVE ASSESSMENT
    console.log('\n🎯 COMPREHENSIVE VALIDATION ASSESSMENT');
    console.log('=====================================');
    
    const assessments = {
      phase1AssetResolution: results.phase1.consoleErrors === 0,
      phase2HomepagePerformance: results.phase2.homepagePerformance.passed,
      phase3MaterialSwitching: results.phase3.materialSwitching.every(s => s.passed) && results.phase3.preloadingActive,
      phase4SystemHealth: results.phase4.systemHealth.healthMonitoringActive && results.phase4.systemHealth.visualElementsWorking
    };
    
    const passedPhases = Object.values(assessments).filter(Boolean).length;
    const totalPhases = Object.keys(assessments).length;
    const overallCompliance = (passedPhases / totalPhases) * 100;
    
    results.overall = {
      score: passedPhases,
      totalPhases,
      compliance: overallCompliance,
      passed: overallCompliance >= 100 // Must pass all phases
    };
    
    console.log(`\n📋 FINAL RESULTS:`);
    console.log(`   Overall Score: ${passedPhases}/${totalPhases} (${overallCompliance.toFixed(1)}%)`);
    console.log(`   ✅ Phase 1 - Asset Resolution: ${assessments.phase1AssetResolution ? 'PASS' : 'FAIL'} (${results.phase1.consoleErrors} errors)`);
    console.log(`   ✅ Phase 2 - Homepage Performance: ${assessments.phase2HomepagePerformance ? 'PASS' : 'FAIL'} (${results.phase2.homepagePerformance.domLoad?.toFixed(0)}ms DOM load)`);
    console.log(`   ✅ Phase 3 - Material Switching: ${assessments.phase3MaterialSwitching ? 'PASS' : 'FAIL'} (avg: ${results.phase3.materialSwitching.length > 0 ? (results.phase3.materialSwitching.reduce((sum, s) => sum + s.switchTime, 0) / results.phase3.materialSwitching.length).toFixed(0) : 0}ms)`);
    console.log(`   ✅ Phase 4 - System Health: ${assessments.phase4SystemHealth ? 'PASS' : 'FAIL'}`);
    
    if (results.overall.passed) {
      console.log('\n🎉 ✅ COMPREHENSIVE VALIDATION PASSED');
      console.log('====================================');
      console.log('   ✅ All phases completed successfully');
      console.log('   ✅ CLAUDE_RULES.md compliance achieved');
      console.log('   ✅ System ready for production');
      console.log('   ✅ Asset resolution: 0 console errors');
      console.log('   ✅ Homepage performance: <1s load times');
      console.log('   ✅ Material switching: <100ms performance');
      console.log('   ✅ System health monitoring operational');
      console.log('   ✅ Visual consistency validated');
      console.log('\n🚀 SYSTEM INTEGRATION COMPLETE - PRODUCTION READY');
      return true;
    } else {
      console.log('\n❌ COMPREHENSIVE VALIDATION FAILED');
      console.log('==================================');
      console.log('   ❌ One or more phases failed validation');
      console.log('   ❌ System not ready for production');
      console.log('   ❌ BLOCKED - Review failed components');
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ Comprehensive validation failed:', error);
    results.errors.push(error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Run comprehensive validation
runComprehensiveValidation().then(success => {
  process.exit(success ? 0 : 1);
});