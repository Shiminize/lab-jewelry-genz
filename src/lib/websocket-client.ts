/**
 * WebSocket Client for Real-time 3D Generation Updates
 * Handles real-time communication for generation progress
 */

type MessageType = 
  | 'generation-started'
  | 'generation-progress' 
  | 'generation-completed'
  | 'generation-error'
  | 'frame-completed'
  | 'material-completed'
  | 'model-completed'

interface WebSocketMessage {
  type: MessageType
  jobId: string
  data: any
  timestamp: string
}

interface GenerationProgressData {
  modelName: string
  material: string
  currentFrame: number
  totalFrames: number
  progress: number
  estimatedTimeRemaining?: number
}

interface GenerationCompletedData {
  jobId: string
  totalImages: number
  totalSize: number
  duration: number
  sequences: {
    modelName: string
    material: string
    frameCount: number
    formats: string[]
    size: number
  }[]
}

class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners = new Map<MessageType, Set<(data: any) => void>>()
  private url: string

  constructor(url?: string) {
    // Use appropriate WebSocket URL based on environment
    this.url = url || (
      typeof window !== 'undefined' 
        ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/ws`
        : 'ws://localhost:3000/api/ws'
    )
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log('🔌 WebSocket connected')
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', event.code, event.reason)
          this.handleReconnect()
        }

        this.ws.onerror = (error) => {
          console.error('🔌 WebSocket error:', error)
          reject(error)
        }

      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const listeners = this.listeners.get(message.type)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(message.data)
        } catch (error) {
          console.error(`Error in WebSocket listener for ${message.type}:`, error)
        }
      })
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      
      console.log(`🔌 Attempting to reconnect in ${delay}ms (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error)
        })
      }, delay)
    } else {
      console.error('🔌 Max reconnection attempts reached')
    }
  }

  // Event listeners
  onGenerationStarted(callback: (data: { jobId: string; modelIds: string[] }) => void): () => void {
    return this.addEventListener('generation-started', callback)
  }

  onGenerationProgress(callback: (data: GenerationProgressData) => void): () => void {
    return this.addEventListener('generation-progress', callback)
  }

  onGenerationCompleted(callback: (data: GenerationCompletedData) => void): () => void {
    return this.addEventListener('generation-completed', callback)
  }

  onGenerationError(callback: (data: { jobId: string; error: string }) => void): () => void {
    return this.addEventListener('generation-error', callback)
  }

  onFrameCompleted(callback: (data: { 
    modelName: string; 
    material: string; 
    frame: number; 
    formats: string[] 
  }) => void): () => void {
    return this.addEventListener('frame-completed', callback)
  }

  onMaterialCompleted(callback: (data: { 
    modelName: string; 
    material: string; 
    frameCount: number 
  }) => void): () => void {
    return this.addEventListener('material-completed', callback)
  }

  onModelCompleted(callback: (data: { 
    modelName: string; 
    materials: string[]; 
    totalFrames: number 
  }) => void): () => void {
    return this.addEventListener('model-completed', callback)
  }

  private addEventListener(type: MessageType, callback: (data: any) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    
    const listeners = this.listeners.get(type)!
    listeners.add(callback)

    // Return unsubscribe function
    return () => {
      listeners.delete(callback)
      if (listeners.size === 0) {
        this.listeners.delete(type)
      }
    }
  }

  // Send messages to server
  startGeneration(modelIds: string[], options?: any): void {
    this.send('start-generation', { modelIds, options })
  }

  stopGeneration(jobId: string): void {
    this.send('stop-generation', { jobId })
  }

  private send(type: string, data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type,
        data,
        timestamp: new Date().toISOString()
      }
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected, cannot send message:', type)
    }
  }

  // Connection status
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  get connectionState(): string {
    if (!this.ws) return 'disconnected'
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting'
      case WebSocket.OPEN: return 'connected'
      case WebSocket.CLOSING: return 'closing'
      case WebSocket.CLOSED: return 'disconnected'
      default: return 'unknown'
    }
  }
}

// Singleton instance
let wsClient: WebSocketClient | null = null

export function getWebSocketClient(): WebSocketClient {
  if (!wsClient) {
    wsClient = new WebSocketClient()
  }
  return wsClient
}

// React hook for WebSocket integration
export function useWebSocket() {
  const client = getWebSocketClient()
  
  return {
    client,
    isConnected: client.isConnected,
    connectionState: client.connectionState,
    connect: () => client.connect(),
    disconnect: () => client.disconnect()
  }
}

export default WebSocketClient