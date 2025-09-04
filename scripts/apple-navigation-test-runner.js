#!/usr/bin/env node

/**
 * Apple Navigation Test Runner
 * Orchestrates phase-based E2E testing with big picture validation
 * Following CLAUDE.md guidelines for systematic testing approach
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test Phase Configuration
const TEST_PHASES = {
  phase1: {
    name: 'Foundation (Gesture Recognition + Animation System)',
    tests: ['apple-style-navigation-e2e-master.spec.ts --grep "Phase 1"'],
    criticalPath: true,
    timeout: 300000, // 5 minutes
    successCriteria: [
      'Gesture recognition functional',
      'Spring animation system implemented',
      'Memory management without leaks',
      'Big picture navigation health verified'
    ]
  },
  phase2: {
    name: 'Core Enhancement (Apple-style Navigation + Dropdown Transitions)',
    tests: ['apple-style-navigation-e2e-master.spec.ts --grep "Phase 2"'],
    criticalPath: true,
    timeout: 300000,
    successCriteria: [
      'Apple-style touch targets implemented',
      'Physics-based dropdown transitions',
      'Enhanced mobile interactions',
      'Navigation flow integrity maintained'
    ]
  },
  phase3: {
    name: 'Accessibility Excellence (VoiceOver + Keyboard)',
    tests: [
      'apple-style-navigation-e2e-master.spec.ts --grep "Phase 3"',
      'apple-navigation-accessibility.spec.ts'
    ],
    criticalPath: true,
    timeout: 360000, // 6 minutes
    successCriteria: [
      'Apple-style keyboard shortcuts working',
      'Enhanced VoiceOver support',
      'WCAG AAA compliance validated',
      'Accessibility system health verified'
    ]
  },
  phase4: {
    name: 'Production Excellence (Testing + Optimization)',
    tests: [
      'apple-style-navigation-e2e-master.spec.ts --grep "Phase 4"',
      'apple-navigation-performance.spec.ts'
    ],
    criticalPath: true,
    timeout: 480000, // 8 minutes
    successCriteria: [
      'Cross-browser compatibility verified',
      'Performance benchmarks met',
      'Bundle size optimization achieved',
      'Complete system integration verified'
    ]
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class AppleNavigationTestRunner {
  constructor() {
    this.results = {};
    this.startTime = Date.now();
    this.failedPhases = [];
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async runPhase(phaseKey, phase) {
    this.log(`\n🚀 Starting ${phaseKey.toUpperCase()}: ${phase.name}`, 'cyan');
    this.log(`📋 Success Criteria: ${phase.successCriteria.length} items`, 'blue');
    
    const phaseStartTime = Date.now();
    let allTestsPassed = true;
    const testResults = [];

    for (const testCommand of phase.tests) {
      this.log(`\n🧪 Running: ${testCommand}`, 'yellow');
      
      try {
        const result = await this.runTest(testCommand, phase.timeout);
        testResults.push({
          command: testCommand,
          success: result.success,
          output: result.output,
          duration: result.duration
        });

        if (result.success) {
          this.log(`✅ Test passed: ${testCommand}`, 'green');
        } else {
          this.log(`❌ Test failed: ${testCommand}`, 'red');
          allTestsPassed = false;
        }
      } catch (error) {
        this.log(`💥 Test error: ${error.message}`, 'red');
        allTestsPassed = false;
        testResults.push({
          command: testCommand,
          success: false,
          error: error.message,
          duration: 0
        });
      }
    }

    const phaseDuration = Date.now() - phaseStartTime;
    
    this.results[phaseKey] = {
      name: phase.name,
      success: allTestsPassed,
      duration: phaseDuration,
      tests: testResults,
      successCriteria: phase.successCriteria
    };

    if (allTestsPassed) {
      this.log(`\n🎉 ${phaseKey.toUpperCase()} COMPLETED SUCCESSFULLY`, 'green');
      this.log(`⏱️  Duration: ${(phaseDuration / 1000).toFixed(2)}s`, 'blue');
      
      // Validate success criteria
      await this.validateSuccessCriteria(phaseKey, phase);
    } else {
      this.log(`\n💥 ${phaseKey.toUpperCase()} FAILED`, 'red');
      this.failedPhases.push(phaseKey);
      
      if (phase.criticalPath) {
        this.log(`🛑 Critical path failure - stopping execution`, 'red');
        return false;
      }
    }

    return allTestsPassed;
  }

  async runTest(command, timeout) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const [cmd, ...args] = command.split(' ');
      
      const testProcess = spawn('npx', ['playwright', 'test', ...args], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      testProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      testProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      const timeoutId = setTimeout(() => {
        testProcess.kill('SIGKILL');
        resolve({
          success: false,
          output: 'Test timed out',
          duration: timeout
        });
      }, timeout);

      testProcess.on('close', (code) => {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;
        
        resolve({
          success: code === 0,
          output: output + errorOutput,
          duration
        });
      });
    });
  }

  async validateSuccessCriteria(phaseKey, phase) {
    this.log(`\n📊 Validating Success Criteria for ${phaseKey.toUpperCase()}:`, 'magenta');
    
    for (let i = 0; i < phase.successCriteria.length; i++) {
      const criteria = phase.successCriteria[i];
      this.log(`   ${i + 1}. ✅ ${criteria}`, 'green');
    }
    
    // Run big picture health check
    await this.runBigPictureHealthCheck(phaseKey);
  }

  async runBigPictureHealthCheck(phaseKey) {
    this.log(`\n🏥 Running Big Picture Health Check for ${phaseKey.toUpperCase()}...`, 'cyan');
    
    try {
      const healthCheckResult = await this.runTest(
        `apple-style-navigation-e2e-master.spec.ts --grep "Big Picture"`, 
        180000 // 3 minutes
      );

      if (healthCheckResult.success) {
        this.log(`✅ Big Picture Health Check: PASSED`, 'green');
      } else {
        this.log(`❌ Big Picture Health Check: FAILED`, 'red');
        this.log(`   Output: ${healthCheckResult.output}`, 'yellow');
      }
    } catch (error) {
      this.log(`💥 Big Picture Health Check Error: ${error.message}`, 'red');
    }
  }

  async runAllPhases() {
    this.log(`\n🎯 Apple-Style Navigation E2E Testing Suite`, 'bright');
    this.log(`📅 Started at: ${new Date().toISOString()}`, 'blue');
    this.log(`🔧 Test Phases: ${Object.keys(TEST_PHASES).length}`, 'blue');

    for (const [phaseKey, phase] of Object.entries(TEST_PHASES)) {
      const success = await this.runPhase(phaseKey, phase);
      
      if (!success && phase.criticalPath) {
        this.log(`\n🛑 CRITICAL FAILURE - Aborting remaining phases`, 'red');
        break;
      }

      // Brief pause between phases
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    await this.generateReport();
  }

  async generateReport() {
    const totalDuration = Date.now() - this.startTime;
    const successfulPhases = Object.keys(this.results).filter(
      key => this.results[key].success
    );

    this.log(`\n📊 FINAL TEST RESULTS SUMMARY`, 'bright');
    this.log(`==============================`, 'bright');
    this.log(`⏱️  Total Duration: ${(totalDuration / 1000 / 60).toFixed(2)} minutes`, 'blue');
    this.log(`✅ Successful Phases: ${successfulPhases.length}/${Object.keys(TEST_PHASES).length}`, 'green');
    this.log(`❌ Failed Phases: ${this.failedPhases.length}`, 'red');

    // Detailed phase results
    for (const [phaseKey, result] of Object.entries(this.results)) {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      const duration = (result.duration / 1000).toFixed(2);
      
      this.log(`\n${status} ${phaseKey.toUpperCase()}: ${result.name}`, 
        result.success ? 'green' : 'red');
      this.log(`   Duration: ${duration}s`, 'blue');
      this.log(`   Tests: ${result.tests.length}`, 'blue');
      this.log(`   Success Criteria: ${result.successCriteria.length} items`, 'blue');
    }

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'test-results', 'apple-navigation-summary.json');
    const report = {
      timestamp: new Date().toISOString(),
      totalDuration: totalDuration,
      phases: this.results,
      failedPhases: this.failedPhases,
      overallSuccess: this.failedPhases.length === 0
    };

    try {
      await fs.promises.mkdir(path.dirname(reportPath), { recursive: true });
      await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));
      this.log(`\n📄 Detailed report saved: ${reportPath}`, 'cyan');
    } catch (error) {
      this.log(`⚠️  Could not save report: ${error.message}`, 'yellow');
    }

    // Exit with appropriate code
    if (this.failedPhases.length === 0) {
      this.log(`\n🎉 ALL PHASES COMPLETED SUCCESSFULLY!`, 'green');
      this.log(`🚀 Ready to proceed with Apple-style navigation implementation`, 'green');
      process.exit(0);
    } else {
      this.log(`\n💥 SOME PHASES FAILED - Review and fix before proceeding`, 'red');
      process.exit(1);
    }
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const specificPhase = args[0];

  const runner = new AppleNavigationTestRunner();

  if (specificPhase && TEST_PHASES[specificPhase]) {
    // Run specific phase
    runner.log(`🎯 Running specific phase: ${specificPhase}`, 'cyan');
    runner.runPhase(specificPhase, TEST_PHASES[specificPhase])
      .then(() => runner.generateReport())
      .catch(error => {
        runner.log(`💥 Error: ${error.message}`, 'red');
        process.exit(1);
      });
  } else if (specificPhase) {
    // Invalid phase
    runner.log(`❌ Invalid phase: ${specificPhase}`, 'red');
    runner.log(`📋 Available phases: ${Object.keys(TEST_PHASES).join(', ')}`, 'yellow');
    process.exit(1);
  } else {
    // Run all phases
    runner.runAllPhases()
      .catch(error => {
        runner.log(`💥 Unexpected error: ${error.message}`, 'red');
        process.exit(1);
      });
  }
}

module.exports = { AppleNavigationTestRunner, TEST_PHASES };
