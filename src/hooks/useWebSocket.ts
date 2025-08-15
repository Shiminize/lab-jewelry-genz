/**
 * WebSocket Hook for Real-time Generation Progress
 * Connects to Socket.IO server for live updates
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export interface JobProgress {
  jobId: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  currentModel?: string
  currentMaterial?: string
  currentFrame?: number
  totalFrames?: number
  processedModels?: number
  totalModels?: number
  error?: string
  startTime: string
  endTime?: string
}

export interface UseWebSocketReturn {
  socket: Socket | null
  isConnected: boolean
  joinJobRoom: (jobId: string) => void
  leaveJobRoom: (jobId: string) => void
  jobProgress: Map<string, JobProgress>
}

export function useWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [jobProgress, setJobProgress] = useState<Map<string, JobProgress>>(new Map())
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Initialize Socket.IO connection
    const socket = io({
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    })

    // Connection event handlers
    socket.on('connect', () => {
      console.log('🔌 WebSocket connected:', socket.id)
      setIsConnected(true)
    })

    socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason)
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error)
      setIsConnected(false)
    })

    // Job progress updates
    socket.on('job-progress', (progress: JobProgress) => {
      console.log('📡 Job progress update:', progress)
      setJobProgress(prev => {
        const updated = new Map(prev)
        updated.set(progress.jobId, progress)
        return updated
      })
    })

    socketRef.current = socket

    // Cleanup on unmount
    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  const joinJobRoom = (jobId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-job', jobId)
      console.log(`📱 Joined job room: ${jobId}`)
    }
  }

  const leaveJobRoom = (jobId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave-job', jobId)
      console.log(`📤 Left job room: ${jobId}`)
    }
  }

  return {
    socket: socketRef.current,
    isConnected,
    joinJobRoom,
    leaveJobRoom,
    jobProgress,
  }
}

export default useWebSocket