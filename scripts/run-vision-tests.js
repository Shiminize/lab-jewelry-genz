#!/usr/bin/env node

/**
 * Vision Test Runner Script
 * Orchestrates visual regression testing for the 3D customizer
 * Handles test execution, screenshot management, and reporting
 */

const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

// Configuration
const TEST_CONFIG = {
  browsers: ['chromium', 'webkit', 'firefox'],
  viewports: ['mobile', 'tablet', 'desktop'],
  testSuites: [
    'tests/visual/vision-mode-comprehensive.spec.ts',
    'tests/visual/performance-visual-test.spec.ts',
    'tests/visual/customizer-materials.spec.ts'
  ],
  outputDir: 'test-results/visual',
  baselineDir: 'test-results/baseline',
  reportDir: 'test-results/reports',
  maxRetries: 2,
  timeout: 60000
}

class VisionTestRunner {
  constructor() {
    this.startTime = Date.now()
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      failedTests: [],
      passedTests: [],
      screenshots: []
    }
  }

  async initialize() {
    console.log('🚀 GenZ Jewelry Vision Test Runner')
    console.log('=' .repeat(50))
    console.log(`📅 Started: ${new Date().toISOString()}`)
    console.log(`🎯 Test Suites: ${TEST_CONFIG.testSuites.length}`)
    console.log(`🌐 Browsers: ${TEST_CONFIG.browsers.join(', ')}`)
    console.log('')

    // Ensure output directories exist
    this.ensureDirectories()

    // Check if dev server is running
    await this.checkDevServer()
  }

  ensureDirectories() {
    const dirs = [
      TEST_CONFIG.outputDir,
      TEST_CONFIG.baselineDir, 
      TEST_CONFIG.reportDir,
      'test-results/screenshots',
      'test-results/diffs'
    ]

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
        console.log(`📁 Created directory: ${dir}`)
      }
    })
  }

  async checkDevServer() {
    console.log('🔍 Checking development server...')
    
    try {
      const response = await fetch('http://localhost:3000/customizer')
      if (response.ok) {
        console.log('✅ Development server is running')
      } else {
        throw new Error(`Server responded with ${response.status}`)
      }
    } catch (error) {
      console.log('❌ Development server is not running')
      console.log('💡 Please start the dev server: npm run dev')
      process.exit(1)
    }
  }

  async runTestSuite(suitePath, browser) {
    console.log(`\n🧪 Running ${path.basename(suitePath)} on ${browser}`)
    console.log('-'.repeat(40))

    const projectName = `visual-${browser}`
    
    try {
      const command = [
        'npx playwright test',
        suitePath,
        `--project=${projectName}`,
        `--timeout=${TEST_CONFIG.timeout}`,
        `--retries=${TEST_CONFIG.maxRetries}`,
        '--reporter=line',
        `--output-dir=${TEST_CONFIG.outputDir}/${browser}`
      ].join(' ')

      console.log(`📋 Command: ${command}`)

      const output = execSync(command, { 
        encoding: 'utf-8',
        stdio: 'pipe',
        env: {
          ...process.env,
          PLAYWRIGHT_TEST_BASE_URL: 'http://localhost:3000'
        }
      })

      console.log(output)
      
      // Parse results from output
      const lines = output.split('\n')
      const resultLine = lines.find(line => line.includes('passed') || line.includes('failed'))
      
      if (resultLine) {
        const passedMatch = resultLine.match(/(\d+) passed/)
        const failedMatch = resultLine.match(/(\d+) failed/)
        
        if (passedMatch) this.results.passed += parseInt(passedMatch[1])
        if (failedMatch) this.results.failed += parseInt(failedMatch[1])
      }

      console.log(`✅ ${suitePath} completed successfully on ${browser}`)
      this.results.passedTests.push(`${suitePath} (${browser})`)
      
      return true
    } catch (error) {
      console.log(`❌ ${suitePath} failed on ${browser}`)
      console.log(`Error: ${error.message}`)
      
      this.results.failed++
      this.results.failedTests.push({
        suite: suitePath,
        browser,
        error: error.message
      })
      
      return false
    }
  }

  async generateVisualReport() {
    console.log('\n📊 Generating Visual Test Report...')
    
    const reportData = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      results: this.results,
      config: TEST_CONFIG,
      screenshots: this.collectScreenshots()
    }

    const reportPath = path.join(TEST_CONFIG.reportDir, 'visual-test-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2))

    // Generate HTML report
    await this.generateHTMLReport(reportData)

    console.log(`📄 Report saved to: ${reportPath}`)
  }

  collectScreenshots() {
    const screenshots = []
    
    try {
      const screenshotDirs = [
        'test-results/screenshots',
        'test-results/visual',
        'tests/visual/vision-mode-comprehensive.spec.ts-snapshots',
        'tests/visual/performance-visual-test.spec.ts-snapshots'
      ]

      screenshotDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir, { recursive: true })
          files.forEach(file => {
            if (file.endsWith('.png')) {
              screenshots.push({
                name: file,
                path: path.join(dir, file),
                size: fs.statSync(path.join(dir, file)).size
              })
            }
          })
        }
      })
    } catch (error) {
      console.log(`⚠️  Warning: Could not collect screenshots: ${error.message}`)
    }

    return screenshots
  }

  async generateHTMLReport(data) {
    const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GenZ Jewelry - Visual Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #333; margin: 0; font-size: 2.5em; }
        .header p { color: #666; margin: 5px 0; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-card h3 { margin: 0 0 10px 0; font-size: 2em; }
        .stat-card p { margin: 0; opacity: 0.9; }
        .success { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        .error { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
        .duration { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }
        .section { margin: 30px 0; }
        .section h2 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .test-list { list-style: none; padding: 0; }
        .test-list li { padding: 10px; margin: 5px 0; background: #f9f9f9; border-radius: 4px; border-left: 4px solid #4facfe; }
        .test-list li.failed { border-left-color: #fa709a; background: #fff5f5; }
        .screenshot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .screenshot-item { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .screenshot-item img { width: 100%; height: 200px; object-fit: cover; }
        .screenshot-item .info { padding: 15px; }
        .config-table { width: 100%; border-collapse: collapse; }
        .config-table th, .config-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        .config-table th { background: #f9f9f9; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📸 Visual Test Report</h1>
            <p><strong>GenZ Jewelry 3D Customizer</strong></p>
            <p>Generated: ${data.timestamp}</p>
        </div>

        <div class="stats">
            <div class="stat-card success">
                <h3>${data.results.passed}</h3>
                <p>Tests Passed</p>
            </div>
            <div class="stat-card error">
                <h3>${data.results.failed}</h3>
                <p>Tests Failed</p>
            </div>
            <div class="stat-card duration">
                <h3>${Math.round(data.duration / 1000)}s</h3>
                <p>Total Duration</p>
            </div>
            <div class="stat-card">
                <h3>${data.screenshots.length}</h3>
                <p>Screenshots</p>
            </div>
        </div>

        <div class="section">
            <h2>✅ Passed Tests</h2>
            <ul class="test-list">
                ${data.results.passedTests.map(test => `<li>${test}</li>`).join('')}
            </ul>
        </div>

        ${data.results.failedTests.length > 0 ? `
        <div class="section">
            <h2>❌ Failed Tests</h2>
            <ul class="test-list">
                ${data.results.failedTests.map(test => `
                    <li class="failed">
                        <strong>${test.suite}</strong> (${test.browser})<br>
                        <small>${test.error}</small>
                    </li>
                `).join('')}
            </ul>
        </div>
        ` : ''}

        <div class="section">
            <h2>📸 Screenshots Generated</h2>
            <div class="screenshot-grid">
                ${data.screenshots.slice(0, 12).map(screenshot => `
                    <div class="screenshot-item">
                        <div class="info">
                            <h4>${screenshot.name}</h4>
                            <p>Size: ${Math.round(screenshot.size / 1024)} KB</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <h2>⚙️ Test Configuration</h2>
            <table class="config-table">
                <tr><th>Property</th><th>Value</th></tr>
                <tr><td>Browsers</td><td>${data.config.browsers.join(', ')}</td></tr>
                <tr><td>Test Suites</td><td>${data.config.testSuites.length}</td></tr>
                <tr><td>Timeout</td><td>${data.config.timeout}ms</td></tr>
                <tr><td>Max Retries</td><td>${data.config.maxRetries}</td></tr>
                <tr><td>Output Directory</td><td>${data.config.outputDir}</td></tr>
            </table>
        </div>
    </div>
</body>
</html>
    `

    const htmlPath = path.join(TEST_CONFIG.reportDir, 'visual-test-report.html')
    fs.writeFileSync(htmlPath, htmlReport)
    
    console.log(`📄 HTML Report: ${htmlPath}`)
  }

  async run() {
    await this.initialize()

    console.log('\n🏃 Starting Visual Tests...')
    
    // Run tests for each browser
    for (const browser of TEST_CONFIG.browsers) {
      console.log(`\n🌐 Testing on ${browser.toUpperCase()}`)
      console.log('='.repeat(30))

      for (const testSuite of TEST_CONFIG.testSuites) {
        await this.runTestSuite(testSuite, browser)
        this.results.total++
      }
    }

    // Generate comprehensive report
    await this.generateVisualReport()

    // Print summary
    this.printSummary()
  }

  printSummary() {
    const duration = Date.now() - this.startTime
    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1)
    
    console.log('\n🎉 Test Execution Complete!')
    console.log('=' .repeat(50))
    console.log(`⏱️  Total Duration: ${Math.round(duration / 1000)}s`)
    console.log(`✅ Passed: ${this.results.passed}`)
    console.log(`❌ Failed: ${this.results.failed}`)
    console.log(`📊 Success Rate: ${successRate}%`)
    console.log(`📸 Screenshots: ${this.results.screenshots.length}`)
    
    if (this.results.failed > 0) {
      console.log('\n❌ FAILED TESTS:')
      this.results.failedTests.forEach(test => {
        console.log(`   • ${test.suite} (${test.browser})`)
        console.log(`     ${test.error}`)
      })
      process.exit(1)
    } else {
      console.log('\n🎊 All tests passed successfully!')
      process.exit(0)
    }
  }
}

// Script execution
if (require.main === module) {
  const runner = new VisionTestRunner()
  
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Test execution interrupted')
    process.exit(1)
  })
  
  runner.run().catch(error => {
    console.error('💥 Test runner failed:', error)
    process.exit(1)
  })
}

module.exports = VisionTestRunner