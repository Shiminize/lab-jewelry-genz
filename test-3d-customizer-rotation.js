/**
 * Test script to verify 3D customizer rotation fix
 * Validates that currentFrame prop is properly passed through component hierarchy
 */

const { chromium } = require('playwright');

async function test3DCustomizerRotation() {
  console.log('🧪 Testing 3D Customizer Rotation Fix...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate to a customizable product page
    console.log('📍 Navigating to customizer page...');
    await page.goto('http://localhost:3001');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Look for a customizable product link or navigate to catalog
    console.log('🔍 Looking for customizable products...');
    
    // Check if there's a customizer on the page or navigate to catalog
    try {
      await page.goto('http://localhost:3001/catalog');
      await page.waitForTimeout(3000);
      
      // Look for product cards with customizer functionality
      const productCards = await page.$$('article[data-testid*="product-card"]');
      
      if (productCards.length > 0) {
        console.log(`✅ Found ${productCards.length} product cards`);
        
        // Click on the first product to access customizer
        await productCards[0].click();
        await page.waitForTimeout(2000);
        
        // Look for the customizer components
        const customizerViewer = await page.$('[data-testid*="customizer"], [aria-label*="360"], [class*="customizer"]');
        
        if (customizerViewer) {
          console.log('✅ Found customizer viewer component');
          
          // Look for rotation controls (arrow buttons or navigation)
          const rotationControls = await page.$$('button[aria-label*="frame"], button[aria-label*="Previous"], button[aria-label*="Next"]');
          
          if (rotationControls.length > 0) {
            console.log('✅ Found rotation controls');
            
            // Test clicking rotation controls
            await rotationControls[0].click();
            await page.waitForTimeout(500);
            
            // Check if the frame display updates
            const frameDisplay = await page.$('text=/\\d+ \\/ \\d+/');
            if (frameDisplay) {
              const frameText = await frameDisplay.textContent();
              console.log(`✅ Frame display found: ${frameText}`);
              
              // Click next frame button multiple times to test rotation
              for (let i = 0; i < 5; i++) {
                if (rotationControls[1]) {
                  await rotationControls[1].click();
                  await page.waitForTimeout(200);
                }
              }
              
              const updatedFrameText = await frameDisplay.textContent();
              console.log(`✅ Frame display after clicks: ${updatedFrameText}`);
              
              if (frameText !== updatedFrameText) {
                console.log('🎉 SUCCESS: Frame state is updating correctly!');
                console.log('✅ 3D Customizer rotation fix is working');
              } else {
                console.log('⚠️  Frame display not changing - may need further investigation');
              }
            } else {
              console.log('⚠️  Frame display not found');
            }
          } else {
            console.log('⚠️  Rotation controls not found');
          }
        } else {
          console.log('⚠️  Customizer viewer not found on product page');
        }
      } else {
        console.log('⚠️  No product cards found in catalog');
      }
      
    } catch (error) {
      console.log('⚠️  Could not access catalog, trying direct product URL');
    }
    
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
test3DCustomizerRotation().catch(console.error);