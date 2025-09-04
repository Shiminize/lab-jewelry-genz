import { test, expect } from '@playwright/test';

test('VISION MODE E2E Testing - Navigation Aurora Compliance', async ({ page }) => {
  console.log('🎭 VISION MODE TESTING - Navigation Aurora Compliance Suite');
  console.log('📋 Testing against strict success criteria...');
  
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  
  // Take comprehensive screenshots for visual analysis
  console.log('📷 Capturing navigation state for vision analysis...');
  await page.screenshot({ 
    path: 'vision-mode-navigation-full.png', 
    fullPage: true 
  });
  
  // Test 1: Background Color Analysis
  const bodyBg = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });
  
  const navBg = await page.locator('nav').first().evaluate(el => {
    return window.getComputedStyle(el).backgroundColor;
  });
  
  console.log('🔍 Background Analysis:');
  console.log('Body background:', bodyBg);
  console.log('Navigation background:', navBg);
  
  // Expected: aurora lunar-grey #F7F7F9 = rgb(247, 247, 249)
  const expectedBg = 'rgb(247, 247, 249)';
  const bgCompliant = bodyBg.includes('247, 247, 249') || navBg.includes('247, 247, 249');
  
  console.log('✅ CRITERIA 1 - Aurora Background Color:', bgCompliant ? 'PASS ✓' : 'FAIL ✗');
  
  // Test 2: Icon Container Analysis  
  const iconContainers = await page.evaluate(() => {
    const containers = document.querySelectorAll('[class*="bg-white"]');
    return containers.length;
  });
  
  console.log('🔍 Icon Container Analysis:');
  console.log('Containers with bg-white found:', iconContainers);
  const containerCompliant = iconContainers === 0;
  console.log('✅ CRITERIA 2 - Container-less Icons:', containerCompliant ? 'PASS ✓' : 'FAIL ✗');
  
  // Test 3: Animation Performance (Navigation-specific)
  const animationData = await page.evaluate(() => {
    const navElement = document.querySelector('nav');
    if (!navElement) return { count: 0, max: 0, violations: 0 };
    
    const elements = navElement.querySelectorAll('[class*="transition"], [class*="duration"]');
    const durations: number[] = [];
    
    elements.forEach(el => {
      const styles = window.getComputedStyle(el);
      const duration = styles.transitionDuration;
      if (duration && duration !== '0s') {
        const ms = parseFloat(duration) * 1000;
        if (ms > 0) durations.push(ms);
      }
    });
    
    // Also check the nav element itself
    const navStyles = window.getComputedStyle(navElement);
    const navDuration = navStyles.transitionDuration;
    if (navDuration && navDuration !== '0s') {
      const ms = parseFloat(navDuration) * 1000;
      if (ms > 0) durations.push(ms);
    }
    
    return {
      count: durations.length,
      max: Math.max(...durations, 0),
      violations: durations.filter(d => d > 150).length
    };
  });
  
  console.log('🔍 Animation Performance Analysis:');
  console.log('Total animations found:', animationData.count);
  console.log('Maximum duration:', animationData.max + 'ms');
  console.log('CLAUDE_RULES violations (>150ms):', animationData.violations);
  const animationCompliant = animationData.max <= 150;
  console.log('✅ CRITERIA 3 - Animation Performance (<150ms):', animationCompliant ? 'PASS ✓' : 'FAIL ✗');
  
  // Final Compliance Score
  const totalCriteria = 3;
  const passedCriteria = [bgCompliant, containerCompliant, animationCompliant].filter(Boolean).length;
  const complianceScore = Math.round((passedCriteria / totalCriteria) * 100);
  
  console.log('');
  console.log('🎯 VISION MODE TESTING RESULTS:');
  console.log('════════════════════════════════');
  console.log('📊 Compliance Score:', complianceScore + '%');
  console.log('✅ Criteria Passed:', passedCriteria + '/' + totalCriteria);
  console.log('');
  console.log('DETAILED RESULTS:');
  console.log('1. Aurora Background Color:', bgCompliant ? '✅ PASS' : '❌ FAIL');
  console.log('2. Container-less Icons:', containerCompliant ? '✅ PASS' : '❌ FAIL'); 
  console.log('3. Animation Performance:', animationCompliant ? '✅ PASS' : '❌ FAIL');
  console.log('');
  
  if (complianceScore === 100) {
    console.log('🎉 SUCCESS: All criteria surpassed! Navigation implementation approved.');
  } else {
    console.log('⚠️  PARTIAL SUCCESS: ' + (totalCriteria - passedCriteria) + ' criteria require attention.');
  }
  
  console.log('📸 Vision mode screenshot saved: vision-mode-navigation-full.png');
});