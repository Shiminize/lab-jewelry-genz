/**
 * Quick Fix Test for SustainabilityStorySection
 * 
 * This test isolates and fixes the specific issues found in the validation:
 * - Component rendering issues
 * - Missing sections
 * - Props validation problems
 */

const puppeteer = require('puppeteer');

class SustainabilityQuickFixTest {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    console.log('🔧 Starting SustainabilityStorySection Quick Fix Test...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 720 }
    });

    this.page = await this.browser.newPage();
    
    // Enable console logging
    this.page.on('console', msg => {
      console.log(`🖥️  Browser: ${msg.text()}`);
    });

    await this.page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
  }

  async analyzeCurrentState() {
    console.log('\n📊 Analyzing Current Component State...');

    const analysis = await this.page.evaluate(() => {
      // Check if SustainabilityStorySection is present
      const sustainabilitySection = document.querySelector('section[class*="bg-background"]');
      
      // Look for specific components by their expected content or structure
      const components = {
        hero: document.querySelector('[aria-labelledby="sustainability-hero-heading"]'),
        metrics: Array.from(document.querySelectorAll('*')).find(el => 
          el.textContent && el.textContent.includes('95%') && el.textContent.includes('Environmental Impact')
        ),
        comparison: document.querySelector('[aria-labelledby="comparison-heading"]'),
        process: document.querySelector('[aria-labelledby="process-timeline-heading"]'),
        certifications: Array.from(document.querySelectorAll('*')).find(el => 
          el.textContent && el.textContent.includes('IGI Certified')
        ),
        community: document.querySelector('[aria-labelledby="community-impact-heading"]')
      };

      // Get all text content to see what's actually rendered
      const bodyText = document.body.textContent;
      const sustainabilityKeywords = [
        'Future of Luxury',
        'lab-grown',
        '95% less',
        'renewable energy',
        'IGI Certified',
        'conscious luxury'
      ];

      const foundKeywords = sustainabilityKeywords.filter(keyword =>
        bodyText.toLowerCase().includes(keyword.toLowerCase())
      );

      return {
        hasSustainabilitySection: !!sustainabilitySection,
        components: Object.entries(components).map(([name, element]) => ({
          name,
          found: !!element,
          text: element ? element.textContent.substring(0, 100) + '...' : 'Not found'
        })),
        foundKeywords,
        totalTextLength: bodyText.length,
        hasLoadingState: bodyText.includes('animate-pulse')
      };
    });

    console.log('📋 Analysis Results:');
    console.log(`   Main Section: ${analysis.hasSustainabilitySection ? '✅' : '❌'}`);
    console.log(`   Loading State: ${analysis.hasLoadingState ? '⏳ Still Loading' : '✅ Loaded'}`);
    console.log(`   Found Keywords: ${analysis.foundKeywords.length}/6 - ${analysis.foundKeywords.join(', ')}`);
    console.log(`   Total Content Length: ${analysis.totalTextLength} characters`);
    
    console.log('\n🔍 Component Status:');
    analysis.components.forEach(comp => {
      console.log(`   ${comp.name}: ${comp.found ? '✅' : '❌'} - ${comp.text}`);
    });

    return analysis;
  }

  async waitForFullLoad() {
    console.log('\n⏳ Waiting for full page load...');
    
    // Wait for loading spinner to disappear
    try {
      await this.page.waitForFunction(
        () => !document.body.textContent.includes('animate-pulse'),
        { timeout: 15000 }
      );
      console.log('✅ Loading completed');
    } catch (error) {
      console.log('⚠️  Timeout waiting for load completion, proceeding...');
    }

    // Wait a bit more for dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  async diagnoseSpecificIssues() {
    console.log('\n🔬 Diagnosing Specific Issues...');

    const diagnostics = await this.page.evaluate(() => {
      // Check if the SustainabilityStorySection component is in the DOM
      const allSections = document.querySelectorAll('section');
      const sustainabilitySections = Array.from(allSections).filter(section => 
        section.className.includes('bg-background') || 
        section.textContent.toLowerCase().includes('sustainability') ||
        section.textContent.toLowerCase().includes('future of luxury')
      );

      // Check for import/export issues by looking for error boundaries or missing content
      const hasReactErrors = Array.from(document.querySelectorAll('*')).some(el => 
        el.textContent && (
          el.textContent.includes('Error') || 
          el.textContent.includes('Failed to load') ||
          el.textContent.includes('Module not found')
        )
      );

      // Look for specific sustainability content that should be present
      const expectedContent = [
        'The Future of Luxury is Sustainable',
        'Lab-grown diamonds',
        'IGI Certified',
        'renewable energy',
        'conscious luxury'
      ];

      const contentResults = expectedContent.map(content => ({
        content,
        found: document.body.textContent.toLowerCase().includes(content.toLowerCase())
      }));

      return {
        sustainabilitySectionsCount: sustainabilitySections.length,
        hasReactErrors,
        contentResults,
        totalSections: allSections.length
      };
    });

    console.log('🔍 Diagnostic Results:');
    console.log(`   Total Sections: ${diagnostics.totalSections}`);
    console.log(`   Sustainability Sections: ${diagnostics.sustainabilitySectionsCount}`);
    console.log(`   React Errors: ${diagnostics.hasReactErrors ? '❌ Yes' : '✅ None'}`);
    
    console.log('\n📝 Expected Content Check:');
    diagnostics.contentResults.forEach(result => {
      console.log(`   "${result.content}": ${result.found ? '✅' : '❌'}`);
    });

    return diagnostics;
  }

  async generateFixReport() {
    console.log('\n📊 Generating Fix Report...');

    const analysis = await this.analyzeCurrentState();
    const diagnostics = await this.diagnoseSpecificIssues();

    const issues = [];
    const fixes = [];

    // Issue 1: Missing sections
    const missingSections = analysis.components.filter(comp => !comp.found);
    if (missingSections.length > 0) {
      issues.push(`Missing sections: ${missingSections.map(s => s.name).join(', ')}`);
      fixes.push('Check component imports and ensure all extracted components are properly exported');
    }

    // Issue 2: Loading state persisting
    if (analysis.hasLoadingState) {
      issues.push('Page stuck in loading state');
      fixes.push('Check for async loading issues or errors in component rendering');
    }

    // Issue 3: Missing content
    const missingContent = diagnostics.contentResults.filter(c => !c.found);
    if (missingContent.length > 2) {
      issues.push(`Missing expected content: ${missingContent.map(c => c.content).join(', ')}`);
      fixes.push('Verify data imports from sustainabilityData.ts are working correctly');
    }

    // Issue 4: No sustainability sections at all
    if (diagnostics.sustainabilitySectionsCount === 0) {
      issues.push('SustainabilityStorySection component not rendering');
      fixes.push('Check main component import/export and ensure no TypeScript errors');
    }

    const report = {
      timestamp: new Date().toISOString(),
      issues,
      fixes,
      componentStatus: analysis.components,
      hasErrors: issues.length > 0,
      severity: issues.length > 3 ? 'HIGH' : issues.length > 1 ? 'MEDIUM' : 'LOW'
    };

    console.log('\n🎯 QUICK FIX REPORT:');
    console.log(`   Severity: ${report.severity}`);
    console.log(`   Issues Found: ${issues.length}`);
    
    if (issues.length > 0) {
      console.log('\n❌ Issues:');
      issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));
      
      console.log('\n🔧 Recommended Fixes:');
      fixes.forEach((fix, i) => console.log(`   ${i + 1}. ${fix}`));
    } else {
      console.log('\n✅ No major issues found!');
    }

    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runQuickFix() {
    try {
      await this.initialize();
      await this.waitForFullLoad();
      const report = await this.generateFixReport();
      
      console.log('\n🎉 Quick Fix Test Complete!');
      return report;
    } catch (error) {
      console.error('❌ Test failed:', error);
      return { error: error.message };
    } finally {
      await this.cleanup();
    }
  }
}

// Execute the test
if (require.main === module) {
  const tester = new SustainabilityQuickFixTest();
  tester.runQuickFix()
    .then(report => {
      if (report.error || (report.hasErrors && report.severity === 'HIGH')) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = SustainabilityQuickFixTest;