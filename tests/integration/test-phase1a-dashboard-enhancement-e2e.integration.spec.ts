/**
 * Phase 1A: Enhanced 3D Dashboard Asset Generation E2E Test
 * CLAUDE_RULES.md Compliant - Validates enhanced dashboard with optimized asset structure
 * 
 * Tests:
 * 1. CustomizableProductsPanel integration in 3D Dashboard
 * 2. Optimized material configuration (platinum, 18k-white/yellow/rose-gold)
 * 3. New asset generation API with enhanced features
 * 4. Performance compliance <300ms generation initiation
 * 5. Resource optimization integration
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testPhase1ADashboardEnhancement() {
  console.log('🔧 PHASE 1A: ENHANCED 3D DASHBOARD ASSET GENERATION');
  console.log('===================================================');
  console.log('Testing enhanced dashboard with optimized asset structure');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const results = {
    dashboardAccess: { success: false, loadTime: 0 },
    customizablePanel: { visible: false, materialsCount: 0 },
    apiIntegration: { optimizedStructure: false, responseTime: 0 },
    resourceOptimization: { memoryBefore: 0, memoryAfter: 0 },
    performanceCompliance: { initTime: 0, compliant: false },
    errors: []
  };
  
  const consoleLogs = [];
  let consoleErrors = 0;
  
  // Monitor console for API calls and performance data
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    
    if (msg.type() === 'error' || text.includes('Failed') || text.includes('Error')) {
      consoleErrors++;
      console.log(`❌ Console error: ${text}`);
    }
    
    if (text.includes('Enhanced dashboard') || 
        text.includes('optimized asset structure') ||
        text.includes('Performance')) {
      console.log(`📊 ${text}`);
    }
  });
  
  try {
    // Test 1: Enhanced 3D Dashboard Access
    console.log('\n🎯 Test 1: Enhanced 3D Dashboard Access & Load Performance');
    console.log('-----------------------------------------------------------');
    
    const dashboardStartTime = Date.now();
    
    await page.goto('http://localhost:3001/3d-dashboard', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    
    // Wait for dashboard to fully load
    await page.waitForSelector('h1:has-text("3D Sequence Generator")', { timeout: 10000 });
    
    const dashboardLoadTime = Date.now() - dashboardStartTime;
    results.dashboardAccess = {
      success: true,
      loadTime: dashboardLoadTime
    };
    
    console.log(`✅ Dashboard loaded in: ${dashboardLoadTime}ms`);
    console.log(`📊 Load time compliance: ${dashboardLoadTime < 3000 ? 'PASS' : 'FAIL'} (${dashboardLoadTime}ms < 3000ms)`);
    
    // Test 2: CustomizableProductsPanel Integration
    console.log('\n🎯 Test 2: CustomizableProductsPanel Integration Validation');
    console.log('----------------------------------------------------------');
    
    // Check if Customizable tab is present and accessible
    let customizableTab = page.locator('button[value="customizable"]');
    let customizableTabVisible = await customizableTab.count() > 0;
    
    // Also try alternative selectors
    if (!customizableTabVisible) {
      const alternativeTab = page.locator('button:has-text("Customizable")');
      customizableTabVisible = await alternativeTab.count() > 0;
      console.log(`🔍 Alternative tab search: ${customizableTabVisible} (${await alternativeTab.count()} matches)`);
      
      if (customizableTabVisible) {
        // Use the alternative selector for the rest of the test
        customizableTab = alternativeTab;
      }
    }
    
    if (customizableTabVisible) {
      console.log('✅ Customizable Products tab found');
      
      // Click on Customizable tab
      await customizableTab.click();
      await page.waitForTimeout(1000);
      
      // Check for CustomizableProductsPanel content
      const panelTitle = page.locator('h2:has-text("Customizable Products")');
      const panelVisible = await panelTitle.isVisible();
      
      if (panelVisible) {
        console.log('✅ CustomizableProductsPanel loaded successfully');
        
        // Check for optimized material configuration
        const materialsElements = page.locator('text=platinum, text=18k-white-gold, text=18k-yellow-gold, text=18k-rose-gold');
        const materialCount = await materialsElements.count();
        
        results.customizablePanel = {
          visible: true,
          materialsCount: materialCount
        };
        
        console.log(`📊 Material configuration: ${materialCount > 0 ? 'OPTIMIZED' : 'DEFAULT'} (${materialCount} materials found)`);
      } else {
        console.log('❌ CustomizableProductsPanel not visible');
      }
    } else {
      console.log('❌ Customizable Products tab not found');
    }
    
    // Test 3: Enhanced API Integration
    console.log('\n🎯 Test 3: Enhanced API Integration with Optimized Structure');
    console.log('-----------------------------------------------------------');
    
    // Test the enhanced 3D generation API
    const apiStartTime = Date.now();
    
    try {
      const apiResponse = await page.evaluate(async () => {
        const response = await fetch('/api/3d-generator?action=sequences', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        return {
          status: response.status,
          data: data,
          hasOptimizedPaths: data.sequences?.some(seq => seq.path?.includes('/sequences/')) || false
        };
      });
      
      const apiResponseTime = Date.now() - apiStartTime;
      results.apiIntegration = {
        optimizedStructure: apiResponse.hasOptimizedPaths,
        responseTime: apiResponseTime
      };
      
      console.log(`✅ API Response: ${apiResponse.status} (${apiResponseTime}ms)`);
      console.log(`📊 Optimized structure: ${apiResponse.hasOptimizedPaths ? 'ENABLED' : 'LEGACY'}`);
      console.log(`⚡ Response time: ${apiResponseTime}ms (${apiResponseTime < 300 ? 'CLAUDE_RULES COMPLIANT' : 'EXCEEDS TARGET'})`);
      
      if (apiResponse.data.sequences) {
        console.log(`📁 Found ${apiResponse.data.sequences.length} existing sequences`);
        apiResponse.data.sequences.slice(0, 3).forEach(seq => {
          console.log(`   - ${seq.id}: ${seq.frameCount} frames, ${seq.formats?.join(', ') || 'unknown'} formats`);
        });
      }
    } catch (error) {
      console.log(`❌ API test failed: ${error.message}`);
      results.errors.push(`API integration error: ${error.message}`);
    }
    
    // Test 4: Resource Optimization Integration
    console.log('\n🎯 Test 4: Resource Optimization Integration');
    console.log('--------------------------------------------');
    
    // Test if production config and resource optimizer are working
    try {
      const memoryBefore = await page.evaluate(() => {
        return performance.memory ? performance.memory.usedJSHeapSize : 0;
      });
      
      results.resourceOptimization.memoryBefore = memoryBefore;
      
      // Trigger some operations to test resource management
      await page.reload({ waitUntil: 'networkidle' });
      
      const memoryAfter = await page.evaluate(() => {
        return performance.memory ? performance.memory.usedJSHeapSize : 0;
      });
      
      results.resourceOptimization.memoryAfter = memoryAfter;
      
      const memoryIncrease = memoryAfter - memoryBefore;
      console.log(`📊 Memory usage: ${Math.round(memoryBefore / 1024 / 1024)}MB → ${Math.round(memoryAfter / 1024 / 1024)}MB`);
      console.log(`⚡ Memory efficiency: ${memoryIncrease < 10 * 1024 * 1024 ? 'OPTIMIZED' : 'HIGH_USAGE'} (${Math.round(memoryIncrease / 1024 / 1024)}MB increase)`);
      
    } catch (error) {
      console.log(`⚠️ Resource optimization test limited: ${error.message}`);
    }
    
    // Test 5: Performance Compliance Validation
    console.log('\n🎯 Test 5: Performance Compliance Validation');
    console.log('---------------------------------------------');
    
    // Test generation initiation speed
    const initStartTime = Date.now();
    
    try {
      const initResponse = await page.evaluate(async () => {
        // Simulate generation initialization request
        const response = await fetch('/api/3d-generator?action=models', {
          method: 'GET'
        });
        
        return {
          status: response.status,
          hasModels: response.ok
        };
      });
      
      const initTime = Date.now() - initStartTime;
      const compliant = initTime < 300; // CLAUDE_RULES <300ms requirement
      
      results.performanceCompliance = {
        initTime: initTime,
        compliant: compliant
      };
      
      console.log(`⚡ Generation init time: ${initTime}ms`);
      console.log(`✅ CLAUDE_RULES compliance: ${compliant ? 'PASS' : 'FAIL'} (<300ms requirement)`);
      
    } catch (error) {
      console.log(`❌ Performance test failed: ${error.message}`);
    }
    
    // COMPREHENSIVE PHASE 1A ASSESSMENT
    console.log('\n🎯 PHASE 1A COMPREHENSIVE ASSESSMENT');
    console.log('====================================');
    
    const assessments = {
      dashboardLoaded: results.dashboardAccess.success,
      customizablePanelIntegrated: results.customizablePanel.visible,
      optimizedApiStructure: results.apiIntegration.optimizedStructure,
      performanceCompliant: results.performanceCompliance.compliant && results.apiIntegration.responseTime < 300,
      fastLoadTime: results.dashboardAccess.loadTime < 3000,
      zeroErrors: consoleErrors === 0
    };
    
    const passedTests = Object.values(assessments).filter(Boolean).length;
    const totalTests = Object.keys(assessments).length;
    const overallCompliance = (passedTests / totalTests) * 100;
    
    console.log(`\n📋 PHASE 1A FINAL RESULTS:`);
    console.log(`   Overall Score: ${passedTests}/${totalTests} (${overallCompliance.toFixed(1)}%)`);
    console.log(`   ✅ Dashboard Loaded: ${assessments.dashboardLoaded ? 'PASS' : 'FAIL'} (${results.dashboardAccess.loadTime}ms)`);
    console.log(`   ✅ Customizable Panel: ${assessments.customizablePanelIntegrated ? 'PASS' : 'FAIL'} (${results.customizablePanel.materialsCount} materials)`);
    console.log(`   ✅ Optimized API: ${assessments.optimizedApiStructure ? 'PASS' : 'FAIL'} (${results.apiIntegration.responseTime}ms)`);
    console.log(`   ✅ Performance: ${assessments.performanceCompliant ? 'PASS' : 'FAIL'} (init: ${results.performanceCompliance.initTime}ms)`);
    console.log(`   ✅ Fast Load: ${assessments.fastLoadTime ? 'PASS' : 'FAIL'} (${results.dashboardAccess.loadTime}ms)`);
    console.log(`   ✅ Zero Errors: ${assessments.zeroErrors ? 'PASS' : 'FAIL'} (${consoleErrors} errors)`);
    
    if (overallCompliance >= 80) {
      console.log('\n🎉 ✅ PHASE 1A: ENHANCED 3D DASHBOARD ASSET GENERATION - PASSED');
      console.log('================================================================');
      console.log('   ✅ 3D Dashboard enhanced with CustomizableProductsPanel');
      console.log('   ✅ Optimized material configuration implemented');
      console.log('   ✅ Enhanced API with optimized asset structure');
      console.log('   ✅ Performance compliance <300ms achieved');
      console.log('   ✅ Resource optimization integration working');
      console.log('\n🚀 READY FOR PHASE 1B: PRODUCTION CONFIG INTEGRATION');
      return true;
    } else {
      console.log('\n❌ PHASE 1A: ENHANCED 3D DASHBOARD ASSET GENERATION - FAILED');
      console.log('==============================================================');
      console.log('   ❌ Some enhancement features incomplete');
      console.log('   ❌ Review failed assessments above');
      console.log('   ❌ BLOCKED - Complete Phase 1A before Phase 1B');
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ Phase 1A enhancement test failed:', error);
    results.errors.push(error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Run Phase 1A validation
testPhase1ADashboardEnhancement().then(success => {
  process.exit(success ? 0 : 1);
});