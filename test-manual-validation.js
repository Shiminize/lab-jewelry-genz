const { chromium } = require('playwright');

async function manualValidation() {
  console.log('🔍 Manual Navigation Validation...\\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const baseURL = 'http://localhost:3000';

  try {
    console.log('Loading homepage...');
    await page.goto(baseURL);
    
    // Wait longer for full hydration
    await page.waitForTimeout(5000);
    
    // Take a screenshot
    await page.screenshot({ path: 'navigation-validation.png', fullPage: true });
    
    // Check if page loaded
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Check for basic elements
    const header = await page.locator('header').count();
    console.log(`Header count: ${header}`);
    
    // Check for navigation
    const nav = await page.locator('nav').count();
    console.log(`Navigation count: ${nav}`);
    
    // Check for mobile menu button
    const mobileButton = await page.locator('button[aria-label*="menu"]').count();
    console.log(`Mobile menu buttons: ${mobileButton}`);
    
    // Check desktop navigation at desktop size
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(2000);
    
    const desktopNav = await page.locator('nav[aria-label="Main navigation"]').count();
    console.log(`Desktop navigation: ${desktopNav}`);
    
    // Check for category buttons
    const buttons = await page.locator('nav button').count();
    console.log(`Navigation buttons: ${buttons}`);
    
    // Check for specific categories
    const shopButton = await page.locator('button:has-text("SHOP")').count();
    const createButton = await page.locator('button:has-text("CREATE")').count();
    const impactButton = await page.locator('button:has-text("IMPACT")').count();
    const supportButton = await page.locator('button:has-text("SUPPORT")').count();
    
    console.log(`\\nCategory buttons found:`);
    console.log(`  SHOP: ${shopButton}`);
    console.log(`  CREATE: ${createButton}`);
    console.log(`  IMPACT: ${impactButton}`);
    console.log(`  SUPPORT: ${supportButton}`);
    
    const totalExpected = shopButton + createButton + impactButton + supportButton;
    console.log(`  Total: ${totalExpected}/4`);
    
    if (totalExpected === 4) {
      console.log('\\n✅ SUCCESS: All 4 categories found!');
      
      // Try hover test
      try {
        const shop = await page.locator('button:has-text("SHOP")').first();
        await shop.hover();
        await page.waitForTimeout(1000);
        console.log('✅ Hover test successful');
      } catch (error) {
        console.log(`❌ Hover test failed: ${error.message}`);
      }
      
    } else {
      console.log('\\n❌ Missing categories');
    }
    
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }

  await browser.close();
}

manualValidation().catch(console.error);