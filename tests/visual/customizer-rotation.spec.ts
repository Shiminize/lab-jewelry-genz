/**
 * CSS 3D Customizer Rotation Visual Testing
 * CLAUDE_RULES Compliant: Smooth rotation + Visual validation
 * 
 * Success Criteria (ALL MUST PASS):
 * - Rotation transitions are visually smooth across all frames
 * - No visual glitches or jumping between frame transitions
 * - Mobile rotation maintains quality and responsiveness
 * - Frame-by-frame visual consistency verification
 */

import { test, expect, type Page } from '@playwright/test';

// Success criteria for rotation testing
const ROTATION_CRITERIA = {
  MAX_FRAME_SWITCH_TIME: 50,       // 50ms max per frame switch
  ROTATION_SMOOTHNESS_THRESHOLD: 0.9, // 90% of transitions must be smooth
  VISUAL_CONSISTENCY_CHECK: true,   // Frame-by-frame visual validation
  MOBILE_PERFORMANCE_FACTOR: 1.5    // 50% more time allowed for mobile
};

interface RotationTestResult {
  frameNumber: number;
  switchTime: number;
  visuallySmooth: boolean;
  success: boolean;
}

// Helper: Wait for customizer to be ready
async function waitForCustomizerReady(page: Page): Promise<void> {
  await page.waitForSelector('[data-testid="material-switcher"]', { timeout: 15000 });
  
  // Wait for preloading completion
  await page.waitForFunction(() => {
    const loadingText = document.body.textContent || '';
    return !loadingText.includes('Loading...') && !loadingText.includes('%');
  }, { timeout: 30000 });
}

// Helper: Test frame rotation performance
async function testFrameRotation(
  page: Page,
  targetFrame: number
): Promise<RotationTestResult> {
  const frameSlider = page.locator('input[type="range"]');
  
  // Capture before state
  const beforeScreenshot = await page.locator('[data-testid="material-switcher"]')
    .screenshot({ type: 'png' });
  
  const startTime = performance.now();
  
  // Change to target frame
  await frameSlider.fill(targetFrame.toString());
  await page.waitForTimeout(100); // Allow transition
  
  const endTime = performance.now();
  const switchTime = endTime - startTime;
  
  // Capture after state
  const afterScreenshot = await page.locator('[data-testid="material-switcher"]')
    .screenshot({ type: 'png' });
  
  // Check for visual change (frames should look different unless at same position)
  const visualChange = !beforeScreenshot.equals(afterScreenshot);
  const visuallySmooth = switchTime < ROTATION_CRITERIA.MAX_FRAME_SWITCH_TIME;
  
  return {
    frameNumber: targetFrame,
    switchTime,
    visuallySmooth,
    success: visuallySmooth && visualChange
  };
}

test.describe('Rotation Visual Validation - Desktop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-performance');
    await waitForCustomizerReady(page);
  });

  test('360° rotation maintains visual smoothness', async ({ page }) => {
    console.log('🔄 Testing 360° rotation smoothness...');
    
    const results: RotationTestResult[] = [];
    const testFrames = [0, 5, 10, 15, 20, 25, 30, 35]; // Every 5th frame for comprehensive test
    
    for (const frame of testFrames) {
      console.log(`📐 Testing rotation to frame ${frame}...`);
      
      const result = await testFrameRotation(page, frame);
      results.push(result);
      
      console.log(`   Frame ${frame}: ${result.switchTime.toFixed(1)}ms ${result.success ? '✅' : '❌'}`);
      
      // Small delay between frame changes
      await page.waitForTimeout(100);
    }
    
    // Analyze rotation smoothness
    const smoothTransitions = results.filter(r => r.visuallySmooth).length;
    const smoothnessRate = smoothTransitions / results.length;
    const averageTime = results.reduce((sum, r) => sum + r.switchTime, 0) / results.length;
    
    console.log(`📊 Rotation Analysis:`);
    console.log(`   Average Switch Time: ${averageTime.toFixed(1)}ms`);
    console.log(`   Smooth Transitions: ${smoothTransitions}/${results.length} (${Math.round(smoothnessRate * 100)}%)`);
    
    // SUCCESS CRITERIA VALIDATION
    const meetsSmoothnessTarget = smoothnessRate >= ROTATION_CRITERIA.ROTATION_SMOOTHNESS_THRESHOLD;
    const meetsPerformanceTarget = averageTime < ROTATION_CRITERIA.MAX_FRAME_SWITCH_TIME;
    
    console.log(`🎯 Smoothness Target: ${meetsSmoothnessTarget ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🎯 Performance Target: ${meetsPerformanceTarget ? '✅ PASS' : '❌ FAIL'}`);
    
    expect(meetsSmoothnessTarget, 
      `Smoothness rate ${Math.round(smoothnessRate * 100)}% below required ${Math.round(ROTATION_CRITERIA.ROTATION_SMOOTHNESS_THRESHOLD * 100)}%`
    ).toBe(true);
    
    expect(meetsPerformanceTarget,
      `Average rotation time ${averageTime.toFixed(1)}ms exceeds ${ROTATION_CRITERIA.MAX_FRAME_SWITCH_TIME}ms target`
    ).toBe(true);
  });

  test('Frame-by-frame visual consistency across materials', async ({ page }) => {
    console.log('🎭 Testing visual consistency across materials...');
    
    const materials = ['Platinum', '18K Yellow Gold'];
    const keyFrames = [0, 9, 18, 27]; // 90° increments
    
    for (const material of materials) {
      console.log(`🔍 Testing ${material} frame consistency...`);
      
      // Select material
      await page.locator(`button:has-text("${material}")`).click();
      await page.waitForTimeout(300);
      
      for (const frame of keyFrames) {
        await page.locator('input[type="range"]').fill(frame.toString());
        await page.waitForTimeout(200);
        
        // Visual regression test for this specific material + frame combination
        await expect(page.locator('[data-testid="material-switcher"]'))
          .toHaveScreenshot(`rotation-${material.toLowerCase().replace(/\s+/g, '-')}-frame-${frame}.png`);
      }
    }
  });

  test('Drag-based rotation visual validation', async ({ page }) => {
    console.log('🖱️ Testing drag rotation visual quality...');
    
    const viewer = page.locator('[data-testid="material-switcher"] [role="img"]');
    
    // Capture initial state
    const initialScreenshot = await viewer.screenshot({ type: 'png' });
    
    // Perform drag rotation
    const box = await viewer.boundingBox();
    if (box) {
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      
      // Drag from left to right (simulate rotation)
      await page.mouse.move(centerX - 100, centerY);
      await page.mouse.down();
      await page.mouse.move(centerX + 100, centerY, { steps: 10 });
      await page.mouse.up();
      
      await page.waitForTimeout(300);
      
      // Capture final state
      const finalScreenshot = await viewer.screenshot({ type: 'png' });
      
      // Visual change should have occurred
      const visualChangeDetected = !initialScreenshot.equals(finalScreenshot);
      
      console.log(`🔄 Drag rotation visual change: ${visualChangeDetected ? '✅ Detected' : '❌ No change'}`);
      
      expect(visualChangeDetected).toBe(true);
      
      // Take final screenshot for visual regression
      await expect(viewer).toHaveScreenshot('drag-rotation-result.png');
    }
  });
});

test.describe('Mobile Rotation Visual Validation', () => {
  test.use({ isMobile: true });
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-performance');
    await waitForCustomizerReady(page);
  });

  test('Mobile rotation maintains visual quality', async ({ page }) => {
    console.log('📱 Testing mobile rotation quality...');
    
    const results: RotationTestResult[] = [];
    const mobileTestFrames = [0, 9, 18, 27]; // Fewer frames for mobile efficiency
    
    for (const frame of mobileTestFrames) {
      console.log(`📱 Mobile rotation to frame ${frame}...`);
      
      const result = await testFrameRotation(page, frame);
      results.push(result);
      
      // Mobile gets more lenient timing
      const mobileSuccess = result.switchTime < (ROTATION_CRITERIA.MAX_FRAME_SWITCH_TIME * ROTATION_CRITERIA.MOBILE_PERFORMANCE_FACTOR);
      
      console.log(`   Mobile Frame ${frame}: ${result.switchTime.toFixed(1)}ms ${mobileSuccess ? '✅' : '❌'}`);
      
      await page.waitForTimeout(200); // Longer delay for mobile
    }
    
    const averageMobileTime = results.reduce((sum, r) => sum + r.switchTime, 0) / results.length;
    const mobileTarget = ROTATION_CRITERIA.MAX_FRAME_SWITCH_TIME * ROTATION_CRITERIA.MOBILE_PERFORMANCE_FACTOR;
    
    console.log(`📊 Mobile Rotation Performance: ${averageMobileTime.toFixed(1)}ms average`);
    
    expect(averageMobileTime).toBeLessThan(mobileTarget);
  });

  test('Touch swipe rotation works smoothly', async ({ page }) => {
    console.log('👆 Testing touch swipe rotation...');
    
    const viewer = page.locator('[data-testid="material-switcher"] [role="img"]');
    
    // Initial state
    const initialScreenshot = await viewer.screenshot({ type: 'png' });
    
    // Touch swipe simulation
    const box = await viewer.boundingBox();
    if (box) {
      const startX = box.x + box.width * 0.2;
      const endX = box.x + box.width * 0.8;
      const centerY = box.y + box.height * 0.5;
      
      // Perform swipe gesture
      await page.touchscreen.tap(startX, centerY);
      await page.mouse.move(startX, centerY);
      await page.mouse.down();
      await page.mouse.move(endX, centerY, { steps: 8 });
      await page.mouse.up();
      
      await page.waitForTimeout(400); // Allow for touch response
      
      // Check for visual change
      const finalScreenshot = await viewer.screenshot({ type: 'png' });
      const touchWorked = !initialScreenshot.equals(finalScreenshot);
      
      console.log(`👆 Touch swipe result: ${touchWorked ? '✅ Working' : '❌ No response'}`);
      
      expect(touchWorked).toBe(true);
      
      // Mobile swipe visual regression test
      await expect(viewer).toHaveScreenshot('mobile-swipe-rotation.png');
    }
  });
});

test.describe('Advanced Rotation Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-performance');
    await waitForCustomizerReady(page);
  });

  test('Boundary frame transitions (0↔35) work correctly', async ({ page }) => {
    console.log('🔄 Testing boundary frame transitions...');
    
    const frameSlider = page.locator('input[type="range"]');
    const viewer = page.locator('[data-testid="material-switcher"] [role="img"]');
    
    // Test 0 → 35 transition (wrap-around)
    await frameSlider.fill('0');
    await page.waitForTimeout(200);
    const frame0Screenshot = await viewer.screenshot({ type: 'png' });
    
    await frameSlider.fill('35');
    await page.waitForTimeout(200);
    const frame35Screenshot = await viewer.screenshot({ type: 'png' });
    
    // Test 35 → 0 transition
    await frameSlider.fill('0');
    await page.waitForTimeout(200);
    const backToFrame0Screenshot = await viewer.screenshot({ type: 'png' });
    
    // Frame 0 should look the same at start and end
    const consistentBoundary = frame0Screenshot.equals(backToFrame0Screenshot);
    
    console.log(`🔄 Boundary consistency: ${consistentBoundary ? '✅ Consistent' : '❌ Inconsistent'}`);
    
    expect(consistentBoundary).toBe(true);
    
    // Visual regression tests for boundary frames
    await expect(viewer).toHaveScreenshot('boundary-frame-0.png');
    
    await frameSlider.fill('35');
    await page.waitForTimeout(200);
    await expect(viewer).toHaveScreenshot('boundary-frame-35.png');
  });

  test('Rapid rotation changes maintain stability', async ({ page }) => {
    console.log('⚡ Testing rapid rotation stability...');
    
    const frameSlider = page.locator('input[type="range"]');
    const viewer = page.locator('[data-testid="material-switcher"] [role="img"]');
    
    // Rapid frame changes
    const rapidFrames = [0, 18, 9, 27, 5, 30, 15];
    
    for (let i = 0; i < rapidFrames.length; i++) {
      const frame = rapidFrames[i];
      
      await frameSlider.fill(frame.toString());
      await page.waitForTimeout(50); // Very short delay for rapid testing
      
      console.log(`⚡ Rapid change ${i + 1}: Frame ${frame}`);
    }
    
    // Final stability check - should still be responsive
    await page.waitForTimeout(300);
    const finalFrame = 10;
    await frameSlider.fill(finalFrame.toString());
    await page.waitForTimeout(200);
    
    // Should still work correctly after rapid changes
    await expect(viewer).toHaveScreenshot('rapid-rotation-stability.png');
    
    console.log('⚡ Rapid rotation stability test completed');
  });
});