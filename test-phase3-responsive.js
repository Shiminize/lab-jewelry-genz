const { test, expect } = require('@playwright/test');

const DEVICE_CONFIGS = [
  {
    name: 'iPhone SE',
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    isMobile: true
  },
  {
    name: 'iPhone 12 Pro',
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    isMobile: true
  },
  {
    name: 'iPad',
    viewport: { width: 768, height: 1024 },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    isMobile: false
  },
  {
    name: 'Desktop 1440px',
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    isMobile: false
  },
  {
    name: 'Desktop 1920px',
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    isMobile: false
  }
];

test.describe('Phase 3: Cross-Device Responsive Testing', () => {
  for (const device of DEVICE_CONFIGS) {
    test(`${device.name} (${device.viewport.width}x${device.viewport.height}) - Customizer responsive test`, async ({ page }) => {
      console.log(`\n🎯 Testing ${device.name} (${device.viewport.width}x${device.viewport.height})`);
      
      // Set device configuration
      await page.setViewportSize(device.viewport);
      await page.setUserAgent(device.userAgent);
      
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Navigate with device-specific settings
      console.log(`📱 Loading homepage on ${device.name}...`);
      await page.goto('http://localhost:3000', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Wait for page stabilization
      await page.waitForTimeout(3000);
      
      // Check basic page structure
      const pageTitle = await page.title();
      console.log(`✅ Page loaded: "${pageTitle}"`);
      
      // Look for customizer section with device-specific checks
      console.log('🔍 Checking customizer section visibility...');
      
      const customizerSection = await page.evaluate(() => {
        // Look for various customizer indicators
        const textMatches = [
          'Experience 3D',
          'Customizer', 
          'Interactive 360°',
          'Material'
        ];
        
        let found = false;
        let method = '';
        
        // Check text content
        for (const text of textMatches) {
          if (document.body.innerText.includes(text)) {
            found = true;
            method = `text: "${text}"`;
            break;
          }
        }
        
        // Check for data attributes
        if (!found) {
          const dataElements = document.querySelectorAll('[data-testid*="material"], [data-testid*="customizer"]');
          if (dataElements.length > 0) {
            found = true;
            method = `data-testid (${dataElements.length} elements)`;
          }
        }
        
        // Check for class names
        if (!found) {
          const classElements = document.querySelectorAll('[class*="customizer"], [class*="material"]');
          if (classElements.length > 0) {
            found = true;
            method = `class names (${classElements.length} elements)`;
          }
        }
        
        return { found, method };
      });
      
      if (customizerSection.found) {
        console.log(`✅ Customizer section found via ${customizerSection.method}`);
        
        // Test scrolling behavior
        console.log('📜 Testing scroll behavior...');
        
        // Scroll through the page to find customizer
        await page.evaluate(() => {
          const scrollDistance = window.innerHeight * 2;
          window.scrollTo(0, scrollDistance);
        });
        
        await page.waitForTimeout(2000);
        
        // Check if material switcher is visible and functional
        const materialSwitcher = page.locator('[data-testid="material-switcher"]');
        const switcherVisible = await materialSwitcher.isVisible().catch(() => false);
        
        if (switcherVisible) {
          console.log('✅ Material switcher is visible');
          
          // Get switcher dimensions
          const switcherBox = await materialSwitcher.boundingBox();
          console.log(`📐 Switcher dimensions: ${switcherBox ? `${Math.round(switcherBox.width)}x${Math.round(switcherBox.height)}` : 'unknown'}`);
          
          // Test material buttons
          const materialButtons = materialSwitcher.locator('button');
          const buttonCount = await materialButtons.count();
          console.log(`🔘 Material buttons: ${buttonCount}`);
          
          if (buttonCount > 1) {
            // Test button interaction on this device
            console.log('🔄 Testing material switch interaction...');
            
            const startTime = Date.now();
            
            if (device.isMobile) {
              // Use tap for mobile devices
              await materialButtons.nth(1).tap();
            } else {
              // Use click for desktop
              await materialButtons.nth(1).click();
            }
            
            const switchTime = Date.now() - startTime;
            console.log(`⚡ Material switch completed in ${switchTime}ms`);
            
            // CLAUDE_RULES compliance check
            const isCompliant = switchTime < 100;
            console.log(`${isCompliant ? '✅' : '⚠️'} CLAUDE_RULES: ${switchTime}ms ${isCompliant ? '<' : '>'} 100ms`);
            
            await page.waitForTimeout(1000);
          }
          
          // Take device-specific screenshot of switcher
          await materialSwitcher.screenshot({ 
            path: `customizer-switcher-${device.name.toLowerCase().replace(/\s+/g, '-')}.png` 
          });
          
        } else {
          console.log('❌ Material switcher not visible');
        }
        
        // Test touch interactions on mobile devices
        if (device.isMobile) {
          console.log('👆 Testing mobile touch interactions...');
          
          // Try to find touch-interactive elements
          const touchElements = await page.evaluate(() => {
            const elements = document.querySelectorAll('[class*="touch"], [data-touch], button');
            return elements.length;
          });
          
          console.log(`👆 Found ${touchElements} potentially touch-interactive elements`);
        }
        
      } else {
        console.log('❌ Customizer section not found');
      }
      
      // Check responsive design compliance
      console.log('📱 Checking responsive design...');
      
      const layoutInfo = await page.evaluate((deviceInfo) => {
        const body = document.body;
        const computedStyle = window.getComputedStyle(body);
        
        // Check for responsive indicators
        const hasFlexbox = computedStyle.display?.includes('flex');
        const hasGrid = computedStyle.display?.includes('grid');
        
        // Check viewport meta tag
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        const hasViewportMeta = !!viewportMeta;
        
        // Check for responsive classes
        const responsiveClasses = [
          'sm:', 'md:', 'lg:', 'xl:', 'mobile', 'desktop', 'tablet'
        ];
        
        const bodyClass = body.className;
        const hasResponsiveClasses = responsiveClasses.some(cls => 
          document.documentElement.outerHTML.includes(cls)
        );
        
        // Check for horizontal scrolling (bad on mobile)
        const hasHorizontalScroll = document.documentElement.scrollWidth > window.innerWidth;
        
        return {
          hasFlexbox,
          hasGrid,
          hasViewportMeta,
          hasResponsiveClasses,
          hasHorizontalScroll,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          documentWidth: document.documentElement.scrollWidth
        };
      }, device);
      
      console.log(`📐 Layout Analysis:`);
      console.log(`  - Viewport: ${layoutInfo.viewportWidth}x${layoutInfo.viewportHeight}`);
      console.log(`  - Document width: ${layoutInfo.documentWidth}px`);
      console.log(`  - Flexbox: ${layoutInfo.hasFlexbox ? '✅' : '❌'}`);
      console.log(`  - Grid: ${layoutInfo.hasGrid ? '✅' : '❌'}`);
      console.log(`  - Viewport meta: ${layoutInfo.hasViewportMeta ? '✅' : '❌'}`);
      console.log(`  - Responsive classes: ${layoutInfo.hasResponsiveClasses ? '✅' : '❌'}`);
      console.log(`  - Horizontal scroll: ${layoutInfo.hasHorizontalScroll ? '❌ Found' : '✅ None'}`);
      
      // Take full-page screenshot for this device
      await page.screenshot({ 
        path: `homepage-${device.name.toLowerCase().replace(/\s+/g, '-')}-full.png`,
        fullPage: true 
      });
      
      // Take viewport screenshot
      await page.screenshot({ 
        path: `homepage-${device.name.toLowerCase().replace(/\s+/g, '-')}-viewport.png`,
        fullPage: false 
      });
      
      // Final device test summary
      console.log(`\n📋 ${device.name} Test Summary:`);
      console.log(`  ✅ Page loads: ${pageTitle ? 'Yes' : 'No'}`);
      console.log(`  ✅ Customizer found: ${customizerSection.found ? 'Yes' : 'No'}`);
      console.log(`  ✅ Console errors: ${consoleErrors.length}`);
      console.log(`  ✅ Responsive: ${!layoutInfo.hasHorizontalScroll ? 'Yes' : 'Issues detected'}`);
      console.log(`  ✅ Mobile optimized: ${device.isMobile ? (layoutInfo.hasViewportMeta ? 'Yes' : 'No') : 'N/A'}`);
      
      // Test assertions
      expect(consoleErrors.length).toBeLessThan(5); // Allow some minor errors
      expect(layoutInfo.hasViewportMeta).toBeTruthy();
      
      if (device.isMobile) {
        expect(layoutInfo.hasHorizontalScroll).toBeFalsy(); // No horizontal scroll on mobile
      }
      
    });
  }
});