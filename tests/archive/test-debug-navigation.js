const { chromium } = require('playwright');

async function debugNavigation() {
  console.log('🔍 Debug Navigation Context...\\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const baseURL = 'http://localhost:3000';

  try {
    console.log('Loading homepage...');
    await page.goto(baseURL);
    
    // Wait for hydration
    await page.waitForTimeout(8000);
    
    // Debug navigation context
    const navigationDebug = await page.evaluate(() => {
      return {
        hasHeader: !!document.querySelector('header'),
        hasNav: !!document.querySelector('nav'),
        navCount: document.querySelectorAll('nav').length,
        hasNavigationProvider: !!document.querySelector('[class*="NavigationProvider"]'),
        buttonCount: document.querySelectorAll('button').length,
        allButtons: Array.from(document.querySelectorAll('button')).map(btn => ({
          text: btn.textContent?.trim(),
          classes: btn.className,
          ariaLabel: btn.getAttribute('aria-label')
        })),
        navButtons: Array.from(document.querySelectorAll('nav button')).map(btn => ({
          text: btn.textContent?.trim(),
          classes: btn.className
        })),
        errors: Array.from(document.querySelectorAll('*')).filter(el => 
          el.textContent?.includes('Error') || el.textContent?.includes('NavigationProvider')
        ).map(el => el.textContent)
      };
    });
    
    console.log('Navigation Debug Info:');
    console.log(`  Has Header: ${navigationDebug.hasHeader}`);
    console.log(`  Has Nav: ${navigationDebug.hasNav}`);
    console.log(`  Nav Count: ${navigationDebug.navCount}`);
    console.log(`  Button Count: ${navigationDebug.buttonCount}`);
    console.log(`  Nav Buttons: ${navigationDebug.navButtons.length}`);
    
    console.log('\\nAll Buttons:');
    navigationDebug.allButtons.forEach((btn, i) => {
      console.log(`  ${i + 1}. "${btn.text}" (${btn.ariaLabel || 'no aria-label'})`);
    });
    
    console.log('\\nNav Buttons:');
    navigationDebug.navButtons.forEach((btn, i) => {
      console.log(`  ${i + 1}. "${btn.text}"`);
    });
    
    if (navigationDebug.errors.length > 0) {
      console.log('\\n❌ Errors Found:');
      navigationDebug.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Take screenshot for visual debugging
    await page.screenshot({ path: 'navigation-debug.png', fullPage: true });
    console.log('\\n📸 Screenshot saved as navigation-debug.png');
    
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }

  await browser.close();
}

debugNavigation().catch(console.error);