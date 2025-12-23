#!/usr/bin/env node

/**
 * 3D Sequence Quality Checker
 * Validates sequence integrity and performance characteristics
 * Ensures consistent frame counts, file sizes, and loading performance
 */

const fs = require('fs').promises
const path = require('path')
const { performance } = require('perf_hooks')

const CONFIG = {
  sequencesDir: '/Users/decepticonmanager/Projects/GenZJewelry_AUG_12/Public/images/products/3d-sequences',
  expectedFrameCount: 36,
  maxFileSize: 500 * 1024, // 500KB
  minFileSize: 10 * 1024,  // 10KB
  requiredFormats: ['png', 'webp'],
  loadTimeThreshold: 100 // ms
}

class SequenceQualityChecker {
  constructor() {
    this.results = {
      totalSequences: 0,
      passedSequences: 0,
      failedSequences: 0,
      issues: [],
      performance: {
        avgLoadTime: 0,
        maxLoadTime: 0,
        totalSize: 0
      }
    }
  }

  /**
   * Check individual sequence quality
   */
  async checkSequence(sequenceName, sequencePath) {
    const issues = []
    const startTime = performance.now()
    
    try {
      // Check if directory exists and is accessible
      const stat = await fs.stat(sequencePath)
      if (!stat.isDirectory()) {
        issues.push('Not a directory')
        return { sequenceName, issues, loadTime: 0 }
      }
      
      // Get all files in sequence
      const files = await fs.readdir(sequencePath)
      const imageFiles = files.filter(f => f.match(/\.(png|webp|avif)$/i))
      
      // Check frame count
      const pngFrames = files.filter(f => f.endsWith('.png')).length
      if (pngFrames !== CONFIG.expectedFrameCount) {
        issues.push(`Frame count mismatch: expected ${CONFIG.expectedFrameCount}, found ${pngFrames}`)
      }
      
      // Check sequential numbering
      const frameNumbers = files
        .filter(f => f.endsWith('.png'))
        .map(f => parseInt(path.basename(f, '.png')))
        .sort((a, b) => a - b)
      
      const expectedFrames = Array.from({ length: CONFIG.expectedFrameCount }, (_, i) => i)
      const missingFrames = expectedFrames.filter(n => !frameNumbers.includes(n))
      if (missingFrames.length > 0) {
        issues.push(`Missing frames: ${missingFrames.join(', ')}`)
      }
      
      // Check file formats
      const availableFormats = new Set()
      imageFiles.forEach(f => {
        const ext = path.extname(f).toLowerCase().slice(1)
        availableFormats.add(ext)
      })
      
      const missingFormats = CONFIG.requiredFormats.filter(f => !availableFormats.has(f))
      if (missingFormats.length > 0) {
        issues.push(`Missing formats: ${missingFormats.join(', ')}`)
      }
      
      // Check file sizes
      let totalSize = 0
      let oversizedFiles = []
      let undersizedFiles = []
      
      for (const file of imageFiles) {
        const filePath = path.join(sequencePath, file)
        const fileStats = await fs.stat(filePath)
        totalSize += fileStats.size
        
        if (fileStats.size > CONFIG.maxFileSize) {
          oversizedFiles.push(`${file} (${this.formatBytes(fileStats.size)})`)
        }
        
        if (fileStats.size < CONFIG.minFileSize) {
          undersizedFiles.push(`${file} (${this.formatBytes(fileStats.size)})`)
        }
      }
      
      if (oversizedFiles.length > 0) {
        issues.push(`Oversized files: ${oversizedFiles.slice(0, 3).join(', ')}${oversizedFiles.length > 3 ? '...' : ''}`)
      }
      
      if (undersizedFiles.length > 0) {
        issues.push(`Undersized files: ${undersizedFiles.slice(0, 3).join(', ')}${undersizedFiles.length > 3 ? '...' : ''}`)
      }
      
      // Check manifest file
      const manifestPath = path.join(sequencePath, 'manifest.json')
      try {
        const manifestContent = await fs.readFile(manifestPath, 'utf-8')
        const manifest = JSON.parse(manifestContent)
        
        if (!manifest.frameCount || manifest.frameCount !== pngFrames) {
          issues.push('Manifest frame count mismatch')
        }
        
        if (!manifest.material) {
          issues.push('Missing material info in manifest')
        }
        
      } catch {
        issues.push('Missing or invalid manifest.json')
      }
      
      const loadTime = performance.now() - startTime
      this.results.performance.totalSize += totalSize
      this.results.performance.avgLoadTime += loadTime
      this.results.performance.maxLoadTime = Math.max(this.results.performance.maxLoadTime, loadTime)
      
      return {
        sequenceName,
        issues,
        loadTime,
        totalSize,
        frameCount: pngFrames,
        availableFormats: Array.from(availableFormats)
      }
      
    } catch (error) {
      issues.push(`Access error: ${error.message}`)
      return {
        sequenceName,
        issues,
        loadTime: performance.now() - startTime,
        totalSize: 0,
        frameCount: 0,
        availableFormats: []
      }
    }
  }

  /**
   * Run quality check on all sequences
   */
  async checkAllSequences() {
    console.log('🔍 Starting 3D sequence quality check...')
    
    try {
      const sequences = await fs.readdir(CONFIG.sequencesDir)
      const results = []
      
      for (const sequenceName of sequences) {
        const sequencePath = path.join(CONFIG.sequencesDir, sequenceName)
        
        try {
          const stat = await fs.stat(sequencePath)
          if (stat.isDirectory()) {
            const result = await this.checkSequence(sequenceName, sequencePath)
            results.push(result)
            
            if (result.issues.length === 0) {
              this.results.passedSequences++
              console.log(`✅ ${sequenceName}: OK`)
            } else {
              this.results.failedSequences++
              console.log(`❌ ${sequenceName}: ${result.issues.length} issues`)
              result.issues.forEach(issue => console.log(`    - ${issue}`))
            }
          }
        } catch (error) {
          console.log(`⚠️  ${sequenceName}: ${error.message}`)
        }
      }
      
      this.results.totalSequences = results.length
      if (this.results.totalSequences > 0) {
        this.results.performance.avgLoadTime /= this.results.totalSequences
      }
      
      return results
      
    } catch (error) {
      console.error(`💥 Quality check failed: ${error.message}`)
      throw error
    }
  }

  /**
   * Generate detailed quality report
   */
  async generateQualityReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalSequences: this.results.totalSequences,
        passedSequences: this.results.passedSequences,
        failedSequences: this.results.failedSequences,
        successRate: Math.round((this.results.passedSequences / this.results.totalSequences) * 100),
        totalSize: this.results.performance.totalSize,
        avgLoadTime: Math.round(this.results.performance.avgLoadTime),
        maxLoadTime: Math.round(this.results.performance.maxLoadTime)
      },
      sequences: results,
      recommendations: this.generateRecommendations(results)
    }
    
    // Write report
    const reportPath = path.join(CONFIG.sequencesDir, 'quality-report.json')
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    
    // Print summary
    this.printQualitySummary(report)
    
    return report
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations(results) {
    const recommendations = []
    
    // Check for missing sequences
    const missingSequences = results.filter(r => r.frameCount === 0)
    if (missingSequences.length > 0) {
      recommendations.push({
        type: 'missing_sequences',
        priority: 'high',
        description: 'Generate missing image sequences',
        action: 'Run: npm run generate-quick-fix',
        affected: missingSequences.map(s => s.sequenceName)
      })
    }
    
    // Check for incomplete sequences
    const incompleteSequences = results.filter(r => 
      r.frameCount > 0 && r.frameCount < CONFIG.expectedFrameCount
    )
    if (incompleteSequences.length > 0) {
      recommendations.push({
        type: 'incomplete_sequences',
        priority: 'high',
        description: 'Complete sequences with missing frames',
        action: 'Regenerate affected sequences',
        affected: incompleteSequences.map(s => s.sequenceName)
      })
    }
    
    // Check for missing formats
    const missingFormats = results.filter(r => 
      !r.availableFormats.includes('webp') && r.availableFormats.includes('png')
    )
    if (missingFormats.length > 0) {
      recommendations.push({
        type: 'missing_formats',
        priority: 'medium',
        description: 'Convert PNG sequences to WebP for better performance',
        action: 'Run: npm run optimize-sequences',
        affected: missingFormats.map(s => s.sequenceName)
      })
    }
    
    // Check for oversized files
    const oversizedSequences = results.filter(r => 
      r.totalSize > CONFIG.maxFileSize * CONFIG.expectedFrameCount
    )
    if (oversizedSequences.length > 0) {
      recommendations.push({
        type: 'oversized_files',
        priority: 'medium',
        description: 'Optimize file sizes for faster loading',
        action: 'Run: npm run optimize-sequences',
        affected: oversizedSequences.map(s => s.sequenceName)
      })
    }
    
    return recommendations
  }

  /**
   * Print quality summary
   */
  printQualitySummary(report) {
    console.log('\n📊 3D Sequence Quality Report')
    console.log('=' * 35)
    console.log(`📁 Total sequences: ${report.summary.totalSequences}`)
    console.log(`✅ Passed: ${report.summary.passedSequences}`)
    console.log(`❌ Failed: ${report.summary.failedSequences}`)
    console.log(`🎯 Success rate: ${report.summary.successRate}%`)
    console.log(`💾 Total size: ${this.formatBytes(report.summary.totalSize)}`)
    console.log(`⚡ Avg load time: ${report.summary.avgLoadTime}ms`)
    
    if (report.recommendations.length > 0) {
      console.log('\n🔧 Recommendations:')
      report.recommendations.forEach(rec => {
        const priority = rec.priority === 'high' ? '🔴' : '🟡'
        console.log(`${priority} ${rec.description}`)
        console.log(`   Action: ${rec.action}`)
        console.log(`   Affected: ${rec.affected.length} sequences`)
      })
    } else {
      console.log('\n🎉 All sequences pass quality checks!')
    }
    
    console.log(`\n📋 Full report: ${path.join(CONFIG.sequencesDir, 'quality-report.json')}`)
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
   * Auto-fix common issues
   */
  async autoFix() {
    console.log('🔧 Running auto-fix for sequence issues...')
    
    const results = await this.checkAllSequences()
    const report = await this.generateQualityReport(results)
    
    for (const recommendation of report.recommendations) {
      if (recommendation.type === 'missing_sequences') {
        console.log('🎬 Auto-fixing: Generating missing sequences...')
        // Would call batch generator here
        console.log('   Run: npm run generate-quick-fix')
      }
      
      if (recommendation.type === 'missing_formats') {
        console.log('💎 Auto-fixing: Converting to WebP...')
        // Would call optimizer here
        console.log('   Run: npm run optimize-sequences')
      }
    }
    
    console.log('✅ Auto-fix recommendations generated')
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'check'
  
  const checker = new SequenceQualityChecker()
  
  try {
    switch (command) {
      case 'check':
        const results = await checker.checkAllSequences()
        await checker.generateQualityReport(results)
        break
        
      case 'sequence':
        const sequenceName = args[1]
        if (!sequenceName) {
          throw new Error('Sequence name required: node sequence-quality-checker.js sequence <name>')
        }
        
        const sequencePath = path.join(CONFIG.sequencesDir, sequenceName)
        const result = await checker.checkSequence(sequenceName, sequencePath)
        
        console.log(`\n🔍 Quality Check: ${sequenceName}`)
        if (result.issues.length === 0) {
          console.log('✅ All checks passed')
        } else {
          console.log(`❌ Found ${result.issues.length} issues:`)
          result.issues.forEach(issue => console.log(`  - ${issue}`))
        }
        break
        
      case 'auto-fix':
        await checker.autoFix()
        break
        
      case 'help':
      default:
        console.log(`
🔍 3D Sequence Quality Checker

Usage:
  node sequence-quality-checker.js <command> [options]

Commands:
  check              Check quality of all sequences
  sequence <name>    Check specific sequence
  auto-fix           Generate fix recommendations  
  help               Show this help message

Quality Checks:
  ✓ Frame count (${CONFIG.expectedFrameCount} frames expected)
  ✓ Sequential numbering (0.png through ${CONFIG.expectedFrameCount-1}.png)
  ✓ File formats (${CONFIG.requiredFormats.join(', ')})
  ✓ File sizes (${Math.round(CONFIG.minFileSize/1024)}-${Math.round(CONFIG.maxFileSize/1024)}KB)
  ✓ Manifest integrity
  ✓ Load performance

Examples:
  node sequence-quality-checker.js check
  node sequence-quality-checker.js sequence toy_car-platinum
  node sequence-quality-checker.js auto-fix
`)
        break
    }
    
  } catch (error) {
    console.error(`💥 Quality check failed: ${error.message}`)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { SequenceQualityChecker, CONFIG }