/**
 * Asset Fallback System Test
 * Tests the asset-fallbacks.ts utility functions
 */

const { performance } = require('perf_hooks');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

class AssetFallbackTest {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[${new Date().toISOString()}] ${message}${colors.reset}`);
  }

  async test(name, testFn) {
    try {
      this.log(`Running: ${name}`, 'info');
      const start = performance.now();
      await testFn();
      const end = performance.now();
      this.log(`✅ PASSED: ${name} (${(end - start).toFixed(2)}ms)`, 'success');
      this.results.passed++;
    } catch (error) {
      this.log(`❌ FAILED: ${name} - ${error.message}`, 'error');
      this.results.failed++;
      this.results.errors.push({ test: name, error: error.message });
    }
  }

  async testAssetExists(url) {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) {
      throw new Error(`Asset not found: ${response.status} ${response.statusText}`);
    }
    return true;
  }

  async run() {
    this.log('Starting Asset Fallback Tests', 'info');
    this.log('='.repeat(50), 'info');

    // Test existing 3D models
    await this.test('3D Model - test-model.glb exists', async () => {
      await this.testAssetExists(`${BASE_URL}/models/test-model.glb`);
    });

    await this.test('3D Model - goldringred.glb exists', async () => {
      await this.testAssetExists(`${BASE_URL}/models/goldringred.glb`);
    });

    // Test fallback images
    await this.test('Fallback Image - hero_fallback.jpg exists', async () => {
      await this.testAssetExists(`${BASE_URL}/hero_fallback.jpg`);
    });

    await this.test('Fallback Image - images/hero_fallback.jpg exists', async () => {
      await this.testAssetExists(`${BASE_URL}/images/hero_fallback.jpg`);
    });

    // Test 404 handling for missing assets
    await this.test('Missing asset returns 404', async () => {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(`${BASE_URL}/non-existent-asset.jpg`, { method: 'HEAD' });
      if (response.status !== 404) {
        throw new Error(`Expected 404, got ${response.status}`);
      }
    });

    // Test performance (should be fast)
    await this.test('Asset loading performance < 100ms', async () => {
      const start = performance.now();
      await this.testAssetExists(`${BASE_URL}/models/test-model.glb`);
      const end = performance.now();
      if (end - start > 100) {
        throw new Error(`Asset loading too slow: ${(end - start).toFixed(2)}ms`);
      }
    });

    this.log('='.repeat(50), 'info');
    this.log(`Tests completed: ${this.results.passed} passed, ${this.results.failed} failed`, 
      this.results.failed > 0 ? 'warning' : 'success');

    if (this.results.errors.length > 0) {
      this.log('Errors:', 'error');
      this.results.errors.forEach(err => {
        this.log(`- ${err.test}: ${err.error}`, 'error');
      });
    }

    return this.results.failed === 0;
  }
}

// Run tests if called directly
if (require.main === module) {
  const test = new AssetFallbackTest();
  test.run().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = AssetFallbackTest;