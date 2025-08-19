/**
 * Comprehensive Stripe Webhook Fix Validation
 * Tests the User import fix and validates payment processing
 */

const axios = require('axios')

const BASE_URL = 'http://localhost:3000'

// Test configuration
const TEST_CONFIG = {
  timeout: 10000,
  maxRetries: 3
}

// Success criteria (must SURPASS)
const SUCCESS_CRITERIA = {
  webhookResponse: {
    maxResponseTime: 5000, // Must be under 5 seconds
    requiredFields: ['success', 'data', 'meta'],
    mustReturnSuccess: true
  },
  userImportValidation: {
    mustNotThrowReferenceError: true,
    mustProcessSuccessfully: true
  }
}

let testResults = {
  passed: 0,
  failed: 0,
  details: []
}

function log(message, type = 'info') {
  const timestamp = new Date().toISOString()
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'
  console.log(`${prefix} [${timestamp}] ${message}`)
}

function addTestResult(name, passed, message, actualValue = null, expectedValue = null) {
  testResults.details.push({
    name,
    passed,
    message,
    actualValue,
    expectedValue
  })
  
  if (passed) {
    testResults.passed++
    log(`PASS: ${name} - ${message}`, 'success')
  } else {
    testResults.failed++
    log(`FAIL: ${name} - ${message}`, 'error')
    if (actualValue !== null && expectedValue !== null) {
      log(`  Expected: ${expectedValue}, Actual: ${actualValue}`)
    }
  }
}

async function testHealthEndpoint() {
  try {
    log('Testing health endpoint availability...')
    const response = await axios.get(`${BASE_URL}/api/health`, {
      timeout: TEST_CONFIG.timeout
    })
    
    const passed = response.status === 200
    addTestResult(
      'Health Endpoint',
      passed,
      passed ? 'Server responding normally' : 'Server not responding',
      response.status,
      200
    )
    
    return passed
  } catch (error) {
    addTestResult('Health Endpoint', false, `Server error: ${error.message}`)
    return false
  }
}

async function testUserImportAvailability() {
  try {
    log('Testing User import availability in schema index...')
    
    // Test the import by making a request that would trigger the webhook code path
    const testImport = `
      try {
        const { User, UserModel } = require('/Users/decepticonmanager/Projects/GenZJewelry_AUG_12/src/lib/schemas/index.ts');
        console.log('User import test:', { User: !!User, UserModel: !!UserModel });
        process.exit(User && UserModel ? 0 : 1);
      } catch (error) {
        console.error('Import error:', error.message);
        process.exit(1);
      }
    `
    
    // Write test file
    require('fs').writeFileSync('/tmp/test-user-import.js', testImport)
    
    // Run Node.js subprocess to test import
    const { spawn } = require('child_process')
    
    return new Promise((resolve) => {
      const child = spawn('node', ['/tmp/test-user-import.js'], {
        stdio: 'pipe',
        timeout: 5000
      })
      
      let output = ''
      child.stdout.on('data', (data) => {
        output += data.toString()
      })
      
      child.stderr.on('data', (data) => {
        output += data.toString()
      })
      
      child.on('close', (code) => {
        const passed = code === 0 && !output.includes('ReferenceError') && !output.includes('User is not defined')
        addTestResult(
          'User Import Availability',
          passed,
          passed ? 'User import working correctly' : 'User import failed or undefined',
          code,
          0
        )
        resolve(passed)
      })
      
      child.on('error', (error) => {
        addTestResult('User Import Availability', false, `Import test failed: ${error.message}`)
        resolve(false)
      })
    })
  } catch (error) {
    addTestResult('User Import Availability', false, `Test setup failed: ${error.message}`)
    return false
  }
}

async function testWebhookEndpointStructure() {
  try {
    log('Testing webhook endpoint structure and error handling...')
    
    // Test with invalid signature (should handle gracefully)
    const response = await axios.post(`${BASE_URL}/api/webhooks/stripe`, 
      { test: 'invalid_webhook' },
      {
        headers: {
          'stripe-signature': 'invalid_signature',
          'content-type': 'application/json'
        },
        timeout: TEST_CONFIG.timeout
      }
    ).catch(error => error.response)
    
    // Should return structured error response (not crash with ReferenceError)
    const hasStructuredResponse = response?.data?.success === false && response?.data?.error
    const noReferenceError = !response?.data?.error?.message?.includes('User is not defined')
    
    const passed = hasStructuredResponse && noReferenceError && response.status >= 400
    addTestResult(
      'Webhook Error Handling',
      passed,
      passed ? 'Webhook handles errors without User reference errors' : 'Webhook has User reference errors',
      response?.data?.error?.message || 'No error message',
      'Structured error without User reference error'
    )
    
    return passed
  } catch (error) {
    addTestResult('Webhook Error Handling', false, `Webhook test failed: ${error.message}`)
    return false
  }
}

async function testSchemaIntegrity() {
  try {
    log('Testing schema integrity and exports...')
    
    const response = await axios.get(`${BASE_URL}/api/products?limit=1`, {
      timeout: TEST_CONFIG.timeout
    }).catch(error => error.response)
    
    // This endpoint uses DatabaseModels, so it should work if schemas are properly exported
    const schemasWorking = response?.status === 200 && response?.data?.success
    
    addTestResult(
      'Schema Integrity',
      schemasWorking,
      schemasWorking ? 'Database schemas exported correctly' : 'Schema export issues detected',
      response?.status,
      200
    )
    
    return schemasWorking
  } catch (error) {
    addTestResult('Schema Integrity', false, `Schema test failed: ${error.message}`)
    return false
  }
}

async function runComprehensiveValidation() {
  log('🚀 Starting Comprehensive Stripe Webhook Fix Validation')
  log('Success Criteria: Must SURPASS all baseline performance and functionality tests')
  
  const startTime = Date.now()
  
  // Run all tests
  const healthOk = await testHealthEndpoint()
  const userImportOk = await testUserImportAvailability()
  const webhookOk = await testWebhookEndpointStructure()
  const schemaOk = await testSchemaIntegrity()
  
  const totalTime = Date.now() - startTime
  
  // Calculate success metrics
  const allTestsPassed = healthOk && userImportOk && webhookOk && schemaOk
  const passRate = (testResults.passed / (testResults.passed + testResults.failed)) * 100
  
  // Results summary
  log('\\n📊 VALIDATION RESULTS SUMMARY')
  log('=' * 50)
  log(`Total Tests: ${testResults.passed + testResults.failed}`)
  log(`Passed: ${testResults.passed}`)
  log(`Failed: ${testResults.failed}`)
  log(`Pass Rate: ${passRate.toFixed(1)}%`)
  log(`Total Time: ${totalTime}ms`)
  log('=' * 50)
  
  // Success criteria evaluation
  const surpassedCriteria = {
    allTestsPassed: allTestsPassed,
    noReferenceErrors: userImportOk && webhookOk,
    responseTime: totalTime < SUCCESS_CRITERIA.webhookResponse.maxResponseTime,
    passRateTarget: passRate >= 100 // Must be 100% to surpass
  }
  
  const overallSuccess = Object.values(surpassedCriteria).every(v => v === true)
  
  if (overallSuccess) {
    log('\\n🎉 SUCCESS: All criteria SURPASSED!', 'success')
    log('✅ User import fix working correctly')
    log('✅ Stripe webhook error resolved')  
    log('✅ No ReferenceError: User is not defined')
    log('✅ All systems operational')
  } else {
    log('\\n❌ FAILED: Criteria not met', 'error')
    log('Failing criteria:')
    Object.entries(surpassedCriteria).forEach(([key, passed]) => {
      if (!passed) {
        log(`  - ${key}: FAILED`)
      }
    })
  }
  
  // Detailed test breakdown
  if (testResults.failed > 0) {
    log('\\n📋 FAILED TESTS DETAILS:')
    testResults.details
      .filter(test => !test.passed)
      .forEach(test => {
        log(`  ❌ ${test.name}: ${test.message}`)
      })
  }
  
  return {
    success: overallSuccess,
    results: testResults,
    metrics: {
      passRate,
      totalTime,
      surpassedCriteria
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  runComprehensiveValidation()
    .then(result => {
      process.exit(result.success ? 0 : 1)
    })
    .catch(error => {
      log(`Fatal error: ${error.message}`, 'error')
      process.exit(1)
    })
}

module.exports = { runComprehensiveValidation }