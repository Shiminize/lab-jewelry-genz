#!/usr/bin/env node

/**
 * Test Image Quality Improvements
 * Validates AVIF support, quality settings, and device-aware optimization
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// Test configuration
const TEST_CONFIG = {
  OUTPUT_DIR: './public/images/products/3d-sequences',
  TEST_SEQUENCES: ['Black_Stone_Ring-platinum', 'Black_Stone_Ring-rose-gold', 'Ringmodel-platinum'],
  FORMATS: ['avif', 'webp', 'png'],
  SAMPLE_FRAMES: [0, 12, 24], // Test first, middle, and last third
};

async function runQualityTests() {
  console.log('🧪 Starting Image Quality Tests...\n');
  
  const results = {
    formatSupport: {},
    fileSizes: {},
    loadTimes: {},
    qualityScores: {}
  };

  // Test 1: Format Support Detection
  console.log('1️⃣  Testing Format Support...');
  for (const format of TEST_CONFIG.FORMATS) {
    results.formatSupport[format] = await testFormatSupport(format);
    console.log(`   ${format.toUpperCase()}: ${results.formatSupport[format] ? '✅ Supported' : '❌ Not Supported'}`);
  }
  
  // Test 2: File Size Analysis
  console.log('\n2️⃣  Analyzing File Sizes...');
  for (const sequence of TEST_CONFIG.TEST_SEQUENCES) {
    results.fileSizes[sequence] = await analyzeFileSizes(sequence);
    console.log(`   ${sequence}:`);
    for (const [format, size] of Object.entries(results.fileSizes[sequence])) {
      console.log(`     ${format.toUpperCase()}: ${formatFileSize(size)}`);
    }
  }
  
  // Test 3: Loading Performance
  console.log('\n3️⃣  Testing Load Performance...');
  for (const sequence of TEST_CONFIG.TEST_SEQUENCES) {
    results.loadTimes[sequence] = await testLoadPerformance(sequence);
    console.log(`   ${sequence}:`);
    for (const [format, time] of Object.entries(results.loadTimes[sequence])) {
      console.log(`     ${format.toUpperCase()}: ${time}ms average`);
    }
  }
  
  // Test 4: Quality Analysis
  console.log('\n4️⃣  Quality Analysis...');
  results.qualityScores = await analyzeQuality();
  
  // Test 5: Device Simulation
  console.log('\n5️⃣  Device Capability Simulation...');
  await simulateDeviceTiers();
  
  // Generate Report
  console.log('\n📊 Generating Quality Report...');
  generateQualityReport(results);
  
  console.log('\n✅ Image Quality Tests Complete!');
}

async function testFormatSupport(format) {
  // Check if format files exist in test sequences
  for (const sequence of TEST_CONFIG.TEST_SEQUENCES) {
    const sequencePath = path.join(TEST_CONFIG.OUTPUT_DIR, sequence);
    if (!fs.existsSync(sequencePath)) continue;
    
    const testFile = path.join(sequencePath, `0.${format}`);
    if (fs.existsSync(testFile)) {
      return true;
    }
  }
  return false;
}

async function analyzeFileSizes(sequence) {
  const sequencePath = path.join(TEST_CONFIG.OUTPUT_DIR, sequence);
  const sizes = {};
  
  if (!fs.existsSync(sequencePath)) {
    console.warn(`   ⚠️  Sequence ${sequence} not found`);
    return sizes;
  }
  
  for (const format of TEST_CONFIG.FORMATS) {
    let totalSize = 0;
    let fileCount = 0;
    
    for (const frame of TEST_CONFIG.SAMPLE_FRAMES) {
      const filePath = path.join(sequencePath, `${frame}.${format}`);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
        fileCount++;
      }
    }
    
    sizes[format] = fileCount > 0 ? Math.round(totalSize / fileCount) : 0;
  }
  
  return sizes;
}

async function testLoadPerformance(sequence) {
  const sequencePath = path.join(TEST_CONFIG.OUTPUT_DIR, sequence);
  const loadTimes = {};
  
  if (!fs.existsSync(sequencePath)) {
    return loadTimes;
  }
  
  for (const format of TEST_CONFIG.FORMATS) {
    const times = [];
    
    for (const frame of TEST_CONFIG.SAMPLE_FRAMES) {
      const filePath = path.join(sequencePath, `${frame}.${format}`);
      if (fs.existsSync(filePath)) {
        const startTime = performance.now();
        
        // Simulate file read (proxy for network load)
        try {
          fs.readFileSync(filePath);
          const endTime = performance.now();
          times.push(endTime - startTime);
        } catch (error) {
          console.warn(`   ⚠️  Failed to read ${filePath}`);
        }
      }
    }
    
    loadTimes[format] = times.length > 0 ? 
      Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  }
  
  return loadTimes;
}

async function analyzeQuality() {
  console.log('   📈 Analyzing compression ratios...');
  
  const analysis = {
    compressionRatios: {},
    qualityMetrics: {}
  };
  
  // Calculate compression ratios
  for (const sequence of TEST_CONFIG.TEST_SEQUENCES) {
    const sequencePath = path.join(TEST_CONFIG.OUTPUT_DIR, sequence);
    if (!fs.existsSync(sequencePath)) continue;
    
    let pngSize = 0;
    const testFile = path.join(sequencePath, '0.png');
    if (fs.existsSync(testFile)) {
      pngSize = fs.statSync(testFile).size;
    }
    
    if (pngSize > 0) {
      for (const format of ['avif', 'webp']) {
        const formatFile = path.join(sequencePath, `0.${format}`);
        if (fs.existsSync(formatFile)) {
          const formatSize = fs.statSync(formatFile).size;
          const ratio = ((pngSize - formatSize) / pngSize * 100).toFixed(1);
          analysis.compressionRatios[format] = `${ratio}%`;
          console.log(`     ${format.toUpperCase()} vs PNG: ${ratio}% smaller`);
        }
      }
    }
  }
  
  return analysis;
}

async function simulateDeviceTiers() {
  const deviceTiers = [
    { name: 'Premium', cores: 8, memory: 16, connection: 'fast' },
    { name: 'High', cores: 6, memory: 8, connection: 'fast' },
    { name: 'Standard', cores: 4, memory: 4, connection: 'medium' },
    { name: 'Low', cores: 2, memory: 2, connection: 'slow' }
  ];
  
  for (const device of deviceTiers) {
    const recommendedFormat = getRecommendedFormat(device);
    const recommendedQuality = getRecommendedQuality(device);
    
    console.log(`   📱 ${device.name}: ${recommendedFormat.toUpperCase()} @ ${recommendedQuality}% quality`);
  }
}

function getRecommendedFormat(device) {
  if (device.connection === 'slow') return 'webp';
  if (device.cores >= 6) return 'avif';
  return 'webp';
}

function getRecommendedQuality(device) {
  if (device.name === 'Premium') return 90;
  if (device.name === 'High') return 85;
  if (device.name === 'Standard') return 80;
  return 75;
}

function generateQualityReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      formatsSupported: Object.entries(results.formatSupport).filter(([_, supported]) => supported).length,
      totalFormats: TEST_CONFIG.FORMATS.length,
      sequencesTested: TEST_CONFIG.TEST_SEQUENCES.length
    },
    results: results,
    recommendations: [
      'Use AVIF format for premium devices with fast connections',
      'Fallback to WebP for standard devices and compatibility',
      'PNG as final fallback for universal support',
      'Implement progressive loading for better perceived performance',
      'Consider device-aware quality adjustments'
    ]
  };
  
  const reportPath = './image-quality-test-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`   💾 Report saved to: ${reportPath}`);
  
  // Console summary
  console.log(`\n📋 Test Summary:`);
  console.log(`   • Formats Supported: ${report.summary.formatsSupported}/${report.summary.totalFormats}`);
  console.log(`   • Sequences Tested: ${report.summary.sequencesTested}`);
  console.log(`   • Average AVIF Savings: ${getAverageSavings(results.fileSizes, 'avif')}`);
  console.log(`   • Average WebP Savings: ${getAverageSavings(results.fileSizes, 'webp')}`);
}

function getAverageSavings(fileSizes, format) {
  let totalSavings = 0;
  let count = 0;
  
  for (const sequence of Object.values(fileSizes)) {
    if (sequence.png && sequence[format]) {
      const savings = ((sequence.png - sequence[format]) / sequence.png * 100);
      totalSavings += savings;
      count++;
    }
  }
  
  return count > 0 ? `${(totalSavings / count).toFixed(1)}%` : 'N/A';
}

function formatFileSize(bytes) {
  if (bytes === 0) return 'N/A';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Run tests if called directly
if (require.main === module) {
  runQualityTests().catch(console.error);
}

module.exports = { runQualityTests };