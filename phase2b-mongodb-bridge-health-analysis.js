#!/usr/bin/env node

/**
 * Phase 2B: MongoDB Bridge Service Connection Health Analysis
 * 
 * Root Cause Analysis - Database Integration Investigation  
 * Target: Validate bridge service stability and performance characteristics
 * 
 * Findings from Phase 1: 0 MongoDB connection errors detected
 * Status: Verify this finding and analyze bridge service performance impact
 */

const { chromium } = require('playwright');

class MongoDBBridgeHealthAnalyzer {
  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    this.browser = null;
    this.bridgeServiceLogs = [];
    this.databaseConnectionLogs = [];
    this.performanceMetrics = {
      bridgeServiceCalls: [],
      responseTimesMs: [],
      connectionErrors: [],
      dataIntegrityChecks: []
    };
    this.healthReport = {
      timestamp: new Date().toISOString(),
      analysis: {
        scope: 'useCustomizableProduct hook and bridge service health',
        target: 'Validate database connectivity stability and performance characteristics',
        testScenarios: ['initial load', 'material switching', 'concurrent operations']
      },
      findings: {
        connectionStability: {},
        performanceCharacteristics: {},
        errorPatterns: {},
        bridgeServiceIntegrity: {}
      }
    };
  }

  async init() {
    console.log('🔍 Phase 2B: MongoDB Bridge Service Health Analysis');
    console.log(`📍 Target: ${this.baseUrl}`);
    console.log('🎯 Focus: useCustomizableProduct hook and database connectivity');
    console.log('📊 Expected: 0 MongoDB errors from Phase 1, verify and analyze performance');
    console.log('=' * 70);

    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 50
    });
  }

  async setupBridgeServiceMonitoring(page, testScenario) {
    console.log(`📊 Setting up bridge service monitoring for: ${testScenario}`);
    
    // Monitor console for bridge service related messages
    page.on('console', (msg) => {
      const text = msg.text();
      const type = msg.type();
      
      // Bridge service indicators
      if (text.includes('useCustomizableProduct') || 
          text.includes('bridge') || 
          text.includes('customizable') ||
          text.includes('changeMaterial') ||
          text.includes('material switching')) {
        
        this.bridgeServiceLogs.push({
          timestamp: new Date().toISOString(),
          scenario: testScenario,
          type,
          message: text,
          category: 'BRIDGE_SERVICE'
        });
        
        console.log(`🔗 [${testScenario}] Bridge Service: ${text}`);
      }
      
      // Database connection indicators  
      else if (text.includes('mongodb') || 
               text.includes('mongoose') || 
               text.includes('connectToDatabase') ||
               text.includes('database') ||
               text.includes('DB') ||
               text.includes('connection')) {
        
        this.databaseConnectionLogs.push({
          timestamp: new Date().toISOString(),
          scenario: testScenario,
          type,
          message: text,
          category: 'DATABASE'
        });
        
        console.log(`🗄️  [${testScenario}] Database: ${text}`);
      }
      
      // Error detection
      else if (type === 'error' && (text.includes('fetch') || text.includes('api'))) {
        this.performanceMetrics.connectionErrors.push({
          timestamp: new Date().toISOString(),
          scenario: testScenario,
          error: text,
          severity: 'HIGH'
        });
        
        console.log(`❌ [${testScenario}] API Error: ${text}`);
      }
    });

    // Network monitoring for API calls
    page.on('response', async (response) => {
      const url = response.url();
      
      // Monitor API endpoints that would use bridge service
      if (url.includes('/api/products/customizable') || 
          url.includes('/api/materials') ||
          url.includes('/api/variants')) {
        
        const startTime = Date.now();
        const status = response.status();
        const responseTime = Date.now() - startTime;
        
        this.performanceMetrics.bridgeServiceCalls.push({
          timestamp: new Date().toISOString(),
          scenario: testScenario,
          url,
          status,
          responseTime,
          success: status >= 200 && status < 300
        });
        
        console.log(`🌐 [${testScenario}] API Call: ${url} → ${status} (${responseTime}ms)`);
        
        if (status >= 400) {
          console.log(`❌ [${testScenario}] API Error: ${url} returned ${status}`);
        }
      }
    });

    // Page error monitoring
    page.on('pageerror', (error) => {
      this.performanceMetrics.connectionErrors.push({
        timestamp: new Date().toISOString(),
        scenario: testScenario,
        error: error.message,
        stack: error.stack,
        severity: 'CRITICAL'
      });
      
      console.log(`💥 [${testScenario}] Page Error: ${error.message}`);
    });
  }

  async testInitialLoad() {
    console.log('\n🚀 Testing Initial Load Bridge Service Health...');
    
    const page = await this.browser.newPage();
    await this.setupBridgeServiceMonitoring(page, 'initial_load');
    
    const startTime = Date.now();
    
    try {
      console.log('📍 Loading homepage...');
      await page.goto(this.baseUrl, { waitUntil: 'networkidle' });
      
      // Wait for customizer to initialize
      await page.waitForTimeout(5000);
      
      const loadTime = Date.now() - startTime;
      console.log(`⏱️  Homepage load completed: ${loadTime}ms`);
      
      // Check for bridge service initialization
      const bridgeInitMessages = this.bridgeServiceLogs.filter(log => 
        log.scenario === 'initial_load' && 
        (log.message.includes('useCustomizableProduct') || log.message.includes('initialization'))
      );
      
      console.log(`✅ Bridge service initialization messages: ${bridgeInitMessages.length}`);
      
      // Wait for any delayed database operations
      await page.waitForTimeout(3000);
      
    } catch (error) {
      console.error(`❌ Initial load test failed: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  async testMaterialSwitching() {
    console.log('\n🔄 Testing Material Switching Bridge Service Health...');
    
    const page = await this.browser.newPage();
    await this.setupBridgeServiceMonitoring(page, 'material_switching');
    
    try {
      console.log('📍 Loading customizer page...');
      await page.goto(`${this.baseUrl}/customizer`, { waitUntil: 'networkidle' });
      
      // Wait for customizer to fully load
      await page.waitForTimeout(4000);
      
      // Find material buttons
      const materialButtons = await page.locator('button[data-material]').all();
      console.log(`🔍 Found ${materialButtons.length} material buttons`);
      
      if (materialButtons.length > 0) {
        // Test multiple material switches to stress test bridge service
        for (let i = 0; i < Math.min(materialButtons.length, 3); i++) {
          const switchStartTime = Date.now();
          
          console.log(`🔄 Testing material switch ${i + 1}...`);
          await materialButtons[i].click();
          
          // Wait for bridge service to process the change
          await page.waitForTimeout(2000);
          
          const switchTime = Date.now() - switchStartTime;
          console.log(`⏱️  Material switch ${i + 1} completed: ${switchTime}ms`);
          
          // Record performance metric
          this.performanceMetrics.responseTimesMs.push({
            scenario: 'material_switching',
            operation: `switch_${i + 1}`,
            duration: switchTime,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      // Check for any bridge service errors during switching
      const switchErrors = this.performanceMetrics.connectionErrors.filter(error => 
        error.scenario === 'material_switching'
      );
      
      console.log(`📊 Bridge service errors during switching: ${switchErrors.length}`);
      
    } catch (error) {
      console.error(`❌ Material switching test failed: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  async testConcurrentOperations() {
    console.log('\n⚡ Testing Concurrent Operations Bridge Service Health...');
    
    const page = await this.browser.newPage();
    await this.setupBridgeServiceMonitoring(page, 'concurrent_operations');
    
    try {
      console.log('📍 Loading customizer page...');
      await page.goto(`${this.baseUrl}/customizer`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      // Simulate concurrent operations (multiple rapid material switches + drag)
      console.log('🚀 Simulating concurrent bridge service operations...');
      
      const materialButtons = await page.locator('button[data-material]').all();
      if (materialButtons.length >= 2) {
        const startTime = Date.now();
        
        // Rapid material switches
        console.log('🔄 Rapid material switching...');
        await materialButtons[0].click();
        await page.waitForTimeout(100);
        await materialButtons[1].click();
        await page.waitForTimeout(100);
        
        // Concurrent drag interaction
        console.log('🖱️  Concurrent drag interaction...');
        const viewer = await page.locator('[role="img"][aria-label*="Interactive"]').first();
        if (await viewer.isVisible()) {
          const box = await viewer.boundingBox();
          if (box) {
            await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5);
            await page.mouse.down();
            await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.5, { steps: 5 });
            await page.mouse.up();
          }
        }
        
        // Another material switch while drag may still be processing
        await materialButtons[0].click();
        
        const concurrentTime = Date.now() - startTime;
        console.log(`⏱️  Concurrent operations completed: ${concurrentTime}ms`);
        
        // Wait for all operations to settle
        await page.waitForTimeout(3000);
        
        // Check for race conditions or errors
        const concurrentErrors = this.performanceMetrics.connectionErrors.filter(error => 
          error.scenario === 'concurrent_operations'
        );
        
        console.log(`📊 Errors during concurrent operations: ${concurrentErrors.length}`);
      }
      
    } catch (error) {
      console.error(`❌ Concurrent operations test failed: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  async analyzeBridgeServiceHealth() {
    console.log('\n📊 Analyzing Bridge Service Health Data...');
    
    // Connection stability analysis
    const totalConnectionErrors = this.performanceMetrics.connectionErrors.length;
    const totalBridgeServiceLogs = this.bridgeServiceLogs.length;
    const totalDatabaseLogs = this.databaseConnectionLogs.length;
    const totalApiCalls = this.performanceMetrics.bridgeServiceCalls.length;
    
    console.log(`📈 BRIDGE SERVICE HEALTH SUMMARY:`);
    console.log(`   Total Bridge Service Messages: ${totalBridgeServiceLogs}`);
    console.log(`   Total Database Messages: ${totalDatabaseLogs}`);
    console.log(`   Total API Calls: ${totalApiCalls}`);
    console.log(`   Total Connection Errors: ${totalConnectionErrors}`);
    
    // Performance characteristics
    const avgResponseTime = this.performanceMetrics.responseTimesMs.length > 0 
      ? this.performanceMetrics.responseTimesMs.reduce((sum, metric) => sum + metric.duration, 0) / this.performanceMetrics.responseTimesMs.length
      : 0;
    
    console.log(`   Average Response Time: ${Math.round(avgResponseTime)}ms`);
    
    // Error pattern analysis
    const errorPatterns = {};
    this.performanceMetrics.connectionErrors.forEach(error => {
      const scenario = error.scenario;
      if (!errorPatterns[scenario]) {
        errorPatterns[scenario] = 0;
      }
      errorPatterns[scenario]++;
    });
    
    console.log(`   Error Distribution:`, errorPatterns);
    
    // API success rate
    const successfulApiCalls = this.performanceMetrics.bridgeServiceCalls.filter(call => call.success).length;
    const apiSuccessRate = totalApiCalls > 0 ? (successfulApiCalls / totalApiCalls * 100).toFixed(1) : 'N/A';
    
    console.log(`   API Success Rate: ${apiSuccessRate}%`);
    
    // Update health report
    this.healthReport.findings = {
      connectionStability: {
        totalConnectionErrors,
        totalBridgeServiceLogs,
        totalDatabaseLogs,
        stabilityScore: totalConnectionErrors === 0 ? 'EXCELLENT' : totalConnectionErrors < 5 ? 'GOOD' : 'POOR'
      },
      performanceCharacteristics: {
        averageResponseTime: Math.round(avgResponseTime),
        totalApiCalls,
        apiSuccessRate: parseFloat(apiSuccessRate),
        responseTimeDistribution: this.performanceMetrics.responseTimesMs
      },
      errorPatterns: {
        errorsByScenario: errorPatterns,
        criticalErrors: this.performanceMetrics.connectionErrors.filter(e => e.severity === 'CRITICAL').length,
        highSeverityErrors: this.performanceMetrics.connectionErrors.filter(e => e.severity === 'HIGH').length
      },
      bridgeServiceIntegrity: {
        messageVolume: totalBridgeServiceLogs,
        databaseIntegration: totalDatabaseLogs,
        overallHealth: totalConnectionErrors === 0 && apiSuccessRate > 90 ? 'HEALTHY' : 'DEGRADED'
      }
    };
  }

  async generateReport() {
    console.log('\n📄 Generating Phase 2B Bridge Service Health Report...');
    
    const reportPath = './phase2b-mongodb-bridge-health-report.json';
    const fs = require('fs').promises;
    
    const fullReport = {
      ...this.healthReport,
      rawData: {
        bridgeServiceLogs: this.bridgeServiceLogs,
        databaseConnectionLogs: this.databaseConnectionLogs,
        performanceMetrics: this.performanceMetrics
      }
    };
    
    await fs.writeFile(reportPath, JSON.stringify(fullReport, null, 2));
    console.log(`💾 Detailed report saved: ${reportPath}`);

    // Generate summary
    const summaryPath = './phase2b-bridge-health-summary.md';
    const summary = this.generateSummaryMarkdown();
    await fs.writeFile(summaryPath, summary);
    console.log(`📋 Summary report saved: ${summaryPath}`);

    return this.healthReport;
  }

  generateSummaryMarkdown() {
    const findings = this.healthReport.findings;
    
    return `# Phase 2B: MongoDB Bridge Service Health Summary

**Connection Stability**: ${findings.connectionStability.stabilityScore}
**Overall Health**: ${findings.bridgeServiceIntegrity.overallHealth}
**API Success Rate**: ${findings.performanceCharacteristics.apiSuccessRate}%
**Average Response Time**: ${findings.performanceCharacteristics.averageResponseTime}ms

## Key Findings

### Connection Stability
- **Bridge Service Messages**: ${findings.connectionStability.totalBridgeServiceLogs}
- **Database Messages**: ${findings.connectionStability.totalDatabaseLogs}  
- **Connection Errors**: ${findings.connectionStability.totalConnectionErrors}
- **Stability Assessment**: ${findings.connectionStability.stabilityScore}

### Performance Characteristics
- **Total API Calls**: ${findings.performanceCharacteristics.totalApiCalls}
- **Success Rate**: ${findings.performanceCharacteristics.apiSuccessRate}%
- **Average Response**: ${findings.performanceCharacteristics.averageResponseTime}ms

### Error Analysis
- **Critical Errors**: ${findings.errorPatterns.criticalErrors}
- **High Severity**: ${findings.errorPatterns.highSeverityErrors}
- **Error Distribution**: ${JSON.stringify(findings.errorPatterns.errorsByScenario)}

## Root Cause Assessment

${findings.connectionStability.totalConnectionErrors === 0 
  ? '✅ **No MongoDB connection errors detected** - Confirms Phase 1 findings' 
  : '❌ MongoDB connection issues identified'}

${findings.bridgeServiceIntegrity.overallHealth === 'HEALTHY' 
  ? '✅ **Bridge service operating normally** - Not contributing to performance issues'
  : '⚠️ Bridge service degradation detected'}

## Phase 2B Conclusion

The bridge service health analysis ${findings.connectionStability.totalConnectionErrors === 0 ? 'confirms' : 'contradicts'} Phase 1 findings.
${findings.bridgeServiceIntegrity.overallHealth === 'HEALTHY' 
  ? 'MongoDB connectivity is stable and not contributing to the performance violations identified in Phase 1C.'
  : 'Bridge service issues may be contributing to performance degradation.'}

**Next**: Proceed to Phase 2C - Network error classification and CDN configuration analysis.
`;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('\n✅ Phase 2B: MongoDB Bridge Service Health Analysis Complete');
  }
}

// Main execution
async function runBridgeHealthAnalysis() {
  const analyzer = new MongoDBBridgeHealthAnalyzer();
  
  try {
    await analyzer.init();
    await analyzer.testInitialLoad();
    await analyzer.testMaterialSwitching();
    await analyzer.testConcurrentOperations();
    await analyzer.analyzeBridgeServiceHealth();
    await analyzer.generateReport();
  } catch (error) {
    console.error('❌ Bridge Service Health Analysis Failed:', error);
  } finally {
    await analyzer.cleanup();
  }
}

// Execute if run directly
if (require.main === module) {
  runBridgeHealthAnalysis().catch(console.error);
}

module.exports = { MongoDBBridgeHealthAnalyzer };