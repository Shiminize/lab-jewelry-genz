/**
 * GenerationQueue Component
 * Real-time monitoring of 3D sequence generation progress with batch queue management
 */

'use client'

import React from 'react'
import BatchGenerationQueue from './BatchGenerationQueue'

interface GenerationQueueProps {
  isGenerating: boolean
  currentModel: string | null
  processedModels: number
  totalModels: number
}

export function GenerationQueue({
  isGenerating,
  currentModel,
  processedModels,
  totalModels
}: GenerationQueueProps) {
  return <BatchGenerationQueue />
}