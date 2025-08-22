/**
 * Visual Testing Dashboard Component
 * Real-time monitoring and management of visual regression tests
 * Displays test results, screenshots, and performance metrics
 */

'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { 
  PlayCircle, 
  PauseCircle, 
  RotateCcw, 
  Camera, 
  BarChart3, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Clock,
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  TrendingUp,
  Download,
  Settings
} from 'lucide-react'

interface TestResult {
  id: string
  name: string
  status: 'passed' | 'failed' | 'running' | 'pending'
  browser: string
  viewport: string
  duration: number
  screenshot?: string
  error?: string
  timestamp: Date
}

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  threshold: number
  status: 'good' | 'warning' | 'error'
}

export function VisualTestingDashboard() {
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([])
  const [selectedBrowser, setSelectedBrowser] = useState<string>('all')
  const [selectedViewport, setSelectedViewport] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'performance' | 'screenshots'>('overview')

  // Mock data for demonstration
  useEffect(() => {
    const mockResults: TestResult[] = [
      {
        id: '1',
        name: 'Material switching visual states',
        status: 'passed',
        browser: 'chromium',
        viewport: 'desktop',
        duration: 2.3,
        timestamp: new Date()
      },
      {
        id: '2', 
        name: 'Mobile touch controls layout',
        status: 'failed',
        browser: 'webkit',
        viewport: 'mobile',
        duration: 1.8,
        error: 'Screenshot mismatch: 0.4% difference detected',
        timestamp: new Date()
      },
      {
        id: '3',
        name: 'Loading states consistency',
        status: 'running',
        browser: 'firefox',
        viewport: 'tablet',
        duration: 0,
        timestamp: new Date()
      }
    ]

    const mockMetrics: PerformanceMetric[] = [
      { name: 'Material Switch Time', value: 85, unit: 'ms', threshold: 100, status: 'good' },
      { name: 'Initial Load Time', value: 2.4, unit: 's', threshold: 3.0, status: 'good' },
      { name: 'Memory Usage', value: 45, unit: 'MB', threshold: 50, status: 'good' },
      { name: 'Screenshot Size', value: 1.2, unit: 'MB', threshold: 2.0, status: 'good' },
      { name: 'Test Coverage', value: 87, unit: '%', threshold: 80, status: 'good' },
      { name: 'Visual Regression', value: 2, unit: 'issues', threshold: 0, status: 'warning' }
    ]

    setTestResults(mockResults)
    setPerformanceMetrics(mockMetrics)
  }, [])

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />
      case 'running': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
  }

  const getViewportIcon = (viewport: string) => {
    switch (viewport) {
      case 'mobile': return <Smartphone className="w-4 h-4" />
      case 'tablet': return <Tablet className="w-4 h-4" />
      case 'desktop': return <Monitor className="w-4 h-4" />
      default: return <Monitor className="w-4 h-4" />
    }
  }

  const getMetricStatusColor = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  const filteredResults = testResults.filter(result => {
    const browserMatch = selectedBrowser === 'all' || result.browser === selectedBrowser
    const viewportMatch = selectedViewport === 'all' || result.viewport === selectedViewport
    return browserMatch && viewportMatch
  })

  const stats = {
    total: testResults.length,
    passed: testResults.filter(r => r.status === 'passed').length,
    failed: testResults.filter(r => r.status === 'failed').length,
    running: testResults.filter(r => r.status === 'running').length
  }

  const handleRunTests = async () => {
    setIsRunning(true)
    
    // Simulate test execution
    setTimeout(() => {
      setIsRunning(false)
      // Update results would happen here
    }, 5000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Visual Testing Dashboard
              </h1>
              <p className="text-slate-600">
                3D Customizer Visual Regression & Performance Monitoring
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleRunTests}
                disabled={isRunning}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isRunning ? (
                  <>
                    <PauseCircle className="w-4 h-4 mr-2" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Run Tests
                  </>
                )}
              </Button>
              
              <Button variant="ghost">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Total Tests</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Passed</p>
                <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Running</p>
                <p className="text-2xl font-bold text-blue-600">{stats.running}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-xl mb-8">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'tests', name: 'Test Results', icon: CheckCircle },
                { id: 'performance', name: 'Performance', icon: TrendingUp },
                { id: 'screenshots', name: 'Screenshots', icon: Camera }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Performance Metrics */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Performance Metrics</h3>
                    <div className="space-y-3">
                      {performanceMetrics.map((metric, index) => (
                        <div key={index} className={cn(
                          'flex items-center justify-between p-4 rounded-lg border',
                          getMetricStatusColor(metric.status)
                        )}>
                          <div>
                            <p className="font-medium">{metric.name}</p>
                            <p className="text-sm opacity-75">{metric.value} {metric.unit}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm opacity-75">Threshold</p>
                            <p className="font-medium">{metric.threshold} {metric.unit}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Test Activity */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {testResults.slice(0, 5).map((result) => (
                        <div key={result.id} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                          {getStatusIcon(result.status)}
                          <div className="flex-1">
                            <p className="font-medium text-slate-800">{result.name}</p>
                            <p className="text-sm text-slate-600">
                              {result.browser} • {result.viewport} • {result.duration}s
                            </p>
                          </div>
                          <span className="text-xs text-slate-500">
                            {result.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Test Results Tab */}
            {activeTab === 'tests' && (
              <div className="space-y-6">
                
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">
                  <select
                    value={selectedBrowser}
                    onChange={(e) => setSelectedBrowser(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="all">All Browsers</option>
                    <option value="chromium">Chromium</option>
                    <option value="webkit">WebKit</option>
                    <option value="firefox">Firefox</option>
                  </select>
                  
                  <select
                    value={selectedViewport}
                    onChange={(e) => setSelectedViewport(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="all">All Viewports</option>
                    <option value="mobile">Mobile</option>
                    <option value="tablet">Tablet</option>
                    <option value="desktop">Desktop</option>
                  </select>
                  
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Results
                  </Button>
                </div>

                {/* Test Results Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Test Name</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Browser</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Viewport</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Duration</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResults.map((result) => (
                        <tr key={result.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(result.status)}
                              <span className="text-sm capitalize">{result.status}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-slate-800">{result.name}</p>
                              {result.error && (
                                <p className="text-sm text-red-600 mt-1">{result.error}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="capitalize">{result.browser}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              {getViewportIcon(result.viewport)}
                              <span className="capitalize">{result.viewport}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {result.duration > 0 ? `${result.duration}s` : '-'}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {performanceMetrics.map((metric, index) => (
                    <div key={index} className="bg-slate-50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-slate-800">{metric.name}</h4>
                        <div className={cn(
                          'w-3 h-3 rounded-full',
                          metric.status === 'good' ? 'bg-green-500' :
                          metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        )} />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold text-slate-800">
                            {metric.value}
                          </span>
                          <span className="text-slate-600">{metric.unit}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-slate-500">Threshold:</span>
                          <span className="text-slate-600">{metric.threshold} {metric.unit}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Screenshots Tab */}
            {activeTab === 'screenshots' && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <Camera className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">Screenshots Coming Soon</h3>
                  <p className="text-slate-500">
                    Visual regression screenshots will be displayed here after test execution.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}