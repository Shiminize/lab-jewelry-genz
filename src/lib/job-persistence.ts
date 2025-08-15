/**
 * Job Persistence System
 * Handles job state persistence, recovery, and checkpoint management
 */

import { promises as fs } from 'fs'
import path from 'path'
import { getProductionConfig } from './production-config'
import { EnhancedGenerationStatus } from './enhanced-generation-service'

export interface JobCheckpoint {
  jobId: string
  timestamp: string
  progress: number
  completedModels: string[]
  currentModel?: string
  currentMaterial?: string
  currentFrame?: number
  metadata?: Record<string, any>
}

export interface PersistedJobState {
  job: EnhancedGenerationStatus
  checkpoints: JobCheckpoint[]
  createdAt: string
  updatedAt: string
  version: string
}

export interface RecoveryOptions {
  resumeFromLastCheckpoint: boolean
  skipFailedSteps: boolean
  retryFailedSteps: boolean
  maxRecoveryAttempts: number
}

export class JobPersistenceManager {
  private config = getProductionConfig()
  private persistenceDir: string
  private checkpointInterval = 30000 // 30 seconds
  private activeCheckpointTimers = new Map<string, NodeJS.Timeout>()

  constructor() {
    this.persistenceDir = path.join(this.config.files.tempDirectory, 'job-persistence')
    this.ensurePersistenceDirectory()
  }

  private async ensurePersistenceDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.persistenceDir, { recursive: true })
    } catch (error) {
      console.error('Failed to create persistence directory:', error)
    }
  }

  private getJobFilePath(jobId: string): string {
    return path.join(this.persistenceDir, `job-${jobId}.json`)
  }

  private getCheckpointFilePath(jobId: string): string {
    return path.join(this.persistenceDir, `checkpoints-${jobId}.json`)
  }

  async persistJobState(job: EnhancedGenerationStatus): Promise<void> {
    try {
      const existingState = await this.loadJobState(job.id).catch(() => null)
      
      const persistedState: PersistedJobState = {
        job,
        checkpoints: existingState?.checkpoints || [],
        createdAt: existingState?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0'
      }

      const filePath = this.getJobFilePath(job.id)
      await fs.writeFile(filePath, JSON.stringify(persistedState, null, 2))
      
      console.log(`📝 Persisted job state: ${job.id}`)
    } catch (error) {
      console.error('Failed to persist job state:', error)
    }
  }

  async loadJobState(jobId: string): Promise<PersistedJobState | null> {
    try {
      const filePath = this.getJobFilePath(jobId)
      const data = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      return null
    }
  }

  async createCheckpoint(
    jobId: string, 
    progress: number, 
    completedModels: string[],
    currentModel?: string,
    currentMaterial?: string,
    currentFrame?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const checkpoint: JobCheckpoint = {
        jobId,
        timestamp: new Date().toISOString(),
        progress,
        completedModels: [...completedModels],
        currentModel,
        currentMaterial,
        currentFrame,
        metadata
      }

      // Load existing checkpoints
      const checkpoints = await this.loadCheckpoints(jobId)
      checkpoints.push(checkpoint)

      // Keep only last 10 checkpoints to avoid excessive storage
      const recentCheckpoints = checkpoints.slice(-10)

      // Save checkpoints
      const checkpointFilePath = this.getCheckpointFilePath(jobId)
      await fs.writeFile(checkpointFilePath, JSON.stringify(recentCheckpoints, null, 2))

      // Update job state with latest checkpoint
      const jobState = await this.loadJobState(jobId)
      if (jobState) {
        jobState.checkpoints = recentCheckpoints
        jobState.updatedAt = new Date().toISOString()
        await this.persistJobState(jobState.job)
      }

      console.log(`🔄 Created checkpoint for job ${jobId}: ${progress}% complete`)
    } catch (error) {
      console.error('Failed to create checkpoint:', error)
    }
  }

  async loadCheckpoints(jobId: string): Promise<JobCheckpoint[]> {
    try {
      const checkpointFilePath = this.getCheckpointFilePath(jobId)
      const data = await fs.readFile(checkpointFilePath, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      return []
    }
  }

  async getLatestCheckpoint(jobId: string): Promise<JobCheckpoint | null> {
    const checkpoints = await this.loadCheckpoints(jobId)
    return checkpoints.length > 0 ? checkpoints[checkpoints.length - 1] : null
  }

  async recoverJob(jobId: string, options: RecoveryOptions): Promise<{
    canRecover: boolean
    recoveryPoint?: JobCheckpoint
    job?: EnhancedGenerationStatus
    error?: string
  }> {
    try {
      const jobState = await this.loadJobState(jobId)
      if (!jobState) {
        return { canRecover: false, error: 'No persisted state found' }
      }

      const latestCheckpoint = await this.getLatestCheckpoint(jobId)
      if (!latestCheckpoint && options.resumeFromLastCheckpoint) {
        return { canRecover: false, error: 'No checkpoints available for recovery' }
      }

      // Check if job was in a recoverable state
      const job = jobState.job
      if (job.status === 'completed') {
        return { canRecover: false, error: 'Job already completed' }
      }

      if (job.status === 'error' && job.retryCount >= job.maxRetries && !options.retryFailedSteps) {
        return { canRecover: false, error: 'Job exceeded max retries' }
      }

      // Prepare job for recovery
      if (options.resumeFromLastCheckpoint && latestCheckpoint) {
        job.progress = latestCheckpoint.progress
        job.processedModels = latestCheckpoint.completedModels.length
        job.currentModel = latestCheckpoint.currentModel
        job.currentMaterial = latestCheckpoint.currentMaterial
        job.currentFrame = latestCheckpoint.currentFrame
      }

      // Reset status for recovery
      job.status = 'pending'
      job.error = undefined

      // Increment retry count if this is a failure recovery
      if (jobState.job.status === 'error') {
        job.retryCount = (job.retryCount || 0) + 1
        job.lastRetryAt = new Date().toISOString()
      }

      return {
        canRecover: true,
        recoveryPoint: latestCheckpoint || undefined,
        job
      }
    } catch (error) {
      return { 
        canRecover: false, 
        error: error instanceof Error ? error.message : 'Unknown recovery error' 
      }
    }
  }

  async startCheckpointTimer(jobId: string): Promise<void> {
    // Clear existing timer if any
    this.stopCheckpointTimer(jobId)

    const timer = setInterval(async () => {
      const jobState = await this.loadJobState(jobId)
      if (jobState && jobState.job.status === 'processing') {
        await this.createCheckpoint(
          jobId,
          jobState.job.progress,
          [], // We'd need to track this from the generation service
          jobState.job.currentModel,
          jobState.job.currentMaterial,
          jobState.job.currentFrame
        )
      } else {
        // Stop timer if job is no longer processing
        this.stopCheckpointTimer(jobId)
      }
    }, this.checkpointInterval)

    this.activeCheckpointTimers.set(jobId, timer)
  }

  stopCheckpointTimer(jobId: string): void {
    const timer = this.activeCheckpointTimers.get(jobId)
    if (timer) {
      clearInterval(timer)
      this.activeCheckpointTimers.delete(jobId)
    }
  }

  async cleanupJobData(jobId: string): Promise<void> {
    try {
      this.stopCheckpointTimer(jobId)
      
      const jobFilePath = this.getJobFilePath(jobId)
      const checkpointFilePath = this.getCheckpointFilePath(jobId)

      await Promise.all([
        fs.unlink(jobFilePath).catch(() => {}),
        fs.unlink(checkpointFilePath).catch(() => {})
      ])

      console.log(`🗑️ Cleaned up job data: ${jobId}`)
    } catch (error) {
      console.error('Failed to cleanup job data:', error)
    }
  }

  async cleanupOldJobs(retentionDays: number = 7): Promise<number> {
    try {
      const files = await fs.readdir(this.persistenceDir)
      const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000)
      let cleanedCount = 0

      for (const file of files) {
        if (file.startsWith('job-') && file.endsWith('.json')) {
          const filePath = path.join(this.persistenceDir, file)
          const stats = await fs.stat(filePath)
          
          if (stats.mtime.getTime() < cutoffTime) {
            await fs.unlink(filePath)
            
            // Also cleanup corresponding checkpoint file
            const jobId = file.replace('job-', '').replace('.json', '')
            const checkpointFile = path.join(this.persistenceDir, `checkpoints-${jobId}.json`)
            await fs.unlink(checkpointFile).catch(() => {})
            
            cleanedCount++
          }
        }
      }

      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} old job persistence files`)
      }

      return cleanedCount
    } catch (error) {
      console.error('Failed to cleanup old jobs:', error)
      return 0
    }
  }

  async getAllRecoverableJobs(): Promise<Array<{
    jobId: string
    job: EnhancedGenerationStatus
    lastCheckpoint?: JobCheckpoint
    canRecover: boolean
  }>> {
    try {
      const files = await fs.readdir(this.persistenceDir)
      const recoverableJobs = []

      for (const file of files) {
        if (file.startsWith('job-') && file.endsWith('.json')) {
          const jobId = file.replace('job-', '').replace('.json', '')
          const jobState = await this.loadJobState(jobId)
          
          if (jobState) {
            const lastCheckpoint = await this.getLatestCheckpoint(jobId)
            const canRecover = ['pending', 'processing', 'error'].includes(jobState.job.status) &&
                              jobState.job.retryCount < jobState.job.maxRetries

            recoverableJobs.push({
              jobId,
              job: jobState.job,
              lastCheckpoint: lastCheckpoint || undefined,
              canRecover
            })
          }
        }
      }

      return recoverableJobs
    } catch (error) {
      console.error('Failed to get recoverable jobs:', error)
      return []
    }
  }

  async getJobStatistics(): Promise<{
    totalPersistedJobs: number
    recoverableJobs: number
    completedJobs: number
    failedJobs: number
    oldestJob?: string
    newestJob?: string
  }> {
    try {
      const allJobs = await this.getAllRecoverableJobs()
      
      const stats = {
        totalPersistedJobs: allJobs.length,
        recoverableJobs: allJobs.filter(j => j.canRecover).length,
        completedJobs: allJobs.filter(j => j.job.status === 'completed').length,
        failedJobs: allJobs.filter(j => j.job.status === 'error').length,
        oldestJob: undefined as string | undefined,
        newestJob: undefined as string | undefined
      }

      if (allJobs.length > 0) {
        const sortedByTime = allJobs.sort((a, b) => 
          new Date(a.job.startTime).getTime() - new Date(b.job.startTime).getTime()
        )
        stats.oldestJob = sortedByTime[0].jobId
        stats.newestJob = sortedByTime[sortedByTime.length - 1].jobId
      }

      return stats
    } catch (error) {
      console.error('Failed to get job statistics:', error)
      return {
        totalPersistedJobs: 0,
        recoverableJobs: 0,
        completedJobs: 0,
        failedJobs: 0
      }
    }
  }

  destroy(): void {
    // Stop all active checkpoint timers
    for (const [jobId] of this.activeCheckpointTimers) {
      this.stopCheckpointTimer(jobId)
    }
  }
}

export default JobPersistenceManager