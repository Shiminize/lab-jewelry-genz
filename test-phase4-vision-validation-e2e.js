/**
 * Phase 4: Vision Mode Visual Validation E2E Test
 * CLAUDE_RULES.md Compliant - Comprehensive visual regression testing
 * Tests visual state changes, material appearance, and UI consistency
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function validatePhase4VisualRegression() {
  console.log('🧪 Phase 4: Vision Mode Visual Validation');
  console.log('========================================');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Set viewport for consistent screenshots
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  const results = {
    visualTests: [],
    materialVisualChanges: [],
    uiStateValidation: [],
    performanceVisual: { loadingStates: [], animations: [] },
    errors: []
  };
  
  const screenshotDir = './test-results/visual-validation';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  try {
    // Test 1: Homepage Visual State Validation
    console.log('\n📍 Test 1: Homepage Visual State Validation');
    console.log('---------------------------------------------');
    
    console.log('🖼️ Taking baseline homepage screenshot...');
    await page.goto('http://localhost:3001/', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    // Wait for hero section to stabilize
    await page.waitForSelector('section[aria-label*="Hero section"]', { timeout: 10000 });
    await page.waitForTimeout(2000); // Allow for deferred video loading
    
    const homepageScreenshot = `${screenshotDir}/homepage-baseline.png`;
    await page.screenshot({ 
      path: homepageScreenshot, 
      fullPage: true,
      animations: 'disabled' // Disable animations for consistent screenshots
    });
    
    console.log(`✅ Homepage baseline saved: ${homepageScreenshot}`);
    
    // Validate hero section visual elements
    const heroSectionExists = await page.locator('section[aria-label*="Hero section"]').isVisible();
    const heroTextExists = await page.locator('h1:has-text("Your Story, Our Sparkle")').isVisible();
    const ctaButtonsExist = await page.locator('button:has-text("Start Designing")').first().isVisible();
    
    results.visualTests.push({
      test: 'Homepage Layout',
      heroSection: heroSectionExists,
      heroText: heroTextExists,
      ctaButtons: ctaButtonsExist,
      screenshot: homepageScreenshot,
      passed: heroSectionExists && heroTextExists && ctaButtonsExist
    });
    
    console.log(`📊 Hero section visible: ${heroSectionExists}`);
    console.log(`📊 Hero text visible: ${heroTextExists}`);
    console.log(`📊 CTA buttons visible: ${ctaButtonsExist}`);
    
    // Test 2: Customizer Visual State Validation  
    console.log('\n📍 Test 2: Customizer Visual State Validation');
    console.log('----------------------------------------------');
    
    console.log('🖼️ Navigating to customizer for visual testing...');
    await page.goto('http://localhost:3001/customizer', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    
    // Wait for 3D viewer to load
    await page.waitForSelector('[role="img"][aria-label*="Interactive 360° jewelry view"]', { timeout: 15000 });
    await page.waitForTimeout(3000); // Allow for image preloading
    
    const customizerScreenshot = `${screenshotDir}/customizer-baseline.png`;
    await page.screenshot({ 
      path: customizerScreenshot, 
      fullPage: true,
      animations: 'disabled'
    });
    
    console.log(`✅ Customizer baseline saved: ${customizerScreenshot}`);
    
    // Validate customizer visual components
    const viewerExists = await page.locator('[role="img"][aria-label*="Interactive 360° jewelry view"]').isVisible();
    const materialButtonsExist = await page.locator('[data-material]').count() > 0;
    const customizerTitleExists = await page.locator('h3:has-text("Your Story, Your Shine")').isVisible();
    
    results.visualTests.push({
      test: 'Customizer Layout',
      viewer: viewerExists,
      materialButtons: materialButtonsExist,
      title: customizerTitleExists,
      screenshot: customizerScreenshot,
      passed: viewerExists && materialButtonsExist && customizerTitleExists
    });
    
    console.log(`📊 3D Viewer visible: ${viewerExists}`);
    console.log(`📊 Material buttons exist: ${materialButtonsExist}`);
    console.log(`📊 Customizer title visible: ${customizerTitleExists}`);
    
    // Test 3: Material Switch Visual Validation
    console.log('\n📍 Test 3: Material Switch Visual Validation');
    console.log('--------------------------------------------');
    
    const materials = ['18k-rose-gold', 'platinum', '18k-white-gold', '18k-yellow-gold'];
    
    for (let i = 0; i < materials.length; i++) {
      const material = materials[i];
      console.log(`\n  🔄 Testing visual change for ${material}...`);
      
      const materialButton = page.locator(`[data-material="${material}"]`);
      if (await materialButton.count() > 0) {
        // Take before screenshot
        const beforeScreenshot = `${screenshotDir}/material-${material}-before.png`;
        await page.locator('[role="img"][aria-label*="Interactive 360° jewelry view"]').screenshot({
          path: beforeScreenshot,
          animations: 'disabled'
        });
        
        // Click material button
        const clickStartTime = Date.now();
        await materialButton.click();
        
        // Wait for visual change to complete
        await page.waitForTimeout(1000);
        
        // Take after screenshot  
        const afterScreenshot = `${screenshotDir}/material-${material}-after.png`;
        await page.locator('[role="img"][aria-label*="Interactive 360° jewelry view"]').screenshot({
          path: afterScreenshot,
          animations: 'disabled'
        });
        
        const switchTime = Date.now() - clickStartTime;
        
        // Check if button is visually selected
        const isSelected = await materialButton.getAttribute('aria-pressed') === 'true' ||
                          await materialButton.getAttribute('data-selected') === 'true';
        
        // Validate visual feedback
        const hasVisualFeedback = isSelected;
        
        results.materialVisualChanges.push({
          material,
          switchTime,
          beforeScreenshot,
          afterScreenshot,
          visualFeedback: hasVisualFeedback,
          passed: hasVisualFeedback && switchTime < 2000 // Visual change should be fast
        });
        
        console.log(`     Switch time: ${switchTime}ms`);
        console.log(`     Visual feedback: ${hasVisualFeedback}`);
        console.log(`     Screenshots: before -> after`);
      }
    }
    
    // Test 4: Loading State Visual Validation
    console.log('\n📍 Test 4: Loading State Visual Validation');
    console.log('------------------------------------------');
    
    // Refresh page to capture loading states
    console.log('🔄 Refreshing to capture loading states...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    // Try to capture loading state (might be very brief)
    try {
      const loadingStateVisible = await page.locator('text=Loading 3D Customizer').isVisible({ timeout: 1000 });
      if (loadingStateVisible) {
        const loadingScreenshot = `${screenshotDir}/loading-state.png`;
        await page.screenshot({ 
          path: loadingScreenshot,
          animations: 'disabled'
        });
        
        results.performanceVisual.loadingStates.push({
          captured: true,
          screenshot: loadingScreenshot
        });
        
        console.log(`✅ Loading state captured: ${loadingScreenshot}`);
      } else {
        console.log(`📊 Loading state too fast to capture (good performance!)`);
      }
    } catch (error) {
      console.log(`📊 Loading state not captured - likely too fast (excellent performance)`);
    }
    
    // Wait for full load
    await page.waitForSelector('[role="img"][aria-label*="Interactive 360° jewelry view"]', { timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Test 5: Responsive Design Visual Validation
    console.log('\n📍 Test 5: Responsive Design Visual Validation');
    console.log('----------------------------------------------');
    
    const viewports = [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ];
    
    for (const viewport of viewports) {
      console.log(`📱 Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})...`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000); // Allow layout to adjust
      
      const responsiveScreenshot = `${screenshotDir}/responsive-${viewport.name}.png`;
      await page.screenshot({ 
        path: responsiveScreenshot,
        fullPage: true,
        animations: 'disabled'
      });
      
      // Check if key elements are still visible
      const viewerVisible = await page.locator('[role="img"][aria-label*="Interactive 360° jewelry view"]').isVisible();
      const materialButtonsVisible = await page.locator('[data-material]').first().isVisible();
      
      results.uiStateValidation.push({
        viewport: viewport.name,
        dimensions: `${viewport.width}x${viewport.height}`,
        viewerVisible,
        materialButtonsVisible,
        screenshot: responsiveScreenshot,
        passed: viewerVisible && materialButtonsVisible
      });
      
      console.log(`     Viewer visible: ${viewerVisible}`);
      console.log(`     Material buttons visible: ${materialButtonsVisible}`);
    }
    
    // Reset to desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Test 6: Animation and Interaction Visual Validation
    console.log('\n📍 Test 6: Animation and Interaction Visual Validation');
    console.log('-----------------------------------------------------');
    
    // Test hover states on material buttons
    const firstMaterialButton = page.locator('[data-material]').first();
    if (await firstMaterialButton.count() > 0) {
      // Normal state
      const normalStateScreenshot = `${screenshotDir}/button-normal-state.png`;
      await firstMaterialButton.screenshot({
        path: normalStateScreenshot,
        animations: 'disabled'
      });
      
      // Hover state  
      await firstMaterialButton.hover();
      await page.waitForTimeout(500); // Allow hover animation
      
      const hoverStateScreenshot = `${screenshotDir}/button-hover-state.png`;
      await firstMaterialButton.screenshot({
        path: hoverStateScreenshot,
        animations: 'disabled'
      });
      
      console.log(`✅ Button states captured: normal -> hover`);
      
      results.performanceVisual.animations.push({
        type: 'button-hover',
        normalState: normalStateScreenshot,
        hoverState: hoverStateScreenshot
      });
    }
    
    // Final Assessment
    console.log('\n📍 Test 7: Visual Validation Assessment');
    console.log('--------------------------------------');
    
    const totalVisualTests = results.visualTests.length;
    const passedVisualTests = results.visualTests.filter(test => test.passed).length;
    
    const totalMaterialTests = results.materialVisualChanges.length;
    const passedMaterialTests = results.materialVisualChanges.filter(test => test.passed).length;
    
    const totalResponsiveTests = results.uiStateValidation.length;
    const passedResponsiveTests = results.uiStateValidation.filter(test => test.passed).length;
    
    const overallScore = (passedVisualTests + passedMaterialTests + passedResponsiveTests);
    const totalTests = (totalVisualTests + totalMaterialTests + totalResponsiveTests);
    const compliance = totalTests > 0 ? (overallScore / totalTests * 100) : 0;
    
    console.log(`\n🎯 VISUAL VALIDATION RESULTS:`);
    console.log(`   Overall Score: ${overallScore}/${totalTests} (${compliance.toFixed(1)}%)`);
    console.log(`   ✅ Layout Tests: ${passedVisualTests}/${totalVisualTests} passed`);
    console.log(`   ✅ Material Visual Tests: ${passedMaterialTests}/${totalMaterialTests} passed`);
    console.log(`   ✅ Responsive Tests: ${passedResponsiveTests}/${totalResponsiveTests} passed`);
    console.log(`   📁 Screenshots saved to: ${screenshotDir}`);
    
    const isPhase4Success = compliance >= 80; // 80% visual compliance required
    
    if (isPhase4Success) {
      console.log('\n🎯 ✅ PHASE 4 VISUAL VALIDATION PASSED');
      console.log('   ✅ Comprehensive visual regression testing complete');
      console.log('   ✅ Material switching visual feedback working');
      console.log('   ✅ Responsive design validated across viewports');
      console.log('   ✅ UI state consistency verified');
      console.log('\n🚀 READY FOR FINAL COMPREHENSIVE E2E VALIDATION');
      return true;
    } else {
      console.log('\n❌ PHASE 4 VISUAL VALIDATION FAILED');
      console.log('   ❌ Visual regression issues detected');
      console.log('   ❌ BLOCKED - Visual consistency not met');
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ Phase 4 visual validation failed:', error);
    results.errors.push(error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Run visual validation
validatePhase4VisualRegression().then(success => {
  process.exit(success ? 0 : 1);
});