const puppeteer = require('puppeteer');
const fs = require('fs');

async function analyzeNavigationFlicker() {
  console.log('🔍 Starting Navigation Flicker Analysis...');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      devtools: false,
      defaultViewport: { width: 1440, height: 900 }
    });

    const page = await browser.newPage();
    
    // Navigate to the site
    console.log('📍 Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle0',
      timeout: 10000 
    });
    
    // Wait for navigation to be fully loaded
    await page.waitForSelector('nav', { visible: true });
    console.log('✅ Navigation loaded');

    // Take baseline screenshot
    await page.screenshot({ 
      path: 'navigation-baseline-analysis.png',
      clip: { x: 0, y: 0, width: 1440, height: 200 }
    });
    console.log('📸 Baseline screenshot taken');

    // Analyze current CSS transitions and potential flicker causes
    const transitionAnalysis = await page.evaluate(() => {
      const results = {
        navElements: [],
        potentialIssues: [],
        currentStyles: {}
      };
      
      // Analyze all navigation elements
      const navElements = document.querySelectorAll('nav, nav *');
      
      navElements.forEach((el, index) => {
        if (!el) return;
        
        const styles = window.getComputedStyle(el);
        const elementInfo = {
          index,
          tagName: el.tagName,
          className: el.className || 'no-class',
          transition: styles.transition,
          transform: styles.transform,
          opacity: styles.opacity,
          zIndex: styles.zIndex,
          position: styles.position,
          willChange: styles.willChange
        };
        
        results.navElements.push(elementInfo);
        
        // Identify potential flickering issues
        const issues = [];
        
        // Issue 1: "all" transition can cause flickering
        if (styles.transition.includes('all')) {
          issues.push({
            type: 'transition-all',
            message: 'Using "transition: all" can cause flickering - be specific about properties',
            element: `${el.tagName}.${el.className}`,
            fix: 'Use specific properties like "opacity 0.3s ease, transform 0.3s ease"'
          });
        }
        
        // Issue 2: Very fast transitions
        const transitionMatch = styles.transition.match(/(\\d+\\.?\\d*)s/);
        if (transitionMatch) {
          const duration = parseFloat(transitionMatch[1]);
          if (duration > 0 && duration < 0.15) {
            issues.push({
              type: 'transition-too-fast',
              message: `Transition duration ${duration}s is too fast, may cause flickering`,
              element: `${el.tagName}.${el.className}`,
              fix: 'Use 0.2s-0.3s for smooth transitions'
            });
          }
        }
        
        // Issue 3: Transform without will-change
        if (styles.transform !== 'none' && !styles.willChange.includes('transform')) {
          issues.push({
            type: 'missing-will-change',
            message: 'Transform without will-change optimization',
            element: `${el.tagName}.${el.className}`,
            fix: 'Add "will-change: transform" for GPU acceleration'
          });
        }
        
        // Issue 4: Multiple z-index conflicts
        if (parseInt(styles.zIndex) > 1000) {
          issues.push({
            type: 'high-z-index',
            message: `Very high z-index (${styles.zIndex}) may cause stacking issues`,
            element: `${el.tagName}.${el.className}`,
            fix: 'Use lower, more predictable z-index values'
          });
        }
        
        if (issues.length > 0) {
          results.potentialIssues.push(...issues);
        }
      });
      
      // Check for portal-specific issues
      const portalRoot = document.getElementById('dropdown-portal-root');
      if (portalRoot) {
        const portalStyles = window.getComputedStyle(portalRoot);
        results.currentStyles.portalRoot = {
          zIndex: portalStyles.zIndex,
          position: portalStyles.position,
          pointerEvents: portalStyles.pointerEvents
        };
      }
      
      return results;
    });
    
    console.log('📊 Transition Analysis:', JSON.stringify(transitionAnalysis, null, 2));

    // Test hover behavior with timing measurements
    const navLinks = await page.$$('nav a');
    console.log(`🎯 Found ${navLinks.length} navigation links to test`);

    for (let i = 0; i < Math.min(navLinks.length, 4); i++) {
      const link = navLinks[i];
      const text = await link.evaluate(el => el.textContent?.trim());
      console.log(`🖱️  Testing hover on: "${text}"`);

      // Move to neutral position
      await page.mouse.move(100, 100);
      await page.waitForTimeout(300);

      // Measure hover transition performance
      const hoverStart = Date.now();
      
      // Hover with precise timing
      await link.hover();
      await page.waitForTimeout(50); // Capture mid-transition
      
      await page.screenshot({
        path: `hover-transition-${i}-start.png`,
        clip: { x: 0, y: 0, width: 1440, height: 400 }
      });

      await page.waitForTimeout(100);
      
      await page.screenshot({
        path: `hover-transition-${i}-mid.png`,
        clip: { x: 0, y: 0, width: 1440, height: 400 }
      });

      await page.waitForTimeout(200);
      
      await page.screenshot({
        path: `hover-transition-${i}-complete.png`,
        clip: { x: 0, y: 0, width: 1440, height: 400 }
      });

      const hoverEnd = Date.now();
      console.log(`⏱️  Hover transition took: ${hoverEnd - hoverStart}ms`);

      // Check for dropdown visibility
      const dropdownVisible = await page.$('[data-testid="dropdown-portal"]:not([style*="opacity: 0"])');
      if (dropdownVisible) {
        console.log(`📋 Dropdown visible for "${text}"`);
        await page.screenshot({
          path: `dropdown-visible-${i}.png`,
          clip: { x: 0, y: 0, width: 1440, height: 600 }
        });
      }
    }

    // Test rapid hover movements for flicker detection
    console.log('⚡ Testing rapid movements for flicker...');
    const firstTwoLinks = navLinks.slice(0, 2);
    
    for (let cycle = 0; cycle < 2; cycle++) {
      console.log(`🔄 Flicker test cycle ${cycle + 1}`);
      
      for (let rapid = 0; rapid < 5; rapid++) {
        // Rapidly alternate between first two nav items
        await firstTwoLinks[rapid % 2].hover();
        await page.waitForTimeout(30); // Very short delay to catch flicker
        
        await page.screenshot({
          path: `flicker-rapid-${cycle}-${rapid}.png`,
          clip: { x: 0, y: 0, width: 1440, height: 400 }
        });
      }
    }

    // Generate recommendations based on analysis
    const recommendations = {
      immediateFlickerFixes: [
        'Replace "transition: all" with specific properties like "opacity 0.3s ease, transform 0.3s ease"',
        'Add "will-change: transform, opacity" to elements with transforms',
        'Use consistent transition duration of 0.2s-0.3s (Apple standard)',
        'Ensure proper z-index layering without conflicts'
      ],
      appleStyleImplementation: [
        'Use backdrop-filter: blur(20px) for glassmorphism effect',
        'Implement consistent 16px spacing and padding',
        'Add subtle box-shadow with rgba(0,0,0,0.08) for depth',
        'Use transform: translateZ(0) for hardware acceleration',
        'Apply cubic-bezier(0.4, 0, 0.2, 1) easing for Apple-like smoothness'
      ],
      performanceOptimizations: [
        'Use "transform: translate3d(0, 0, 0)" to trigger GPU acceleration',
        'Minimize paint operations by avoiding layout-affecting properties',
        'Implement proper cleanup for event listeners and timers',
        'Use requestAnimationFrame for smooth animations'
      ]
    };

    // Save analysis results
    const analysisReport = {
      timestamp: new Date().toISOString(),
      transitionAnalysis,
      recommendations,
      testResults: {
        totalNavLinks: navLinks.length,
        screenshotsTaken: true,
        flickerTestCompleted: true
      }
    };

    fs.writeFileSync('navigation-flicker-analysis-report.json', JSON.stringify(analysisReport, null, 2));
    console.log('📝 Analysis report saved to navigation-flicker-analysis-report.json');

    console.log('✅ Navigation flicker analysis complete!');
    console.log('🔍 Key Issues Found:');
    transitionAnalysis.potentialIssues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue.type}: ${issue.message}`);
    });

  } catch (error) {
    console.error('❌ Error during analysis:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run analysis
analyzeNavigationFlicker().catch(console.error);