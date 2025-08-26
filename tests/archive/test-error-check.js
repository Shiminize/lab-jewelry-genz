const { chromium } = require('playwright');

async function checkErrors() {
  console.log('🔍 Checking for Navigation Errors...\\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const baseURL = 'http://localhost:3000';

  // Capture console errors
  const consoleErrors = [];
  const networkErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  page.on('response', response => {
    if (!response.ok()) {
      networkErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log('Loading homepage and checking for errors...');
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    
    // Wait for potential hydration
    await page.waitForTimeout(5000);
    
    console.log('\\n=== ERROR ANALYSIS ===');
    
    // Console Errors
    console.log(`\\n📋 Console Errors (${consoleErrors.length}):`);
    if (consoleErrors.length === 0) {
      console.log('  ✅ No console errors found');
    } else {
      consoleErrors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }
    
    // Network Errors  
    console.log(`\\n🌐 Network Errors (${networkErrors.length}):`);
    if (networkErrors.length === 0) {
      console.log('  ✅ No network errors found');
    } else {
      networkErrors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }
    
    // Check if navigation rendered
    const navigationStatus = await page.evaluate(() => {
      return {
        hasHeader: !!document.querySelector('header'),
        hasMainNav: !!document.querySelector('nav[aria-label="Main navigation"]'),
        categoryButtons: document.querySelectorAll('nav button').length,
        shopButton: !!document.querySelector('button:has-text("SHOP")'),
        createButton: !!document.querySelector('button:has-text("CREATE")'),
        impactButton: !!document.querySelector('button:has-text("IMPACT")'),
        supportButton: !!document.querySelector('button:has-text("SUPPORT")'),
        mobileMenuButton: !!document.querySelector('button[aria-label*="menu"]'),
        visibleElements: {
          header: document.querySelector('header')?.offsetHeight || 0,
          nav: document.querySelector('nav')?.offsetHeight || 0
        }
      };
    });
    
    console.log(`\\n🎯 Navigation Status:`);
    console.log(`  Header present: ${navigationStatus.hasHeader ? '✅' : '❌'}`);
    console.log(`  Main navigation: ${navigationStatus.hasMainNav ? '✅' : '❌'}`);
    console.log(`  Category buttons: ${navigationStatus.categoryButtons}`);
    console.log(`  SHOP button: ${navigationStatus.shopButton ? '✅' : '❌'}`);
    console.log(`  CREATE button: ${navigationStatus.createButton ? '✅' : '❌'}`);
    console.log(`  IMPACT button: ${navigationStatus.impactButton ? '✅' : '❌'}`);
    console.log(`  SUPPORT button: ${navigationStatus.supportButton ? '✅' : '❌'}`);
    console.log(`  Mobile menu button: ${navigationStatus.mobileMenuButton ? '✅' : '❌'}`);
    
    console.log(`\\n📏 Element Heights:`);
    console.log(`  Header: ${navigationStatus.visibleElements.header}px`);
    console.log(`  Nav: ${navigationStatus.visibleElements.nav}px`);
    
    // Check for hydration issues
    const hydrationCheck = await page.evaluate(() => {
      const reactRoot = document.querySelector('#__next');
      const hasReactContent = !!reactRoot?.firstChild;
      const hasNextData = !!document.querySelector('#__NEXT_DATA__');
      
      return {
        hasReactRoot: !!reactRoot,
        hasReactContent,
        hasNextData,
        bodyClasses: document.body.className,
        totalElements: document.querySelectorAll('*').length
      };
    });
    
    console.log(`\\n⚛️ React/Next.js Status:`);
    console.log(`  React root: ${hydrationCheck.hasReactRoot ? '✅' : '❌'}`);
    console.log(`  React content: ${hydrationCheck.hasReactContent ? '✅' : '❌'}`);
    console.log(`  Next.js data: ${hydrationCheck.hasNextData ? '✅' : '❌'}`);
    console.log(`  Body classes: ${hydrationCheck.bodyClasses}`);
    console.log(`  Total elements: ${hydrationCheck.totalElements}`);
    
    // Take screenshot
    await page.screenshot({ path: 'error-check-screenshot.png', fullPage: true });
    console.log(`\\n📸 Screenshot saved as error-check-screenshot.png`);
    
    // Overall assessment
    const hasErrors = consoleErrors.length > 0 || networkErrors.length > 0 || !navigationStatus.hasHeader;
    console.log(`\\n${hasErrors ? '❌ ISSUES DETECTED' : '✅ NO MAJOR ISSUES FOUND'}`);
    
  } catch (error) {
    console.log(`\\n❌ Test Error: ${error.message}`);
  }

  await browser.close();
}

checkErrors().catch(console.error);