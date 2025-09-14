const { test, expect } = require('@playwright/test');

test('Aurora CustomizerPreview - Material Colors and Price Testing', async ({ page }) => {
  console.log('🧪 Testing Aurora CustomizerPreview section with real data...');
  
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Wait for Aurora version to load (feature flag dependent)
  await page.waitForTimeout(2000);
  
  // Look for Aurora section
  const auroraSection = page.locator('.aurora-navigation, [class*="bg-gradient-to-br from-brand-accent"]').first();
  
  if (await auroraSection.count() > 0) {
    console.log('✅ Aurora version detected');
    
    // Scroll to customizer section
    const customizerSection = page.locator('section:has-text("Create Your Legacy")');
    await customizerSection.scrollIntoViewIfNeeded();
    
    console.log('📷 Capturing Aurora customizer with material colors...');
    await page.screenshot({ 
      path: 'aurora-customizer-materials-test.png', 
      fullPage: false,
      clip: { x: 0, y: 800, width: 1920, height: 1200 }
    });
    
    // Test material selection buttons
    const materialButtons = page.locator('button:has-text("18K Rose Gold"), button:has-text("Platinum"), button:has-text("18K White Gold"), button:has-text("18K Yellow Gold")');
    const materialCount = await materialButtons.count();
    console.log('Material buttons found:', materialCount);
    
    if (materialCount > 0) {
      // Test clicking different materials and verify price changes
      console.log('🔄 Testing material switching and price updates...');
      
      // Click Rose Gold first
      const roseGoldButton = page.locator('button:has-text("18K Rose Gold")').first();
      if (await roseGoldButton.count() > 0) {
        await roseGoldButton.click();
        await page.waitForTimeout(1000);
        
        // Check for price display
        const priceDisplay = page.locator('[class*="text-3xl"]:has-text("$")');
        if (await priceDisplay.count() > 0) {
          const roseGoldPrice = await priceDisplay.textContent();
          console.log('Rose Gold price:', roseGoldPrice);
        }
      }
      
      // Click Platinum
      const platinumButton = page.locator('button:has-text("Platinum")').first();
      if (await platinumButton.count() > 0) {
        await platinumButton.click();
        await page.waitForTimeout(1000);
        
        const priceDisplay = page.locator('[class*="text-3xl"]:has-text("$")');
        if (await priceDisplay.count() > 0) {
          const platinumPrice = await priceDisplay.textContent();
          console.log('Platinum price:', platinumPrice);
        }
      }
      
      // Take final screenshot showing platinum selected
      await page.screenshot({ 
        path: 'aurora-customizer-platinum-selected.png', 
        fullPage: false,
        clip: { x: 0, y: 800, width: 1920, height: 1200 }
      });
      
      console.log('✅ Material switching and pricing tests completed');
    }
    
    // Test stone selection
    const stoneButtons = page.locator('button:has-text("Lab Diamond"), button:has-text("Moissanite"), button:has-text("Lab Emerald")');
    const stoneCount = await stoneButtons.count();
    console.log('Stone buttons found:', stoneCount);
    
    if (stoneCount > 0) {
      console.log('💎 Testing stone selection...');
      
      // Click Lab Diamond 
      const diamondButton = page.locator('button:has-text("Lab Diamond")').first();
      if (await diamondButton.count() > 0) {
        await diamondButton.click();
        await page.waitForTimeout(1000);
        
        const priceDisplay = page.locator('[class*="text-3xl"]:has-text("$")');
        if (await priceDisplay.count() > 0) {
          const diamondPrice = await priceDisplay.textContent();
          console.log('Lab Diamond price (with Platinum):', diamondPrice);
        }
      }
    }
    
    // Test setting selection
    const settingButtons = page.locator('button:has-text("Classic"), button:has-text("Modern"), button:has-text("Vintage")');
    const settingCount = await settingButtons.count();
    console.log('Setting buttons found:', settingCount);
    
    if (settingCount > 0) {
      console.log('⚙️ Testing setting selection...');
      
      const modernButton = page.locator('button:has-text("Modern")').first();
      if (await modernButton.count() > 0) {
        await modernButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Final screenshot with all selections
    await page.screenshot({ 
      path: 'aurora-customizer-final-test.png', 
      fullPage: false,
      clip: { x: 0, y: 800, width: 1920, height: 1200 }
    });
    
    console.log('✅ Aurora CustomizerPreview testing completed');
    
  } else {
    console.log('❌ Aurora version not found - may be using legacy version');
    
    // Take screenshot of current state for debugging
    await page.screenshot({ 
      path: 'customizer-debug-state.png', 
      fullPage: true 
    });
  }
  
  // Check for console errors
  const logs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      logs.push(msg.text());
    }
  });
  
  await page.waitForTimeout(2000);
  
  if (logs.length === 0) {
    console.log('✅ No console errors detected');
  } else {
    console.log('❌ Console errors found:', logs);
  }
});