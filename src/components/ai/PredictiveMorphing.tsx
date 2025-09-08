'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import { motion } from 'framer-motion'

// Aurora Predictive Morphing - AI Emotional Intelligence Context
interface UserProfile {
  emotionalProfile: 'romantic' | 'bold' | 'minimalist' | 'vintage' | 'elegant' | 'playful'
  preferences: {
    colors: string[]
    materials: string[]
    styles: string[]
  }
  behaviorPattern: {
    browsingTime: number
    clickPatterns: string[]
    scrollVelocity: number
    interactionFrequency: number
  }
  currentMood: 'exploring' | 'deciding' | 'researching' | 'impulse' | 'gifting'
  confidenceLevel: number
}

interface MorphingState {
  currentTheme: string
  adaptiveColors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  layoutPreferences: {
    cardSize: 'compact' | 'standard' | 'featured'
    gridDensity: number
    animationIntensity: number
  }
  personalizedContent: {
    suggestedProducts: string[]
    prioritizedCategories: string[]
    customizedCopy: Record<string, string>
  }
}

interface PredictiveMorphingContextType {
  userProfile: UserProfile
  morphingState: MorphingState
  updateUserProfile: (updates: Partial<UserProfile>) => void
  morphInterface: (trigger: string, data?: any) => void
  getAdaptiveStyles: () => React.CSSProperties
}

// Aurora AI: Emotional Profile Configurations
const EMOTIONAL_PROFILES = {
  romantic: {
    colors: ['--aurora-pink', '--aurora-crimson', '--aurora-plum'],
    animationStyle: 'gentle-float',
    copyTone: 'warm',
    preferredCategories: ['rings', 'necklaces'],
    layoutPreference: 'featured'
  },
  bold: {
    colors: ['--aurora-nebula-purple', '--aurora-deep-space', '--aurora-crimson'],
    animationStyle: 'dramatic-scale',
    copyTone: 'confident',
    preferredCategories: ['statement-pieces', 'earrings'],
    layoutPreference: 'standard'
  },
  minimalist: {
    colors: ['--aurora-lunar-grey', '--aurora-nebula-purple', '--aurora-deep-space'],
    animationStyle: 'subtle-fade',
    copyTone: 'clean',
    preferredCategories: ['simple-designs', 'delicate-jewelry'],
    layoutPreference: 'compact'
  },
  vintage: {
    colors: ['--aurora-amber-glow', '--aurora-plum', '--aurora-deep-space'],
    animationStyle: 'classic-elegant',
    copyTone: 'sophisticated',
    preferredCategories: ['vintage-inspired', 'art-deco'],
    layoutPreference: 'featured'
  },
  elegant: {
    colors: ['--aurora-nebula-purple', '--aurora-lunar-grey', '--aurora-pink'],
    animationStyle: 'graceful-flow',
    copyTone: 'refined',
    preferredCategories: ['luxury', 'premium-collections'],
    layoutPreference: 'standard'
  },
  playful: {
    colors: ['--aurora-pink', '--aurora-emerald-flash', '--aurora-amber-glow'],
    animationStyle: 'bouncy-fun',
    copyTone: 'creative',
    preferredCategories: ['colorful', 'unique-designs'],
    layoutPreference: 'standard'
  }
}

// Aurora AI: Mood-Based Copy Personalization
const PERSONALIZED_COPY = {
  romantic: {
    heroTitle: "Find Your Forever Piece",
    searchPlaceholder: "Search for your dream jewelry...",
    ctaButton: "Discover Love",
    productDescription: "Crafted with love and passion"
  },
  bold: {
    heroTitle: "Make a Statement",
    searchPlaceholder: "Find your power piece...",
    ctaButton: "Own Your Style",
    productDescription: "Bold designs for confident individuals"
  },
  minimalist: {
    heroTitle: "Pure. Simple. Beautiful.",
    searchPlaceholder: "Find understated elegance...",
    ctaButton: "Embrace Simplicity",
    productDescription: "Clean lines, timeless appeal"
  },
  vintage: {
    heroTitle: "Timeless Heritage Collection",
    searchPlaceholder: "Discover vintage treasures...",
    ctaButton: "Explore Heritage",
    productDescription: "Classic designs with historical charm"
  },
  elegant: {
    heroTitle: "Sophisticated Luxury",
    searchPlaceholder: "Find refined elegance...",
    ctaButton: "Discover Elegance",
    productDescription: "Refined craftsmanship for discerning taste"
  },
  playful: {
    heroTitle: "Express Your Unique Style",
    searchPlaceholder: "Find something fun and unique...",
    ctaButton: "Get Creative",
    productDescription: "Playful designs for creative souls"
  }
}

const defaultUserProfile: UserProfile = {
  emotionalProfile: 'elegant',
  preferences: {
    colors: ['--aurora-nebula-purple', '--aurora-pink'],
    materials: ['gold', 'diamond'],
    styles: ['modern', 'classic']
  },
  behaviorPattern: {
    browsingTime: 0,
    clickPatterns: [],
    scrollVelocity: 1,
    interactionFrequency: 1
  },
  currentMood: 'exploring',
  confidenceLevel: 0.7
}

const defaultMorphingState: MorphingState = {
  currentTheme: 'elegant',
  adaptiveColors: {
    primary: '#4a4a5a',
    secondary: '#d4af37',
    accent: '#f5f5f0',
    background: 'white'
  },
  layoutPreferences: {
    cardSize: 'standard',
    gridDensity: 3,
    animationIntensity: 1
  },
  personalizedContent: {
    suggestedProducts: [],
    prioritizedCategories: ['rings', 'necklaces'],
    customizedCopy: PERSONALIZED_COPY.elegant
  }
}

const PredictiveMorphingContext = createContext<PredictiveMorphingContextType | null>(null)

// Aurora AI: Behavioral Analysis
const analyzeBehaviorPattern = (profile: UserProfile): Partial<MorphingState> => {
  const { behaviorPattern, currentMood, emotionalProfile } = profile
  const profileConfig = EMOTIONAL_PROFILES[emotionalProfile]
  
  // Analyze interaction patterns
  let animationIntensity = 1
  if (behaviorPattern.interactionFrequency > 0.8) {
    animationIntensity = 1.3 // High engagement = more animations
  } else if (behaviorPattern.interactionFrequency < 0.3) {
    animationIntensity = 0.7 // Low engagement = subtle animations
  }
  
  // Mood-based layout adjustments
  let cardSize: 'compact' | 'standard' | 'featured' = 'standard'
  if (currentMood === 'impulse') {
    cardSize = 'featured' // Highlight products for impulse buyers
  } else if (currentMood === 'researching') {
    cardSize = 'compact' // More info density for researchers
  }
  
  return {
    layoutPreferences: {
      cardSize,
      gridDensity: currentMood === 'researching' ? 4 : 3,
      animationIntensity
    },
    personalizedContent: {
      suggestedProducts: [],
      prioritizedCategories: profileConfig.preferredCategories,
      customizedCopy: PERSONALIZED_COPY[emotionalProfile]
    }
  }
}

// Aurora AI: Predictive Morphing Provider
export function PredictiveMorphingProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile)
  const [morphingState, setMorphingState] = useState<MorphingState>(defaultMorphingState)
  
  // Aurora AI: Real-time Profile Learning
  useEffect(() => {
    // Check if we're on the client side
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return
    }
    
    const startTime = Date.now()
    let interactionCount = 0
    let scrollCount = 0
    
    // Track browsing time
    const timeTracker = setInterval(() => {
      const browsingTime = Date.now() - startTime
      setUserProfile(prev => ({
        ...prev,
        behaviorPattern: {
          ...prev.behaviorPattern,
          browsingTime
        }
      }))
    }, 5000)
    
    // Track interactions
    const trackInteraction = (event: Event) => {
      interactionCount++
      setUserProfile(prev => ({
        ...prev,
        behaviorPattern: {
          ...prev.behaviorPattern,
          clickPatterns: [...prev.behaviorPattern.clickPatterns, event.type].slice(-10),
          interactionFrequency: Math.min(1, interactionCount / 10)
        }
      }))
    }
    
    // Track scroll behavior
    const trackScroll = () => {
      scrollCount++
      setUserProfile(prev => ({
        ...prev,
        behaviorPattern: {
          ...prev.behaviorPattern,
          scrollVelocity: Math.min(2, scrollCount / 20)
        }
      }))
    }
    
    // Event listeners
    document.addEventListener('click', trackInteraction)
    document.addEventListener('scroll', trackScroll, { passive: true })
    
    return () => {
      clearInterval(timeTracker)
      if (typeof document !== 'undefined') {
        document.removeEventListener('click', trackInteraction)
        document.removeEventListener('scroll', trackScroll)
      }
    }
  }, [])
  
  // Aurora AI: Predictive Morphing Engine
  useEffect(() => {
    const morphedState = analyzeBehaviorPattern(userProfile)
    
    setMorphingState(prev => ({
      ...prev,
      ...morphedState,
      currentTheme: userProfile.emotionalProfile,
      adaptiveColors: {
        primary: `var(${EMOTIONAL_PROFILES[userProfile.emotionalProfile].colors[0]})`,
        secondary: `var(${EMOTIONAL_PROFILES[userProfile.emotionalProfile].colors[1]})`,
        accent: `var(${EMOTIONAL_PROFILES[userProfile.emotionalProfile].colors[2]})`,
        background: 'white'
      }
    }))
  }, [userProfile])
  
  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }))
  }
  
  const morphInterface = (trigger: string, data?: any) => {

    // Update mood based on triggers
    if (trigger === 'voice_search') {
      updateUserProfile({ 
        currentMood: 'exploring',
        emotionalProfile: data?.emotions?.[0] || userProfile.emotionalProfile
      })
    } else if (trigger === 'product_hover') {
      updateUserProfile({ currentMood: 'researching' })
    } else if (trigger === 'add_to_cart') {
      updateUserProfile({ currentMood: 'deciding' })
    } else if (trigger === 'quick_add') {
      updateUserProfile({ currentMood: 'impulse' })
    }
  }
  
  const getAdaptiveStyles = (): React.CSSProperties => {
    return {
      '--morphing-primary': morphingState.adaptiveColors.primary,
      '--morphing-secondary': morphingState.adaptiveColors.secondary,
      '--morphing-accent': morphingState.adaptiveColors.accent,
      '--morphing-animation-intensity': morphingState.layoutPreferences.animationIntensity.toString(),
    } as React.CSSProperties
  }
  
  return (
    <PredictiveMorphingContext.Provider 
      value={{
        userProfile,
        morphingState,
        updateUserProfile,
        morphInterface,
        getAdaptiveStyles
      }}
    >
      <div 
        className="aurora-morphing-container"
        style={getAdaptiveStyles()}
      >
        {children}
      </div>
    </PredictiveMorphingContext.Provider>
  )
}

// Aurora AI: Morphing Hook
export function usePredictiveMorphing() {
  const context = useContext(PredictiveMorphingContext)
  if (!context) {
    throw new Error('usePredictiveMorphing must be used within PredictiveMorphingProvider')
  }
  return context
}

// Aurora AI: Morphing Component Wrapper
export function MorphingComponent({ 
  children, 
  morphKey,
  className = ''
}: { 
  children: React.ReactNode
  morphKey: string
  className?: string 
}) {
  const { morphingState, morphInterface } = usePredictiveMorphing()
  
  return (
    <motion.div
      className={`aurora-morphing-component ${className}`}
      animate={{
        scale: morphingState.layoutPreferences.animationIntensity,
        opacity: 1
      }}
      transition={{
        duration: 0.6,
        ease: "easeOut"
      }}
      onMouseEnter={() => morphInterface('component_hover', { morphKey })}
      onMouseLeave={() => morphInterface('component_leave', { morphKey })}
    >
      {children}
    </motion.div>
  )
}

// Aurora AI: Adaptive Text Component
export function AdaptiveText({ 
  copyKey, 
  defaultText,
  className = ''
}: { 
  copyKey: string
  defaultText: string
  className?: string 
}) {
  const { morphingState } = usePredictiveMorphing()
  
  const adaptiveText = morphingState.personalizedContent.customizedCopy[copyKey] || defaultText
  
  return (
    <motion.span
      key={adaptiveText}
      className={`aurora-adaptive-text ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {adaptiveText}
    </motion.span>
  )
}