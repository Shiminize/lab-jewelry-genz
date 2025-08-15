import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export interface SequenceData {
  id: string
  modelName: string
  material: string
  frameCount: number
  formats: string[]
  totalSize: number
  lastGenerated: Date
  status: 'complete' | 'partial' | 'missing'
}

export async function GET() {
  try {
    const sequencesPath = path.join(process.cwd(), 'Public', 'images', 'products', '3d-sequences')
    
    // Check if sequences directory exists
    try {
      await fs.access(sequencesPath)
    } catch {
      return NextResponse.json([])
    }

    const entries = await fs.readdir(sequencesPath, { withFileTypes: true })
    const sequenceDirectories = entries.filter(entry => entry.isDirectory())
    
    const sequences: SequenceData[] = []

    for (const dir of sequenceDirectories) {
      const dirPath = path.join(sequencesPath, dir.name)
      
      try {
        const files = await fs.readdir(dirPath)
        
        // Count frames by format
        const formatCounts: Record<string, number> = {}
        const formats = new Set<string>()
        let totalSize = 0

        for (const file of files) {
          const ext = path.extname(file).slice(1) // Remove the dot
          if (['avif', 'webp', 'png'].includes(ext)) {
            formatCounts[ext] = (formatCounts[ext] || 0) + 1
            formats.add(ext)
            
            // Get file size
            try {
              const filePath = path.join(dirPath, file)
              const stats = await fs.stat(filePath)
              totalSize += stats.size
            } catch (error) {
              console.warn(`Could not get size for ${file}:`, error)
            }
          }
        }

        // Parse directory name to extract model and material
        const parts = dir.name.split('-')
        let modelName = 'Unknown Model'
        let material = 'Unknown Material'
        
        if (parts.length >= 2) {
          const materialPart = parts[parts.length - 1]
          const modelParts = parts.slice(0, -1)
          
          // Convert material to display format
          material = materialPart
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          
          // Convert model name (handle underscores and hyphens)
          modelName = modelParts
            .join(' ')
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        }

        // Determine status and frame count
        const maxFrames = Math.max(...Object.values(formatCounts), 0)
        const hasAllFormats = ['avif', 'webp', 'png'].every(format => formats.has(format))
        
        let status: 'complete' | 'partial' | 'missing'
        if (maxFrames === 0) {
          status = 'missing'
        } else if (maxFrames >= 12 && hasAllFormats) { // Consider 12+ frames complete
          status = 'complete'
        } else {
          status = 'partial'
        }

        // Get directory modification time
        const dirStats = await fs.stat(dirPath)

        sequences.push({
          id: dir.name,
          modelName,
          material,
          frameCount: maxFrames,
          formats: Array.from(formats),
          totalSize,
          lastGenerated: dirStats.mtime,
          status
        })

      } catch (error) {
        console.warn(`Error processing directory ${dir.name}:`, error)
        
        // Add as missing sequence
        const parts = dir.name.split('-')
        let modelName = 'Unknown Model'
        let material = 'Unknown Material'
        
        if (parts.length >= 2) {
          const materialPart = parts[parts.length - 1]
          const modelParts = parts.slice(0, -1)
          
          material = materialPart
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          
          modelName = modelParts
            .join(' ')
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        }

        sequences.push({
          id: dir.name,
          modelName,
          material,
          frameCount: 0,
          formats: [],
          totalSize: 0,
          lastGenerated: new Date(),
          status: 'missing'
        })
      }
    }

    // Sort sequences by model name, then by material
    sequences.sort((a, b) => {
      if (a.modelName !== b.modelName) {
        return a.modelName.localeCompare(b.modelName)
      }
      return a.material.localeCompare(b.material)
    })

    return NextResponse.json(sequences)

  } catch (error) {
    console.error('Error loading sequences:', error)
    return NextResponse.json(
      { error: 'Failed to load sequences' },
      { status: 500 }
    )
  }
}