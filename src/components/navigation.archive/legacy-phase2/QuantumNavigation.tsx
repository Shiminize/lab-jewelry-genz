'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { AISurpriseRecommendation } from './AISurpriseRecommendation'
import { AuroraHeatMap } from './AuroraHeatMap'

// Aurora Quantum Navigation - Exact Demo Implementation
interface QuantumNavigationProps {
  className?: string
  onNavigate?: (path: string, layer: 'surface' | 'discovery' | 'deep') => void
}

// Voice Search Modal State
interface VoiceSearchState {
  isOpen: boolean
  isListening: boolean
  transcript: string
}

// Deep Filter State
interface DeepFilterState {
  isOpen: boolean
  selectedFilters: string[]
  priceRange: [number, number]
}

interface NavigationState {
  currentLayer: 'surface' | 'discovery' | 'deep'
  activeCategory: string | null
  morphed: boolean
  morphIntensity?: number
  socialProofVisible: boolean
}

// Aurora Demo Data - Exact Implementation
const SURFACE_MENU_ITEMS = [
  { label: 'Rings', href: '/catalog?type=rings' },
  { label: 'Necklaces', href: '/catalog?type=necklaces' },
  { label: 'Earrings', href: '/catalog?type=earrings' },
  { label: 'Bracelets', href: '/catalog?type=bracelets' },
  { label: "Men's", href: '/catalog?type=mens' }
]

const DISCOVERY_MOOD_CARDS = [
  { icon: '🎉', label: 'Celebrate' },
  { icon: '💕', label: 'Express Love' },
  { icon: '🌟', label: 'Achieve' },
  { icon: '🎁', label: 'Gift' },
  { icon: '💍', label: 'Propose' },
  { icon: '🎂', label: 'Birthday' },
  { icon: '🏆', label: 'Milestone' },
  { icon: '💼', label: 'Professional' }
]

const DEEP_FILTER_SECTIONS = [
  {
    title: 'Diamond 4Cs',
    options: [
      { id: 'cut-excellent', label: 'Cut: Excellent' },
      { id: 'clarity-vs1', label: 'Clarity: VS1+' },
      { id: 'color-d-f', label: 'Color: D-F' },
      { id: 'carat-1-2', label: 'Carat: 1.0-2.0' }
    ]
  },
  {
    title: 'Metal Type',
    options: [
      { id: 'platinum', label: 'Platinum' },
      { id: 'gold-18k', label: '18K Gold' },
      { id: 'rose-gold', label: 'Rose Gold' },
      { id: 'white-gold', label: 'White Gold' }
    ]
  },
  {
    title: 'Advanced Settings',
    options: [
      { id: 'fluorescence-none', label: 'Fluorescence: None' },
      { id: 'symmetry-excellent', label: 'Symmetry: Excellent' },
      { id: 'polish-excellent', label: 'Polish: Excellent' }
    ]
  }
]

const SOCIAL_PROOF_ITEMS = [
  '🔥 Sarah in NYC just customized a ring',
  '⭐ Mike in LA saved 5 items', 
  '💎 Emma in London is viewing diamonds',
  '🎨 James in Tokyo designed a unique piece'
]

export const QuantumNavigation = React.memo(({ className, onNavigate }: QuantumNavigationProps) => {
  // Aurora Demo State Management - Optimized with performance considerations
  const [navState, setNavState] = useState<NavigationState>({
    currentLayer: 'surface',
    activeCategory: null,
    morphed: false,
    socialProofVisible: true
  })
  
  const [voiceSearch, setVoiceSearch] = useState<VoiceSearchState>({
    isOpen: false,
    isListening: false,
    transcript: ''
  })
  
  const [deepFilters, setDeepFilters] = useState<DeepFilterState>({
    isOpen: false,
    selectedFilters: [],
    priceRange: [1000, 50000]
  })

  const [aiSurpriseModal, setAiSurpriseModal] = useState(false)
  
  const [scrollVelocity, setScrollVelocity] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const navRef = useRef<HTMLElement>(null)
  const socialProofIndex = useRef(0)

  // Gesture Controls State
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null)
  const [touchEnd, setTouchEnd] = useState<{x: number, y: number} | null>(null)
  
  // Aurora Demo: Smart Sticky Navigation with Velocity Prediction & Advanced Morphing
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDifference = currentScrollY - lastScrollY.current
      const velocity = Math.abs(scrollDifference)
      
      setScrollVelocity(velocity)
      
      // Predict scroll intent 100ms ahead (Aurora Demo feature)
      if (velocity > 5) {
        // Fast scroll down - hide navigation
        if (scrollDifference > 0) {
          setIsVisible(false)
        } else {
          // Fast scroll up or near top - show navigation  
          setIsVisible(true)
        }
      } else if (currentScrollY < 100) {
        setIsVisible(true)
      }
      
      // Advanced morphed state with progressive transformation
      const morphIntensity = Math.min(currentScrollY / 400, 1) // 0 to 1 based on scroll
      setNavState(prev => ({
        ...prev,
        morphed: currentScrollY > 200,
        morphIntensity
      }))
      
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Aurora Demo: Layer Switching Functions
  const handleLayerSwitch = (layer: 'surface' | 'discovery' | 'deep') => {
    setNavState(prev => ({ ...prev, currentLayer: layer }))
    
    // Show deep filters panel when in deep layer
    if (layer === 'deep') {
      setDeepFilters(prev => ({ ...prev, isOpen: true }))
    } else {
      setDeepFilters(prev => ({ ...prev, isOpen: false }))
    }
    
    onNavigate?.(`/${layer}`, layer)
  }

  // Aurora Demo: Voice Search Functions
  const handleVoiceSearch = () => {
    setVoiceSearch({ isOpen: true, isListening: true, transcript: '' })
    
    // Simulate listening for 3 seconds
    setTimeout(() => {
      setVoiceSearch(prev => ({ ...prev, isListening: false }))
      setTimeout(() => {
        setVoiceSearch({ isOpen: false, isListening: false, transcript: '' })
      }, 2000)
    }, 3000)
  }

  // Aurora Demo: Filter Functions  
  const handleFilterToggle = (filterId: string) => {
    setDeepFilters(prev => ({
      ...prev,
      selectedFilters: prev.selectedFilters.includes(filterId)
        ? prev.selectedFilters.filter(f => f !== filterId)
        : [...prev.selectedFilters, filterId]
    }))
  }

  // Aurora Demo: Social Proof Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      socialProofIndex.current = (socialProofIndex.current + 1) % SOCIAL_PROOF_ITEMS.length
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  // Aurora Demo: Visual Search Handler
  const handleVisualSearch = () => {
    alert('Camera opening for visual search...\nUpload a photo to find similar styles')
  }
  
  // Aurora Demo: Surprise Me Handler
  const handleSurpriseMe = () => {
    setAiSurpriseModal(true)
  }

  // Gesture Controls for Mobile Layer Switching
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY)
    const minSwipeDistance = 50

    if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
      const layers = ['surface', 'discovery', 'deep'] as const
      const currentIndex = layers.indexOf(navState.currentLayer)
      
      if (distanceX > 0) {
        // Swiped left - next layer
        const nextIndex = (currentIndex + 1) % layers.length
        handleLayerSwitch(layers[nextIndex])
      } else {
        // Swiped right - previous layer
        const prevIndex = currentIndex === 0 ? layers.length - 1 : currentIndex - 1
        handleLayerSwitch(layers[prevIndex])
      }
    }
  }

  // Phase 4: Advanced Predictive Navigation Intelligence
  const [userBehaviorData, setUserBehaviorData] = useState({
    hoveredCategories: [] as string[],
    searchPatterns: [] as string[],
    layerSwitchFrequency: { surface: 0, discovery: 0, deep: 0 },
    predictedIntent: null as string | null
  })

  // Phase 4: Predictive Layer Recommendation Engine
  const predictNextLayer = () => {
    const { hoveredCategories, layerSwitchFrequency } = userBehaviorData
    
    // Analyze user behavior patterns
    if (hoveredCategories.length >= 3) {
      // User is exploring multiple categories - suggest Discovery layer
      return 'discovery'
    } else if (layerSwitchFrequency.deep > 2) {
      // Power user who uses Deep filters frequently
      return 'deep'
    } else if (navState.currentLayer === 'discovery' && hoveredCategories.length >= 1) {
      // User engaged in Discovery, predict they'll want Deep filtering
      return 'deep'
    }
    return null
  }

  // Phase 4: Smart Behavior Tracking - Optimized with useCallback
  const trackUserInteraction = useCallback((action: string, category?: string) => {
    setUserBehaviorData(prev => {
      const updated = { ...prev }
      
      if (action === 'hover' && category) {
        if (!updated.hoveredCategories.includes(category)) {
          updated.hoveredCategories = [...updated.hoveredCategories.slice(-4), category]
        }
      } else if (action === 'layerSwitch') {
        const layer = navState.currentLayer
        updated.layerSwitchFrequency = {
          ...updated.layerSwitchFrequency,
          [layer]: updated.layerSwitchFrequency[layer] + 1
        }
      }
      
      // Update predicted intent
      updated.predictedIntent = predictNextLayer()
      return updated
    })
  }, [predictNextLayer])

  // Phase 4: Enhanced Layer Switch with Analytics - Optimized
  const handleLayerSwitchWithTracking = useCallback((layer: 'surface' | 'discovery' | 'deep') => {
    trackUserInteraction('layerSwitch')
    handleLayerSwitch(layer)
  }, [trackUserInteraction])

  // Phase 4: Intelligent Filter Suggestions - Memoized for performance
  const getSmartFilterSuggestions = useMemo(() => {
    const { hoveredCategories } = userBehaviorData
    const suggestions = []

    if (hoveredCategories.includes('rings')) {
      suggestions.push('carat-1-2', 'cut-excellent')
    }
    if (hoveredCategories.includes('necklaces')) {
      suggestions.push('platinum', 'gold-18k')
    }
    if (hoveredCategories.length >= 2) {
      suggestions.push('clarity-vs1', 'color-d-f')
    }

    return suggestions
  }, [userBehaviorData.hoveredCategories])

  // Phase 4: Auto-suggest filters based on behavior - Optimized
  useEffect(() => {
    if (navState.currentLayer === 'deep' && userBehaviorData.predictedIntent) {
      // Auto-apply intelligent filter suggestions
      setDeepFilters(prev => ({
        ...prev,
        selectedFilters: [...new Set([...prev.selectedFilters, ...getSmartFilterSuggestions.slice(0, 2)])]
      }))
    }
  }, [navState.currentLayer, userBehaviorData.predictedIntent, getSmartFilterSuggestions])

  // Phase 4: Predictive Search Intelligence
  const [predictiveSearch, setPredictiveSearch] = useState({
    isActive: false,
    suggestions: [] as string[],
    confidence: 0
  })

  // Phase 4: Generate predictive search suggestions
  const generateSearchSuggestions = (hoveredCategories: string[]) => {
    const suggestions = []
    
    if (hoveredCategories.includes('rings')) {
      suggestions.push('engagement rings', 'diamond rings', 'vintage rings')
    }
    if (hoveredCategories.includes('necklaces')) {
      suggestions.push('pendant necklaces', 'diamond necklaces', 'tennis necklaces')
    }
    if (hoveredCategories.length >= 2) {
      suggestions.push('matching sets', 'bridal collection', 'custom designs')
    }
    
    return suggestions
  }

  // Phase 4: Update predictive search based on user behavior
  useEffect(() => {
    const { hoveredCategories } = userBehaviorData
    
    if (hoveredCategories.length >= 2) {
      const suggestions = generateSearchSuggestions(hoveredCategories)
      const confidence = Math.min(hoveredCategories.length * 0.3, 1)
      
      setPredictiveSearch({
        isActive: true,
        suggestions: suggestions.slice(0, 3),
        confidence
      })
    } else {
      setPredictiveSearch({
        isActive: false,
        suggestions: [],
        confidence: 0
      })
    }
  }, [userBehaviorData.hoveredCategories])

  return (
    <motion.nav
      ref={navRef}
      role="navigation"
      aria-label="Aurora Quantum Navigation"
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        'backdrop-blur-xl border-b border-border',
        // Enhanced sticky behavior based on visibility
        isVisible ? 'translate-y-0' : '-translate-y-full',
        // Dynamic background with morphing intensity
        navState.morphed 
          ? 'bg-white/95 shadow-lg border-b-2 border-[var(--aurora-pink)]/30' 
          : 'bg-white/98',
        className
      )}
      initial={{ opacity: 0, y: -100 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: navState.currentLayer === 'deep' ? 1.02 : 1,
        // Advanced morphing based on scroll intensity
        borderRadius: navState.morphed ? '0 0 16px 16px' : '0',
        boxShadow: navState.morphed 
          ? '0 10px 25px rgba(0,0,0,0.1), 0 0 30px rgba(168, 85, 247, 0.1)' 
          : '0 1px 3px rgba(0,0,0,0.05)'
      }}
      transition={{ 
        duration: 0.4, 
        ease: 'easeInOut',
        scale: { duration: 0.2 },
        borderRadius: { duration: 0.5 },
        boxShadow: { duration: 0.4 }
      }}
      style={{
        // Dynamic CSS variables based on morph intensity
        '--aurora-morph-intensity': navState.morphIntensity || 0,
        '--aurora-glow-opacity': navState.morphed ? 0.6 : 0,
        background: navState.morphed 
          ? `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 50%, rgba(255,255,255,0.95) 100%)`
          : undefined
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <div className="text-2xl font-bold bg-gradient-to-r from-[var(--nebula-purple)] to-[var(--aurora-pink)] bg-clip-text text-transparent">
              Aurora
            </div>
          </div>

          {/* Enhanced Layer Toggle Buttons with Aurora Morphing - Phase 3 */}
          <motion.div 
            className={cn(
              "flex border rounded-lg p-1 shadow-sm touch-pan-y transition-all duration-500",
              navState.morphed 
                ? "bg-gradient-to-r from-white/95 via-gray-50/98 to-white/95 border-[var(--aurora-pink)]/30 shadow-lg"
                : "bg-white border-gray-200"
            )}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            animate={{
              boxShadow: navState.morphed
                ? '0 4px 20px rgba(168, 85, 247, 0.15), 0 0 30px rgba(236, 72, 153, 0.1)'
                : '0 1px 3px rgba(0,0,0,0.1)'
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            {['surface', 'discovery', 'deep'].map((layer, index) => (
              <motion.button
                key={layer}
                onClick={() => handleLayerSwitchWithTracking(layer as any)}
                className={cn(
                  'px-4 py-2 text-sm font-semibold rounded-md transition-all duration-300 capitalize select-none relative overflow-hidden',
                  navState.currentLayer === layer
                    ? 'text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50/80'
                )}
                animate={{
                  background: navState.currentLayer === layer
                    ? navState.morphed
                      ? 'linear-gradient(135deg, rgba(168, 85, 247, 1) 0%, rgba(236, 72, 153, 0.9) 50%, rgba(168, 85, 247, 1) 100%)'
                      : 'linear-gradient(90deg, var(--nebula-purple) 0%, var(--aurora-pink) 100%)'
                    : 'transparent'
                }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -1,
                  boxShadow: navState.currentLayer === layer 
                    ? '0 6px 20px rgba(168, 85, 247, 0.3)'
                    : '0 2px 8px rgba(0,0,0,0.1)'
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                {/* Animated background glow for active layer */}
                <AnimatePresence>
                  {navState.currentLayer === layer && (
                    <motion.div
                      className="absolute inset-0 rounded-md"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        background: [
                          'linear-gradient(135deg, rgba(168, 85, 247, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%)',
                          'linear-gradient(135deg, rgba(236, 72, 153, 0.8) 0%, rgba(168, 85, 247, 0.8) 100%)',
                          'linear-gradient(135deg, rgba(168, 85, 247, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%)'
                        ]
                      }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ 
                        duration: 0.3,
                        background: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                      }}
                    />
                  )}
                </AnimatePresence>
                
                {/* Phase 4: Predictive Navigation Indicator */}
                <AnimatePresence>
                  {userBehaviorData.predictedIntent === layer && navState.currentLayer !== layer && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full z-20"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: 1, 
                        opacity: 1,
                        boxShadow: [
                          '0 0 0 0 rgba(251, 191, 36, 0.4)',
                          '0 0 0 8px rgba(251, 191, 36, 0)',
                          '0 0 0 0 rgba(251, 191, 36, 0)'
                        ]
                      }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ 
                        duration: 0.3,
                        boxShadow: { duration: 2, repeat: Infinity, ease: 'easeOut' }
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* Layer text with enhanced morphing */}
                <motion.span 
                  className="relative z-10"
                  animate={{
                    textShadow: navState.currentLayer === layer && navState.morphed
                      ? '0 0 10px rgba(255,255,255,0.5)'
                      : '0 0 0px rgba(255,255,255,0)'
                  }}
                >
                  {layer}
                </motion.span>
                
                {/* Enhanced mobile swipe indicators with morphing */}
                <motion.div 
                  className="md:hidden text-xs opacity-50 mt-1 relative z-10"
                  animate={{
                    color: navState.currentLayer === layer 
                      ? navState.morphed ? '#ffffff' : '#ffffff'
                      : '#6b7280'
                  }}
                >
                  <motion.span
                    animate={{ 
                      opacity: [0.5, 1, 0.5],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: 'easeInOut',
                      delay: index * 0.2
                    }}
                  >
                    ←→
                  </motion.span>
                </motion.div>
              </motion.button>
            ))}
            
            {/* Animated border highlight */}
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-transparent pointer-events-none"
              animate={{
                borderImage: navState.morphed
                  ? [
                    'linear-gradient(90deg, rgba(168, 85, 247, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%) 1',
                    'linear-gradient(90deg, rgba(236, 72, 153, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%) 1',
                    'linear-gradient(90deg, rgba(168, 85, 247, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%) 1'
                  ]
                  : 'none'
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </motion.div>

          {/* Right Actions - Enhanced Smart Features */}
          <div className="flex items-center space-x-2">
            {/* Smart Action Buttons with Aurora Styling */}
            <div className="flex items-center space-x-1 bg-gray-50 rounded-full p-1">
              <button
                onClick={handleVoiceSearch}
                className="group relative p-2 text-gray-600 hover:text-[var(--aurora-pink)] hover:bg-white rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                aria-label="Voice Search - AI Powered"
              >
                <span className="text-lg">🎤</span>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Voice Search
                </div>
              </button>
              
              <button
                onClick={handleVisualSearch}
                className="group relative p-2 text-gray-600 hover:text-[var(--nebula-purple)] hover:bg-white rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                aria-label="Visual Search - AI Image Recognition"
              >
                <span className="text-lg">📷</span>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Visual Search
                </div>
              </button>
              
              <button
                onClick={handleSurpriseMe}
                className="group relative p-2 text-gray-600 hover:text-[var(--aurora-pink)] hover:bg-white rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                aria-label="AI Surprise Me - Personalized Recommendations"
              >
                <span className="text-lg">✨</span>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Surprise Me
                </div>
              </button>
            </div>
            
            {/* Premium CTA Button */}
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex items-center space-x-1 bg-gradient-to-r from-[var(--nebula-purple)] to-[var(--aurora-pink)] text-white border-none hover:shadow-lg transition-all duration-200"
            >
              <span className="text-xs">👑</span>
              <span className="text-sm font-medium">VIP</span>
            </Button>
          </div>
        </div>

        {/* Surface Layer Menu - Enhanced with Aurora Morphing */}
        <AnimatePresence mode="wait">
          {navState.currentLayer === 'surface' && (
            <motion.div
              key="surface"
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ 
                opacity: 1, 
                height: 'auto', 
                y: 0,
                background: navState.morphed 
                  ? 'linear-gradient(90deg, rgba(168, 85, 247, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)'
                  : 'transparent'
              }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ 
                duration: 0.5, 
                ease: 'easeInOut',
                height: { duration: 0.3 },
                background: { duration: 0.6 }
              }}
              className="border-t border-gray-100 py-4 overflow-hidden"
            >
              <div className="flex items-center justify-center space-x-8">
                {SURFACE_MENU_ITEMS.map((item, index) => (
                  <motion.a
                    key={index}
                    href={item.href}
                    className="text-gray-700 hover:text-[var(--aurora-pink)] font-medium transition-all duration-300 px-3 py-2 rounded-lg hover:bg-[var(--aurora-pink)]/10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onMouseEnter={() => trackUserInteraction('hover', item.label.toLowerCase())}
                  >
                    {item.label}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Discovery Layer - Enhanced Mood Cards with Aurora Morphing */}
        <AnimatePresence mode="wait">
          {navState.currentLayer === 'discovery' && (
            <motion.div
              key="discovery"
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                height: 'auto', 
                scale: 1,
                background: navState.morphed
                  ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(236, 72, 153, 0.08) 50%, rgba(168, 85, 247, 0.08) 100%)'
                  : 'transparent'
              }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ 
                duration: 0.6, 
                ease: 'easeInOut',
                scale: { duration: 0.4 },
                background: { duration: 0.8 }
              }}
              className="border-t border-gray-100 py-6 overflow-hidden"
            >
              <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
                {DISCOVERY_MOOD_CARDS.map((card, index) => (
                  <motion.button
                    key={index}
                    className={cn(
                      "flex flex-col items-center p-4 rounded-lg transition-all duration-300 group relative overflow-hidden",
                      "bg-gray-50 hover:bg-gradient-to-br hover:from-[var(--aurora-pink)]/10 hover:to-[var(--nebula-purple)]/10",
                      "border border-transparent hover:border-[var(--aurora-pink)]/20",
                      "shadow-sm hover:shadow-md"
                    )}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    transition={{ 
                      delay: index * 0.08, 
                      duration: 0.4,
                      ease: 'easeOut'
                    }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -3,
                      boxShadow: '0 8px 25px rgba(168, 85, 247, 0.15)'
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Animated background glow */}
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-gradient-to-br from-[var(--aurora-pink)]/20 to-[var(--nebula-purple)]/20 opacity-0"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    <motion.span 
                      className="text-2xl mb-2 relative z-10"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {card.icon}
                    </motion.span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-[var(--aurora-pink)] relative z-10 transition-colors duration-200">
                      {card.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Social Proof Ticker with Aurora Morphing */}
        {navState.socialProofVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              background: navState.morphed
                ? 'linear-gradient(90deg, rgba(168, 85, 247, 0.03) 0%, rgba(236, 72, 153, 0.03) 50%, rgba(168, 85, 247, 0.03) 100%)'
                : 'transparent'
            }}
            transition={{ 
              duration: 0.4, 
              background: { duration: 0.8 } 
            }}
            className="border-t border-gray-100 py-2 overflow-hidden relative"
          >
            {/* Animated gradient background */}
            <motion.div
              className="absolute inset-0 opacity-0"
              animate={{
                background: [
                  'linear-gradient(90deg, rgba(168, 85, 247, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
                  'linear-gradient(90deg, rgba(236, 72, 153, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
                  'linear-gradient(90deg, rgba(168, 85, 247, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)'
                ],
                opacity: navState.morphed ? [0, 0.3, 0] : 0
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            
            <div className="flex items-center justify-center text-sm text-gray-600 relative z-10">
              <motion.div
                animate={{ x: [0, -120, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="flex items-center space-x-3"
              >
                <motion.span
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="text-[var(--aurora-pink)]"
                >
                  🔥
                </motion.span>
                <motion.span
                  className="font-medium"
                  animate={{
                    color: navState.morphed 
                      ? ['#6b7280', '#a855f7', '#ec4899', '#6b7280']
                      : '#6b7280'
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  {SOCIAL_PROOF_ITEMS[socialProofIndex.current]}
                </motion.span>
                
                {/* Sparkle effects */}
                <motion.span
                  className="text-xs opacity-60"
                  animate={{ 
                    opacity: [0.6, 1, 0.6],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                >
                  ✨
                </motion.span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Aurora Heat Map Overlay - Phase 3 Visual Enhancement */}
      <AuroraHeatMap 
        isVisible={navState.currentLayer === 'deep' && navState.morphed}
        morphIntensity={navState.morphIntensity || 0}
      />

      {/* Phase 4: Predictive Search Suggestions Panel */}
      <AnimatePresence>
        {predictiveSearch.isActive && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-2xl p-4 z-40 min-w-[320px]"
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                Smart Suggestions
              </h4>
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {Math.round(predictiveSearch.confidence * 100)}% match
              </div>
            </div>
            
            <div className="space-y-2">
              {predictiveSearch.suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="w-full text-left p-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 text-sm text-gray-700 hover:text-gray-900 flex items-center gap-2"
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // Simulate search action
                    window.location.href = `/catalog?q=${encodeURIComponent(suggestion)}`
                  }}
                >
                  <motion.div
                    className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
                  />
                  {suggestion}
                </motion.button>
              ))}
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Based on your browsing patterns • AI-powered
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Search Modal */}
      <AnimatePresence>
        {voiceSearch.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setVoiceSearch({ isOpen: false, isListening: false, transcript: '' })}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className={cn(
                  'w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center',
                  voiceSearch.isListening 
                    ? 'bg-red-100 text-red-600 animate-pulse' 
                    : 'bg-gray-100 text-gray-600'
                )}>
                  🎤
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {voiceSearch.isListening ? 'Listening...' : 'Voice Search'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {voiceSearch.isListening 
                    ? 'Try saying "Show me diamond rings under $5000"'
                    : 'Click and speak your search query'
                  }
                </p>
                {voiceSearch.transcript && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-800">{voiceSearch.transcript}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deep Layer - Side Filter Panel */}
      <AnimatePresence>
        {deepFilters.isOpen && navState.currentLayer === 'deep' && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-16 bottom-0 w-80 bg-white shadow-2xl border-l border-gray-200 z-40 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Deep Filters</h3>
                <button
                  onClick={() => setDeepFilters(prev => ({ ...prev, isOpen: false }))}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Phase 4: Smart Filter Suggestions */}
              {getSmartFilterSuggestions().length > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <motion.div
                      className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    Smart Recommendations
                  </h4>
                  <p className="text-xs text-gray-600 mb-3">Based on your interests:</p>
                  <div className="flex flex-wrap gap-2">
                    {getSmartFilterSuggestions().map((filterId) => {
                      const allOptions = DEEP_FILTER_SECTIONS.flatMap(section => section.options)
                      const option = allOptions.find(opt => opt.id === filterId)
                      return option ? (
                        <motion.button
                          key={filterId}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={cn(
                            "px-3 py-1.5 text-xs rounded-full transition-all duration-200 border",
                            deepFilters.selectedFilters.includes(filterId)
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-sm"
                              : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                          )}
                          onClick={() => handleFilterToggle(filterId)}
                        >
                          {option.label}
                        </motion.button>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              {DEEP_FILTER_SECTIONS.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">{section.title}</h4>
                  <div className="space-y-2">
                    {section.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[var(--aurora-pink)] focus:ring-[var(--aurora-pink)]"
                          checked={deepFilters.selectedFilters.includes(option.id)}
                          onChange={() => handleFilterToggle(option.id)}
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="border-t pt-6">
                <Button 
                  className="w-full bg-gradient-to-r from-[var(--nebula-purple)] to-[var(--aurora-pink)] text-white"
                  onClick={handleSurpriseMe}
                >
                  Surprise Me
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Surprise Recommendation Modal */}
      <AISurpriseRecommendation
        isOpen={aiSurpriseModal}
        onClose={() => setAiSurpriseModal(false)}
        userPreferences={{
          style: ['minimalist', 'modern'],
          priceRange: deepFilters.priceRange,
          materials: deepFilters.selectedFilters.filter(f => f.includes('platinum') || f.includes('gold'))
        }}
      />
    </motion.nav>
  )
})

// Performance optimization: Set display name for better debugging
QuantumNavigation.displayName = 'QuantumNavigation'