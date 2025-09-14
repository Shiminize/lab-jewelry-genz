const puppeteer = require('puppeteer');

async function test3DPreviewFunctionality() {
  console.log('🧪 Testing 3D Preview functionality...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Listen for console messages and errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console error:', msg.text());
      }
    });
    
    console.log('🌐 Navigating to homepage...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    
    // Look for Aurora customizer section
    const customizerSection = await page.$('section:has-text("Create Your Legacy")');
    
    if (customizerSection) {
      console.log('✅ CustomizerPreview section found');
      
      // Scroll to section
      await customizerSection.scrollIntoView({ behavior: 'smooth' });
      await page.waitForTimeout(2000);
      
      // Take initial screenshot
      console.log('📷 Taking initial screenshot...');
      await page.screenshot({ 
        path: '3d-preview-initial.png',
        fullPage: false,
        clip: { x: 0, y: 800, width: 1920, height: 1200 }
      });
      
      // Test material buttons
      console.log('🔘 Testing material selection...');
      const materialButtons = await page.$$('button:has-text("18K Rose Gold"), button:has-text("Platinum"), button:has-text("18K White Gold"), button:has-text("18K Yellow Gold")');
      console.log(`Found ${materialButtons.length} material buttons`);
      
      if (materialButtons.length > 0) {
        // Test clicking different materials
        const materials = [
          { name: '18K Rose Gold', expected: '359' },
          { name: 'Platinum', expected: '449' },
          { name: '18K White Gold', expected: '329' },
          { name: '18K Yellow Gold', expected: '299' }
        ];
        
        for (const material of materials) {
          console.log(`🔄 Testing ${material.name}...`);
          
          const button = await page.$(`button:has-text("${material.name}")`);
          if (button) {
            await button.click();
            await page.waitForTimeout(2000); // Wait for 3D viewer and price update
            
            // Check if price updated
            const priceElement = await page.$('[class*="text-3xl"]:has-text("$")');
            if (priceElement) {
              const priceText = await priceElement.textContent();
              console.log(`💰 ${material.name} price: ${priceText}`);
            }
            
            // Take screenshot for each material
            await page.screenshot({ 
              path: `3d-preview-${material.name.replace(/\s+/g, '-').toLowerCase()}.png`,
              fullPage: false,
              clip: { x: 0, y: 800, width: 1920, height: 1200 }
            });
          }
        }
      }
      
      // Test stone selection
      console.log('💎 Testing stone selection...');
      const stoneButtons = await page.$$('button:has-text("Lab Diamond"), button:has-text("Moissanite"), button:has-text("Lab Emerald")');
      console.log(`Found ${stoneButtons.length} stone buttons`);
      
      if (stoneButtons.length > 0) {
        // Click Lab Diamond to test premium pricing
        const diamondButton = await page.$('button:has-text("Lab Diamond")');
        if (diamondButton) {
          console.log('💎 Testing Lab Diamond selection...');
          await diamondButton.click();
          await page.waitForTimeout(2000);
          
          const priceElement = await page.$('[class*="text-3xl"]:has-text("$")');
          if (priceElement) {
            const priceText = await priceElement.textContent();
            console.log(`💰 Lab Diamond price: ${priceText}`);
          }
        }
      }
      
      // Check for 3D viewer
      console.log('🎯 Checking for ProductCustomizer component...');
      const productCustomizer = await page.$('[class*="aspect-square"]');
      
      if (productCustomizer) {
        console.log('✅ ProductCustomizer component found');
        
        // Take final screenshot showing the complete integration
        await page.screenshot({ 
          path: '3d-preview-final-integration.png',
          fullPage: false,
          clip: { x: 0, y: 800, width: 1920, height: 1200 }
        });
        
        console.log('✅ 3D Preview functionality test completed successfully!');
      } else {
        console.log('❌ ProductCustomizer component not found');
      }
      
    } else {
      console.log('❌ CustomizerPreview section not found');
      
      // Take debug screenshot
      await page.screenshot({ 
        path: '3d-preview-debug.png',
        fullPage: true 
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    console.log('🔒 Closing browser...');
    await browser.close();
  }
}

// Run test
test3DPreviewFunctionality()
  .then(() => console.log('🎉 Test complete'))
  .catch(console.error);