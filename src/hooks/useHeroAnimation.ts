/**
 * useHeroAnimation Hook
 * Aurora Design System - Batch 2 Migration
 * Extracted from HeroSection.tsx for better maintainability
 * Handles motion preferences, intersection observer, and animation variants
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import type { HeroAnimationConfig } from '../data/heroData'

export interface AnimationState {
  isVisible: boolean
  hasAnimated: boolean
  animationPhase: 'idle' | 'preparing' | 'animating' | 'complete'
}

export interface AnimationControls {
  triggerAnimation: () => void
  resetAnimation: () => void
  skipAnimation: () => void
}

export interface UseHeroAnimationOptions {
  animationConfig: HeroAnimationConfig
  threshold?: number
  rootMargin?: string
  disabled?: boolean
}

export interface UseHeroAnimationReturn {
  intersectionRef: React.RefObject<HTMLDivElement>
  animationState: AnimationState
  animationControls: AnimationControls
  shouldAnimate: boolean
  prefersReducedMotion: boolean
  containerVariants: any
  itemVariants: {
    headline: any
    subHeadline: any
    cta: any
  }
}

/**
 * Custom hook for managing hero section animations
 * Handles intersection observer, reduced motion, and animation orchestration
 */
export function useHeroAnimation({
  animationConfig,
  threshold = 0.1,
  rootMargin = '0px 0px -100px 0px',
  disabled = false
}: UseHeroAnimationOptions): UseHeroAnimationReturn {
  // Intersection observer reference
  const intersectionRef = useRef<HTMLDivElement>(null)
  
  // Animation state management
  const [animationState, setAnimationState] = useState<AnimationState>({
    isVisible: false,
    hasAnimated: false,
    animationPhase: 'idle'
  })
  
  // Motion preferences
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  // Check for reduced motion preference
  useEffect(() => {
    if (!animationConfig.respectReducedMotion) return
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
      
      // If user enables reduced motion, skip ongoing animations
      if (e.matches && animationState.animationPhase === 'animating') {
        setAnimationState(prev => ({
          ...prev,
          animationPhase: 'complete',
          hasAnimated: true
        }))
      }
    }
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [animationConfig.respectReducedMotion, animationState.animationPhase])
  
  // Intersection Observer for triggering animations
  useEffect(() => {
    if (disabled || prefersReducedMotion) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animationState.hasAnimated) {
          setAnimationState(prev => ({
            ...prev,
            isVisible: true,
            animationPhase: 'preparing'
          }))
        }
      },
      {
        threshold,
        rootMargin
      }
    )
    
    const element = intersectionRef.current
    if (element) {
      observer.observe(element)
    }
    
    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [disabled, prefersReducedMotion, animationState.hasAnimated, threshold, rootMargin])
  
  // Trigger animation sequence with delay
  useEffect(() => {
    if (animationState.animationPhase !== 'preparing') return
    
    const timer = setTimeout(() => {
      setAnimationState(prev => ({
        ...prev,
        animationPhase: 'animating'
      }))
      
      // Mark as complete after animation duration
      const completeTimer = setTimeout(() => {
        setAnimationState(prev => ({
          ...prev,
          animationPhase: 'complete',
          hasAnimated: true
        }))
      }, 1500) // Approximate total animation duration
      
      return () => clearTimeout(completeTimer)
    }, animationConfig.contentAnimationDelay)
    
    return () => clearTimeout(timer)
  }, [animationState.animationPhase, animationConfig.contentAnimationDelay])
  
  // Animation controls
  const animationControls: AnimationControls = {
    triggerAnimation: useCallback(() => {
      if (animationState.hasAnimated) return
      
      setAnimationState(prev => ({
        ...prev,
        isVisible: true,
        animationPhase: 'animating'
      }))
    }, [animationState.hasAnimated]),
    
    resetAnimation: useCallback(() => {
      setAnimationState({
        isVisible: false,
        hasAnimated: false,
        animationPhase: 'idle'
      })
    }, []),
    
    skipAnimation: useCallback(() => {
      setAnimationState({
        isVisible: true,
        hasAnimated: true,
        animationPhase: 'complete'
      })
    }, [])
  }
  
  // Determine if animations should run
  const shouldAnimate = !disabled && 
                       !prefersReducedMotion && 
                       animationState.isVisible &&
                       animationState.animationPhase !== 'idle'
  
  // Auto-skip animations if reduced motion is preferred
  useEffect(() => {
    if (prefersReducedMotion && animationState.animationPhase !== 'complete') {
      animationControls.skipAnimation()
    }
  }, [prefersReducedMotion, animationState.animationPhase, animationControls])
  
  // Animation variants for framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    headline: {
      hidden: { opacity: 0, y: 30 },
      visible: { 
        opacity: 1, 
        y: 0, 
        transition: { 
          delay: 0.2, 
          duration: 1.2, 
          ease: "easeOut" 
        } 
      }
    },
    subHeadline: {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0, 
        transition: { 
          delay: 0.4, 
          duration: 1.0, 
          ease: "easeOut" 
        } 
      }
    },
    cta: {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0, 
        transition: { 
          delay: 0.6, 
          duration: 1.0, 
          ease: "easeOut" 
        } 
      }
    }
  }

  return {
    intersectionRef,
    animationState,
    animationControls,
    shouldAnimate,
    prefersReducedMotion,
    containerVariants,
    itemVariants
  }
}