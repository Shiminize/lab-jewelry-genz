/**
 * ModelLibrary Component
 * Manages GLB model files with upload, preview, and selection functionality
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import ModelUpload from './ModelUpload'
import { 
  Upload, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  CheckSquare,
  Square,
  FileIcon,
  AlertCircle,
  FolderOpen,
  Plus
} from 'lucide-react'

interface GLBModel {
  id: string
  name: string
  fileName: string
  size: number
  lastModified: Date
  hasSequences: boolean
  sequenceCount: number
  thumbnail?: string
  metadata?: {
    description?: string
    category?: string
    tags?: string[]
  }
}

interface ModelLibraryProps {
  onModelsSelected: (modelIds: string[]) => void
  selectedModels: string[]
  isGenerating: boolean
}

export function ModelLibrary({ 
  onModelsSelected, 
  selectedModels, 
  isGenerating 
}: ModelLibraryProps) {
  const [models, setModels] = useState<GLBModel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [isDragOver, setIsDragOver] = useState(false)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockModels: GLBModel[] = [
      {
        id: 'Black_Stone_Ring',
        name: 'Black Stone Ring',
        fileName: 'Black_Stone_Ring.glb',
        size: 2.4 * 1024 * 1024, // 2.4MB
        lastModified: new Date('2024-08-14'),
        hasSequences: true,
        sequenceCount: 144, // 36 frames × 4 materials
        metadata: {
          description: 'Elegant black stone ring with premium finish',
          category: 'rings',
          tags: ['stone', 'elegant', 'premium']
        }
      },
      {
        id: 'Ringmodel',
        name: 'Ring Model',
        fileName: 'Ringmodel.glb',
        size: 1.8 * 1024 * 1024,
        lastModified: new Date('2024-08-10'),
        hasSequences: false,
        sequenceCount: 0,
        metadata: {
          description: 'Basic ring model template',
          category: 'rings',
          tags: ['basic', 'template']
        }
      },
      {
        id: 'doji_diamond_ring',
        name: 'Doji Diamond Ring',
        fileName: 'doji_diamond_ring.glb',
        size: 3.2 * 1024 * 1024,
        lastModified: new Date('2024-08-12'),
        hasSequences: true,
        sequenceCount: 36, // Partial sequences
        metadata: {
          description: 'Doji style diamond ring with intricate details',
          category: 'rings',
          tags: ['diamond', 'doji', 'intricate']
        }
      },
      {
        id: 'toy_car',
        name: 'Toy Car',
        fileName: 'toy_car.glb',
        size: 0.9 * 1024 * 1024,
        lastModified: new Date('2024-08-08'),
        hasSequences: false,
        sequenceCount: 0,
        metadata: {
          description: 'Test model - toy car for development',
          category: 'test',
          tags: ['test', 'demo']
        }
      }
    ]
    
    setTimeout(() => {
      setModels(mockModels)
      setLoading(false)
    }, 500)
  }, [])

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || model.metadata?.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleModelToggle = (modelId: string) => {
    if (isGenerating) return
    
    const newSelection = selectedModels.includes(modelId)
      ? selectedModels.filter(id => id !== modelId)
      : [...selectedModels, modelId]
    
    onModelsSelected(newSelection)
  }

  const handleSelectAll = () => {
    if (isGenerating) return
    
    if (selectedModels.length === filteredModels.length) {
      onModelsSelected([])
    } else {
      onModelsSelected(filteredModels.map(model => model.id))
    }
  }

  const handleFileUpload = useCallback((files: FileList) => {
    // TODO: Implement file upload functionality
    Array.from(files).forEach(file => {
      if (file.name.endsWith('.glb')) {
        console.log('Uploading GLB file:', file.name)
        // Add file upload logic here
      }
    })
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileUpload(e.dataTransfer.files)
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getSequenceStatus = (model: GLBModel) => {
    if (!model.hasSequences) return { color: 'bg-muted text-aurora-nav-muted', text: 'No sequences' }
    if (model.sequenceCount < 144) return { color: 'bg-yellow-100 text-yellow-600', text: 'Partial' }
    return { color: 'bg-green-100 text-green-600', text: 'Complete' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const handleFilesUploaded = (fileNames: string[]) => {
    // Refresh the model list after upload
    // TODO: Implement proper refresh from API
    console.log('Files uploaded:', fileNames)
  }

  return (
    <div className="space-y-6">
      {/* Model Management Tabs */}
      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="library" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Model Library
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Upload Models
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <ModelUpload 
            onFilesUploaded={handleFilesUploaded}
            isGenerating={isGenerating}
          />
        </TabsContent>

        <TabsContent value="library" className="mt-6 space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search models..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                <option value="rings">Rings</option>
                <option value="necklaces">Necklaces</option>
                <option value="test">Test Models</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={isGenerating || filteredModels.length === 0}
              >
                {selectedModels.length === filteredModels.length ? (
                  <CheckSquare className="w-4 h-4 mr-2" />
                ) : (
                  <Square className="w-4 h-4 mr-2" />
                )}
                Select All ({filteredModels.length})
              </Button>
            </div>
          </div>

          {/* Models Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredModels.map((model) => {
          const isSelected = selectedModels.includes(model.id)
          const sequenceStatus = getSequenceStatus(model)
          
          return (
            <Card 
              key={model.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleModelToggle(model.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-medium truncate">
                      {model.name}
                    </CardTitle>
                    <p className="text-sm text-aurora-nav-muted truncate">
                      {model.fileName}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Model Preview Placeholder */}
                <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                  <FileIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                
                {/* Model Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-aurora-nav-muted">Size:</span>
                    <span>{formatFileSize(model.size)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-aurora-nav-muted">Sequences:</span>
                    <Badge className={`${sequenceStatus.color} text-xs`}>
                      {sequenceStatus.text}
                    </Badge>
                  </div>
                  
                  {model.sequenceCount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-aurora-nav-muted">Images:</span>
                      <span>{model.sequenceCount}</span>
                    </div>
                  )}
                  
                  {model.metadata?.tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {model.metadata.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {model.metadata.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{model.metadata.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredModels.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No models found</h3>
          <p className="mt-2 text-sm text-aurora-nav-muted">
            {searchTerm || filterCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Upload GLB files to get started'
            }
          </p>
        </div>
      )}

      {/* Selection Summary */}
      {selectedModels.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-background rounded-lg shadow-lg border p-4 min-w-[300px]">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-foreground">
                {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} selected
              </h4>
              <p className="text-sm text-aurora-nav-muted">
                Will generate {selectedModels.length * 4} material variants
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onModelsSelected([])}
              disabled={isGenerating}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
        </TabsContent>
      </Tabs>
    </div>
  )
}