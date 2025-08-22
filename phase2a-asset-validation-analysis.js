#!/usr/bin/env node

/**
 * Phase 2A: Asset Path Validation and Image Sequence Completeness Analysis
 * 
 * Root Cause Analysis - Asset Management Investigation
 * Target: Resolve 120 asset 404 errors affecting material switch performance
 * 
 * Findings from Phase 1: Platinum sequence frames 12-35 missing
 * Impact: 20-30% contribution to material switch performance violation
 */

const fs = require('fs').promises;
const path = require('path');

class AssetValidationAnalyzer {
  constructor() {
    this.baseDir = './Public/images/products/3d-sequences';
    this.expectedMaterials = [
      'Black_Stone_Ring-rose-gold-sequence',
      'Black_Stone_Ring-white-gold-sequence', 
      'Black_Stone_Ring-yellow-gold-sequence',
      'Black_Stone_Ring-platinum-sequence'
    ];
    this.expectedFormats = ['webp', 'png', 'jpg', 'jpeg'];
    this.expectedFrameCount = 36; // CLAUDE_RULES: 36 angles at 10° increments
    this.assetReport = {
      timestamp: new Date().toISOString(),
      analysis: {
        scope: 'CSS 3D Customizer asset completeness validation',
        target: 'Resolve 120 asset 404 errors impacting material switch performance',
        expectedFrames: this.expectedFrameCount,
        materials: this.expectedMaterials
      },
      findings: {
        materialCompleteness: {},
        missingAssets: [],
        formatAnalysis: {},
        performanceImpact: {}
      }
    };
  }

  async validateDirectory() {
    console.log('🔍 Phase 2A: Asset Path Validation Starting...');
    console.log(`📁 Base directory: ${this.baseDir}`);
    console.log(`🎯 Expected materials: ${this.expectedMaterials.length}`);
    console.log(`🖼️  Expected frames per material: ${this.expectedFrameCount}`);
    console.log('=' * 60);

    try {
      const stats = await fs.stat(this.baseDir);
      if (!stats.isDirectory()) {
        throw new Error(`Base directory ${this.baseDir} is not a directory`);
      }
      console.log(`✅ Base directory exists: ${this.baseDir}`);
    } catch (error) {
      console.error(`❌ Base directory validation failed: ${error.message}`);
      return false;
    }

    return true;
  }

  async analyzeAssetCompleteness() {
    console.log('\n📊 Analyzing Asset Completeness...');
    
    for (const material of this.expectedMaterials) {
      console.log(`\n🔍 Analyzing material: ${material}`);
      
      const materialPath = path.join(this.baseDir, material);
      const materialAnalysis = {
        path: materialPath,
        exists: false,
        totalFiles: 0,
        frameAnalysis: {
          completeFrames: [],
          missingFrames: [],
          formatBreakdown: {}
        },
        performanceImpact: {
          expectedRequests: this.expectedFrameCount,
          successful404s: 0,
          estimatedLoadTime: 0
        }
      };

      try {
        const stats = await fs.stat(materialPath);
        if (stats.isDirectory()) {
          materialAnalysis.exists = true;
          console.log(`✅ Material directory exists: ${material}`);
          
          // Analyze frame completeness
          await this.analyzeFrameCompleteness(materialPath, materialAnalysis);
          
        } else {
          console.log(`❌ Material path exists but is not a directory: ${material}`);
        }
      } catch (error) {
        console.log(`❌ Material directory missing: ${material}`);
        materialAnalysis.exists = false;
        
        // All frames missing - calculate performance impact
        for (let frame = 0; frame < this.expectedFrameCount; frame++) {
          materialAnalysis.frameAnalysis.missingFrames.push(frame);
          this.assetReport.findings.missingAssets.push({
            material,
            frame,
            expectedPath: path.join(materialPath, `${frame}.webp`),
            impact: 'CRITICAL' // Each missing frame causes network timeout
          });
        }
        
        materialAnalysis.performanceImpact.successful404s = this.expectedFrameCount;
        materialAnalysis.performanceImpact.estimatedLoadTime = this.expectedFrameCount * 50; // ~50ms per 404 timeout
      }

      this.assetReport.findings.materialCompleteness[material] = materialAnalysis;
      this.reportMaterialStatus(material, materialAnalysis);
    }
  }

  async analyzeFrameCompleteness(materialPath, materialAnalysis) {
    try {
      const files = await fs.readdir(materialPath);
      materialAnalysis.totalFiles = files.length;
      
      console.log(`📁 Found ${files.length} files in ${path.basename(materialPath)}`);
      
      // Initialize format tracking
      this.expectedFormats.forEach(format => {
        materialAnalysis.frameAnalysis.formatBreakdown[format] = [];
      });

      // Check each expected frame
      for (let frame = 0; frame < this.expectedFrameCount; frame++) {
        let frameFound = false;
        
        // Check each format for this frame
        for (const format of this.expectedFormats) {
          const filename = `${frame}.${format}`;
          if (files.includes(filename)) {
            materialAnalysis.frameAnalysis.completeFrames.push(frame);
            materialAnalysis.frameAnalysis.formatBreakdown[format].push(frame);
            frameFound = true;
            break; // Found in this format, move to next frame
          }
        }
        
        if (!frameFound) {
          materialAnalysis.frameAnalysis.missingFrames.push(frame);
          this.assetReport.findings.missingAssets.push({
            material: path.basename(materialPath),
            frame,
            expectedPath: path.join(materialPath, `${frame}.webp`),
            impact: 'HIGH' // Missing frame causes 404 and fallback attempts
          });
          materialAnalysis.performanceImpact.successful404s++;
        }
      }
      
      // Calculate performance impact
      const completionRate = materialAnalysis.frameAnalysis.completeFrames.length / this.expectedFrameCount;
      materialAnalysis.performanceImpact.estimatedLoadTime = materialAnalysis.performanceImpact.successful404s * 50; // ~50ms per 404
      
      console.log(`📊 Frame completion: ${materialAnalysis.frameAnalysis.completeFrames.length}/${this.expectedFrameCount} (${(completionRate * 100).toFixed(1)}%)`);
      console.log(`❌ Missing frames: ${materialAnalysis.frameAnalysis.missingFrames.length}`);
      
      if (materialAnalysis.frameAnalysis.missingFrames.length > 0) {
        console.log(`🚨 Missing frames: [${materialAnalysis.frameAnalysis.missingFrames.join(', ')}]`);
        console.log(`⏱️  Estimated 404 delay: ${materialAnalysis.performanceImpact.estimatedLoadTime}ms`);
      }

    } catch (error) {
      console.error(`❌ Failed to analyze frames in ${materialPath}: ${error.message}`);
    }
  }

  reportMaterialStatus(material, analysis) {
    const completionRate = analysis.frameAnalysis.completeFrames.length / this.expectedFrameCount;
    const statusIcon = completionRate === 1.0 ? '✅' : completionRate > 0.5 ? '⚠️' : '❌';
    
    console.log(`${statusIcon} ${material}: ${(completionRate * 100).toFixed(1)}% complete`);
    
    if (analysis.frameAnalysis.missingFrames.length > 0) {
      console.log(`   └── Missing: ${analysis.frameAnalysis.missingFrames.length} frames (${analysis.performanceImpact.estimatedLoadTime}ms delay)`);
    }
    
    // Format breakdown
    Object.entries(analysis.frameAnalysis.formatBreakdown).forEach(([format, frames]) => {
      if (frames.length > 0) {
        console.log(`   └── ${format.toUpperCase()}: ${frames.length} frames`);
      }
    });
  }

  async analyzePerformanceImpact() {
    console.log('\n⚡ Performance Impact Analysis...');
    
    let totalMissingFrames = 0;
    let totalEstimatedDelay = 0;
    let materialStatusSummary = {
      complete: 0,
      partial: 0,  
      missing: 0
    };

    Object.entries(this.assetReport.findings.materialCompleteness).forEach(([material, analysis]) => {
      const missingCount = analysis.frameAnalysis.missingFrames.length;
      const completionRate = (this.expectedFrameCount - missingCount) / this.expectedFrameCount;
      
      totalMissingFrames += missingCount;
      totalEstimatedDelay += analysis.performanceImpact.estimatedLoadTime;
      
      if (completionRate === 1.0) {
        materialStatusSummary.complete++;
      } else if (completionRate > 0) {
        materialStatusSummary.partial++;
      } else {
        materialStatusSummary.missing++;
      }
    });

    this.assetReport.findings.performanceImpact = {
      totalMissingAssets: totalMissingFrames,
      estimatedPerformancePenalty: totalEstimatedDelay,
      materialDistribution: materialStatusSummary,
      claudeRulesImpact: {
        materialSwitchDelay: totalEstimatedDelay / this.expectedMaterials.length, // Average delay per material switch
        targetViolation: totalEstimatedDelay > 100, // CLAUDE_RULES <100ms violation
        contributionToOverallDelay: Math.round((totalEstimatedDelay / 1000) * 100) // Percentage contribution to 631-1140ms delays
      }
    };

    console.log(`📊 PERFORMANCE IMPACT SUMMARY:`);
    console.log(`   Total Missing Assets: ${totalMissingFrames}`);
    console.log(`   Estimated Performance Penalty: ${totalEstimatedDelay}ms`);
    console.log(`   Average Delay Per Material Switch: ${Math.round(totalEstimatedDelay / this.expectedMaterials.length)}ms`);
    console.log(`   Materials Complete: ${materialStatusSummary.complete}/${this.expectedMaterials.length}`);
    console.log(`   Materials Partial: ${materialStatusSummary.partial}/${this.expectedMaterials.length}`);
    console.log(`   Materials Missing: ${materialStatusSummary.missing}/${this.expectedMaterials.length}`);
    
    const contributionPercentage = Math.round((totalEstimatedDelay / 885) * 100); // 885ms = average material switch time from Phase 1
    console.log(`   Contribution to Material Switch Delays: ~${contributionPercentage}% of observed 631-1140ms delays`);
  }

  async identifyRootCauses() {
    console.log('\n🔍 Root Cause Identification...');
    
    const missingAssets = this.assetReport.findings.missingAssets;
    const rootCauses = {
      systematicGaps: {},
      patternAnalysis: {
        completelyMissingMaterials: [],
        partiallyMissingMaterials: [],
        consistentMissingFrames: []
      },
      potentialCauses: []
    };

    // Analyze missing patterns
    const materialMissingCounts = {};
    const frameMissingCounts = {};

    missingAssets.forEach(asset => {
      // Track missing assets by material
      if (!materialMissingCounts[asset.material]) {
        materialMissingCounts[asset.material] = 0;
      }
      materialMissingCounts[asset.material]++;

      // Track missing assets by frame number
      if (!frameMissingCounts[asset.frame]) {
        frameMissingCounts[asset.frame] = 0;
      }
      frameMissingCounts[asset.frame]++;
    });

    // Identify patterns
    Object.entries(materialMissingCounts).forEach(([material, count]) => {
      if (count === this.expectedFrameCount) {
        rootCauses.patternAnalysis.completelyMissingMaterials.push(material);
      } else if (count > 0) {
        rootCauses.patternAnalysis.partiallyMissingMaterials.push({material, missingCount: count});
      }
    });

    Object.entries(frameMissingCounts).forEach(([frame, count]) => {
      if (count === this.expectedMaterials.length) {
        rootCauses.patternAnalysis.consistentMissingFrames.push(parseInt(frame));
      }
    });

    // Generate potential root cause hypotheses
    if (rootCauses.patternAnalysis.completelyMissingMaterials.length > 0) {
      rootCauses.potentialCauses.push({
        type: 'MISSING_MATERIAL_DIRECTORIES',
        evidence: `${rootCauses.patternAnalysis.completelyMissingMaterials.length} materials completely missing`,
        materials: rootCauses.patternAnalysis.completelyMissingMaterials,
        likelihood: 'HIGH',
        resolution: 'Generate missing image sequences for these materials'
      });
    }

    if (rootCauses.patternAnalysis.consistentMissingFrames.length > 0) {
      rootCauses.potentialCauses.push({
        type: 'SYSTEMATIC_FRAME_GAPS',
        evidence: `Frames ${rootCauses.patternAnalysis.consistentMissingFrames.join(', ')} missing across all/most materials`,
        frames: rootCauses.patternAnalysis.consistentMissingFrames,
        likelihood: 'HIGH',
        resolution: 'Regenerate missing frame ranges for existing materials'
      });
    }

    if (rootCauses.patternAnalysis.partiallyMissingMaterials.length > 0) {
      rootCauses.potentialCauses.push({
        type: 'INCOMPLETE_SEQUENCES',
        evidence: `${rootCauses.patternAnalysis.partiallyMissingMaterials.length} materials have partial frame sets`,
        materials: rootCauses.patternAnalysis.partiallyMissingMaterials,
        likelihood: 'MEDIUM',
        resolution: 'Complete partial image sequences for affected materials'
      });
    }

    console.log(`📋 ROOT CAUSE ANALYSIS:`);
    rootCauses.potentialCauses.forEach((cause, index) => {
      console.log(`   ${index + 1}. ${cause.type} (${cause.likelihood} likelihood)`);
      console.log(`      Evidence: ${cause.evidence}`);
      console.log(`      Resolution: ${cause.resolution}`);
    });

    this.assetReport.findings.rootCauseAnalysis = rootCauses;
  }

  async generateReport() {
    console.log('\n📄 Generating Phase 2A Asset Validation Report...');
    
    const reportPath = './phase2a-asset-validation-report.json';
    await fs.writeFile(reportPath, JSON.stringify(this.assetReport, null, 2));
    console.log(`💾 Detailed report saved: ${reportPath}`);

    // Generate summary markdown
    const summaryPath = './phase2a-asset-validation-summary.md';
    const summary = this.generateSummaryMarkdown();
    await fs.writeFile(summaryPath, summary);
    console.log(`📋 Summary report saved: ${summaryPath}`);

    return this.assetReport;
  }

  generateSummaryMarkdown() {
    const report = this.assetReport;
    const totalMissing = report.findings.missingAssets.length;
    const totalExpected = this.expectedMaterials.length * this.expectedFrameCount;
    const completionRate = ((totalExpected - totalMissing) / totalExpected * 100).toFixed(1);

    return `# Phase 2A: Asset Validation Summary

**Asset Completeness**: ${completionRate}% (${totalExpected - totalMissing}/${totalExpected} assets)
**Missing Assets**: ${totalMissing} files
**Performance Impact**: ${report.findings.performanceImpact.estimatedPerformancePenalty}ms delay
**CLAUDE_RULES Impact**: ${report.findings.performanceImpact.claudeRulesImpact.contributionToOverallDelay}% contribution to material switch delays

## Material Status
${Object.entries(report.findings.materialCompleteness).map(([material, analysis]) => {
  const completion = ((this.expectedFrameCount - analysis.frameAnalysis.missingFrames.length) / this.expectedFrameCount * 100).toFixed(1);
  return `- **${material}**: ${completion}% complete (${analysis.frameAnalysis.missingFrames.length} missing)`;
}).join('\n')}

## Root Causes Identified
${report.findings.rootCauseAnalysis?.potentialCauses?.map((cause, i) => 
  `${i + 1}. **${cause.type}** (${cause.likelihood} likelihood)\n   - ${cause.evidence}\n   - Resolution: ${cause.resolution}`
).join('\n\n') || 'Analysis pending...'}

## Next Steps
1. Address identified root causes
2. Regenerate/create missing asset sequences  
3. Validate asset loading performance improvement
4. Proceed to Phase 2B: MongoDB bridge service analysis
`;
  }

  async cleanup() {
    console.log('\n✅ Phase 2A Asset Validation Complete');
  }
}

// Main execution
async function runAssetValidation() {
  const analyzer = new AssetValidationAnalyzer();
  
  try {
    if (await analyzer.validateDirectory()) {
      await analyzer.analyzeAssetCompleteness();
      await analyzer.analyzePerformanceImpact();
      await analyzer.identifyRootCauses();
      await analyzer.generateReport();
    }
  } catch (error) {
    console.error('❌ Asset Validation Failed:', error);
  } finally {
    await analyzer.cleanup();
  }
}

// Execute if run directly
if (require.main === module) {
  runAssetValidation().catch(console.error);
}

module.exports = { AssetValidationAnalyzer };