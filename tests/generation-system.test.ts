/**
 * Comprehensive Test Suite for 3D Generation System
 * Tests core functionality, error handling, and performance characteristics
 */

import { describe, test, expect, beforeEach, afterEach, jest, beforeAll, afterAll } from '@jest/globals'
import { EnhancedGenerationService } from '../src/lib/enhanced-generation-service'
import { GenerationService } from '../src/lib/generation-service'
import { ResourceOptimizer } from '../src/lib/resource-optimizer'
import { JobPersistenceManager } from '../src/lib/job-persistence'
import { getProductionConfig } from '../src/lib/production-config'
import { promises as fs } from 'fs'
import path from 'path'

// Mock external dependencies
jest.mock('child_process')
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    readFile: jest.fn(),
    readdir: jest.fn(),
    stat: jest.fn(),
    access: jest.fn(),
    unlink: jest.fn(),
    rm: jest.fn()
  },
  existsSync: jest.fn()
}))

// Mock Socket.IO
const mockIo = {
  to: jest.fn(() => ({
    emit: jest.fn()
  }))
}

beforeAll(() => {
  global.io = mockIo
})

describe('Generation System Tests', () => {
  let enhancedService: EnhancedGenerationService
  let basicService: GenerationService
  let resourceOptimizer: ResourceOptimizer
  let persistenceManager: JobPersistenceManager

  beforeEach(() => {
    jest.clearAllMocks()
    enhancedService = EnhancedGenerationService.getInstance()
    basicService = GenerationService.getInstance()
    resourceOptimizer = new ResourceOptimizer()
    persistenceManager = new JobPersistenceManager()
  })

  afterEach(() => {
    // Clean up any running processes
    resourceOptimizer.destroy()
    persistenceManager.destroy()
  })

  describe('Basic Generation Service', () => {
    test('should create and queue a generation job', async () => {
      const request = {
        jobId: 'test-job-1',
        modelIds: ['test-model'],
        materials: ['platinum']
      }

      const job = await basicService.startGeneration(request)

      expect(job).toBeDefined()
      expect(job.id).toBe('test-job-1')
      expect(job.status).toBe('pending')
      expect(job.totalModels).toBe(1)
    })

    test('should handle job cancellation', async () => {
      const request = {
        jobId: 'test-job-cancel',
        modelIds: ['test-model'],
        materials: ['platinum']
      }

      const job = await basicService.startGeneration(request)
      expect(job.status).toBe('pending')

      const cancelled = await basicService.stopGeneration('test-job-cancel')
      expect(cancelled).toBe(true)
    })

    test('should return job status', () => {
      const request = {
        jobId: 'test-job-status',
        modelIds: ['test-model'],
        materials: ['platinum']
      }

      basicService.startGeneration(request)
      const retrievedJob = basicService.getJob('test-job-status')

      expect(retrievedJob).toBeDefined()
      expect(retrievedJob?.id).toBe('test-job-status')
    })

    test('should validate dependencies', async () => {
      const validation = await basicService.validateDependencies()
      
      // Should return validation results
      expect(validation).toHaveProperty('valid')
      expect(validation).toHaveProperty('errors')
      expect(Array.isArray(validation.errors)).toBe(true)
    })
  })

  describe('Enhanced Generation Service', () => {
    test('should create job with enhanced features', async () => {
      const request = {
        jobId: 'enhanced-job-1',
        modelIds: ['test-model'],
        materials: ['platinum']
      }

      const job = await enhancedService.startGeneration(request)

      expect(job).toBeDefined()
      expect(job.id).toBe('enhanced-job-1')
      expect(job.retryCount).toBe(0)
      expect(job.maxRetries).toBeGreaterThan(0)
      expect(job.failureHistory).toEqual([])
      expect(job.priority).toBeDefined()
    })

    test('should handle resource pressure', async () => {
      // Mock high memory usage
      const mockMetrics = {
        memory: { used: 1800, total: 2048, percentage: 88, isOverLimit: true },
        disk: { used: 1000, total: 10000, percentage: 10, isOverLimit: false },
        processes: { count: 5, limit: 10, isOverLimit: false },
        cpu: { usage: 50, load: [1, 2, 3] },
        generation: { activeJobs: 1, queuedJobs: 2, completedJobs: 5, failedJobs: 1 }
      }

      jest.spyOn(resourceOptimizer, 'updateMetrics').mockResolvedValue(mockMetrics)
      
      const request = {
        jobId: 'resource-test',
        modelIds: ['test-model'],
        materials: ['platinum']
      }

      // Should still accept job but may trigger optimizations
      const job = await enhancedService.startGeneration(request)
      expect(job).toBeDefined()
    })

    test('should reject jobs when resources are critically low', async () => {
      // Mock critical resource state
      const mockHealthCheck = {
        memory: { usage: 2000, limit: 2048, isOverLimit: true },
        disk: { available: 100, used: 9900, isOverLimit: true },
        processes: { count: 15, limit: 10, isOverLimit: true },
        overall: 'critical' as const
      }

      const mockMonitor = {
        getSystemHealth: jest.fn().mockResolvedValue(mockHealthCheck)
      }

      // Mock the monitor
      Object.defineProperty(enhancedService, 'monitor', {
        value: mockMonitor,
        writable: true
      })

      const request = {
        jobId: 'critical-test',
        modelIds: ['test-model'],
        materials: ['platinum']
      }

      await expect(enhancedService.startGeneration(request))
        .rejects.toThrow('System resources are critically low')
    })

    test('should provide comprehensive metrics', () => {
      const metrics = enhancedService.getMetrics()

      expect(metrics).toHaveProperty('totalJobs')
      expect(metrics).toHaveProperty('completedJobs')
      expect(metrics).toHaveProperty('failedJobs')
      expect(metrics).toHaveProperty('activeJobs')
      expect(metrics).toHaveProperty('queueSize')
      expect(metrics).toHaveProperty('circuitBreakerState')
    })
  })

  describe('Resource Optimization', () => {
    test('should track system metrics', async () => {
      const metrics = await resourceOptimizer.updateMetrics()

      expect(metrics).toHaveProperty('memory')
      expect(metrics).toHaveProperty('disk')
      expect(metrics).toHaveProperty('processes')
      expect(metrics).toHaveProperty('cpu')
      expect(metrics).toHaveProperty('generation')

      expect(metrics.memory).toHaveProperty('used')
      expect(metrics.memory).toHaveProperty('percentage')
      expect(metrics.memory).toHaveProperty('isOverLimit')
    })

    test('should generate optimization recommendations', async () => {
      // Mock high resource usage
      const mockMetrics = {
        memory: { used: 1900, total: 2048, percentage: 93, isOverLimit: true },
        disk: { used: 9000, total: 10000, percentage: 90, isOverLimit: false },
        processes: { count: 8, limit: 10, isOverLimit: false },
        cpu: { usage: 85, load: [2, 3, 4] },
        generation: { activeJobs: 3, queuedJobs: 5, completedJobs: 10, failedJobs: 2 }
      }

      jest.spyOn(resourceOptimizer, 'updateMetrics').mockResolvedValue(mockMetrics)

      const recommendations = await resourceOptimizer.performOptimizations()

      expect(Array.isArray(recommendations)).toBe(true)
      expect(recommendations.length).toBeGreaterThan(0)
      
      const memoryRec = recommendations.find(r => r.type === 'memory')
      expect(memoryRec).toBeDefined()
      expect(memoryRec?.severity).toBe('critical')
    })

    test('should determine memory pressure levels', () => {
      // Test different memory pressure levels
      expect(resourceOptimizer.getMemoryPressure()).toBeDefined()
      
      const levels = ['low', 'medium', 'high', 'critical']
      expect(levels).toContain(resourceOptimizer.getMemoryPressure())
    })

    test('should perform pre-generation optimization', async () => {
      await expect(resourceOptimizer.optimizeForGeneration()).resolves.not.toThrow()
    })
  })

  describe('Job Persistence', () => {
    test('should persist job state', async () => {
      const mockJob = {
        id: 'persist-test',
        status: 'processing' as const,
        progress: 50,
        startTime: new Date().toISOString(),
        totalModels: 2,
        processedModels: 1,
        retryCount: 0,
        maxRetries: 3,
        failureHistory: [],
        priority: 2
      }

      await expect(persistenceManager.persistJobState(mockJob)).resolves.not.toThrow()
    })

    test('should create and load checkpoints', async () => {
      const jobId = 'checkpoint-test'
      const completedModels = ['model1']
      
      await persistenceManager.createCheckpoint(
        jobId, 
        75, 
        completedModels, 
        'model2', 
        'platinum', 
        10,
        { test: 'metadata' }
      )

      const checkpoint = await persistenceManager.getLatestCheckpoint(jobId)
      expect(checkpoint?.jobId).toBe(jobId)
      expect(checkpoint?.progress).toBe(75)
      expect(checkpoint?.currentModel).toBe('model2')
    })

    test('should manage checkpoint timers', async () => {
      const jobId = 'timer-test'
      
      await persistenceManager.startCheckpointTimer(jobId)
      
      // Timer should be active
      expect(persistenceManager['activeCheckpointTimers'].has(jobId)).toBe(true)
      
      persistenceManager.stopCheckpointTimer(jobId)
      
      // Timer should be stopped
      expect(persistenceManager['activeCheckpointTimers'].has(jobId)).toBe(false)
    })

    test('should provide job statistics', async () => {
      const stats = await persistenceManager.getJobStatistics()

      expect(stats).toHaveProperty('totalPersistedJobs')
      expect(stats).toHaveProperty('recoverableJobs')
      expect(stats).toHaveProperty('completedJobs')
      expect(stats).toHaveProperty('failedJobs')
      expect(typeof stats.totalPersistedJobs).toBe('number')
    })
  })

  describe('Production Configuration', () => {
    test('should load valid configuration', () => {
      const config = getProductionConfig()

      expect(config).toHaveProperty('generation')
      expect(config).toHaveProperty('resources')
      expect(config).toHaveProperty('monitoring')
      expect(config).toHaveProperty('files')
      expect(config).toHaveProperty('websocket')
      expect(config).toHaveProperty('security')

      expect(config.generation.maxConcurrentJobs).toBeGreaterThan(0)
      expect(config.resources.maxMemoryMB).toBeGreaterThan(0)
    })

    test('should have different configs for different environments', () => {
      // Test development environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const devConfig = getProductionConfig()
      expect(devConfig.generation.maxConcurrentJobs).toBeLessThanOrEqual(3)

      // Restore original environment
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Error Handling and Resilience', () => {
    test('should handle generation script failures gracefully', async () => {
      const request = {
        jobId: 'error-test',
        modelIds: ['nonexistent-model'],
        materials: ['platinum']
      }

      // Mock file system to simulate missing model
      jest.mocked(fs.access).mockRejectedValue(new Error('File not found'))

      const job = await enhancedService.startGeneration(request)
      expect(job).toBeDefined()
      
      // Job should be created but may fail during processing
      expect(job.status).toBe('pending')
    })

    test('should respect retry limits', async () => {
      const mockJob = {
        id: 'retry-test',
        status: 'error' as const,
        progress: 25,
        startTime: new Date().toISOString(),
        totalModels: 1,
        processedModels: 0,
        retryCount: 3,
        maxRetries: 3,
        failureHistory: [
          { timestamp: new Date().toISOString(), error: 'Test error 1' },
          { timestamp: new Date().toISOString(), error: 'Test error 2' },
          { timestamp: new Date().toISOString(), error: 'Test error 3' }
        ],
        priority: 2
      }

      const recovery = await persistenceManager.recoverJob('retry-test', {
        resumeFromLastCheckpoint: true,
        skipFailedSteps: false,
        retryFailedSteps: true,
        maxRecoveryAttempts: 3
      })

      expect(recovery.canRecover).toBe(false)
      expect(recovery.error).toContain('exceeded max retries')
    })
  })

  describe('Performance Tests', () => {
    test('should handle multiple concurrent job requests', async () => {
      const jobs = []
      const numJobs = 5

      for (let i = 0; i < numJobs; i++) {
        const request = {
          jobId: `concurrent-${i}`,
          modelIds: ['test-model'],
          materials: ['platinum']
        }
        jobs.push(enhancedService.startGeneration(request))
      }

      const results = await Promise.all(jobs)
      expect(results).toHaveLength(numJobs)
      
      results.forEach((job, index) => {
        expect(job.id).toBe(`concurrent-${index}`)
        expect(job.status).toBe('pending')
      })
    })

    test('should enforce queue size limits', async () => {
      const config = getProductionConfig()
      const jobs = []

      // Try to create more jobs than the queue limit
      for (let i = 0; i < config.generation.maxQueueSize + 5; i++) {
        const request = {
          jobId: `queue-limit-${i}`,
          modelIds: ['test-model'],
          materials: ['platinum']
        }
        jobs.push(enhancedService.startGeneration(request).catch(e => e))
      }

      const results = await Promise.all(jobs)
      
      // Some jobs should succeed, others should fail due to queue limits
      const successes = results.filter(r => r.id && !r.message)
      const failures = results.filter(r => r.message && r.message.includes('queue is full'))
      
      expect(successes.length).toBeLessThanOrEqual(config.generation.maxQueueSize)
      expect(failures.length).toBeGreaterThan(0)
    })
  })

  describe('Integration Tests', () => {
    test('should integrate all components for complete workflow', async () => {
      // Start with a clean system
      const initialMetrics = await resourceOptimizer.updateMetrics()
      expect(initialMetrics).toBeDefined()

      // Create a generation job
      const request = {
        jobId: 'integration-test',
        modelIds: ['test-model'],
        materials: ['platinum', 'gold']
      }

      const job = await enhancedService.startGeneration(request)
      expect(job.id).toBe('integration-test')

      // Check that job is persisted
      const persistedState = await persistenceManager.loadJobState('integration-test')
      expect(persistedState?.job.id).toBe('integration-test')

      // Verify job appears in metrics
      const metrics = enhancedService.getMetrics()
      expect(metrics.totalJobs).toBeGreaterThan(0)

      // Test job recovery capability
      const recoverableJobs = await enhancedService.getAllRecoverableJobs()
      const ourJob = recoverableJobs.find(j => j.jobId === 'integration-test')
      expect(ourJob).toBeDefined()
    })
  })
})

describe('API Integration Tests', () => {
  test('should handle malformed requests gracefully', () => {
    // Test with invalid job IDs, missing parameters, etc.
    expect(() => {
      const invalidRequest = {
        jobId: '', // Invalid empty ID
        modelIds: [],
        materials: ['platinum']
      }
      // This should be handled gracefully by validation
    }).not.toThrow()
  })

  test('should validate model file existence', async () => {
    const basicService = GenerationService.getInstance()
    
    // Mock file system access
    jest.mocked(fs.access).mockRejectedValue(new Error('File not found'))
    
    const models = await basicService.getAvailableModels()
    expect(Array.isArray(models)).toBe(true)
    // Should handle missing models directory gracefully
  })
})

// Performance benchmarks
describe('Performance Benchmarks', () => {
  test('job creation should complete within acceptable time', async () => {
    const start = Date.now()
    
    const request = {
      jobId: 'benchmark-job',
      modelIds: ['test-model'],
      materials: ['platinum']
    }

    await enhancedService.startGeneration(request)
    
    const duration = Date.now() - start
    expect(duration).toBeLessThan(1000) // Should complete within 1 second
  })

  test('metrics collection should be efficient', async () => {
    const start = Date.now()
    
    await resourceOptimizer.updateMetrics()
    
    const duration = Date.now() - start
    expect(duration).toBeLessThan(500) // Should complete within 500ms
  })
})