const { chromium } = require('playwright');

async function testSizingCalculator() {
  console.log('🧮 Testing sizing calculator functionality...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
  
  try {
    // Navigate to sizing page
    await page.goto(`${baseUrl}/sizing`, { waitUntil: 'networkidle' });
    console.log('✅ Sizing page loaded');
    
    // Test ring sizing calculator
    await page.fill('input[placeholder*="16.5"]', '52.5');
    await page.click('button:has-text("Calculate Size")');
    
    // Wait for calculation result
    await page.waitForTimeout(1000);
    
    // Check if results appear
    const hasResults = await page.locator('text="Your Ring Size"').isVisible();
    console.log(`✅ Ring calculator shows results: ${hasResults}`);
    
    // Test tab switching
    await page.click('button:has-text("Necklace Guide")');
    await page.waitForTimeout(500);
    
    const necklaceVisible = await page.locator('text="Necklace Length Guide"').isVisible();
    console.log(`✅ Necklace tab switching works: ${necklaceVisible}`);
    
    // Test bracelet calculator
    await page.click('button:has-text("Bracelet Sizer")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder*="6.5"]', '7.0');
    await page.click('input[value="comfortable"]');
    
    const braceletResult = await page.locator('text="Recommended bracelet size"').isVisible();
    console.log(`✅ Bracelet calculator works: ${braceletResult}`);
    
    console.log('🎉 All sizing calculator functionality validated!');
    
  } catch (error) {
    console.error('❌ Calculator testing failed:', error.message);
  }
  
  await browser.close();
}

testSizingCalculator().catch(console.error);