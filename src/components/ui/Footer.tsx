'use client'

import Link from 'next/link'
import { GlowGlitchLogo } from './Logo'
import { Section, SectionContainer } from '@/components/layout/Section'

const FOOTER_LINK_GROUPS = [
  {
    title: 'Shop',
    links: [
      { label: 'All jewelry', href: '/collections' },
      { label: 'Engagement', href: '/collections?category=engagement' },
      { label: 'Custom orders', href: '/customizer' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Sustainability', href: '/sustainability' },
      { label: 'Creators', href: '/creators' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact', href: '/support' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Book a consult', href: '/consult' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-brand-ink/10 bg-brand-bg text-sm text-brand-text/80">
      <SectionContainer className="grid gap-12 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <GlowGlitchLogo className="text-brand-ink" />
          <p className="max-w-sm text-xs leading-relaxed text-brand-text/80">
            Crafted for conscious creators. GlowGlitch blends next-gen 3D customization with ethical lab-grown gems to deliver the future of luxury.
          </p>
        </div>
        {FOOTER_LINK_GROUPS.map((group) => (
          <div key={group.title} className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-text/70">
              {group.title}
            </h4>
            <ul className="space-y-2 text-sm">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors duration-200 hover:text-brand-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </SectionContainer>
      <div className="border-t border-brand-ink/10 py-6 text-xs text-brand-text/60">
        <SectionContainer className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} GlowGlitch Labs. All rights reserved.</span>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-brand-ink">Privacy</Link>
            <Link href="/terms" className="hover:text-brand-ink">Terms</Link>
            <Link href="/accessibility" className="hover:text-brand-ink">Accessibility</Link>
          </div>
        </SectionContainer>
      </div>
    </footer>
  )
}
