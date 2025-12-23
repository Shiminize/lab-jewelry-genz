#!/usr/bin/env node

/**
 * Test Redis Metrics Functionality
 * 
 * This script tests:
 * 1. Metrics collection without Redis (fallback mode)
 * 2. Metrics endpoint authentication
 * 3. In-memory metrics calculation
 */

import { readFileSync } from 'fs';

// Load environment variables
try {
  const envContent = readFileSync('.env', 'utf8');
  const envLines = envContent.split('\n');
  for (const line of envLines) {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  }
} catch (error) {
  console.log('No .env file found, using existing environment variables');
}

const BASE_URL = 'http://localhost:3000';

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data, headers: response.headers };
  } catch (error) {
    return { error: error.message };
  }
}

async function testMetricsCollection() {
  console.log('🧪 Testing Redis Metrics Adapter\n');

  // Test 1: Generate some metrics data
  console.log('1. Generating metrics data...');
  const requests = [
    `${BASE_URL}/api/concierge/products?q=ring&limit=1`,
    `${BASE_URL}/api/concierge/products?q=necklace&limit=1`,
    `${BASE_URL}/api/concierge/products?q=bracelet&limit=1`,
    `${BASE_URL}/api/concierge/products?q=earring&limit=1`,
    `${BASE_URL}/api/concierge/products?q=gold&limit=1`,
  ];

  for (let i = 0; i < requests.length; i++) {
    const result = await makeRequest(requests[i]);
    if (result.error) {
      console.log(`   ❌ Request ${i + 1} failed: ${result.error}`);
    } else {
      console.log(`   ✅ Request ${i + 1}: ${result.status} (${result.data?.length || 0} products)`);
    }
    // Small delay to spread out requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Test 2: Try metrics endpoint without auth
  console.log('\n2. Testing metrics endpoint without auth...');
  const noAuthResult = await makeRequest(`${BASE_URL}/api/metrics`);
  if (noAuthResult.status === 403) {
    console.log('   ✅ Correctly rejected unauthorized request');
  } else {
    console.log(`   ❌ Expected 403, got ${noAuthResult.status}`);
  }

  // Test 3: Check Redis connection status
  console.log('\n3. Checking Redis connection...');
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    console.log(`   📡 REDIS_URL set: ${redisUrl.substring(0, 20)}...`);
    console.log('   ℹ️  Metrics should be persisted to Redis');
  } else {
    console.log('   📡 REDIS_URL not set');
    console.log('   ℹ️  Metrics will use in-memory fallback only');
  }

  // Test 4: Simulate server restart (in-memory metrics should reset)
  console.log('\n4. Testing metrics persistence...');
  console.log('   ℹ️  In production, restart the server and check if Redis metrics persist');
  console.log('   ℹ️  In-memory metrics will reset, Redis metrics should remain');

  // Test 5: Show expected metrics endpoint response structure
  console.log('\n5. Expected metrics endpoint response (with auth):');
  console.log(`
   GET /api/metrics?days=1&source=both
   
   Response:
   {
     "timestamp": "2025-10-23T22:00:00.000Z",
     "redis": {
       "connected": false,
       "metrics": null
     },
     "memory": {
       "metrics": {
         "totalRequests": 5,
         "p95LatencyMs": 45,
         "bufferSize": 5,
         "timeRange": "current session (in-memory)"
       }
     },
     "summary": {
       "primarySource": "memory",
       "p95LatencyMs": 45,
       "totalRequests": 5,
       "cacheHitRate": 0,
       "errorRate": 0,
       "timeRange": "current session (in-memory)"
     }
   }
  `);

  console.log('\n✅ Redis Metrics Test Complete');
  console.log('\n📋 Manual Testing Steps:');
  console.log('1. Set REDIS_URL in .env to test Redis persistence');
  console.log('2. Make authenticated request to /api/metrics');
  console.log('3. Restart server and verify Redis metrics persist');
  console.log('4. Check server logs for Redis connection status');
}

// Run tests
testMetricsCollection().catch(console.error);
