import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'

export interface GenerationRequest {
  modelIds: string[]
  materials?: string[]
  jobId: string
}

export interface GenerationStatus {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  startTime: string
  endTime?: string
  currentModel?: string
  currentMaterial?: string
  currentFrame?: number
  totalFrames?: number
  error?: string
  processedModels?: number
  totalModels?: number
}

export interface GenerationProgress {
  jobId: string
  modelId: string
  material: string
  frame: number
  totalFrames: number
  overallProgress: number
}

// In-memory job storage (in production, use Redis or database)
const generationJobs = new Map<string, GenerationStatus>()
const activeProcesses = new Map<string, any>() // Store active child processes for cancellation

// Progress callback type
export type ProgressCallback = (progress: GenerationProgress) => void

export class GenerationService {
  private static instance: GenerationService
  private progressCallbacks = new Map<string, ProgressCallback[]>()

  static getInstance(): GenerationService {
    if (!GenerationService.instance) {
      GenerationService.instance = new GenerationService()
    }
    return GenerationService.instance
  }

  async startGeneration(request: GenerationRequest): Promise<GenerationStatus> {
    const jobStatus: GenerationStatus = {
      id: request.jobId,
      status: 'pending',
      progress: 0,
      startTime: new Date().toISOString(),
      totalModels: request.modelIds.length,
      processedModels: 0
    }

    generationJobs.set(request.jobId, jobStatus)

    // Start generation process in background
    this.processGeneration(request).catch(error => {
      console.error('Generation error:', error)
      const job = generationJobs.get(request.jobId)
      if (job) {
        job.status = 'error'
        job.error = error.message
        job.endTime = new Date().toISOString()
        generationJobs.set(request.jobId, job)
      }
    })

    return jobStatus
  }

  async stopGeneration(jobId: string): Promise<boolean> {
    const job = generationJobs.get(jobId)
    if (!job) return false

    if (job.status === 'processing') {
      // Kill active child processes
      const activeProcess = activeProcesses.get(jobId)
      if (activeProcess) {
        try {
          activeProcess.kill('SIGTERM')
          activeProcesses.delete(jobId)
          console.log(`🛑 Killed generation process for job ${jobId}`)
        } catch (error) {
          console.error(`Failed to kill process for job ${jobId}:`, error)
        }
      }

      job.status = 'error'
      job.error = 'Cancelled by user'
      job.endTime = new Date().toISOString()
      generationJobs.set(jobId, job)
      
      // Emit cancellation status via WebSocket
      this.emitJobUpdate(jobId, job)
      
      return true
    }

    return false
  }

  getJob(jobId: string): GenerationStatus | undefined {
    return generationJobs.get(jobId)
  }

  getAllJobs(): GenerationStatus[] {
    return Array.from(generationJobs.values())
  }

  addProgressCallback(jobId: string, callback: ProgressCallback): void {
    if (!this.progressCallbacks.has(jobId)) {
      this.progressCallbacks.set(jobId, [])
    }
    this.progressCallbacks.get(jobId)!.push(callback)
  }

  removeProgressCallbacks(jobId: string): void {
    this.progressCallbacks.delete(jobId)
  }

  private async processGeneration(request: GenerationRequest): Promise<void> {
    const job = generationJobs.get(request.jobId)
    if (!job) return

    job.status = 'processing'
    generationJobs.set(request.jobId, job)
    
    // Emit initial status via WebSocket
    this.emitJobUpdate(request.jobId, job)

    try {
      const materials = request.materials || ['platinum', 'white-gold', 'yellow-gold', 'rose-gold']
      const totalSteps = request.modelIds.length * materials.length * 36 // 36 frames per sequence

      let currentStep = 0
      let processedModels = 0

      for (const modelId of request.modelIds) {
        job.currentModel = modelId
        
        // Check if GLB file exists
        const modelPath = path.join(process.cwd(), 'public/models', `${modelId}.glb`)
        if (!(await fs.access(modelPath).then(() => true).catch(() => false))) {
          console.warn(`Model file not found: ${modelPath}`)
          continue
        }

        for (const material of materials) {
          job.currentMaterial = material
          job.totalFrames = 36

          // Generate sequence for this model-material combination
          await this.generateModelMaterialSequence(modelId, material, request.jobId, (frame) => {
            job.currentFrame = frame
            job.progress = Math.round((currentStep / totalSteps) * 100)
            generationJobs.set(request.jobId, { ...job })

            // Emit real-time progress via WebSocket
            this.emitJobUpdate(request.jobId, job)

            // Notify progress callbacks
            const callbacks = this.progressCallbacks.get(request.jobId)
            if (callbacks) {
              const progress: GenerationProgress = {
                jobId: request.jobId,
                modelId,
                material,
                frame,
                totalFrames: 36,
                overallProgress: job.progress
              }
              callbacks.forEach(callback => callback(progress))
            }

            currentStep++
          })
        }

        processedModels++
        job.processedModels = processedModels
        generationJobs.set(request.jobId, { ...job })
        
        // Emit model completion
        this.emitJobUpdate(request.jobId, job)
      }

      // Complete the job
      job.status = 'completed'
      job.progress = 100
      job.endTime = new Date().toISOString()
      job.currentModel = undefined
      job.currentMaterial = undefined
      job.currentFrame = undefined
      generationJobs.set(request.jobId, job)
      
      // Emit final completion status
      this.emitJobUpdate(request.jobId, job)

    } catch (error) {
      job.status = 'error'
      job.error = error instanceof Error ? error.message : 'Unknown error'
      job.endTime = new Date().toISOString()
      generationJobs.set(request.jobId, job)
      
      // Emit error status
      this.emitJobUpdate(request.jobId, job)
      
      throw error
    }
  }

  private emitJobUpdate(jobId: string, job: GenerationStatus): void {
    // Access global Socket.IO instance (set by server.js)
    const io = (global as any).io
    if (io) {
      io.to(`job-${jobId}`).emit('job-progress', {
        jobId,
        status: job.status,
        progress: job.progress,
        currentModel: job.currentModel,
        currentMaterial: job.currentMaterial,
        currentFrame: job.currentFrame,
        totalFrames: job.totalFrames,
        processedModels: job.processedModels,
        totalModels: job.totalModels,
        error: job.error,
        startTime: job.startTime,
        endTime: job.endTime
      })
      console.log(`📡 Emitted job progress for ${jobId}: ${job.progress}%`)
    }
  }

  private async generateModelMaterialSequence(
    modelId: string, 
    material: string, 
    jobId: string,
    progressCallback: (frame: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Use Node.js spawn to run the single sequence generation script
      const scriptPath = path.join(process.cwd(), 'scripts', 'generate-single-sequence.js')
      
      const args = [
        scriptPath,
        '--model', modelId,
        '--material', material,
        '--job-id', jobId
      ]

      const child = spawn('node', args, {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      })

      // Store the process for potential cancellation
      activeProcesses.set(jobId, child)

      let currentFrame = 0

      child.stdout.on('data', (data) => {
        const output = data.toString()
        console.log(`Generation output: ${output}`)
        
        // Parse progress from script output
        const frameMatch = output.match(/Frame (\d+)\/(\d+)/)
        if (frameMatch) {
          currentFrame = parseInt(frameMatch[1])
          progressCallback(currentFrame - 1) // Convert to 0-based
        }
      })

      child.stderr.on('data', (data) => {
        console.error(`Generation error: ${data.toString()}`)
      })

      child.on('close', (code) => {
        // Clean up the process from active processes map
        activeProcesses.delete(jobId)
        
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Generation script exited with code ${code}`))
        }
      })

      child.on('error', (error) => {
        reject(error)
      })
    })
  }

  // Validate that required dependencies are available
  async validateDependencies(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    try {
      // Check if models directory exists
      const modelsDir = path.join(process.cwd(), 'public/models')
      await fs.access(modelsDir)
    } catch {
      errors.push('Models directory not found: public/models')
    }

    try {
      // Check if output directory exists or can be created
      const outputDir = path.join(process.cwd(), 'public/images/products/3d-sequences')
      await fs.mkdir(outputDir, { recursive: true })
    } catch {
      errors.push('Cannot create output directory: public/images/products/3d-sequences')
    }

    try {
      // Check if generation script exists
      const scriptPath = path.join(process.cwd(), 'scripts', 'generate-3d-sequences.js')
      await fs.access(scriptPath)
    } catch {
      errors.push('Generation script not found: scripts/generate-3d-sequences.js')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Get available models from file system
  async getAvailableModels(): Promise<Array<{
    id: string
    name: string
    fileName: string
    size: number
    lastModified: string
    hasSequences: boolean
  }>> {
    const modelsDir = path.join(process.cwd(), 'public/models')
    
    try {
      const files = await fs.readdir(modelsDir)
      const models = []
      
      for (const file of files) {
        if (file.endsWith('.glb')) {
          const filePath = path.join(modelsDir, file)
          const stats = await fs.stat(filePath)
          const modelId = file.replace('.glb', '')
          
          models.push({
            id: modelId,
            name: modelId.replace(/_/g, ' '),
            fileName: file,
            size: stats.size,
            lastModified: stats.mtime.toISOString(),
            hasSequences: await this.checkSequencesExist(modelId)
          })
        }
      }
      
      return models
    } catch (error) {
      console.error('Error reading models directory:', error)
      return []
    }
  }

  private async checkSequencesExist(modelId: string): Promise<boolean> {
    const sequencesDir = path.join(process.cwd(), 'public/images/products/3d-sequences')
    const materials = ['platinum', 'white-gold', 'yellow-gold', 'rose-gold']
    
    for (const material of materials) {
      const sequencePath = path.join(sequencesDir, `${modelId}-${material}`)
      try {
        await fs.access(sequencePath)
        return true
      } catch {
        // Continue checking other materials
      }
    }
    
    return false
  }
}