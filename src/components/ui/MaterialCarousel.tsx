/**
 * MaterialCarousel - Horizontal Material Selection Component
 * Provides swipeable, touch-friendly material selection with CLAUDE_RULES compliance
 * Integrates with existing MaterialControls design patterns
 */

'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { TouchGestureService, type GestureCallbacks } from '@/services/TouchGestureService'
import type { Material, MaterialId } from '@/components/customizer/types'

export interface MaterialCarouselProps {
  materials: Material[]
  selectedMaterial: MaterialId
  onMaterialChange: (materialId: MaterialId) => void
  isDisabled?: boolean
  className?: string
  enableTouchGestures?: boolean
  showScrollIndicators?: boolean
  itemWidth?: 'sm' | 'md' | 'lg'
  layout?: 'horizontal' | 'grid'
}

export const MaterialCarousel: React.FC<MaterialCarouselProps> = ({
  materials,
  selectedMaterial,
  onMaterialChange,
  isDisabled = false,
  className,
  enableTouchGestures = true,
  showScrollIndicators = true,
  itemWidth = 'md',
  layout = 'horizontal'
}) => {
  const carouselRef = useRef<HTMLDivElement>(null)
  const touchGestureService = useRef<TouchGestureService | null>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Item width configurations
  const widthConfigs = {
    sm: 'w-16 min-w-16', // 64px
    md: 'w-20 min-w-20', // 80px  
    lg: 'w-24 min-w-24'  // 96px
  }

  // Handle material selection with performance measurement
  const handleMaterialSelect = useCallback((materialId: MaterialId) => {
    if (isDisabled || isDragging) return
    
    const startTime = performance.now()
    onMaterialChange(materialId)
    
    // CLAUDE_RULES: <100ms material switch requirement
    const switchTime = performance.now() - startTime
    console.log(`[MATERIAL CAROUSEL] ${materialId}: ${switchTime.toFixed(2)}ms`)
  }, [onMaterialChange, isDisabled, isDragging])

  // Scroll utility functions
  const updateScrollState = useCallback(() => {
    if (!carouselRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    setScrollPosition(scrollLeft)
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
  }, [])

  const scrollTo = useCallback((position: number) => {
    if (!carouselRef.current) return

    carouselRef.current.scrollTo({
      left: position,
      behavior: 'smooth'
    })
  }, [])

  const scrollByAmount = useCallback((amount: number) => {
    if (!carouselRef.current) return
    
    const newPosition = carouselRef.current.scrollLeft + amount
    scrollTo(newPosition)
  }, [scrollTo])

  // Auto-scroll to selected material
  const scrollToSelected = useCallback(() => {
    if (!carouselRef.current) return

    const selectedIndex = materials.findIndex(m => m.id === selectedMaterial)
    if (selectedIndex === -1) return

    const itemWidth = carouselRef.current.children[0]?.getBoundingClientRect().width || 80
    const containerWidth = carouselRef.current.clientWidth
    const targetPosition = (selectedIndex * itemWidth) - (containerWidth / 2) + (itemWidth / 2)
    
    scrollTo(Math.max(0, targetPosition))
  }, [materials, selectedMaterial, scrollTo])

  // Touch gesture integration
  const touchGestureCallbacks: GestureCallbacks = {
    onPanStart: () => {
      setIsDragging(true)
    },

    onPanMove: (delta) => {
      if (!carouselRef.current) return
      
      // Horizontal scrolling with delta
      const scrollSensitivity = 1.2
      const newScrollLeft = carouselRef.current.scrollLeft - (delta.x * scrollSensitivity)
      carouselRef.current.scrollLeft = Math.max(0, Math.min(
        newScrollLeft,
        carouselRef.current.scrollWidth - carouselRef.current.clientWidth
      ))
      
      updateScrollState()
    },

    onPanEnd: (velocity) => {
      setIsDragging(false)
      
      // Momentum scrolling based on velocity
      const momentumMultiplier = 0.5
      const momentumDistance = velocity.x * momentumMultiplier
      
      if (Math.abs(momentumDistance) > 50) {
        scrollByAmount(-momentumDistance) // Negative for natural direction
      }
    },

    onTap: (position) => {
      // Find which material was tapped
      if (!carouselRef.current) return
      
      const rect = carouselRef.current.getBoundingClientRect()
      const relativeX = position.x - rect.left + carouselRef.current.scrollLeft
      const itemWidth = carouselRef.current.children[0]?.getBoundingClientRect().width || 80
      const tappedIndex = Math.floor(relativeX / itemWidth)
      
      if (tappedIndex >= 0 && tappedIndex < materials.length) {
        handleMaterialSelect(materials[tappedIndex].id)
      }
    }
  }

  // Initialize touch gestures
  useEffect(() => {
    if (enableTouchGestures && carouselRef.current) {
      touchGestureService.current = new TouchGestureService(touchGestureCallbacks)
      touchGestureService.current.attachToElement(carouselRef.current)
    }

    return () => {
      if (touchGestureService.current) {
        touchGestureService.current.destroy()
        touchGestureService.current = null
      }
    }
  }, [enableTouchGestures])

  // Update scroll state on mount and resize
  useEffect(() => {
    updateScrollState()
    
    const handleResize = () => updateScrollState()
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [updateScrollState])

  // Auto-scroll to selected material when it changes
  useEffect(() => {
    const timer = setTimeout(scrollToSelected, 100)
    return () => clearTimeout(timer)
  }, [selectedMaterial, scrollToSelected])

  // Grid layout for larger screens
  if (layout === 'grid') {
    return (
      <div className={cn("space-y-4", className)}>
        <h3 className="font-headline text-lg text-foreground">
          Metal Type
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {materials.map((material) => {
            const isSelected = selectedMaterial === material.id
            
            return (
              <Button
                key={material.id}
                variant={isSelected ? 'primary' : 'secondary'}
                onClick={() => handleMaterialSelect(material.id)}
                disabled={isDisabled}
                className={cn(
                  "justify-start h-auto p-4 transition-all duration-200",
                  isSelected && "ring-2 ring-cta ring-offset-2"
                )}
                aria-pressed={isSelected}
                data-material={material.id}
              >
                <div className="flex items-center space-x-3 w-full">
                  <div 
                    className="w-5 h-5 rounded-full border-2 border-border shadow-sm flex-shrink-0"
                    style={{ backgroundColor: material.pbrProperties.color }}
                    aria-hidden="true"
                  />
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-sm truncate">
                      {material.displayName}
                    </div>
                    <div className="text-xs text-aurora-nav-muted flex items-center space-x-2">
                      <span>
                        {material.priceModifier >= 0 ? '+' : ''}
                        ${Math.abs(material.priceModifier)}
                      </span>
                      {isSelected && <span className="text-cta">✓</span>}
                    </div>
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </div>
    )
  }

  // Horizontal carousel layout
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-lg text-foreground">
          Metal Type
        </h3>
        <div className="text-sm text-muted-foreground">
          {enableTouchGestures ? 'Swipe to browse' : `${materials.length} options`}
        </div>
      </div>

      {/* Carousel container */}
      <div className="relative">
        {/* Scroll indicators */}
        {showScrollIndicators && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scrollByAmount(-100)}
              disabled={!canScrollLeft}
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 z-10 shadow-md bg-background/90 backdrop-blur-sm",
                "opacity-0 transition-opacity duration-200",
                canScrollLeft && "opacity-100"
              )}
              aria-label="Scroll left"
            >
              ←
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scrollByAmount(100)}
              disabled={!canScrollRight}
              className={cn(
                "absolute right-0 top-1/2 -translate-y-1/2 z-10 shadow-md bg-background/90 backdrop-blur-sm",
                "opacity-0 transition-opacity duration-200",
                canScrollRight && "opacity-100"
              )}
              aria-label="Scroll right"
            >
              →
            </Button>
          </>
        )}

        {/* Scrollable material list */}
        <div
          ref={carouselRef}
          className={cn(
            "flex space-x-3 overflow-x-auto scroll-smooth",
            "scrollbar-none pb-2 px-1", // Hide scrollbar, add padding for focus rings
            enableTouchGestures && "select-none"
          )}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            touchAction: enableTouchGestures ? 'pan-x' : 'auto'
          }}
          onScroll={updateScrollState}
        >
          {materials.map((material) => {
            const isSelected = selectedMaterial === material.id
            
            return (
              <button
                key={material.id}
                onClick={() => handleMaterialSelect(material.id)}
                disabled={isDisabled || isDragging}
                className={cn(
                  widthConfigs[itemWidth],
                  "flex-shrink-0 p-3 border-2 transition-all duration-200",
                  "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cta focus:ring-offset-2",
                  "bg-background",
                  isSelected
                    ? 'border-cta bg-cta/10 shadow-sm' 
                    : 'border-border hover:border-cta/50',
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
                aria-pressed={isSelected}
                aria-label={`Select ${material.displayName}`}
                data-material={material.id}
              >
                <div className="space-y-2 w-full">
                  {/* Material color indicator */}
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-border shadow-sm mx-auto"
                    style={{ backgroundColor: material.pbrProperties.color }}
                    aria-hidden="true"
                  />
                  
                  {/* Material name */}
                  <div className="text-xs font-medium text-foreground text-center line-clamp-2">
                    {material.displayName}
                  </div>
                  
                  {/* Price modifier */}
                  <div className="text-xs text-muted-foreground text-center">
                    {material.priceModifier >= 0 ? '+' : ''}
                    ${Math.abs(material.priceModifier)}
                  </div>
                  
                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="text-cta text-center text-sm">
                      ✓
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Touch gesture hints */}
      {enableTouchGestures && (
        <div className="text-xs text-muted-foreground text-center p-2 bg-muted/10 rounded">
          👆 Swipe to browse • Tap to select • Auto-scrolls to selection
        </div>
      )}
    </div>
  )
}

export default MaterialCarousel