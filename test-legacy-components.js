const fetch = require('node-fetch');

async function testLegacyComponents() {
  const baseURL = 'http://localhost:3000';
  const pages = ['/care', '/referral', '/sizing', '/quality'];
  
  console.log('🧪 Testing Legacy Components Integration...\n');
  
  for (const page of pages) {
    try {
      console.log(`Testing ${page}...`);
      const response = await fetch(`${baseURL}${page}`);
      
      if (response.status === 200) {
        const html = await response.text();
        
        // Check for key elements
        const checks = {
          'Has title': html.includes('<title>'),
          'Has header navigation': html.includes('CARE') || html.includes('SIZING') || html.includes('REFERRAL') || html.includes('QUALITY'),
          'Has hero section': html.includes('h1'),
          'Uses CLAUDE_RULES colors': html.includes('text-foreground') && html.includes('bg-background'),
          'No deprecated colors': !html.includes('text-purple-600') && !html.includes('bg-blue-50')
        };
        
        console.log(`  ✅ Page loads (${response.status})`);
        
        Object.entries(checks).forEach(([check, passed]) => {
          console.log(`  ${passed ? '✅' : '❌'} ${check}`);
        });
        
      } else {
        console.log(`  ❌ Page failed to load (${response.status})`);
      }
    } catch (error) {
      console.log(`  ❌ Error testing ${page}:`, error.message);
    }
    console.log('');
  }
  
  console.log('🎉 Legacy Components Testing Complete!');
}

testLegacyComponents();