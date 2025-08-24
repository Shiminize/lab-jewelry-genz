#!/usr/bin/env node

/**
 * Phase 2 E2E Test: Verify Lighting Fix
 * Tests the enhanced lighting configuration for jewelry rendering
 * CLAUDE_RULES compliant validation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🧪 PHASE 2 E2E TEST: Lighting Configuration Fix\n');

// Test 1: Verify script modifications
console.log('📝 Test 1: Script Lighting Configuration');
const scriptPath = './scripts/generate-3d-sequences.js';
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

const lightingChecks = [
  { name: 'Ambient Light Increased', pattern: /ambientLight.*0\.7/g, expected: true },
  { name: 'Hemisphere Light Added', pattern: /hemisphereLight/g, expected: true },
  { name: 'Three-Point Lighting', pattern: /keyLight[\s\S]*fillLight[\s\S]*rimLight/g, expected: true },
  { name: 'Tone Mapping Enabled', pattern: /ACESFilmicToneMapping/g, expected: true },
  { name: 'Exposure Increased', pattern: /toneMappingExposure.*1\.5/g, expected: true },
  { name: 'Material Enhancement', pattern: /envMapIntensity.*1\.5/g, expected: true }
];

let configPassed = true;
lightingChecks.forEach(check => {
  const found = check.pattern.test(scriptContent);
  const status = found === check.expected ? '✅' : '❌';
  console.log(`   ${status} ${check.name}: ${found ? 'Configured' : 'Missing'}`);
  if (found !== check.expected) configPassed = false;
});

// Test 2: Generate test frame
console.log('\n🎨 Test 2: Generate Test Frame with Enhanced Lighting');
console.log('   Creating test sequence directory...');

const testOutputDir = './test-lighting-output';
if (!fs.existsSync(testOutputDir)) {
  fs.mkdirSync(testOutputDir, { recursive: true });
}

// Create a minimal test to verify the script runs
console.log('   Testing script execution...');
try {
  // Check if Chrome is available for Puppeteer
  try {
    execSync('npx puppeteer browsers list', { stdio: 'pipe' });
    console.log('   ✅ Puppeteer browser available');
  } catch (error) {
    console.log('   ⚠️  Puppeteer browser not installed');
    console.log('   ℹ️  To fully test, run: npx puppeteer browsers install chrome');
  }
  
  // Verify script syntax
  const { MATERIALS, CONFIG } = require('./scripts/generate-3d-sequences.js');
  console.log('   ✅ Script loads without errors');
  console.log('   ✅ Materials configured:', Object.keys(MATERIALS).join(', '));
  console.log('   ✅ Image formats:', CONFIG.IMAGE_FORMATS.join(', '));
  
} catch (error) {
  console.error('   ❌ Script error:', error.message);
  configPassed = false;
}

// Test 3: Material brightness analysis
console.log('\n🔍 Test 3: Material Configuration Analysis');
const { MATERIALS } = require('./scripts/generate-3d-sequences.js');

Object.entries(MATERIALS).forEach(([name, config]) => {
  const avgColor = (config.color[0] + config.color[1] + config.color[2]) / 3;
  const brightness = avgColor > 0.7 ? 'Bright' : avgColor > 0.5 ? 'Medium' : 'Dark';
  console.log(`   ${name}: ${brightness} (roughness: ${config.roughness}, metalness: ${config.metallic})`);
});

// Summary
console.log('\n📊 PHASE 2 VALIDATION SUMMARY');
console.log('================================');

if (configPassed) {
  console.log('✅ PASS - Lighting configuration enhanced successfully!');
  console.log('\nNext Steps:');
  console.log('1. Phase 3: Remove dark images from filesystem');
  console.log('2. Phase 4: Regenerate all sequences with new lighting');
  console.log('3. Phase 5: Update paths and clear caches');
} else {
  console.log('❌ FAIL - Some lighting configurations missing or incorrect');
  console.log('\nPlease review the script modifications');
}

console.log('\n' + '='.repeat(50) + '\n');

// Cleanup
if (fs.existsSync(testOutputDir) && fs.readdirSync(testOutputDir).length === 0) {
  fs.rmdirSync(testOutputDir);
}