'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ProductTagChip } from './ProductTagChip'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

interface ProductTagsListProps {
  tags: string[]
  maxVisible?: {
    mobile: number
    desktop: number
  }
  onTagClick?: (tag: string) => void
  className?: string
  showExpandButton?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ProductTagsList({
  tags,
  maxVisible = { mobile: 2, desktop: 3 },
  onTagClick,
  className,
  showExpandButton = false,
  size = 'md'
}: ProductTagsListProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Check if we're on mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  if (!tags || tags.length === 0) {
    return null
  }

  const maxToShow = isMobile ? maxVisible.mobile : maxVisible.desktop
  const visibleTags = isExpanded ? tags : tags.slice(0, maxToShow)
  const hasMoreTags = tags.length > maxToShow
  const hiddenCount = tags.length - maxToShow

  const handleTagClick = (tag: string) => {
    onTagClick?.(tag)
  }

  const toggleExpanded = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        'flex flex-wrap items-center gap-1.5 min-h-0',
        className
      )}
    >
      {visibleTags.map((tag, index) => (
        <ProductTagChip
          key={`${tag}-${index}`}
          tag={tag}
          onTagClick={handleTagClick}
          size={size}
          className="flex-shrink-0"
        />
      ))}
      
      {hasMoreTags && !isExpanded && showExpandButton && (
        <button
          onClick={toggleExpanded}
          className={cn(
            'inline-flex items-center gap-0.5 px-1.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/50',
            size === 'sm' && 'px-1 py-0.5 text-xs',
            size === 'lg' && 'px-2 py-1.5 text-sm'
          )}
          aria-label={`Show ${hiddenCount} more tags`}
        >
          <span>+{hiddenCount}</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      )}
      
      {isExpanded && showExpandButton && (
        <button
          onClick={toggleExpanded}
          className={cn(
            'inline-flex items-center gap-0.5 px-1.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/50',
            size === 'sm' && 'px-1 py-0.5 text-xs',
            size === 'lg' && 'px-2 py-1.5 text-sm'
          )}
          aria-label="Show fewer tags"
        >
          <span>Less</span>
          <ChevronRight className="w-3 h-3 rotate-90" />
        </button>
      )}
    </div>
  )
}

// Alternative compact layout for very constrained spaces
export function ProductTagsListCompact({
  tags,
  maxVisible = 2,
  onTagClick,
  className,
  size = 'sm'
}: Omit<ProductTagsListProps, 'maxVisible' | 'showExpandButton'> & {
  maxVisible?: number
}) {
  if (!tags || tags.length === 0) {
    return null
  }

  const visibleTags = tags.slice(0, maxVisible)
  const hasMoreTags = tags.length > maxVisible
  const hiddenCount = tags.length - maxVisible

  return (
    <div className={cn('flex items-center gap-1 min-h-0', className)}>
      {visibleTags.map((tag, index) => (
        <ProductTagChip
          key={`${tag}-${index}`}
          tag={tag}
          onTagClick={onTagClick}
          size={size}
          className="flex-shrink-0"
        />
      ))}
      
      {hasMoreTags && (
        <span className="text-xs text-muted-foreground font-medium px-1">
          +{hiddenCount}
        </span>
      )}
    </div>
  )
}