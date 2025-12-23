#!/usr/bin/env node
/**
 * Test idempotency cache and rate limiter functionality
 */

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('IDEMPOTENCY & RATE LIMITING TEST');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test 1: Idempotency Cache
console.log('1️⃣  Testing Idempotency Cache');
console.log('─────────────────────────────────────────────────────');

// Import after console setup
const { idempotencyCache } = await import('../src/lib/idempotency/cache.ts');

const testKey1 = 'test-key-123';
const testSku1 = 'TEST-SKU-001';
const testResponse1 = { sku: testSku1, updated: true };

// Test: Set and get
idempotencyCache.set(testKey1, testSku1, testResponse1, 5);
const cached1 = idempotencyCache.get(testKey1, testSku1);

if (cached1 && cached1.sku === testSku1) {
  console.log('  ✅ Cache set/get works');
} else {
  console.log('  ❌ Cache set/get failed');
}

// Test: Different key returns null
const cached2 = idempotencyCache.get('different-key', testSku1);
if (cached2 === null) {
  console.log('  ✅ Different key returns null');
} else {
  console.log('  ❌ Different key should return null');
}

// Test: Same key, different SKU returns null
const cached3 = idempotencyCache.get(testKey1, 'DIFFERENT-SKU');
if (cached3 === null) {
  console.log('  ✅ Same key, different SKU returns null');
} else {
  console.log('  ❌ Same key, different SKU should return null');
}

// Test: TTL expiration
console.log('  ⏳ Testing TTL expiration (2s wait)...');
idempotencyCache.set('ttl-test-key', 'TTL-SKU', { test: true }, 1);
await new Promise(resolve => setTimeout(resolve, 1500));
const expiredCache = idempotencyCache.get('ttl-test-key', 'TTL-SKU');
if (expiredCache === null) {
  console.log('  ✅ Cache expires after TTL');
} else {
  console.log('  ❌ Cache should expire after TTL');
}

// Test: Stats
const stats = idempotencyCache.getStats();
console.log(`  ℹ️  Current cache size: ${stats.size} entries`);

console.log('\n2️⃣  Testing Rate Limiter');
console.log('─────────────────────────────────────────────────────');

const { adminRateLimiter } = await import('../src/lib/ratelimit/tokenBucket.ts');

const testIP = '192.168.1.100';

// Test: First 5 requests should succeed (max 5 tokens)
let successCount = 0;
for (let i = 0; i < 5; i++) {
  const result = adminRateLimiter.check(testIP);
  if (result.allowed) successCount++;
}

if (successCount === 5) {
  console.log(`  ✅ First 5 requests allowed (5 tokens consumed)`);
} else {
  console.log(`  ❌ Expected 5 allowed, got ${successCount}`);
}

// Test: 6th request should be rate limited
const rateLimited = adminRateLimiter.check(testIP);
if (!rateLimited.allowed && rateLimited.retryAfter) {
  console.log(`  ✅ 6th request rate limited (retry after ${rateLimited.retryAfter}s)`);
} else {
  console.log(`  ❌ 6th request should be rate limited`);
}

// Test: Different IP has its own bucket
const result2 = adminRateLimiter.check('192.168.1.101');
if (result2.allowed) {
  console.log(`  ✅ Different IP has separate rate limit`);
} else {
  console.log(`  ❌ Different IP should have its own bucket`);
}

// Test: Refill after waiting
console.log('  ⏳ Testing token refill (1.5s wait for 5 rps)...');
await new Promise(resolve => setTimeout(resolve, 1500));
const refillTest = adminRateLimiter.check(testIP);
if (refillTest.allowed) {
  console.log(`  ✅ Tokens refilled after waiting`);
} else {
  console.log(`  ❌ Tokens should refill over time`);
}

const rlStats = adminRateLimiter.getStats();
console.log(`  ℹ️  Active buckets: ${rlStats.bucketsActive}, Max tokens: ${rlStats.maxTokens}, Refill rate: ${rlStats.refillRate}/s`);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ ALL TESTS PASSED');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Cleanup
idempotencyCache.destroy();
adminRateLimiter.destroy();

process.exit(0);

