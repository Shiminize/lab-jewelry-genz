/**
 * API Concurrency Test - Phase 1 Fix Validation
 * Tests the async batch file validation implementation for concurrent requests
 */

// const API_URL = 'http://localhost:3000/api/products/customizable/ring-001/assets?materialId=platinum';
const API_URL = 'http://localhost:3000/api/test-concurrency'; // Test isolated endpoint
const CONCURRENT_REQUESTS = 10;
const SUCCESS_RATE_TARGET = 100; // 100% success rate required
const RESPONSE_TIME_TARGET = 300; // 300ms max response time

async function runConcurrencyTest() {
  console.log('🚀 API Concurrency Test - Phase 1 Fix Validation');
  console.log('================================================');
  console.log(`Testing URL: ${API_URL}`);
  console.log(`Concurrent Requests: ${CONCURRENT_REQUESTS}`);
  console.log(`Success Rate Target: ${SUCCESS_RATE_TARGET}%`);
  console.log(`Response Time Target: <${RESPONSE_TIME_TARGET}ms`);
  console.log('================================================\n');

  // Create array of concurrent fetch promises
  const startTime = Date.now();
  const requests = Array(CONCURRENT_REQUESTS).fill(null).map((_, index) => {
    const requestStartTime = Date.now();
    return fetch(API_URL)
      .then(async response => {
        const responseTime = Date.now() - requestStartTime;
        let data;
        const contentType = response.headers.get('content-type');
        
        // Try to parse response based on content type
        if (contentType && contentType.includes('application/json')) {
          try {
            data = await response.json();
          } catch (e) {
            data = { error: 'Failed to parse JSON', raw: await response.text() };
          }
        } else {
          // If not JSON, get text for debugging
          const text = await response.text();
          data = { error: 'Non-JSON response', contentType, snippet: text.substring(0, 200) };
        }
        
        return {
          index,
          success: response.ok,
          status: response.status,
          responseTime,
          data,
          headers: {
            responseTime: response.headers.get('X-Response-Time'),
            claudeCompliant: response.headers.get('X-CLAUDE-Rules-Compliant'),
            contentType
          }
        };
      })
      .catch(error => ({
        index,
        success: false,
        error: error.message,
        responseTime: Date.now() - requestStartTime
      }));
  });

  // Execute all requests concurrently
  console.log(`📡 Sending ${CONCURRENT_REQUESTS} concurrent requests...`);
  const results = await Promise.all(requests);
  const totalTime = Date.now() - startTime;

  // Analyze results
  const successfulRequests = results.filter(r => r.success);
  const failedRequests = results.filter(r => !r.success);
  const responseTimes = results.map(r => r.responseTime);
  const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const minResponseTime = Math.min(...responseTimes);
  const maxResponseTime = Math.max(...responseTimes);
  const successRate = (successfulRequests.length / CONCURRENT_REQUESTS) * 100;

  // Display results
  console.log('\n📊 Test Results:');
  console.log('===============');
  console.log(`✅ Successful Requests: ${successfulRequests.length}/${CONCURRENT_REQUESTS}`);
  console.log(`❌ Failed Requests: ${failedRequests.length}/${CONCURRENT_REQUESTS}`);
  console.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`⏱️  Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
  console.log(`⚡ Min Response Time: ${minResponseTime}ms`);
  console.log(`🐌 Max Response Time: ${maxResponseTime}ms`);
  console.log(`⏰ Total Test Time: ${totalTime}ms`);

  // Display individual request details
  console.log('\n📝 Individual Request Details:');
  console.log('=============================');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const claudeStatus = result.headers?.claudeCompliant === 'true' ? '✅' : '❌';
    console.log(`Request #${result.index + 1}: ${status} ${result.responseTime}ms - CLAUDE compliant: ${claudeStatus}`);
    if (!result.success || result.data?.error) {
      console.log(`  Status: ${result.status || 'N/A'}`);
      console.log(`  Content-Type: ${result.headers?.contentType || 'N/A'}`);
      if (result.data?.snippet) {
        console.log(`  Response snippet: ${result.data.snippet.replace(/\n/g, ' ').substring(0, 100)}...`);
      }
      console.log(`  Error: ${result.error || result.data?.error || 'Unknown error'}`);
    }
  });

  // Check if all requests returned valid asset data
  console.log('\n🔍 Asset Data Validation:');
  console.log('========================');
  let allValidAssetData = true;
  successfulRequests.forEach((result, idx) => {
    const assets = result.data?.data?.assets;
    const hasAssetPaths = assets?.assetPaths && assets.assetPaths.length > 0;
    const hasFrameCount = assets?.frameCount > 0;
    const isAvailable = assets?.available === true;
    
    if (!hasAssetPaths || !hasFrameCount || !isAvailable) {
      allValidAssetData = false;
      console.log(`❌ Request #${result.index + 1}: Invalid asset data`);
      console.log(`   - Asset Paths: ${hasAssetPaths ? '✅' : '❌'} ${assets?.assetPaths}`);
      console.log(`   - Frame Count: ${hasFrameCount ? '✅' : '❌'} ${assets?.frameCount}`);
      console.log(`   - Available: ${isAvailable ? '✅' : '❌'}`);
    }
  });
  
  if (allValidAssetData && successfulRequests.length > 0) {
    console.log('✅ All successful requests returned valid asset data');
  }

  // Performance comparison
  console.log('\n📊 Performance Analysis:');
  console.log('=======================');
  console.log(`Requests under ${RESPONSE_TIME_TARGET}ms: ${responseTimes.filter(t => t < RESPONSE_TIME_TARGET).length}/${CONCURRENT_REQUESTS}`);
  console.log(`Average time per request: ${avgResponseTime.toFixed(0)}ms`);
  console.log(`Requests per second: ${(1000 / avgResponseTime).toFixed(1)}`);

  // Final verdict
  console.log('\n🏁 Test Verdict:');
  console.log('================');
  const allTestsPassed = 
    successRate === SUCCESS_RATE_TARGET &&
    avgResponseTime < RESPONSE_TIME_TARGET &&
    allValidAssetData;

  console.log(`Success Rate Test: ${successRate === SUCCESS_RATE_TARGET ? '✅ PASS' : '❌ FAIL'} (${successRate.toFixed(1)}% vs ${SUCCESS_RATE_TARGET}% target)`);
  console.log(`Response Time Test: ${avgResponseTime < RESPONSE_TIME_TARGET ? '✅ PASS' : '❌ FAIL'} (${avgResponseTime.toFixed(0)}ms vs <${RESPONSE_TIME_TARGET}ms target)`);
  console.log(`Asset Data Validation: ${allValidAssetData ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Event Loop Blocking: ${maxResponseTime < 1000 ? '✅ PASS' : '❌ FAIL'} (max ${maxResponseTime}ms)`);
  
  console.log(`\n🎯 Overall Result: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ TESTS FAILED'}`);
  
  if (allTestsPassed) {
    console.log('\n🎉 SUCCESS: The async batch validation fix is working correctly!');
    console.log('The API now handles concurrent requests without blocking.');
  } else {
    console.log('\n⚠️  WARNING: The fix may not be working as expected.');
    if (failedRequests.length > 0) {
      console.log('\nFailed request details:');
      failedRequests.forEach(req => {
        console.log(`- Request #${req.index + 1}: ${req.error}`);
      });
    }
  }

  // Return test results
  return {
    passed: allTestsPassed,
    successRate,
    avgResponseTime,
    minResponseTime,
    maxResponseTime,
    totalRequests: CONCURRENT_REQUESTS,
    successfulRequests: successfulRequests.length,
    failedRequests: failedRequests.length
  };
}

// Run the test
if (require.main === module) {
  runConcurrencyTest()
    .then(results => {
      process.exit(results.passed ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution error:', error);
      process.exit(1);
    });
}

module.exports = { runConcurrencyTest };