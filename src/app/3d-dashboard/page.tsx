/**
 * 3D Sequence Generator Dashboard
 * Comprehensive interface for managing GLB models and generating 3D image sequences
 */

'use client'

import React, { useState, useEffect } from 'react'
import { ModelLibrary } from '@/components/dashboard/ModelLibrary'
import { GenerationQueue } from '@/components/dashboard/GenerationQueue'
import SetupConfiguration from '@/components/dashboard/SetupConfiguration'
import { QualityAnalytics } from '@/components/dashboard/QualityAnalytics'
import { SequencePreview } from '@/components/dashboard/SequencePreview'
import { PerformanceMonitor } from '@/components/dashboard/PerformanceMonitor'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { Play, Pause, Settings, BarChart3, Folder, Palette, Wifi, WifiOff, Activity } from 'lucide-react'
import useWebSocket from '@/hooks/useWebSocket'

interface DashboardState {
  isGenerating: boolean
  totalModels: number
  processedModels: number
  currentModel: string | null
  currentMaterial: string | null
  currentFrame: number | null
  totalFrames: number | null
  queueSize: number
  activeJobId: string | null
}

export default function Dashboard3D() {
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    isGenerating: false,
    totalModels: 0,
    processedModels: 0,
    currentModel: null,
    currentMaterial: null,
    currentFrame: null,
    totalFrames: null,
    queueSize: 0,
    activeJobId: null
  })

  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('setup')

  // WebSocket connection for real-time updates
  const { isConnected, joinJobRoom, leaveJobRoom, jobProgress } = useWebSocket()

  // Monitor job progress updates from WebSocket
  useEffect(() => {
    const activeJobId = dashboardState.activeJobId
    if (activeJobId && jobProgress.has(activeJobId)) {
      const progress = jobProgress.get(activeJobId)!
      
      setDashboardState(prev => ({
        ...prev,
        isGenerating: progress.status === 'processing',
        processedModels: progress.processedModels || 0,
        totalModels: progress.totalModels || prev.totalModels,
        currentModel: progress.currentModel || null,
        currentMaterial: progress.currentMaterial || null,
        currentFrame: progress.currentFrame || null,
        totalFrames: progress.totalFrames || null
      }))

      // Auto-switch to queue tab when generation completes
      if (progress.status === 'completed' && activeTab !== 'queue') {
        setActiveTab('queue')
      }
    }
  }, [jobProgress, dashboardState.activeJobId, activeTab])

  const handleStartGeneration = async () => {
    if (selectedModels.length === 0) return

    try {
      // Start generation via API
      const response = await fetch('/api/3d-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          modelIds: selectedModels,
          materials: ['platinum', 'white-gold', 'yellow-gold', 'rose-gold']
        })
      })

      if (!response.ok) throw new Error('Failed to start generation')
      
      const data = await response.json()
      const jobId = data.jobId

      // Update dashboard state
      setDashboardState(prev => ({
        ...prev,
        isGenerating: true,
        totalModels: selectedModels.length * 4, // 4 materials per model
        processedModels: 0,
        currentModel: selectedModels[0] || null,
        activeJobId: jobId
      }))

      // Join WebSocket room for real-time updates
      joinJobRoom(jobId)
      console.log(`🚀 Started generation job: ${jobId}`)

    } catch (error) {
      console.error('Failed to start generation:', error)
      alert('Failed to start generation. Please try again.')
    }
  }

  const handleStopGeneration = async () => {
    const jobId = dashboardState.activeJobId
    if (!jobId) return

    try {
      // Stop generation via API
      const response = await fetch(`/api/3d-generator?jobId=${jobId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to stop generation')

      // Leave WebSocket room
      leaveJobRoom(jobId)

      // Update dashboard state
      setDashboardState(prev => ({
        ...prev,
        isGenerating: false,
        currentModel: null,
        currentMaterial: null,
        currentFrame: null,
        totalFrames: null,
        activeJobId: null
      }))

      console.log(`⏹️ Stopped generation job: ${jobId}`)

    } catch (error) {
      console.error('Failed to stop generation:', error)
      alert('Failed to stop generation. Please try again.')
    }
  }

  const getOverallProgress = () => {
    if (dashboardState.totalModels === 0) return 0
    return Math.round((dashboardState.processedModels / dashboardState.totalModels) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">3D Sequence Generator</h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">
              Generate high-quality image sequences from GLB models
            </p>
            {/* Contextual Help */}
            <div className="mt-2 text-xs text-slate-500">
              💡 <strong>Getting started:</strong> 
              {activeTab === 'setup' && ' Configure material properties like metallic and roughness values'}
              {activeTab === 'models' && ' Upload your GLB models and select which ones to process'}
              {activeTab === 'preview' && ' View your generated 3D sequences with 360° rotation'}
              {activeTab === 'analytics' && ' Review quality metrics and optimization recommendations'}
              {activeTab === 'queue' && ' Monitor real-time generation progress and system status'}
              {activeTab === 'performance' && ' Monitor system resources and apply optimizations'}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <Badge 
                variant={dashboardState.isGenerating ? 'default' : 'secondary'}
                className="text-sm px-3 py-1"
              >
                {dashboardState.isGenerating ? '🔄 Generating' : '✅ Ready'}
              </Badge>
              
              <Badge 
                variant={isConnected ? 'secondary' : 'destructive'}
                className="text-xs px-2 py-1 flex items-center gap-1"
              >
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3" />
                    <span className="hidden sm:inline">Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" />
                    <span className="hidden sm:inline">Offline</span>
                  </>
                )}
              </Badge>
            </div>
            
            {dashboardState.isGenerating ? (
              <Button 
                onClick={handleStopGeneration} 
                variant="outline"
                size="lg"
                className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all border-red-500 text-red-600 hover:bg-red-600 hover:text-white w-full sm:w-auto"
              >
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Stop Generation
              </Button>
            ) : (
              <Button 
                onClick={handleStartGeneration} 
                disabled={selectedModels.length === 0}
                variant="primary"
                size="lg"
                className="px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="hidden sm:inline">
                  {selectedModels.length === 0 
                    ? 'Select Models to Start' 
                    : `Start Generation (${selectedModels.length} models)`
                  }
                </span>
                <span className="sm:hidden">
                  {selectedModels.length === 0 ? 'Select Models' : `Start (${selectedModels.length})`}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Progress Overview */}
        {dashboardState.isGenerating && (
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-lg font-semibold text-blue-900">
                    Generation in Progress
                  </span>
                  <p className="text-sm text-blue-700 mt-1">
                    Creating high-quality 3D sequences for your jewelry models
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-800">
                    {getOverallProgress()}%
                  </span>
                  <p className="text-sm text-blue-600">
                    {dashboardState.processedModels} of {dashboardState.totalModels} sequences
                  </p>
                </div>
              </div>
              
              <div className="w-full bg-blue-200 rounded-full h-3 mb-4 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${getOverallProgress()}%` }}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  {dashboardState.currentModel && (
                    <p className="text-blue-700 font-medium">
                      🔄 <span className="font-semibold">{dashboardState.currentModel}</span>
                      {dashboardState.currentMaterial && (
                        <span className="text-blue-600 ml-1">({dashboardState.currentMaterial})</span>
                      )}
                    </p>
                  )}
                  {dashboardState.currentFrame !== null && dashboardState.totalFrames && (
                    <p className="text-blue-600 text-xs">
                      Frame {dashboardState.currentFrame + 1}/{dashboardState.totalFrames}
                    </p>
                  )}
                </div>
                <p className="text-blue-600 text-xs sm:text-sm">
                  ⏱️ Est. completion: {Math.ceil((dashboardState.totalModels - dashboardState.processedModels) * 2 / 60)} min
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-6 bg-white shadow-sm border">
            <TabsTrigger value="setup" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="sm:hidden">Setup</span>
              <span className="hidden sm:inline">Material Setup</span>
            </TabsTrigger>
            <TabsTrigger value="models" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
              <Folder className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="sm:hidden">Models</span>
              <span className="hidden sm:inline">Upload Models</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
              <Play className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="sm:hidden">Preview</span>
              <span className="hidden sm:inline">Preview Results</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="sm:hidden">Stats</span>
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="queue" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
              <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="sm:hidden">Queue</span>
              <span className="hidden sm:inline">Live Queue</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="sm:hidden">Perf</span>
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="mt-6">
            <SetupConfiguration isGenerating={dashboardState.isGenerating} />
          </TabsContent>

          <TabsContent value="models" className="mt-6">
            <ModelLibrary 
              onModelsSelected={setSelectedModels}
              selectedModels={selectedModels}
              isGenerating={dashboardState.isGenerating}
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <SequencePreview selectedModels={selectedModels} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <QualityAnalytics />
          </TabsContent>

          <TabsContent value="queue" className="mt-6">
            <GenerationQueue 
              isGenerating={dashboardState.isGenerating}
              currentModel={dashboardState.currentModel}
              processedModels={dashboardState.processedModels}
              totalModels={dashboardState.totalModels}
            />
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <PerformanceMonitor />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  )
}