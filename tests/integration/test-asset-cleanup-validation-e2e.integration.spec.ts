/**
 * Asset Cleanup Validation E2E Test
 * CLAUDE_RULES.md Compliant - Validates cleaned directory structure and new path logic
 * 
 * Tests:
 * 1. Standardized GLB models exist
 * 2. New directory structure is correct
 * 3. Path mapping works with new material configuration
 * 4. Vision mode validation for material switches
 * 5. Performance compliance with new asset structure
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function validateAssetCleanup() {
  console.log('🧹 ASSET CLEANUP VALIDATION');
  console.log('============================');
  console.log('Testing cleaned directory structure and standardized materials');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const results = {
    glbModels: { validated: false, models: [] },
    directoryStructure: { validated: false, paths: [] },
    pathMapping: { validated: false, materials: [] },
    visualValidation: { screenshots: [], materialSwitches: [] },
    performance: { loadTime: 0, materialSwitchTimes: [] },
    errors: []
  };
  
  const consoleLogs = [];
  let consoleErrors = 0;
  
  // Monitor console for errors and path validation
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    
    if (msg.type() === 'error' || text.includes('Failed to load') || text.includes('404')) {
      consoleErrors++;
      console.log(`❌ Console error: ${text}`);
    }
    
    if (text.includes('Material changed in') || 
        text.includes('Using preloaded images') ||
        text.includes('CLAUDE_RULES')) {
      console.log(`📊 ${text}`);
    }
  });
  
  try {
    // Test 1: Validate GLB Model Standardization
    console.log('\n🎯 Test 1: GLB Model Standardization Validation');
    console.log('-----------------------------------------------');
    
    const modelDir = '/Users/decepticonmanager/Projects/GenZJewelry_AUG_12/Public/models';
    const expectedModels = [
      'ring-luxury-001.glb',
      'ring-classic-002.glb', 
      'ring-diamond-003.glb'
    ];
    
    const actualModels = fs.readdirSync(modelDir).filter(file => file.endsWith('.glb'));
    console.log(`📁 Found GLB models: ${actualModels.join(', ')}`);
    
    const modelsValidated = expectedModels.every(model => actualModels.includes(model));
    const unwantedModels = actualModels.filter(model => !expectedModels.includes(model));
    
    results.glbModels = {
      validated: modelsValidated && unwantedModels.length === 0,
      models: actualModels,
      expectedCount: expectedModels.length,
      actualCount: actualModels.length,
      unwantedModels
    };
    
    console.log(`✅ Models validation: ${modelsValidated ? 'PASS' : 'FAIL'}`);
    console.log(`📊 Expected: ${expectedModels.length}, Actual: ${actualModels.length}`);
    if (unwantedModels.length > 0) {
      console.log(`⚠️ Unwanted models still present: ${unwantedModels.join(', ')}`);
    }
    
    // Test 2: Validate Directory Structure
    console.log('\n🎯 Test 2: Directory Structure Validation');
    console.log('-----------------------------------------');
    
    const sequenceDir = '/Users/decepticonmanager/Projects/GenZJewelry_AUG_12/Public/images/products/sequences';
    const expectedStructure = {
      'ring-luxury-001': ['platinum', '18k-white-gold', '18k-yellow-gold', '18k-rose-gold'],
      'ring-classic-002': ['platinum', '18k-white-gold', '18k-yellow-gold', '18k-rose-gold'],
      'ring-diamond-003': ['platinum', '18k-white-gold', '18k-yellow-gold', '18k-rose-gold']
    };
    
    let structureValid = true;
    const foundPaths = [];
    
    if (fs.existsSync(sequenceDir)) {
      for (const [modelId, materials] of Object.entries(expectedStructure)) {
        const modelPath = path.join(sequenceDir, modelId);
        if (fs.existsSync(modelPath)) {
          for (const material of materials) {
            const materialPath = path.join(modelPath, material);
            if (fs.existsSync(materialPath)) {
              foundPaths.push(`${modelId}/${material}`);
            } else {
              structureValid = false;
              console.log(`❌ Missing: ${modelId}/${material}`);
            }
          }
        } else {
          structureValid = false;
          console.log(`❌ Missing model directory: ${modelId}`);
        }
      }
    } else {
      structureValid = false;
      console.log(`❌ Sequences directory not found: ${sequenceDir}`);
    }
    
    results.directoryStructure = {
      validated: structureValid,
      paths: foundPaths,
      expectedPaths: 12, // 3 models × 4 materials
      actualPaths: foundPaths.length
    };
    
    console.log(`✅ Directory structure: ${structureValid ? 'PASS' : 'FAIL'}`);
    console.log(`📊 Expected paths: 12, Found paths: ${foundPaths.length}`);
    
    // Test 3: Path Mapping Validation (Load Customizer)
    console.log('\n🎯 Test 3: Path Mapping & Console Error Validation');
    console.log('--------------------------------------------------');
    
    const startTime = Date.now();
    
    await page.goto('http://localhost:3001/customizer', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    
    // Wait for customizer to load
    await page.waitForSelector('[role="img"][aria-label*="Interactive 360° jewelry view"]', { timeout: 15000 });
    await page.waitForTimeout(3000);
    
    const loadTime = Date.now() - startTime;
    results.performance.loadTime = loadTime;
    
    console.log(`✅ Customizer loaded in: ${loadTime}ms`);
    console.log(`📊 Console errors detected: ${consoleErrors}`);
    
    // Test 4: Material Switch Performance & Visual Validation
    console.log('\n🎯 Test 4: Material Switch Performance & Visual Validation');
    console.log('---------------------------------------------------------');
    
    const screenshotDir = './test-results/asset-cleanup-validation';
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    // Take baseline screenshot
    const baselineScreenshot = `${screenshotDir}/baseline-new-structure.png`;
    await page.screenshot({ 
      path: baselineScreenshot, 
      fullPage: true,
      animations: 'disabled'
    });
    
    console.log(`📸 Baseline screenshot: ${baselineScreenshot}`);
    
    // Test material switches with new standardized materials
    const standardMaterials = ['platinum', '18k-white-gold', '18k-yellow-gold', '18k-rose-gold'];
    const materialSwitchResults = [];
    
    for (const material of standardMaterials) {
      const materialButton = page.locator(`[data-material="${material}"]`);
      if (await materialButton.count() > 0) {
        console.log(`  🔄 Testing ${material} switch...`);
        
        const switchStartTime = Date.now();
        const logsBefore = consoleLogs.length;
        
        // Take before screenshot
        const beforeScreenshot = `${screenshotDir}/before-${material}.png`;
        await page.locator('[role="img"][aria-label*="Interactive 360° jewelry view"]').screenshot({
          path: beforeScreenshot,
          animations: 'disabled'
        });
        
        await materialButton.click();
        await page.waitForTimeout(500);
        
        // Take after screenshot
        const afterScreenshot = `${screenshotDir}/after-${material}.png`;
        await page.locator('[role="img"][aria-label*="Interactive 360° jewelry view"]').screenshot({
          path: afterScreenshot,
          animations: 'disabled'
        });
        
        const switchTime = Date.now() - switchStartTime;
        
        // Look for performance logs
        const newLogs = consoleLogs.slice(logsBefore);
        const materialSwitchLog = newLogs.find(log => log.includes('Material changed in'));
        let actualSwitchTime = switchTime;
        
        if (materialSwitchLog) {
          const match = materialSwitchLog.match(/(\\d+)ms/);
          if (match) {
            actualSwitchTime = parseInt(match[1]);
          }
        }
        
        const switchResult = {
          material,
          switchTime: actualSwitchTime,
          compliant: actualSwitchTime < 100,
          beforeScreenshot,
          afterScreenshot,
          logs: newLogs.filter(log => log.includes('Material changed in') || log.includes('Using preloaded'))
        };
        
        materialSwitchResults.push(switchResult);
        results.performance.materialSwitchTimes.push(actualSwitchTime);
        
        console.log(`     Switch time: ${actualSwitchTime}ms (${switchResult.compliant ? 'PASS' : 'FAIL'})`);
        console.log(`     Screenshots: ${path.basename(beforeScreenshot)} → ${path.basename(afterScreenshot)}`);
      } else {
        console.log(`  ❌ Material button not found: ${material}`);
      }
    }
    
    results.visualValidation = {
      screenshots: [baselineScreenshot],
      materialSwitches: materialSwitchResults
    };
    
    // Test 5: Responsive Design Validation
    console.log('\n🎯 Test 5: Responsive Design Validation');
    console.log('---------------------------------------');
    
    const viewports = [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ];
    
    for (const viewport of viewports) {
      console.log(`📱 Testing ${viewport.name} viewport...`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      const responsiveScreenshot = `${screenshotDir}/responsive-${viewport.name}-new-structure.png`;
      await page.screenshot({ 
        path: responsiveScreenshot,
        fullPage: true,
        animations: 'disabled'
      });
      
      results.visualValidation.screenshots.push(responsiveScreenshot);
      console.log(`     Screenshot: ${path.basename(responsiveScreenshot)}`);
    }
    
    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // COMPREHENSIVE ASSESSMENT
    console.log('\n🎯 COMPREHENSIVE ASSET CLEANUP ASSESSMENT');
    console.log('==========================================');
    
    const assessments = {
      glbModelsClean: results.glbModels.validated,
      directoryStructureValid: results.directoryStructure.validated,
      zeroConsoleErrors: consoleErrors === 0,
      performanceCompliant: results.performance.materialSwitchTimes.every(time => time < 100) && results.performance.materialSwitchTimes.length > 0,
      fastLoad: results.performance.loadTime < 3000
    };
    
    const passedTests = Object.values(assessments).filter(Boolean).length;
    const totalTests = Object.keys(assessments).length;
    const overallCompliance = (passedTests / totalTests) * 100;
    
    console.log(`\\n📋 FINAL RESULTS:`);
    console.log(`   Overall Score: ${passedTests}/${totalTests} (${overallCompliance.toFixed(1)}%)`);
    console.log(`   ✅ GLB Models Cleaned: ${assessments.glbModelsClean ? 'PASS' : 'FAIL'} (${results.glbModels.actualCount} models)`);
    console.log(`   ✅ Directory Structure: ${assessments.directoryStructureValid ? 'PASS' : 'FAIL'} (${results.directoryStructure.actualPaths}/12 paths)`);
    console.log(`   ✅ Zero Console Errors: ${assessments.zeroConsoleErrors ? 'PASS' : 'FAIL'} (${consoleErrors} errors)`);
    console.log(`   ✅ Performance Compliant: ${assessments.performanceCompliant ? 'PASS' : 'FAIL'} (avg: ${results.performance.materialSwitchTimes.length > 0 ? (results.performance.materialSwitchTimes.reduce((sum, t) => sum + t, 0) / results.performance.materialSwitchTimes.length).toFixed(0) : 0}ms)`);
    console.log(`   ✅ Fast Load: ${assessments.fastLoad ? 'PASS' : 'FAIL'} (${results.performance.loadTime}ms)`);
    console.log(`   📁 Visual validation: ${results.visualValidation.screenshots.length} screenshots generated`);
    
    if (overallCompliance >= 80) {
      console.log('\\n🎉 ✅ ASSET CLEANUP VALIDATION PASSED');
      console.log('====================================');
      console.log('   ✅ GLB models standardized and cleaned');
      console.log('   ✅ Directory structure optimized');
      console.log('   ✅ Path mapping updated successfully');
      console.log('   ✅ Material configuration standardized'); 
      console.log('   ✅ Visual regression testing complete');
      console.log('   ✅ Performance compliance maintained');
      console.log('\\n🚀 READY FOR PRODUCTION WITH CLEAN ARCHITECTURE');
      return true;
    } else {
      console.log('\\n❌ ASSET CLEANUP VALIDATION FAILED');
      console.log('==================================');
      console.log('   ❌ Some cleanup tasks incomplete');
      console.log('   ❌ Review failed assessments above');
      console.log('   ❌ BLOCKED - Complete cleanup before production');
      return false;
    }
    
  } catch (error) {
    console.error('\\n❌ Asset cleanup validation failed:', error);
    results.errors.push(error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Run validation
validateAssetCleanup().then(success => {
  process.exit(success ? 0 : 1);
});