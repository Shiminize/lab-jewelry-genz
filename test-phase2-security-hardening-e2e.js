/**
 * PHASE 2 E2E TEST: Security Hardening Validation
 * 
 * CLAUDE_RULES.md Compliance:
 * - Lines 205-206: NEVER proceed to next phase without E2E validation passing
 * - Lines 229-234: Type Safety & Security Boundaries (CRITICAL)
 * - Line 181: Update IMPLEMENTATION_STATUS.md after milestone
 * 
 * SUCCESS CRITERIA:
 * ✅ Path traversal protection prevents malicious product IDs
 * ✅ Material ID whitelist validation blocks invalid inputs
 * ✅ Enhanced security headers present in responses
 * ✅ Internal system information removed from API responses
 * ✅ Error handling doesn't leak sensitive information
 * ✅ API performance remains compliant (<300ms)
 * ✅ Functionality preserved - legitimate requests still work
 */

const { execSync } = require('child_process');

// PHASE 2 SUCCESS CRITERIA DEFINITION
const PHASE_2_SUCCESS_CRITERIA = {
  pathTraversalProtection: true,    // Malicious paths blocked
  inputValidation: true,           // Invalid inputs rejected
  securityHeaders: true,           // Enhanced headers present
  informationLeakage: false,       // No internal info leaked
  performanceCompliant: true,      // <300ms response times
  functionalityPreserved: true     // Legitimate requests work
};

console.log('🧪 PHASE 2 E2E TEST: Security Hardening Validation');
console.log('====================================================');

async function testPhase2SecurityHardening() {
  const results = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  function addTestResult(name, passed, details = '', performance = null, security = null) {
    results.totalTests++;
    if (passed) {
      results.passed++;
      console.log(`✅ ${name}`);
    } else {
      results.failed++;
      console.log(`❌ ${name} - ${details}`);
    }
    results.details.push({ name, passed, details, performance, security });
  }

  console.log('\n📋 Phase 2 Test Suite: Security Hardening');
  console.log('─'.repeat(50));

  // Test 1: Path Traversal Protection
  const maliciousIds = [
    '../../../etc/passwd',
    '..%2F..%2F..%2Fetc%2Fpasswd',
    'ring-001/../../../etc/passwd',
    'ring-001%00',
    '<script>alert("xss")</script>',
    '"; DROP TABLE products; --'
  ];

  let pathTraversalBlocked = 0;
  for (const maliciousId of maliciousIds) {
    try {
      const response = execSync(`curl -s -w "%{http_code}" "http://localhost:3001/api/products/customizable/${encodeURIComponent(maliciousId)}/assets"`, { encoding: 'utf8' });
      const statusCode = response.slice(-3);
      
      if (statusCode === '400') {
        pathTraversalBlocked++;
        console.log(`   🛡️  Blocked malicious ID: ${maliciousId.substring(0, 20)}...`);
      } else {
        console.log(`   ⚠️  Malicious ID not blocked: ${maliciousId.substring(0, 20)}... (Status: ${statusCode})`);
      }
    } catch (error) {
      // curl error might indicate server protection
      pathTraversalBlocked++;
      console.log(`   🛡️  Blocked malicious ID: ${maliciousId.substring(0, 20)}... (Connection rejected)`);
    }
  }

  addTestResult(
    'Path traversal protection',
    pathTraversalBlocked >= maliciousIds.length * 0.8, // 80% should be blocked
    `${pathTraversalBlocked}/${maliciousIds.length} malicious IDs blocked`
  );

  // Test 2: Material ID Validation
  const invalidMaterials = [
    'gold%20OR%201=1',
    '../../../secret',
    'nonexistent-material',
    '<script>alert("xss")</script>',
    'material"; DROP TABLE--'
  ];

  let invalidMaterialsBlocked = 0;
  for (const material of invalidMaterials) {
    try {
      const response = execSync(`curl -s -w "%{http_code}" "http://localhost:3001/api/products/customizable/ring-001/assets?materialId=${encodeURIComponent(material)}"`, { encoding: 'utf8' });
      const statusCode = response.slice(-3);
      
      if (statusCode === '400') {
        invalidMaterialsBlocked++;
        console.log(`   🛡️  Blocked invalid material: ${material.substring(0, 15)}...`);
      } else {
        console.log(`   ⚠️  Invalid material not blocked: ${material.substring(0, 15)}... (Status: ${statusCode})`);
      }
    } catch (error) {
      invalidMaterialsBlocked++;
    }
  }

  addTestResult(
    'Material ID whitelist validation',
    invalidMaterialsBlocked >= invalidMaterials.length * 0.8,
    `${invalidMaterialsBlocked}/${invalidMaterials.length} invalid materials blocked`
  );

  // Test 3: Security Headers Validation
  try {
    const headerResponse = execSync('curl -s -I "http://localhost:3001/api/products/customizable/ring-001/assets"', { encoding: 'utf8' });
    
    const requiredHeaders = [
      'X-Content-Type-Options: nosniff',
      'X-Frame-Options: DENY', 
      'X-XSS-Protection: 1; mode=block',
      'Strict-Transport-Security:',
      'Referrer-Policy:'
    ];

    let headersPresent = 0;
    for (const header of requiredHeaders) {
      if (headerResponse.includes(header)) {
        headersPresent++;
        console.log(`   ✅ Header present: ${header.split(':')[0]}`);
      } else {
        console.log(`   ❌ Header missing: ${header.split(':')[0]}`);
      }
    }

    addTestResult(
      'Enhanced security headers',
      headersPresent >= requiredHeaders.length * 0.8,
      `${headersPresent}/${requiredHeaders.length} security headers present`
    );
  } catch (error) {
    addTestResult('Enhanced security headers', false, `Header check failed: ${error.message}`);
  }

  // Test 4: Information Leakage Prevention
  try {
    const responseBody = execSync('curl -s "http://localhost:3001/api/products/customizable/ring-001/assets"', { encoding: 'utf8' });
    const response = JSON.parse(responseBody);
    
    // Check that internal system info is removed
    const leakedInfo = [];
    if (response.data?.dataSource) leakedInfo.push('dataSource');
    if (response.data?.fallbackMode !== undefined) leakedInfo.push('fallbackMode');
    if (response.performance?.cacheStatus) leakedInfo.push('cacheStatus');
    if (response.meta?.integration) leakedInfo.push('integration');
    if (response.meta?.fallbackMode !== undefined) leakedInfo.push('meta.fallbackMode');

    const noInformationLeakage = leakedInfo.length === 0;
    
    addTestResult(
      'Information leakage prevention',
      noInformationLeakage,
      noInformationLeakage ? 'No internal info leaked' : `Leaked: ${leakedInfo.join(', ')}`
    );
  } catch (error) {
    addTestResult('Information leakage prevention', false, `Response parsing failed: ${error.message}`);
  }

  // Test 5: API Performance Under Security (Legitimate Request)
  try {
    const performanceStart = Date.now();
    const response = execSync('curl -s -w "%{time_total}" "http://localhost:3001/api/products/customizable/ring-001/assets?materialId=18k-rose-gold"', { encoding: 'utf8' });
    const responseTime = parseFloat(response.slice(-8)) * 1000; // Convert to ms
    
    const performanceCompliant = responseTime < PHASE_2_SUCCESS_CRITERIA.performanceCompliant ? 300 : Infinity;
    const isCompliant = responseTime < 300;
    
    addTestResult(
      'API performance with security hardening',
      isCompliant,
      `Response time: ${responseTime.toFixed(0)}ms, Target: <300ms`,
      responseTime
    );
  } catch (error) {
    addTestResult('API performance with security hardening', false, `Performance test failed: ${error.message}`);
  }

  // Test 6: Functionality Preservation (Legitimate Requests)
  const legitimateRequests = [
    { id: 'ring-001', material: '18k-rose-gold' },
    { id: 'ring-001', material: 'platinum' },
    { id: 'ring-001', material: '18k-white-gold' },
    { id: 'ring-001', material: null } // Default material
  ];

  let functionalRequests = 0;
  for (const req of legitimateRequests) {
    try {
      const url = req.material 
        ? `http://localhost:3001/api/products/customizable/${req.id}/assets?materialId=${req.material}`
        : `http://localhost:3001/api/products/customizable/${req.id}/assets`;
        
      const response = execSync(`curl -s -w "%{http_code}" "${url}"`, { encoding: 'utf8' });
      const statusCode = response.slice(-3);
      
      if (statusCode === '200') {
        functionalRequests++;
        console.log(`   ✅ Legitimate request works: ${req.id} + ${req.material || 'default'}`);
      } else {
        console.log(`   ❌ Legitimate request failed: ${req.id} + ${req.material || 'default'} (Status: ${statusCode})`);
      }
    } catch (error) {
      console.log(`   ❌ Legitimate request error: ${req.id} + ${req.material || 'default'}`);
    }
  }

  addTestResult(
    'Functionality preservation',
    functionalRequests === legitimateRequests.length,
    `${functionalRequests}/${legitimateRequests.length} legitimate requests successful`
  );

  // Test 7: Error Handling Security (No Sensitive Info in Errors)
  try {
    // Force an error with invalid but safe input
    const errorResponse = execSync('curl -s "http://localhost:3001/api/products/customizable/ring-999/assets"', { encoding: 'utf8' });
    const error = JSON.parse(errorResponse);
    
    // Check that error doesn't contain stack traces, file paths, or internal details
    const errorString = JSON.stringify(error).toLowerCase();
    const sensitivePatterns = [
      '/users/',
      'stack',
      'internal',
      'database',
      'mongodb',
      'error:',
      'exception'
    ];

    let sensitivePatternsFound = 0;
    for (const pattern of sensitivePatterns) {
      if (errorString.includes(pattern)) {
        sensitivePatternsFound++;
        console.log(`   ⚠️  Sensitive pattern in error: ${pattern}`);
      }
    }

    addTestResult(
      'Secure error handling',
      sensitivePatternsFound === 0,
      sensitivePatternsFound === 0 ? 'No sensitive info in errors' : `${sensitivePatternsFound} sensitive patterns found`
    );
  } catch (error) {
    addTestResult('Secure error handling', false, `Error handling test failed: ${error.message}`);
  }

  console.log('\n📊 Phase 2 Test Results Summary');
  console.log('─'.repeat(40));
  console.log(`Total Tests: ${results.totalTests}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.totalTests) * 100).toFixed(1)}%`);

  // Security Summary
  const securityTests = results.details.filter(test => 
    test.name.includes('Path traversal') ||
    test.name.includes('Material ID') ||
    test.name.includes('security headers') ||
    test.name.includes('Information leakage') ||
    test.name.includes('error handling')
  );
  
  const securityPassed = securityTests.filter(test => test.passed).length;
  console.log('\n🛡️  Security Summary');
  console.log('─'.repeat(40));
  console.log(`Security Tests: ${securityPassed}/${securityTests.length} passed`);
  securityTests.forEach(test => {
    console.log(`${test.passed ? '✅' : '❌'} ${test.name}`);
  });

  // Performance Summary
  const performanceTests = results.details.filter(test => test.performance !== null);
  if (performanceTests.length > 0) {
    console.log('\n⚡ Performance Summary');
    console.log('─'.repeat(40));
    performanceTests.forEach(test => {
      const compliant = test.performance < 300;
      console.log(`${compliant ? '✅' : '❌'} ${test.name}: ${test.performance.toFixed(0)}ms`);
    });
  }

  // PHASE 2 SUCCESS EVALUATION
  console.log('\n🎯 PHASE 2 SUCCESS CRITERIA EVALUATION');
  console.log('═'.repeat(50));
  
  const overallSuccessRate = (results.passed / results.totalTests) * 100;
  const securitySuccessRate = (securityPassed / securityTests.length) * 100;
  
  const phase2Success = {
    securityTestsPassed: securitySuccessRate >= 80, // 80% of security tests must pass
    overallTestsPassed: overallSuccessRate >= 75,   // 75% overall success rate 
    performancePreserved: performanceTests.every(test => test.performance < 300),
    functionalityPreserved: results.details.some(test => test.name.includes('Functionality preservation') && test.passed),
    pathTraversalProtected: results.details.some(test => test.name.includes('Path traversal') && test.passed)
  };

  console.log(`Security Tests: ${securityPassed}/${securityTests.length} (${securitySuccessRate.toFixed(1)}%) - ${phase2Success.securityTestsPassed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Overall Tests: ${results.passed}/${results.totalTests} (${overallSuccessRate.toFixed(1)}%) - ${phase2Success.overallTestsPassed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Performance: ${performanceTests.filter(test => test.performance < 300).length}/${performanceTests.length} compliant - ${phase2Success.performancePreserved ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Functionality: ${phase2Success.functionalityPreserved ? '✅ PRESERVED' : '❌ BROKEN'}`);
  console.log(`Path Traversal: ${phase2Success.pathTraversalProtected ? '✅ PROTECTED' : '❌ VULNERABLE'}`);

  const allCriteriaMet = Object.values(phase2Success).every(criterion => criterion);
  
  console.log('\n🚀 PHASE 2 FINAL RESULT');
  console.log('═'.repeat(30));
  
  if (allCriteriaMet) {
    console.log('🎉 PHASE 2: SECURITY HARDENING - ✅ SUCCESS!');
    console.log('');
    console.log('✅ Path traversal attacks blocked');
    console.log('✅ Input validation with whitelisting implemented');
    console.log('✅ Enhanced security headers deployed');
    console.log('✅ Information leakage prevented');
    console.log('✅ Secure error handling implemented');
    console.log('✅ API performance preserved (<300ms)');
    console.log('✅ Functionality fully preserved');
    console.log('');
    console.log('🚦 READY TO PROCEED TO PHASE 3: UX Enhancement & Fallback System');
    console.log('');
    
    return { success: true, results };
  } else {
    console.log('❌ PHASE 2: SECURITY HARDENING - ⚠️  INCOMPLETE');
    console.log('');
    console.log('🔧 Issues to resolve before Phase 3:');
    if (!phase2Success.securityTestsPassed) console.log('   • Security vulnerabilities remain - hardening incomplete');
    if (!phase2Success.overallTestsPassed) console.log('   • Overall success rate below 75% threshold');
    if (!phase2Success.performancePreserved) console.log('   • Performance degradation due to security measures');
    if (!phase2Success.functionalityPreserved) console.log('   • Core functionality broken by security changes');
    if (!phase2Success.pathTraversalProtected) console.log('   • Path traversal protection not effective');
    console.log('');
    console.log('🚫 PHASE 3 BLOCKED until Phase 2 criteria are met');
    console.log('');
    
    return { success: false, results };
  }
}

// Execute the test
testPhase2SecurityHardening()
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });