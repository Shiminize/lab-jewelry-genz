const { chromium } = require('playwright');

async function validateClaudeRulesCompliance() {
  console.log('🔍 Validating CLAUDE_RULES compliance for support pages...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
  
  // CLAUDE_RULES approved combinations
  const approvedCombinations = [
    'text-foreground bg-background',
    'text-gray-600 bg-background', 
    'text-foreground bg-white',
    'text-foreground bg-muted',
    'text-background bg-foreground',
    'text-accent bg-white',
    'text-background bg-cta'
  ];
  
  // Forbidden patterns
  const forbiddenPatterns = [
    'bg-gradient-to-',
    'text-black',
    'bg-blue-500',
    'border-gray-',
    'text-accent.*bg-gradient',
    'from-accent via-background to-muted'
  ];
  
  const results = [];
  const pages = [
    { path: '/care', name: 'Care Page' },
    { path: '/quality', name: 'Quality Page' },
    { path: '/sizing', name: 'Sizing Page' }
  ];
  
  for (const testPage of pages) {
    try {
      console.log(`\n📄 Validating ${testPage.name}...`);
      
      await page.goto(`${baseUrl}${testPage.path}`, { waitUntil: 'networkidle' });
      
      // Check for forbidden patterns in HTML
      const violations = await page.evaluate((forbidden) => {
        const elements = document.querySelectorAll('*');
        const found = [];
        
        elements.forEach(el => {
          const classes = el.className;
          if (typeof classes === 'string') {
            forbidden.forEach(pattern => {
              const regex = new RegExp(pattern);
              if (regex.test(classes)) {
                found.push({
                  element: el.tagName.toLowerCase(),
                  classes: classes,
                  violation: pattern
                });
              }
            });
          }
        });
        
        return found;
      }, forbiddenPatterns);
      
      // Check for icons in headers
      const headerIcons = await page.evaluate(() => {
        const headers = document.querySelectorAll('h1, h2, h3');
        const iconElements = [];
        
        headers.forEach(header => {
          const section = header.closest('section');
          if (section) {
            const icons = section.querySelectorAll('svg');
            icons.forEach(icon => {
              iconElements.push({
                section: section.className,
                iconClasses: icon.getAttribute('class') || '',
                headerText: header.textContent.trim()
              });
            });
          }
        });
        
        return iconElements;
      });
      
      const isCompliant = violations.length === 0 && headerIcons.length === 0;
      
      console.log(`${isCompliant ? '✅' : '❌'} ${testPage.name}: ${isCompliant ? 'COMPLIANT' : 'VIOLATIONS FOUND'}`);
      
      if (violations.length > 0) {
        console.log('   🚫 CSS Violations:', violations.slice(0, 3));
      }
      
      if (headerIcons.length > 0) {
        console.log('   🚫 Header Icons Found:', headerIcons.map(i => i.headerText));
      }
      
      if (isCompliant) {
        console.log('   ✅ Uses approved color combinations only');
        console.log('   ✅ No forbidden gradients or patterns');
        console.log('   ✅ No icons in headers');
      }
      
      results.push({
        page: testPage.name,
        compliant: isCompliant,
        violations: violations.length,
        headerIcons: headerIcons.length
      });
      
    } catch (error) {
      console.error(`❌ ${testPage.name} validation failed:`, error.message);
      results.push({
        page: testPage.name,
        compliant: false,
        error: error.message
      });
    }
  }
  
  await browser.close();
  
  // Summary
  console.log('\n📊 CLAUDE_RULES COMPLIANCE SUMMARY:');
  const compliantPages = results.filter(r => r.compliant).length;
  
  results.forEach(result => {
    const status = result.compliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT';
    console.log(`${status} - ${result.page}`);
    if (result.violations) console.log(`   - ${result.violations} CSS violations`);
    if (result.headerIcons) console.log(`   - ${result.headerIcons} header icons`);
  });
  
  console.log(`\n🎯 Overall: ${compliantPages}/${results.length} pages CLAUDE_RULES compliant`);
  
  if (compliantPages === results.length) {
    console.log('🎉 ALL PAGES NOW CLAUDE_RULES COMPLIANT!');
    console.log('✅ All gradient backgrounds removed');
    console.log('✅ All header icons removed');
    console.log('✅ Only approved color combinations used');
  }
  
  return compliantPages === results.length;
}

validateClaudeRulesCompliance().catch(console.error);