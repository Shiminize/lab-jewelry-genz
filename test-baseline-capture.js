const { test, expect } = require('@playwright/test');

test('Phase 0: Capture Visual Baseline Screenshots', async ({ page }) => {
  console.log('📸 Phase 0: Capturing comprehensive visual baseline...');
  
  // Homepage baseline
  console.log('🏠 Capturing homepage baseline...');
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ 
    path: 'baseline-homepage.png', 
    fullPage: true 
  });
  
  // Catalog page baseline
  console.log('🛍️ Capturing catalog baseline...');
  await page.goto('/catalog');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ 
    path: 'baseline-catalog.png', 
    fullPage: true 
  });
  
  // Customizer page baseline
  console.log('🎨 Capturing customizer baseline...');
  await page.goto('/customizer');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Allow dynamic import to complete
  await page.screenshot({ 
    path: 'baseline-customizer.png', 
    fullPage: true 
  });
  
  // Admin page baseline (critical files)
  console.log('⚙️ Capturing admin baseline...');
  await page.goto('/admin');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ 
    path: 'baseline-admin.png', 
    fullPage: true 
  });
  
  // Check console for errors during baseline capture
  const logs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      logs.push(msg.text());
    }
  });
  
  if (logs.length === 0) {
    console.log('✅ Clean baseline capture - no console errors');
  } else {
    console.log('⚠️ Console errors detected during baseline:', logs.length);
    logs.forEach(log => console.log('  -', log));
  }
  
  console.log('🎉 Phase 0: Visual baseline capture completed');
  console.log('📁 Screenshots saved: baseline-homepage.png, baseline-catalog.png, baseline-customizer.png, baseline-admin.png');
});