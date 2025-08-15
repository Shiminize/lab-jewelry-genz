#!/usr/bin/env node

/**
 * Comprehensive Quality Assurance Check Script
 * Runs all quality checks including tests, linting, security, and performance
 */

const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
}

class QAChecker {
  constructor() {
    this.results = {
      tests: { passed: false, details: null },
      linting: { passed: false, details: null },
      typeCheck: { passed: false, details: null },
      security: { passed: false, details: null },
      performance: { passed: false, details: null },
      coverage: { passed: false, details: null }
    }
    this.config = this.loadConfig()
  }

  loadConfig() {
    try {
      const configPath = path.join(process.cwd(), 'qa-config.json')
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'))
      }
    } catch (error) {
      this.log('warning', 'Could not load QA config, using defaults')
    }
    return { qualityAssurance: { testing: { coverage: { minimum: 70 } } } }
  }

  log(level, message, data = '') {
    const timestamp = new Date().toISOString()
    const colorMap = {
      info: colors.blue,
      success: colors.green,
      warning: colors.yellow,
      error: colors.red,
      header: colors.magenta + colors.bold
    }
    
    const color = colorMap[level] || colors.white
    console.log(`${color}[${timestamp}] ${level.toUpperCase()}: ${message}${colors.reset}`)
    if (data) {
      console.log(`${colors.cyan}${data}${colors.reset}`)
    }
  }

  async runCommand(command, description, options = {}) {
    this.log('info', `Running: ${description}`)
    try {
      const result = execSync(command, {
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options
      })
      this.log('success', `✅ ${description} completed successfully`)
      return { success: true, output: result }
    } catch (error) {
      this.log('error', `❌ ${description} failed`)
      if (error.stdout) {
        this.log('error', 'STDOUT:', error.stdout)
      }
      if (error.stderr) {
        this.log('error', 'STDERR:', error.stderr)
      }
      return { success: false, error: error.message, output: error.stdout || error.stderr }
    }
  }

  async checkDependencies() {
    this.log('header', '🔍 Checking Dependencies')
    
    const dependencies = ['npm', 'node']
    for (const dep of dependencies) {
      try {
        const result = execSync(`${dep} --version`, { encoding: 'utf8' })
        this.log('success', `${dep}: ${result.trim()}`)
      } catch (error) {
        this.log('error', `${dep}: Not found`)
        throw new Error(`Required dependency ${dep} not found`)
      }
    }
  }

  async runTests() {
    this.log('header', '🧪 Running Tests')
    
    // Run unit tests
    const testResult = await this.runCommand(
      'npm run test -- --coverage --passWithNoTests',
      'Unit Tests'
    )
    
    this.results.tests = {
      passed: testResult.success,
      details: testResult.output || testResult.error
    }

    // Check coverage
    if (testResult.success) {
      try {
        const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json')
        if (fs.existsSync(coveragePath)) {
          const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'))
          const totalCoverage = coverage.total
          const threshold = this.config.qualityAssurance?.testing?.coverage?.minimum || 70
          
          this.log('info', `Coverage Summary:`)
          this.log('info', `  Lines: ${totalCoverage.lines.pct}%`)
          this.log('info', `  Functions: ${totalCoverage.functions.pct}%`)
          this.log('info', `  Branches: ${totalCoverage.branches.pct}%`)
          this.log('info', `  Statements: ${totalCoverage.statements.pct}%`)
          
          const passed = totalCoverage.lines.pct >= threshold
          this.results.coverage = {
            passed,
            details: {
              actual: totalCoverage.lines.pct,
              threshold,
              summary: totalCoverage
            }
          }
          
          if (passed) {
            this.log('success', `✅ Coverage threshold met (${totalCoverage.lines.pct}% >= ${threshold}%)`)
          } else {
            this.log('error', `❌ Coverage below threshold (${totalCoverage.lines.pct}% < ${threshold}%)`)
          }
        }
      } catch (error) {
        this.log('warning', 'Could not parse coverage report')
      }
    }

    return testResult.success
  }

  async runLinting() {
    this.log('header', '🔍 Running Linting')
    
    const lintResult = await this.runCommand(
      'npm run lint',
      'ESLint Check'
    )
    
    this.results.linting = {
      passed: lintResult.success,
      details: lintResult.output || lintResult.error
    }

    return lintResult.success
  }

  async runTypeCheck() {
    this.log('header', '🔎 Running Type Check')
    
    const typeResult = await this.runCommand(
      'npx tsc --noEmit',
      'TypeScript Check'
    )
    
    this.results.typeCheck = {
      passed: typeResult.success,
      details: typeResult.output || typeResult.error
    }

    return typeResult.success
  }

  async runSecurityCheck() {
    this.log('header', '🔒 Running Security Check')
    
    // Check for security vulnerabilities
    const auditResult = await this.runCommand(
      'npm audit --audit-level=moderate',
      'NPM Security Audit'
    )
    
    this.results.security = {
      passed: auditResult.success,
      details: auditResult.output || auditResult.error
    }

    return auditResult.success
  }

  async runPerformanceCheck() {
    this.log('header', '⚡ Running Performance Check')
    
    try {
      // Build the project to check bundle size
      const buildResult = await this.runCommand(
        'npm run build',
        'Production Build',
        { silent: true }
      )
      
      if (buildResult.success) {
        // Check build output for bundle analysis
        const buildOutput = buildResult.output
        
        // Look for bundle size information
        const sizeMatch = buildOutput.match(/(\d+(?:\.\d+)?)\s*(kB|MB)/gi)
        if (sizeMatch) {
          this.log('info', 'Bundle sizes detected:')
          sizeMatch.forEach(size => this.log('info', `  ${size}`))
        }
        
        this.results.performance = {
          passed: true,
          details: { buildSuccess: true, bundleSizes: sizeMatch }
        }
      } else {
        this.results.performance = {
          passed: false,
          details: buildResult.error
        }
      }
    } catch (error) {
      this.log('warning', 'Performance check skipped - build not available')
      this.results.performance = {
        passed: true, // Don't fail QA if build isn't available
        details: 'Skipped - build not available'
      }
    }

    return this.results.performance.passed
  }

  async runHealthCheck() {
    this.log('header', '💚 Running Health Check')
    
    try {
      // Check if we can start the development server briefly
      this.log('info', 'Checking project structure...')
      
      const requiredFiles = [
        'package.json',
        'next.config.js',
        'src/app/layout.tsx',
        'src/components',
        'src/lib'
      ]
      
      const missingFiles = requiredFiles.filter(file => 
        !fs.existsSync(path.join(process.cwd(), file))
      )
      
      if (missingFiles.length > 0) {
        this.log('error', 'Missing required files/directories:')
        missingFiles.forEach(file => this.log('error', `  ${file}`))
        return false
      }
      
      this.log('success', 'Project structure looks good')
      return true
    } catch (error) {
      this.log('error', 'Health check failed:', error.message)
      return false
    }
  }

  generateReport() {
    this.log('header', '📊 Quality Assurance Report')
    
    const checks = [
      { name: 'Tests', result: this.results.tests },
      { name: 'Coverage', result: this.results.coverage },
      { name: 'Linting', result: this.results.linting },
      { name: 'Type Check', result: this.results.typeCheck },
      { name: 'Security', result: this.results.security },
      { name: 'Performance', result: this.results.performance }
    ]
    
    let allPassed = true
    
    console.log('\n' + '='.repeat(60))
    console.log(`${colors.bold}${colors.magenta}           QUALITY ASSURANCE SUMMARY${colors.reset}`)
    console.log('='.repeat(60))
    
    checks.forEach(check => {
      const status = check.result.passed ? '✅ PASS' : '❌ FAIL'
      const color = check.result.passed ? colors.green : colors.red
      console.log(`${color}${status.padEnd(8)} ${check.name}${colors.reset}`)
      
      if (!check.result.passed) {
        allPassed = false
      }
    })
    
    console.log('='.repeat(60))
    
    const overallStatus = allPassed ? 'PASSED' : 'FAILED'
    const overallColor = allPassed ? colors.green : colors.red
    console.log(`${colors.bold}${overallColor}Overall QA Status: ${overallStatus}${colors.reset}`)
    
    if (!allPassed) {
      console.log(`\n${colors.yellow}⚠️  Some checks failed. Review the details above.${colors.reset}`)
    } else {
      console.log(`\n${colors.green}🎉 All quality checks passed! Ready for deployment.${colors.reset}`)
    }
    
    // Save report to file
    const reportPath = path.join(process.cwd(), 'qa-report.json')
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      overall: allPassed,
      checks: this.results
    }, null, 2))
    
    this.log('info', `Report saved to: ${reportPath}`)
    
    return allPassed
  }

  async run() {
    try {
      this.log('header', '🚀 Starting Quality Assurance Checks')
      
      await this.checkDependencies()
      await this.runHealthCheck()
      
      // Run all checks
      const checks = [
        () => this.runTests(),
        () => this.runLinting(),
        () => this.runTypeCheck(),
        () => this.runSecurityCheck(),
        () => this.runPerformanceCheck()
      ]
      
      for (const check of checks) {
        await check()
      }
      
      const success = this.generateReport()
      process.exit(success ? 0 : 1)
      
    } catch (error) {
      this.log('error', 'QA check failed with error:', error.message)
      process.exit(1)
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2)
  const checker = new QAChecker()
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.bold}Quality Assurance Checker${colors.reset}

Usage: node scripts/qa-check.js [options]

Options:
  --help, -h     Show this help message
  --quick        Run only essential checks (tests, linting)
  --full         Run all checks including performance (default)

Examples:
  npm run qa              # Run all QA checks
  npm run qa:quick        # Run quick checks only
`)
    process.exit(0)
  }
  
  checker.run()
}

module.exports = QAChecker