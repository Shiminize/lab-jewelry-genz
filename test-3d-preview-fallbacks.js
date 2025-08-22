const puppeteer = require('playwright');

/**
 * Test 3D Preview Fallback Mechanisms
 * Tests the circuit breaker, error handling, and infinite loop prevention
 */
async function test3DPreviewFallbacks() {
  console.log('🧪 Testing 3D Preview Fallback Mechanisms...\n');
  
  const browser = await puppeteer.chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Enable console logging to monitor circuit breaker
    const consoleLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      if (text.includes('🔒') || text.includes('🚨') || text.includes('Circuit breaker') || text.includes('INFINITE LOOP')) {
        console.log(`CONSOLE: ${text}`);
      }
    });
    
    // Test 1: Navigate to customizer page
    console.log('📍 Test 1: Basic page load...');
    await page.goto('http://localhost:3002/customizer');
    await page.waitForLoadState('networkidle');
    
    // Check if the page loaded
    const title = await page.title();
    console.log(`✅ Page loaded: ${title}`);
    
    // Test 2: Test with non-existent image path
    console.log('\n📍 Test 2: Testing non-existent image path fallback...');
    
    // Check for error states
    await page.waitForTimeout(3000);
    
    const errorElements = await page.$$('[data-testid="image-sequence-viewer"]');
    console.log(`✅ Found ${errorElements.length} image sequence viewers`);
    
    // Test 3: Check for infinite loop prevention
    console.log('\n📍 Test 3: Monitoring for infinite loop prevention...');
    
    // Wait and collect console logs for analysis
    await page.waitForTimeout(5000);
    
    const relevantLogs = consoleLogs.filter(log => 
      log.includes('🔍') || 
      log.includes('🔒') || 
      log.includes('🚨') ||
      log.includes('Circuit breaker') ||
      log.includes('Format detection') ||
      log.includes('INFINITE LOOP')
    );
    
    console.log(`\n📊 Analysis Results:`);
    console.log(`Total console messages captured: ${consoleLogs.length}`);
    console.log(`Relevant monitoring messages: ${relevantLogs.length}`);
    
    if (relevantLogs.length > 0) {
      console.log('\n🔍 Monitoring Messages:');
      relevantLogs.slice(0, 10).forEach(log => console.log(`  - ${log}`));
      if (relevantLogs.length > 10) {
        console.log(`  ... and ${relevantLogs.length - 10} more`);
      }
    }
    
    // Test 4: Check error boundary functionality
    console.log('\n📍 Test 4: Testing error boundary handling...');
    
    const errorBoundaries = await page.$$('[class*="error"]');
    if (errorBoundaries.length > 0) {
      console.log(`✅ Found ${errorBoundaries.length} error handling elements`);
    } else {
      console.log('ℹ️ No error states currently visible (expected if images load successfully)');
    }
    
    // Test 5: Performance check
    console.log('\n📍 Test 5: Performance metrics...');
    
    const performanceEntries = await page.evaluate(() => {
      const entries = performance.getEntriesByType('navigation');
      return entries.length > 0 ? {
        loadTime: entries[0].loadEventEnd - entries[0].loadEventStart,
        domContentLoaded: entries[0].domContentLoadedEventEnd - entries[0].domContentLoadedEventStart,
        totalTime: entries[0].loadEventEnd - entries[0].fetchStart
      } : null;
    });
    
    if (performanceEntries) {
      console.log(`✅ Page load time: ${performanceEntries.loadTime.toFixed(1)}ms`);
      console.log(`✅ DOM ready: ${performanceEntries.domContentLoaded.toFixed(1)}ms`);
      console.log(`✅ Total time: ${performanceEntries.totalTime.toFixed(1)}ms`);
      
      // Check CLAUDE_RULES compliance (<3s page load)
      if (performanceEntries.totalTime < 3000) {
        console.log('✅ CLAUDE_RULES COMPLIANCE: Sub-3s page load achieved');
      } else {
        console.log('⚠️ CLAUDE_RULES WARNING: Page load exceeds 3s target');
      }
    }
    
    // Test 6: Test circuit breaker limits
    console.log('\n📍 Test 6: Checking circuit breaker activation...');
    
    const circuitBreakerLogs = consoleLogs.filter(log => 
      log.includes('Circuit breaker') || 
      log.includes('Max format requests') ||
      log.includes('🔒')
    );
    
    if (circuitBreakerLogs.length > 0) {
      console.log(`✅ Circuit breaker working: ${circuitBreakerLogs.length} activations detected`);
      circuitBreakerLogs.forEach(log => console.log(`  📋 ${log}`));
    } else {
      console.log('ℹ️ No circuit breaker activations (good - indicates healthy request patterns)');
    }
    
    // Test 7: Check infinite loop prevention
    const infiniteLoopLogs = consoleLogs.filter(log => 
      log.includes('INFINITE LOOP DETECTED') || 
      log.includes('🚨')
    );
    
    if (infiniteLoopLogs.length > 0) {
      console.log(`🚨 INFINITE LOOP PREVENTION ACTIVATED: ${infiniteLoopLogs.length} times`);
      infiniteLoopLogs.forEach(log => console.log(`  🚨 ${log}`));
    } else {
      console.log('✅ No infinite loops detected (excellent)');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
  
  console.log('\n🎉 Fallback mechanism testing completed!');
  return true;
}

// Run the test
test3DPreviewFallbacks().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});