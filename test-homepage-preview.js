const puppeteer = require('puppeteer');

async function testHomepagePreview() {
  console.log('🧪 Testing Homepage CustomizerPreviewSection');
  console.log('='.repeat(60));
  
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    
    // Test homepage
    console.log('📍 Testing homepage...');
    await page.goto('http://localhost:3000/', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Scroll to find CustomizerPreviewSection
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check for frame indicator in the preview section
    const previewAnalysis = await page.evaluate(() => {
      // Look for frame indicators anywhere on the page
      const frameIndicators = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.match(/\d+\s*\/\s*\d+/) && 
        !el.textContent.includes('4.9/5') // Exclude review text
      );
      
      // Look for ProductCustomizer elements
      const customizers = document.querySelectorAll('[class*="ProductCustomizer"], [data-testid*="product-customizer"]');
      
      // Look for any 3D viewers or image sequences
      const imageViewers = document.querySelectorAll('[role="img"][aria-label*="360"], [aria-label*="frame"]');
      
      return {
        frameIndicators: frameIndicators.map(el => ({
          text: el.textContent.trim(),
          className: el.className,
          tagName: el.tagName
        })),
        customizerCount: customizers.length,
        imageViewerCount: imageViewers.length,
        hasVisibleFrameIndicator: frameIndicators.length > 0
      };
    });
    
    console.log('📊 Homepage Preview Results:');
    console.log(`   - Customizer Components: ${previewAnalysis.customizerCount}`);
    console.log(`   - Image Viewers: ${previewAnalysis.imageViewerCount}`);
    console.log(`   - Frame Indicators Found: ${previewAnalysis.frameIndicators.length}`);
    
    if (previewAnalysis.frameIndicators.length > 0) {
      console.log(`   - Frame Indicators: ❌ Still visible`);
      previewAnalysis.frameIndicators.forEach((indicator, i) => {
        console.log(`     ${i + 1}. "${indicator.text}" in ${indicator.tagName}.${indicator.className}`);
      });
    } else {
      console.log(`   - Frame Indicators: ✅ Hidden`);
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'homepage-preview-test.png',
      fullPage: false,
      clip: {
        x: 0,
        y: 1500,
        width: 1400,
        height: 800
      }
    });
    console.log('📸 Screenshot saved: homepage-preview-test.png');
    
    const success = !previewAnalysis.hasVisibleFrameIndicator;
    
    console.log('\n' + '='.repeat(60));
    console.log(success ? '✅ SUCCESS: Frame indicators hidden!' : '⚠️ Frame indicators still visible');
    
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
testHomepagePreview()
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });