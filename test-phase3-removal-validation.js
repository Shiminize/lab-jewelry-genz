#!/usr/bin/env node

/**
 * Phase 3 E2E Test: Verify Dark Image Removal
 * Confirms all dark images removed and backup created
 * CLAUDE_RULES compliant validation
 */

const fs = require('fs');
const path = require('path');

console.log('\n🧪 PHASE 3 E2E TEST: Dark Image Removal Validation\n');

const SEQUENCES_DIR = './public/images/products/3d-sequences';

// Test 1: Verify sequences directory is empty
console.log('📁 Test 1: Sequences Directory Check');
const sequenceExists = fs.existsSync(SEQUENCES_DIR);
let sequenceContents = [];

if (sequenceExists) {
  sequenceContents = fs.readdirSync(SEQUENCES_DIR);
  console.log(`   Directory exists: ${SEQUENCES_DIR}`);
  console.log(`   Contents: ${sequenceContents.length} items`);
  
  if (sequenceContents.length === 0) {
    console.log('   ✅ Directory is empty - all dark images removed');
  } else {
    console.log('   ❌ Directory still contains items:', sequenceContents);
  }
} else {
  console.log('   ✅ Sequences directory removed completely');
}

// Test 2: Verify backup exists
console.log('\n💾 Test 2: Backup Verification');
const backupDirs = fs.existsSync('./backup') ? 
  fs.readdirSync('./backup').filter(d => d.startsWith('dark-images-')) : [];

if (backupDirs.length > 0) {
  console.log(`   ✅ Found ${backupDirs.length} backup(s)`);
  
  // Check latest backup
  const latestBackup = backupDirs.sort().pop();
  const backupPath = path.join('./backup', latestBackup);
  const backupContents = fs.readdirSync(backupPath);
  
  console.log(`   Latest backup: ${latestBackup}`);
  console.log(`   Contains ${backupContents.length} sequence directories`);
  
  // Verify backup integrity
  let totalBackupFiles = 0;
  backupContents.forEach(dir => {
    const dirPath = path.join(backupPath, dir);
    const files = fs.readdirSync(dirPath);
    totalBackupFiles += files.length;
  });
  
  console.log(`   Total backed up files: ${totalBackupFiles}`);
} else {
  console.log('   ❌ No backup found');
}

// Test 3: Verify .gitignore updated
console.log('\n📝 Test 3: Git Configuration');
const gitignoreContent = fs.readFileSync('./.gitignore', 'utf8');
const hasBackupIgnore = gitignoreContent.includes('backup/');

if (hasBackupIgnore) {
  console.log('   ✅ Backup directory added to .gitignore');
} else {
  console.log('   ❌ Backup directory not in .gitignore');
}

// Test 4: Verify cache is clear
console.log('\n🗂️ Test 4: Cache Status');
console.log('   ℹ️  Browser/CDN caches may still contain dark images');
console.log('   ℹ️  Users should clear browser cache or use hard refresh');

// Summary
console.log('\n📊 PHASE 3 VALIDATION SUMMARY');
console.log('================================');

const phase3Passed = 
  (sequenceContents.length === 0 || !sequenceExists) && 
  backupDirs.length > 0 && 
  hasBackupIgnore;

if (phase3Passed) {
  console.log('✅ PASS - Dark images successfully removed!');
  console.log('\nNext Steps:');
  console.log('1. Phase 4: Run generate-3d-sequences.js with new lighting');
  console.log('2. Phase 5: Update paths and clear AssetCacheService');
  console.log('3. Phase 6: Final E2E validation');
} else {
  console.log('❌ FAIL - Some removal steps incomplete');
}

console.log('\n' + '='.repeat(50) + '\n');