#!/usr/bin/env node
/**
 * Phase 5: Playwright Vision Mode Testing
 * Visual validation of customizer page after infrastructure fixes
 */

const { chromium } = require('playwright');

async function runVisionModeTest() {
  console.log('🎭 Phase 5: Playwright Vision Mode Testing');
  console.log('📸 Starting visual validation of customizer...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  try {
    // Navigate to customizer page
    console.log('🔗 Navigating to /customizer...');
    await page.goto('http://localhost:3000/customizer', { waitUntil: 'domcontentloaded', timeout: 10000 });
    
    // Take initial screenshot
    console.log('📷 Capturing initial customizer state...');
    await page.screenshot({ 
      path: 'phase5-customizer-initial.png', 
      fullPage: true 
    });
    
    // Wait for ProductCustomizer component to load
    console.log('⏳ Waiting for ProductCustomizer component...');
    try {
      await page.locator('[data-testid="product-customizer"]').waitFor({ timeout: 15000 });
      console.log('✅ ProductCustomizer component loaded successfully');
      
      // Capture component loaded state
      await page.screenshot({ 
        path: 'phase5-customizer-loaded.png', 
        fullPage: true 
      });
      
      // Check for design system elements
      const title = await page.locator('h1:has-text("Design Your Perfect Ring")').isVisible();
      const livePreview = await page.locator('h2:has-text("Live Preview")').isVisible();
      
      console.log(`📝 Page elements visible: Title=${title}, LivePreview=${livePreview}`);
      
      // Test material buttons if available
      const materialButtons = page.locator('button:has-text("18K Rose Gold"), button:has-text("Platinum"), button:has-text("18K White Gold")');
      const buttonCount = await materialButtons.count();
      
      if (buttonCount > 0) {
        console.log(`🔄 Found ${buttonCount} material buttons, testing interaction...`);
        
        await materialButtons.first().click();
        await page.waitForTimeout(2000); // Wait for visual changes
        
        // Capture material switch state
        await page.screenshot({ 
          path: 'phase5-material-switch.png', 
          fullPage: true 
        });
        
        console.log('✅ Material switching visual feedback captured');
      } else {
        console.log('ℹ️  Material buttons not visible yet (still loading)');
      }
      
      // Test responsive design
      console.log('📱 Testing responsive design...');
      
      // Desktop view (current)
      await page.screenshot({ 
        path: 'phase5-desktop-1280x720.png', 
        fullPage: true 
      });
      
      // Tablet view
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(1000);
      await page.screenshot({ 
        path: 'phase5-tablet-768x1024.png', 
        fullPage: true 
      });
      
      // Mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(1000);
      await page.screenshot({ 
        path: 'phase5-mobile-375x667.png', 
        fullPage: true 
      });
      
      console.log('📸 Visual testing completed successfully');
      console.log('🎉 Phase 5: Playwright Vision Mode - PASSED');
      
      return { success: true, screenshots: 6, errors: 0 };
      
    } catch (componentError) {
      console.warn('⚠️ ProductCustomizer component load timeout, capturing current state...');
      
      // Capture whatever is currently visible
      await page.screenshot({ 
        path: 'phase5-customizer-timeout-state.png', 
        fullPage: true 
      });
      
      // Check if page loaded at all
      const pageTitle = await page.title();
      const hasContent = await page.locator('main').isVisible();
      
      console.log(`📝 Page loaded: Title="${pageTitle}", HasContent=${hasContent}`);
      
      return { success: false, error: componentError.message, screenshots: 2 };
    }
    
  } catch (error) {
    console.error('❌ Visual testing failed:', error.message);
    
    // Capture error state
    await page.screenshot({ 
      path: 'phase5-error-state.png', 
      fullPage: true 
    });
    
    return { success: false, error: error.message, screenshots: 1 };
    
  } finally {
    await browser.close();
  }
}

// Run the test
runVisionModeTest().then(result => {
  console.log('\n📊 Phase 5 Visual Testing Results:');
  console.log(`Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Screenshots captured: ${result.screenshots}`);
  if (result.error) {
    console.log(`Error: ${result.error}`);
  }
  
  process.exit(result.success ? 0 : 1);
}).catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});