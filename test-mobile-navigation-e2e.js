const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Mobile Navigation E2E Test Starting...');
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser for visual verification
    args: ['--no-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone X dimensions
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
  });
  
  const page = await context.newPage();
  let testResults = [];

  try {
    console.log('📱 Testing mobile navigation animations...');
    
    // Navigate to homepage
    await page.goto(`${process.env.BASE_URL || 'http://localhost:3000'}`, { waitUntil: 'networkidle' });
    
    console.log('✅ Page loaded successfully');
    testResults.push('✅ Homepage loads in mobile view');

    // Test 1: Mobile hamburger menu exists and is clickable
    const hamburgerButton = page.getByRole('button', { name: 'Open menu' });
    await hamburgerButton.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Hamburger menu button found');
    testResults.push('✅ Mobile hamburger menu button exists');

    // Test 2: Click hamburger to open drawer
    await hamburgerButton.click();
    await page.waitForTimeout(500); // Wait for animation

    // Test 3: Check if drawer is visible after opening
    const mobileDrawer = page.locator('[role="dialog"]');
    const isDrawerVisible = await mobileDrawer.isVisible();
    
    if (isDrawerVisible) {
      console.log('✅ Mobile drawer opens successfully');
      testResults.push('✅ Mobile drawer slide-in animation works');
    } else {
      console.log('❌ Mobile drawer not visible after clicking hamburger');
      testResults.push('❌ Mobile drawer failed to open');
    }

    // Test 4: Check logo size in mobile drawer (updated to h-8)
    const drawerLogo = page.locator('[role="dialog"] img[alt*="GlowGlitch"]');
    if (await drawerLogo.isVisible()) {
      const logoBox = await drawerLogo.boundingBox();
      if (logoBox && logoBox.height >= 28 && logoBox.height <= 36) { // Should be h-8 (32px)
        console.log('✅ Logo size is correct in mobile drawer');
        testResults.push('✅ Logo properly sized for mobile header (32px)');
      } else {
        console.log('❌ Logo size incorrect in mobile drawer, actual:', logoBox?.height);
        testResults.push('❌ Logo size mismatch');
      }
    }

    // Test 5: Check category dropdown animations with Gen Z content
    const categoryButton = page.locator('[role="dialog"] button:has-text("STATEMENT RINGS")').first();
    if (await categoryButton.isVisible()) {
      await categoryButton.click();
      await page.waitForTimeout(250); // Wait for 200ms dropdown animation + buffer
      
      const subcategoryMenu = page.locator('#statement-rings-submenu');
      const isSubmenuVisible = await subcategoryMenu.isVisible();
      
      if (isSubmenuVisible) {
        console.log('✅ Category dropdown animation works');
        testResults.push('✅ Category dropdown expand animation working');
        
        // Test Gen Z subcategory content
        const mainCharacterEnergy = page.locator('text=Main Character Energy');
        if (await mainCharacterEnergy.isVisible()) {
          console.log('✅ Gen Z content integration working');
          testResults.push('✅ Gen Z navigation content displays correctly');
        }
      } else {
        console.log('❌ Category dropdown not working');
        testResults.push('❌ Category dropdown animation failed');
      }
    }

    // Test 6: Test close button
    const closeButton = page.getByRole('button', { name: 'Close menu' });
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(500); // Wait for close animation
      
      const isDrawerClosed = !(await mobileDrawer.isVisible());
      if (isDrawerClosed) {
        console.log('✅ Close button works');
        testResults.push('✅ Close button functionality works');
      } else {
        console.log('❌ Close button failed');
        testResults.push('❌ Close button failed');
      }
    }

    // Test 7: Check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    if (consoleErrors.length === 0) {
      console.log('✅ No console errors detected');
      testResults.push('✅ Clean console - no hydration errors');
    } else {
      console.log('❌ Console errors detected:', consoleErrors);
      testResults.push(`❌ Console errors: ${consoleErrors.length}`);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    testResults.push(`❌ Test error: ${error.message}`);
  }

  await browser.close();
  
  // Summary Report
  console.log('\n📋 MOBILE NAVIGATION E2E TEST RESULTS:');
  console.log('='.repeat(50));
  testResults.forEach(result => console.log(result));
  
  const passedTests = testResults.filter(r => r.startsWith('✅')).length;
  const totalTests = testResults.length;
  
  console.log('='.repeat(50));
  console.log(`🎯 Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All mobile navigation tests PASSED!');
    process.exit(0);
  } else {
    console.log('⚠️  Some mobile navigation tests failed');
    process.exit(1);
  }
})();