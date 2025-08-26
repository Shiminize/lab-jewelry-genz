const puppeteer = require('puppeteer');

async function testCleanPreviewPhase2() {
  console.log('🧪 Testing Clean Preview - Phase 2');
  console.log('='.repeat(60));
  
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    
    // Test main customizer page
    console.log('📍 Testing main customizer page...');
    await page.goto('http://localhost:3000/customizer', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    await page.waitForSelector('[data-testid="product-customizer"]', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if frame indicator is hidden by default
    const customizerAnalysis = await page.evaluate(() => {
      const customizer = document.querySelector('[data-testid="product-customizer"]');
      if (!customizer) return { error: 'Customizer not found' };
      
      // Look for frame indicator
      const frameIndicator = Array.from(customizer.querySelectorAll('*')).find(el => 
        el.textContent && el.textContent.match(/\d+\s*\/\s*\d+/)
      );
      
      // Check for controls
      const buttons = Array.from(customizer.querySelectorAll('button'));
      const materialButtons = buttons.filter(btn => 
        btn.textContent.includes('Gold') || btn.textContent.includes('Platinum')
      );
      
      return {
        hasFrameIndicator: !!frameIndicator,
        frameIndicatorText: frameIndicator?.textContent || null,
        materialButtonCount: materialButtons.length,
        totalButtons: buttons.length
      };
    });
    
    console.log('📊 Main Customizer Results:');
    console.log(`   - Frame Indicator: ${customizerAnalysis.hasFrameIndicator ? `❌ Still visible: "${customizerAnalysis.frameIndicatorText}"` : '✅ Hidden'}`);
    console.log(`   - Material Buttons: ${customizerAnalysis.materialButtonCount}`);
    console.log(`   - Total Buttons: ${customizerAnalysis.totalButtons}`);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'customizer-phase2-test.png',
      fullPage: true
    });
    console.log('📸 Screenshot saved: customizer-phase2-test.png');
    
    // Test CustomizerPreviewSection (demo page)
    console.log('\n📍 Testing CustomizerPreviewSection...');
    await page.goto('http://localhost:3000/customizer-preview-demo', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const previewAnalysis = await page.evaluate(() => {
      // Find ProductCustomizer in preview section
      const productCustomizer = document.querySelector('[class*="ProductCustomizer"], [class*="customizer"]');
      
      if (!productCustomizer) {
        // Look for any element that might contain the preview
        const possibleContainers = document.querySelectorAll('div');
        for (let container of possibleContainers) {
          if (container.textContent && container.textContent.match(/\d+\s*\/\s*\d+/)) {
            return {
              foundContainer: true,
              hasFrameIndicator: true,
              frameIndicatorText: container.textContent.match(/\d+\s*\/\s*\d+/)[0]
            };
          }
        }
        return { error: 'No customizer container found' };
      }
      
      // Check for frame indicator in preview section
      const frameIndicator = Array.from(productCustomizer.querySelectorAll('*')).find(el => 
        el.textContent && el.textContent.match(/\d+\s*\/\s*\d+/)
      );
      
      return {
        foundContainer: true,
        hasFrameIndicator: !!frameIndicator,
        frameIndicatorText: frameIndicator?.textContent || null
      };
    });
    
    console.log('📊 Preview Section Results:');
    console.log(`   - Container Found: ${previewAnalysis.foundContainer ? '✅' : '❌'}`);
    console.log(`   - Frame Indicator: ${previewAnalysis.hasFrameIndicator ? `❌ Still visible: "${previewAnalysis.frameIndicatorText}"` : '✅ Hidden'}`);
    
    // Take screenshot of preview demo
    await page.screenshot({ 
      path: 'preview-demo-phase2-test.png',
      fullPage: false,
      clip: {
        x: 0,
        y: 400,
        width: 1400,
        height: 600
      }
    });
    console.log('📸 Preview demo screenshot saved: preview-demo-phase2-test.png');
    
    const success = !customizerAnalysis.hasFrameIndicator && !previewAnalysis.hasFrameIndicator;
    
    console.log('\n' + '='.repeat(60));
    console.log(success ? '✅ PHASE 2 SUCCESS: Frame indicators hidden!' : '⚠️ Phase 2 needs more work');
    
    return { success };
    
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
testCleanPreviewPhase2()
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });