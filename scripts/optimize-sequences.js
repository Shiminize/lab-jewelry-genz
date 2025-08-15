#!/usr/bin/env node

/**
 * 3D Sequence Optimizer
 * Post-processing optimization for existing image sequences
 * Handles format conversion, compression, and batch optimization
 */

const fs = require('fs').promises
const path = require('path')
const { execSync } = require('child_process')
const sharp = require('sharp').catch(() => null) // Optional dependency

const CONFIG = {
  inputDir: '/Users/decepticonmanager/Projects/GenZJewelry_AUG_12/Public/images/products/3d-sequences',
  
  // Quality settings
  webpQuality: 85,
  avifQuality: 70,
  pngCompression: 9,
  
  // Optimization settings
  enableAVIF: false, // Enable when browser support improves
  enableProgressive: true,
  enableOptimization: true,
  
  // Size thresholds
  maxFileSize: 500 * 1024, // 500KB
  targetFileSize: 200 * 1024, // 200KB
}

class SequenceOptimizer {
  constructor() {
    this.stats = {
      processed: 0,
      optimized: 0,
      sizeBefore: 0,
      sizeAfter: 0,
      errors: []
    }
  }

  /**
   * Optimize single image file
   */
  async optimizeImage(imagePath, format = 'webp') {
    const ext = path.extname(imagePath)
    const basename = path.basename(imagePath, ext)
    const dir = path.dirname(imagePath)
    
    try {
      const stats = await fs.stat(imagePath)
      this.stats.sizeBefore += stats.size
      
      let outputPath
      let optimized = false
      
      if (sharp && CONFIG.enableOptimization) {
        // Use Sharp for high-quality optimization
        outputPath = path.join(dir, `${basename}.${format}`)
        
        const pipeline = sharp(imagePath)
        
        switch (format) {
          case 'webp':
            await pipeline
              .webp({ 
                quality: CONFIG.webpQuality,
                progressive: CONFIG.enableProgressive,
                effort: 6
              })
              .toFile(outputPath)
            break
            
          case 'avif':
            if (CONFIG.enableAVIF) {
              await pipeline
                .avif({ 
                  quality: CONFIG.avifQuality,
                  effort: 8
                })
                .toFile(outputPath)
            }
            break
            
          case 'png':
            await pipeline
              .png({ 
                compressionLevel: CONFIG.pngCompression,
                progressive: CONFIG.enableProgressive
              })
              .toFile(outputPath)
            break
        }
        
        optimized = true
      } else {
        // Fallback to command-line tools
        if (format === 'webp') {
          outputPath = path.join(dir, `${basename}.webp`)
          execSync(`cwebp -q ${CONFIG.webpQuality} "${imagePath}" -o "${outputPath}"`, { stdio: 'pipe' })
          optimized = true
        }
      }
      
      if (optimized && outputPath) {
        const newStats = await fs.stat(outputPath)
        this.stats.sizeAfter += newStats.size
        this.stats.optimized++
        
        // Check if we achieved target compression
        const compressionRatio = (stats.size - newStats.size) / stats.size
        if (compressionRatio > 0.3) {
          console.log(`  💎 ${basename}: ${this.formatBytes(stats.size)} → ${this.formatBytes(newStats.size)} (-${Math.round(compressionRatio * 100)}%)`)
        }
      }
      
      this.stats.processed++
      
    } catch (error) {
      this.stats.errors.push({ file: imagePath, error: error.message })
      console.error(`  ❌ ${basename}: ${error.message}`)
    }
  }

  /**
   * Process entire sequence directory
   */
  async optimizeSequence(sequenceDir) {
    const sequenceName = path.basename(sequenceDir)
    console.log(`🎬 Optimizing: ${sequenceName}`)
    
    try {
      const files = await fs.readdir(sequenceDir)
      const imageFiles = files.filter(f => f.match(/\.(png|jpg|jpeg)$/i))
      
      if (imageFiles.length === 0) {
        console.log(`  ⚠️  No images found in ${sequenceName}`)
        return
      }
      
      // Process images in parallel with concurrency limit
      const semaphore = new Array(4).fill(null) // Max 4 concurrent optimizations
      const promises = imageFiles.map(async (file, index) => {
        await semaphore[index % semaphore.length]
        semaphore[index % semaphore.length] = this.optimizeImage(
          path.join(sequenceDir, file),
          'webp'
        )
        return semaphore[index % semaphore.length]
      })
      
      await Promise.allSettled(promises)
      
      // Update manifest
      await this.updateManifest(sequenceDir)
      
    } catch (error) {
      console.error(`❌ Failed to optimize ${sequenceName}: ${error.message}`)
    }
  }

  /**
   * Update sequence manifest with optimization info
   */
  async updateManifest(sequenceDir) {
    const manifestPath = path.join(sequenceDir, 'manifest.json')
    
    try {
      let manifest = {}
      
      try {
        const manifestContent = await fs.readFile(manifestPath, 'utf-8')
        manifest = JSON.parse(manifestContent)
      } catch {
        // Create new manifest if none exists
      }
      
      // Add optimization metadata
      manifest.optimization = {
        optimizedAt: new Date().toISOString(),
        optimizer: 'sequence-optimizer v1.0',
        webpQuality: CONFIG.webpQuality,
        formats: ['png', 'webp']
      }
      
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
      
    } catch (error) {
      console.warn(`⚠️  Could not update manifest: ${error.message}`)
    }
  }

  /**
   * Batch optimize all sequences
   */
  async optimizeAll() {
    console.log('🚀 Starting batch optimization of all sequences')
    
    try {
      const sequences = await fs.readdir(CONFIG.inputDir)
      const sequenceDirs = []
      
      for (const item of sequences) {
        const itemPath = path.join(CONFIG.inputDir, item)
        const stat = await fs.stat(itemPath)
        
        if (stat.isDirectory()) {
          sequenceDirs.push(itemPath)
        }
      }
      
      console.log(`Found ${sequenceDirs.length} sequence directories`)
      
      for (const sequenceDir of sequenceDirs) {
        await this.optimizeSequence(sequenceDir)
      }
      
      this.printOptimizationSummary()
      
    } catch (error) {
      console.error(`💥 Batch optimization failed: ${error.message}`)
    }
  }

  /**
   * Print optimization summary
   */
  printOptimizationSummary() {
    const totalSavings = this.stats.sizeBefore - this.stats.sizeAfter
    const compressionRatio = totalSavings / this.stats.sizeBefore
    
    console.log('\n📊 Optimization Summary')
    console.log('=' * 30)
    console.log(`📁 Processed: ${this.stats.processed} files`)
    console.log(`✨ Optimized: ${this.stats.optimized} files`)
    console.log(`💾 Size before: ${this.formatBytes(this.stats.sizeBefore)}`)
    console.log(`💎 Size after: ${this.formatBytes(this.stats.sizeAfter)}`)
    console.log(`🎯 Total savings: ${this.formatBytes(totalSavings)} (-${Math.round(compressionRatio * 100)}%)`)
    
    if (this.stats.errors.length > 0) {
      console.log(`\n❌ Errors: ${this.stats.errors.length}`)
      this.stats.errors.slice(0, 5).forEach(({ file, error }) => {
        console.log(`  - ${path.basename(file)}: ${error}`)
      })
      if (this.stats.errors.length > 5) {
        console.log(`  ... and ${this.stats.errors.length - 5} more`)
      }
    }
  }

  /**
   * Format bytes for display
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  /**
   * Generate quality report for sequences
   */
  async generateQualityReport() {
    console.log('📋 Generating quality report for sequences')
    
    const report = {
      timestamp: new Date().toISOString(),
      sequences: [],
      summary: {
        totalSequences: 0,
        totalFrames: 0,
        totalSize: 0,
        avgFileSize: 0,
        formats: new Set()
      }
    }
    
    const sequences = await fs.readdir(CONFIG.inputDir)
    
    for (const sequenceName of sequences) {
      const sequenceDir = path.join(CONFIG.inputDir, sequenceName)
      const stat = await fs.stat(sequenceDir)
      
      if (!stat.isDirectory()) continue
      
      const files = await fs.readdir(sequenceDir)
      const imageFiles = files.filter(f => f.match(/\.(png|webp|avif)$/i))
      
      let totalSize = 0
      const formats = new Set()
      
      for (const file of imageFiles) {
        const filePath = path.join(sequenceDir, file)
        const fileStats = await fs.stat(filePath)
        totalSize += fileStats.size
        formats.add(path.extname(file).toLowerCase())
      }
      
      const sequenceInfo = {
        name: sequenceName,
        frameCount: imageFiles.filter(f => f.endsWith('.png')).length,
        totalSize: totalSize,
        avgFileSize: totalSize / imageFiles.length,
        formats: Array.from(formats),
        files: imageFiles.length
      }
      
      report.sequences.push(sequenceInfo)
      report.summary.totalSequences++
      report.summary.totalFrames += sequenceInfo.frameCount
      report.summary.totalSize += totalSize
      sequenceInfo.formats.forEach(f => report.summary.formats.add(f))
    }
    
    report.summary.avgFileSize = report.summary.totalSize / report.summary.totalFrames
    report.summary.formats = Array.from(report.summary.formats)
    
    // Write report
    const reportPath = path.join(CONFIG.inputDir, 'quality-report.json')
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    
    // Print summary
    console.log(`\n📊 Quality Report Generated`)
    console.log(`📁 Total sequences: ${report.summary.totalSequences}`)
    console.log(`🎬 Total frames: ${report.summary.totalFrames}`)
    console.log(`💾 Total size: ${this.formatBytes(report.summary.totalSize)}`)
    console.log(`📊 Average file size: ${this.formatBytes(report.summary.avgFileSize)}`)
    console.log(`🎨 Formats: ${report.summary.formats.join(', ')}`)
    console.log(`📋 Report saved: ${reportPath}`)
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'help'
  
  const optimizer = new SequenceOptimizer()
  
  try {
    switch (command) {
      case 'optimize':
        await optimizer.optimizeAll()
        break
        
      case 'sequence':
        const sequenceName = args[1]
        if (!sequenceName) {
          throw new Error('Sequence name required: node optimize-sequences.js sequence <sequence-name>')
        }
        
        const sequenceDir = path.join(CONFIG.inputDir, sequenceName)
        await optimizer.optimizeSequence(sequenceDir)
        break
        
      case 'report':
        await optimizer.generateQualityReport()
        break
        
      case 'help':
      default:
        console.log(`
💎 3D Sequence Optimizer

Usage:
  node optimize-sequences.js <command> [options]

Commands:
  optimize           Optimize all existing sequences
  sequence <name>    Optimize specific sequence
  report             Generate quality report
  help               Show this help message

Configuration:
  - WebP Quality: ${CONFIG.webpQuality}%
  - AVIF Quality: ${CONFIG.avifQuality}%
  - PNG Compression: ${CONFIG.pngCompression}
  - Target Size: ${Math.round(CONFIG.targetFileSize/1024)}KB

Requirements:
  - Sharp (npm install sharp) for best quality
  - WebP tools (cwebp) for WebP conversion
  - AVIF tools (optional) for AVIF conversion

Examples:
  node optimize-sequences.js optimize
  node optimize-sequences.js sequence toy_car-platinum  
  node optimize-sequences.js report
`)
        break
    }
    
  } catch (error) {
    console.error(`💥 Fatal error: ${error.message}`)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { SequenceOptimizer, CONFIG }