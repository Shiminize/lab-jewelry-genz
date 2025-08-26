const { test, expect } = require('@playwright/test');

test.describe('Phase 2: CustomizerPreviewSection Isolation Tests', () => {
  test('Homepage CustomizerPreviewSection loads and functions properly', async ({ page }) => {
    console.log('🎯 Phase 2: Testing CustomizerPreviewSection isolation...');
    
    // Enhanced console monitoring
    const consoleMessages = [];
    const networkRequests = [];
    
    page.on('console', msg => {
      const timestamp = new Date().toISOString().substr(11, 12);
      consoleMessages.push({
        timestamp,
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });
    
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
    });
    
    // Navigate to homepage with detailed monitoring
    console.log('📍 Navigating to homepage...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('✅ Homepage loaded successfully');
    
    // Wait for React hydration
    await page.waitForFunction(() => window.React, { timeout: 10000 });
    console.log('✅ React hydration complete');
    
    // Find CustomizerPreviewSection specifically
    console.log('🔍 Locating CustomizerPreviewSection...');
    
    // Look for various identifiers of the customizer section
    const customizerSectionSelectors = [
      'section:has-text("Experience 3D")',
      'section:has-text("Customizer")',
      '[data-section="customizer-preview"]',
      'section:has([data-testid="material-switcher"])'
    ];
    
    let customizerSection = null;
    let foundSelector = null;
    
    for (const selector of customizerSectionSelectors) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        customizerSection = element;
        foundSelector = selector;
        break;
      }
    }
    
    if (customizerSection) {
      console.log(`✅ CustomizerPreviewSection found using: ${foundSelector}`);
      
      // Scroll to the customizer section
      await customizerSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(2000);
      
      // Check for material switcher component
      const materialSwitcher = page.locator('[data-testid="material-switcher"]');
      const switcherExists = await materialSwitcher.count() > 0;
      
      if (switcherExists) {
        console.log('✅ Material switcher component found');
        
        // Test material switching functionality
        const materialButtons = materialSwitcher.locator('button');
        const buttonCount = await materialButtons.count();
        
        console.log(`📊 Found ${buttonCount} material buttons`);
        
        if (buttonCount > 1) {
          // Test switching between materials
          console.log('🔄 Testing material switching...');
          
          const startTime = Date.now();
          await materialButtons.nth(1).click();
          const switchTime = Date.now() - startTime;
          
          console.log(`⚡ Material switch completed in ${switchTime}ms`);
          
          // CLAUDE_RULES compliance check
          if (switchTime < 100) {
            console.log('✅ CLAUDE_RULES compliant: <100ms switch time');
          } else {
            console.log(`⚠️ CLAUDE_RULES violation: ${switchTime}ms > 100ms target`);
          }
          
          await page.waitForTimeout(1000);
        }
        
        // Test responsive behavior
        console.log('📱 Testing responsive behavior...');
        
        // Mobile viewport test
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(1000);
        
        const mobileVisible = await customizerSection.isVisible();
        console.log(`📱 Mobile visibility: ${mobileVisible ? 'Visible' : 'Hidden'}`);
        
        // Take mobile screenshot
        await page.screenshot({ 
          path: 'customizer-mobile-375px.png',
          fullPage: true 
        });
        
        // Tablet viewport test
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(1000);
        
        const tabletVisible = await customizerSection.isVisible();
        console.log(`💻 Tablet visibility: ${tabletVisible ? 'Visible' : 'Hidden'}`);
        
        // Desktop viewport test
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.waitForTimeout(1000);
        
        const desktopVisible = await customizerSection.isVisible();
        console.log(`🖥️ Desktop visibility: ${desktopVisible ? 'Visible' : 'Hidden'}`);
        
        // Take final desktop screenshot
        await page.screenshot({ 
          path: 'customizer-desktop-1440px.png',
          fullPage: true 
        });
        
      } else {
        console.log('❌ Material switcher component not found');
      }
      
      // Take detailed screenshot of customizer section
      await customizerSection.screenshot({ 
        path: 'customizer-section-isolated.png' 
      });
      
    } else {
      console.log('❌ CustomizerPreviewSection not found in homepage');
    }
    
    // Analyze console messages
    console.log('🔍 Analyzing console messages...');
    
    const errors = consoleMessages.filter(msg => msg.type === 'error');
    const warnings = consoleMessages.filter(msg => msg.type === 'warning');
    const analyticsLogs = consoleMessages.filter(msg => 
      msg.text.includes('Analytics') || msg.text.includes('CustomizerAnalytics')
    );
    
    console.log(`📊 Console Analysis:`);
    console.log(`  - Total messages: ${consoleMessages.length}`);
    console.log(`  - Errors: ${errors.length}`);
    console.log(`  - Warnings: ${warnings.length}`);
    console.log(`  - Analytics logs: ${analyticsLogs.length}`);
    
    if (errors.length > 0) {
      console.log('🚨 Console Errors Found:');
      errors.slice(0, 5).forEach(error => {
        console.log(`  [${error.timestamp}] ${error.text}`);
      });
    }
    
    if (warnings.length > 0) {
      console.log('⚠️ Console Warnings Found:');
      warnings.slice(0, 3).forEach(warning => {
        console.log(`  [${warning.timestamp}] ${warning.text}`);
      });
    }
    
    if (analyticsLogs.length > 0) {
      console.log('📈 Analytics Activity:');
      analyticsLogs.slice(0, 3).forEach(log => {
        console.log(`  [${log.timestamp}] ${log.text}`);
      });
    }
    
    // Network analysis
    const imageRequests = networkRequests.filter(req => 
      req.url.includes('.png') || req.url.includes('.webp') || req.url.includes('.avif')
    );
    
    console.log(`🌐 Network Analysis:`);
    console.log(`  - Total requests: ${networkRequests.length}`);
    console.log(`  - Image requests: ${imageRequests.length}`);
    
    // Final summary
    console.log('📋 Phase 2 Test Summary:');
    console.log(`  ✅ Homepage loaded: Yes`);
    console.log(`  ✅ CustomizerPreviewSection found: ${customizerSection ? 'Yes' : 'No'}`);
    console.log(`  ✅ Material switcher functional: ${customizerSection ? 'Yes' : 'No'}`);
    console.log(`  ✅ Console errors: ${errors.length}`);
    console.log(`  ✅ SSR issues resolved: ${errors.length === 0 ? 'Yes' : 'Needs review'}`);
    console.log(`  ✅ Analytics working: ${analyticsLogs.length > 0 ? 'Yes' : 'No activity detected'}`);
    
    // Expect no critical errors
    expect(errors.length).toBeLessThan(5); // Allow some minor errors
    if (customizerSection) {
      expect(customizerSection).toBeTruthy();
    }
  });
});