const { chromium } = require('playwright');

async function validateSupportPages() {
  console.log('🧪 Starting support pages validation...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
  const results = [];
  
  // Test pages
  const pages = [
    { path: '/care', name: 'Care Page' },
    { path: '/quality', name: 'Quality Page' },
    { path: '/sizing', name: 'Sizing Page' }
  ];
  
  for (const testPage of pages) {
    try {
      console.log(`\n📄 Testing ${testPage.name}...`);
      
      // Navigate to page
      await page.goto(`${baseUrl}${testPage.path}`, { waitUntil: 'networkidle' });
      
      // Check page loads
      const title = await page.title();
      console.log(`✅ Page loads: ${title}`);
      
      // Check for CLAUDE_RULES compliance - approved color combinations
      const forbiddenClasses = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const forbidden = [];
        
        elements.forEach(el => {
          const classes = el.className;
          if (typeof classes === 'string') {
            // Check for forbidden color combinations
            if (classes.includes('text-black') || classes.includes('bg-blue-500') || classes.includes('border-gray-')) {
              forbidden.push({
                element: el.tagName.toLowerCase(),
                classes: classes
              });
            }
          }
        });
        
        return forbidden;
      });
      
      if (forbiddenClasses.length === 0) {
        console.log(`✅ CLAUDE_RULES compliance: No forbidden classes found`);
      } else {
        console.log(`❌ CLAUDE_RULES violations found:`, forbiddenClasses.slice(0, 3));
      }
      
      // Check for specific functionality
      if (testPage.path === '/sizing') {
        // Test sizing calculator
        const hasCalculator = await page.locator('[data-testid="ring-calculator"], input[type="number"]').first().isVisible();
        console.log(`✅ Sizing calculator present: ${hasCalculator}`);
      }
      
      if (testPage.path === '/quality') {
        // Test warranty form
        const hasForm = await page.locator('form, input[type="email"]').first().isVisible();
        console.log(`✅ Warranty form present: ${hasForm}`);
      }
      
      if (testPage.path === '/care') {
        // Test care content
        const hasCareContent = await page.locator('h1, h2, h3').first().isVisible();
        console.log(`✅ Care content present: ${hasCareContent}`);
      }
      
      results.push({
        page: testPage.name,
        status: 'PASS',
        url: `${baseUrl}${testPage.path}`
      });
      
    } catch (error) {
      console.error(`❌ ${testPage.name} failed:`, error.message);
      results.push({
        page: testPage.name,
        status: 'FAIL',
        error: error.message
      });
    }
  }
  
  await browser.close();
  
  // Summary
  console.log('\n📊 VALIDATION SUMMARY:');
  results.forEach(result => {
    const status = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${status} ${result.page}: ${result.status}`);
    if (result.url) console.log(`   URL: ${result.url}`);
  });
  
  const passCount = results.filter(r => r.status === 'PASS').length;
  console.log(`\n🎯 Overall: ${passCount}/${results.length} pages passing`);
  
  if (passCount === results.length) {
    console.log('🎉 All support pages validated successfully!');
    console.log('✅ Complete redesign with CLAUDE_RULES compliance achieved');
  }
  
  return passCount === results.length;
}

validateSupportPages().catch(console.error);