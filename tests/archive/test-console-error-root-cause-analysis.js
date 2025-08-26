#!/usr/bin/env node

/**
 * Console Error Root Cause Analysis Tool
 * 
 * Systematic Playwright-based console error detection and categorization
 * for 3D Customizer implementation following CLAUDE_RULES methodology.
 * 
 * Purpose: Root cause identification (not solution implementation)
 * Target: Homepage CustomizerPreviewSection + /customizer page
 * 
 * Phase 1A: Console Error Detection Infrastructure
 */

const { chromium } = require('playwright');

// Error categorization taxonomy for systematic analysis
const ERROR_CATEGORIES = {
  JAVASCRIPT: 'javascript-errors',
  ASSET_404: 'asset-404-errors', 
  NETWORK: 'network-errors',
  MONGODB: 'mongodb-connection',
  HYDRATION: 'react-hydration',
  PERFORMANCE: 'performance-warnings',
  ACCESSIBILITY: 'a11y-violations',
  BRIDGE_SERVICE: 'bridge-service-errors',
  STATE_MANAGEMENT: 'state-management',
  ERROR_BOUNDARY: 'error-boundary-triggers'
};

// Console error severity classification
const ERROR_SEVERITY = {
  CRITICAL: 'critical',      // Breaks user functionality
  HIGH: 'high',             // Degrades experience significantly  
  MEDIUM: 'medium',         // Minor UX impact
  LOW: 'low',              // Informational only
  DEBUG: 'debug'           // Development-only messages
};

// CLAUDE_RULES performance targets for impact assessment
const PERFORMANCE_TARGETS = {
  MATERIAL_SWITCH_MS: 100,   // <100ms material changes
  INITIAL_LOAD_MS: 2000,     // <2s initial load
  PAGE_LOAD_MS: 3000         // <3s page loads
};

class ConsoleErrorAnalyzer {
  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    this.browser = null;
    this.consoleErrors = [];
    this.networkErrors = [];
    this.performanceMetrics = {};
    this.errorTaxonomy = {
      homepage: { errors: [], errorsByCategory: {}, timing: {} },
      customizer: { errors: [], errorsByCategory: {}, timing: {} }
    };
    
    // Initialize error category tracking
    Object.values(ERROR_CATEGORIES).forEach(category => {
      this.errorTaxonomy.homepage.errorsByCategory[category] = [];
      this.errorTaxonomy.customizer.errorsByCategory[category] = [];
    });
  }

  async init() {
    console.log('🔍 Starting Console Error Root Cause Analysis...');
    console.log(`📍 Target: ${this.baseUrl}`);
    console.log('📋 Analysis Scope: Homepage CustomizerPreviewSection + /customizer page');
    console.log('🎯 Goal: Systematic error identification and categorization\n');
    
    this.browser = await chromium.launch({ 
      headless: false, // Visual monitoring for better analysis
      slowMo: 100,     // Slow down for detailed observation
      args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
  }

  // Categorize console message by content and context
  categorizeError(message, source, pageType) {
    const text = message.text();
    const type = message.type();
    const location = message.location();
    
    let category = ERROR_CATEGORIES.JAVASCRIPT; // default
    let severity = ERROR_SEVERITY.MEDIUM; // default
    
    // Asset 404 Detection
    if (text.includes('404') || text.includes('Failed to load resource')) {
      category = ERROR_CATEGORIES.ASSET_404;
      if (text.includes('Black_Stone_Ring') || text.includes('3d-sequences')) {
        severity = ERROR_SEVERITY.HIGH; // Critical for 3D customizer
      } else {
        severity = ERROR_SEVERITY.MEDIUM;
      }
    }
    
    // MongoDB/Database Errors
    else if (text.includes('connectToDatabase') || text.includes('MongoError') || text.includes('mongoose')) {
      category = ERROR_CATEGORIES.MONGODB;
      severity = ERROR_SEVERITY.CRITICAL; // Database connectivity is critical
    }
    
    // React Hydration Issues
    else if (text.includes('hydration') || text.includes('server') && text.includes('client')) {
      category = ERROR_CATEGORIES.HYDRATION;
      severity = ERROR_SEVERITY.HIGH; // Affects SSR/CSR consistency
    }
    
    // Bridge Service Errors (useCustomizableProduct hook)
    else if (text.includes('useCustomizableProduct') || text.includes('bridge') || text.includes('customizable')) {
      category = ERROR_CATEGORIES.BRIDGE_SERVICE;
      severity = ERROR_SEVERITY.HIGH; // Core customizer functionality
    }
    
    // State Management Issues
    else if (text.includes('useState') || text.includes('useEffect') || text.includes('infinite') || text.includes('loop')) {
      category = ERROR_CATEGORIES.STATE_MANAGEMENT;
      severity = ERROR_SEVERITY.MEDIUM; // Performance impact
    }
    
    // Network/HTTP Errors
    else if (text.includes('fetch') || text.includes('network') || text.includes('CORS') || text.includes('SSL')) {
      category = ERROR_CATEGORIES.NETWORK;
      severity = ERROR_SEVERITY.MEDIUM;
    }
    
    // Performance Warnings
    else if (text.includes('performance') || text.includes('slow') || text.includes('timeout') || type === 'warning') {
      category = ERROR_CATEGORIES.PERFORMANCE;
      severity = ERROR_SEVERITY.LOW; // Monitor for CLAUDE_RULES compliance
    }
    
    // Accessibility Violations
    else if (text.includes('aria') || text.includes('accessibility') || text.includes('a11y')) {
      category = ERROR_CATEGORIES.ACCESSIBILITY;
      severity = ERROR_SEVERITY.MEDIUM; // WCAG 2.1 AA compliance required
    }
    
    // Error Boundary Activations
    else if (text.includes('Error boundary') || text.includes('componentDidCatch') || text.includes('ErrorBoundary')) {
      category = ERROR_CATEGORIES.ERROR_BOUNDARY;
      severity = ERROR_SEVERITY.HIGH; // Indicates component failures
    }
    
    // JavaScript runtime errors
    else if (type === 'error') {
      category = ERROR_CATEGORIES.JAVASCRIPT;
      severity = ERROR_SEVERITY.HIGH;
    }

    return {
      timestamp: new Date().toISOString(),
      page: pageType,
      category,
      severity,
      type,
      text,
      location,
      source: source || 'unknown',
      // Context for root cause analysis
      context: {
        url: location?.url || 'unknown',
        lineNumber: location?.lineNumber || 0,
        columnNumber: location?.columnNumber || 0
      }
    };
  }

  // Setup comprehensive console monitoring for a page
  async setupConsoleMonitoring(page, pageType) {
    console.log(`📊 Setting up console monitoring for ${pageType} page...`);
    
    // Console message capture with detailed analysis
    page.on('console', (msg) => {
      const error = this.categorizeError(msg, 'console', pageType);
      
      // Store in main collection
      this.consoleErrors.push(error);
      
      // Store in taxonomy for structured analysis
      this.errorTaxonomy[pageType].errors.push(error);
      this.errorTaxonomy[pageType].errorsByCategory[error.category].push(error);
      
      // Real-time console output for monitoring
      const severityIcon = {
        [ERROR_SEVERITY.CRITICAL]: '🚨',
        [ERROR_SEVERITY.HIGH]: '⚠️',
        [ERROR_SEVERITY.MEDIUM]: '🟡',
        [ERROR_SEVERITY.LOW]: '🔵',
        [ERROR_SEVERITY.DEBUG]: '🔧'
      };
      
      console.log(`${severityIcon[error.severity]} [${pageType.toUpperCase()}] [${error.category}] ${error.text}`);
    });
    
    // Network error capture
    page.on('response', (response) => {
      if (!response.ok()) {
        const networkError = {
          timestamp: new Date().toISOString(),
          page: pageType,
          category: ERROR_CATEGORIES.NETWORK,
          severity: response.status() >= 500 ? ERROR_SEVERITY.HIGH : ERROR_SEVERITY.MEDIUM,
          type: 'network',
          text: `HTTP ${response.status()}: ${response.url()}`,
          context: {
            status: response.status(),
            url: response.url(),
            statusText: response.statusText()
          }
        };
        
        this.networkErrors.push(networkError);
        this.errorTaxonomy[pageType].errors.push(networkError);
        this.errorTaxonomy[pageType].errorsByCategory[ERROR_CATEGORIES.NETWORK].push(networkError);
        
        console.log(`🌐 [${pageType.toUpperCase()}] Network Error: ${networkError.text}`);
      }
    });
    
    // Page error capture (uncaught exceptions)
    page.on('pageerror', (error) => {
      const pageError = {
        timestamp: new Date().toISOString(),
        page: pageType,
        category: ERROR_CATEGORIES.JAVASCRIPT,
        severity: ERROR_SEVERITY.CRITICAL,
        type: 'pageerror',
        text: error.message,
        context: {
          stack: error.stack,
          name: error.name
        }
      };
      
      this.consoleErrors.push(pageError);
      this.errorTaxonomy[pageType].errors.push(pageError);
      this.errorTaxonomy[pageType].errorsByCategory[ERROR_CATEGORIES.JAVASCRIPT].push(pageError);
      
      console.log(`💥 [${pageType.toUpperCase()}] Page Error: ${pageError.text}`);
    });
  }

  // Test homepage CustomizerPreviewSection with systematic interaction
  async analyzeHomepage() {
    console.log('\n🏠 PHASE 1A: Homepage CustomizerPreviewSection Analysis');
    console.log('=' * 60);
    
    const page = await this.browser.newPage();
    await this.setupConsoleMonitoring(page, 'homepage');
    
    const startTime = Date.now();
    
    try {
      // Navigate to homepage
      console.log('📍 Navigating to homepage...');
      await page.goto(this.baseUrl, { waitUntil: 'networkidle' });
      
      // Wait for CustomizerPreviewSection to load
      console.log('⏳ Waiting for CustomizerPreviewSection component...');
      await page.waitForSelector('[data-testid="customizer-preview-section"], .customizer-preview, #customizer-preview', { 
        timeout: 10000 
      }).catch(() => {
        console.log('⚠️  CustomizerPreviewSection selector not found, continuing with generic selectors...');
      });
      
      const initialLoadTime = Date.now() - startTime;
      this.errorTaxonomy.homepage.timing.initialLoad = initialLoadTime;
      
      console.log(`⏱️  Homepage initial load: ${initialLoadTime}ms (Target: <${PERFORMANCE_TARGETS.PAGE_LOAD_MS}ms)`);
      
      // Wait for 3D viewer to initialize
      console.log('🎨 Waiting for 3D viewer initialization...');
      await page.waitForTimeout(3000); // Allow customizer to fully load
      
      // Look for material selector buttons (Phase 4 achievement)
      console.log('🔍 Searching for material selector interactions...');
      const materialButtons = await page.locator('button[data-material], [role="button"][aria-pressed]').all();
      
      if (materialButtons.length > 0) {
        console.log(`✅ Found ${materialButtons.length} material selector buttons`);
        
        // Test material switching for console errors (CLAUDE_RULES <100ms target)
        for (let i = 0; i < Math.min(materialButtons.length, 3); i++) {
          const switchStartTime = Date.now();
          console.log(`🔄 Testing material switch ${i + 1}...`);
          
          await materialButtons[i].click();
          await page.waitForTimeout(500); // Allow switch to complete
          
          const switchTime = Date.now() - switchStartTime;
          console.log(`⏱️  Material switch ${i + 1}: ${switchTime}ms (Target: <${PERFORMANCE_TARGETS.MATERIAL_SWITCH_MS}ms)`);
        }
      } else {
        console.log('⚠️  No material selector buttons found on homepage');
      }
      
      // Test drag interaction if available
      console.log('🖱️  Testing drag interaction...');
      const dragTarget = await page.locator('[role="img"][aria-label*="Interactive"], .viewer, .customizer-viewer').first();
      if (await dragTarget.isVisible()) {
        const box = await dragTarget.boundingBox();
        if (box) {
          // Perform drag gesture
          await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5);
          await page.mouse.down();
          await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.5, { steps: 5 });
          await page.mouse.up();
          
          console.log('✅ Drag interaction completed');
          await page.waitForTimeout(1000); // Allow any delayed errors to surface
        }
      }
      
      // Scroll through homepage to trigger any lazy-loaded errors
      console.log('📜 Scrolling to trigger lazy-loaded components...');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
      
      console.log(`✅ Homepage analysis complete. Total errors captured: ${this.errorTaxonomy.homepage.errors.length}`);
      
    } catch (error) {
      console.error('❌ Homepage analysis failed:', error.message);
      this.errorTaxonomy.homepage.errors.push({
        timestamp: new Date().toISOString(),
        page: 'homepage',
        category: ERROR_CATEGORIES.JAVASCRIPT,
        severity: ERROR_SEVERITY.CRITICAL,
        type: 'analysis-error',
        text: `Homepage analysis failed: ${error.message}`,
        context: { stack: error.stack }
      });
    } finally {
      await page.close();
    }
  }

  // Test dedicated /customizer page with comprehensive interaction
  async analyzeCustomizerPage() {
    console.log('\n⚙️  PHASE 1A: Dedicated Customizer Page Analysis');
    console.log('=' * 60);
    
    const page = await this.browser.newPage();
    await this.setupConsoleMonitoring(page, 'customizer');
    
    const startTime = Date.now();
    
    try {
      // Navigate to customizer page
      console.log('📍 Navigating to /customizer page...');
      await page.goto(`${this.baseUrl}/customizer`, { waitUntil: 'networkidle' });
      
      const initialLoadTime = Date.now() - startTime;
      this.errorTaxonomy.customizer.timing.initialLoad = initialLoadTime;
      
      console.log(`⏱️  Customizer page initial load: ${initialLoadTime}ms (Target: <${PERFORMANCE_TARGETS.PAGE_LOAD_MS}ms)`);
      
      // Wait for ProductCustomizer component
      console.log('⏳ Waiting for ProductCustomizer component...');
      await page.waitForSelector('[data-testid="product-customizer"], .product-customizer', { 
        timeout: 15000 
      }).catch(() => {
        console.log('⚠️  ProductCustomizer selector not found, continuing with analysis...');
      });
      
      // Wait for 3D viewer initialization
      console.log('🎨 Waiting for full 3D viewer initialization...');
      await page.waitForTimeout(4000); // Full customizer needs more time
      
      // Test all material selections for comprehensive error capture
      console.log('🔍 Testing comprehensive material selection...');
      const materialButtons = await page.locator('button[data-material], [data-selected]').all();
      
      if (materialButtons.length > 0) {
        console.log(`✅ Found ${materialButtons.length} material options`);
        
        // Test each material for systematic error collection
        for (let i = 0; i < materialButtons.length; i++) {
          const switchStartTime = Date.now();
          console.log(`🔄 Testing material ${i + 1}/${materialButtons.length}...`);
          
          await materialButtons[i].click();
          await page.waitForTimeout(1000); // Allow complete material switch
          
          const switchTime = Date.now() - switchStartTime;
          console.log(`⏱️  Material switch ${i + 1}: ${switchTime}ms`);
          
          // Test drag interaction for each material
          const viewer = await page.locator('[role="img"][aria-label*="Interactive"]').first();
          if (await viewer.isVisible()) {
            const box = await viewer.boundingBox();
            if (box) {
              await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.5);
              await page.mouse.down();
              await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.5, { steps: 3 });
              await page.mouse.up();
              await page.waitForTimeout(500);
            }
          }
        }
      } else {
        console.log('⚠️  No material buttons found on customizer page');
      }
      
      // Test URL sharing feature (Phase 4 achievement)
      console.log('🔗 Testing URL sharing functionality...');
      const shareButton = await page.locator('button:has-text("Copy Link"), [data-testid="share-button"]').first();
      if (await shareButton.isVisible()) {
        await shareButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ URL sharing tested');
      }
      
      // Test keyboard navigation (WCAG 2.1 AA compliance)
      console.log('⌨️  Testing keyboard navigation...');
      await page.keyboard.press('Tab'); // Focus first interactive element
      await page.keyboard.press('ArrowRight'); // Test frame navigation
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('Home'); // Test frame reset
      await page.waitForTimeout(1000);
      console.log('✅ Keyboard navigation tested');
      
      // Extended monitoring for delayed errors
      console.log('⏱️  Extended monitoring for delayed errors...');
      await page.waitForTimeout(5000);
      
      console.log(`✅ Customizer page analysis complete. Total errors captured: ${this.errorTaxonomy.customizer.errors.length}`);
      
    } catch (error) {
      console.error('❌ Customizer page analysis failed:', error.message);
      this.errorTaxonomy.customizer.errors.push({
        timestamp: new Date().toISOString(),
        page: 'customizer',
        category: ERROR_CATEGORIES.JAVASCRIPT,
        severity: ERROR_SEVERITY.CRITICAL,
        type: 'analysis-error',
        text: `Customizer analysis failed: ${error.message}`,
        context: { stack: error.stack }
      });
    } finally {
      await page.close();
    }
  }

  // Generate comprehensive error taxonomy report
  generateErrorTaxonomyReport() {
    console.log('\n📊 PHASE 1A RESULTS: Console Error Taxonomy Report');
    console.log('=' * 70);
    
    const report = {
      timestamp: new Date().toISOString(),
      analysis: {
        scope: 'Homepage CustomizerPreviewSection + /customizer page',
        methodology: 'CLAUDE_RULES Phase-based root cause analysis',
        performanceTargets: PERFORMANCE_TARGETS
      },
      summary: {
        totalErrors: this.consoleErrors.length + this.networkErrors.length,
        homepageErrors: this.errorTaxonomy.homepage.errors.length,
        customizerErrors: this.errorTaxonomy.customizer.errors.length,
        criticalIssues: this.consoleErrors.filter(e => e.severity === ERROR_SEVERITY.CRITICAL).length
      },
      categoryBreakdown: {},
      severityBreakdown: {},
      performanceAnalysis: {
        homepage: this.errorTaxonomy.homepage.timing,
        customizer: this.errorTaxonomy.customizer.timing,
        targetsAchieved: {}
      },
      detailedFindings: {
        homepage: this.errorTaxonomy.homepage,
        customizer: this.errorTaxonomy.customizer
      }
    };
    
    // Category breakdown
    Object.values(ERROR_CATEGORIES).forEach(category => {
      const homepageCount = this.errorTaxonomy.homepage.errorsByCategory[category].length;
      const customizerCount = this.errorTaxonomy.customizer.errorsByCategory[category].length;
      report.categoryBreakdown[category] = {
        homepage: homepageCount,
        customizer: customizerCount,
        total: homepageCount + customizerCount
      };
    });
    
    // Severity breakdown
    Object.values(ERROR_SEVERITY).forEach(severity => {
      const count = this.consoleErrors.filter(e => e.severity === severity).length;
      report.severityBreakdown[severity] = count;
    });
    
    // Performance analysis against CLAUDE_RULES targets
    const homepageLoad = this.errorTaxonomy.homepage.timing.initialLoad || 0;
    const customizerLoad = this.errorTaxonomy.customizer.timing.initialLoad || 0;
    
    report.performanceAnalysis.targetsAchieved = {
      homepageLoadTarget: homepageLoad <= PERFORMANCE_TARGETS.PAGE_LOAD_MS,
      customizerLoadTarget: customizerLoad <= PERFORMANCE_TARGETS.PAGE_LOAD_MS,
      homepageLoadTime: homepageLoad,
      customizerLoadTime: customizerLoad
    };
    
    return report;
  }
  
  // Output detailed console analysis
  async outputAnalysis() {
    const report = this.generateErrorTaxonomyReport();
    
    console.log(`\n📈 SUMMARY STATISTICS`);
    console.log(`Total Console Errors Captured: ${report.summary.totalErrors}`);
    console.log(`Homepage Errors: ${report.summary.homepageErrors}`);
    console.log(`Customizer Page Errors: ${report.summary.customizerErrors}`);
    console.log(`Critical Issues: ${report.summary.criticalIssues}`);
    
    console.log(`\n🏷️  ERROR CATEGORY BREAKDOWN`);
    Object.entries(report.categoryBreakdown).forEach(([category, counts]) => {
      if (counts.total > 0) {
        console.log(`${category}: ${counts.total} (Homepage: ${counts.homepage}, Customizer: ${counts.customizer})`);
      }
    });
    
    console.log(`\n🚨 ERROR SEVERITY BREAKDOWN`);
    Object.entries(report.severityBreakdown).forEach(([severity, count]) => {
      if (count > 0) {
        console.log(`${severity.toUpperCase()}: ${count} errors`);
      }
    });
    
    console.log(`\n⏱️  PERFORMANCE ANALYSIS vs CLAUDE_RULES TARGETS`);
    console.log(`Homepage Load: ${report.performanceAnalysis.homepage.initialLoad}ms (Target: <${PERFORMANCE_TARGETS.PAGE_LOAD_MS}ms) ${report.performanceAnalysis.targetsAchieved.homepageLoadTarget ? '✅' : '❌'}`);
    console.log(`Customizer Load: ${report.performanceAnalysis.customizer.initialLoad}ms (Target: <${PERFORMANCE_TARGETS.PAGE_LOAD_MS}ms) ${report.performanceAnalysis.targetsAchieved.customizerLoadTarget ? '✅' : '❌'}`);
    
    // Save detailed report to file
    const fs = require('fs').promises;
    const reportPath = './console-error-taxonomy-report.json';
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
    
    console.log(`\n🎯 ROOT CAUSE ANALYSIS STATUS: Phase 1A Complete`);
    console.log(`📋 Next: Phase 1B - Map errors to UI interactions and component lifecycle`);
    
    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution
async function runConsoleErrorAnalysis() {
  const analyzer = new ConsoleErrorAnalyzer();
  
  try {
    await analyzer.init();
    
    // Phase 1A: Systematic console error capture
    await analyzer.analyzeHomepage();
    await analyzer.analyzeCustomizerPage();
    
    // Generate comprehensive analysis
    await analyzer.outputAnalysis();
    
  } catch (error) {
    console.error('❌ Console Error Analysis Failed:', error);
  } finally {
    await analyzer.cleanup();
  }
}

// Execute if run directly
if (require.main === module) {
  runConsoleErrorAnalysis().catch(console.error);
}

module.exports = { ConsoleErrorAnalyzer, ERROR_CATEGORIES, ERROR_SEVERITY, PERFORMANCE_TARGETS };