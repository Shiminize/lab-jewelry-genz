/**
 * Performance Monitor Dashboard
 * Real-time system metrics and optimization recommendations
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Progress } from '../ui/Progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs'
import { 
  Activity, 
  HardDrive, 
  MemoryStick, 
  Cpu, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  RefreshCw,
  Settings,
  Trash2
} from 'lucide-react'

interface ResourceMetrics {
  memory: {
    used: number
    free: number
    total: number
    percentage: number
    isOverLimit: boolean
  }
  disk: {
    used: number
    free: number
    total: number
    percentage: number
    isOverLimit: boolean
  }
  processes: {
    count: number
    limit: number
    isOverLimit: boolean
  }
  cpu: {
    usage: number
    load: number[]
  }
  generation: {
    activeJobs: number
    queuedJobs: number
    completedJobs: number
    failedJobs: number
  }
}

interface OptimizationRecommendation {
  type: 'memory' | 'disk' | 'process' | 'generation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  action: string
  autoFixAvailable: boolean
}

interface GenerationMetrics {
  totalJobs: number
  completedJobs: number
  failedJobs: number
  averageCompletionTime: number
  retryCount: number
  activeJobs: number
  queueSize: number
  circuitBreakerState: string
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<ResourceMetrics | null>(null)
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([])
  const [generationMetrics, setGenerationMetrics] = useState<GenerationMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/system-metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.metrics)
        setRecommendations(data.recommendations || [])
        setGenerationMetrics(data.generationMetrics)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch system metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const performOptimization = async (type: string) => {
    try {
      const response = await fetch('/api/system-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })
      
      if (response.ok) {
        await fetchMetrics() // Refresh metrics after optimization
      }
    } catch (error) {
      console.error('Optimization failed:', error)
    }
  }

  useEffect(() => {
    fetchMetrics()
    
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 30000) // Update every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-error'
      case 'high': return 'bg-warning'
      case 'medium': return 'bg-warning'
      case 'low': return 'bg-info'
      default: return 'bg-muted'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high': return <AlertTriangle className="w-4 h-4" />
      case 'medium': return <Activity className="w-4 h-4" />
      case 'low': return <CheckCircle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB'
    const k = 1024
    const sizes = ['MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-token-sm">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading system metrics...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Performance Monitor</h2>
          <p className="text-slate-600 text-sm">
            Real-time system metrics and optimization recommendations
          </p>
        </div>
        <div className="flex items-center space-x-token-sm">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-success/10 border-success/30' : ''}
          >
            <Activity className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-pulse' : ''}`} />
            {autoRefresh ? 'Live' : 'Paused'}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchMetrics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {lastUpdated && (
        <div className="text-xs text-slate-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="generation">Generation</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-token-md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Memory Usage */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory</CardTitle>
                <MemoryStick className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.memory.percentage || 0}%
                </div>
                <Progress 
                  value={metrics?.memory.percentage || 0} 
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {formatBytes(metrics?.memory.used || 0)} / {formatBytes(metrics?.memory.total || 0)}
                </p>
              </CardContent>
            </Card>

            {/* Disk Usage */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disk Space</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.disk.percentage || 0}%
                </div>
                <Progress 
                  value={metrics?.disk.percentage || 0} 
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {formatBytes(metrics?.disk.used || 0)} / {formatBytes(metrics?.disk.total || 0)}
                </p>
              </CardContent>
            </Card>

            {/* Active Processes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processes</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.processes.count || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Max: {metrics?.processes.limit || 0}
                </p>
                <Badge 
                  variant={metrics?.processes.isOverLimit ? 'destructive' : 'secondary'}
                  className="mt-2"
                >
                  {metrics?.processes.isOverLimit ? 'Over Limit' : 'Normal'}
                </Badge>
              </CardContent>
            </Card>

            {/* Generation Jobs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Generation</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.generation.activeJobs || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Active jobs
                </p>
                <div className="text-xs text-muted-foreground">
                  Queue: {metrics?.generation.queuedJobs || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-token-md">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Memory Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MemoryStick className="w-5 h-5" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-token-md">
                <div className="space-y-token-sm">
                  <div className="flex justify-between text-sm">
                    <span>Used</span>
                    <span>{formatBytes(metrics?.memory.used || 0)}</span>
                  </div>
                  <Progress value={metrics?.memory.percentage || 0} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Free: {formatBytes(metrics?.memory.free || 0)}</span>
                    <span>Total: {formatBytes(metrics?.memory.total || 0)}</span>
                  </div>
                </div>
                {metrics?.memory.isOverLimit && (
                  <Badge variant="destructive" className="w-full justify-center">
                    Memory limit exceeded
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Disk Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Disk Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-token-md">
                <div className="space-y-token-sm">
                  <div className="flex justify-between text-sm">
                    <span>Used</span>
                    <span>{formatBytes(metrics?.disk.used || 0)}</span>
                  </div>
                  <Progress value={metrics?.disk.percentage || 0} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Free: {formatBytes(metrics?.disk.free || 0)}</span>
                    <span>Total: {formatBytes(metrics?.disk.total || 0)}</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => performOptimization('disk')}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clean Up Disk Space
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="generation" className="space-y-token-md">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-token-md">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Jobs</span>
                    <span className="font-semibold">{generationMetrics?.totalJobs || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Completed</span>
                    <span className="font-semibold text-success">{generationMetrics?.completedJobs || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Failed</span>
                    <span className="font-semibold text-error">{generationMetrics?.failedJobs || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Retries</span>
                    <span className="font-semibold text-warning">{generationMetrics?.retryCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-token-md">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Completion</span>
                    <span className="font-semibold">
                      {formatDuration(generationMetrics?.averageCompletionTime || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Circuit Breaker</span>
                    <Badge variant={generationMetrics?.circuitBreakerState === 'closed' ? 'secondary' : 'destructive'}>
                      {generationMetrics?.circuitBreakerState || 'Unknown'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Success Rate</span>
                    <span className="font-semibold text-success">
                      {generationMetrics?.totalJobs ? 
                        Math.round(((generationMetrics.completedJobs || 0) / generationMetrics.totalJobs) * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-token-md">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Jobs</span>
                    <span className="font-semibold">{generationMetrics?.activeJobs || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Queue Size</span>
                    <span className="font-semibold">{generationMetrics?.queueSize || 0}</span>
                  </div>
                  <div className="text-center">
                    <Badge 
                      variant={(generationMetrics?.activeJobs || 0) > 0 ? 'default' : 'secondary'}
                      className="w-full justify-center"
                    >
                      {(generationMetrics?.activeJobs || 0) > 0 ? 'Processing' : 'Idle'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-token-md">
          <div className="space-y-token-md">
            {recommendations.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">System Running Optimally</h3>
                  <p className="text-muted-foreground">
                    No optimization recommendations at this time.
                  </p>
                </CardContent>
              </Card>
            ) : (
              recommendations.map((rec, index) => (
                <Card key={index} className="border-l-4" style={{ borderLeftColor: 'transparent' }}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(rec.severity)}
                        <CardTitle className="text-lg">{rec.message}</CardTitle>
                      </div>
                      <Badge variant="outline" className={getSeverityColor(rec.severity)}>
                        {rec.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{rec.action}</p>
                    {rec.autoFixAvailable && (
                      <Button 
                        size="sm" 
                        onClick={() => performOptimization(rec.type)}
                        className="w-full sm:w-auto"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Apply Fix
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PerformanceMonitor