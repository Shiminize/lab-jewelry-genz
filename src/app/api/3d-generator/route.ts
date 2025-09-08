/**
 * 3D Generator API Routes
 * RESTful API for managing 3D sequence generation with Enhanced Generation Service
 */

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { EnhancedGenerationService } from '@/lib/enhanced-generation-service'
import { ResourceOptimizer } from '@/lib/resource-optimizer'
import { getProductionConfig, ProductionLogger, CircuitBreaker } from '@/lib/production-config'

// Types - Enhanced for optimized asset structure
interface GenerationRequest {
  modelIds: string[]
  materials?: string[]
  assetStructure?: 'optimized' | 'legacy' // New optimized structure support
  outputFormats?: string[] // Multi-format support
  performance?: {
    targetSwitchTime?: number // CLAUDE_RULES <100ms requirement
    preloadStrategy?: 'intelligent' | 'aggressive' | 'lazy'
    compressionLevel?: 'low' | 'medium' | 'high'
  }
  settings?: {
    imageCount?: number
    imageSize?: { width: number; height: number }
    formats?: string[]
    quality?: {
      avif?: number
      webp?: number
      png?: number
    }
  }
}

interface GenerationStatus {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  currentModel?: string
  currentMaterial?: string
  currentFrame?: number
  totalFrames?: number
  startTime?: string
  estimatedCompletion?: string
  error?: string
}

// Production configuration and logging
const config = getProductionConfig()
const logger = new ProductionLogger(config)
const circuitBreaker = new CircuitBreaker(5, 60000) // 5 failures, 1 minute timeout

// In-memory store for generation status (use Redis in production)  
// Generation jobs are now handled by GenerationService

// GET: Get all models or generation status  
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const jobId = searchParams.get('jobId')
  
  logger.info('3D Generator API GET request', { action, jobId })

  try {
    return await circuitBreaker.execute(async () => {
      const startTime = Date.now()
      
      let result: NextResponse
      switch (action) {
        case 'models':
          result = await getAvailableModels()
          break
        
        case 'status':
          if (jobId) {
            result = await getGenerationStatus(jobId)
          } else {
            result = await getAllGenerationStatus()
          }
          break
        
        case 'sequences':
          result = await getExistingSequences()
          break
        
        default:
          logger.warn('Invalid action requested', { action })
          result = NextResponse.json({ error: 'Invalid action' }, { status: 400 })
      }
      
      const responseTime = Date.now() - startTime
      logger.info('3D Generator API response', { action, responseTime, status: result.status })
      
      // Check CLAUDE_RULES compliance (<300ms)
      if (responseTime > 300) {
        logger.warn('API response time exceeds CLAUDE_RULES target', { 
          action, 
          responseTime, 
          target: 300 
        })
      }
      
      return result
    })
  } catch (error) {
    logger.error('API Error in GET handler', { 
      action, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Start generation or upload models
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'generate':
        return startGeneration(body as GenerationRequest)
      
      case 'upload':
        return handleModelUpload(request)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Stop generation or delete models
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('jobId')
  const modelId = searchParams.get('modelId')

  try {
    if (jobId) {
      return stopGeneration(jobId)
    }
    
    if (modelId) {
      return deleteModel(modelId)
    }
    
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper Functions

async function getAvailableModels() {
  const { GenerationService } = await import('@/lib/generation-service')
  const service = GenerationService.getInstance()
  
  try {
    const models = await service.getAvailableModels()
    return NextResponse.json({ models })
  } catch (error) {
    console.error('Error getting available models:', error)
    return NextResponse.json({ models: [] })
  }
}

async function getExistingSequences() {
  // Updated to use optimized structure: /sequences/{model-id}/{material-id}/
  const sequencesDir = path.join(process.cwd(), 'public/images/products/sequences')
  
  if (!fs.existsSync(sequencesDir)) {
    return NextResponse.json({ sequences: [] })
  }

  const sequences = []
  const modelDirs = fs.readdirSync(sequencesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())

  for (const modelDir of modelDirs) {
    const modelPath = path.join(sequencesDir, modelDir.name)
    const materialDirs = fs.readdirSync(modelPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())

    for (const materialDir of materialDirs) {
      const sequencePath = path.join(modelPath, materialDir.name)
      
      if (!fs.existsSync(sequencePath)) continue
      
      const files = fs.readdirSync(sequencePath)
      
      // Count frames and formats
      const frames = new Set()
      const formats = new Set()
      let totalSize = 0

      files.forEach(file => {
        const [frame, format] = file.split('.')
        if (frame && format && !isNaN(parseInt(frame))) {
          frames.add(parseInt(frame))
          formats.add(format)
          
          const filePath = path.join(sequencePath, file)
          totalSize += fs.statSync(filePath).size
        }
      })

      sequences.push({
        id: `${modelDir.name}-${materialDir.name}`,
        modelId: modelDir.name,
        materialId: materialDir.name,
        frameCount: frames.size,
        formats: Array.from(formats),
        totalSize,
        lastModified: fs.statSync(sequencePath).mtime.toISOString(),
        path: `/images/products/sequences/${modelDir.name}/${materialDir.name}/` // New optimized path
      })
    }
  }

  return NextResponse.json({ sequences })
}

async function startGeneration(request: GenerationRequest) {
  const service = EnhancedGenerationService.getInstance()
  const optimizer = ResourceOptimizer.getInstance()
  optimizer.initialize()
  
  logger.info('Starting 3D generation', { 
    modelCount: request.modelIds?.length || 0,
    materials: request.materials?.length || 0
  })
  
  // Check production config limits
  const currentJobs = service.getMetrics().activeJobs
  if (currentJobs >= config.generation.maxConcurrentJobs) {
    logger.warn('Generation rejected: too many concurrent jobs', { 
      currentJobs, 
      limit: config.generation.maxConcurrentJobs 
    })
    return NextResponse.json({
      error: 'Too many concurrent generation jobs. Please try again later.',
      details: {
        currentJobs,
        maxAllowed: config.generation.maxConcurrentJobs
      }
    }, { status: 429 })
  }
  
  // Pre-generation system optimization
  await optimizer.optimizeForGeneration()
  
  // Check system health with production config thresholds
  const metrics = await optimizer.updateMetrics()
  const memoryUsageMB = metrics.memory.used
  const maxMemoryMB = config.resources.maxMemoryMB
  
  if (memoryUsageMB > maxMemoryMB * 0.9) { // 90% threshold
    logger.warn('Generation rejected: memory usage too high', { 
      memoryUsageMB, 
      maxMemoryMB,
      percentage: (memoryUsageMB / maxMemoryMB) * 100
    })
    return NextResponse.json({
      error: 'System memory usage is too high. Please try again later.',
      details: {
        memoryUsage: `${memoryUsageMB}MB / ${maxMemoryMB}MB`,
        threshold: '90%'
      }
    }, { status: 503 })
  }
  
  if (optimizer.getMemoryPressure() === 'critical' || optimizer.getDiskPressure() === 'critical') {
    logger.warn('Generation rejected: critical resource pressure', {
      memoryPressure: optimizer.getMemoryPressure(),
      diskPressure: optimizer.getDiskPressure()
    })
    return NextResponse.json({
      error: 'System resources are critically low. Please try again later.',
      details: {
        memoryPressure: optimizer.getMemoryPressure(),
        diskPressure: optimizer.getDiskPressure()
      }
    }, { status: 503 })
  }
  
  const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  try {
    const jobStatus = await service.startGeneration({
      ...request,
      jobId,
      // Apply production config settings
      settings: {
        ...request.settings,
        timeout: config.generation.timeoutMinutes * 60 * 1000, // Convert to milliseconds
        retryAttempts: config.generation.retryAttempts,
        retryDelay: config.generation.retryDelaySeconds * 1000
      }
    })
    
    logger.info('3D generation started successfully', { jobId, modelCount: request.modelIds.length })
    
    return NextResponse.json({ jobId, status: jobStatus })
  } catch (error) {
    logger.error('Failed to start generation', { 
      jobId,
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    return NextResponse.json({
      error: 'Failed to start generation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function processGeneration(jobId: string, request: GenerationRequest) {
  // This function is now handled by the GenerationService
  // The actual processing is done in the service class
  // This function can be removed or kept for backward compatibility

}

async function getGenerationStatus(jobId: string) {
  const service = EnhancedGenerationService.getInstance()
  
  const job = service.getJob(jobId)
  
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  return NextResponse.json({ status: job })
}

async function getAllGenerationStatus() {
  const service = EnhancedGenerationService.getInstance()
  
  const jobs = service.getAllJobs()
  const metrics = service.getMetrics()
  return NextResponse.json({ 
    jobs, 
    metrics: {
      totalJobs: metrics.totalJobs,
      activeJobs: metrics.activeJobs,
      queueSize: metrics.queueSize,
      completedJobs: metrics.completedJobs,
      failedJobs: metrics.failedJobs
    }
  })
}

async function stopGeneration(jobId: string) {
  const service = EnhancedGenerationService.getInstance()
  
  const stopped = await service.stopGeneration(jobId)
  
  if (!stopped) {
    return NextResponse.json({ error: 'Job not found or cannot be stopped' }, { status: 404 })
  }

  const job = service.getJob(jobId)
  return NextResponse.json({ message: 'Generation stopped', status: job })
}

async function deleteModel(modelId: string) {
  const modelPath = path.join(process.cwd(), 'public/models', `${modelId}.glb`)
  
  if (!fs.existsSync(modelPath)) {
    return NextResponse.json({ error: 'Model not found' }, { status: 404 })
  }

  try {
    fs.unlinkSync(modelPath)
    
    // Also remove associated sequences using optimized structure
    const sequencesDir = path.join(process.cwd(), 'public/images/products/sequences')
    const modelSequencePath = path.join(sequencesDir, modelId)
    
    if (fs.existsSync(modelSequencePath)) {
      // Remove entire model directory (contains all materials)
      fs.rmSync(modelSequencePath, { recursive: true, force: true })
    }

    return NextResponse.json({ message: 'Model deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete model' },
      { status: 500 }
    )
  }
}

async function handleModelUpload(request: NextRequest) {
  try {
    const uploadAction = request.headers.get('X-Upload-Action')
    
    if (uploadAction === 'upload-model') {
      const formData = await request.formData()
      const file = formData.get('model') as File
      
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      // Validate file type
      if (!file.name.endsWith('.glb')) {
        return NextResponse.json({ error: 'Only GLB files are supported' }, { status: 400 })
      }

      // Validate file size (50MB limit)
      const maxSize = 50 * 1024 * 1024
      if (file.size > maxSize) {
        return NextResponse.json({ error: 'File size must be less than 50MB' }, { status: 400 })
      }

      // Create models directory if it doesn't exist
      const modelsDir = path.join(process.cwd(), 'public/models')
      if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir, { recursive: true })
      }

      // Save file
      const fileName = file.name
      const filePath = path.join(modelsDir, fileName)
      
      // Check if file already exists
      if (fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'File already exists' }, { status: 409 })
      }

      // Write file to disk
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      fs.writeFileSync(filePath, buffer)

      return NextResponse.json({ 
        message: 'File uploaded successfully',
        fileName,
        size: file.size 
      })
    }

    return NextResponse.json({ error: 'Invalid upload action' }, { status: 400 })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function checkSequencesExist(modelId: string): boolean {
  // Updated to use optimized structure: /sequences/{model-id}/{material-id}/
  const sequencesDir = path.join(process.cwd(), 'public/images/products/sequences')
  const modelSequencePath = path.join(sequencesDir, modelId)
  
  if (!fs.existsSync(modelSequencePath)) {
    return false
  }
  
  // Check if any material directories exist with sequences
  const materials = ['platinum', '18k-white-gold', '18k-yellow-gold', '18k-rose-gold']
  
  return materials.some(material => {
    const materialPath = path.join(modelSequencePath, material)
    if (!fs.existsSync(materialPath)) return false
    
    // Check if directory has image files
    const files = fs.readdirSync(materialPath)
    return files.some(file => /\.(webp|avif|png|jpg|jpeg)$/i.test(file))
  })
}