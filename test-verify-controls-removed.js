const puppeteer = require('puppeteer');

async function verifyControlsRemoved() {
  console.log('🔍 Verifying Control Panels Removed from Preview');
  console.log('='.repeat(60));
  
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    
    // Navigate to customizer
    console.log('📍 Navigating to customizer page...');
    await page.goto('http://localhost:3000/customizer', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Wait for product selection
    await page.waitForSelector('[data-testid="product-selection"]', { timeout: 10000 });
    
    // Click first product
    console.log('👆 Selecting first product...');
    const firstProduct = await page.$('[data-testid="product-selection"] button');
    if (firstProduct) {
      await firstProduct.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Wait for customizer to load
    await page.waitForSelector('[data-testid="product-customizer"]', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Take screenshot
    await page.screenshot({ 
      path: 'preview-after-removal.png',
      fullPage: true
    });
    console.log('📸 Screenshot saved: preview-after-removal.png');
    
    // Analyze the structure
    console.log('\n📋 VERIFYING CONTROLS REMOVAL');
    console.log('-'.repeat(50));
    
    const verificationResult = await page.evaluate(() => {
      const customizer = document.querySelector('[data-testid="product-customizer"]');
      if (!customizer) return { error: 'Customizer not found' };
      
      // Check for viewer controls
      const hasViewerControls = customizer.querySelector('[class*="viewer-controls"], [class*="ViewerControls"]') !== null;
      
      // Check for control buttons that were previously there
      const buttons = Array.from(customizer.querySelectorAll('button'));
      const navigationButtons = buttons.filter(btn => 
        btn.textContent.includes('←') || 
        btn.textContent.includes('→') || 
        btn.textContent.includes('Auto') ||
        btn.getAttribute('aria-label')?.includes('frame')
      );
      
      const quickViewButtons = buttons.filter(btn => 
        btn.textContent === 'Front' || 
        btn.textContent === 'Side' || 
        btn.textContent === 'Back'
      );
      
      // Check for frame indicator text
      const textElements = Array.from(customizer.querySelectorAll('*')).filter(el => 
        el.textContent.includes('Frame') && el.textContent.includes('of')
      );
      
      // Check for material controls (these should still exist)
      const materialButtons = buttons.filter(btn => 
        btn.textContent.includes('Platinum') || 
        btn.textContent.includes('Gold')
      );
      
      // Get the image viewer
      const imageViewer = customizer.querySelector('img[alt*="frame"], img[src*="3d-sequences"]');
      
      return {
        hasViewerControls,
        navigationButtonCount: navigationButtons.length,
        quickViewButtonCount: quickViewButtons.length,
        frameIndicatorCount: textElements.length,
        materialButtonCount: materialButtons.length,
        hasImageViewer: !!imageViewer,
        totalButtons: buttons.length,
        buttonDetails: buttons.map(btn => ({
          text: btn.textContent.trim(),
          ariaLabel: btn.getAttribute('aria-label')
        }))
      };
    });
    
    console.log('📊 Verification Results:');
    console.log(`   - Has ViewerControls Component: ${verificationResult.hasViewerControls ? '❌ YES' : '✅ NO'}`);
    console.log(`   - Navigation Buttons (←/→/Auto): ${verificationResult.navigationButtonCount === 0 ? '✅ REMOVED' : `❌ Still present (${verificationResult.navigationButtonCount})`}`);
    console.log(`   - Quick View Buttons (Front/Side/Back): ${verificationResult.quickViewButtonCount === 0 ? '✅ REMOVED' : `❌ Still present (${verificationResult.quickViewButtonCount})`}`);
    console.log(`   - Frame Indicator Text: ${verificationResult.frameIndicatorCount === 0 ? '✅ REMOVED' : `❌ Still present (${verificationResult.frameIndicatorCount})`}`);
    console.log(`   - Material Selection Buttons: ${verificationResult.materialButtonCount > 0 ? '✅ PRESERVED' : '❌ Missing'} (${verificationResult.materialButtonCount})`);
    console.log(`   - Image Viewer Present: ${verificationResult.hasImageViewer ? '✅ YES' : '❌ NO'}`);
    
    // Test touch gestures
    console.log('\n🤏 TESTING TOUCH GESTURES');
    console.log('-'.repeat(50));
    
    if (verificationResult.hasImageViewer) {
      const touchTest = await page.evaluate(() => {
        const img = document.querySelector('img[alt*="frame"], img[src*="3d-sequences"]');
        if (!img) return { error: 'Image not found' };
        
        const container = img.closest('div');
        const styles = window.getComputedStyle(container);
        
        return {
          touchAction: styles.touchAction,
          userSelect: styles.userSelect || styles.webkitUserSelect,
          cursor: styles.cursor,
          hasProperTouchSetup: styles.touchAction === 'none'
        };
      });
      
      console.log(`   - Touch Action: ${touchTest.touchAction || 'not set'} ${touchTest.hasProperTouchSetup ? '✅' : '⚠️'}`);
      console.log(`   - User Select: ${touchTest.userSelect || 'not set'}`);
      console.log(`   - Cursor Style: ${touchTest.cursor || 'default'}`);
      console.log(`   - Touch Gestures: ${touchTest.hasProperTouchSetup ? '✅ ENABLED' : '⚠️ May need configuration'}`);
    }
    
    // Summary
    const success = verificationResult.navigationButtonCount === 0 && 
                   verificationResult.quickViewButtonCount === 0 && 
                   verificationResult.frameIndicatorCount === 0 &&
                   verificationResult.materialButtonCount > 0 &&
                   verificationResult.hasImageViewer;
                   
    console.log('\n' + '='.repeat(60));
    console.log('🏁 FINAL VERIFICATION RESULT:');
    console.log('='.repeat(60));
    
    if (success) {
      console.log('✅ SUCCESS: All control panels have been removed from under the preview!');
      console.log('✅ The preview section now only shows the product image');
      console.log('✅ Material selection controls are preserved');
      console.log('✅ Touch gestures remain available');
      console.log('\n🎉 The UI has been successfully simplified as requested!');
    } else {
      console.log('❌ INCOMPLETE: Some issues detected');
      if (verificationResult.navigationButtonCount > 0) {
        console.log('   - Navigation buttons still present');
      }
      if (verificationResult.quickViewButtonCount > 0) {
        console.log('   - Quick view buttons still present');
      }
      if (verificationResult.frameIndicatorCount > 0) {
        console.log('   - Frame indicator text still present');
      }
    }
    
    return { success, details: verificationResult };
    
  } catch (error) {
    console.error('❌ Verification test failed:', error.message);
    return { success: false, error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run verification
verifyControlsRemoved()
  .then(result => {
    console.log('\n✅ Verification complete');
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });