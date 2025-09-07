/**
 * SequencePreview Component
 * Preview generated 3D sequences with interactive viewer
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  RotateCcw,
  Search,
  Eye,
  Download,
  Settings,
  Grid3X3,
  List,
  Filter
} from 'lucide-react'

interface SequenceData {
  id: string
  modelName: string
  material: string
  frameCount: number
  formats: string[]
  totalSize: number
  lastGenerated: Date
  status: 'complete' | 'partial' | 'missing'
}

interface SequencePreviewProps {
  selectedModels: string[]
}

export function SequencePreview({ selectedModels }: SequencePreviewProps) {
  const [sequences, setSequences] = useState<SequenceData[]>([])
  const [selectedSequence, setSelectedSequence] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [selectedFormat, setSelectedFormat] = useState<'avif' | 'webp' | 'png'>('avif')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'partial' | 'missing'>('all')
  const [imageError, setImageError] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Load actual sequences from file system
  useEffect(() => {
    const loadSequences = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/sequences')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const rawSequences = await response.json()
        
        // Convert ISO date strings back to Date objects
        const actualSequences = rawSequences.map((seq: any) => ({
          ...seq,
          lastGenerated: new Date(seq.lastGenerated)
        }))
        
        setSequences(actualSequences)
        setSelectedSequence(actualSequences[0]?.id || null)
      } catch (error) {
        console.error('Failed to load sequences:', error)
        // Fallback to updated mock data with correct paths
        const mockSequences: SequenceData[] = [
          {
            id: 'Black_Stone_Ring-platinum',
            modelName: 'Black Stone Ring',
            material: 'Platinum',
            frameCount: 12,
            formats: ['avif', 'webp', 'png'],
            totalSize: 1.2 * 1024 * 1024,
            lastGenerated: new Date('2024-08-14'),
            status: 'complete'
          },
          {
            id: 'Black_Stone_Ring-rose-gold',
            modelName: 'Black Stone Ring',
            material: 'Rose Gold',
            frameCount: 0,
            formats: [],
            totalSize: 0,
            lastGenerated: new Date('2024-08-14'),
            status: 'missing'
          },
          {
            id: 'Black_Stone_Ring-white-gold',
            modelName: 'Black Stone Ring',
            material: 'White Gold',
            frameCount: 0,
            formats: [],
            totalSize: 0,
            lastGenerated: new Date('2024-08-14'),
            status: 'missing'
          },
          {
            id: 'Black_Stone_Ring-yellow-gold',
            modelName: 'Black Stone Ring',
            material: 'Yellow Gold',
            frameCount: 0,
            formats: [],
            totalSize: 0,
            lastGenerated: new Date('2024-08-14'),
            status: 'missing'
          }
        ]
        
        setSequences(mockSequences)
        setSelectedSequence(mockSequences[0]?.id || null)
      } finally {
        setIsLoading(false)
      }
    }

    loadSequences()
  }, [])

  // Auto-play animation
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && selectedSequence) {
      const sequence = sequences.find(s => s.id === selectedSequence)
      if (sequence && sequence.frameCount > 0) {
        interval = setInterval(() => {
          setCurrentFrame(prev => (prev + 1) % sequence.frameCount)
        }, 100) // 10 FPS
      }
    }
    return () => clearInterval(interval)
  }, [isPlaying, selectedSequence, sequences])

  // Reset image error when frame or format changes
  useEffect(() => {
    setImageError(false)
  }, [currentFrame, selectedFormat, selectedSequence])

  const selectedSequenceData = sequences.find(s => s.id === selectedSequence)

  const filteredSequences = sequences.filter(sequence => {
    const matchesSearch = sequence.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sequence.material.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || sequence.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800'
      case 'partial': return 'bg-yellow-100 text-yellow-800'
      case 'missing': return 'bg-red-100 text-red-800'
      default: return 'bg-muted text-foreground'
    }
  }

  const getCurrentImageUrl = () => {
    if (!selectedSequenceData || selectedSequenceData.frameCount === 0) return null
    
    // Use actual file structure: /images/products/3d-sequences/{id}/{frame}.{format}
    const basePath = `/images/products/3d-sequences/${selectedSequenceData.id}`
    return `${basePath}/${currentFrame}.${selectedFormat}`
  }

  const getAvailableFormats = () => {
    if (!selectedSequenceData) return []
    return selectedSequenceData.formats.filter(format => ['avif', 'webp', 'png'].includes(format))
  }
  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return 'Unknown'
    
    try {
      // Handle both Date objects and ISO strings
      const dateObj = date instanceof Date ? date : new Date(date)
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date'
      }
      
      return dateObj.toLocaleDateString()
    } catch (error) {
      console.warn('Error formatting date:', error)
      return 'Unknown'
    }
  }

  const handleImageError = () => {
    setImageError(true)
    // Try fallback formats
    const availableFormats = getAvailableFormats()
    const currentIndex = availableFormats.indexOf(selectedFormat)
    
    if (currentIndex < availableFormats.length - 1) {
      // Try next available format
      setSelectedFormat(availableFormats[currentIndex + 1] as 'avif' | 'webp' | 'png')
    }
  }

  const handleFrameSeek = (frame: number) => {
    if (selectedSequenceData) {
      setCurrentFrame(Math.max(0, Math.min(frame, selectedSequenceData.frameCount - 1)))
    }
  }

  const renderImagePreview = () => {
    if (!selectedSequenceData) {
      return (
        <div className="flex items-center justify-center h-96 bg-muted rounded-token-lg">
          <div className="text-center">
            <div className="text-muted-foreground mb-2">📱</div>
            <p className="text-aurora-nav-muted">No sequence selected</p>
          </div>
        </div>
      )
    }

    if (selectedSequenceData.frameCount === 0) {
      return (
        <div className="flex items-center justify-center h-96 bg-muted rounded-token-lg">
          <div className="text-center">
            <div className="text-muted-foreground mb-2">🚫</div>
            <p className="text-aurora-nav-muted">No images available</p>
            <p className="text-sm text-muted-foreground mt-1">Generate sequences to view preview</p>
          </div>
        </div>
      )
    }

    const imageUrl = getCurrentImageUrl()
    
    if (!imageUrl || imageError) {
      return (
        <div className="flex items-center justify-center h-96 bg-muted rounded-token-lg">
          <div className="text-center">
            <div className="text-muted-foreground mb-2">⚠️</div>
            <p className="text-aurora-nav-muted">Image not found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {imageUrl ? `${imageUrl}` : 'No image URL available'}
            </p>
            {getAvailableFormats().length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Available formats: {getAvailableFormats().join(', ')}
              </p>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="relative h-96 bg-muted rounded-token-lg overflow-hidden">
        <img
          src={imageUrl}
          alt={`${selectedSequenceData.modelName} - ${selectedSequenceData.material} - Frame ${currentFrame}`}
          className="w-full h-full object-contain"
          onError={handleImageError}
          onLoad={() => setImageError(false)}
        />
        {isPlaying && (
          <div className="absolute top-4 right-4 bg-foreground text-background px-2 py-1 rounded text-sm">
            Playing
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Sequence List */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Sequences</CardTitle>
              <div className="flex items-center space-x-token-sm">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-token-md">
            {/* Search and Filter */}
            <div className="space-y-token-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search sequences..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-token-md text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="complete">Complete</option>
                <option value="partial">Partial</option>
                <option value="missing">Missing</option>
              </select>
            </div>

            {/* Sequence Items */}
            <div className={`space-y-token-sm ${viewMode === 'grid' ? 'grid grid-cols-1 gap-2' : ''}`}>
              {filteredSequences.map((sequence) => (
                <div
                  key={sequence.id}
                  className={`p-3 rounded-token-lg border cursor-pointer transition-all hover:shadow-sm ${
                    selectedSequence === sequence.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-border bg-background'
                  }`}
                  onClick={() => setSelectedSequence(sequence.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{sequence.modelName}</h4>
                      <p className="text-xs text-aurora-nav-muted">{sequence.material}</p>
                    </div>
                    <Badge className={`${getStatusColor(sequence.status)} text-xs`}>
                      {sequence.status}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-aurora-nav-muted space-y-1">
                    <div className="flex justify-between">
                      <span>Frames:</span>
                      <span>{sequence.frameCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{formatFileSize(sequence.totalSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Formats:</span>
                      <span>{sequence.formats.join(', ') || 'None'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredSequences.length === 0 && (
              <div className="text-center py-8">
                <Filter className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-aurora-nav-muted mt-2">No sequences found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Area */}
      <div className="lg:col-span-2">
        {selectedSequenceData ? (
          <div className="space-y-token-md">
            
            {/* Preview Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {selectedSequenceData.modelName} - {selectedSequenceData.material}
                  </CardTitle>
                  <div className="flex items-center space-x-token-sm">
                    <Badge className={getStatusColor(selectedSequenceData.status)}>
                      {selectedSequenceData.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {selectedSequenceData.frameCount > 0 ? (
                  <div className="space-y-token-md">
                    {/* Image Preview */}
                    {renderImagePreview()}
                    
                    {/* Frame Counter - shown separately for better positioning */}
                    {selectedSequenceData.frameCount > 0 && (
                      <div className="text-center text-sm text-aurora-nav-muted">
                        Frame {currentFrame + 1} of {selectedSequenceData.frameCount}
                      </div>
                    )}

                    {/* Format Selector */}
                    <div className="flex items-center space-x-token-sm">
                      <span className="text-sm font-medium">Format:</span>
                      {(['avif', 'webp', 'png'] as const).map((format) => (
                        <Button
                          key={format}
                          size="sm"
                          variant={selectedFormat === format ? 'default' : 'outline'}
                          onClick={() => setSelectedFormat(format)}
                          disabled={!selectedSequenceData.formats.includes(format)}
                          className="text-xs"
                        >
                          {format.toUpperCase()}
                        </Button>
                      ))}
                    </div>

                    {/* Controls */}
                    <div className="space-y-3">
                      {/* Play Controls */}
                      <div className="flex items-center justify-center space-x-token-sm">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFrameSeek(0)}
                        >
                          <SkipBack className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFrameSeek(selectedSequenceData.frameCount - 1)}
                        >
                          <SkipForward className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCurrentFrame(0)
                            setIsPlaying(false)
                          }}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Frame Scrubber */}
                      <div className="space-y-token-sm">
                        <input
                          type="range"
                          min="0"
                          max={selectedSequenceData.frameCount - 1}
                          value={currentFrame}
                          onChange={(e) => handleFrameSeek(parseInt(e.target.value))}
                          className="w-full h-2 bg-muted rounded-token-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-aurora-nav-muted">
                          <span>0°</span>
                          <span>180°</span>
                          <span>360°</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square bg-muted rounded-token-lg flex items-center justify-center">
                    <div className="text-center">
                      <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium text-foreground">Sequence Not Generated</h3>
                      <p className="mt-2 text-sm text-aurora-nav-muted">
                        This sequence needs to be generated first
                      </p>
                      <Button className="mt-4" size="sm">
                        Generate Sequence
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sequence Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sequence Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-aurora-nav-muted">Total Frames</p>
                    <p className="font-medium">{selectedSequenceData.frameCount}</p>
                  </div>
                  <div>
                    <p className="text-aurora-nav-muted">Total Size</p>
                    <p className="font-medium">{formatFileSize(selectedSequenceData.totalSize)}</p>
                  </div>
                  <div>
                    <p className="text-aurora-nav-muted">Available Formats</p>
                    <p className="font-medium">{selectedSequenceData.formats.join(', ') || 'None'}</p>
                  </div>
                  <div>
                    <p className="text-aurora-nav-muted">Last Generated</p>
                    <p className="font-medium">{formatDate(selectedSequenceData.lastGenerated)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <Eye className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No sequence selected</h3>
            <p className="mt-2 text-sm text-aurora-nav-muted">
              Select a sequence from the list to preview it
            </p>
          </div>
        )}
      </div>
    </div>
  )
}