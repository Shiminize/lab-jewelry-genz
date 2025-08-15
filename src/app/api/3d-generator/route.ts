/**
 * 3D Generator API Routes
 * RESTful API for managing 3D sequence generation with Enhanced Generation Service
 */

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { EnhancedGenerationService } from '@/lib/enhanced-generation-service'
import { ResourceOptimizer } from '@/lib/resource-optimizer'

// Types
interface GenerationRequest {
  modelIds: string[]
  materials?: string[]
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

// In-memory store for generation status (use Redis in production)
// Generation jobs are now handled by GenerationService

// GET: Get all models or generation status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const jobId = searchParams.get('jobId')

  try {
    switch (action) {
      case 'models':
        return getAvailableModels()
      
      case 'status':
        if (jobId) {
          return getGenerationStatus(jobId)
        }
        return getAllGenerationStatus()
      
      case 'sequences':
        return getExistingSequences()
      
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
  const sequencesDir = path.join(process.cwd(), 'public/images/products/3d-sequences')
  
  if (!fs.existsSync(sequencesDir)) {
    return NextResponse.json({ sequences: [] })
  }

  const sequences = []
  const dirs = fs.readdirSync(sequencesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())

  for (const dir of dirs) {
    const sequencePath = path.join(sequencesDir, dir.name)
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
      id: dir.name,
      frameCount: frames.size,
      formats: Array.from(formats),
      totalSize,
      lastModified: fs.statSync(sequencePath).mtime.toISOString()
    })
  }

  return NextResponse.json({ sequences })
}

async function startGeneration(request: GenerationRequest) {
  const service = EnhancedGenerationService.getInstance()
  const optimizer = new ResourceOptimizer()
  
  // Pre-generation system optimization
  await optimizer.optimizeForGeneration()
  
  // Check system health before starting generation
  const metrics = await optimizer.updateMetrics()
  if (optimizer.getMemoryPressure() === 'critical' || optimizer.getDiskPressure() === 'critical') {
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
      jobId
    })
    
    return NextResponse.json({ jobId, status: jobStatus })
  } catch (error) {
    console.error('Failed to start generation:', error)
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
  console.log(`Processing generation job ${jobId} is now handled by GenerationService`)
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
    
    // Also remove associated sequences
    const sequencesDir = path.join(process.cwd(), 'public/images/products/3d-sequences')
    const materials = ['platinum', 'white-gold', 'yellow-gold', 'rose-gold']
    
    materials.forEach(material => {
      const sequencePath = path.join(sequencesDir, `${modelId}-${material}`)
      if (fs.existsSync(sequencePath)) {
        fs.rmSync(sequencePath, { recursive: true, force: true })
      }
    })

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
  const sequencesDir = path.join(process.cwd(), 'public/images/products/3d-sequences')
  const materials = ['platinum', 'white-gold', 'yellow-gold', 'rose-gold']
  
  return materials.some(material => {
    const sequencePath = path.join(sequencesDir, `${modelId}-${material}`)
    return fs.existsSync(sequencePath)
  })
}