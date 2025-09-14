/**
 * Model Upload Component
 * Handles GLB file uploads and validation for the 3D dashboard
 */

'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { 
  Upload, 
  X, 
  FileCheck, 
  AlertCircle, 
  Loader2,
  Folder,
  Plus
} from 'lucide-react'

interface UploadedFile {
  file: File
  id: string
  status: 'uploading' | 'success' | 'error'
  errorMessage?: string
  uploadProgress?: number
}

interface ModelUploadProps {
  onFilesUploaded?: (fileNames: string[]) => void
  isGenerating?: boolean
}

export function ModelUpload({ onFilesUploaded, isGenerating = false }: ModelUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // File validation
  const validateFile = (file: File): string | null => {
    // Check file extension
    if (!file.name.toLowerCase().endsWith('.glb')) {
      return 'Only GLB files are supported'
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return 'File size must be less than 50MB'
    }

    // Check file name for special characters
    const validName = /^[a-zA-Z0-9_-]+\.glb$/i
    if (!validName.test(file.name)) {
      return 'File name can only contain letters, numbers, hyphens, and underscores'
    }

    return null
  }

  // Upload file to server
  const uploadFile = async (file: File, fileId: string): Promise<void> => {
    const formData = new FormData()
    formData.append('model', file)

    try {
      const response = await fetch('/api/3d-generator', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Upload-Action': 'upload-model'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      // Update file status to success
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'success' as const, uploadProgress: 100 }
          : f
      ))

      // Notify parent component
      if (onFilesUploaded) {
        onFilesUploaded([file.name.replace('.glb', '')])
      }

    } catch (error) {
      // Update file status to error
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              status: 'error' as const, 
              errorMessage: error instanceof Error ? error.message : 'Upload failed' 
            }
          : f
      ))
    }
  }

  // Handle file selection
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    for (const file of fileArray) {
      const validationError = validateFile(file)
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      if (validationError) {
        // Add file with error status
        setUploadedFiles(prev => [...prev, {
          file,
          id: fileId,
          status: 'error',
          errorMessage: validationError
        }])
        continue
      }

      // Add file with uploading status
      setUploadedFiles(prev => [...prev, {
        file,
        id: fileId,
        status: 'uploading',
        uploadProgress: 0
      }])

      // Start upload
      uploadFile(file, fileId)
    }
  }, [onFilesUploaded])

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  // File input change handler
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFiles])

  // Remove file from list
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload GLB Models
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`
              relative border-2 border-dashed rounded-token-lg p-8 text-center transition-all cursor-pointer
              ${isDragOver ? 'border-info/30 bg-info/10' : 'border-border hover:border-border'}
              ${isGenerating ? 'opacity-50 pointer-events-none' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".glb"
              multiple
              className="hidden"
              disabled={isGenerating}
            />
            
            <div className="space-y-token-md">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                {isDragOver ? (
                  <Plus className="w-8 h-8 text-info" />
                ) : (
                  <Folder className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-foreground">
                  {isDragOver ? 'Drop files here' : 'Upload GLB files'}
                </h3>
                <p className="text-sm text-aurora-nav-muted mt-1">
                  Drag and drop your GLB models here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports GLB files up to 50MB each
                </p>
              </div>
              
              <Button 
                variant="outline" 
                disabled={isGenerating}
                className="pointer-events-none"
              >
                <Upload className="w-4 h-4 mr-2" />
                Browse Files
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              Upload Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((uploadedFile) => (
                <div
                  key={uploadedFile.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-token-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0">
                      {uploadedFile.status === 'uploading' && (
                        <Loader2 className="w-5 h-5 text-info animate-spin" />
                      )}
                      {uploadedFile.status === 'success' && (
                        <FileCheck className="w-5 h-5 text-success" />
                      )}
                      {uploadedFile.status === 'error' && (
                        <AlertCircle className="w-5 h-5 text-error" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-xs text-aurora-nav-muted">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                      
                      {uploadedFile.status === 'error' && uploadedFile.errorMessage && (
                        <p className="text-xs text-error mt-1">
                          {uploadedFile.errorMessage}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          uploadedFile.status === 'success' ? 'default' :
                          uploadedFile.status === 'error' ? 'destructive' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {uploadedFile.status === 'uploading' && 'Uploading...'}
                        {uploadedFile.status === 'success' && 'Uploaded'}
                        {uploadedFile.status === 'error' && 'Failed'}
                      </Badge>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFile(uploadedFile.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ModelUpload