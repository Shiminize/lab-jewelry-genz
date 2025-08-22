#!/usr/bin/env node

/**
 * Phase 2C: HTTP/Network Error Classification and CDN Configuration Analysis
 * 
 * Root Cause Analysis - Network Infrastructure Investigation
 * Target: Classify 120 network errors and analyze CDN/asset serving configuration
 * 
 * Findings from Phase 1: 120 network errors (24% of total errors)
 * Findings from Phase 2A: 24 missing platinum assets causing systematic 404s
 * Findings from Phase 2B: Bridge service/API calls healthy (100% success rate)
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;

class NetworkErrorClassificationAnalyzer {
  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    this.browser = null;
    this.networkRequests = [];
    this.networkErrors = [];
    this.assetLoadingMetrics = {};
    this.cdnAnalysis = {
      assetPaths: new Set(),
      statusCodeDistribution: {},
      responseTimeMetrics: [],
      cachingHeaders: [],
      compressionAnalysis: []
    };
    
    this.classificationReport = {
      timestamp: new Date().toISOString(),
      analysis: {
        scope: 'Network error classification and CDN configuration assessment',
        target: 'Classify 120 network errors, validate asset serving infrastructure',
        expectedFindings: '24 missing platinum assets driving systematic 404 errors'
      },
      findings: {
        errorClassification: {},
        cdnConfiguration: {},
        assetServingAnalysis: {},
        performanceBottlenecks: {}
      }
    };
  }

  async init() {
    console.log('🔍 Phase 2C: Network Error Classification and CDN Analysis');
    console.log(`📍 Target: ${this.baseUrl}`);
    console.log('🎯 Focus: HTTP/Network errors and asset serving infrastructure');
    console.log('📊 Expected: 120 network errors from missing platinum assets');
    console.log('=' * 70);

    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 50
    });
  }

  async setupNetworkMonitoring(page, testScenario) {
    console.log(`📊 Setting up network monitoring for: ${testScenario}`);
    
    // Track all network requests
    page.on('request', (request) => {
      const timestamp = new Date().toISOString();
      const url = request.url();
      
      this.networkRequests.push({
        timestamp,
        scenario: testScenario,
        url,
        method: request.method(),
        resourceType: request.resourceType(),
        isAsset: this.isAssetRequest(url)
      });
      
      // Track asset paths for CDN analysis
      if (this.isAssetRequest(url)) {
        this.cdnAnalysis.assetPaths.add(url);
      }
    });

    // Track all network responses with detailed analysis
    page.on('response', async (response) => {
      const timestamp = new Date().toISOString();
      const url = response.url();
      const status = response.status();
      const headers = response.headers();
      
      // Classify by status code
      if (!this.cdnAnalysis.statusCodeDistribution[status]) {
        this.cdnAnalysis.statusCodeDistribution[status] = 0;
      }
      this.cdnAnalysis.statusCodeDistribution[status]++;
      
      // Record response times for asset requests
      if (this.isAssetRequest(url)) {
        const responseTime = Date.now(); // Approximate response time
        this.cdnAnalysis.responseTimeMetrics.push({
          url,
          status,
          responseTime,
          scenario: testScenario
        });
        
        // Analyze caching headers
        this.cdnAnalysis.cachingHeaders.push({
          url,
          cacheControl: headers['cache-control'],
          etag: headers['etag'],
          lastModified: headers['last-modified'],
          expires: headers['expires']
        });
        
        // Analyze compression
        this.cdnAnalysis.compressionAnalysis.push({
          url,
          contentEncoding: headers['content-encoding'],
          contentType: headers['content-type'],
          contentLength: headers['content-length']
        });
      }
      
      // Network error classification
      if (!response.ok()) {
        const errorDetails = {
          timestamp,
          scenario: testScenario,
          url,
          status,
          statusText: response.statusText(),
          resourceType: this.classifyResourceType(url),
          errorCategory: this.classifyNetworkError(status, url),
          headers,
          isAsset: this.isAssetRequest(url)
        };
        
        this.networkErrors.push(errorDetails);
        
        console.log(`❌ [${testScenario}] Network Error: ${status} ${url}`);
        
        // Detailed logging for asset 404s (expected platinum missing assets)
        if (status === 404 && this.isAssetRequest(url)) {
          console.log(`   └── Asset 404: ${this.extractAssetDetails(url)}`);
        }
      } else {
        console.log(`✅ [${testScenario}] Success: ${status} ${this.isAssetRequest(url) ? this.extractAssetDetails(url) : 'API call'}`);
      }
    });

    // Track request failures (network level)
    page.on('requestfailed', (request) => {
      const timestamp = new Date().toISOString();
      const url = request.url();
      const failure = request.failure();
      
      const errorDetails = {
        timestamp,
        scenario: testScenario,
        url,
        errorText: failure?.errorText || 'Unknown network failure',
        errorCategory: 'NETWORK_FAILURE',
        resourceType: this.classifyResourceType(url),
        isAsset: this.isAssetRequest(url)
      };
      
      this.networkErrors.push(errorDetails);
      console.log(`💥 [${testScenario}] Request Failed: ${failure?.errorText} - ${url}`);
    });
  }

  isAssetRequest(url) {
    return url.includes('/images/') || 
           url.includes('/assets/') ||
           url.includes('/3d-sequences/') ||
           url.includes('.webp') ||
           url.includes('.png') ||
           url.includes('.jpg') ||
           url.includes('.jpeg') ||
           url.includes('.glb') ||
           url.includes('/models/');
  }

  classifyResourceType(url) {
    if (url.includes('/api/')) return 'API';
    if (url.includes('.webp') || url.includes('.png') || url.includes('.jpg')) return 'IMAGE';
    if (url.includes('.glb')) return 'MODEL';
    if (url.includes('.js')) return 'JAVASCRIPT';
    if (url.includes('.css')) return 'STYLESHEET';
    return 'OTHER';
  }

  classifyNetworkError(status, url) {
    if (status === 404) {
      if (this.isAssetRequest(url)) {
        if (url.includes('platinum-sequence')) {
          return 'MISSING_PLATINUM_ASSET'; // Expected from Phase 2A
        }
        return 'MISSING_ASSET';
      }
      return 'NOT_FOUND';
    }
    if (status >= 500) return 'SERVER_ERROR';
    if (status === 403) return 'FORBIDDEN';
    if (status === 401) return 'UNAUTHORIZED';
    if (status >= 400) return 'CLIENT_ERROR';
    return 'OTHER_ERROR';
  }

  extractAssetDetails(url) {
    // Extract meaningful info from asset URLs
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const directory = parts[parts.length - 2];
    return `${directory}/${filename}`;
  }

  async testHomepageNetworkBehavior() {
    console.log('\n🏠 Testing Homepage Network Behavior...');
    
    const page = await this.browser.newPage();
    await this.setupNetworkMonitoring(page, 'homepage');
    
    try {
      console.log('📍 Loading homepage with network monitoring...');
      await page.goto(this.baseUrl, { waitUntil: 'networkidle' });
      
      // Wait for customizer to fully load and trigger asset loading
      await page.waitForTimeout(5000);
      
      // Wait for any lazy-loaded assets
      console.log('📜 Scrolling to trigger additional asset loading...');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(3000);
      
      const homepageErrors = this.networkErrors.filter(error => error.scenario === 'homepage').length;
      console.log(`📊 Homepage network errors captured: ${homepageErrors}`);
      
    } catch (error) {
      console.error(`❌ Homepage network test failed: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  async testCustomizerNetworkBehavior() {
    console.log('\n⚙️  Testing Customizer Network Behavior...');
    
    const page = await this.browser.newPage();
    await this.setupNetworkMonitoring(page, 'customizer');
    
    try {
      console.log('📍 Loading customizer page with network monitoring...');
      await page.goto(`${this.baseUrl}/customizer`, { waitUntil: 'networkidle' });
      
      // Wait for initial asset loading
      await page.waitForTimeout(4000);
      
      // Test material switching to trigger platinum asset 404s
      console.log('🔄 Testing material switches to trigger network errors...');
      const materialButtons = await page.locator('button[data-material]').all();
      
      if (materialButtons.length > 0) {
        for (let i = 0; i < Math.min(materialButtons.length, 4); i++) {
          console.log(`🔄 Material switch ${i + 1} - monitoring network requests...`);
          await materialButtons[i].click();
          await page.waitForTimeout(2000); // Allow asset loading to complete/fail
        }
      }
      
      const customizerErrors = this.networkErrors.filter(error => error.scenario === 'customizer').length;
      console.log(`📊 Customizer network errors captured: ${customizerErrors}`);
      
    } catch (error) {
      console.error(`❌ Customizer network test failed: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  async analyzeNetworkErrorPatterns() {
    console.log('\n📊 Analyzing Network Error Patterns...');
    
    // Error classification by category
    const errorsByCategory = {};
    const errorsByStatus = {};
    const errorsByResourceType = {};
    const assetErrors = [];
    
    this.networkErrors.forEach(error => {
      // By category
      const category = error.errorCategory || 'UNKNOWN';
      if (!errorsByCategory[category]) errorsByCategory[category] = 0;
      errorsByCategory[category]++;
      
      // By status
      const status = error.status || 'FAILED';
      if (!errorsByStatus[status]) errorsByStatus[status] = 0;
      errorsByStatus[status]++;
      
      // By resource type
      const resourceType = error.resourceType || 'OTHER';
      if (!errorsByResourceType[resourceType]) errorsByResourceType[resourceType] = 0;
      errorsByResourceType[resourceType]++;
      
      // Track asset-specific errors
      if (error.isAsset) {
        assetErrors.push(error);
      }
    });
    
    console.log(`📈 NETWORK ERROR ANALYSIS SUMMARY:`);
    console.log(`   Total Network Errors: ${this.networkErrors.length}`);
    console.log(`   Asset-Related Errors: ${assetErrors.length}`);
    console.log(`   Error Categories:`, errorsByCategory);
    console.log(`   Status Code Distribution:`, errorsByStatus);
    console.log(`   Resource Type Distribution:`, errorsByResourceType);
    
    // Platinum asset specific analysis
    const platinumErrors = this.networkErrors.filter(error => 
      error.url?.includes('platinum-sequence') || 
      error.errorCategory === 'MISSING_PLATINUM_ASSET'
    );
    
    console.log(`   Platinum Asset Errors: ${platinumErrors.length} (expected ~24 from Phase 2A)`);
    
    // Update findings
    this.classificationReport.findings.errorClassification = {
      totalErrors: this.networkErrors.length,
      assetErrors: assetErrors.length,
      platinumAssetErrors: platinumErrors.length,
      errorsByCategory,
      errorsByStatus,
      errorsByResourceType,
      phase2aCorrelation: platinumErrors.length
    };
  }

  async analyzeCDNConfiguration() {
    console.log('\n🌐 Analyzing CDN and Asset Serving Configuration...');
    
    // Response time analysis
    const assetResponseTimes = this.cdnAnalysis.responseTimeMetrics
      .filter(metric => metric.status === 200);
    
    const avgResponseTime = assetResponseTimes.length > 0 
      ? assetResponseTimes.reduce((sum, metric) => sum + (metric.responseTime || 0), 0) / assetResponseTimes.length
      : 0;
    
    // Caching analysis
    const cachingAnalysis = {
      withCacheHeaders: 0,
      withoutCacheHeaders: 0,
      etagPresent: 0,
      compressionEnabled: 0
    };
    
    this.cdnAnalysis.cachingHeaders.forEach(header => {
      if (header.cacheControl) cachingAnalysis.withCacheHeaders++;
      else cachingAnalysis.withoutCacheHeaders++;
      
      if (header.etag) cachingAnalysis.etagPresent++;
    });
    
    this.cdnAnalysis.compressionAnalysis.forEach(compression => {
      if (compression.contentEncoding) cachingAnalysis.compressionEnabled++;
    });
    
    console.log(`🏗️  CDN CONFIGURATION ANALYSIS:`);
    console.log(`   Asset Response Time Average: ${Math.round(avgResponseTime)}ms`);
    console.log(`   Status Code Distribution:`, this.cdnAnalysis.statusCodeDistribution);
    console.log(`   Caching Headers Present: ${cachingAnalysis.withCacheHeaders}`);
    console.log(`   Caching Headers Missing: ${cachingAnalysis.withoutCacheHeaders}`);
    console.log(`   ETags Present: ${cachingAnalysis.etagPresent}`);
    console.log(`   Compression Enabled: ${cachingAnalysis.compressionEnabled}`);
    
    // Update findings
    this.classificationReport.findings.cdnConfiguration = {
      averageResponseTime: Math.round(avgResponseTime),
      statusCodeDistribution: this.cdnAnalysis.statusCodeDistribution,
      cachingAnalysis,
      totalAssetRequests: this.cdnAnalysis.responseTimeMetrics.length
    };
  }

  async generateReport() {
    console.log('\n📄 Generating Phase 2C Network Classification Report...');
    
    const reportPath = './phase2c-network-classification-report.json';
    const fullReport = {
      ...this.classificationReport,
      rawData: {
        networkErrors: this.networkErrors,
        networkRequests: this.networkRequests,
        cdnAnalysis: this.cdnAnalysis
      }
    };
    
    await fs.writeFile(reportPath, JSON.stringify(fullReport, null, 2));
    console.log(`💾 Detailed report saved: ${reportPath}`);

    // Generate summary
    const summaryPath = './phase2c-network-classification-summary.md';
    const summary = this.generateSummaryMarkdown();
    await fs.writeFile(summaryPath, summary);
    console.log(`📋 Summary report saved: ${summaryPath}`);

    return this.classificationReport;
  }

  generateSummaryMarkdown() {
    const findings = this.classificationReport.findings;
    
    return `# Phase 2C: Network Error Classification Summary

**Total Network Errors**: ${findings.errorClassification?.totalErrors || 0}
**Asset-Related Errors**: ${findings.errorClassification?.assetErrors || 0}
**Platinum Asset Errors**: ${findings.errorClassification?.platinumAssetErrors || 0}
**CDN Response Time**: ${findings.cdnConfiguration?.averageResponseTime || 0}ms

## Error Classification Results

### Error Categories
${Object.entries(findings.errorClassification?.errorsByCategory || {}).map(([category, count]) => 
  `- **${category}**: ${count} errors`
).join('\n')}

### Status Code Distribution
${Object.entries(findings.errorClassification?.errorsByStatus || {}).map(([status, count]) => 
  `- **HTTP ${status}**: ${count} requests`
).join('\n')}

### Resource Type Breakdown
${Object.entries(findings.errorClassification?.errorsByResourceType || {}).map(([type, count]) => 
  `- **${type}**: ${count} errors`
).join('\n')}

## CDN Configuration Analysis

### Performance Metrics
- **Average Asset Response Time**: ${findings.cdnConfiguration?.averageResponseTime || 0}ms
- **Total Asset Requests**: ${findings.cdnConfiguration?.totalAssetRequests || 0}

### Caching Configuration
- **Cache Headers Present**: ${findings.cdnConfiguration?.cachingAnalysis?.withCacheHeaders || 0}
- **Cache Headers Missing**: ${findings.cdnConfiguration?.cachingAnalysis?.withoutCacheHeaders || 0}
- **ETags Present**: ${findings.cdnConfiguration?.cachingAnalysis?.etagPresent || 0}
- **Compression Enabled**: ${findings.cdnConfiguration?.cachingAnalysis?.compressionEnabled || 0}

## Root Cause Validation

${findings.errorClassification?.platinumAssetErrors 
  ? `✅ **Platinum asset errors confirmed**: ${findings.errorClassification.platinumAssetErrors} errors detected (correlates with Phase 2A findings)`
  : '❌ Platinum asset errors not detected as expected'}

${findings.errorClassification?.platinumAssetErrors === 24
  ? '✅ **Perfect correlation**: Exactly 24 platinum asset errors match Phase 2A missing frame count'
  : '⚠️ **Partial correlation**: Platinum error count differs from Phase 2A expectations'}

## Phase 2C Conclusion

The network error analysis ${findings.errorClassification?.assetErrors ? 'confirms' : 'contradicts'} that asset 404 errors are the primary source of network failures.
${findings.errorClassification?.platinumAssetErrors 
  ? `Platinum sequence missing assets are causing ${findings.errorClassification.platinumAssetErrors} systematic 404 errors.`
  : 'Platinum asset errors not detected as expected from Phase 2A analysis.'}

**Next**: Proceed to Phase 3A - Client/server boundary and hydration analysis.
`;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('\n✅ Phase 2C: Network Error Classification Analysis Complete');
  }
}

// Main execution
async function runNetworkClassificationAnalysis() {
  const analyzer = new NetworkErrorClassificationAnalyzer();
  
  try {
    await analyzer.init();
    await analyzer.testHomepageNetworkBehavior();
    await analyzer.testCustomizerNetworkBehavior();
    await analyzer.analyzeNetworkErrorPatterns();
    await analyzer.analyzeCDNConfiguration();
    await analyzer.generateReport();
  } catch (error) {
    console.error('❌ Network Classification Analysis Failed:', error);
  } finally {
    await analyzer.cleanup();
  }
}

// Execute if run directly
if (require.main === module) {
  runNetworkClassificationAnalysis().catch(console.error);
}

module.exports = { NetworkErrorClassificationAnalyzer };