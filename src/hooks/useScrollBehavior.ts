import { useState, useRef, useCallback, useEffect } from 'react'

interface UseScrollBehaviorOptions {
  threshold?: number
  throttleMs?: number
  hideOnScroll?: boolean
  onScrollUp?: () => void
  onScrollDown?: () => void
}

interface ScrollBehaviorState {
  isScrolled: boolean
  isVisible: boolean
  scrollY: number
  isScrollingDown: boolean
}

/**
 * Custom hook for optimized scroll behavior management
 * CLAUDE_RULES compliant: RAF-based throttling, performance optimized
 * 
 * @param options Configuration for scroll behavior
 * @returns Current scroll state
 */
export function useScrollBehavior({
  threshold = 20,
  throttleMs = 16, // 60fps
  hideOnScroll = true,
  onScrollUp,
  onScrollDown
}: UseScrollBehaviorOptions = {}): ScrollBehaviorState {
  const [state, setState] = useState<ScrollBehaviorState>({
    isScrolled: false,
    isVisible: true,
    scrollY: 0,
    isScrollingDown: false
  })

  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  const updateScrollState = useCallback(() => {
    const scrollY = window.scrollY
    const isScrolled = scrollY > threshold
    const isScrollingDown = scrollY > lastScrollY.current
    
    let isVisible = true
    if (hideOnScroll) {
      // Apple-style: hide on scroll down, show on scroll up or near top
      isVisible = !isScrollingDown || scrollY < threshold
    }

    setState(prevState => {
      // Only update if values actually changed to prevent unnecessary re-renders
      if (
        prevState.isScrolled !== isScrolled ||
        prevState.isVisible !== isVisible ||
        prevState.scrollY !== scrollY ||
        prevState.isScrollingDown !== isScrollingDown
      ) {
        return {
          isScrolled,
          isVisible,
          scrollY,
          isScrollingDown
        }
      }
      return prevState
    })

    // Call optional callbacks
    if (isScrollingDown && onScrollDown) {
      onScrollDown()
    } else if (!isScrollingDown && onScrollUp) {
      onScrollUp()
    }

    lastScrollY.current = scrollY
    ticking.current = false
  }, [threshold, hideOnScroll, onScrollUp, onScrollDown])

  const handleScroll = useCallback(() => {
    // Single RAF-based throttling - CLAUDE_RULES performance optimized
    if (!ticking.current) {
      requestAnimationFrame(() => {
        updateScrollState()
        ticking.current = false
      })
      ticking.current = true
    }
  }, [updateScrollState])

  useEffect(() => {
    // Initialize scroll position
    lastScrollY.current = window.scrollY
    updateScrollState()

    // Add passive scroll listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll, updateScrollState])

  // Handle window resize to recalculate positions
  useEffect(() => {
    const handleResize = () => {
      requestAnimationFrame(updateScrollState)
    }

    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [updateScrollState])

  return state
}

export type { UseScrollBehaviorOptions, ScrollBehaviorState }