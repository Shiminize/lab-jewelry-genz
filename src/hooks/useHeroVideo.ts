/**
 * useHeroVideo Hook
 * Aurora Design System - Batch 2 Migration
 * Extracted from HeroSection.tsx for better maintainability
 * Handles all video loading, error handling, and progress tracking
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import type { HeroVideoConfig } from '../data/heroData'

export interface VideoState {
  isLoaded: boolean
  hasError: boolean
  loadingProgress: number
  shouldLoad: boolean
}

export interface VideoControls {
  play: () => Promise<void>
  pause: () => void
  reset: () => void
}

export interface UseHeroVideoOptions {
  videoConfig: HeroVideoConfig
  loadDelay?: number
  respectReducedMotion?: boolean
  onVideoLoad?: () => void
  onVideoError?: (error: MediaError | null) => void
}

export interface UseHeroVideoReturn {
  videoRef: React.RefObject<HTMLVideoElement>
  videoState: VideoState
  videoControls: VideoControls
  errorDetails: {
    message?: string
    code?: number
    networkState?: number
    readyState?: number
  }
}

/**
 * Custom hook for managing hero video functionality
 * Handles loading, error states, progress tracking, and accessibility
 */
export function useHeroVideo({
  videoConfig,
  loadDelay = 1500,
  respectReducedMotion = true,
  onVideoLoad,
  onVideoError
}: UseHeroVideoOptions): UseHeroVideoReturn {
  // Video element reference
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // Video state management
  const [videoState, setVideoState] = useState<VideoState>({
    isLoaded: false,
    hasError: false,
    loadingProgress: 0,
    shouldLoad: false
  })
  
  // Error details for debugging
  const [errorDetails, setErrorDetails] = useState<{
    message?: string
    code?: number
    networkState?: number
    readyState?: number
  }>({})
  
  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  // Check reduced motion preference
  useEffect(() => {
    if (!respectReducedMotion) return
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    
    return () => mediaQuery.removeEventListener('change', handler)
  }, [respectReducedMotion])
  
  // Delayed video loading for performance
  useEffect(() => {
    if (!videoConfig.src) return
    
    const timer = setTimeout(() => {
      setVideoState(prev => ({ ...prev, shouldLoad: true }))
    }, loadDelay)
    
    return () => clearTimeout(timer)
  }, [loadDelay, videoConfig.src])
  
  // Video event handlers
  const handleVideoLoad = useCallback(() => {
    setVideoState(prev => ({
      ...prev,
      isLoaded: true,
      hasError: false,
      loadingProgress: 100
    }))
    
    setErrorDetails({})
    onVideoLoad?.()
  }, [onVideoLoad])
  
  const handleVideoError = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget
    const error = video.error
    
    const errorInfo = {
      message: error?.message || 'Unknown video error',
      code: error?.code,
      networkState: video.networkState,
      readyState: video.readyState
    }
    
    console.error('❌ Hero video loading failed:', {
      error: errorInfo.message,
      code: errorInfo.code,
      networkState: errorInfo.networkState,
      readyState: errorInfo.readyState,
      src: videoConfig.src,
      currentSrc: video.currentSrc
    })
    
    setVideoState(prev => ({
      ...prev,
      hasError: true,
      isLoaded: false,
      loadingProgress: 0
    }))
    
    setErrorDetails(errorInfo)
    onVideoError?.(error)
  }, [videoConfig.src, onVideoError])
  
  const handleVideoProgress = useCallback(() => {
    if (!videoRef.current) return
    
    const video = videoRef.current
    if (video.duration > 0) {
      const progress = video.buffered.length > 0 
        ? (video.buffered.end(0) / video.duration) * 100 
        : 0
      
      setVideoState(prev => ({ ...prev, loadingProgress: progress }))
    }
  }, [])
  
  const handleVideoLoadStart = useCallback(() => {
    setVideoState(prev => ({ ...prev, loadingProgress: 5 }))
  }, [])
  
  const handleVideoCanPlay = useCallback(() => {
    setVideoState(prev => ({ ...prev, loadingProgress: 90 }))
  }, [])
  
  // Auto-play video when loaded (respecting user preferences)
  useEffect(() => {
    if (!videoRef.current || !videoState.isLoaded || prefersReducedMotion) return
    
    if (videoConfig.autoPlay) {
      videoRef.current.play().catch((playError) => {
        console.warn('⚠️ Auto-play failed (expected behavior):', playError.message)
        // Auto-play failed, but this is expected in many browsers
        // The video will still be available for user interaction
      })
    }
  }, [videoState.isLoaded, prefersReducedMotion, videoConfig.autoPlay])
  
  // Video controls
  const videoControls: VideoControls = {
    play: async () => {
      if (!videoRef.current) return
      
      try {
        await videoRef.current.play()
      } catch (error) {
        console.warn('Video play failed:', error)
      }
    },
    
    pause: () => {
      if (!videoRef.current) return
      videoRef.current.pause()
    },
    
    reset: () => {
      setVideoState({
        isLoaded: false,
        hasError: false,
        loadingProgress: 0,
        shouldLoad: false
      })
      setErrorDetails({})
      
      if (videoRef.current) {
        videoRef.current.currentTime = 0
        videoRef.current.pause()
      }
    }
  }
  
  // Attach event listeners to video element
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    
    video.addEventListener('loadeddata', handleVideoLoad)
    video.addEventListener('error', handleVideoError)
    video.addEventListener('progress', handleVideoProgress)
    video.addEventListener('loadstart', handleVideoLoadStart)
    video.addEventListener('canplay', handleVideoCanPlay)
    
    return () => {
      video.removeEventListener('loadeddata', handleVideoLoad)
      video.removeEventListener('error', handleVideoError)
      video.removeEventListener('progress', handleVideoProgress)
      video.removeEventListener('loadstart', handleVideoLoadStart)
      video.removeEventListener('canplay', handleVideoCanPlay)
    }
  }, [handleVideoLoad, handleVideoError, handleVideoProgress, handleVideoLoadStart, handleVideoCanPlay])
  
  return {
    videoRef,
    videoState,
    videoControls,
    errorDetails
  }
}