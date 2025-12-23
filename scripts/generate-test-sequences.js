#!/usr/bin/env node

/**
 * Test Sequence Generator
 * Creates placeholder PNG sequences for testing when actual 3D sequences are missing
 * Uses solid color gradients to simulate different materials and rotation frames
 */

const fs = require('fs').promises
const path = require('path')
const { createCanvas } = require('canvas')

const CONFIG = {
  frameCount: 36,
  imageSize: 800,
  outputDir: '/Users/decepticonmanager/Projects/GenZJewelry_AUG_12/Public/images/products/3d-sequences'
}

// Material color schemes
const MATERIALS = {
  'platinum': { base: '#E5E4E2', highlight: '#F8F8FF', shadow: '#C0C0C0' },
  '18k-white-gold': { base: '#F8F8FF', highlight: '#FFFFFF', shadow: '#E5E5E5' },
  '18k-yellow-gold': { base: '#FFD700', highlight: '#FFFF99', shadow: '#DAA520' },
  '18k-rose-gold': { base: '#E8B4B8', highlight: '#FFB6C1', shadow: '#CD919E' }
}

class TestSequenceGenerator {
  /**
   * Generate a single frame with gradient and rotation effect
   */
  generateFrame(frameIndex, material, totalFrames) {
    const canvas = createCanvas(CONFIG.imageSize, CONFIG.imageSize)
    const ctx = canvas.getContext('2d')
    
    // Calculate rotation angle
    const rotation = (frameIndex / totalFrames) * 2 * Math.PI
    
    // Clear canvas
    ctx.fillStyle = '#f5f5f5'
    ctx.fillRect(0, 0, CONFIG.imageSize, CONFIG.imageSize)
    
    // Center coordinates
    const centerX = CONFIG.imageSize / 2
    const centerY = CONFIG.imageSize / 2
    
    // Create ring shape with material colors
    const ringRadius = 150
    const ringWidth = 40
    
    // Outer ring (main material)
    ctx.beginPath()
    ctx.arc(centerX, centerY, ringRadius, 0, 2 * Math.PI)
    ctx.lineWidth = ringWidth
    
    // Create gradient based on rotation for 3D effect
    const gradient = ctx.createLinearGradient(
      centerX - ringRadius, centerY - ringRadius,
      centerX + ringRadius, centerY + ringRadius
    )
    
    const lightAngle = rotation + Math.PI / 4
    const lightIntensity = Math.sin(lightAngle) * 0.3 + 0.7
    
    gradient.addColorStop(0, this.adjustBrightness(material.shadow, lightIntensity - 0.2))
    gradient.addColorStop(0.3, this.adjustBrightness(material.base, lightIntensity))
    gradient.addColorStop(0.7, this.adjustBrightness(material.highlight, lightIntensity + 0.1))
    gradient.addColorStop(1, this.adjustBrightness(material.base, lightIntensity - 0.1))
    
    ctx.strokeStyle = gradient
    ctx.stroke()
    
    // Inner diamond/stone (simplified)
    ctx.beginPath()
    ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()
    ctx.strokeStyle = '#E0E0E0'
    ctx.lineWidth = 2
    ctx.stroke()
    
    // Add sparkle effect based on rotation
    for (let i = 0; i < 8; i++) {
      const sparkleAngle = (i / 8) * 2 * Math.PI + rotation
      const sparkleX = centerX + Math.cos(sparkleAngle) * (ringRadius - 10)
      const sparkleY = centerY + Math.sin(sparkleAngle) * (ringRadius - 10)
      
      const sparkleIntensity = Math.sin(sparkleAngle + rotation) * 0.5 + 0.5
      
      ctx.beginPath()
      ctx.arc(sparkleX, sparkleY, 3 * sparkleIntensity, 0, 2 * Math.PI)
      ctx.fillStyle = `rgba(255, 255, 255, ${sparkleIntensity})`
      ctx.fill()
    }
    
    // Add frame indicator
    ctx.fillStyle = '#666'
    ctx.font = '12px Arial'
    ctx.fillText(`Frame ${frameIndex + 1}/${totalFrames}`, 10, 20)
    
    return canvas.toBuffer('image/png')
  }
  
  /**
   * Adjust color brightness
   */
  adjustBrightness(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    
    const newR = Math.max(0, Math.min(255, Math.round(r * factor)))
    const newG = Math.max(0, Math.min(255, Math.round(g * factor)))
    const newB = Math.max(0, Math.min(255, Math.round(b * factor)))
    
    return `rgb(${newR}, ${newG}, ${newB})`
  }
  
  /**
   * Generate complete sequence for a model-material combination
   */
  async generateSequence(modelName, materialId) {
    const material = MATERIALS[materialId]
    if (!material) {
      throw new Error(`Unknown material: ${materialId}`)
    }
    
    const sequenceName = `${modelName}-${materialId}`
    const sequenceDir = path.join(CONFIG.outputDir, sequenceName)
    
    console.log(`🎨 Generating test sequence: ${sequenceName}`)
    
    // Create directory
    await fs.mkdir(sequenceDir, { recursive: true })
    
    // Generate frames
    for (let frameIndex = 0; frameIndex < CONFIG.frameCount; frameIndex++) {
      const frameBuffer = this.generateFrame(frameIndex, material, CONFIG.frameCount)
      const framePath = path.join(sequenceDir, `${frameIndex}.png`)
      await fs.writeFile(framePath, frameBuffer)
    }
    
    // Generate manifest
    const manifest = {
      model: modelName,
      material: materialId,
      materialProperties: material,
      frameCount: CONFIG.frameCount,
      rotationIncrement: 10,
      formats: ['png'],
      generatedAt: new Date().toISOString(),
      generator: 'test-sequence-generator v1.0',
      isTestData: true
    }
    
    const manifestPath = path.join(sequenceDir, 'manifest.json')
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
    
    console.log(`✅ Generated ${CONFIG.frameCount} frames for ${sequenceName}`)
  }
  
  /**
   * Generate all missing sequences
   */
  async generateMissingSequences() {
    // Read product variants to find what sequences we need
    const variantsPath = '/Users/decepticonmanager/Projects/GenZJewelry_AUG_12/src/data/product-variants.ts'
    const variantsContent = await fs.readFile(variantsPath, 'utf-8')
    
    // Extract sequence names from asset paths
    const assetPaths = variantsContent
      .match(/assetPath: '[^']+'/g)
      ?.map(match => match.replace("assetPath: '", '').replace("'", ''))
      || []
    
    const sequences = assetPaths.map(path => {
      const parts = path.split('/')
      return parts[parts.length - 1]
    })
    
    console.log(`Found ${sequences.length} sequences to check/generate`)
    
    for (const sequenceName of sequences) {
      const [modelName, materialId] = sequenceName.split('-')
      
      if (MATERIALS[materialId]) {
        const sequenceDir = path.join(CONFIG.outputDir, sequenceName)
        
        try {
          // Check if sequence already exists and is complete
          const files = await fs.readdir(sequenceDir)
          const pngFiles = files.filter(f => f.endsWith('.png'))
          
          if (pngFiles.length >= CONFIG.frameCount) {
            console.log(`⚡ Skipping ${sequenceName} (already complete)`)
            continue
          }
        } catch {
          // Directory doesn't exist, we need to generate
        }
        
        await this.generateSequence(modelName, materialId)
      }
    }
    
    console.log('🎉 All missing sequences generated')
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'missing'
  
  // Check if canvas is available
  try {
    require('canvas')
  } catch {
    console.error(`
❌ Canvas module not found

This generator requires the 'canvas' npm package for creating test images.
Install it with:

  npm install canvas

Or use the browser-based fallback by visiting:
  http://localhost:3000/scripts/generate-fallback-sequences
`)
    process.exit(1)
  }
  
  const generator = new TestSequenceGenerator()
  
  try {
    switch (command) {
      case 'missing':
        await generator.generateMissingSequences()
        break
        
      case 'sequence':
        const sequenceName = args[1]
        if (!sequenceName) {
          throw new Error('Sequence name required: node generate-test-sequences.js sequence <model-material>')
        }
        
        const [modelName, materialId] = sequenceName.split('-')
        await generator.generateSequence(modelName, materialId)
        break
        
      case 'help':
      default:
        console.log(`
🎨 Test Sequence Generator

Usage:
  node generate-test-sequences.js <command> [options]

Commands:
  missing                    Generate all missing sequences  
  sequence <model-material>  Generate specific sequence
  help                       Show this help message

Examples:
  node generate-test-sequences.js missing
  node generate-test-sequences.js sequence toy_car-platinum

Requirements:
  npm install canvas

Note: This generates placeholder sequences for testing.
For production-quality sequences, use the batch-sequence-generator.js with Blender.
`)
        break
    }
    
  } catch (error) {
    console.error(`💥 Generation failed: ${error.message}`)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { TestSequenceGenerator, CONFIG, MATERIALS }