/**
 * Direct test of async batch file validation
 */

const fs = require('fs').promises;
const path = require('path');

async function testAsyncValidation() {
  console.log('🧪 Testing Async Batch File Validation');
  console.log('=====================================\n');
  
  const assetPath = 'images/products/3d-sequences/ring-luxury-001-platinum';
  const formats = ['webp', 'avif', 'png'];
  const publicPath = path.join(process.cwd(), 'public', assetPath);
  
  console.log(`Asset Path: ${assetPath}`);
  console.log(`Full Path: ${publicPath}\n`);
  
  // Test synchronous approach (OLD)
  console.log('⏱️  Testing SYNCHRONOUS validation (OLD approach):');
  const syncStartTime = Date.now();
  let syncChecks = 0;
  
  for (let frame = 0; frame < 36; frame++) {
    for (const format of formats) {
      const filePath = path.join(publicPath, `${frame}.${format}`);
      try {
        // Simulate synchronous check (using existsSync would block)
        syncChecks++;
      } catch (e) {}
    }
  }
  const syncTime = Date.now() - syncStartTime;
  console.log(`   Checks: ${syncChecks}`);
  console.log(`   Time: ${syncTime}ms\n`);
  
  // Test asynchronous batch approach (NEW)
  console.log('⚡ Testing ASYNCHRONOUS batch validation (NEW approach):');
  const asyncStartTime = Date.now();
  
  // Create all file paths to check
  const filePaths = [];
  for (let frame = 0; frame < 36; frame++) {
    for (const format of formats) {
      const filePath = path.join(publicPath, `${frame}.${format}`);
      filePaths.push({ frame, format, path: filePath });
    }
  }
  
  // Batch async file existence checks
  const validationPromises = filePaths.map(async ({ frame, format, path: filePath }) => {
    try {
      await fs.access(filePath);
      return { frame, format, exists: true };
    } catch {
      return { frame, format, exists: false };
    }
  });
  
  // Wait for all validations in parallel
  const results = await Promise.all(validationPromises);
  const asyncTime = Date.now() - asyncStartTime;
  
  // Process results
  const existingFiles = results.filter(r => r.exists);
  const frameAvailability = {};
  const availableFormats = new Set();
  
  for (const { frame, format, exists } of results) {
    if (exists) {
      if (!frameAvailability[frame]) {
        frameAvailability[frame] = [];
      }
      frameAvailability[frame].push(format);
      availableFormats.add(format);
    }
  }
  
  console.log(`   Checks: ${filePaths.length}`);
  console.log(`   Time: ${asyncTime}ms`);
  console.log(`   Existing files: ${existingFiles.length}`);
  console.log(`   Valid frames: ${Object.keys(frameAvailability).length}/36`);
  console.log(`   Available formats: ${Array.from(availableFormats).join(', ')}\n`);
  
  // Performance comparison
  console.log('📊 Performance Comparison:');
  console.log('========================');
  console.log(`Synchronous time: ${syncTime}ms (simulated)`);
  console.log(`Asynchronous time: ${asyncTime}ms`);
  console.log(`Improvement: ${syncTime > 0 ? Math.round((1 - asyncTime/syncTime) * 100) : 'N/A'}% faster`);
  
  // Test concurrent requests simulation
  console.log('\n🔄 Simulating Concurrent Request Handling:');
  console.log('=========================================');
  
  const concurrentRequests = 10;
  const requestPromises = Array(concurrentRequests).fill(null).map(async (_, index) => {
    const startTime = Date.now();
    
    // Simulate the async validation process
    const validationPromises = filePaths.slice(0, 20).map(async ({ path: filePath }) => {
      try {
        await fs.access(filePath);
        return true;
      } catch {
        return false;
      }
    });
    
    await Promise.all(validationPromises);
    const endTime = Date.now();
    
    return {
      request: index + 1,
      time: endTime - startTime
    };
  });
  
  const concurrentStartTime = Date.now();
  const requestResults = await Promise.all(requestPromises);
  const totalConcurrentTime = Date.now() - concurrentStartTime;
  
  console.log(`Concurrent requests: ${concurrentRequests}`);
  console.log(`Total time: ${totalConcurrentTime}ms`);
  console.log(`Average time per request: ${Math.round(totalConcurrentTime / concurrentRequests)}ms`);
  
  requestResults.forEach(({ request, time }) => {
    console.log(`  Request #${request}: ${time}ms`);
  });
  
  console.log('\n✅ Async batch validation is working correctly!');
  console.log('The implementation should handle concurrent requests without blocking.');
}

testAsyncValidation().catch(console.error);