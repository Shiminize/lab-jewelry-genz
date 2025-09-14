import { test, expect } from '@playwright/test';

test('Navigation Console Error Diagnosis - Vision Mode', async ({ page }) => {
  console.log('🔍 VISION MODE: Diagnosing Navigation Console Errors...\n');
  
  // Capture all console messages
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  const consoleLogs: string[] = [];
  
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      consoleErrors.push(text);
      console.log(`❌ ERROR: ${text}`);
    } else if (type === 'warning') {
      consoleWarnings.push(text);
      console.log(`⚠️ WARNING: ${text}`);
    } else if (type === 'log') {
      consoleLogs.push(text);
    }
  });
  
  // Capture network failures
  const networkErrors: any[] = [];
  page.on('requestfailed', request => {
    networkErrors.push({
      url: request.url(),
      failure: request.failure()?.errorText || 'Unknown error'
    });
    console.log(`🌐 NETWORK ERROR: ${request.url()} - ${request.failure()?.errorText}`);
  });
  
  // Navigate to the page
  console.log('\n📍 Navigating to http://localhost:3001...\n');
  
  try {
    await page.goto('http://localhost:3001', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
  } catch (error) {
    console.log(`❌ Navigation failed: ${error}`);
  }
  
  // Wait for any async operations
  await page.waitForTimeout(3000);
  
  // Take screenshot for visual inspection
  await page.screenshot({ 
    path: 'navigation-error-state.png', 
    fullPage: true 
  });
  
  console.log('\n📸 Screenshot saved as navigation-error-state.png\n');
  
  // Analyze page structure
  console.log('🔍 ANALYZING PAGE STRUCTURE:\n');
  
  const pageAnalysis = await page.evaluate(() => {
    const analysis: any = {
      hasHeader: false,
      hasNav: false,
      hasTrustBar: false,
      visibleComponents: [],
      missingComponents: [],
      bodyClasses: document.body.className,
      htmlClasses: document.documentElement.className
    };
    
    // Check for header
    const header = document.querySelector('header');
    if (header) {
      analysis.hasHeader = true;
      analysis.headerContent = header.innerHTML.substring(0, 200);
    } else {
      analysis.missingComponents.push('header');
    }
    
    // Check for navigation
    const nav = document.querySelector('nav');
    if (nav) {
      analysis.hasNav = true;
      analysis.navClasses = nav.className;
    } else {
      analysis.missingComponents.push('nav');
    }
    
    // Check for trust bar
    const trustBar = document.querySelector('[style*="champagne"], [style*="F5F5F0"], [data-testid="trust-bar"]');
    if (trustBar) {
      analysis.hasTrustBar = true;
    }
    
    // Check for any visible error messages
    const errorElements = document.querySelectorAll('[class*="error"], [data-error], .error-boundary');
    errorElements.forEach(el => {
      analysis.visibleComponents.push({
        type: 'error',
        class: el.className,
        text: (el.textContent || '').substring(0, 100)
      });
    });
    
    // Check for React error boundary
    const reactError = document.querySelector('#__next-error__');
    if (reactError) {
      analysis.reactError = reactError.textContent;
    }
    
    return analysis;
  });
  
  console.log('Page Structure Analysis:');
  console.log(`  Has Header: ${pageAnalysis.hasHeader}`);
  console.log(`  Has Navigation: ${pageAnalysis.hasNav}`);
  console.log(`  Has Trust Bar: ${pageAnalysis.hasTrustBar}`);
  console.log(`  Body Classes: ${pageAnalysis.bodyClasses || 'none'}`);
  console.log(`  HTML Classes: ${pageAnalysis.htmlClasses || 'none'}`);
  
  if (pageAnalysis.missingComponents.length > 0) {
    console.log(`  Missing Components: ${pageAnalysis.missingComponents.join(', ')}`);
  }
  
  if (pageAnalysis.reactError) {
    console.log(`  React Error: ${pageAnalysis.reactError}`);
  }
  
  // Check for hydration issues
  console.log('\n🔍 CHECKING FOR HYDRATION ISSUES:\n');
  
  const hydrationCheck = await page.evaluate(() => {
    const checkResults: any = {
      hasReactRoot: false,
      hasNextData: false,
      isClientSide: typeof window !== 'undefined',
      reactVersion: '',
      nextVersion: ''
    };
    
    // Check for React root
    const reactRoot = document.querySelector('#__next') || document.querySelector('[data-reactroot]');
    checkResults.hasReactRoot = !!reactRoot;
    
    // Check for Next.js data
    const nextData = document.querySelector('script#__NEXT_DATA__');
    checkResults.hasNextData = !!nextData;
    
    // Check React version
    if ((window as any).React) {
      checkResults.reactVersion = (window as any).React.version;
    }
    
    // Check for hydration warnings in HTML
    const html = document.documentElement.outerHTML;
    checkResults.hasHydrationWarning = html.includes('Hydration') || html.includes('hydration');
    
    return checkResults;
  });
  
  console.log('Hydration Check:');
  console.log(`  Has React Root: ${hydrationCheck.hasReactRoot}`);
  console.log(`  Has Next.js Data: ${hydrationCheck.hasNextData}`);
  console.log(`  Is Client Side: ${hydrationCheck.isClientSide}`);
  console.log(`  Has Hydration Warning: ${hydrationCheck.hasHydrationWarning}`);
  
  // Check component rendering
  console.log('\n🔍 CHECKING COMPONENT RENDERING:\n');
  
  const componentCheck = await page.evaluate(() => {
    const results: any = {
      navigationComponents: [],
      iconElements: 0,
      buttons: 0,
      links: 0
    };
    
    // Check for NavigationABWrapper
    const abWrapper = document.querySelector('[data-component="NavigationABWrapper"]');
    if (abWrapper) {
      results.navigationComponents.push('NavigationABWrapper');
    }
    
    // Check for NavBar or NavBarEnhanced
    const navBar = document.querySelector('[data-component="NavBar"], [data-component="NavBarEnhanced"]');
    if (navBar) {
      results.navigationComponents.push(navBar.getAttribute('data-component') || 'Unknown NavBar');
    }
    
    // Count icons
    results.iconElements = document.querySelectorAll('svg, [class*="icon"]').length;
    
    // Count interactive elements
    results.buttons = document.querySelectorAll('button').length;
    results.links = document.querySelectorAll('a').length;
    
    return results;
  });
  
  console.log('Component Rendering Check:');
  console.log(`  Navigation Components: ${componentCheck.navigationComponents.join(', ') || 'none found'}`);
  console.log(`  Icon Elements: ${componentCheck.iconElements}`);
  console.log(`  Buttons: ${componentCheck.buttons}`);
  console.log(`  Links: ${componentCheck.links}`);
  
  // Analyze specific error patterns
  console.log('\n🔍 ERROR PATTERN ANALYSIS:\n');
  
  if (consoleErrors.length > 0) {
    console.log(`Found ${consoleErrors.length} console errors:\n`);
    
    // Group similar errors
    const errorPatterns: Record<string, number> = {};
    
    consoleErrors.forEach(error => {
      // Identify error patterns
      if (error.includes('Event handlers cannot be passed to Client Component')) {
        errorPatterns['Client Component Event Handler'] = (errorPatterns['Client Component Event Handler'] || 0) + 1;
      } else if (error.includes('fetch failed')) {
        errorPatterns['API Fetch Failed'] = (errorPatterns['API Fetch Failed'] || 0) + 1;
      } else if (error.includes('ECONNREFUSED')) {
        errorPatterns['Connection Refused'] = (errorPatterns['Connection Refused'] || 0) + 1;
      } else if (error.includes('hydration')) {
        errorPatterns['Hydration Error'] = (errorPatterns['Hydration Error'] || 0) + 1;
      } else if (error.includes('TypeError')) {
        errorPatterns['Type Error'] = (errorPatterns['Type Error'] || 0) + 1;
      } else {
        errorPatterns['Other'] = (errorPatterns['Other'] || 0) + 1;
      }
    });
    
    console.log('Error Pattern Summary:');
    Object.entries(errorPatterns).forEach(([pattern, count]) => {
      console.log(`  ${pattern}: ${count} occurrence(s)`);
    });
  } else {
    console.log('✅ No console errors detected');
  }
  
  // Final diagnosis
  console.log('\n📊 DIAGNOSIS SUMMARY:\n');
  console.log('=====================================');
  
  if (consoleErrors.length > 0) {
    console.log('❌ CRITICAL ISSUES FOUND:');
    
    if (consoleErrors.some(e => e.includes('Event handlers cannot be passed'))) {
      console.log('\n1. CLIENT COMPONENT EVENT HANDLER ISSUE:');
      console.log('   - Server components are trying to pass event handlers to client components');
      console.log('   - This is likely happening in a button or interactive element');
      console.log('   - Solution: Mark the component with event handlers as "use client"');
    }
    
    if (consoleErrors.some(e => e.includes('fetch failed') || e.includes('ECONNREFUSED'))) {
      console.log('\n2. API CONNECTION ISSUE:');
      console.log('   - Backend API is not accessible (ECONNREFUSED)');
      console.log('   - This affects featured products loading');
      console.log('   - Solution: Ensure MongoDB and API services are running');
    }
    
    if (!pageAnalysis.hasHeader || !pageAnalysis.hasNav) {
      console.log('\n3. COMPONENT RENDERING ISSUE:');
      console.log('   - Navigation components may not be rendering properly');
      console.log('   - Could be caused by the event handler errors blocking rendering');
      console.log('   - Solution: Fix the client component issues first');
    }
  } else {
    console.log('✅ No critical errors found in console');
  }
  
  if (consoleWarnings.length > 0) {
    console.log(`\n⚠️ ${consoleWarnings.length} warnings detected (non-critical)`);
  }
  
  console.log('\n=====================================');
  console.log('🔍 VISION MODE DIAGNOSIS COMPLETE');
});