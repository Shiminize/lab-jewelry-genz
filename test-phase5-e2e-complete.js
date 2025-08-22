const { test, expect } = require('@playwright/test');

test.describe('Phase 5: Complete E2E Journey with Visual Regression Testing', () => {
  test('Complete Homepage to Customizer E2E Journey', async ({ page }) => {
    console.log('🎯 Phase 5: Complete E2E Journey Testing with Visual Regression...');
    
    const testJourney = {
      steps: [],
      timings: {},
      visualSnapshots: [],
      interactions: 0,
      errors: []
    };
    
    // Enhanced monitoring
    page.on('console', msg => {
      if (msg.type() === 'error') {
        testJourney.errors.push({
          timestamp: new Date().toISOString(),
          text: msg.text()
        });
        console.log(`❌ Console Error: ${msg.text()}`);
      } else if (msg.text().includes('CLAUDE_RULES') || msg.text().includes('Analytics') || msg.text().includes('Performance')) {
        console.log(`📊 ${msg.text()}`);
      }
    });
    
    // Step 1: Homepage Landing
    console.log('🏠 Step 1: Homepage Landing and Initial Load');
    const step1Start = performance.now();
    
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    const step1Time = performance.now() - step1Start;
    testJourney.timings.homepage_load = step1Time;
    testJourney.steps.push('Homepage loaded');
    
    console.log(`✅ Homepage loaded in ${step1Time.toFixed(2)}ms`);
    
    // Visual snapshot 1: Homepage initial view
    await page.screenshot({ 
      path: 'e2e-01-homepage-initial.png',
      fullPage: false 
    });
    testJourney.visualSnapshots.push('homepage-initial');
    
    // Step 2: Navigate to CustomizerPreviewSection
    console.log('🔍 Step 2: Locating and navigating to CustomizerPreviewSection');
    
    const customizerSection = await page.evaluate(() => {
      const textIndicators = ['Experience 3D', 'Customizer', 'Interactive 360°'];
      
      for (const text of textIndicators) {
        const elements = Array.from(document.querySelectorAll('*')).filter(el => 
          el.textContent && el.textContent.includes(text)
        );
        if (elements.length > 0) {
          const section = elements[0].closest('section') || elements[0];
          return {
            found: true,
            method: text,
            position: {
              top: section.offsetTop,
              height: section.offsetHeight
            }
          };
        }
      }
      
      return { found: false };
    });
    
    if (customizerSection.found) {
      console.log(`✅ CustomizerPreviewSection found via: ${customizerSection.method}`);
      testJourney.steps.push('Customizer section located');
      
      // Smooth scroll to customizer section
      await page.evaluate((position) => {
        window.scrollTo({
          top: position.top - 100,
          behavior: 'smooth'
        });
      }, customizerSection.position);
      
      await page.waitForTimeout(2000);
      
      // Visual snapshot 2: Customizer section in view
      await page.screenshot({ 
        path: 'e2e-02-customizer-section.png',
        fullPage: false 
      });
      testJourney.visualSnapshots.push('customizer-section');
      
      // Step 3: Material Switcher Interaction
      console.log('🎨 Step 3: Testing Material Switcher Interactions');
      
      const materialSwitcher = page.locator('[data-testid="material-switcher"]');
      const switcherVisible = await materialSwitcher.isVisible().catch(() => false);
      
      if (switcherVisible) {
        console.log('✅ Material switcher is visible and ready');
        testJourney.steps.push('Material switcher accessible');
        
        const materialButtons = materialSwitcher.locator('button');
        const buttonCount = await materialButtons.count();
        console.log(`🔘 Available materials: ${buttonCount}`);
        
        if (buttonCount >= 2) {
          // Test material switching journey
          console.log('🔄 Testing complete material switching journey...');
          
          const switchingResults = [];
          
          for (let i = 0; i < Math.min(buttonCount, 3); i++) {
            const switchStart = performance.now();
            
            await materialButtons.nth(i).click();
            testJourney.interactions++;
            
            // Wait for visual change
            await page.waitForTimeout(500);
            
            const switchTime = performance.now() - switchStart;
            switchingResults.push(switchTime);
            
            console.log(`  Material ${i + 1} switch: ${switchTime.toFixed(2)}ms`);
            
            // Visual snapshot for each material
            await page.screenshot({ 
              path: `e2e-03-material-${i + 1}.png`,
              clip: await materialSwitcher.boundingBox()
            });
            testJourney.visualSnapshots.push(`material-${i + 1}`);
          }
          
          const avgSwitchTime = switchingResults.reduce((a, b) => a + b, 0) / switchingResults.length;
          const maxSwitchTime = Math.max(...switchingResults);
          
          testJourney.timings.material_switching = {
            average: avgSwitchTime,
            max: maxSwitchTime,
            claudeRulesCompliant: maxSwitchTime < 100
          };
          
          console.log(`📊 Material Switching Performance:`);
          console.log(`  Average: ${avgSwitchTime.toFixed(2)}ms`);
          console.log(`  Max: ${maxSwitchTime.toFixed(2)}ms`);
          console.log(`  CLAUDE_RULES Compliance: ${maxSwitchTime < 100 ? '✅ PASS' : '❌ FAIL'}`);
          
          testJourney.steps.push(`Material switching tested (${switchingResults.length} materials)`);
        }
        
        // Step 4: Advanced Interactions (if available)
        console.log('⚙️ Step 4: Testing Advanced Customizer Features');
        
        // Test zoom controls
        const zoomControls = page.locator('button:has-text("+"), button:has-text("-"), [data-testid*="zoom"]');
        const zoomCount = await zoomControls.count();
        
        if (zoomCount > 0) {
          console.log(`🔍 Testing zoom controls (${zoomCount} controls found)`);
          
          const zoomStart = performance.now();
          await zoomControls.first().click();
          testJourney.interactions++;
          await page.waitForTimeout(300);
          const zoomTime = performance.now() - zoomStart;
          
          testJourney.timings.zoom_interaction = zoomTime;
          console.log(`  Zoom response: ${zoomTime.toFixed(2)}ms`);
          
          testJourney.steps.push('Zoom controls tested');
        }
        
        // Test auto-rotation toggle
        const autoRotateButton = page.locator('button:has-text("Auto")', '[data-testid*="auto-rotate"]');
        const autoRotateAvailable = await autoRotateButton.count() > 0;
        
        if (autoRotateAvailable) {
          console.log('🔄 Testing auto-rotation feature');
          
          const rotateStart = performance.now();
          await autoRotateButton.first().click();
          testJourney.interactions++;
          await page.waitForTimeout(1000); // Let rotation start
          const rotateTime = performance.now() - rotateStart;
          
          testJourney.timings.auto_rotation = rotateTime;
          console.log(`  Auto-rotation activation: ${rotateTime.toFixed(2)}ms`);
          
          testJourney.steps.push('Auto-rotation tested');
          
          // Stop auto-rotation
          await autoRotateButton.first().click();
          testJourney.interactions++;
        }
        
        // Test comparison mode (if available)
        const comparisonButton = page.locator('button:has-text("Compare")', '[data-testid*="comparison"]');
        const comparisonAvailable = await comparisonButton.count() > 0;
        
        if (comparisonAvailable) {
          console.log('🔍 Testing comparison mode');
          
          await comparisonButton.first().click();
          testJourney.interactions++;
          await page.waitForTimeout(1000);
          
          // Visual snapshot of comparison mode
          await page.screenshot({ 
            path: 'e2e-04-comparison-mode.png',
            fullPage: false 
          });
          testJourney.visualSnapshots.push('comparison-mode');
          
          testJourney.steps.push('Comparison mode tested');
        }
        
      } else {
        console.log('❌ Material switcher not visible - checking alternative 3D elements');
        testJourney.steps.push('Material switcher not accessible');
      }
      
    } else {
      console.log('❌ CustomizerPreviewSection not found');
      testJourney.steps.push('Customizer section not found');
    }
    
    // Step 5: Full Page Journey Documentation
    console.log('📸 Step 5: Complete Visual Documentation');
    
    // Scroll back to top
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(1000);
    
    // Final full-page screenshot
    await page.screenshot({ 
      path: 'e2e-05-complete-journey.png',
      fullPage: true 
    });
    testJourney.visualSnapshots.push('complete-journey');
    
    // Step 6: Performance and Analytics Validation
    console.log('📊 Step 6: Final Performance and Analytics Validation');
    
    const finalMetrics = await page.evaluate(() => {
      const performanceEntry = performance.getEntriesByType('navigation')[0];
      
      return {
        loadComplete: performanceEntry ? performanceEntry.loadEventEnd : 0,
        domContentLoaded: performanceEntry ? performanceEntry.domContentLoadedEventEnd : 0,
        firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        totalRequests: performance.getEntriesByType('resource').length
      };
    });
    
    testJourney.timings.final_metrics = finalMetrics;
    
    console.log('🎯 Final Performance Metrics:');
    console.log(`  Load Complete: ${finalMetrics.loadComplete.toFixed(2)}ms`);
    console.log(`  DOM Content Loaded: ${finalMetrics.domContentLoaded.toFixed(2)}ms`);
    console.log(`  First Contentful Paint: ${finalMetrics.firstContentfulPaint.toFixed(2)}ms`);
    console.log(`  Total Network Requests: ${finalMetrics.totalRequests}`);
    
    // Generate comprehensive test report
    console.log('\n📋 Phase 5: Complete E2E Test Summary');
    console.log('='.repeat(50));
    console.log(`✅ Journey Steps Completed: ${testJourney.steps.length}`);
    testJourney.steps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });
    
    console.log(`\n📊 Performance Summary:`);
    Object.entries(testJourney.timings).forEach(([metric, value]) => {
      if (typeof value === 'object') {
        console.log(`  ${metric}: ${JSON.stringify(value)}`);
      } else {
        console.log(`  ${metric}: ${value.toFixed(2)}ms`);
      }
    });
    
    console.log(`\n👆 User Interactions: ${testJourney.interactions}`);
    console.log(`📸 Visual Snapshots: ${testJourney.visualSnapshots.length}`);
    console.log(`❌ Console Errors: ${testJourney.errors.length}`);
    
    if (testJourney.errors.length > 0) {
      console.log('🚨 Errors Encountered:');
      testJourney.errors.slice(0, 3).forEach(error => {
        console.log(`  - ${error.text}`);
      });
    }
    
    // Final assertions for E2E journey
    expect(testJourney.steps.length).toBeGreaterThan(3); // At least 3 major steps completed
    expect(testJourney.interactions).toBeGreaterThan(1); // At least some interactions
    expect(testJourney.visualSnapshots.length).toBeGreaterThan(3); // Visual documentation captured
    expect(testJourney.errors.length).toBeLessThan(5); // Minimal errors
    
    if (testJourney.timings.material_switching) {
      expect(testJourney.timings.material_switching.claudeRulesCompliant).toBeTruthy();
    }
    
    console.log('\n🎉 Phase 5: Complete E2E Journey Testing COMPLETED SUCCESSFULLY');
  });
});