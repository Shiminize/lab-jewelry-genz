/**
 * Phase 2: Homepage Performance Analysis
 * CLAUDE_RULES.md Compliant - Identifies 9s blocking operation
 */

const { chromium } = require('playwright');

async function analyzeHomepagePerformance() {
  console.log('🧪 Phase 2: Homepage Performance Analysis');
  console.log('=========================================');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const performanceMetrics = {
    navigationTiming: {},
    networkRequests: [],
    largeResources: [],
    slowRequests: [],
    blockingOperations: [],
    javascriptExecution: [],
    renderingMetrics: {}
  };
  
  // Track all network requests with timing
  page.on('request', request => {
    performanceMetrics.networkRequests.push({
      url: request.url(),
      method: request.method(),
      startTime: Date.now()
    });
  });
  
  page.on('response', async response => {
    const request = response.request();
    const endTime = Date.now();
    const duration = endTime - (performanceMetrics.networkRequests.find(r => r.url === request.url())?.startTime || endTime);
    
    const resourceInfo = {
      url: response.url(),
      status: response.status(),
      method: request.method(),
      duration: duration,
      size: parseInt(response.headers()['content-length'] || '0'),
      contentType: response.headers()['content-type'] || 'unknown'
    };
    
    // Track slow requests (>2s CLAUDE_RULES compliance)
    if (duration > 2000) {
      performanceMetrics.slowRequests.push({
        ...resourceInfo,
        severity: duration > 5000 ? 'critical' : 'warning'
      });
    }
    
    // Track large resources (>1MB)
    if (resourceInfo.size > 1048576) {
      performanceMetrics.largeResources.push(resourceInfo);
    }
  });
  
  try {
    console.log('\\n📍 Starting Homepage Load Analysis...');
    const startTime = Date.now();
    
    // Navigate with performance tracking
    await page.goto('http://localhost:3001/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    const domContentLoadedTime = Date.now() - startTime;
    console.log(`✅ DOM Content Loaded: ${domContentLoadedTime}ms`);
    
    // Wait for network idle and capture additional timing
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    const networkIdleTime = Date.now() - startTime;
    console.log(`✅ Network Idle: ${networkIdleTime}ms`);
    
    // Capture browser performance metrics
    const navigationTiming = await page.evaluate(() => {
      const timing = performance.timing;
      const navigation = performance.getEntriesByType('navigation')[0];
      
      return {
        // Legacy timing API
        domLoading: timing.domLoading - timing.navigationStart,
        domInteractive: timing.domInteractive - timing.navigationStart,
        domContentLoadedEventStart: timing.domContentLoadedEventStart - timing.navigationStart,
        domContentLoadedEventEnd: timing.domContentLoadedEventEnd - timing.navigationStart,
        domComplete: timing.domComplete - timing.navigationStart,
        loadEventStart: timing.loadEventStart - timing.navigationStart,
        loadEventEnd: timing.loadEventEnd - timing.navigationStart,
        
        // Navigation API v2
        ...(navigation && {
          redirectTime: navigation.redirectEnd - navigation.redirectStart,
          dnsTime: navigation.domainLookupEnd - navigation.domainLookupStart,
          connectTime: navigation.connectEnd - navigation.connectStart,
          requestTime: navigation.responseStart - navigation.requestStart,
          responseTime: navigation.responseEnd - navigation.responseStart,
          domProcessingTime: navigation.domInteractive - navigation.responseEnd,
          resourceLoadTime: navigation.loadEventStart - navigation.domContentLoadedEventEnd
        })
      };
    });
    
    performanceMetrics.navigationTiming = navigationTiming;
    
    // Capture JavaScript execution timing
    const jsMetrics = await page.evaluate(() => {
      const entries = performance.getEntriesByType('measure');
      const longTasks = performance.getEntriesByType('longtask') || [];
      
      return {
        measureEntries: entries.map(entry => ({
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime
        })),
        longTasks: longTasks.map(task => ({
          duration: task.duration,
          startTime: task.startTime
        }))
      };
    });
    
    performanceMetrics.javascriptExecution = jsMetrics;
    
    // Capture rendering metrics
    const renderingMetrics = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint');
      const layoutShift = performance.getEntriesByType('layout-shift');
      
      return {
        firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        cumulativeLayoutShift: layoutShift.reduce((sum, entry) => sum + entry.value, 0)
      };
    });
    
    performanceMetrics.renderingMetrics = renderingMetrics;
    
    // Wait for any async operations and capture final timing
    await page.waitForTimeout(5000);
    const totalTime = Date.now() - startTime;
    
    // Analysis and Reporting
    console.log('\\n📊 PERFORMANCE ANALYSIS RESULTS');
    console.log('================================');
    
    console.log('\\n⏱️ Load Time Breakdown:');
    console.log(`   DOM Content Loaded: ${domContentLoadedTime}ms`);
    console.log(`   Network Idle: ${networkIdleTime}ms`);
    console.log(`   Total Load Time: ${totalTime}ms`);
    
    console.log('\\n🖥️ Navigation Timing:');
    Object.entries(navigationTiming).forEach(([key, value]) => {
      if (typeof value === 'number' && value > 0) {
        console.log(`   ${key}: ${value}ms`);
      }
    });
    
    console.log('\\n🎨 Rendering Metrics:');
    console.log(`   First Paint: ${renderingMetrics.firstPaint}ms`);
    console.log(`   First Contentful Paint: ${renderingMetrics.firstContentfulPaint}ms`);
    console.log(`   Cumulative Layout Shift: ${renderingMetrics.cumulativeLayoutShift}`);
    
    // Identify blocking operations
    console.log('\\n🚨 BLOCKING OPERATIONS ANALYSIS:');
    
    if (performanceMetrics.slowRequests.length > 0) {
      console.log(`\\n❌ SLOW REQUESTS (${performanceMetrics.slowRequests.length} found):`);
      performanceMetrics.slowRequests.forEach((req, i) => {
        console.log(`   [${i+1}] ${req.severity.toUpperCase()}: ${req.duration}ms - ${req.url}`);
        console.log(`       Status: ${req.status}, Size: ${(req.size/1024).toFixed(1)}KB, Type: ${req.contentType}`);
      });
    }
    
    if (performanceMetrics.largeResources.length > 0) {
      console.log(`\\n📦 LARGE RESOURCES (${performanceMetrics.largeResources.length} found):`);
      performanceMetrics.largeResources.forEach((res, i) => {
        console.log(`   [${i+1}] ${(res.size/1048576).toFixed(1)}MB in ${res.duration}ms - ${res.url}`);
      });
    }
    
    if (jsMetrics.longTasks.length > 0) {
      console.log(`\\n⚡ LONG JAVASCRIPT TASKS (${jsMetrics.longTasks.length} found):`);
      jsMetrics.longTasks.forEach((task, i) => {
        console.log(`   [${i+1}] ${task.duration}ms starting at ${task.startTime}ms`);
      });
    }
    
    // CLAUDE_RULES.md Compliance Check
    const isClaudeRulesCompliant = {
      totalLoadTime: totalTime < 3000, // <3s page loads
      slowRequests: performanceMetrics.slowRequests.length === 0,
      firstContentfulPaint: renderingMetrics.firstContentfulPaint < 2000,
      cumulativeLayoutShift: renderingMetrics.cumulativeLayoutShift < 0.1
    };
    
    const complianceScore = Object.values(isClaudeRulesCompliant).filter(Boolean).length;
    const totalChecks = Object.keys(isClaudeRulesCompliant).length;
    
    console.log('\\n🎯 CLAUDE_RULES.md COMPLIANCE:');
    console.log(`   Overall Score: ${complianceScore}/${totalChecks} (${(complianceScore/totalChecks*100).toFixed(1)}%)`);
    console.log(`   ✅ Load Time <3s: ${isClaudeRulesCompliant.totalLoadTime ? 'PASS' : 'FAIL'} (${totalTime}ms)`);
    console.log(`   ✅ No Slow Requests: ${isClaudeRulesCompliant.slowRequests ? 'PASS' : 'FAIL'} (${performanceMetrics.slowRequests.length} found)`);
    console.log(`   ✅ FCP <2s: ${isClaudeRulesCompliant.firstContentfulPaint ? 'PASS' : 'FAIL'} (${renderingMetrics.firstContentfulPaint}ms)`);
    console.log(`   ✅ CLS <0.1: ${isClaudeRulesCompliant.cumulativeLayoutShift ? 'PASS' : 'FAIL'} (${renderingMetrics.cumulativeLayoutShift})`);
    
    // Identify root cause of 9s blocking
    if (totalTime > 9000) {
      console.log('\\n🔍 ROOT CAUSE ANALYSIS - 9s BLOCKING OPERATION:');
      
      // Check if it's network-related
      const criticalSlowRequests = performanceMetrics.slowRequests.filter(req => req.duration > 5000);
      if (criticalSlowRequests.length > 0) {
        console.log('   🌐 NETWORK BOTTLENECK DETECTED:');
        criticalSlowRequests.forEach(req => {
          console.log(`      - ${req.url} taking ${req.duration}ms`);
        });
      }
      
      // Check if it's JavaScript-related
      const longJsTasks = jsMetrics.longTasks.filter(task => task.duration > 3000);
      if (longJsTasks.length > 0) {
        console.log('   ⚡ JAVASCRIPT BOTTLENECK DETECTED:');
        longJsTasks.forEach(task => {
          console.log(`      - Task taking ${task.duration}ms starting at ${task.startTime}ms`);
        });
      }
      
      // Check DOM processing time
      if (navigationTiming.domProcessingTime > 5000) {
        console.log(`   🖥️ DOM PROCESSING BOTTLENECK: ${navigationTiming.domProcessingTime}ms`);
      }
      
      // Check resource loading time
      if (navigationTiming.resourceLoadTime > 5000) {
        console.log(`   📦 RESOURCE LOADING BOTTLENECK: ${navigationTiming.resourceLoadTime}ms`);
      }
    }
    
    const isPhase2Success = complianceScore >= 3; // At least 75% compliance
    
    if (isPhase2Success) {
      console.log('\\n🎯 ✅ PHASE 2 BASELINE ESTABLISHED');
      console.log('   Ready to implement optimizations in Phase 2');
    } else {
      console.log('\\n🎯 ❌ PHASE 2 PERFORMANCE ISSUES IDENTIFIED');
      console.log('   Critical optimizations required');
    }
    
    return {
      success: isPhase2Success,
      metrics: performanceMetrics,
      compliance: isClaudeRulesCompliant,
      totalTime,
      recommendations: generateRecommendations(performanceMetrics, isClaudeRulesCompliant)
    };
    
  } catch (error) {
    console.error('\\n❌ Phase 2 analysis failed:', error);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

function generateRecommendations(metrics, compliance) {
  const recommendations = [];
  
  if (!compliance.totalLoadTime) {
    recommendations.push('Implement lazy loading for non-critical resources');
    recommendations.push('Add resource preloading for critical assets');
  }
  
  if (!compliance.slowRequests) {
    recommendations.push('Optimize slow API endpoints');
    recommendations.push('Implement request caching strategy');
  }
  
  if (!compliance.firstContentfulPaint) {
    recommendations.push('Optimize critical rendering path');
    recommendations.push('Reduce main thread blocking time');
  }
  
  if (metrics.largeResources.length > 0) {
    recommendations.push('Implement image optimization and compression');
    recommendations.push('Add progressive loading for large assets');
  }
  
  return recommendations;
}

// Run analysis
analyzeHomepagePerformance().then(result => {
  if (result.recommendations) {
    console.log('\\n📋 OPTIMIZATION RECOMMENDATIONS:');
    result.recommendations.forEach((rec, i) => {
      console.log(`   ${i+1}. ${rec}`);
    });
  }
  process.exit(result.success ? 0 : 1);
});