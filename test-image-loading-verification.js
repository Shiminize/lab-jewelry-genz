/**
 * Test Image Loading Verification - Phase 4 Asset Path Fix
 * Validates that the correct asset paths are being used and images are loading
 */

const puppeteer = require('puppeteer');

async function testImageLoadingVerification() {
  const browser = await puppeteer.launch({ 
    headless: false, // Show browser for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Track network requests
    const requests = [];
    const imageRequests = [];
    const errorRequests = [];
    
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method()
      });
      
      // Track image requests specifically
      if (request.url().includes('/images/products/3d-sequences/')) {
        imageRequests.push({
          url: request.url(),
          timestamp: Date.now()
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/images/products/3d-sequences/')) {
        if (response.status() !== 200) {
          errorRequests.push({
            url: response.url(),
            status: response.status(),
            timestamp: Date.now()
          });
        }
      }
    });
    
    // Enable console logging
    page.on('console', msg => {
      console.log(`🖥️ BROWSER: ${msg.text()}`);
    });
    
    console.log('🎯 Starting image loading verification test...');
    
    // Navigate to customizer
    console.log('📍 Navigating to /customizer...');
    await page.goto('http://localhost:3000/customizer', { waitUntil: 'networkidle0' });
    
    // Wait a bit for the ProductCustomizer to load
    console.log('⏳ Waiting for ProductCustomizer to initialize...');
    await page.waitForTimeout(5000);
    
    // Look for any image sequence loading
    console.log('🔍 Checking for image sequence loading...');
    await page.waitForTimeout(3000);
    
    // Results analysis
    console.log('\n📊 REQUEST ANALYSIS:');
    console.log(`Total requests: ${requests.length}`);
    console.log(`Image sequence requests: ${imageRequests.length}`);
    console.log(`Error requests: ${errorRequests.length}`);
    
    if (imageRequests.length > 0) {
      console.log('\n🖼️ IMAGE REQUESTS:');
      imageRequests.forEach((req, i) => {
        console.log(`${i + 1}. ${req.url}`);
      });
      
      // Check for legacy frame naming
      const legacyRequests = imageRequests.filter(req => 
        req.url.includes('frame_') || req.url.includes('doji_diamond_ring')
      );
      
      if (legacyRequests.length > 0) {
        console.log('\n❌ LEGACY REQUESTS DETECTED:');
        legacyRequests.forEach((req, i) => {
          console.log(`${i + 1}. ${req.url}`);
        });
      } else {
        console.log('\n✅ No legacy frame naming detected');
      }
    } else {
      console.log('\n⚠️ No image sequence requests detected - component may not be loading');
    }
    
    if (errorRequests.length > 0) {
      console.log('\n❌ ERROR REQUESTS:');
      errorRequests.forEach((req, i) => {
        console.log(`${i + 1}. ${req.status} - ${req.url}`);
      });
    }
    
    // Check if images are visible in the DOM
    console.log('\n👁️ Checking for visible images...');
    const visibleImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images
        .filter(img => img.src.includes('/images/products/3d-sequences/'))
        .map(img => ({
          src: img.src,
          visible: img.offsetWidth > 0 && img.offsetHeight > 0,
          loaded: img.complete,
          error: img.naturalWidth === 0
        }));
    });
    
    if (visibleImages.length > 0) {
      console.log('Found 3D sequence images in DOM:');
      visibleImages.forEach((img, i) => {
        const status = img.error ? '❌ ERROR' : img.loaded ? '✅ LOADED' : '⏳ LOADING';
        const visible = img.visible ? '👁️ VISIBLE' : '👻 HIDDEN';
        console.log(`${i + 1}. ${status} ${visible} - ${img.src}`);
      });
    } else {
      console.log('No 3D sequence images found in DOM');
    }
    
    // Take a screenshot for visual verification
    await page.screenshot({ path: 'customizer-image-verification.png', fullPage: true });
    console.log('📸 Screenshot saved as customizer-image-verification.png');
    
    console.log('\n✅ Image loading verification complete');
    
    // Keep browser open for manual inspection
    console.log('\n🔍 Browser will remain open for manual inspection...');
    await page.waitForTimeout(30000); // 30 seconds
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testImageLoadingVerification().catch(console.error);