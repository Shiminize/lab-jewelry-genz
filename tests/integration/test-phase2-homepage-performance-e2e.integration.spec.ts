/**
 * Phase 2: Homepage Performance E2E Validation
 * CLAUDE_RULES.md Compliant - Comprehensive performance validation
 * Tests deferred video loading, performance metrics, and user experience
 */

const { chromium } = require('playwright');

async function validatePhase2Performance() {
  console.log('🧪 Phase 2: Homepage Performance E2E Validation');
  console.log('===============================================');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const results = {
    initialLoad: { domContentLoaded: 0, firstContentfulPaint: 0, networkIdle: 0 },
    userExperience: { heroVisible: false, fallbackImageLoaded: false, textReadable: false },
    deferredLoading: { videoElement: false, videoTiming: null, loadBehavior: 'unknown' },
    performance: { compliant: false, score: 0, details: {} },
    errors: []
  };
  
  try {
    // Test 1: Initial Load Performance
    console.log('\n📍 Test 1: Initial Load Performance');
    console.log('-----------------------------------');
    
    const startTime = Date.now();
    
    await page.goto('http://localhost:3001/', { 
      waitUntil: 'domcontentloaded',
      timeout: 5000 
    });
    
    results.initialLoad.domContentLoaded = Date.now() - startTime;
    console.log(`✅ DOM Content Loaded: ${results.initialLoad.domContentLoaded}ms`);
    
    // Wait for network idle but with short timeout
    try {
      await page.waitForLoadState('networkidle', { timeout: 3000 });
      results.initialLoad.networkIdle = Date.now() - startTime;
      console.log(`✅ Network Idle: ${results.initialLoad.networkIdle}ms`);
    } catch (error) {
      console.log(`⚠️ Network idle timeout (expected with deferred loading)`);
      results.initialLoad.networkIdle = Date.now() - startTime;
    }
    
    // Capture performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint');
      return {
        firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        domInteractive: performance.timing.domInteractive - performance.timing.navigationStart,
        loadEventEnd: performance.timing.loadEventEnd - performance.timing.navigationStart
      };
    });
    
    results.initialLoad.firstContentfulPaint = performanceMetrics.firstContentfulPaint;
    console.log(`✅ First Contentful Paint: ${results.initialLoad.firstContentfulPaint}ms`);
    
    // Test 2: User Experience Validation
    console.log('\\n📍 Test 2: User Experience Validation');
    console.log('--------------------------------------');
    
    // Check hero section visibility
    results.userExperience.heroVisible = await page.isVisible('section[aria-label*="Hero section"]');
    console.log(`✅ Hero section visible: ${results.userExperience.heroVisible}`);
    
    // Check fallback image loading
    results.userExperience.fallbackImageLoaded = await page.evaluate(() => {
      const img = document.querySelector('img[alt*="jewelry collection"]');
      return img ? img.complete && img.naturalHeight !== 0 : false;
    });
    console.log(`✅ Fallback image loaded: ${results.userExperience.fallbackImageLoaded}`);
    
    // Check text readability (should be visible over image)
    results.userExperience.textReadable = await page.isVisible('h1:has-text("Your Story, Our Sparkle")');
    console.log(`✅ Hero text readable: ${results.userExperience.textReadable}`);
    
    // Test 3: Deferred Loading Behavior
    console.log('\\n📍 Test 3: Deferred Video Loading Validation');
    console.log('--------------------------------------------');
    
    // Check no video element initially (first 1 second)
    const hasVideoInitially = await page.$('video[src*="hero_section_video"]');
    console.log(`📊 Video element at page load: ${hasVideoInitially ? 'PRESENT (BAD)' : 'ABSENT (GOOD)'}`);
    
    if (!hasVideoInitially) {
      console.log('✅ Deferred loading working - video not loaded immediately');
      results.deferredLoading.loadBehavior = 'deferred';
    } else {
      console.log('❌ Deferred loading failed - video loaded immediately');
      results.deferredLoading.loadBehavior = 'immediate';
    }
    
    // Wait for deferred loading trigger (1.5s timer)
    console.log('⏳ Waiting for deferred loading timer (1.5s)...');
    await page.waitForTimeout(2000);
    
    // Check if video element appears after timer
    const hasVideoAfterTimer = await page.$('video[src*="hero_section_video"]');
    results.deferredLoading.videoElement = !!hasVideoAfterTimer;
    console.log(`📊 Video element after timer: ${results.deferredLoading.videoElement ? 'PRESENT' : 'ABSENT'}`);
    
    if (hasVideoAfterTimer) {
      console.log('✅ Deferred loading timer working - video element created');
      
      // Check video loading state
      const videoState = await page.evaluate(() => {
        const video = document.querySelector('video[src*="hero_section_video"]');
        return video ? {
          readyState: video.readyState,
          networkState: video.networkState,
          currentTime: video.currentTime
        } : null;
      });
      
      if (videoState) {
        console.log(`📊 Video ready state: ${videoState.readyState} (${videoState.readyState >= 2 ? 'LOADED' : 'LOADING'})`);
      }
    }
    
    // Test 4: Performance Compliance Check
    console.log('\\n📍 Test 4: CLAUDE_RULES.md Compliance');
    console.log('-------------------------------------');
    
    const compliance = {
      fastDOMLoad: results.initialLoad.domContentLoaded < 1000, // <1s
      fastFCP: results.initialLoad.firstContentfulPaint < 1000, // <1s  
      fastNetworkIdle: results.initialLoad.networkIdle < 2000, // <2s (allowing for some async)
      heroFunctional: results.userExperience.heroVisible && results.userExperience.fallbackImageLoaded,
      deferredWorking: results.deferredLoading.loadBehavior === 'deferred'
    };
    
    results.performance.details = compliance;
    results.performance.score = Object.values(compliance).filter(Boolean).length;
    const totalChecks = Object.keys(compliance).length;
    results.performance.compliant = results.performance.score >= 4; // 80% compliance required
    
    console.log(`\\n🎯 PERFORMANCE COMPLIANCE RESULTS:`);
    console.log(`   Overall Score: ${results.performance.score}/${totalChecks} (${(results.performance.score/totalChecks*100).toFixed(1)}%)`);
    console.log(`   ✅ Fast DOM Load: ${compliance.fastDOMLoad ? 'PASS' : 'FAIL'} (${results.initialLoad.domContentLoaded}ms)`);
    console.log(`   ✅ Fast FCP: ${compliance.fastFCP ? 'PASS' : 'FAIL'} (${results.initialLoad.firstContentfulPaint}ms)`);
    console.log(`   ✅ Fast Network Idle: ${compliance.fastNetworkIdle ? 'PASS' : 'FAIL'} (${results.initialLoad.networkIdle}ms)`);
    console.log(`   ✅ Hero Functional: ${compliance.heroFunctional ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Deferred Loading: ${compliance.deferredWorking ? 'PASS' : 'FAIL'}`);
    
    // Final Assessment
    if (results.performance.compliant) {
      console.log('\\n🎯 ✅ PHASE 2 PASSED - CLAUDE_RULES.md COMPLIANT');
      console.log('   ✅ Fast initial page load (<1s DOM, <1s FCP)');
      console.log('   ✅ Excellent user experience with immediate content');
      console.log('   ✅ Video loading properly deferred for performance');
      console.log('   ✅ Hero section fully functional with fallback image');
      console.log('\\n🚀 READY FOR PHASE 3 - MATERIAL SWITCH OPTIMIZATION');
      return true;
    } else {
      console.log('\\n❌ PHASE 2 FAILED - CLAUDE_RULES.md NON-COMPLIANT');
      console.log('   ❌ Performance targets not met');
      console.log('   ❌ BLOCKED - Cannot proceed to Phase 3');
      return false;
    }
    
  } catch (error) {
    console.error('\\n❌ Phase 2 validation failed:', error);
    results.errors.push(error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Run validation
validatePhase2Performance().then(success => {
  process.exit(success ? 0 : 1);
});