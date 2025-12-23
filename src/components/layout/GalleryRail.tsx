'use client'

import { useEffect, useRef, useState, Children } from 'react'
import { cn } from '@/lib/utils'

interface GalleryRailProps {
  children: React.ReactNode
  className?: string
  ariaLabel?: string
}

export function GalleryRail({ children, className, ariaLabel }: GalleryRailProps) {
  const railRef = useRef<HTMLDivElement | null>(null)
  const [canScrollBack, setCanScrollBack] = useState(false)
  const [canScrollForward, setCanScrollForward] = useState(false)
  const childCount = Children.count(children)

  useEffect(() => {
    const node = railRef.current
    if (!node) return

    function handleScroll() {
      if (!railRef.current) return
      const { scrollLeft, scrollWidth, clientWidth } = railRef.current
      setCanScrollBack(scrollLeft > 4)
      setCanScrollForward(scrollLeft + clientWidth < scrollWidth - 4)
    }

    handleScroll()
    node.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    return () => {
      node.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [childCount])

  const scrollByAmount = (direction: 'forward' | 'back') => {
    const node = railRef.current
    if (!node) return
    const delta = direction === 'forward' ? node.clientWidth * 0.8 : -node.clientWidth * 0.8
    node.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <div className={cn('gallery-rail-wrapper', className)}>
      <div ref={railRef} className="rail-gallery" aria-label={ariaLabel}>
        {children}
      </div>
      <div className="gallery-rail-miniBar">
        <button
          type="button"
          className={cn('gallery-rail-nav', !canScrollBack && 'gallery-rail-nav--disabled')}
          onClick={() => scrollByAmount('back')}
          aria-label="Scroll backwards"
          aria-disabled={!canScrollBack}
        >
          <span aria-hidden className="gallery-rail-arrow gallery-rail-arrow--left" />
        </button>
        <button
          type="button"
          className={cn('gallery-rail-nav', !canScrollForward && 'gallery-rail-nav--disabled')}
          onClick={() => scrollByAmount('forward')}
          aria-label="Scroll forwards"
          aria-disabled={!canScrollForward}
        >
          <span aria-hidden className="gallery-rail-arrow gallery-rail-arrow--right" />
        </button>
      </div>
    </div>
  )
}
