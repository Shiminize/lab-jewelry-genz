'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createPortal } from 'react-dom'

import { megaNavSections, type NavSection } from '@/content/navigation'
import { cn } from '@/lib/utils'
import { MegaPanel } from './MegaPanel'

const CLOSE_DELAY_MS = 140
const PANEL_GAP_PX = 12

type OpenOptions = {
  focusPanel?: boolean
}

export function MegaNav() {
  const navRef = useRef<HTMLElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const closeTimerRef = useRef<number | null>(null)
  const openTimerRef = useRef<number | null>(null)

  const [isMounted, setIsMounted] = useState(false)
  const [openSectionId, setOpenSectionId] = useState<string | null>(null)
  const [panelTop, setPanelTop] = useState<number>(0)
  const [shouldFocusPanel, setShouldFocusPanel] = useState(false)
  const lastKeyboardTriggerRef = useRef<string | null>(null)

  const currentSection = useMemo(
    () => megaNavSections.find((section) => section.id === openSectionId),
    [openSectionId],
  )

  const registerTrigger = useCallback((id: string, node: HTMLButtonElement | null) => {
    if (!node) {
      triggerRefs.current.delete(id)
      return
    }
    triggerRefs.current.set(id, node)
  }, [])

  const cancelCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const cancelOpenTimer = useCallback(() => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
  }, [])

  const focusTrigger = useCallback((id: string | null) => {
    if (!id) return
    const trigger = triggerRefs.current.get(id)
    if (trigger) {
      requestAnimationFrame(() => trigger.focus())
    }
  }, [])

  const performClose = useCallback(() => {
    setOpenSectionId((prev) => {
      if (prev) {
        focusTrigger(prev)
      }
      return null
    })
    setShouldFocusPanel(false)
    cancelCloseTimer()
    cancelOpenTimer()
  }, [cancelCloseTimer, cancelOpenTimer, focusTrigger])

  const scheduleClose = useCallback(() => {
    cancelCloseTimer()
    cancelOpenTimer()
    closeTimerRef.current = window.setTimeout(() => {
      performClose()
    }, CLOSE_DELAY_MS)
  }, [cancelCloseTimer, cancelOpenTimer, performClose])

  const updatePanelPosition = useCallback(() => {
    if (!navRef.current) return
    const rect = navRef.current.getBoundingClientRect()
    setPanelTop(rect.bottom + PANEL_GAP_PX)
  }, [])

  const openSection = useCallback(
    (id: string, options: OpenOptions = {}) => {
      cancelCloseTimer()
      cancelOpenTimer()
      setShouldFocusPanel(Boolean(options.focusPanel))
      if (options.focusPanel) {
        lastKeyboardTriggerRef.current = id
      }
      setOpenSectionId((prev) => {
        if (prev === id) {
          return prev
        }
        return id
      })
      updatePanelPosition()
    },
    [cancelCloseTimer, cancelOpenTimer, updatePanelPosition],
  )

  const scheduleOpen = useCallback(
    (id: string) => {
      cancelCloseTimer()
      cancelOpenTimer()

      if (openSectionId) {
        // If already open, switch immediately
        openSection(id)
      } else {
        // Delay opening to prevent accidental triggers
        openTimerRef.current = window.setTimeout(() => {
          openSection(id)
        }, 150)
      }
    },
    [cancelCloseTimer, cancelOpenTimer, openSection, openSectionId],
  )

  const handleTriggerKeyDown = useCallback(
    (id: string, event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        performClose()
        return
      }
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault()
        openSection(id, { focusPanel: true })
      }
    },
    [openSection, performClose],
  )

  useEffect(() => setIsMounted(true), [])

  useEffect(() => {
    if (!openSectionId) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (navRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return
      }
      performClose()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        performClose()
      }
    }

    const handleViewportChange = () => {
      requestAnimationFrame(updatePanelPosition)
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', handleViewportChange, { passive: true })
    window.addEventListener('resize', handleViewportChange)

    handleViewportChange()

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handleViewportChange)
      window.removeEventListener('resize', handleViewportChange)
    }
  }, [openSectionId, performClose, updatePanelPosition])

  useEffect(() => {
    if (!openSectionId || !shouldFocusPanel) return
    requestAnimationFrame(() => {
      const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (firstFocusable) {
        firstFocusable.focus()
      }
      setShouldFocusPanel(false)
    })
  }, [openSectionId, shouldFocusPanel])

  useEffect(() => {
    return () => {
      cancelCloseTimer()
      cancelOpenTimer()
    }
  }, [cancelCloseTimer, cancelOpenTimer])

  useEffect(() => {
    const node = navRef.current
    if (!node) return
    const handlePointerLeave = () => {
      scheduleClose()
    }
    node.addEventListener('pointerleave', handlePointerLeave)
    return () => {
      node.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [scheduleClose])

  return (
    <>
      <nav
        ref={navRef}
        aria-label="Primary navigation"
        className="relative hidden items-center gap-12 text-sm font-medium text-text-secondary md:flex"
      >
        <ul className="flex items-center gap-10" role="list">
          {megaNavSections.map((section) => {
            const isOpen = openSectionId === section.id
            return (
              <li
                key={section.id}
                onMouseEnter={() => scheduleOpen(section.id)}
                onMouseLeave={scheduleClose}
                onFocusCapture={() => openSection(section.id)}
                onBlurCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                    scheduleClose()
                  }
                }}
              >
                <button
                  ref={(node) => registerTrigger(section.id, node)}
                  type="button"
                  className={cn(
                    'group relative inline-flex items-center gap-1 px-1 py-2 text-sm font-medium tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
                    isOpen ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary',
                  )}
                  aria-expanded={isOpen}
                  aria-controls={`mega-panel-${section.id}`}
                  aria-haspopup="true"
                  onKeyDown={(event) => handleTriggerKeyDown(section.id, event)}
                  onMouseEnter={() => scheduleOpen(section.id)}
                >
                  {section.label}

                  {isOpen && (
                    <span className="absolute bottom-0 left-0 right-0 h-px bg-text-primary dark:bg-text-primary" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
      {isMounted && currentSection && (
        <MegaPanel
          section={currentSection}
          panelId={`mega-panel-${currentSection.id}`}
          top={panelTop}
          panelRef={panelRef}
          onMouseEnter={cancelCloseTimer}
          onMouseLeave={scheduleClose}
          onLinkClick={performClose}
        />
      )}
    </>
  )
}



