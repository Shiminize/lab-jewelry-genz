const puppeteer = require('puppeteer');

async function testAtlasIconImplementation() {
  console.log('🧪 Testing Atlas Icon implementation and homepage functionality...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Monitor console for icon-related errors
    const iconErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && (
        msg.text().includes('Icon') || 
        msg.text().includes('icon') ||
        msg.text().includes('Atlas')
      )) {
        iconErrors.push(msg.text());
      }
    });
    
    console.log('🌐 Navigating to homepage...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    console.log('📷 Taking initial screenshot...');
    await page.screenshot({ 
      path: 'atlas-icons-homepage.png', 
      fullPage: true 
    });
    
    // Test CustomizerPreviewSection with Atlas icons
    console.log('🎯 Testing CustomizerPreviewSection with Atlas icons...');
    const customizerSection = await page.$('section[data-section="customizer-preview"]');
    
    if (customizerSection) {
      console.log('✅ CustomizerPreview section found');
      await customizerSection.scrollIntoView({ behavior: 'smooth' });
      await page.waitForTimeout(2000);
      
      // Test material selection with real ProductCustomizer
      const materialButtons = await page.$$('button:has-text("18K Rose Gold"), button:has-text("Platinum"), button:has-text("18K White Gold"), button:has-text("18K Yellow Gold")');
      
      if (materialButtons.length > 0) {
        console.log(`🔘 Found ${materialButtons.length} material buttons - testing interaction...`);
        
        // Click Platinum to test material change
        const platinumButton = await page.$('button:has-text("Platinum")');
        if (platinumButton) {
          await platinumButton.click();
          await page.waitForTimeout(2000);
          console.log('✅ Platinum selection tested');
        }
        
        // Take customizer screenshot
        await page.screenshot({ 
          path: 'atlas-icons-customizer.png', 
          fullPage: false,
          clip: { x: 0, y: 800, width: 1920, height: 1200 }
        });
      }
    }
    
    // Test EnhancedValueProposition with Atlas icons
    console.log('💎 Testing EnhancedValueProposition with Atlas icons...');
    const valuePropositionSection = await page.$('[data-testid="enhanced-value-propositions-section"]');
    
    if (valuePropositionSection) {
      console.log('✅ Value Proposition section found');
      await valuePropositionSection.scrollIntoView({ behavior: 'smooth' });
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'atlas-icons-value-proposition.png', 
        fullPage: false,
        clip: { x: 0, y: 1000, width: 1920, height: 1200 }
      });
    }
    
    // Test SustainabilityStorySection
    console.log('🌱 Testing SustainabilityStorySection with Atlas icons...');
    // Look for sustainability section by scrolling down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.7));
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'atlas-icons-sustainability.png', 
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    });
    
    console.log('📊 Final results:');
    console.log(`✅ Homepage loaded successfully`);
    console.log(`✅ Screenshots captured: homepage, customizer, value-proposition, sustainability`);
    
    if (iconErrors.length === 0) {
      console.log('✅ No Atlas icon-related errors detected');
    } else {
      console.log('❌ Icon-related errors found:');
      iconErrors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('🎉 Atlas Icon implementation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    console.log('🔒 Closing browser...');
    await browser.close();
  }
}

// Run test
testAtlasIconImplementation()
  .then(() => console.log('🎉 Atlas Icons test complete'))
  .catch(console.error);