const puppeteer = require('puppeteer');

async function testCustomizerVisual() {
  console.log('🚀 Starting Customizer Visual Test...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Visual test
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Monitor console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const timestamp = new Date().toISOString().substr(11, 8);
    consoleMessages.push({
      timestamp,
      type: msg.type(),
      text: msg.text()
    });
    console.log(`[${timestamp}] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
  
  try {
    console.log('📍 Navigating to homepage...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('✅ Homepage loaded');
    
    // Wait for React
    await page.waitForFunction(() => typeof window.React !== 'undefined', { timeout: 10000 });
    console.log('✅ React loaded');
    
    // Look for customizer section
    console.log('🔍 Looking for customizer section...');
    
    const customizerFound = await page.evaluate(() => {
      // Look for text indicators
      const textIndicators = [
        'Experience 3D',
        'Customizer',
        'Interactive 360°',
        '3D Jewelry'
      ];
      
      for (const text of textIndicators) {
        if (document.body.innerText.includes(text)) {
          return { found: true, indicator: text };
        }
      }
      
      // Look for data attributes
      const dataElements = document.querySelectorAll('[data-testid*="material"], [data-section*="customizer"]');
      if (dataElements.length > 0) {
        return { found: true, indicator: `data-attributes (${dataElements.length} elements)` };
      }
      
      return { found: false, indicator: null };
    });
    
    if (customizerFound.found) {
      console.log(`✅ Customizer section found via: ${customizerFound.indicator}`);
      
      // Scroll to find it
      await page.evaluate(() => {
        const scrollStep = 500;
        let currentScroll = 0;
        const maxScroll = document.body.scrollHeight;
        
        const scrollInterval = setInterval(() => {
          window.scrollBy(0, scrollStep);
          currentScroll += scrollStep;
          
          if (currentScroll >= maxScroll) {
            clearInterval(scrollInterval);
          }
        }, 100);
      });
      
      await page.waitForTimeout(3000);
      
      // Take screenshots at different scroll positions
      console.log('📸 Taking visual screenshots...');
      
      // Full page screenshot
      await page.screenshot({ 
        path: 'homepage-full-visual.png', 
        fullPage: true 
      });
      
      // Try to find and screenshot material switcher
      const materialSwitcher = await page.$('[data-testid="material-switcher"]');
      if (materialSwitcher) {
        console.log('✅ Material switcher found');
        await materialSwitcher.screenshot({ path: 'material-switcher-visual.png' });
        
        // Test interaction
        const buttons = await materialSwitcher.$$('button');
        console.log(`📊 Found ${buttons.length} material buttons`);
        
        if (buttons.length > 1) {
          console.log('🔄 Testing material switch...');
          const startTime = Date.now();
          await buttons[1].click();
          const switchTime = Date.now() - startTime;
          
          console.log(`⚡ Material switch: ${switchTime}ms`);
          
          await page.waitForTimeout(2000);
          await materialSwitcher.screenshot({ path: 'material-switcher-after-switch.png' });
        }
      } else {
        console.log('❌ Material switcher not found');
      }
      
    } else {
      console.log('❌ Customizer section not found');
    }
    
    // Final analysis
    const errors = consoleMessages.filter(msg => msg.type === 'error');
    const warnings = consoleMessages.filter(msg => msg.type === 'warning');
    const analyticsLogs = consoleMessages.filter(msg => 
      msg.text.includes('Analytics') || msg.text.includes('📊')
    );
    
    console.log('\n📋 Test Results Summary:');
    console.log(`✅ Homepage loaded: Yes`);
    console.log(`✅ Customizer found: ${customizerFound.found ? 'Yes' : 'No'}`);
    console.log(`✅ Console errors: ${errors.length}`);
    console.log(`✅ Console warnings: ${warnings.length}`);
    console.log(`✅ Analytics activity: ${analyticsLogs.length} logs`);
    
    if (errors.length > 0) {
      console.log('\n🚨 Errors:');
      errors.slice(0, 3).forEach(error => {
        console.log(`  - ${error.text}`);
      });
    }
    
    if (analyticsLogs.length > 0) {
      console.log('\n📊 Analytics Activity:');
      analyticsLogs.slice(0, 3).forEach(log => {
        console.log(`  - ${log.text}`);
      });
    }
    
    // Keep browser open for manual inspection
    console.log('\n🔍 Browser kept open for manual inspection...');
    console.log('Press Ctrl+C when done.');
    
    // Wait indefinitely until process is killed
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Browser will be closed when process exits
  }
}

testCustomizerVisual().catch(console.error);