const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Listen for console logs
  page.on('console', msg => console.log('🖥️ CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('❌ ERROR:', err.message));
  
  // Track API requests
  const apiRequests = [];
  page.on('request', req => {
    if (req.url().includes('/api/products')) {
      apiRequests.push(req.url());
    }
  });
  
  try {
    console.log('🌐 Navigating to catalog...');
    await page.goto('http://localhost:3000/catalog', { waitUntil: 'networkidle0', timeout: 15000 });
    
    // Wait for search component
    console.log('🔍 Waiting for search input...');
    await page.waitForSelector('input[data-testid="product-search-input"]', { timeout: 10000 });
    console.log('✅ Search input found');
    
    // Wait for potential API calls
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check for product cards
    const productCards = await page.$$('[data-testid="product-card"]');
    console.log(`📦 Found ${productCards.length} product cards`);
    
    // Check API requests
    console.log('🔗 API requests made:', apiRequests);
    
    // Check for error/loading states
    const errorElements = await page.$$('text=/error|failed/i');
    const loadingElements = await page.$$('text=/loading/i');
    console.log(`⚠️ Error elements: ${errorElements.length}`);
    console.log(`⏳ Loading elements: ${loadingElements.length}`);
    
    // Get page content snippet around ProductSearch
    const searchAreaContent = await page.evaluate(() => {
      const searchArea = document.querySelector('[data-testid="product-search-input"]')?.parentElement?.parentElement;
      return searchArea ? searchArea.innerHTML.substring(0, 500) : 'Search area not found';
    });
    console.log('📝 Search area content:', searchAreaContent);
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();