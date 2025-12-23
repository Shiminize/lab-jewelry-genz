#!/usr/bin/env node

/**
 * Test CDN Header Detection
 * 
 * This script tests:
 * 1. CDN header detection without actual CDN
 * 2. Simulated CDN headers (Cloudflare, Fastly, etc.)
 * 3. X-CDN-Cache header passthrough
 * 4. Metrics logging with CDN info
 */

const BASE_URL = 'http://localhost:3000';

async function makeRequest(url, headers = {}) {
  try {
    const response = await fetch(url, { headers });
    const data = await response.json();
    return { 
      status: response.status, 
      data, 
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return { error: error.message };
  }
}

async function testCDNHeaders() {
  console.log('🧪 Testing CDN Header Detection\n');

  // Test 1: Normal request (no CDN headers)
  console.log('1. Testing normal request (no CDN)...');
  const normalResult = await makeRequest(`${BASE_URL}/api/concierge/products?q=ring&limit=1`);
  if (normalResult.error) {
    console.log(`   ❌ Request failed: ${normalResult.error}`);
  } else {
    console.log(`   ✅ Status: ${normalResult.status}`);
    console.log(`   📊 X-App-Cache: ${normalResult.headers['x-app-cache'] || 'not set'}`);
    console.log(`   🌐 X-CDN-Cache: ${normalResult.headers['x-cdn-cache'] || 'not set'}`);
  }

  // Test 2: Simulated Cloudflare request
  console.log('\n2. Testing simulated Cloudflare request...');
  const cfResult = await makeRequest(`${BASE_URL}/api/concierge/products?q=necklace&limit=1`, {
    'CF-Cache-Status': 'HIT',
    'CF-Ray': '8b1234567890abcd-SJC',
    'CF-Connecting-IP': '203.0.113.1'
  });
  if (cfResult.error) {
    console.log(`   ❌ Request failed: ${cfResult.error}`);
  } else {
    console.log(`   ✅ Status: ${cfResult.status}`);
    console.log(`   📊 X-App-Cache: ${cfResult.headers['x-app-cache'] || 'not set'}`);
    console.log(`   🌐 X-CDN-Cache: ${cfResult.headers['x-cdn-cache'] || 'not set'}`);
    console.log(`   ☁️  Expected: CLOUDFLARE:HIT`);
  }

  // Test 3: Simulated Fastly request
  console.log('\n3. Testing simulated Fastly request...');
  const fastlyResult = await makeRequest(`${BASE_URL}/api/concierge/products?q=bracelet&limit=1`, {
    'X-Cache': 'MISS',
    'X-Served-By': 'cache-sjc10043-SJC',
    'X-Cache-Hits': '0'
  });
  if (fastlyResult.error) {
    console.log(`   ❌ Request failed: ${fastlyResult.error}`);
  } else {
    console.log(`   ✅ Status: ${fastlyResult.status}`);
    console.log(`   📊 X-App-Cache: ${fastlyResult.headers['x-app-cache'] || 'not set'}`);
    console.log(`   🌐 X-CDN-Cache: ${fastlyResult.headers['x-cdn-cache'] || 'not set'}`);
    console.log(`   ⚡ Expected: FASTLY:MISS`);
  }

  // Test 4: Simulated Akamai request
  console.log('\n4. Testing simulated Akamai request...');
  const akamaiResult = await makeRequest(`${BASE_URL}/api/concierge/products?q=earring&limit=1`, {
    'X-Akamai-Request-ID': '12345678',
    'X-Check-Cacheable': 'YES'
  });
  if (akamaiResult.error) {
    console.log(`   ❌ Request failed: ${akamaiResult.error}`);
  } else {
    console.log(`   ✅ Status: ${akamaiResult.status}`);
    console.log(`   📊 X-App-Cache: ${akamaiResult.headers['x-app-cache'] || 'not set'}`);
    console.log(`   🌐 X-CDN-Cache: ${akamaiResult.headers['x-cdn-cache'] || 'not set'}`);
    console.log(`   🔶 Expected: AKAMAI:UNKNOWN (no cache status header)`);
  }

  // Test 5: Multiple CDN headers (edge case)
  console.log('\n5. Testing multiple CDN headers...');
  const multiResult = await makeRequest(`${BASE_URL}/api/concierge/products?q=gold&limit=1`, {
    'CF-Cache-Status': 'HIT',
    'X-Cache': 'MISS',  // Conflicting
    'CF-Ray': '8b1234567890abcd-SJC'
  });
  if (multiResult.error) {
    console.log(`   ❌ Request failed: ${multiResult.error}`);
  } else {
    console.log(`   ✅ Status: ${multiResult.status}`);
    console.log(`   📊 X-App-Cache: ${multiResult.headers['x-app-cache'] || 'not set'}`);
    console.log(`   🌐 X-CDN-Cache: ${multiResult.headers['x-cdn-cache'] || 'not set'}`);
    console.log(`   🔀 Expected: CLOUDFLARE:HIT (first detected wins)`);
  }

  console.log('\n✅ CDN Header Detection Test Complete');
  console.log('\n📋 Expected Behavior:');
  console.log('• Normal requests: X-CDN-Cache not set');
  console.log('• Cloudflare: X-CDN-Cache: CLOUDFLARE:HIT');
  console.log('• Fastly: X-CDN-Cache: FASTLY:MISS');
  console.log('• Akamai: X-CDN-Cache: AKAMAI:UNKNOWN');
  console.log('• Multiple: First detected CDN wins');
  
  console.log('\n📊 Metrics Logging:');
  console.log('• Check server logs for CDN info in metrics');
  console.log('• Look for cdnProvider, cdnCacheStatus, cdnNormalized fields');
  console.log('• Example: {"type":"metric","cdnProvider":"cloudflare","cdnCacheStatus":"HIT"}');
}

// Run tests
testCDNHeaders().catch(console.error);
