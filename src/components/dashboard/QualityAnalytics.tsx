/**
 * QualityAnalytics Component
 * Performance metrics and quality analysis for 3D sequence generation
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  HardDrive,
  Clock,
  Award,
  AlertTriangle,
  RefreshCw,
  Download,
  FileImage,
  Smartphone,
  Monitor,
  Tv
} from 'lucide-react'

interface QualityMetrics {
  formatComparison: {
    format: string
    avgSize: number
    compressionRatio: number
    qualityScore: number
    loadTime: number
  }[]
  devicePerformance: {
    device: string
    tier: 'premium' | 'high' | 'standard' | 'low'
    recommendedFormat: string
    avgLoadTime: number
    memoryUsage: number
  }[]
  generationStats: {
    totalSequences: number
    totalImages: number
    totalSize: number
    avgGenerationTime: number
    successRate: number
    errorRate: number
  }
  qualityRecommendations: {
    id: string
    type: 'performance' | 'quality' | 'compatibility' | 'storage'
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
    action: string
  }[]
}

export function QualityAnalytics() {
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'formats' | 'devices' | 'recommendations'>('overview')

  // Mock data - replace with actual analytics API
  useEffect(() => {
    const mockMetrics: QualityMetrics = {
      formatComparison: [
        {
          format: 'AVIF',
          avgSize: 6.8,
          compressionRatio: 77.5,
          qualityScore: 95,
          loadTime: 1.2
        },
        {
          format: 'WebP',
          avgSize: 7.4,
          compressionRatio: 75.8,
          qualityScore: 92,
          loadTime: 0.8
        },
        {
          format: 'PNG',
          avgSize: 30.2,
          compressionRatio: 0,
          qualityScore: 100,
          loadTime: 3.2
        }
      ],
      devicePerformance: [
        {
          device: 'iPhone 15 Pro',
          tier: 'premium',
          recommendedFormat: 'AVIF',
          avgLoadTime: 0.9,
          memoryUsage: 24
        },
        {
          device: 'Samsung Galaxy S24',
          tier: 'premium',
          recommendedFormat: 'AVIF',
          avgLoadTime: 1.1,
          memoryUsage: 28
        },
        {
          device: 'iPhone 12',
          tier: 'high',
          recommendedFormat: 'WebP',
          avgLoadTime: 1.4,
          memoryUsage: 32
        },
        {
          device: 'Standard Android',
          tier: 'standard',
          recommendedFormat: 'WebP',
          avgLoadTime: 2.1,
          memoryUsage: 45
        },
        {
          device: 'Budget Device',
          tier: 'low',
          recommendedFormat: 'PNG',
          avgLoadTime: 4.2,
          memoryUsage: 78
        }
      ],
      generationStats: {
        totalSequences: 12,
        totalImages: 432,
        totalSize: 2.8 * 1024 * 1024 * 1024, // 2.8GB
        avgGenerationTime: 180, // seconds
        successRate: 98.5,
        errorRate: 1.5
      },
      qualityRecommendations: [
        {
          id: '1',
          type: 'performance',
          title: 'Enable AVIF for Premium Devices',
          description: 'AVIF format provides 77% better compression while maintaining excellent quality',
          impact: 'high',
          action: 'Set AVIF as primary format for devices with good support'
        },
        {
          id: '2',
          type: 'storage',
          title: 'Optimize PNG Fallback Usage',
          description: 'PNG is only being used by 8% of devices but consumes 65% of storage',
          impact: 'medium',
          action: 'Consider removing PNG for supported devices'
        },
        {
          id: '3',
          type: 'quality',
          title: 'Increase Rendering Resolution',
          description: 'Current 1024px resolution could be increased for premium devices',
          impact: 'medium',
          action: 'Implement dynamic resolution based on device capabilities'
        },
        {
          id: '4',
          type: 'compatibility',
          title: 'WebP Fallback Coverage',
          description: 'WebP provides good balance of quality and compatibility',
          impact: 'low',
          action: 'Ensure WebP is available for all sequences'
        }
      ]
    }

    setTimeout(() => {
      setMetrics(mockMetrics)
      setLoading(false)
    }, 800)
  }, [])

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  const getDeviceIcon = (tier: string) => {
    switch (tier) {
      case 'premium': return <Smartphone className="w-4 h-4" />
      case 'high': return <Monitor className="w-4 h-4" />
      case 'standard': return <Tv className="w-4 h-4" />
      default: return <Smartphone className="w-4 h-4" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-muted text-foreground'
    }
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'performance': return <Zap className="w-4 h-4" />
      case 'quality': return <Award className="w-4 h-4" />
      case 'storage': return <HardDrive className="w-4 h-4" />
      case 'compatibility': return <FileImage className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium text-foreground">No analytics data</h3>
        <p className="mt-2 text-sm text-aurora-nav-muted">
          Generate some sequences to see quality analytics
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Quality Analytics</h2>
          <p className="text-aurora-nav-muted">Performance metrics and optimization insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'formats', label: 'Format Analysis', icon: FileImage },
            { id: 'devices', label: 'Device Performance', icon: Smartphone },
            { id: 'recommendations', label: 'Recommendations', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-aurora-nav-muted hover:text-foreground hover:border-border'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FileImage className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-aurora-nav-muted">Total Images</p>
                  <p className="text-2xl font-bold text-foreground">{metrics.generationStats.totalImages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <HardDrive className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-aurora-nav-muted">Total Size</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatFileSize(metrics.generationStats.totalSize)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-aurora-nav-muted">Avg Gen Time</p>
                  <p className="text-2xl font-bold text-foreground">
                    {Math.round(metrics.generationStats.avgGenerationTime / 60)}m
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-aurora-nav-muted">Success Rate</p>
                  <p className="text-2xl font-bold text-foreground">
                    {metrics.generationStats.successRate}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Format Analysis Tab */}
      {selectedTab === 'formats' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Format Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.formatComparison.map((format) => (
                  <div key={format.format} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-lg">{format.format}</h4>
                      <Badge variant="outline">
                        Quality: {format.qualityScore}%
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-aurora-nav-muted">Avg File Size</p>
                        <p className="font-medium">{format.avgSize} KB</p>
                      </div>
                      <div>
                        <p className="text-aurora-nav-muted">Compression</p>
                        <p className="font-medium">{format.compressionRatio}%</p>
                      </div>
                      <div>
                        <p className="text-aurora-nav-muted">Load Time</p>
                        <p className="font-medium">{format.loadTime}s</p>
                      </div>
                      <div>
                        <p className="text-aurora-nav-muted">Quality Score</p>
                        <p className="font-medium">{format.qualityScore}/100</p>
                      </div>
                    </div>

                    {/* Compression Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-aurora-nav-muted mb-1">
                        <span>Compression Ratio</span>
                        <span>{format.compressionRatio}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${format.compressionRatio}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Device Performance Tab */}
      {selectedTab === 'devices' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Device Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.devicePerformance.map((device, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getDeviceIcon(device.tier)}
                        <div>
                          <h4 className="font-medium">{device.device}</h4>
                          <Badge variant="outline" className="text-xs">
                            {device.tier} tier
                          </Badge>
                        </div>
                      </div>
                      <Badge>
                        {device.recommendedFormat}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-aurora-nav-muted">Load Time</p>
                        <p className="font-medium">{device.avgLoadTime}s</p>
                      </div>
                      <div>
                        <p className="text-aurora-nav-muted">Memory Usage</p>
                        <p className="font-medium">{device.memoryUsage} MB</p>
                      </div>
                      <div>
                        <p className="text-aurora-nav-muted">Recommended</p>
                        <p className="font-medium">{device.recommendedFormat}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommendations Tab */}
      {selectedTab === 'recommendations' && (
        <div className="space-y-4">
          {metrics.qualityRecommendations.map((rec) => (
            <Card key={rec.id}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getRecommendationIcon(rec.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">{rec.title}</h4>
                      <Badge className={getImpactColor(rec.impact)}>
                        {rec.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-aurora-nav-muted mb-3">{rec.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600">{rec.action}</p>
                      <Button size="sm" variant="outline">
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}