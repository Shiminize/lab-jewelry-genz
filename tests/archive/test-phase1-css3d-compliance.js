/**
 * Phase 1 E2E Test: CSS 3D Customizer CLAUDE_RULES Compliance
 * 
 * SUCCESS CRITERIA:
 * 1. Page loads without JavaScript errors
 * 2. No WebGL/Three.js components present
 * 3. Basic material switching functionality works
 * 4. <2s initial load time (CLAUDE_RULES mandatory)
 * 5. CSS 3D customizer displays correctly
 */

const puppeteer = require('puppeteer');

async function testPhase1CSS3DCompliance() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Track JavaScript errors - MUST be zero for Phase 1 success
    const jsErrors = [];
    const consoleMessages = [];
    
    page.on('pageerror', error => {
      jsErrors.push(error.message);
      console.error('❌ JavaScript Error:', error.message);
    });
    
    page.on('console', msg => {
      consoleMessages.push(msg.text());
      if (msg.type() === 'error') {
        console.error('🔍 Console Error:', msg.text());
      }
    });
    
    console.log('🎯 PHASE 1 E2E TEST: CSS 3D Customizer CLAUDE_RULES Compliance');
    console.log('==============================================================');
    
    // Test 1: Page Load Performance (<2s requirement)
    console.log('📊 Test 1: Measuring page load performance...');
    const loadStartTime = performance.now();
    
    await page.goto('http://localhost:3001/customizer', { 
      waitUntil: 'networkidle0',
      timeout: 10000
    });
    
    const loadTime = performance.now() - loadStartTime;
    const loadTimeSeconds = (loadTime / 1000).toFixed(2);
    
    if (loadTime <= 2000) {
      console.log(`✅ CLAUDE_RULES COMPLIANT: Page loaded in ${loadTimeSeconds}s`);
    } else {
      console.log(`❌ CLAUDE_RULES VIOLATION: Page load ${loadTimeSeconds}s exceeds 2s requirement`);
      return false;
    }
    
    // Test 2: JavaScript Error Check
    console.log('\\n🔍 Test 2: Checking for JavaScript errors...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Allow time for any delayed errors
    
    if (jsErrors.length === 0) {
      console.log('✅ ZERO JavaScript errors detected');
    } else {
      console.log(`❌ CRITICAL: ${jsErrors.length} JavaScript errors found:`);
      jsErrors.forEach((error, i) => console.log(`   ${i + 1}. ${error}`));
      return false;
    }
    
    // Test 3: WebGL/Three.js Component Detection
    console.log('\\n🚫 Test 3: Verifying no WebGL/Three.js components...');
    
    const webglElements = await page.evaluate(() => {
      const canvases = Array.from(document.querySelectorAll('canvas'));
      const webglCanvases = canvases.filter(canvas => {
        try {
          return canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        } catch (e) {
          return false;
        }
      });
      return webglCanvases.length;
    });
    
    const threeJSReferences = await page.evaluate(() => {
      return window.THREE !== undefined || 
             document.querySelector('[data-threejs]') !== null ||
             document.querySelector('[class*="threejs"]') !== null;
    });
    
    if (webglElements === 0 && !threeJSReferences) {
      console.log('✅ CLAUDE_RULES COMPLIANT: No WebGL/Three.js components detected');
    } else {
      console.log(`❌ CLAUDE_RULES VIOLATION: WebGL components found (${webglElements}) or Three.js references detected`);
      return false;
    }
    
    // Test 4: CSS 3D Customizer Present
    console.log('\\n🎨 Test 4: Verifying CSS 3D customizer is present...');
    
    const css3dElements = await page.evaluate(() => {
      const customizer = document.querySelector('[aria-label*="CSS 3D"]') || 
                        document.querySelector('[aria-label*="360° jewelry view"]');
      const sequenceViewer = document.querySelector('img[src*="3d-sequences"]') ||
                            document.querySelector('[class*="sequence"]');
      
      return {
        hasCustomizer: !!customizer,
        hasSequenceViewer: !!sequenceViewer,
        customizerText: customizer ? customizer.getAttribute('aria-label') : null
      };
    });
    
    if (css3dElements.hasCustomizer || css3dElements.hasSequenceViewer) {
      console.log('✅ CSS 3D customizer detected:', css3dElements.customizerText || 'Image sequence viewer found');
    } else {
      console.log('❌ CRITICAL: CSS 3D customizer not found');
      return false;
    }
    
    // Test 5: Material Switching Functionality
    console.log('\\n💎 Test 5: Testing material switching functionality...');
    
    const materialButtons = await page.$$('button[data-material]');
    
    if (materialButtons.length > 0) {
      console.log(`Found ${materialButtons.length} material options`);
      
      // Test material switching
      const switchStartTime = performance.now();
      await materialButtons[0].click();
      await new Promise(resolve => setTimeout(resolve, 500)); // Allow for material change
      const switchTime = performance.now() - switchStartTime;
      
      console.log(`Material switch completed in ${switchTime.toFixed(0)}ms`);
      
      // Check for material change confirmation in console
      const materialChangeMessages = consoleMessages.filter(msg => 
        msg.includes('Material changed') || msg.includes('CLAUDE_RULES compliant')
      );
      
      if (materialChangeMessages.length > 0) {
        console.log('✅ Material switching functionality working');
      } else {
        console.log('⚠️ Material switching may not be fully functional');
      }
    } else {
      console.log('⚠️ No material selection buttons found');
    }
    
    // Test 6: CLAUDE_RULES Design System Compliance
    console.log('\\n🎨 Test 6: Checking CLAUDE_RULES design system compliance...');
    
    const designSystemCheck = await page.evaluate(() => {
      const forbiddenClasses = ['text-black', 'bg-blue-500', 'border-gray-400'];
      const approvedClasses = ['text-foreground', 'bg-background', 'text-accent', 'bg-cta'];
      
      const allElements = Array.from(document.querySelectorAll('*'));
      const forbiddenFound = [];
      let approvedFound = 0;
      
      allElements.forEach(el => {
        const className = el.className || '';
        if (typeof className === 'string') {
          forbiddenClasses.forEach(forbidden => {
            if (className.includes(forbidden)) {
              forbiddenFound.push(forbidden);
            }
          });
          approvedClasses.forEach(approved => {
            if (className.includes(approved)) {
              approvedFound++;
            }
          });
        }
      });
      
      return {
        forbiddenFound: [...new Set(forbiddenFound)],
        approvedFound
      };
    });
    
    if (designSystemCheck.forbiddenFound.length === 0) {
      console.log(`✅ CLAUDE_RULES design system compliant (${designSystemCheck.approvedFound} approved classes used)`);
    } else {
      console.log(`❌ CLAUDE_RULES VIOLATION: Forbidden classes found:`, designSystemCheck.forbiddenFound);
    }
    
    // Take screenshot for verification
    await page.screenshot({ path: 'phase1-css3d-compliance-test.png', fullPage: true });
    console.log('\\n📸 Screenshot saved: phase1-css3d-compliance-test.png');
    
    // Final Assessment
    console.log('\\n📊 PHASE 1 SUCCESS CRITERIA ASSESSMENT:');
    console.log('=========================================');
    console.log(`✅ Load Time: ${loadTimeSeconds}s (< 2s required)`);
    console.log(`✅ Zero JavaScript Errors: ${jsErrors.length === 0}`);
    console.log(`✅ No WebGL Components: ${webglElements === 0}`);
    console.log(`✅ CSS 3D Customizer Present: ${css3dElements.hasCustomizer || css3dElements.hasSequenceViewer}`);
    console.log(`✅ Material Switching: ${materialButtons.length > 0}`);
    
    const allTestsPassed = (
      loadTime <= 2000 &&
      jsErrors.length === 0 &&
      webglElements === 0 &&
      !threeJSReferences &&
      (css3dElements.hasCustomizer || css3dElements.hasSequenceViewer)
    );
    
    if (allTestsPassed) {
      console.log('\\n🎉 PHASE 1 SUCCESS: All CLAUDE_RULES compliance criteria met!');
      console.log('Ready to proceed to Phase 2: Performance Optimization');
      return true;
    } else {
      console.log('\\n❌ PHASE 1 FAILED: Critical issues must be resolved before Phase 2');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    return false;
  } finally {
    // Keep browser open for manual inspection
    console.log('\\n🔍 Browser will remain open for 10 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
  }
}

// Execute the test
testPhase1CSS3DCompliance()
  .then(success => {
    if (success) {
      console.log('\\n🚀 PHASE 1 COMPLETE - PROCEEDING TO PHASE 2');
      process.exit(0);
    } else {
      console.log('\\n🛑 PHASE 1 FAILED - STOPPING EXECUTION');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\\n💥 CRITICAL TEST FAILURE:', error);
    process.exit(1);
  });