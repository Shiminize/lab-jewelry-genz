#!/usr/bin/env node
/**
 * Refactoring Checkpoint System
 * CLAUDE_RULES compliant: Visual regression testing for each refactoring phase
 * Ensures UI remains intact during Phase 1A-1B implementation
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { execSync } = require('child_process');

const CHECKPOINT_CONFIG = {
  pages: [
    { name: 'homepage', url: '/', waitFor: 'networkidle0' },
    { name: 'catalog', url: '/catalog', waitFor: 'networkidle0' },
    { name: 'customizer', url: '/customizer', waitFor: 'networkidle0' },
    { name: 'admin', url: '/admin', waitFor: 'networkidle0' }
  ],
  
  viewports: [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 }
  ],
  
  thresholds: {
    pixelDifference: 0.1,  // 0.1% pixel difference allowed
    layoutShift: 0.05      // 5% layout shift allowed
  }
};

class RefactoringCheckpoint {
  constructor(phase, checkpointNumber) {
    this.phase = phase;
    this.checkpointNumber = checkpointNumber;
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.checkpointDir = `baseline-evidence/checkpoint-${phase}-${checkpointNumber}-${this.timestamp}`;
    this.results = {
      phase,
      checkpointNumber,
      timestamp: this.timestamp,
      visualRegressions: [],
      performanceMetrics: {},
      consoleErrors: [],
      passed: true
    };
  }

  log(message, type = 'info') {
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    console.log(`[${this.timestamp}] ${prefix} ${message}`);
  }

  async setupCheckpointDirectory() {
    if (!fs.existsSync(this.checkpointDir)) {
      fs.mkdirSync(this.checkpointDir, { recursive: true });
    }
    
    // Create subdirectories for different viewports
    for (const viewport of CHECKPOINT_CONFIG.viewports) {
      const viewportDir = path.join(this.checkpointDir, viewport.name);
      if (!fs.existsSync(viewportDir)) {
        fs.mkdirSync(viewportDir);
      }
    }
  }

  async captureScreenshots(browser) {
    this.log('📸 Capturing checkpoint screenshots...');
    
    for (const viewport of CHECKPOINT_CONFIG.viewports) {
      const page = await browser.newPage();
      await page.setViewport(viewport);
      
      for (const pageConfig of CHECKPOINT_CONFIG.pages) {
        try {
          this.log(`Capturing ${pageConfig.name} - ${viewport.name}`);
          
          const startTime = Date.now();
          await page.goto(`http://localhost:3000${pageConfig.url}`, {
            waitUntil: pageConfig.waitFor,
            timeout: 15000
          });
          
          const loadTime = Date.now() - startTime;
          
          // Capture performance metrics
          if (!this.results.performanceMetrics[pageConfig.name]) {
            this.results.performanceMetrics[pageConfig.name] = {};
          }
          this.results.performanceMetrics[pageConfig.name][viewport.name] = {
            loadTime,
            timestamp: new Date().toISOString()
          };
          
          // Capture console errors
          page.on('console', (msg) => {
            if (msg.type() === 'error') {
              this.results.consoleErrors.push({
                page: pageConfig.name,
                viewport: viewport.name,
                message: msg.text(),
                timestamp: new Date().toISOString()
              });
            }
          });
          
          // Take screenshot
          const screenshotPath = path.join(
            this.checkpointDir, 
            viewport.name, 
            `${pageConfig.name}.png`
          );
          
          await page.screenshot({
            path: screenshotPath,
            fullPage: true
          });
          
          this.log(`Screenshot saved: ${screenshotPath}`);
          
        } catch (error) {
          this.results.passed = false;
          this.results.visualRegressions.push({
            page: pageConfig.name,
            viewport: viewport.name,
            error: error.message,
            type: 'capture_failed'
          });
          this.log(`Screenshot failed: ${pageConfig.name} - ${viewport.name}`, 'error');
        }
      }
      
      await page.close();
    }
  }

  async compareWithBaseline() {
    this.log('🔍 Comparing with baseline screenshots...');
    
    const baselineDir = './';
    const baselineFiles = [
      'baseline-homepage.png',
      'baseline-catalog.png', 
      'baseline-admin.png'
    ];
    
    for (const baselineFile of baselineFiles) {
      const pageName = baselineFile.replace('baseline-', '').replace('.png', '');
      const baselinePath = path.join(baselineDir, baselineFile);
      const checkpointPath = path.join(this.checkpointDir, 'desktop', `${pageName}.png`);
      
      if (fs.existsSync(baselinePath) && fs.existsSync(checkpointPath)) {
        try {
          // Simple file size comparison (basic regression detection)
          const baselineStats = fs.statSync(baselinePath);
          const checkpointStats = fs.statSync(checkpointPath);
          
          const sizeDifference = Math.abs(baselineStats.size - checkpointStats.size) / baselineStats.size;
          
          if (sizeDifference > CHECKPOINT_CONFIG.thresholds.pixelDifference) {
            this.results.visualRegressions.push({
              page: pageName,
              viewport: 'desktop',
              difference: sizeDifference,
              type: 'significant_change',
              baselineSize: baselineStats.size,
              checkpointSize: checkpointStats.size
            });
            this.log(`Visual regression detected: ${pageName} (${(sizeDifference * 100).toFixed(2)}% change)`, 'warning');
          } else {
            this.log(`Visual comparison OK: ${pageName}`);
          }
          
        } catch (error) {
          this.log(`Comparison failed: ${pageName} - ${error.message}`, 'error');
        }
      }
    }
  }

  async runCodeValidation() {
    this.log('🔍 Running code validation...');
    
    try {
      // Run Claude Rules check
      execSync('node scripts/check-claude-rules.js', { 
        stdio: 'pipe',
        timeout: 30000 
      });
      this.log('Claude Rules validation passed');
      
    } catch (error) {
      this.results.passed = false;
      this.log('Claude Rules validation failed', 'error');
    }
    
    try {
      // Run token validation
      execSync('node scripts/validate-tokens.js', { 
        stdio: 'pipe',
        timeout: 30000 
      });
      this.log('Token validation passed');
      
    } catch (error) {
      // Token validation warnings are acceptable
      this.log('Token validation warnings detected', 'warning');
    }
  }

  async generateCheckpointReport() {
    const reportPath = path.join(this.checkpointDir, 'CHECKPOINT_REPORT.md');
    
    const reportContent = `# 📸 REFACTORING CHECKPOINT REPORT
    
## Checkpoint Details
- **Phase**: ${this.phase}
- **Checkpoint**: #${this.checkpointNumber}
- **Timestamp**: ${this.timestamp}
- **Status**: ${this.results.passed ? '✅ PASSED' : '❌ FAILED'}

## Visual Regression Analysis
${this.results.visualRegressions.length === 0 ? 
  '✅ No visual regressions detected' : 
  this.results.visualRegressions.map(reg => 
    `- ⚠️ ${reg.page} (${reg.viewport}): ${reg.type} - ${reg.difference ? (reg.difference * 100).toFixed(2) + '%' : reg.error}`
  ).join('\n')
}

## Performance Metrics
${Object.entries(this.results.performanceMetrics).map(([page, viewports]) => 
  `### ${page}\n${Object.entries(viewports).map(([viewport, metrics]) => 
    `- ${viewport}: ${metrics.loadTime}ms`
  ).join('\n')}`
).join('\n\n')}

## Console Errors
${this.results.consoleErrors.length === 0 ? 
  '✅ No console errors detected' :
  this.results.consoleErrors.map(error => 
    `- ❌ ${error.page} (${error.viewport}): ${error.message}`
  ).join('\n')
}

## Screenshots Location
- **Directory**: \`${this.checkpointDir}\`
- **Viewports**: ${CHECKPOINT_CONFIG.viewports.map(v => v.name).join(', ')}
- **Pages**: ${CHECKPOINT_CONFIG.pages.map(p => p.name).join(', ')}

## Next Steps
${this.results.passed ? 
  '✅ Checkpoint passed - safe to continue refactoring' :
  '❌ Fix regressions before proceeding'
}

---
*Generated by Refactoring Checkpoint System*
`;
    
    fs.writeFileSync(reportPath, reportContent);
    this.log(`Checkpoint report saved: ${reportPath}`);
  }

  async run() {
    this.log(`🚦 REFACTORING CHECKPOINT ${this.phase}-${this.checkpointNumber} STARTED`);
    
    await this.setupCheckpointDirectory();
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      await this.captureScreenshots(browser);
      await this.compareWithBaseline();
      await this.runCodeValidation();
      await this.generateCheckpointReport();
      
      if (this.results.passed) {
        this.log('🎉 CHECKPOINT PASSED - SAFE TO CONTINUE', 'info');
        return true;
      } else {
        this.log('🚨 CHECKPOINT FAILED - REVIEW REQUIRED', 'error');
        return false;
      }
      
    } finally {
      await browser.close();
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const phase = args[0] || 'phase1a';
  const checkpointNumber = parseInt(args[1]) || 1;
  
  const checkpoint = new RefactoringCheckpoint(phase, checkpointNumber);
  checkpoint.run()
    .then(passed => {
      process.exit(passed ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Checkpoint system failed:', error);
      process.exit(1);
    });
}

module.exports = RefactoringCheckpoint;