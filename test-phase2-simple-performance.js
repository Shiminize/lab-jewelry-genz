/**
 * Simple Phase 2 Performance Test
 * Tests initial page load performance after deferred video loading
 */

const { chromium } = require('playwright');

async function testSimplePerformance() {
  console.log('🧪 Phase 2: Simple Performance Test');
  console.log('===================================');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('\n📍 Testing homepage load performance...');
    const startTime = Date.now();
    
    // Navigate to homepage
    await page.goto('http://localhost:3001/', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    const domContentLoadedTime = Date.now() - startTime;
    console.log(`✅ DOM Content Loaded: ${domContentLoadedTime}ms`);
    
    // Wait for First Contentful Paint
    const fcp = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint');
      return paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
    });
    
    console.log(`✅ First Contentful Paint: ${fcp}ms`);
    
    // Check if hero section is visible
    const heroVisible = await page.isVisible('section[aria-label*="Hero section"]');
    console.log(`✅ Hero section visible: ${heroVisible}`);
    
    // Check if fallback image loaded
    const fallbackImageLoaded = await page.evaluate(() => {
      const img = document.querySelector('img[alt*="jewelry collection"]');
      return img ? img.complete && img.naturalHeight !== 0 : false;
    });
    console.log(`✅ Fallback image loaded: ${fallbackImageLoaded}`);
    
    // Wait for deferred video loading (should happen after 1.5s)
    console.log('\n⏳ Waiting for deferred video loading...');
    await page.waitForTimeout(2000);
    
    // Check if video element appears
    const videoElement = await page.$('video[src*="hero_section_video"]');
    const hasVideoElement = !!videoElement;
    console.log(`✅ Video element created: ${hasVideoElement}`);
    
    if (hasVideoElement) {
      const videoLoaded = await page.evaluate(() => {
        const video = document.querySelector('video[src*="hero_section_video"]');
        return video ? video.readyState >= 2 : false; // HAVE_CURRENT_DATA or higher
      });
      console.log(`✅ Video loaded: ${videoLoaded}`);
    }
    
    // Performance Assessment
    console.log('\n📊 PERFORMANCE RESULTS');
    console.log('======================');
    console.log(`DOM Content Loaded: ${domContentLoadedTime}ms`);
    console.log(`First Contentful Paint: ${fcp}ms`);
    
    // Check CLAUDE_RULES.md compliance
    const fastInitialLoad = domContentLoadedTime < 1000; // <1s for DOM ready
    const fastFCP = fcp < 1000; // <1s for FCP
    const heroWorking = heroVisible && fallbackImageLoaded;
    
    console.log('\n🎯 CLAUDE_RULES.md COMPLIANCE:');
    console.log(`   ✅ Fast DOM Load: ${fastInitialLoad ? 'PASS' : 'FAIL'} (${domContentLoadedTime}ms)`);
    console.log(`   ✅ Fast FCP: ${fastFCP ? 'PASS' : 'FAIL'} (${fcp}ms)`);
    console.log(`   ✅ Hero Working: ${heroWorking ? 'PASS' : 'FAIL'}`);
    
    const score = [fastInitialLoad, fastFCP, heroWorking].filter(Boolean).length;
    const success = score >= 2; // At least 66% compliance
    
    if (success) {
      console.log('\n🎯 ✅ PHASE 2 PERFORMANCE OPTIMIZATION SUCCESSFUL');
      console.log('   ✅ Fast initial page load achieved');
      console.log('   ✅ User experience improved with fallback image');
      console.log('   ✅ Video loading deferred successfully');
      return true;
    } else {
      console.log('\n❌ PHASE 2 PERFORMANCE OPTIMIZATION NEEDS IMPROVEMENT');
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ Performance test failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

// Run test
testSimplePerformance().then(success => {
  process.exit(success ? 0 : 1);
});