'use client'

import { useState, useEffect, useCallback } from 'react'

interface SwipeGesture {
  startX: number
  startY: number
  deltaX: number
  deltaY: number
  timestamp: number
}

interface UseMobileNavigationProps {
  onSwipeRight?: () => void
  onSwipeLeft?: () => void
  swipeThreshold?: number
  velocityThreshold?: number
}

export function useMobileNavigation({
  onSwipeRight,
  onSwipeLeft,
  swipeThreshold = 100,
  velocityThreshold = 0.3
}: UseMobileNavigationProps = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [swipeGesture, setSwipeGesture] = useState<SwipeGesture | null>(null)

  // Detect mobile device
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    setSwipeGesture({
      startX: touch.clientX,
      startY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      timestamp: Date.now()
    })
  }, [])

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!swipeGesture) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - swipeGesture.startX
    const deltaY = touch.clientY - swipeGesture.startY

    setSwipeGesture(prev => prev ? {
      ...prev,
      deltaX,
      deltaY
    } : null)

    // Prevent default scroll if horizontal swipe is detected
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
      e.preventDefault()
    }
  }, [swipeGesture])

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!swipeGesture) return

    const deltaTime = Date.now() - swipeGesture.timestamp
    const velocity = Math.abs(swipeGesture.deltaX) / deltaTime

    // Check if swipe meets threshold criteria
    const isValidSwipe = 
      Math.abs(swipeGesture.deltaX) > swipeThreshold &&
      Math.abs(swipeGesture.deltaX) > Math.abs(swipeGesture.deltaY) &&
      velocity > velocityThreshold

    if (isValidSwipe) {
      if (swipeGesture.deltaX > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (swipeGesture.deltaX < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    }

    setSwipeGesture(null)
  }, [swipeGesture, swipeThreshold, velocityThreshold, onSwipeRight, onSwipeLeft])

  // Setup touch event listeners
  useEffect(() => {
    if (!isMobile) return

    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isMobile, handleTouchStart, handleTouchMove, handleTouchEnd])

  // Toggle menu
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])

  // Close menu
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  // Open menu
  const openMenu = useCallback(() => {
    setIsMenuOpen(true)
  }, [])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMenuOpen, closeMenu])

  // Prevent body scroll when menu is open on mobile
  useEffect(() => {
    if (isMobile && isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobile, isMenuOpen])

  return {
    isMenuOpen,
    isMobile,
    swipeGesture,
    toggleMenu,
    closeMenu,
    openMenu,
    swipeProgress: swipeGesture ? Math.min(Math.abs(swipeGesture.deltaX) / swipeThreshold, 1) : 0
  }
}