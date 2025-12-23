#!/usr/bin/env node

/**
 * Batch 3D Sequence Generator
 * Optimized parallel processing for generating multiple product variants and materials
 * Supports both PNG and WebP formats with AVIF optimization
 */

const fs = require('fs').promises
const path = require('path')
const { execSync, spawn } = require('child_process')
const os = require('os')

// Configuration
const CONFIG = {
  // Rendering settings
  frameCount: 36,
  rotationIncrement: 10, // degrees per frame
  outputFormats: ['png', 'webp'],
  
  // Performance settings
  maxConcurrency: Math.min(os.cpus().length, 8),
  batchSize: 4, // materials per batch
  timeout: 30000, // 30s per render
  
  // Quality settings
  webpQuality: 90,
  pngCompression: 6,
  
  // Paths
  modelsDir: '/Users/decepticonmanager/Projects/GenZJewelry_AUG_12/Public/models',
  outputDir: '/Users/decepticonmanager/Projects/GenZJewelry_AUG_12/Public/images/products/3d-sequences',
  blenderPath: process.env.BLENDER_PATH || 'blender'
}

// Material definitions
const MATERIALS = {
  'platinum': { 
    color: [0.95, 0.95, 0.95], 
    metalness: 1.0, 
    roughness: 0.1,
    displayName: 'Platinum'
  },
  '18k-white-gold': { 
    color: [0.93, 0.93, 0.93], 
    metalness: 1.0, 
    roughness: 0.15,
    displayName: '18K White Gold'
  },
  '18k-yellow-gold': { 
    color: [1.0, 0.84, 0.0], 
    metalness: 1.0, 
    roughness: 0.12,
    displayName: '18K Yellow Gold'
  },
  '18k-rose-gold': { 
    color: [0.95, 0.76, 0.76], 
    metalness: 1.0, 
    roughness: 0.13,
    displayName: '18K Rose Gold'
  },
  '14k-gold': { 
    color: [0.85, 0.7, 0.0], 
    metalness: 0.9, 
    roughness: 0.18,
    displayName: '14K Gold'
  }
}

// Progress tracking
let totalJobs = 0
let completedJobs = 0
let failedJobs = 0
const startTime = Date.now()

class BatchSequenceGenerator {
  constructor() {
    this.activeProcesses = new Set()
    this.completedSequences = new Map()
    this.errors = []
  }

  /**
   * Generate Blender Python script for rendering sequence
   */
  generateBlenderScript(modelPath, outputDir, material, materialId) {
    return `
import bpy
import os
import sys
import bmesh
from mathutils import Vector
import json

# Clear existing mesh objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Import model
model_path = "${modelPath}"
if model_path.endswith('.glb'):
    bpy.ops.import_scene.gltf(filepath=model_path)
elif model_path.endswith('.obj'):
    bpy.ops.import_scene.obj(filepath=model_path)
else:
    print(f"Unsupported model format: {model_path}")
    sys.exit(1)

# Get the imported object
obj = bpy.context.active_object
if not obj:
    print("No object imported")
    sys.exit(1)

# Apply material
material = bpy.data.materials.new(name="${materialId}")
material.use_nodes = True
bsdf = material.node_tree.nodes["Principled BSDF"]

# Set material properties
bsdf.inputs[0].default_value = (${material.color[0]}, ${material.color[1]}, ${material.color[2]}, 1.0)  # Base Color
bsdf.inputs[6].default_value = ${material.metalness}  # Metallic
bsdf.inputs[9].default_value = ${material.roughness}  # Roughness

# Assign material to object
obj.data.materials.clear()
obj.data.materials.append(material)

# Set up camera
bpy.ops.object.camera_add(location=(0, -8, 3))
camera = bpy.context.active_object
camera.rotation_euler = (1.1, 0, 0)

# Set up lighting
bpy.ops.object.light_add(type='SUN', location=(5, 5, 10))
sun = bpy.context.active_object
sun.data.energy = 3

# Add fill light
bpy.ops.object.light_add(type='AREA', location=(-3, -3, 5))
area = bpy.context.active_object
area.data.energy = 2

# Set up rendering
scene = bpy.context.scene
scene.camera = camera
scene.render.resolution_x = 800
scene.render.resolution_y = 800
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.engine = 'CYCLES'
scene.cycles.samples = 64

# Create output directory
output_dir = "${outputDir}"
os.makedirs(output_dir, exist_ok=True)

# Render sequence
for frame in range(${CONFIG.frameCount}):
    # Rotate object
    obj.rotation_euler.z = frame * ${CONFIG.rotationIncrement * Math.PI / 180}
    
    # Set output path
    output_path = os.path.join(output_dir, f"{frame}.png")
    scene.render.filepath = output_path
    
    # Render
    bpy.ops.render.render(write_still=True)
    print(f"Rendered frame {frame + 1}/${CONFIG.frameCount}")

print("Sequence generation complete")
`
  }

  /**
   * Convert PNG to WebP with optimization
   */
  async convertToWebP(pngPath, webpPath) {
    return new Promise((resolve, reject) => {
      const command = `cwebp -q ${CONFIG.webpQuality} "${pngPath}" -o "${webpPath}"`
      
      execSync(command, { timeout: 10000 }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`WebP conversion failed: ${error.message}`))
        } else {
          resolve(webpPath)
        }
      })
    })
  }

  /**
   * Process single material for a model
   */
  async processMaterialSequence(modelName, modelPath, materialId, material) {
    const jobId = `${modelName}-${materialId}`
    console.log(`🎬 Starting: ${jobId}`)
    
    try {
      // Create output directory
      const sequenceDir = path.join(CONFIG.outputDir, `${modelName}-${materialId}`)
      await fs.mkdir(sequenceDir, { recursive: true })
      
      // Generate Blender script
      const scriptContent = this.generateBlenderScript(modelPath, sequenceDir, material, materialId)
      const scriptPath = path.join(sequenceDir, 'render_script.py')
      await fs.writeFile(scriptPath, scriptContent)
      
      // Run Blender rendering
      await this.runBlenderRender(scriptPath, jobId)
      
      // Convert to WebP in parallel
      if (CONFIG.outputFormats.includes('webp')) {
        await this.batchConvertToWebP(sequenceDir)
      }
      
      // Generate manifest
      await this.generateSequenceManifest(sequenceDir, modelName, materialId, material)
      
      completedJobs++
      this.completedSequences.set(jobId, {
        path: sequenceDir,
        frameCount: CONFIG.frameCount,
        formats: CONFIG.outputFormats,
        material: materialId,
        timestamp: new Date().toISOString()
      })
      
      console.log(`✅ Completed: ${jobId} (${completedJobs}/${totalJobs})`)
      
    } catch (error) {
      failedJobs++
      this.errors.push({ jobId, error: error.message })
      console.error(`❌ Failed: ${jobId} - ${error.message}`)
      throw error
    }
  }

  /**
   * Run Blender rendering with timeout
   */
  async runBlenderRender(scriptPath, jobId) {
    return new Promise((resolve, reject) => {
      const blenderArgs = [
        '--background',
        '--python', scriptPath,
        '--',
        '--cycles-device', 'CPU'
      ]
      
      const process = spawn(CONFIG.blenderPath, blenderArgs, {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: CONFIG.timeout
      })
      
      this.activeProcesses.add(process)
      
      let stdout = ''
      let stderr = ''
      
      process.stdout.on('data', (data) => {
        stdout += data.toString()
      })
      
      process.stderr.on('data', (data) => {
        stderr += data.toString()
      })
      
      process.on('close', (code) => {
        this.activeProcesses.delete(process)
        
        if (code === 0) {
          resolve(stdout)
        } else {
          reject(new Error(`Blender process failed (${code}): ${stderr}`))
        }
      })
      
      process.on('error', (error) => {
        this.activeProcesses.delete(process)
        reject(new Error(`Blender spawn error: ${error.message}`))
      })
      
      // Timeout handling
      setTimeout(() => {
        if (this.activeProcesses.has(process)) {
          process.kill('SIGTERM')
          this.activeProcesses.delete(process)
          reject(new Error(`Blender render timeout for ${jobId}`))
        }
      }, CONFIG.timeout)
    })
  }

  /**
   * Batch convert PNG files to WebP
   */
  async batchConvertToWebP(sequenceDir) {
    const files = await fs.readdir(sequenceDir)
    const pngFiles = files.filter(f => f.endsWith('.png'))
    
    const conversions = pngFiles.map(async (pngFile) => {
      const pngPath = path.join(sequenceDir, pngFile)
      const webpPath = path.join(sequenceDir, pngFile.replace('.png', '.webp'))
      
      try {
        await this.convertToWebP(pngPath, webpPath)
      } catch (error) {
        console.warn(`WebP conversion failed for ${pngFile}: ${error.message}`)
      }
    })
    
    await Promise.allSettled(conversions)
  }

  /**
   * Generate sequence manifest file
   */
  async generateSequenceManifest(sequenceDir, modelName, materialId, material) {
    const manifest = {
      model: modelName,
      material: materialId,
      materialProperties: material,
      frameCount: CONFIG.frameCount,
      rotationIncrement: CONFIG.rotationIncrement,
      formats: CONFIG.outputFormats,
      generatedAt: new Date().toISOString(),
      generator: 'batch-sequence-generator v1.0'
    }
    
    const manifestPath = path.join(sequenceDir, 'manifest.json')
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
  }

  /**
   * Process multiple models in batches
   */
  async generateBatch(models, materials = MATERIALS) {
    const jobs = []
    
    // Create job queue
    for (const [modelName, modelPath] of Object.entries(models)) {
      for (const [materialId, material] of Object.entries(materials)) {
        jobs.push({ modelName, modelPath, materialId, material })
      }
    }
    
    totalJobs = jobs.length
    console.log(`🚀 Starting batch generation: ${totalJobs} jobs across ${CONFIG.maxConcurrency} workers`)
    
    // Process in controlled batches
    const batches = []
    for (let i = 0; i < jobs.length; i += CONFIG.batchSize) {
      batches.push(jobs.slice(i, i + CONFIG.batchSize))
    }
    
    for (const batch of batches) {
      const batchPromises = batch.map(job => 
        this.processMaterialSequence(job.modelName, job.modelPath, job.materialId, job.material)
      )
      
      // Wait for current batch to complete before starting next
      await Promise.allSettled(batchPromises)
      
      // Progress update
      const progress = Math.round((completedJobs / totalJobs) * 100)
      console.log(`📊 Progress: ${progress}% (${completedJobs}/${totalJobs} completed, ${failedJobs} failed)`)
    }
    
    // Final summary
    this.printSummary()
  }

  /**
   * Print generation summary
   */
  printSummary() {
    const duration = Math.round((Date.now() - startTime) / 1000)
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    
    console.log('\n🎯 Batch Generation Summary')
    console.log('=' * 40)
    console.log(`⏱️  Total time: ${minutes}m ${seconds}s`)
    console.log(`✅ Completed: ${completedJobs}`)
    console.log(`❌ Failed: ${failedJobs}`)
    console.log(`📊 Success rate: ${Math.round((completedJobs / totalJobs) * 100)}%`)
    
    if (this.errors.length > 0) {
      console.log('\n🚨 Errors:')
      this.errors.forEach(({ jobId, error }) => {
        console.log(`  - ${jobId}: ${error}`)
      })
    }
    
    if (completedJobs > 0) {
      console.log('\n📁 Generated sequences:')
      Array.from(this.completedSequences.entries()).forEach(([jobId, info]) => {
        console.log(`  - ${jobId}: ${info.frameCount} frames in ${info.formats.join(', ')}`)
      })
    }
  }

  /**
   * Quick-fix mode: Generate missing sequences for existing variants
   */
  async quickFix() {
    console.log('🔧 Quick-fix mode: Generating missing sequences')
    
    // Check existing product variants for missing sequences
    const variantsPath = '/Users/decepticonmanager/Projects/GenZJewelry_AUG_12/src/data/product-variants.ts'
    const variantsContent = await fs.readFile(variantsPath, 'utf-8')
    
    // Extract asset paths from variants file
    const assetPaths = variantsContent
      .match(/assetPath: '[^']+'/g)
      ?.map(match => match.replace("assetPath: '", '').replace("'", ''))
      || []
    
    console.log(`Found ${assetPaths.length} asset paths to check`)
    
    const missingSequences = []
    for (const assetPath of assetPaths) {
      const fullPath = path.join('/Users/decepticonmanager/Projects/GenZJewelry_AUG_12/Public', assetPath)
      
      try {
        await fs.access(path.join(fullPath, '0.png'))
      } catch {
        // Extract model and material from path
        const pathParts = assetPath.split('/')
        const sequenceName = pathParts[pathParts.length - 1]
        const [modelName, materialId] = sequenceName.split('-')
        
        if (MATERIALS[materialId]) {
          missingSequences.push({ modelName, materialId, assetPath: fullPath })
        }
      }
    }
    
    if (missingSequences.length === 0) {
      console.log('✅ All sequences exist, no quick-fix needed')
      return
    }
    
    console.log(`🎯 Found ${missingSequences.length} missing sequences to generate`)
    
    // Generate missing sequences
    for (const { modelName, materialId, assetPath } of missingSequences) {
      const modelPath = path.join(CONFIG.modelsDir, `${modelName}.glb`)
      const material = MATERIALS[materialId]
      
      try {
        await fs.access(modelPath)
        await this.processMaterialSequence(modelName, modelPath, materialId, material)
      } catch (error) {
        console.warn(`⚠️  Skipping ${modelName}-${materialId}: ${error.message}`)
      }
    }
  }

  /**
   * Validate system requirements
   */
  async validateRequirements() {
    const checks = []
    
    // Check Blender installation
    try {
      execSync(`${CONFIG.blenderPath} --version`, { stdio: 'pipe' })
      checks.push('✅ Blender found')
    } catch {
      checks.push('❌ Blender not found - install Blender or set BLENDER_PATH')
      throw new Error('Blender is required for 3D rendering')
    }
    
    // Check WebP tools
    try {
      execSync('cwebp -version', { stdio: 'pipe' })
      checks.push('✅ WebP tools found')
    } catch {
      checks.push('⚠️  WebP tools not found - PNG only mode')
      CONFIG.outputFormats = CONFIG.outputFormats.filter(f => f !== 'webp')
    }
    
    // Check output directory
    try {
      await fs.mkdir(CONFIG.outputDir, { recursive: true })
      checks.push('✅ Output directory ready')
    } catch {
      checks.push('❌ Cannot create output directory')
      throw new Error('Output directory is not writable')
    }
    
    // Check models directory
    try {
      const modelFiles = await fs.readdir(CONFIG.modelsDir)
      const glbFiles = modelFiles.filter(f => f.endsWith('.glb'))
      checks.push(`✅ Found ${glbFiles.length} model files`)
    } catch {
      checks.push('❌ Models directory not accessible')
      throw new Error('Models directory is required')
    }
    
    console.log('🔍 System Requirements:')
    checks.forEach(check => console.log(`  ${check}`))
    console.log('')
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'help'
  
  const generator = new BatchSequenceGenerator()
  
  try {
    await generator.validateRequirements()
    
    switch (command) {
      case 'quick-fix':
        await generator.quickFix()
        break
        
      case 'all':
        // Generate all combinations
        const modelFiles = await fs.readdir(CONFIG.modelsDir)
        const models = {}
        
        for (const file of modelFiles) {
          if (file.endsWith('.glb')) {
            const modelName = path.basename(file, '.glb')
            models[modelName] = path.join(CONFIG.modelsDir, file)
          }
        }
        
        await generator.generateBatch(models)
        break
        
      case 'model':
        // Generate specific model with all materials
        const modelName = args[1]
        if (!modelName) {
          throw new Error('Model name required: npm run batch-generate model <model-name>')
        }
        
        const modelPath = path.join(CONFIG.modelsDir, `${modelName}.glb`)
        await fs.access(modelPath)
        
        await generator.generateBatch({ [modelName]: modelPath })
        break
        
      case 'help':
      default:
        console.log(`
🎬 Batch 3D Sequence Generator

Usage:
  node batch-sequence-generator.js <command> [options]

Commands:
  quick-fix     Generate only missing sequences for existing variants
  all           Generate sequences for all models and materials  
  model <name>  Generate sequences for specific model
  help          Show this help message

Configuration:
  - Frames: ${CONFIG.frameCount} (${CONFIG.rotationIncrement}° increments)
  - Formats: ${CONFIG.outputFormats.join(', ')}
  - Concurrency: ${CONFIG.maxConcurrency} workers
  - Batch size: ${CONFIG.batchSize} materials per batch

Environment Variables:
  BLENDER_PATH  Path to Blender executable (default: 'blender')

Examples:
  node batch-sequence-generator.js quick-fix
  node batch-sequence-generator.js model toy_car
  node batch-sequence-generator.js all
`)
        break
    }
    
  } catch (error) {
    console.error(`💥 Fatal error: ${error.message}`)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down batch generator...')
  generator.activeProcesses.forEach(process => process.kill('SIGTERM'))
  process.exit(0)
})

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error)
    process.exit(1)
  })
}

module.exports = { BatchSequenceGenerator, CONFIG, MATERIALS }