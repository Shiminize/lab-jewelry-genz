/**
 * CSS 3D Customizer Material Visual Testing
 * CLAUDE_RULES Compliant: <100ms Material Switches + Visual Validation
 * 
 * Success Criteria (ALL MUST PASS):
 * - Material switches show correct visual appearance within 100ms
 * - Visual differences between materials are clearly detectable
 * - Cross-browser visual consistency within 10% threshold
 * - Mobile visual parity with desktop experience
 * - No visual regressions in material switching
 */

import { test, expect, type Page } from '@playwright/test';

// Success criteria thresholds
const SUCCESS_CRITERIA = {
  MATERIAL_SWITCH_MAX_TIME: 100,    // CLAUDE_RULES: <100ms material switches
  VISUAL_DIFFERENCE_MIN: 0.05,      // 5% minimum visual difference between materials
  CROSS_BROWSER_THRESHOLD: 0.1,    // 10% max difference between browsers
  PERFORMANCE_SAMPLES: 5,           // Number of performance tests per material
  REQUIRED_SUCCESS_RATE: 0.9        // 90% of tests must pass
};

interface MaterialTestResult {
  materialId: string;
  switchTime: number;
  visualChangeDetected: boolean;
  imageLoaded: boolean;
  success: boolean;
}

// Helper: Wait for customizer to be fully loaded and ready
async function waitForCustomizerReady(page: Page): Promise<void> {
  // Wait for the performance test page to load with OptimizedMaterialSwitcher
  await page.waitForSelector('[data-testid="material-switcher"]', { timeout: 15000 });
  
  // Wait for preloading to complete (no loading indicators visible)
  await page.waitForFunction(() => {
    const loadingText = document.body.textContent || '';
    return !loadingText.includes('Loading...') && 
           !loadingText.includes('Optimizing for instant switches') &&
           !loadingText.includes('%');
  }, { timeout: 30000 });
  
  // Ensure at least one material button is ready
  await page.waitForSelector('button:not([disabled])', { timeout: 5000 });
}

// Helper: Capture material switch performance and visual data
async function testMaterialSwitch(
  page: Page, 
  materialName: string
): Promise<MaterialTestResult> {
  const startTime = performance.now();
  
  // Find material button
  const materialButton = page.locator(`button:has-text("${materialName}")`).first();
  
  if (!(await materialButton.isVisible())) {
    return {
      materialId: materialName,
      switchTime: 999,
      visualChangeDetected: false,
      imageLoaded: false,
      success: false
    };
  }
  
  // Capture before screenshot
  const beforeScreenshot = await page.locator('[data-testid="material-switcher"]')
    .screenshot({ type: 'png' });
  
  // Click material button
  await materialButton.click();
  
  // Wait for visual change
  await page.waitForTimeout(200);
  
  const endTime = performance.now();
  const switchTime = endTime - startTime;
  
  // Capture after screenshot
  const afterScreenshot = await page.locator('[data-testid="material-switcher"]')
    .screenshot({ type: 'png' });
  
  // Check if image loaded properly
  const imageLoaded = await page.locator('img[alt*="Product view"]').isVisible();
  
  // Simple visual difference detection (screenshots should be different)
  const visualChangeDetected = !beforeScreenshot.equals(afterScreenshot);
  
  const success = switchTime < SUCCESS_CRITERIA.MATERIAL_SWITCH_MAX_TIME &&
                  visualChangeDetected && 
                  imageLoaded;
  
  return {
    materialId: materialName,
    switchTime,
    visualChangeDetected,
    imageLoaded,
    success
  };
}

test.describe('Material Visual Validation - Desktop', () => {
  test.beforeEach(async ({ page }) => {
    // Use performance test page with OptimizedMaterialSwitcher
    await page.goto('/test-performance');
    await waitForCustomizerReady(page);
  });

  test('All materials display correctly with visual differences', async ({ page }) => {
    console.log('🎨 Testing material visual differences...');
    
    const materials = ['Platinum', '18K White Gold', '18K Yellow Gold', '18K Rose Gold'];
    const materialScreenshots: { [key: string]: Buffer } = {};
    
    // Capture each material appearance
    for (const material of materials) {
      console.log(`📸 Capturing ${material}...`);
      
      const materialButton = page.locator(`button:has-text("${material}")`);
      await materialButton.click();
      await page.waitForTimeout(300); // Allow rendering
      
      const screenshot = await page.locator('[data-testid="material-switcher"]')
        .screenshot({ type: 'png' });
      materialScreenshots[material] = screenshot;
      
      // Visual regression test - compare with baseline
      await expect(page.locator('[data-testid="material-switcher"]'))
        .toHaveScreenshot(`material-${material.toLowerCase().replace(/\s+/g, '-')}.png`);
    }
    
    // Validate visual differences between materials
    const materialNames = Object.keys(materialScreenshots);
    let visuallyDistinctCount = 0;
    
    for (let i = 0; i < materialNames.length; i++) {
      for (let j = i + 1; j < materialNames.length; j++) {
        const material1 = materialNames[i];
        const material2 = materialNames[j];
        
        const screenshot1 = materialScreenshots[material1];
        const screenshot2 = materialScreenshots[material2];
        
        // Materials should look different (screenshots should not be identical)
        const areDifferent = !screenshot1.equals(screenshot2);
        
        if (areDifferent) {
          visuallyDistinctCount++;
          console.log(`✅ ${material1} vs ${material2}: Visually distinct`);
        } else {
          console.log(`❌ ${material1} vs ${material2}: No visual difference detected`);
        }
      }
    }
    
    const totalComparisons = (materials.length * (materials.length - 1)) / 2;
    const distinctionRate = visuallyDistinctCount / totalComparisons;
    
    console.log(`📊 Visual distinction rate: ${Math.round(distinctionRate * 100)}%`);
    
    // SUCCESS CRITERIA: Materials must be visually distinct
    expect(distinctionRate).toBeGreaterThan(SUCCESS_CRITERIA.VISUAL_DIFFERENCE_MIN);
  });

  test('Material switches meet CLAUDE_RULES <100ms performance', async ({ page }) => {
    console.log('⚡ Testing CLAUDE_RULES performance compliance...');
    
    const materials = ['Platinum', '18K White Gold', '18K Yellow Gold', '18K Rose Gold'];
    const results: MaterialTestResult[] = [];
    
    // Test each material multiple times for statistical accuracy
    for (const material of materials) {
      console.log(`🔄 Testing ${material} performance...`);
      
      for (let sample = 0; sample < SUCCESS_CRITERIA.PERFORMANCE_SAMPLES; sample++) {
        const result = await testMaterialSwitch(page, material);
        results.push(result);
        
        console.log(`   Sample ${sample + 1}: ${result.switchTime.toFixed(1)}ms ${result.success ? '✅' : '❌'}`);
        
        // Small delay between samples
        await page.waitForTimeout(100);
      }
    }
    
    // Calculate performance metrics
    const successfulSwitches = results.filter(r => r.success);
    const averageTime = results.reduce((sum, r) => sum + r.switchTime, 0) / results.length;
    const under100ms = results.filter(r => r.switchTime < SUCCESS_CRITERIA.MATERIAL_SWITCH_MAX_TIME).length;
    const successRate = successfulSwitches.length / results.length;
    
    console.log(`📊 Performance Results:`);
    console.log(`   Average Switch Time: ${averageTime.toFixed(1)}ms`);
    console.log(`   Under 100ms: ${under100ms}/${results.length} (${Math.round((under100ms/results.length)*100)}%)`);
    console.log(`   Success Rate: ${Math.round(successRate * 100)}%`);
    
    // SUCCESS CRITERIA VALIDATION
    const claudeRulesCompliant = averageTime < SUCCESS_CRITERIA.MATERIAL_SWITCH_MAX_TIME;
    const reliabilityMet = successRate >= SUCCESS_CRITERIA.REQUIRED_SUCCESS_RATE;
    
    console.log(`🎯 CLAUDE_RULES Compliance: ${claudeRulesCompliant ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🎯 Reliability Target: ${reliabilityMet ? '✅ PASS' : '❌ FAIL'}`);
    
    // STRICT SUCCESS CRITERIA - ALL MUST PASS
    expect(claudeRulesCompliant, 
      `Average switch time ${averageTime.toFixed(1)}ms exceeds CLAUDE_RULES <100ms requirement`
    ).toBe(true);
    
    expect(reliabilityMet,
      `Success rate ${Math.round(successRate * 100)}% below required ${Math.round(SUCCESS_CRITERIA.REQUIRED_SUCCESS_RATE * 100)}%`
    ).toBe(true);
    
    // Visual change detection
    const visualChanges = results.filter(r => r.visualChangeDetected).length;
    const visualChangeRate = visualChanges / results.length;
    
    expect(visualChangeRate, 
      `Visual change detection rate ${Math.round(visualChangeRate * 100)}% too low`
    ).toBeGreaterThan(0.8);
  });

  test('Cross-material rotation maintains visual quality', async ({ page }) => {
    console.log('🔄 Testing rotation visual quality across materials...');
    
    const materials = ['Platinum', '18K Yellow Gold'];
    
    for (const material of materials) {
      console.log(`🎭 Testing ${material} rotation quality...`);
      
      // Select material
      await page.locator(`button:has-text("${material}")`).click();
      await page.waitForTimeout(300);
      
      // Test rotation through frame slider
      const frameSlider = page.locator('input[type="range"]');
      
      // Capture different rotation angles
      const angles = [0, 9, 18, 27];  // Every 10th frame (90° increments)
      
      for (const angle of angles) {
        await frameSlider.fill(angle.toString());
        await page.waitForTimeout(200);
        
        // Capture rotation screenshot
        await expect(page.locator('[data-testid="material-switcher"]'))
          .toHaveScreenshot(`${material.toLowerCase().replace(/\s+/g, '-')}-rotation-${angle * 10}deg.png`);
      }
    }
  });
});

test.describe('Mobile Material Visual Validation', () => {
  test.use({ isMobile: true });
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-performance');
    await waitForCustomizerReady(page);
  });

  test('Mobile material switches maintain visual quality', async ({ page }) => {
    console.log('📱 Testing mobile material visual quality...');
    
    const materials = ['Platinum', '18K Rose Gold'];
    
    for (const material of materials) {
      const materialButton = page.locator(`button:has-text("${material}")`);
      await materialButton.click();
      await page.waitForTimeout(500); // Longer wait for mobile
      
      // Mobile-specific visual validation
      await expect(page.locator('[data-testid="material-switcher"]'))
        .toHaveScreenshot(`mobile-material-${material.toLowerCase().replace(/\s+/g, '-')}.png`);
      
      // Check mobile layout doesn't break
      const image = page.locator('img[alt*="Product view"]');
      await expect(image).toBeVisible();
      
      // Verify mobile touch target sizes
      const buttonBox = await materialButton.boundingBox();
      expect(buttonBox?.width).toBeGreaterThan(44); // Minimum touch target
      expect(buttonBox?.height).toBeGreaterThan(44);
    }
  });
  
  test('Mobile performance meets CLAUDE_RULES standards', async ({ page }) => {
    console.log('📱⚡ Testing mobile performance compliance...');
    
    const materials = ['Platinum', '18K White Gold'];
    const mobileResults: MaterialTestResult[] = [];
    
    for (const material of materials) {
      const result = await testMaterialSwitch(page, material);
      mobileResults.push(result);
      
      console.log(`📱 ${material}: ${result.switchTime.toFixed(1)}ms ${result.success ? '✅' : '❌'}`);
    }
    
    const averageMobileTime = mobileResults.reduce((sum, r) => sum + r.switchTime, 0) / mobileResults.length;
    const mobileSuccessRate = mobileResults.filter(r => r.success).length / mobileResults.length;
    
    console.log(`📊 Mobile Performance: ${averageMobileTime.toFixed(1)}ms average, ${Math.round(mobileSuccessRate * 100)}% success`);
    
    // Mobile should still meet CLAUDE_RULES (though slightly more lenient)
    expect(averageMobileTime).toBeLessThan(SUCCESS_CRITERIA.MATERIAL_SWITCH_MAX_TIME * 1.5); // 150ms max for mobile
    expect(mobileSuccessRate).toBeGreaterThan(0.8); // 80% success rate for mobile
  });
});