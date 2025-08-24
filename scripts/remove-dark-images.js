#!/usr/bin/env node

/**
 * Phase 3: Remove Dark Images Script
 * Backs up and removes all dark/black jewelry images
 * CLAUDE_RULES compliant with safety checks
 */

const fs = require('fs');
const path = require('path');

const SEQUENCES_DIR = './public/images/products/3d-sequences';
const BACKUP_DIR = `./backup/dark-images-${Date.now()}`;

console.log('\n🧹 PHASE 3: Dark Image Removal Process\n');

// Safety check - ensure we're in the right directory
if (!fs.existsSync('./package.json') || !fs.existsSync(SEQUENCES_DIR)) {
  console.error('❌ Error: Must run from project root directory');
  process.exit(1);
}

// Get all sequence directories
const sequenceDirs = fs.readdirSync(SEQUENCES_DIR)
  .filter(dir => {
    const fullPath = path.join(SEQUENCES_DIR, dir);
    return fs.statSync(fullPath).isDirectory();
  })
  .map(dir => ({
    name: dir,
    path: path.join(SEQUENCES_DIR, dir)
  }));

console.log(`📁 Found ${sequenceDirs.length} sequence directories`);

// Create backup directory
console.log(`\n💾 Creating backup at: ${BACKUP_DIR}`);
fs.mkdirSync(BACKUP_DIR, { recursive: true });

// Backup statistics
let backedUpCount = 0;
let totalFiles = 0;
let totalSize = 0;

// Process each sequence directory
sequenceDirs.forEach(seq => {
  console.log(`\n📦 Processing: ${seq.name}`);
  
  const files = fs.readdirSync(seq.path);
  const imageFiles = files.filter(f => /\.(webp|avif|png)$/.test(f));
  
  if (imageFiles.length > 0) {
    // Create backup subdirectory
    const backupSubDir = path.join(BACKUP_DIR, seq.name);
    fs.mkdirSync(backupSubDir, { recursive: true });
    
    // Copy files to backup
    imageFiles.forEach(file => {
      const srcPath = path.join(seq.path, file);
      const destPath = path.join(backupSubDir, file);
      const stats = fs.statSync(srcPath);
      
      fs.copyFileSync(srcPath, destPath);
      totalFiles++;
      totalSize += stats.size;
    });
    
    console.log(`   ✅ Backed up ${imageFiles.length} files`);
    backedUpCount++;
  }
});

// Report backup results
console.log('\n📊 Backup Summary:');
console.log(`   Directories backed up: ${backedUpCount}`);
console.log(`   Total files: ${totalFiles}`);
console.log(`   Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

// Safety confirmation
console.log('\n⚠️  WARNING: This will delete all current 3D sequences!');
console.log('   Backup location: ' + BACKUP_DIR);
console.log('\n   To proceed with deletion, run with --confirm flag');
console.log('   node scripts/remove-dark-images.js --confirm');

// Check for confirmation flag
if (process.argv.includes('--confirm')) {
  console.log('\n🗑️  Deletion confirmed, removing dark images...');
  
  let deletedCount = 0;
  sequenceDirs.forEach(seq => {
    try {
      // Remove directory and all contents
      fs.rmSync(seq.path, { recursive: true, force: true });
      console.log(`   ✅ Removed: ${seq.name}`);
      deletedCount++;
    } catch (error) {
      console.error(`   ❌ Failed to remove ${seq.name}:`, error.message);
    }
  });
  
  console.log(`\n✅ Removed ${deletedCount} sequence directories`);
  console.log('🎯 Ready for Phase 4: Regenerate with proper lighting');
  
  // Create .gitignore entry for backup
  const gitignorePath = './.gitignore';
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (!gitignoreContent.includes('backup/')) {
    fs.appendFileSync(gitignorePath, '\n# Dark image backups\nbackup/\n');
    console.log('\n📝 Added backup/ to .gitignore');
  }
} else {
  console.log('\n⏸️  Deletion skipped - no --confirm flag provided');
}

console.log('\n' + '='.repeat(50) + '\n');