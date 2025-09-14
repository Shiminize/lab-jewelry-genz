const puppeteer = require('puppeteer');

async function testUI() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({
        text: msg.text(),
        location: msg.location()
      });
    }
  });
  
  // Capture page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.toString());
  });
  
  const routes = [
    { path: '/', name: 'Homepage' },
    { path: '/catalog', name: 'Catalog' },
    { path: '/customizer', name: 'Customizer' },
    { path: '/cart', name: 'Cart' },
    { path: '/checkout', name: 'Checkout' },
    { path: '/admin', name: 'Admin' },
    { path: '/admin/products', name: 'Admin Products' },
    { path: '/admin/orders', name: 'Admin Orders' },
    { path: '/profile', name: 'Profile' },
    { path: '/auth/signin', name: 'Sign In' },
    { path: '/auth/signup', name: 'Sign Up' }
  ];
  
  const results = {
    routes: {},
    components: {},
    errors: {
      console: [],
      page: [],
      hydration: []
    },
    abTesting: {},
    performance: {}
  };
  
  for (const route of routes) {
    console.log(`\n🔍 Testing ${route.name} (${route.path})...`);
    consoleErrors.length = 0;
    pageErrors.length = 0;
    
    try {
      const response = await page.goto(`http://localhost:3000${route.path}`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      const status = response.status();
      console.log(`  Status: ${status}`);
      
      // Check for hydration errors
      const hydrationErrors = await page.evaluate(() => {
        const errors = [];
        const bodyText = document.body.innerText;
        if (bodyText.includes('Hydration failed')) {
          errors.push('Hydration mismatch detected');
        }
        if (bodyText.includes('Text content does not match')) {
          errors.push('Text content mismatch');
        }
        return errors;
      });
      
      // Check critical components visibility
      const components = await page.evaluate(() => {
        const checks = {};
        
        // Navigation
        const nav = document.querySelector('nav, header');
        checks.navigation = nav ? 'visible' : 'missing';
        
        // Logo
        const logo = document.querySelector('[class*="logo"], [alt*="logo"], a[href="/"]');
        checks.logo = logo ? 'visible' : 'missing';
        
        // Main content
        const main = document.querySelector('main, [role="main"], #__next > div');
        checks.mainContent = main ? 'visible' : 'missing';
        
        // Footer
        const footer = document.querySelector('footer');
        checks.footer = footer ? 'visible' : 'missing';
        
        // Check for broken styles
        const body = document.body;
        const computedStyle = window.getComputedStyle(body);
        checks.hasStyles = computedStyle.fontFamily !== 'Times New Roman';
        
        // Check for A/B testing elements
        const demoElements = document.querySelectorAll('[class*="demo"], [class*="aurora"]');
        checks.abTestingElements = demoElements.length;
        
        // Check for interactive elements
        const buttons = document.querySelectorAll('button');
        const links = document.querySelectorAll('a');
        const forms = document.querySelectorAll('form');
        checks.interactiveElements = {
          buttons: buttons.length,
          links: links.length,
          forms: forms.length
        };
        
        return checks;
      });
      
      // Check for localStorage/sessionStorage usage
      const storageUsage = await page.evaluate(() => {
        try {
          return {
            localStorage: Object.keys(localStorage),
            sessionStorage: Object.keys(sessionStorage)
          };
        } catch (e) {
          return { error: e.toString() };
        }
      });
      
      // Take screenshot for visual inspection
      await page.screenshot({ 
        path: `test-results/audit-${route.path.replace(/\//g, '-') || 'home'}.png`,
        fullPage: true 
      });
      
      results.routes[route.path] = {
        name: route.name,
        status,
        components,
        hydrationErrors,
        storageUsage,
        consoleErrors: [...consoleErrors],
        pageErrors: [...pageErrors]
      };
      
      // Special checks for specific routes
      if (route.path === '/') {
        // Check hero section
        const heroCheck = await page.evaluate(() => {
          const hero = document.querySelector('[class*="hero"], section:first-child');
          if (hero) {
            const styles = window.getComputedStyle(hero);
            return {
              exists: true,
              height: styles.height,
              background: styles.background || styles.backgroundColor
            };
          }
          return { exists: false };
        });
        results.components.hero = heroCheck;
        
        // Check product cards
        const productCards = await page.evaluate(() => {
          const cards = document.querySelectorAll('[class*="product"], [class*="card"]');
          return {
            count: cards.length,
            firstCardClasses: cards[0]?.className || 'none'
          };
        });
        results.components.productCards = productCards;
      }
      
      if (route.path === '/catalog') {
        // Check catalog specific elements
        const catalogCheck = await page.evaluate(() => {
          const filters = document.querySelector('[class*="filter"]');
          const grid = document.querySelector('[class*="grid"]');
          const products = document.querySelectorAll('[class*="product"]');
          const search = document.querySelector('input[type="search"], input[placeholder*="search"]');
          
          return {
            hasFilters: !!filters,
            hasGrid: !!grid,
            productCount: products.length,
            hasSearch: !!search
          };
        });
        results.components.catalog = catalogCheck;
      }
      
    } catch (error) {
      console.error(`  ❌ Error testing ${route.name}: ${error.message}`);
      results.routes[route.path] = {
        name: route.name,
        error: error.message,
        consoleErrors: [...consoleErrors],
        pageErrors: [...pageErrors]
      };
    }
  }
  
  // Check A/B testing configuration
  console.log('\n🔬 Checking A/B Testing Configuration...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  const abTestingCheck = await page.evaluate(() => {
    const checks = {};
    
    // Check for demo mode classes
    const demoClasses = Array.from(document.querySelectorAll('*')).filter(el => 
      el.className && el.className.toString().includes('demo')
    );
    checks.demoClassCount = demoClasses.length;
    checks.demoClasses = demoClasses.slice(0, 5).map(el => ({
      tag: el.tagName,
      classes: el.className.toString()
    }));
    
    // Check CSS variables
    const rootStyles = window.getComputedStyle(document.documentElement);
    checks.cssVariables = {
      primaryColor: rootStyles.getPropertyValue('--primary'),
      backgroundColor: rootStyles.getPropertyValue('--background'),
      foregroundColor: rootStyles.getPropertyValue('--foreground')
    };
    
    // Check for Tailwind classes
    const tailwindElements = Array.from(document.querySelectorAll('*')).filter(el => {
      const classes = el.className?.toString() || '';
      return classes.includes('bg-') || classes.includes('text-') || 
             classes.includes('flex') || classes.includes('grid');
    });
    checks.tailwindElementCount = tailwindElements.length;
    
    return checks;
  });
  
  results.abTesting = abTestingCheck;
  
  // Performance check
  const metrics = await page.evaluate(() => {
    const perf = performance.timing;
    return {
      domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
      loadComplete: perf.loadEventEnd - perf.loadEventStart
    };
  });
  results.performance = metrics;
  
  await browser.close();
  
  // Generate report
  console.log('\n' + '='.repeat(80));
  console.log('📊 UI AUDIT REPORT');
  console.log('='.repeat(80));
  
  // Route status summary
  console.log('\n🚦 ROUTE STATUS:');
  const workingRoutes = [];
  const brokenRoutes = [];
  
  for (const [path, data] of Object.entries(results.routes)) {
    if (data.error || data.status >= 400) {
      brokenRoutes.push({ path, ...data });
      console.log(`  ❌ ${data.name}: ${data.error || `Status ${data.status}`}`);
    } else if (data.hydrationErrors?.length > 0) {
      brokenRoutes.push({ path, ...data });
      console.log(`  ⚠️  ${data.name}: Hydration issues`);
    } else {
      workingRoutes.push({ path, ...data });
      console.log(`  ✅ ${data.name}: Working`);
    }
  }
  
  // Component issues
  console.log('\n🔧 COMPONENT ISSUES:');
  for (const [path, data] of Object.entries(results.routes)) {
    if (data.components) {
      const issues = [];
      if (data.components.navigation === 'missing') issues.push('Navigation missing');
      if (data.components.mainContent === 'missing') issues.push('Main content missing');
      if (!data.components.hasStyles) issues.push('Styles not loading');
      
      if (issues.length > 0) {
        console.log(`  ${data.name}: ${issues.join(', ')}`);
      }
    }
  }
  
  // Console errors summary
  console.log('\n⚠️  CONSOLE ERRORS:');
  const allConsoleErrors = new Set();
  for (const [path, data] of Object.entries(results.routes)) {
    if (data.consoleErrors?.length > 0) {
      data.consoleErrors.forEach(err => allConsoleErrors.add(err.text));
    }
  }
  if (allConsoleErrors.size > 0) {
    Array.from(allConsoleErrors).forEach(err => {
      console.log(`  - ${err.substring(0, 100)}...`);
    });
  } else {
    console.log('  None detected');
  }
  
  // A/B Testing issues
  console.log('\n🧪 A/B TESTING STATUS:');
  console.log(`  Demo classes found: ${results.abTesting.demoClassCount}`);
  console.log(`  Tailwind elements: ${results.abTesting.tailwindElementCount}`);
  console.log(`  CSS Variables:`, results.abTesting.cssVariables);
  
  // Priority fixes
  console.log('\n🔥 PRIORITY FIXES:');
  console.log('  1. Critical (P0) - Complete outages:');
  brokenRoutes.forEach(route => {
    if (route.error || route.status >= 500) {
      console.log(`     - ${route.name}: ${route.error || `Server error ${route.status}`}`);
    }
  });
  
  console.log('  2. Major (P1) - Broken functionality:');
  brokenRoutes.forEach(route => {
    if (route.hydrationErrors?.length > 0 || (route.status >= 400 && route.status < 500)) {
      console.log(`     - ${route.name}: ${route.hydrationErrors?.join(', ') || `Client error ${route.status}`}`);
    }
  });
  
  console.log('\n📈 PERFORMANCE:');
  console.log(`  DOM Content Loaded: ${results.performance.domContentLoaded}ms`);
  console.log(`  Page Load Complete: ${results.performance.loadComplete}ms`);
  
  // Save detailed report
  require('fs').writeFileSync(
    'test-results/ui-audit-report.json',
    JSON.stringify(results, null, 2)
  );
  
  console.log('\n✅ Audit complete. Detailed report saved to test-results/ui-audit-report.json');
  console.log('📸 Screenshots saved to test-results/audit-*.png');
  
  return results;
}

testUI().catch(console.error);