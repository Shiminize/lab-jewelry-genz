'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { Search, X } from 'lucide-react'

import { megaNavSections, type NavSection } from '@/content/navigation'
import { Button } from './Button'
import { cn } from '@/lib/utils'

const PRIORITY_SECTIONS: NavSection['id'][] = ['shop', 'custom']

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [openSectionId, setOpenSectionId] = useState<NavSection['id'] | null>('shop')
  const [hasMounted, setHasMounted] = useState(false)
  const [query, setQuery] = useState('')
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const dialogId = 'mobile-nav-dialog'
  const triggerId = 'mobile-nav-trigger'
  const router = useRouter()

  const orderedSections = useMemo(() => {
    const prioritized: NavSection[] = []
    PRIORITY_SECTIONS.forEach((sectionId) => {
      const match = megaNavSections.find((section) => section.id === sectionId)
      if (match) {
        prioritized.push(match)
      }
    })
    const remaining = megaNavSections.filter((section) => !PRIORITY_SECTIONS.includes(section.id))
    return [...prioritized, ...remaining]
  }, [])

  const filteredSections = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return orderedSections

    return orderedSections
      .map((section) => {
        const matchesSection =
          section.label.toLowerCase().includes(term) ||
          (section.description ?? '').toLowerCase().includes(term)

        const columns = section.columns
          .map((column) => {
            const links = column.links.filter(
              (link) =>
                link.label.toLowerCase().includes(term) ||
                (link.description ?? '').toLowerCase().includes(term),
            )
            return links.length ? { ...column, links } : null
          })
          .filter(Boolean) as typeof section.columns

        if (matchesSection || columns.length) {
          return { ...section, columns }
        }
        return null
      })
      .filter(Boolean) as NavSection[]
  }, [orderedSections, query])

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (!filteredSections.length) {
      setOpenSectionId(null)
      return
    }
    const stillOpen = filteredSections.some((section) => section.id === openSectionId)
    if (!stillOpen) {
      setOpenSectionId(filteredSections[0]?.id ?? null)
    }
  }, [filteredSections, openSectionId])

  useEffect(() => {
    if (!isOpen) return

    // Scroll Lock
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsOpen(false)
        return
      }

      // Focus Trap
      if (event.key === 'Tab') {
        const dialog = document.getElementById(dialogId)
        if (!dialog) return

        const focusableElements = dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement?.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Focus the explicitly defined close button or the container
    requestAnimationFrame(() => closeButtonRef.current?.focus())

    return () => {
      document.body.style.overflow = originalStyle
      document.removeEventListener('keydown', handleKeyDown)
      requestAnimationFrame(() => {
        const trigger = document.getElementById(triggerId) as HTMLButtonElement | null
        trigger?.focus()
      })
    }
  }, [isOpen, dialogId, triggerId])

  const handleOpen = () => {
    setOpenSectionId('shop')
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleToggle = (sectionId: NavSection['id']) => {
    setOpenSectionId((prev) => (prev === sectionId ? null : sectionId))
  }

  const overlay =
    isOpen && hasMounted
      ? createPortal(
        <>
          <div
            className="fixed inset-0 z-[55] bg-brand-ink/20 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
            onClick={handleClose}
          />
          <div
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-nav-title"
            className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-sm flex-col border-l border-brand-ink/10 bg-surface-base shadow-2xl transition-transform duration-300 ease-in-out"
          >
            <div className="flex h-full flex-col p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Navigate</p>
                  <h2 id="mobile-nav-title" className="text-2xl font-serif font-medium text-text-primary">
                    Choose your lane
                  </h2>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={handleClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-none border border-border-subtle text-text-primary hover:bg-brand-ink/5 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>

              <label className="mt-8 flex items-center gap-3 border-b border-border-subtle py-3 text-sm text-text-secondary">
                <Search className="h-4 w-4 text-text-muted" aria-hidden />
                <span className="sr-only">Search navigation</span>
                <input
                  type="search"
                  placeholder="Search capsules, journal, or rings"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && query.trim()) {
                      e.preventDefault()
                      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
                      handleClose()
                    }
                  }}
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                />
              </label>

              <div className="mt-8 grid gap-3">
                <Button
                  href="/customizer"
                  tone="coral"
                  variant="accent"
                  className="w-full justify-center rounded-none"
                  onClick={handleClose}
                >
                  Start customizing
                </Button>
                <Button
                  href="/support"
                  variant="outline"
                  tone="ink"
                  className="w-full justify-center rounded-none"
                  onClick={handleClose}
                >
                  Talk to concierge
                </Button>
              </div>

              <div className="mt-8 flex-1 overflow-y-auto pr-1 min-h-0">
                {filteredSections.length === 0 ? (
                  <p className="type-body text-text-secondary">No matches found.</p>
                ) : (
                  filteredSections.map((section) => (
                    <NavSectionGroup
                      key={section.id}
                      section={section}
                      isOpen={openSectionId === section.id}
                      onToggle={handleToggle}
                      onNavigate={handleClose}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </>,
        document.body,
      )
      : null

  return (
    <>
      <Button
        tone="coral"
        size="sm"
        variant="accent"
        type="button"
        aria-expanded={isOpen}
        aria-controls={dialogId}
        id={triggerId}
        onClick={handleOpen}
      >
        Menu
      </Button>
      {overlay}
    </>
  )
}

interface NavSectionGroupProps {
  section: NavSection
  isOpen: boolean
  onToggle: (id: NavSection['id']) => void
  onNavigate: () => void
}

function NavSectionGroup({ section, isOpen, onToggle, onNavigate }: NavSectionGroupProps) {
  return (
    <div className="border-t border-border-subtle/80 first:border-t-0">
      <button
        type="button"
        onClick={() => onToggle(section.id)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 py-3 text-left"
      >
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-text-muted">{section.label}</span>
          <span className="text-base font-medium text-text-primary">{section.description ?? section.label}</span>
        </div>
        <span
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-none border border-border-subtle text-lg transition-colors',
            isOpen ? 'bg-brand-ink/5 text-text-primary' : 'bg-transparent text-text-secondary',
          )}
          aria-hidden
        >
          {isOpen ? '–' : '+'}
        </span>
      </button>
      {isOpen ? (
        <div className="pb-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {section.columns.map((column) => (
              <div key={column.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">{column.title}</p>
                <ul className="mt-2 space-y-2">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <NavLinkItem link={link} onNavigate={onNavigate} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function NavLinkItem({
  link,
  onNavigate,
}: {
  link: NavSection['columns'][number]['links'][number]
  onNavigate: () => void
}) {
  const isExternal = link.href.startsWith('http') || link.href.startsWith('mailto:')
  const content = (
    <>
      <span className="text-sm font-medium text-text-primary">{link.label}</span>
      {link.description ? <span className="text-xs text-text-secondary">{link.description}</span> : null}
    </>
  )

  if (isExternal) {
    return (
      <a
        href={link.href}
        target={link.href.startsWith('http') ? '_blank' : undefined}
        rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
        className="flex flex-col gap-0.5 rounded-none px-2 py-1 transition hover:bg-brand-ink/5"
        onClick={onNavigate}
      >
        {content}
      </a>
    )
  }

  return (
    <Link
      href={link.href}
      className="flex flex-col gap-0.5 rounded-none px-2 py-1 transition hover:bg-brand-ink/5"
      onClick={onNavigate}
    >
      {content}
    </Link>
  )
}
