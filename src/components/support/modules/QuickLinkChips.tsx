'use client'

import { useRef, useEffect, useCallback, useState } from 'react'

/**
 * Quick Link Chips
 * Renders clickable chips that translate to query params only
 * No client-side logic branching - just URL parameters
 * 
 * Accessibility features:
 * - 44px+ touch targets (WCAG AA)
 * - Horizontal scrolling with snap on mobile
 * - Keyboard arrow navigation with roving tabindex
 * - Skip link for screen readers
 * - Gradient scroll indicators for discoverability
 */

interface QuickLink {
  id: string
  label: string
  params: Record<string, string | number | boolean>
}

const QUICK_LINKS: QuickLink[] = [
  {
    id: 'design-ideas',
    label: 'Design ideas',
    params: { featured: 'true', readyToShip: 'true' }
  },
  {
    id: 'gifts-under-300',
    label: 'Gifts under $300',
    params: { readyToShip: 'true', priceLt: 300 }
  },
  {
    id: 'ready-to-ship',
    label: 'Ready to ship',
    params: { readyToShip: 'true' }
  },
  {
    id: 'rings',
    label: 'Rings',
    params: { category: 'ring', readyToShip: 'true' }
  },
  {
    id: 'necklaces',
    label: 'Necklaces',
    params: { category: 'necklace', readyToShip: 'true' }
  },
  {
    id: 'earrings',
    label: 'Earrings',
    params: { category: 'earring', readyToShip: 'true' }
  },
  {
    id: 'bracelets',
    label: 'Bracelets',
    params: { category: 'bracelet', readyToShip: 'true' }
  }
]

interface QuickLinkChipsProps {
  onLinkClick: (params: Record<string, string | number | boolean>) => void
  disabled?: boolean
  showSkipLink?: boolean
}

export function QuickLinkChips({ onLinkClick, disabled, showSkipLink = true }: QuickLinkChipsProps) {
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [showLeftGradient, setShowLeftGradient] = useState(false)
  const [showRightGradient, setShowRightGradient] = useState(true)
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize button refs array
  useEffect(() => {
    buttonsRef.current = buttonsRef.current.slice(0, QUICK_LINKS.length)
  }, [])

  // Handle scroll position to show/hide gradient indicators
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container
      setShowLeftGradient(scrollLeft > 10)
      setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 10)
    }

    handleScroll() // Initial check
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    let newIndex = index

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        newIndex = (index + 1) % QUICK_LINKS.length
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        newIndex = (index - 1 + QUICK_LINKS.length) % QUICK_LINKS.length
        break
      case 'Home':
        e.preventDefault()
        newIndex = 0
        break
      case 'End':
        e.preventDefault()
        newIndex = QUICK_LINKS.length - 1
        break
      default:
        return
    }

    setFocusedIndex(newIndex)
    buttonsRef.current[newIndex]?.focus()
  }, [])

  const handleClick = useCallback((link: QuickLink, index: number) => {
    setFocusedIndex(index)
    onLinkClick(link.params)
  }, [onLinkClick])

  return (
    <div className="relative">
      {/* Skip link for keyboard users */}
      {showSkipLink && (
        <a
          href="#results"
          className="sr-only focus:not-sr-only focus:absolute focus:left-0 focus:top-0 focus:z-10 focus:rounded focus:bg-surface-base focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent-secondary"
        >
          Skip filters
        </a>
      )}

      {/* Left gradient scroll indicator */}
      <div
        className={`pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-surface-base to-transparent transition-opacity duration-200 md:hidden ${showLeftGradient ? 'opacity-100' : 'opacity-0'
          }`}
        aria-hidden="true"
      />

      {/* Horizontal scrolling container with snap points */}
      <div
        ref={containerRef}
        className="overflow-x-auto snap-x snap-mandatory whitespace-nowrap scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent hover:scrollbar-thumb-neutral-300 md:overflow-x-visible md:flex md:flex-wrap"
        role="toolbar"
        aria-label="Quick product search filters"
        aria-orientation="horizontal"
      >
        <div className="inline-flex gap-2 px-1 md:flex md:flex-wrap md:px-0">
          {QUICK_LINKS.map((link, index) => (
            <button
              key={link.id}
              ref={(el) => { buttonsRef.current[index] = el }}
              type="button"
              onClick={() => handleClick(link, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              disabled={disabled}
              tabIndex={focusedIndex === index ? 0 : -1}
              className="inline-flex min-h-[44px] snap-start items-center rounded-full border border-border-subtle bg-surface-base px-4 py-2.5 text-xs font-medium text-text-primary transition hover:border-accent-secondary hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 md:min-h-[unset]"
              aria-label={`Search for ${link.label}`}
              data-testid={`chip-${link.id}`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right gradient scroll indicator */}
      <div
        className={`pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-surface-base to-transparent transition-opacity duration-200 md:hidden ${showRightGradient ? 'opacity-100' : 'opacity-0'
          }`}
        aria-hidden="true"
      />

      {/* Scroll hint for mobile (hidden when fully scrolled) */}
      <div
        className={`mt-1 text-center text-xs text-text-muted transition-opacity duration-200 md:hidden ${showRightGradient ? 'opacity-100' : 'opacity-0'
          }`}
        aria-hidden="true"
      >
        Swipe for more →
      </div>
    </div>
  )
}

