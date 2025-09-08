const { chromium } = require('playwright');

async function testDemoMode() {
  console.log('🎭 Testing Aurora Demo Mode Implementation');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate with longer timeout
    console.log('📍 Navigating to demo page...');
    await page.goto('http://localhost:3001/?design=demo', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // Wait a bit for styles to load
    await page.waitForTimeout(3000);
    
    // Check CSS variables
    console.log('🔍 Checking CSS variables...');
    const deepSpace = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--deep-space');
    });
    
    const nebulaPurple = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--nebula-purple');
    });
    
    const auroraRose = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--aurora-pink');
    });
    
    console.log('✅ CSS Variables loaded:');
    console.log('  --deep-space:', deepSpace.trim() || 'NOT FOUND');
    console.log('  --nebula-purple:', nebulaPurple.trim() || 'NOT FOUND');
    console.log('  --aurora-pink:', auroraRose.trim() || 'NOT FOUND');
    
    // Look for hero gradient elements
    const heroElements = await page.locator('.bg-aurora-hero').count();
    console.log(`🎨 Found ${heroElements} .bg-aurora-hero elements`);
    
    if (heroElements > 0) {
      const heroStyle = await page.locator('.bg-aurora-hero').first().evaluate((el) => {
        return getComputedStyle(el).backgroundImage;
      });
      console.log('🌈 Hero background:', heroStyle.includes('linear-gradient') ? 'HAS GRADIENT ✅' : 'NO GRADIENT ❌');
    }
    
    // Take screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'demo-validation.png', fullPage: true });
    
    console.log('🎉 Demo validation completed! Check demo-validation.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testDemoMode();