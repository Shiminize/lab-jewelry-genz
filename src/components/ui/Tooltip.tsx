'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
  disabled?: boolean
}

export function Tooltip({ 
  children, 
  content, 
  position = 'top',
  className,
  disabled = false
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [actualPosition, setActualPosition] = useState(position)
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Calculate position to avoid viewport edges
  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      }

      let newPosition = position

      // Check if tooltip would go off screen and adjust
      switch (position) {
        case 'top':
          if (triggerRect.top - tooltipRect.height < 0) {
            newPosition = 'bottom'
          }
          break
        case 'bottom':
          if (triggerRect.bottom + tooltipRect.height > viewport.height) {
            newPosition = 'top'
          }
          break
        case 'left':
          if (triggerRect.left - tooltipRect.width < 0) {
            newPosition = 'right'
          }
          break
        case 'right':
          if (triggerRect.right + tooltipRect.width > viewport.width) {
            newPosition = 'left'
          }
          break
      }

      setActualPosition(newPosition)
    }
  }, [isVisible, position])

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-foreground',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-foreground',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-foreground',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-foreground'
  }

  if (disabled) {
    return <>{children}</>
  }

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            'absolute z-50 px-3 py-2 text-sm text-background bg-foreground shadow-lg',
            'animate-fade-in max-w-xs whitespace-normal',
            positionClasses[actualPosition],
            className
          )}
          role="tooltip"
        >
          {content}
          
          {/* Arrow */}
          <div 
            className={cn(
              'absolute w-0 h-0 border-4',
              arrowClasses[actualPosition]
            )}
          />
        </div>
      )}
    </div>
  )
}