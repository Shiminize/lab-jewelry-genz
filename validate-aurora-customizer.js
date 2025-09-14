// Manual validation script for Aurora CustomizerPreview section
const puppeteer = require('puppeteer');

async function validateAuroraCustomizer() {
  console.log('🧪 Starting Aurora CustomizerPreview validation...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Listen for console messages
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console error:', msg.text());
      } else if (msg.text().includes('Aurora') || msg.text().includes('material')) {
        console.log('📝', msg.text());
      }
    });
    
    console.log('🌐 Navigating to homepage...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    
    // Check if Aurora version is active
    const auroraSection = await page.$('.aurora-navigation, [class*="bg-gradient-to-br from-brand-accent"]');
    
    if (auroraSection) {
      console.log('✅ Aurora version detected');
      
      // Look for customizer section
      const customizerSection = await page.$('section:has-text("Create Your Legacy")');
      
      if (customizerSection) {
        console.log('✅ CustomizerPreview section found');
        
        // Scroll to section
        await customizerSection.scrollIntoView({ behavior: 'smooth' });
        await page.waitForTimeout(2000);
        
        // Take screenshot
        console.log('📷 Taking screenshot of Aurora customizer...');
        await page.screenshot({ 
          path: 'aurora-customizer-validation.png',
          fullPage: false,
          clip: { x: 0, y: 800, width: 1920, height: 1200 }
        });
        
        // Look for material buttons
        const materialButtons = await page.$$('button:has-text("18K Rose Gold"), button:has-text("Platinum"), button:has-text("18K White Gold"), button:has-text("18K Yellow Gold")');
        console.log(`🔘 Found ${materialButtons.length} material buttons`);
        
        if (materialButtons.length > 0) {
          console.log('🔄 Testing material interactions...');
          
          // Click each material and observe changes
          const materials = ['18K Rose Gold', 'Platinum', '18K White Gold', '18K Yellow Gold'];
          
          for (const material of materials) {
            try {
              const button = await page.$(`button:has-text("${material}")`);
              if (button) {
                console.log(`🔘 Clicking ${material}...`);
                await button.click();
                await page.waitForTimeout(1500);
                
                // Check for price display
                const priceElement = await page.$('[class*="text-3xl"]:has-text("$")');
                if (priceElement) {
                  const priceText = await priceElement.textContent();
                  console.log(`💰 ${material} price: ${priceText}`);
                }
              }
            } catch (error) {
              console.log(`⚠️ Could not test ${material}:`, error.message);
            }
          }
        }
        
        // Test stone selection
        const stoneButtons = await page.$$('button:has-text("Lab Diamond"), button:has-text("Moissanite"), button:has-text("Lab Emerald")');
        console.log(`💎 Found ${stoneButtons.length} stone buttons`);
        
        if (stoneButtons.length > 0) {
          console.log('💎 Testing stone selection...');
          const diamondButton = await page.$('button:has-text("Lab Diamond")');
          if (diamondButton) {
            await diamondButton.click();
            await page.waitForTimeout(1000);
            
            const priceElement = await page.$('[class*="text-3xl"]:has-text("$")');
            if (priceElement) {
              const priceText = await priceElement.textContent();
              console.log(`💰 Lab Diamond price: ${priceText}`);
            }
          }
        }
        
        // Final screenshot
        console.log('📷 Taking final screenshot...');
        await page.screenshot({ 
          path: 'aurora-customizer-final.png',
          fullPage: false,
          clip: { x: 0, y: 800, width: 1920, height: 1200 }
        });
        
        console.log('✅ Aurora CustomizerPreview validation completed successfully!');
        
      } else {
        console.log('❌ CustomizerPreview section not found');
      }
      
    } else {
      console.log('❌ Aurora version not detected - using legacy version');
      
      // Take debug screenshot
      await page.screenshot({ 
        path: 'customizer-debug.png',
        fullPage: true 
      });
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
  } finally {
    console.log('🔒 Closing browser...');
    await browser.close();
  }
}

// Run validation if executed directly
if (require.main === module) {
  validateAuroraCustomizer()
    .then(() => console.log('🎉 Validation complete'))
    .catch(console.error);
}

module.exports = { validateAuroraCustomizer };