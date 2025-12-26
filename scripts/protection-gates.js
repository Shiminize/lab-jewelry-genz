#!/usr/bin/env node
/**
 * Protection Gates System
 * CLAUDE_RULES compliant: Automated safety validation before refactoring
 * Prevents breaking changes during Phase 1A implementation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROTECTION_RULES = {
  // Core production files that must never break
  CRITICAL_FILES: [
    'src/lib/prisma.ts',
    'src/lib/concierge/engine.ts',
    'app/api/admin/products/route.ts',
    'app/api/health/route.ts',
    'src/middleware.ts',
    'package.json'
  ],

  // Server health indicators
  SERVER_HEALTH: {
    maxResponseTime: 1000, // Increased for dev env
    maxMemoryUsage: 1500, // MB
    requiredEndpoints: ['/api/health', '/']
  },

  // Build requirements
  BUILD_GATES: {
    allowTypeErrors: false,
    allowLintWarnings: true,
    maxBundleSize: 5120000 // 5MB for restored version
  }
};

class ProtectionGates {
  constructor() {
    this.results = {
      fileIntegrity: true,
      serverHealth: true,
      buildStatus: true,
      timestamp: new Date().toISOString(),
      errors: [],
      warnings: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async validateFileIntegrity() {
    this.log('🔍 Validating critical file integrity...');

    for (const filePath of PROTECTION_RULES.CRITICAL_FILES) {
      const fullPath = path.join(process.cwd(), filePath);

      if (!fs.existsSync(fullPath)) {
        this.results.fileIntegrity = false;
        this.results.errors.push(`Critical file missing: ${filePath}`);
        this.log(`Missing critical file: ${filePath}`, 'error');
        continue;
      }

      // Check for syntax errors in TypeScript files
      // NOTE: Removed individual tsc check as it fails with path aliases.
      // We rely on validateBuildStatus() for type checking.
      this.log(`File integrity OK: ${filePath}`);
    }
  }

  async validateServerHealth() {
    this.log('🏥 Validating server health...');

    try {
      // Test critical endpoints
      for (const endpoint of PROTECTION_RULES.SERVER_HEALTH.requiredEndpoints) {
        const startTime = Date.now();

        const response = await fetch(`http://localhost:3000${endpoint}`, {
          timeout: PROTECTION_RULES.SERVER_HEALTH.maxResponseTime
        });

        const responseTime = Date.now() - startTime;

        if (!response.ok) {
          this.results.serverHealth = false;
          this.results.errors.push(`Endpoint ${endpoint} returned ${response.status}`);
          this.log(`Endpoint failed: ${endpoint} (${response.status})`, 'error');
        } else if (responseTime > PROTECTION_RULES.SERVER_HEALTH.maxResponseTime) {
          this.results.warnings.push(`Slow response: ${endpoint} (${responseTime}ms)`);
          this.log(`Slow response: ${endpoint} (${responseTime}ms)`, 'warning');
        } else {
          this.log(`Endpoint OK: ${endpoint} (${responseTime}ms)`);
        }
      }
    } catch (error) {
      this.results.serverHealth = false;
      this.results.errors.push(`Server health check failed: ${error.message}`);
      this.log('Server health check failed', 'error');
    }
  }

  async validateBuildStatus() {
    this.log('🔨 Validating build status...');

    try {
      // Test Next.js build
      const buildOutput = execSync('npm run build', {
        stdio: 'pipe',
        timeout: 120000,
        encoding: 'utf8'
      });

      // Check for build errors
      if (buildOutput.includes('Failed to compile')) {
        this.results.buildStatus = false;
        this.results.errors.push('Build compilation failed');
        this.log('Build compilation failed', 'error');
      } else {
        this.log('Build compilation successful');
      }

      // Check bundle size
      const analyzePath = '.next/analyze/client.json';
      if (fs.existsSync(analyzePath)) {
        const stats = JSON.parse(fs.readFileSync(analyzePath, 'utf8'));
        const bundleSize = stats.parsed;

        if (bundleSize > PROTECTION_RULES.BUILD_GATES.maxBundleSize) {
          this.results.warnings.push(`Large bundle size: ${bundleSize} bytes`);
          this.log(`Large bundle size: ${Math.round(bundleSize / 1024)}KB`, 'warning');
        } else {
          this.log(`Bundle size OK: ${Math.round(bundleSize / 1024)}KB`);
        }
      } else {
        this.log('Bundle analysis skipped: .next/analyze/client.json not found', 'warning');
        this.results.warnings.push('Bundle analysis skipped (missing configuration)');
      }

    } catch (error) {
      this.results.buildStatus = false;
      this.results.errors.push(`Build validation failed: ${error.message}`);
      this.log('Build validation failed', 'error');
    }
  }

  async createSafetyReport() {
    const report = {
      ...this.results,
      gatesPassed: this.results.fileIntegrity && this.results.serverHealth && this.results.buildStatus,
      recommendation: this.results.errors.length === 0 ?
        'SAFE TO PROCEED with refactoring' :
        'HALT - Fix errors before proceeding'
    };

    const reportPath = 'baseline-evidence/PROTECTION_GATES_REPORT.md';
    const reportContent = `# 🛡️ PROTECTION GATES REPORT

## Summary
- **Status**: ${report.gatesPassed ? '✅ GATES PASSED' : '❌ GATES FAILED'}
- **Recommendation**: ${report.recommendation}
- **Timestamp**: ${report.timestamp}

## File Integrity: ${report.fileIntegrity ? '✅ PASS' : '❌ FAIL'}
${report.fileIntegrity ? '- All critical files validated' : '- Critical file issues detected'}

## Server Health: ${report.serverHealth ? '✅ PASS' : '❌ FAIL'}  
${report.serverHealth ? '- All endpoints responding' : '- Server issues detected'}

## Build Status: ${report.buildStatus ? '✅ PASS' : '❌ FAIL'}
${report.buildStatus ? '- Build compilation successful' : '- Build issues detected'}

## Errors (${report.errors.length})
${report.errors.map(error => `- ❌ ${error}`).join('\n') || '- None'}

## Warnings (${report.warnings.length})
${report.warnings.map(warning => `- ⚠️ ${warning}`).join('\n') || '- None'}

## Next Steps
${report.gatesPassed ?
        '✅ Protection gates passed - safe to begin Phase 1A refactoring' :
        '❌ Fix all errors before proceeding with refactoring'
      }
`;

    fs.writeFileSync(reportPath, reportContent);
    this.log(`Protection gates report saved: ${reportPath}`);

    return report;
  }

  async run() {
    this.log('🚦 PROTECTION GATES SYSTEM ACTIVATED');
    this.log('🔒 Validating production safety before refactoring...');

    await this.validateFileIntegrity();
    await this.validateServerHealth();
    await this.validateBuildStatus();

    const report = await this.createSafetyReport();

    if (report.gatesPassed) {
      this.log('🎉 ALL PROTECTION GATES PASSED - SAFE TO PROCEED', 'info');
      process.exit(0);
    } else {
      this.log('🚨 PROTECTION GATES FAILED - HALT REFACTORING', 'error');
      process.exit(1);
    }
  }
}

// Run protection gates if called directly
if (require.main === module) {
  const gates = new ProtectionGates();
  gates.run().catch(error => {
    console.error('❌ Protection gates system failed:', error);
    process.exit(1);
  });
}

module.exports = ProtectionGates;
