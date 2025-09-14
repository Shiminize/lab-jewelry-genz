/**
 * useValueProposition Hook
 * Aurora Design System - Batch 2 Migration
 * Extracted from EnhancedValueProposition.tsx for better maintainability
 * Handles card interactions, animation orchestration, and keyboard navigation
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { AnimationConfig, ResponsiveConfig } from '../data/valuePropositionData'

export interface CardInteractionState {
  activeCard: string | null
  animatedCards: Set<string>
  isInView: boolean
  hoveredCard: string | null
}

export interface CardInteractionControls {
  setActiveCard: (cardId: string | null) => void
  handleCardEnter: (cardId: string) => void
  handleCardLeave: (cardId: string) => void
  handleCardFocus: (cardId: string) => void
  handleCardBlur: () => void
  resetInteractions: () => void
}

export interface UseValuePropositionOptions {
  animationConfig: AnimationConfig
  responsiveConfig: ResponsiveConfig
  cardIds: string[]
  threshold?: number
}

export interface UseValuePropositionReturn {
  intersectionRef: React.RefObject<HTMLDivElement>
  interactionState: CardInteractionState
  interactionControls: CardInteractionControls
  shouldAnimate: boolean
  isCardActive: (cardId: string) => boolean
  isCardAnimated: (cardId: string) => boolean
  getCardState: (cardId: string) => 'default' | 'active' | 'dimmed'
}

/**
 * Custom hook for managing value proposition card interactions and animations
 * Handles staggered animations, hover states, keyboard navigation, and accessibility
 */
export function useValueProposition({
  animationConfig,
  responsiveConfig,
  cardIds,
  threshold = 0.2
}: UseValuePropositionOptions): UseValuePropositionReturn {
  // Intersection observer reference
  const intersectionRef = useRef<HTMLDivElement>(null)
  
  // Interaction state management
  const [interactionState, setInteractionState] = useState<CardInteractionState>({
    activeCard: null,
    animatedCards: new Set(),
    isInView: false,
    hoveredCard: null
  })
  
  // Intersection Observer for animation trigger
  useEffect(() => {
    if (!animationConfig.enableAnimation) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInteractionState(prev => ({
            ...prev,
            isInView: true
          }))
        }
      },
      { threshold }
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
  }, [animationConfig.enableAnimation, threshold])
  
  // Staggered animation for cards
  useEffect(() => {
    if (!interactionState.isInView || !animationConfig.enableAnimation) return
    
    cardIds.forEach((cardId, index) => {
      setTimeout(() => {
        setInteractionState(prev => ({
          ...prev,
          animatedCards: new Set(Array.from(prev.animatedCards).concat(cardId))
        }))
      }, index * animationConfig.animationDelay)
    })
  }, [interactionState.isInView, animationConfig.enableAnimation, animationConfig.animationDelay, cardIds])
  
  // Card interaction handlers
  const handleCardEnter = useCallback((cardId: string) => {
    if (!animationConfig.enableInteraction) return
    
    setInteractionState(prev => ({
      ...prev,
      hoveredCard: cardId,
      activeCard: cardId
    }))
  }, [animationConfig.enableInteraction])
  
  const handleCardLeave = useCallback((cardId: string) => {
    if (!animationConfig.enableInteraction) return
    
    setInteractionState(prev => ({
      ...prev,
      hoveredCard: null,
      activeCard: prev.activeCard === cardId ? null : prev.activeCard
    }))
  }, [animationConfig.enableInteraction])
  
  const handleCardFocus = useCallback((cardId: string) => {
    setInteractionState(prev => ({
      ...prev,
      activeCard: cardId
    }))
  }, [])
  
  const handleCardBlur = useCallback(() => {
    setInteractionState(prev => ({
      ...prev,
      activeCard: null
    }))
  }, [])
  
  const setActiveCard = useCallback((cardId: string | null) => {
    setInteractionState(prev => ({
      ...prev,
      activeCard: cardId
    }))
  }, [])
  
  const resetInteractions = useCallback(() => {
    setInteractionState(prev => ({
      ...prev,
      activeCard: null,
      hoveredCard: null
    }))
  }, [])
  
  // Interaction controls
  const interactionControls: CardInteractionControls = {
    setActiveCard,
    handleCardEnter,
    handleCardLeave,
    handleCardFocus,
    handleCardBlur,
    resetInteractions
  }
  
  // Utility functions
  const isCardActive = useCallback((cardId: string) => {
    return interactionState.activeCard === cardId
  }, [interactionState.activeCard])
  
  const isCardAnimated = useCallback((cardId: string) => {
    return interactionState.animatedCards.has(cardId)
  }, [interactionState.animatedCards])
  
  const getCardState = useCallback((cardId: string): 'default' | 'active' | 'dimmed' => {
    const { activeCard, hoveredCard } = interactionState
    
    if (!animationConfig.enableInteraction) {
      return 'default'
    }
    
    if (activeCard === cardId || hoveredCard === cardId) {
      return 'active'
    }
    
    if (activeCard && activeCard !== cardId) {
      return 'dimmed'
    }
    
    return 'default'
  }, [interactionState, animationConfig.enableInteraction])
  
  // Handle keyboard navigation
  useEffect(() => {
    if (!animationConfig.enableInteraction) return
    
    const handleKeyDown = (event: KeyboardEvent) => {
      const { activeCard } = interactionState
      const currentIndex = activeCard ? cardIds.indexOf(activeCard) : -1
      
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault()
          const nextIndex = currentIndex < cardIds.length - 1 ? currentIndex + 1 : 0
          setActiveCard(cardIds[nextIndex])
          break
          
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault()
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : cardIds.length - 1
          setActiveCard(cardIds[prevIndex])
          break
          
        case 'Escape':
          event.preventDefault()
          setActiveCard(null)
          break
          
        case 'Home':
          event.preventDefault()
          setActiveCard(cardIds[0])
          break
          
        case 'End':
          event.preventDefault()
          setActiveCard(cardIds[cardIds.length - 1])
          break
      }
    }
    
    const element = intersectionRef.current
    if (element) {
      element.addEventListener('keydown', handleKeyDown)
      return () => element.removeEventListener('keydown', handleKeyDown)
    }
  }, [animationConfig.enableInteraction, interactionState, cardIds, setActiveCard])
  
  // Determine if animations should run
  const shouldAnimate = animationConfig.enableAnimation && interactionState.isInView
  
  return {
    intersectionRef,
    interactionState,
    interactionControls,
    shouldAnimate,
    isCardActive,
    isCardAnimated,
    getCardState
  }
}