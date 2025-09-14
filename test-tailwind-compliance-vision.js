const { chromium } = require('playwright');

/**
 * Tailwind CSS Compliance Vision Mode Test
 * Audits homepage elements against /color-demo standards
 * CLAUDE_RULES compliant testing
 */

async function runTailwindComplianceVisionTest() {
  const browser = await chromium.launch({ 
    headless: false, 
    devtools: true 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  console.log('🔍 TAILWIND CSS COMPLIANCE VISION MODE TEST');
  console.log('============================================\n');
  
  try {
    // Step 1: Load /color-demo reference page
    console.log('📊 Step 1: Loading /color-demo reference standard...');
    await page.goto('http://localhost:3000/color-demo');
    await page.waitForLoadState('networkidle');
    
    // Capture reference screenshots
    await page.screenshot({ 
      path: 'audit-reference-color-demo.png', 
      fullPage: true 
    });
    
    // Extract color-demo styles for comparison
    const colorDemoStyles = await page.evaluate(() => {
      const styles = {
        typography: [],
        colors: [],
        spacing: [],
        buttons: []
      };
      
      // Extract typography classes
      const headings = document.querySelectorAll('h1, h2, h3, h4');
      headings.forEach(h => {
        styles.typography.push({
          tag: h.tagName,
          classes: h.className,
          computedStyles: window.getComputedStyle(h).cssText
        });
      });
      
      // Extract button classes
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {
        styles.buttons.push({
          text: btn.textContent.trim(),
          classes: btn.className,
          variant: btn.getAttribute('data-variant') || 'default'
        });
      });
      
      return styles;
    });
    
    console.log('✅ Reference standards captured\n');
    
    // Step 2: Load homepage for comparison
    console.log('📊 Step 2: Loading homepage for compliance audit...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'audit-homepage-current.png', 
      fullPage: true 
    });
    
    // Step 3: Audit each element category
    console.log('📊 Step 3: Element-by-Element Compliance Audit\n');
    
    // AUDIT 1: Typography Compliance
    console.log('🔤 AUDIT 1: Typography System');
    console.log('--------------------------------');
    const typographyAudit = await page.evaluate(() => {
      const results = {
        compliant: [],
        violations: []
      };
      
      // Check H1 tags
      const h1Elements = document.querySelectorAll('h1');
      h1Elements.forEach(h1 => {
        const classes = h1.className;
        if (classes.includes('aurora-') || classes.includes('typography-')) {
          results.compliant.push(`✅ H1: ${classes.substring(0, 50)}...`);
        } else {
          results.violations.push(`❌ H1: Non-compliant classes: ${classes}`);
        }
      });
      
      // Check body text
      const bodyTexts = document.querySelectorAll('[class*="text-"]');
      bodyTexts.forEach(el => {
        const classes = el.className;
        if (classes.match(/text-(neutral|brand|semantic|aurora)/)) {
          results.compliant.push(`✅ Text: Using token colors`);
        } else if (classes.match(/text-(red|blue|green|purple)-[0-9]/)) {
          results.violations.push(`❌ Text: Hardcoded color: ${classes.match(/text-[a-z]+-[0-9]+/)?.[0]}`);
        }
      });
      
      return results;
    });
    
    console.log('Compliant:', typographyAudit.compliant.length);
    console.log('Violations:', typographyAudit.violations.length);
    if (typographyAudit.violations.length > 0) {
      console.log('Sample violations:', typographyAudit.violations.slice(0, 3));
    }
    console.log('');
    
    // AUDIT 2: Color Palette Compliance
    console.log('🎨 AUDIT 2: Color Palette');
    console.log('--------------------------------');
    const colorAudit = await page.evaluate(() => {
      const results = {
        tokenColors: 0,
        hardcodedColors: 0,
        inlineStyles: 0
      };
      
      // Check background colors
      const bgElements = document.querySelectorAll('[class*="bg-"]');
      bgElements.forEach(el => {
        const classes = el.className;
        if (classes.match(/bg-(brand|neutral|semantic|aurora|gradient)/)) {
          results.tokenColors++;
        } else if (classes.match(/bg-(red|blue|green|purple)-[0-9]/)) {
          results.hardcodedColors++;
        }
      });
      
      // Check inline styles
      const styledElements = document.querySelectorAll('[style]');
      styledElements.forEach(el => {
        const style = el.getAttribute('style');
        if (style && (style.includes('color:') || style.includes('background'))) {
          results.inlineStyles++;
        }
      });
      
      return results;
    });
    
    console.log(`Token colors: ${colorAudit.tokenColors} ✅`);
    console.log(`Hardcoded colors: ${colorAudit.hardcodedColors} ${colorAudit.hardcodedColors > 0 ? '❌' : '✅'}`);
    console.log(`Inline styles: ${colorAudit.inlineStyles} ${colorAudit.inlineStyles > 0 ? '⚠️' : '✅'}`);
    console.log('');
    
    // AUDIT 3: Spacing System Compliance
    console.log('📏 AUDIT 3: Spacing System');
    console.log('--------------------------------');
    const spacingAudit = await page.evaluate(() => {
      const results = {
        tokenSpacing: 0,
        hardcodedSpacing: 0,
        violations: []
      };
      
      // Check padding and margin classes
      const spacedElements = document.querySelectorAll('[class*="p-"], [class*="m-"], [class*="gap-"], [class*="space-"]');
      spacedElements.forEach(el => {
        const classes = el.className;
        const tokenMatches = classes.match(/(p|m|gap|space)-(x|y)?-?token-/g);
        const hardcodedMatches = classes.match(/(p|m|gap|space)-(x|y)?-?[0-9]+/g);
        
        if (tokenMatches) {
          results.tokenSpacing += tokenMatches.length;
        }
        if (hardcodedMatches) {
          results.hardcodedSpacing += hardcodedMatches.length;
          results.violations.push(hardcodedMatches.join(', '));
        }
      });
      
      return results;
    });
    
    console.log(`Token spacing: ${spacingAudit.tokenSpacing} ✅`);
    console.log(`Hardcoded spacing: ${spacingAudit.hardcodedSpacing} ${spacingAudit.hardcodedSpacing > 0 ? '❌' : '✅'}`);
    if (spacingAudit.violations.length > 0) {
      console.log('Sample violations:', spacingAudit.violations.slice(0, 3));
    }
    console.log('');
    
    // AUDIT 4: Button Compliance
    console.log('🔘 AUDIT 4: Button System');
    console.log('--------------------------------');
    const buttonAudit = await page.evaluate(() => {
      const results = {
        compliant: 0,
        violations: [],
        variants: {}
      };
      
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {
        const classes = btn.className;
        const variant = btn.getAttribute('data-variant') || 'unknown';
        
        results.variants[variant] = (results.variants[variant] || 0) + 1;
        
        if (classes.includes('aurora-button') || classes.includes('variant')) {
          results.compliant++;
        } else if (!classes.includes('hover:') || !classes.includes('focus:')) {
          results.violations.push('Missing hover/focus states');
        }
      });
      
      return results;
    });
    
    console.log(`Compliant buttons: ${buttonAudit.compliant}`);
    console.log(`Button variants:`, buttonAudit.variants);
    if (buttonAudit.violations.length > 0) {
      console.log('Violations:', buttonAudit.violations.slice(0, 3));
    }
    console.log('');
    
    // AUDIT 5: Component Structure
    console.log('🏗️ AUDIT 5: Component Structure');
    console.log('--------------------------------');
    const structureAudit = await page.evaluate(() => {
      const results = {
        sections: [],
        containerUsage: 0,
        responsiveClasses: 0
      };
      
      // Check main sections
      const sections = document.querySelectorAll('section, [class*="Section"]');
      sections.forEach(section => {
        results.sections.push({
          classes: section.className.substring(0, 100),
          hasContainer: section.querySelector('.container') !== null
        });
      });
      
      // Check container usage
      results.containerUsage = document.querySelectorAll('.container').length;
      
      // Check responsive classes
      const allElements = document.querySelectorAll('[class*="sm:"], [class*="md:"], [class*="lg:"]');
      results.responsiveClasses = allElements.length;
      
      return results;
    });
    
    console.log(`Sections found: ${structureAudit.sections.length}`);
    console.log(`Container usage: ${structureAudit.containerUsage}`);
    console.log(`Responsive classes: ${structureAudit.responsiveClasses}`);
    console.log('');
    
    // Step 4: Visual Comparison
    console.log('📸 Step 4: Visual Comparison');
    console.log('--------------------------------');
    
    // Take component-specific screenshots
    const hero = await page.$('[class*="HeroSection"], section:first-child');
    if (hero) {
      await hero.screenshot({ path: 'audit-hero-section.png' });
      console.log('✅ Hero section captured');
    }
    
    const productCards = await page.$$('[data-testid="product-card"]');
    if (productCards.length > 0) {
      await productCards[0].screenshot({ path: 'audit-product-card.png' });
      console.log(`✅ Product cards found: ${productCards.length}`);
    }
    
    // Step 5: Performance Check
    console.log('\n⚡ Step 5: Performance Impact');
    console.log('--------------------------------');
    
    const performanceMetrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: Math.round(perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart),
        loadComplete: Math.round(perf.loadEventEnd - perf.loadEventStart),
        totalBlockingTime: Math.round(perf.domComplete - perf.domInteractive)
      };
    });
    
    console.log(`DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`);
    console.log(`Page Load Complete: ${performanceMetrics.loadComplete}ms`);
    console.log(`Total Blocking Time: ${performanceMetrics.totalBlockingTime}ms`);
    
    // Final Score Calculation
    console.log('\n📊 FINAL COMPLIANCE SCORE');
    console.log('================================');
    
    const totalScore = {
      typography: typographyAudit.violations.length === 0 ? 100 : Math.max(0, 100 - (typographyAudit.violations.length * 10)),
      colors: colorAudit.hardcodedColors === 0 ? 100 : Math.max(0, 100 - (colorAudit.hardcodedColors * 2)),
      spacing: spacingAudit.hardcodedSpacing === 0 ? 100 : Math.max(0, 100 - (spacingAudit.hardcodedSpacing * 5)),
      buttons: buttonAudit.violations.length === 0 ? 100 : Math.max(0, 100 - (buttonAudit.violations.length * 10)),
      structure: structureAudit.containerUsage > 0 ? 100 : 50
    };
    
    const overallScore = Object.values(totalScore).reduce((a, b) => a + b, 0) / 5;
    
    console.log('Typography Compliance:', `${totalScore.typography}%`);
    console.log('Color System Compliance:', `${totalScore.colors}%`);
    console.log('Spacing System Compliance:', `${totalScore.spacing}%`);
    console.log('Button System Compliance:', `${totalScore.buttons}%`);
    console.log('Structure Compliance:', `${totalScore.structure}%`);
    console.log('');
    console.log('🎯 OVERALL COMPLIANCE SCORE:', `${overallScore.toFixed(1)}%`);
    
    if (overallScore >= 90) {
      console.log('✅ EXCELLENT: System is highly compliant with /color-demo standards');
    } else if (overallScore >= 70) {
      console.log('⚠️ GOOD: Some improvements needed for full compliance');
    } else {
      console.log('❌ NEEDS WORK: Significant violations found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
runTailwindComplianceVisionTest().catch(console.error);