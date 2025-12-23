'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { megaNavSections, type NavSection } from '@/content/navigation'

interface MegaPanelProps {
    section: (typeof megaNavSections)[number]
    panelId: string
    top: number
    panelRef: React.RefObject<HTMLDivElement>
    onMouseEnter: () => void
    onMouseLeave: () => void
    onLinkClick: () => void
}

export function MegaPanel({ section, panelId, top, panelRef, onMouseEnter, onMouseLeave, onLinkClick }: MegaPanelProps) {
    if (typeof document === 'undefined') return null

    return createPortal(
        <div
            ref={panelRef}
            id={panelId}
            className="fixed left-0 right-0 z-[60] border-b border-border-subtle bg-brand-bg text-sm text-text-secondary shadow-soft transition-opacity duration-300 ease-out rounded-none"
            style={{ top }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onFocusCapture={onMouseEnter}
            onBlurCapture={(event) => {
                const next = event.relatedTarget as Node | null
                if (!next || !panelRef.current?.contains(next)) {
                    onMouseLeave()
                }
            }}
            role="region"
            aria-label={`${section.label} menu`}
        >
            <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-12 px-6 py-12 sm:px-8 md:px-12 lg:flex-row lg:items-start lg:gap-20 lg:py-16 xl:px-16">
                <div className="flex flex-1 flex-col gap-8">
                    <div className="flex flex-col gap-3">
                        <span className="inline-flex h-0.5 w-8 bg-accent-secondary" aria-hidden />
                        <p className="font-serif text-2xl text-text-primary lg:text-3xl">{section.label}</p>
                        {section.description ? <p className="text-base text-text-secondary">{section.description}</p> : null}
                    </div>
                    <div className="grid w-full gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                        {section.columns.map((column) => (
                            <div key={column.title} className="flex flex-col gap-5">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-primary">{column.title}</p>
                                    {column.description ? (
                                        <p className="mt-1 text-xs text-text-secondary">{column.description}</p>
                                    ) : null}
                                </div>
                                <ul className="flex flex-col gap-3 text-sm text-text-secondary" role="list">
                                    {column.links.map((link) => {
                                        const isExternal = link.href.startsWith('http') || link.href.startsWith('mailto:')

                                        return (
                                            <li key={link.label}>
                                                {isExternal ? (
                                                    <a
                                                        href={link.href}
                                                        target={link.href.startsWith('http') ? '_blank' : undefined}
                                                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                                        className="group inline-flex flex-col gap-0.5 transition hover:text-text-primary"
                                                        onClick={onLinkClick}
                                                    >
                                                        <span className="font-medium">{link.label}</span>
                                                        {link.description ? (
                                                            <span className="text-xs text-text-muted transition-colors group-hover:text-text-secondary">
                                                                {link.description}
                                                            </span>
                                                        ) : null}
                                                    </a>
                                                ) : (
                                                    <Link
                                                        href={link.href}
                                                        className="group inline-flex flex-col gap-0.5 transition hover:text-text-primary"
                                                        onClick={onLinkClick}
                                                    >
                                                        <span className="font-medium">{link.label}</span>
                                                        {link.description ? (
                                                            <span className="text-xs text-text-muted transition-colors group-hover:text-text-secondary">
                                                                {link.description}
                                                            </span>
                                                        ) : null}
                                                    </Link>
                                                )}
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                <NavBanner section={section} onLinkClick={onLinkClick} />
            </div>
        </div>,
        document.body,
    )
}

function NavBanner({ section, onLinkClick }: { section: NavSection; onLinkClick: () => void }) {
    const banner = section.banner
    if (!banner) return null

    return (
        <aside className="hidden w-full max-w-sm flex-col gap-6 lg:flex">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-base">
                {banner.image ? (
                    <Image
                        src={banner.image}
                        alt={`${section.label} banner`}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-105"
                        sizes="(min-width: 1024px) 320px, 50vw"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-text-muted">Banner slot</div>
                )}
            </div>
            <div className="space-y-3">
                <div>
                    <p className="font-serif text-xl text-text-primary">{banner.title}</p>
                    {banner.subtitle ? <p className="mt-1 text-sm text-text-secondary">{banner.subtitle}</p> : null}
                </div>
                {banner.cta ? (
                    <Link
                        href={banner.cta.href}
                        className="inline-flex items-center text-sm font-semibold uppercase tracking-wider text-text-primary decoration-1 underline-offset-4 hover:underline"
                        onClick={onLinkClick}
                    >
                        {banner.cta.label}
                    </Link>
                ) : null}
            </div>
        </aside>
    )
}
