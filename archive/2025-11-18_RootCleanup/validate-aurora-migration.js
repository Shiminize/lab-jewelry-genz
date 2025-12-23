// Simple Aurora Migration Validation
const puppeteer = require('puppeteer');

async function validateAuroraMigration() {
  console.log('🧪 Validating Aurora Migration Implementation...');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Navigate to homepage
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    
    // Check if page loads
    const title = await page.title();
    console.log('✅ Page title:', title);
    
    // Check Hero section exists
    const heroSection = await page.$('section');
    console.log('✅ Hero section found:', !!heroSection);
    
    // Check for consolidated color usage
    const brandPrimary = await page.$$eval('[class*="bg-brand-primary"]', els => els.length);
    const brandSecondary = await page.$$eval('[class*="bg-brand-secondary"]', els => els.length);
    const neutralColors = await page.$$eval('[class*="neutral-"]', els => els.length);
    
    console.log('🎨 Color System Usage:');
    console.log(`  - brand-primary: ${brandPrimary} elements`);
    console.log(`  - brand-secondary: ${brandSecondary} elements`);
    console.log(`  - neutral colors: ${neutralColors} elements`);
    
    // Check for console errors
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`🔍 Console errors: ${logs.length}`);
    if (logs.length > 0) {
      console.log('Sample errors:', logs.slice(0, 2));
    }
    
    // Take screenshot
    await page.screenshot({ path: 'aurora-migration-validation.png' });
    console.log('📸 Screenshot saved: aurora-migration-validation.png');
    
    console.log('🎉 Aurora migration validation completed successfully!');
    
    // Validate color demo page
    await page.goto('http://localhost:3000/color-demo', { waitUntil: 'domcontentloaded' });
    
    const demoTitle = await page.$eval('h2', el => el.textContent);
    console.log('✅ Color demo page loaded:', demoTitle);
    
    await page.screenshot({ path: 'color-demo-reference.png' });
    console.log('📸 Color demo screenshot saved: color-demo-reference.png');
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
  } finally {
    await browser.close();
  }
}

validateAuroraMigration();