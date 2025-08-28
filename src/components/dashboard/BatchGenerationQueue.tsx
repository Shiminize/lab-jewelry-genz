/**
 * Batch Generation Queue Component
 * Manages multiple generation jobs with queue status and priority
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import useWebSocket, { JobProgress } from '@/hooks/useWebSocket'
import { 
  Play, 
  Pause, 
  X, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Settings,
  Trash2
} from 'lucide-react'

interface QueuedJob {
  id: string
  name: string
  modelIds: string[]
  materials: string[]
  priority: number
  status: 'queued' | 'processing' | 'completed' | 'error' | 'paused'
  progress?: number
  currentModel?: string
  currentMaterial?: string
  currentFrame?: number
  totalFrames?: number
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  error?: string
  estimatedDuration?: number
}

interface BatchGenerationQueueProps {
  className?: string
}

export function BatchGenerationQueue({ className = '' }: BatchGenerationQueueProps) {
  const [jobs, setJobs] = useState<QueuedJob[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const { isConnected, joinJobRoom, leaveJobRoom, jobProgress } = useWebSocket()

  // Mock data for demonstration
  useEffect(() => {
    const mockJobs: QueuedJob[] = [
      {
        id: 'job-1',
        name: 'Jewelry Collection - Rings',
        modelIds: ['black-stone-ring', 'solitaire-ring'],
        materials: ['platinum', 'white-gold', 'yellow-gold', 'rose-gold'],
        priority: 1,
        status: 'processing',
        progress: 45,
        currentModel: 'black-stone-ring',
        currentMaterial: 'platinum',
        currentFrame: 16,
        totalFrames: 36,
        createdAt: new Date('2024-08-14T10:00:00'),
        startedAt: new Date('2024-08-14T10:05:00'),
        estimatedDuration: 600 // 10 minutes
      },
      {
        id: 'job-2',
        name: 'Test Models Batch',
        modelIds: ['toy-car', 'test-cube'],
        materials: ['platinum', 'rose-gold'],
        priority: 2,
        status: 'queued',
        createdAt: new Date('2024-08-14T10:30:00'),
        estimatedDuration: 300 // 5 minutes
      },
      {
        id: 'job-3',
        name: 'High Priority Rush Order',
        modelIds: ['urgent-ring'],
        materials: ['platinum'],
        priority: 0,
        status: 'completed',
        progress: 100,
        createdAt: new Date('2024-08-14T09:00:00'),
        startedAt: new Date('2024-08-14T09:05:00'),
        completedAt: new Date('2024-08-14T09:25:00'),
        estimatedDuration: 120 // 2 minutes
      }
    ]
    setJobs(mockJobs)
    setIsProcessing(mockJobs.some(job => job.status === 'processing'))
  }, [])

  // Update jobs with WebSocket progress
  useEffect(() => {
    setJobs(prevJobs => 
      prevJobs.map(job => {
        if (jobProgress.has(job.id)) {
          const progress = jobProgress.get(job.id)!
          return {
            ...job,
            status: progress.status as QueuedJob['status'],
            progress: progress.progress,
            currentModel: progress.currentModel,
            currentMaterial: progress.currentMaterial,
            currentFrame: progress.currentFrame,
            totalFrames: progress.totalFrames,
            error: progress.error
          }
        }
        return job
      })
    )
  }, [jobProgress])

  const addToQueue = (modelIds: string[], materials: string[], priority: number = 2) => {
    const newJob: QueuedJob = {
      id: `job-${Date.now()}`,
      name: `Generation Job - ${new Date().toLocaleTimeString()}`,
      modelIds,
      materials,
      priority,
      status: 'queued',
      createdAt: new Date(),
      estimatedDuration: modelIds.length * materials.length * 30 // 30s per sequence
    }
    
    setJobs(prev => [...prev, newJob].sort((a, b) => a.priority - b.priority))
  }

  const startJob = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId)
    if (!job) return

    try {
      const response = await fetch('/api/3d-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          modelIds: job.modelIds,
          materials: job.materials
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        setJobs(prev => prev.map(j => 
          j.id === jobId 
            ? { ...j, status: 'processing', startedAt: new Date() }
            : j
        ))

        joinJobRoom(data.jobId)
        setIsProcessing(true)
      }
    } catch (error) {
      console.error('Failed to start job:', error)
      setJobs(prev => prev.map(j => 
        j.id === jobId 
          ? { ...j, status: 'error', error: 'Failed to start generation' }
          : j
      ))
    }
  }

  const pauseJob = async (jobId: string) => {
    // TODO: Implement job pausing
    setJobs(prev => prev.map(j => 
      j.id === jobId 
        ? { ...j, status: 'paused' }
        : j
    ))
  }

  const cancelJob = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId))
  }

  const changePriority = (jobId: string, direction: 'up' | 'down') => {
    setJobs(prev => {
      const updated = prev.map(job => {
        if (job.id === jobId) {
          const newPriority = direction === 'up' ? job.priority - 1 : job.priority + 1
          return { ...job, priority: Math.max(0, newPriority) }
        }
        return job
      })
      return updated.sort((a, b) => a.priority - b.priority)
    })
  }

  const getStatusIcon = (status: QueuedJob['status']) => {
    switch (status) {
      case 'queued': return <Clock className="w-4 h-4 text-blue-500" />
      case 'processing': return <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'paused': return <Pause className="w-4 h-4 text-yellow-500" />
      default: return null
    }
  }

  const getStatusColor = (status: QueuedJob['status']) => {
    switch (status) {
      case 'queued': return 'secondary'
      case 'processing': return 'default'
      case 'completed': return 'default'
      case 'error': return 'destructive'
      case 'paused': return 'secondary'
      default: return 'secondary'
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Queue Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Generation Queue
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              <Badge variant="secondary">
                {jobs.filter(j => j.status === 'queued').length} queued
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-aurora-nav-muted">Total Jobs</p>
              <p className="font-semibold text-lg">{jobs.length}</p>
            </div>
            <div>
              <p className="text-aurora-nav-muted">Processing</p>
              <p className="font-semibold text-lg text-green-600">
                {jobs.filter(j => j.status === 'processing').length}
              </p>
            </div>
            <div>
              <p className="text-aurora-nav-muted">Completed</p>
              <p className="font-semibold text-lg text-blue-600">
                {jobs.filter(j => j.status === 'completed').length}
              </p>
            </div>
            <div>
              <p className="text-aurora-nav-muted">Failed</p>
              <p className="font-semibold text-lg text-red-600">
                {jobs.filter(j => j.status === 'error').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="space-y-3">
        {jobs.map((job) => (
          <Card key={job.id} className="border-l-4" style={{
            borderLeftColor: 
              job.status === 'processing' ? '#10b981' :
              job.status === 'completed' ? '#3b82f6' :
              job.status === 'error' ? '#ef4444' :
              job.status === 'paused' ? '#f59e0b' : '#6b7280'
          }}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(job.status)}
                    <h3 className="font-medium">{job.name}</h3>
                    <Badge variant={getStatusColor(job.status)} className="text-xs">
                      {job.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Priority {job.priority}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-aurora-nav-muted">Models</p>
                      <p className="font-medium">{job.modelIds.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-aurora-nav-muted">Materials</p>
                      <p className="font-medium">{job.materials.length} variants</p>
                    </div>
                    <div>
                      <p className="text-aurora-nav-muted">Created</p>
                      <p className="font-medium">{formatTimeAgo(job.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-aurora-nav-muted">Duration</p>
                      <p className="font-medium">
                        {job.estimatedDuration ? formatDuration(job.estimatedDuration) : 'Unknown'}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {job.status === 'processing' && typeof job.progress === 'number' && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>
                          {job.currentModel && job.currentMaterial && (
                            <span className="text-aurora-nav-muted">
                              {job.currentModel} ({job.currentMaterial})
                              {job.currentFrame !== undefined && job.totalFrames && (
                                <span className="ml-2">
                                  Frame {job.currentFrame + 1}/{job.totalFrames}
                                </span>
                              )}
                            </span>
                          )}
                        </span>
                        <span className="font-medium">{job.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {job.status === 'error' && job.error && (
                    <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                      {job.error}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 ml-4">
                  {job.status === 'queued' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startJob(job.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => changePriority(job.id, 'up')}
                        className="h-8 w-8 p-0"
                        disabled={job.priority === 0}
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => changePriority(job.id, 'down')}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                  
                  {job.status === 'processing' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => pauseJob(job.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Pause className="w-3 h-3" />
                    </Button>
                  )}

                  {job.status === 'paused' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startJob(job.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                  )}

                  {!['processing'].includes(job.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelJob(job.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {jobs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No jobs in queue</h3>
            <p className="mt-2 text-sm text-aurora-nav-muted">
              Start a generation from the Models tab to see jobs here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default BatchGenerationQueue