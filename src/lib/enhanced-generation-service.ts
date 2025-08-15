/**
 * Enhanced Generation Service
 * Production-ready service with resilience, monitoring, and optimization
 */

import { spawn, ChildProcess } from 'child_process'
import { promises as fs, existsSync } from 'fs'
import path from 'path'
import { getProductionConfig, ResourceMonitor, ProductionLogger, CircuitBreaker } from './production-config'
import { GenerationRequest, GenerationStatus, GenerationProgress, ProgressCallback } from './generation-service'
import { JobPersistenceManager, RecoveryOptions } from './job-persistence'

// Enhanced job interface with retry and persistence
interface EnhancedGenerationStatus extends GenerationStatus {
  retryCount: number
  maxRetries: number
  lastRetryAt?: string
  failureHistory: Array<{ timestamp: string; error: string }>
  resourceUsage?: {
    memoryMB: number
    cpuPercent: number
    diskUsageMB: number
  }
  estimatedTimeRemaining?: number
  priority: number
  dependencies?: string[]
  metadata?: Record<string, any>
  // Store original request data to fix the hardcoded fallback issue
  originalRequest?: {
    modelIds: string[]
    materials: string[]
    settings?: any
  }
}

// Job persistence interface
interface PersistedJob {
  job: EnhancedGenerationStatus
  checkpoints: Array<{
    timestamp: string
    progress: number
    completedModels: string[]
    currentModel?: string
    currentMaterial?: string
  }>
}

export class EnhancedGenerationService {
  private static instance: EnhancedGenerationService
  private config = getProductionConfig()
  private monitor = new ResourceMonitor(this.config)
  private logger = new ProductionLogger(this.config)
  private circuitBreaker = new CircuitBreaker(5, 60000) // 5 failures, 1 minute timeout
  private persistenceManager = new JobPersistenceManager()
  
  private jobs = new Map<string, EnhancedGenerationStatus>()
  private activeProcesses = new Map<string, ChildProcess>()
  private progressCallbacks = new Map<string, ProgressCallback[]>()
  private jobQueue: string[] = []
  private isProcessingQueue = false
  
  // Performance tracking
  private metrics = {
    totalJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    averageCompletionTime: 0,
    totalProcessingTime: 0,
    retryCount: 0,
    lastHealthCheck: Date.now()
  }
  
  static getInstance(): EnhancedGenerationService {
    if (!EnhancedGenerationService.instance) {
      EnhancedGenerationService.instance = new EnhancedGenerationService()
    }
    return EnhancedGenerationService.instance
  }
  
  private constructor() {
    this.setupHealthChecks()
    this.setupCleanupTasks()
    this.setupJobPersistence()
    this.recoverInterruptedJobs()
  }
  
  private setupHealthChecks(): void {
    setInterval(async () => {
      try {
        await this.performHealthCheck()
      } catch (error) {
        this.logger.error('Health check failed', { error: error instanceof Error ? error.message : error })
      }
    }, this.config.monitoring.healthCheckInterval)
  }
  
  private setupCleanupTasks(): void {
    setInterval(async () => {
      try {
        await this.cleanupOldJobs()
        await this.cleanupTempFiles()
      } catch (error) {
        this.logger.error('Cleanup task failed', { error: error instanceof Error ? error.message : error })
      }
    }, this.config.generation.cleanupIntervalMinutes * 60 * 1000)
  }
  
  private setupJobPersistence(): void {
    // Setup periodic job state persistence
    setInterval(async () => {
      await this.persistJobStates()
    }, 30000) // Every 30 seconds
  }

  private async recoverInterruptedJobs(): Promise<void> {
    try {
      const recoverableJobs = await this.persistenceManager.getAllRecoverableJobs()
      this.logger.info('Found recoverable jobs on startup', { count: recoverableJobs.length })

      for (const { jobId, job, canRecover } of recoverableJobs) {
        if (canRecover && job.status === 'processing') {
          // Recover interrupted processing jobs
          job.status = 'pending'
          job.error = undefined
          this.jobs.set(jobId, job)
          this.jobQueue.push(jobId)
          
          this.logger.info('Recovered interrupted job', { jobId, progress: job.progress })
        } else if (job.status === 'error' && job.retryCount < job.maxRetries) {
          // Recover failed jobs that can be retried
          job.status = 'pending'
          job.error = undefined
          job.retryCount++
          job.lastRetryAt = new Date().toISOString()
          this.jobs.set(jobId, job)
          this.jobQueue.push(jobId)
          
          this.logger.info('Recovered failed job for retry', { jobId, retryCount: job.retryCount })
        }
      }

      if (recoverableJobs.length > 0) {
        this.logger.info('Job recovery completed', { 
          recovered: this.jobQueue.length,
          total: recoverableJobs.length 
        })
      }
    } catch (error) {
      this.logger.error('Failed to recover interrupted jobs', { error: error instanceof Error ? error.message : error })
    }
  }
  
  async startGeneration(request: GenerationRequest): Promise<EnhancedGenerationStatus> {
    // Check resource limits
    const health = await this.monitor.getSystemHealth()
    if (health.overall === 'critical') {
      throw new Error('System resources are critically low. Cannot start new generation.')
    }
    
    // Check queue limits
    if (this.jobQueue.length >= this.config.generation.maxQueueSize) {
      throw new Error('Generation queue is full. Please try again later.')
    }
    
    const jobStatus: EnhancedGenerationStatus = {
      id: request.jobId,
      status: 'pending',
      progress: 0,
      startTime: new Date().toISOString(),
      totalModels: request.modelIds.length,
      processedModels: 0,
      retryCount: 0,
      maxRetries: this.config.generation.retryAttempts,
      failureHistory: [],
      priority: 2, // Default priority
      estimatedTimeRemaining: this.estimateJobDuration(request),
      originalRequest: {
        modelIds: request.modelIds,
        materials: request.materials,
        settings: request.settings
      }
    }
    
    this.jobs.set(request.jobId, jobStatus)
    this.jobQueue.push(request.jobId)
    this.metrics.totalJobs++
    
    // Persist initial job state
    await this.persistenceManager.persistJobState(jobStatus)
    
    this.logger.info('Job queued for generation', { jobId: request.jobId, queuePosition: this.jobQueue.length })
    
    // Start queue processing if not already running
    if (!this.isProcessingQueue) {
      this.processQueue()
    }
    
    return jobStatus
  }
  
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return
    
    this.isProcessingQueue = true
    this.logger.info('Started queue processing')
    
    while (this.jobQueue.length > 0) {
      // Check if we can start more jobs
      const runningJobs = Array.from(this.jobs.values()).filter(job => job.status === 'processing').length
      if (runningJobs >= this.config.generation.maxConcurrentJobs) {
        this.logger.debug('Max concurrent jobs reached, waiting...', { running: runningJobs, max: this.config.generation.maxConcurrentJobs })
        await this.sleep(5000) // Wait 5 seconds
        continue
      }
      
      // Get next job from queue (prioritize by priority)
      const jobId = this.getNextJobFromQueue()
      if (!jobId) break
      
      const job = this.jobs.get(jobId)
      if (!job) continue
      
      try {
        await this.executeJob(jobId, job)
      } catch (error) {
        this.logger.error('Job execution failed', { jobId, error: error instanceof Error ? error.message : error })
        await this.handleJobFailure(jobId, error instanceof Error ? error.message : 'Unknown error')
      }
    }
    
    this.isProcessingQueue = false
    this.logger.info('Queue processing completed')
  }
  
  private getNextJobFromQueue(): string | null {
    if (this.jobQueue.length === 0) return null
    
    // Sort by priority (lower number = higher priority)
    const sortedJobs = this.jobQueue
      .map(jobId => ({ jobId, priority: this.jobs.get(jobId)?.priority || 999 }))
      .sort((a, b) => a.priority - b.priority)
    
    const nextJobId = sortedJobs[0]?.jobId
    if (nextJobId) {
      this.jobQueue = this.jobQueue.filter(id => id !== nextJobId)
    }
    
    return nextJobId
  }
  
  private async executeJob(jobId: string, job: EnhancedGenerationStatus): Promise<void> {
    this.logger.info('Starting job execution', { jobId })
    
    job.status = 'processing'
    job.startTime = new Date().toISOString()
    this.jobs.set(jobId, job)
    
    // Start checkpoint timer and persist state
    this.persistenceManager.startCheckpointTimer(jobId)
    await this.persistenceManager.persistJobState(job)
    
    this.emitJobUpdate(jobId, job)
    
    try {
      await this.circuitBreaker.execute(async () => {
        // Use the stored original request data instead of hardcoded values
        const originalRequest = job.originalRequest
        if (!originalRequest) {
          throw new Error(`No original request data found for job ${jobId}`)
        }
        
        const request: GenerationRequest = {
          jobId,
          modelIds: originalRequest.modelIds,
          materials: originalRequest.materials,
          settings: originalRequest.settings
        }
        
        await this.processGenerationWithResilience(request, job)
      })
      
      // Job completed successfully
      job.status = 'completed'
      job.progress = 100
      job.endTime = new Date().toISOString()
      this.jobs.set(jobId, job)
      
      // Stop checkpoint timer and persist final state
      this.persistenceManager.stopCheckpointTimer(jobId)
      await this.persistenceManager.persistJobState(job)
      
      this.emitJobUpdate(jobId, job)
      
      this.metrics.completedJobs++
      this.updateCompletionTimeMetrics(job)
      
      this.logger.info('Job completed successfully', { jobId, duration: this.getJobDuration(job) })
      
    } catch (error) {
      await this.handleJobFailure(jobId, error instanceof Error ? error.message : 'Unknown error')
    }
  }
  
  private async processGenerationWithResilience(request: GenerationRequest, job: EnhancedGenerationStatus): Promise<void> {
    const materials = request.materials || ['platinum', 'white-gold', 'yellow-gold', 'rose-gold']
    const totalSteps = request.modelIds.length * materials.length * 36
    
    let currentStep = 0
    let processedModels = 0
    
    for (const modelId of request.modelIds) {
      job.currentModel = modelId
      
      // Check if model file exists
      const modelPath = path.join(process.cwd(), 'public/models', `${modelId}.glb`)
      if (!existsSync(modelPath)) {
        this.logger.warn('Model file not found, skipping', { modelId, path: modelPath })
        continue
      }
      
      for (const material of materials) {
        job.currentMaterial = material
        job.totalFrames = 36
        
        // Check resource usage before starting
        const health = await this.monitor.getSystemHealth()
        if (health.overall === 'critical') {
          throw new Error('System resources critically low during generation')
        }
        
        // Generate with retry logic
        await this.generateWithRetry(modelId, material, request.jobId, (frame) => {
          job.currentFrame = frame
          job.progress = Math.round((currentStep / totalSteps) * 100)
          job.estimatedTimeRemaining = this.calculateTimeRemaining(job, currentStep, totalSteps)
          this.jobs.set(request.jobId, { ...job })
          
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
      this.jobs.set(request.jobId, { ...job })
      this.emitJobUpdate(request.jobId, job)
      
      // Create checkpoint
      await this.createJobCheckpoint(request.jobId, job)
    }
  }
  
  private async generateWithRetry(
    modelId: string,
    material: string,
    jobId: string,
    progressCallback: (frame: number) => void,
    maxRetries = 3
  ): Promise<void> {
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await this.generateModelMaterialSequence(modelId, material, jobId, progressCallback)
        return // Success
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        this.logger.warn('Generation attempt failed, retrying', { 
          modelId, 
          material, 
          attempt: attempt + 1, 
          maxRetries: maxRetries + 1,
          error: lastError.message 
        })
        
        if (attempt < maxRetries) {
          // Wait before retry with exponential backoff
          const delay = this.config.generation.retryDelaySeconds * 1000 * Math.pow(2, attempt)
          await this.sleep(delay)
        }
      }
    }
    
    throw lastError || new Error('Generation failed after all retries')
  }
  
  private async generateModelMaterialSequence(
    modelId: string,
    material: string,
    jobId: string,
    progressCallback: (frame: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(process.cwd(), 'scripts', 'generate-single-sequence.js')
      
      const args = [
        scriptPath,
        '--model', modelId,
        '--material', material,
        '--job-id', jobId
      ]
      
      const child = spawn('node', args, {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: this.config.resources.puppeteerTimeout
      })
      
      this.activeProcesses.set(jobId, child)
      
      let currentFrame = 0
      const startTime = Date.now()
      
      child.stdout.on('data', (data) => {
        const output = data.toString()
        this.logger.debug('Generation output', { jobId, output: output.trim() })
        
        const frameMatch = output.match(/Frame (\d+)\/(\d+)/)
        if (frameMatch) {
          currentFrame = parseInt(frameMatch[1])
          progressCallback(currentFrame - 1)
        }
      })
      
      child.stderr.on('data', (data) => {
        const error = data.toString()
        this.logger.error('Generation error output', { jobId, error: error.trim() })
      })
      
      child.on('close', (code) => {
        this.activeProcesses.delete(jobId)
        const duration = Date.now() - startTime
        
        if (code === 0) {
          this.logger.info('Generation subprocess completed', { jobId, modelId, material, duration })
          resolve()
        } else {
          this.logger.error('Generation subprocess failed', { jobId, modelId, material, code, duration })
          reject(new Error(`Generation script exited with code ${code}`))
        }
      })
      
      child.on('error', (error) => {
        this.activeProcesses.delete(jobId)
        this.logger.error('Generation subprocess error', { jobId, error: error.message })
        reject(error)
      })
      
      // Set timeout
      setTimeout(() => {
        if (this.activeProcesses.has(jobId)) {
          this.logger.warn('Generation subprocess timeout, killing process', { jobId, modelId, material })
          child.kill('SIGTERM')
          reject(new Error('Generation timeout'))
        }
      }, this.config.resources.puppeteerTimeout)
    })
  }
  
  private async handleJobFailure(jobId: string, errorMessage: string): Promise<void> {
    const job = this.jobs.get(jobId)
    if (!job) return
    
    job.failureHistory.push({
      timestamp: new Date().toISOString(),
      error: errorMessage
    })
    
    job.retryCount++
    this.metrics.retryCount++
    
    if (job.retryCount < job.maxRetries) {
      // Retry the job
      job.status = 'pending'
      job.lastRetryAt = new Date().toISOString()
      this.jobQueue.push(jobId) // Add back to queue
      this.logger.info('Job scheduled for retry', { jobId, retryCount: job.retryCount, maxRetries: job.maxRetries })
    } else {
      // Job failed permanently
      job.status = 'error'
      job.error = `Failed after ${job.maxRetries} retries: ${errorMessage}`
      job.endTime = new Date().toISOString()
      this.metrics.failedJobs++
      this.logger.error('Job failed permanently', { jobId, retryCount: job.retryCount, error: errorMessage })
    }
    
    this.jobs.set(jobId, job)
    this.emitJobUpdate(jobId, job)
  }
  
  // Utility methods
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  private estimateJobDuration(request: GenerationRequest): number {
    const baseTimePerSequence = 30 // seconds
    const materials = request.materials || ['platinum', 'white-gold', 'yellow-gold', 'rose-gold']
    return request.modelIds.length * materials.length * baseTimePerSequence
  }
  
  private calculateTimeRemaining(job: EnhancedGenerationStatus, currentStep: number, totalSteps: number): number {
    if (!job.startTime || currentStep === 0) return job.estimatedTimeRemaining || 0
    
    const elapsed = Date.now() - new Date(job.startTime).getTime()
    const timePerStep = elapsed / currentStep
    const remainingSteps = totalSteps - currentStep
    
    return Math.round((remainingSteps * timePerStep) / 1000) // seconds
  }
  
  private getJobDuration(job: EnhancedGenerationStatus): number {
    if (!job.startTime || !job.endTime) return 0
    return new Date(job.endTime).getTime() - new Date(job.startTime).getTime()
  }
  
  private updateCompletionTimeMetrics(job: EnhancedGenerationStatus): void {
    const duration = this.getJobDuration(job)
    this.metrics.totalProcessingTime += duration
    this.metrics.averageCompletionTime = this.metrics.totalProcessingTime / this.metrics.completedJobs
  }
  
  private async performHealthCheck(): Promise<void> {
    const health = await this.monitor.getSystemHealth()
    this.metrics.lastHealthCheck = Date.now()
    
    this.logger.info('Health check completed', {
      overall: health.overall,
      memory: health.memory,
      activeJobs: Array.from(this.jobs.values()).filter(job => job.status === 'processing').length,
      queueSize: this.jobQueue.length
    })
    
    if (health.overall === 'critical') {
      this.logger.error('System health critical - pausing new job processing')
      // Could implement emergency measures here
    }
  }
  
  private async cleanupOldJobs(): Promise<void> {
    const cutoffTime = Date.now() - (this.config.files.retentionDays * 24 * 60 * 60 * 1000)
    let cleanedCount = 0
    
    for (const [jobId, job] of this.jobs) {
      const jobTime = new Date(job.startTime).getTime()
      if (jobTime < cutoffTime && ['completed', 'error'].includes(job.status)) {
        this.jobs.delete(jobId)
        cleanedCount++
      }
    }
    
    if (cleanedCount > 0) {
      this.logger.info('Cleaned up old jobs', { count: cleanedCount })
    }
  }
  
  private async cleanupTempFiles(): Promise<void> {
    // Implementation for cleaning temporary files
    this.logger.debug('Cleanup task completed')
  }
  
  private async persistJobStates(): Promise<void> {
    // Implementation for persisting job states to disk/database
    // This would be important for recovery after server restarts
  }
  
  private async createJobCheckpoint(jobId: string, job: EnhancedGenerationStatus): Promise<void> {
    try {
      await this.persistenceManager.createCheckpoint(
        jobId,
        job.progress,
        [], // In a real implementation, we'd track completed models
        job.currentModel,
        job.currentMaterial,
        job.currentFrame,
        {
          processedModels: job.processedModels,
          totalModels: job.totalModels,
          retryCount: job.retryCount
        }
      )
      this.logger.debug('Job checkpoint created', { jobId, progress: job.progress })
    } catch (error) {
      this.logger.error('Failed to create job checkpoint', { jobId, error: error instanceof Error ? error.message : error })
    }
  }
  
  private emitJobUpdate(jobId: string, job: EnhancedGenerationStatus): void {
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
        endTime: job.endTime,
        estimatedTimeRemaining: job.estimatedTimeRemaining,
        retryCount: job.retryCount
      })
    }
  }
  
  // Public API methods
  async stopGeneration(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId)
    if (!job) return false
    
    if (job.status === 'processing') {
      const activeProcess = this.activeProcesses.get(jobId)
      if (activeProcess) {
        try {
          activeProcess.kill('SIGTERM')
          this.activeProcesses.delete(jobId)
          this.logger.info('Generation process terminated', { jobId })
        } catch (error) {
          this.logger.error('Failed to terminate process', { jobId, error })
        }
      }
      
      job.status = 'error'
      job.error = 'Cancelled by user'
      job.endTime = new Date().toISOString()
      this.jobs.set(jobId, job)
      this.emitJobUpdate(jobId, job)
      
      return true
    }
    
    // Remove from queue if pending
    if (job.status === 'pending') {
      this.jobQueue = this.jobQueue.filter(id => id !== jobId)
      this.jobs.delete(jobId)
      return true
    }
    
    return false
  }
  
  getJob(jobId: string): EnhancedGenerationStatus | undefined {
    return this.jobs.get(jobId)
  }
  
  getAllJobs(): EnhancedGenerationStatus[] {
    return Array.from(this.jobs.values())
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      activeJobs: Array.from(this.jobs.values()).filter(job => job.status === 'processing').length,
      queueSize: this.jobQueue.length,
      circuitBreakerState: this.circuitBreaker.getState()
    }
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

  async recoverJob(jobId: string, options: RecoveryOptions = {
    resumeFromLastCheckpoint: true,
    skipFailedSteps: false,
    retryFailedSteps: true,
    maxRecoveryAttempts: 3
  }): Promise<{ success: boolean; message: string; job?: EnhancedGenerationStatus }> {
    try {
      const recovery = await this.persistenceManager.recoverJob(jobId, options)
      
      if (!recovery.canRecover) {
        return { success: false, message: recovery.error || 'Job cannot be recovered' }
      }

      if (recovery.job) {
        this.jobs.set(jobId, recovery.job)
        this.jobQueue.push(jobId)
        
        this.logger.info('Job manually recovered', { 
          jobId, 
          fromCheckpoint: !!recovery.recoveryPoint,
          progress: recovery.job.progress 
        })

        // Start queue processing if not already running
        if (!this.isProcessingQueue) {
          this.processQueue()
        }

        return { 
          success: true, 
          message: `Job recovered successfully${recovery.recoveryPoint ? ' from checkpoint' : ''}`,
          job: recovery.job
        }
      }

      return { success: false, message: 'Failed to recover job state' }
    } catch (error) {
      this.logger.error('Manual job recovery failed', { jobId, error: error instanceof Error ? error.message : error })
      return { success: false, message: 'Recovery failed due to internal error' }
    }
  }

  async getJobPersistenceStatistics() {
    return await this.persistenceManager.getJobStatistics()
  }

  async getAllRecoverableJobs() {
    return await this.persistenceManager.getAllRecoverableJobs()
  }

  async cleanupJobPersistence(retentionDays: number = 7): Promise<number> {
    return await this.persistenceManager.cleanupOldJobs(retentionDays)
  }
}