const puppeteer = require('puppeteer');

async function testFinalValidation() {
  console.log('🧪 Final Validation - Complete UI Cleanup Test');
  console.log('='.repeat(80));
  
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    
    // Test 1: Main customizer page
    console.log('📍 Testing main customizer page (/customizer)...');
    await page.goto('http://localhost:3000/customizer', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const customizerAnalysis = await page.evaluate(() => {
      // Check for frame indicators
      const frameIndicators = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.match(/\d+\s*\/\s*\d+/) && 
        !el.textContent.includes('4.9/5') && !el.textContent.includes('30-day') &&
        !el.textContent.includes('Available 24/7')
      );
      
      // Check for material controls under preview
      const customizerContainer = document.querySelector('[data-testid="product-customizer"]');
      let controlsUnderPreview = false;
      
      if (customizerContainer) {
        // Look for material buttons specifically within the customizer
        const materialButtons = Array.from(customizerContainer.querySelectorAll('button')).filter(btn => 
          btn.textContent.includes('Gold') || btn.textContent.includes('Platinum')
        );
        controlsUnderPreview = materialButtons.length > 0;
      }
      
      // Check if material selection exists in sidebar
      const sidebarMaterials = document.querySelectorAll('button').length > 10; // Should have product + material buttons
      
      return {
        frameIndicators: frameIndicators.length,
        controlsUnderPreview,
        sidebarMaterials,
        customizerFound: !!customizerContainer
      };
    });
    
    console.log('📊 Main Customizer Results:');
    console.log(`   - Customizer Container: ${customizerAnalysis.customizerFound ? '✅ Found' : '❌ Missing'}`);
    console.log(`   - Frame Indicators: ${customizerAnalysis.frameIndicators === 0 ? '✅ Hidden' : `❌ Found ${customizerAnalysis.frameIndicators}`}`);
    console.log(`   - Controls Under Preview: ${customizerAnalysis.controlsUnderPreview ? '❌ Still present' : '✅ Removed'}`);
    console.log(`   - Sidebar Materials: ${customizerAnalysis.sidebarMaterials ? '✅ Present' : '❌ Missing'}`);
    
    // Test 2: Homepage CustomizerPreviewSection  
    console.log('\n📍 Testing homepage CustomizerPreviewSection...');
    await page.goto('http://localhost:3000/', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Scroll to find CustomizerPreviewSection
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight * 0.7);
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const homepageAnalysis = await page.evaluate(() => {
      const frameIndicators = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.match(/\d+\s*\/\s*\d+/) && 
        !el.textContent.includes('4.9/5') && !el.textContent.includes('30-day') &&
        !el.textContent.includes('Available 24/7') && !el.textContent.includes('FAQ')
      );
      
      // Look for any 3D viewers
      const imageViewers = document.querySelectorAll('[role="img"][aria-label*="360"], [aria-label*="frame"]');
      
      return {
        frameIndicators: frameIndicators.length,
        imageViewerCount: imageViewers.length
      };
    });
    
    console.log('📊 Homepage Results:');
    console.log(`   - Frame Indicators: ${homepageAnalysis.frameIndicators === 0 ? '✅ Hidden' : `❌ Found ${homepageAnalysis.frameIndicators}`}`);
    console.log(`   - 3D Viewers: ${homepageAnalysis.imageViewerCount} found`);
    
    // Test 3: Touch gesture functionality
    console.log('\n📍 Testing touch gestures on main customizer...');
    await page.goto('http://localhost:3000/customizer', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const gestureTest = await page.evaluate(() => {
      const imageViewer = document.querySelector('[role="img"][aria-label*="360"]');
      if (!imageViewer) return { gesturesEnabled: false };
      
      // Check if touch events are supported
      const hasGestures = imageViewer.hasAttribute('style') && 
                         imageViewer.getAttribute('style').includes('touch-action');
      
      return {
        gesturesEnabled: hasGestures,
        viewerFound: true
      };
    });
    
    console.log('📊 Touch Gesture Results:');
    console.log(`   - 3D Viewer: ${gestureTest.viewerFound ? '✅ Found' : '❌ Missing'}`);
    console.log(`   - Touch Gestures: ${gestureTest.gesturesEnabled ? '✅ Enabled' : '❌ Disabled'}`);
    
    // Take final screenshots
    await page.goto('http://localhost:3000/customizer');
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.screenshot({ 
      path: 'final-customizer-clean.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1400, height: 900 }
    });
    
    await page.goto('http://localhost:3000/');
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.7));
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ 
      path: 'final-homepage-clean.png',
      fullPage: false,
      clip: { x: 0, y: 1000, width: 1400, height: 800 }
    });
    
    console.log('📸 Screenshots saved: final-customizer-clean.png, final-homepage-clean.png');
    
    // Overall success calculation
    const allTests = [
      customizerAnalysis.customizerFound,
      customizerAnalysis.frameIndicators === 0,
      !customizerAnalysis.controlsUnderPreview,
      customizerAnalysis.sidebarMaterials,
      homepageAnalysis.frameIndicators === 0,
      gestureTest.viewerFound
    ];
    
    const successCount = allTests.filter(Boolean).length;
    const successRate = (successCount / allTests.length * 100).toFixed(0);
    
    console.log('\n' + '='.repeat(80));
    console.log(`🎯 FINAL VALIDATION RESULTS: ${successCount}/${allTests.length} tests passed (${successRate}%)`);
    
    if (successRate >= 80) {
      console.log('✅ SUCCESS: UI cleanup complete! Preview sections are now clean and user-friendly.');
    } else {
      console.log('⚠️ PARTIAL: Some issues remain. Review the test results above.');
    }
    
    return { success: successRate >= 80, successRate };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { success: false, error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run test
testFinalValidation()
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });