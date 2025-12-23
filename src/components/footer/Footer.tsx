'use client'

import Link from 'next/link'

import { Button } from '@/components/ui'
import { SectionContainer } from '@/components/layout/Section'

const FOOTER_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Shipping & Returns', href: '/shipping-returns' },
  { label: 'Contact', href: '/contact' },
  { label: 'Instagram', href: 'https://www.instagram.com/' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--color-ink)] bg-[var(--color-ink)] pb-8 pt-24 text-[var(--color-accent-contrast)]">
      <SectionContainer>
        <div className="mb-24 flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="max-w-md space-y-2">
            <p className="font-heading text-2xl font-semibold text-[var(--color-accent-contrast)]">Sign up for our newsletter</p>
            <p className="text-[var(--color-accent-contrast)]/80">
              Insights on new releases, ateliers, and design notes from Tokyo.
            </p>
          </div>
          <form className="flex w-full max-w-sm items-end gap-4">
            <div className="flex-1">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                className="w-full rounded-none border-b border-white/30 bg-transparent px-0 py-3 text-sm transition-colors text-[var(--color-accent-contrast)] placeholder:text-white/40 focus:border-white focus:outline-none"
                placeholder="email@example.com"
              />
            </div>
            <Button type="submit" variant="ghost" className="rounded-none border-b border-transparent px-0 text-[var(--color-accent-contrast)] hover:bg-transparent hover:border-[var(--color-accent-contrast)] hover:text-white">
              Submit
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-12 border-t border-white/20 pt-12 md:grid-cols-4">
          <div className="flex flex-col gap-3 text-sm font-medium">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                prefetch={false}
                className="hover:text-white transition-colors text-[var(--color-accent-contrast)]/90"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-4 text-sm text-[var(--color-accent-contrast)]/70 md:col-span-1">
            <strong className="font-medium text-[var(--color-accent-contrast)]">Store</strong>
            <p className="leading-relaxed">
              5-15-2 Jingumae, Shibuya
              <br />Tokyo 150-0001 Japan
              <br />+81 3 3486 1922
            </p>
            <a href="mailto:online@shiharalab.com" className="hover:text-white transition-colors">
              online@shiharalab.com
            </a>
            <p>Open Friday to Sunday 12-6pm</p>
            <Link href="/appointment" prefetch={false} className="underline underline-offset-4 hover:text-white">
              Book Appointment
            </Link>
          </div>
          <div className="flex flex-col gap-4 text-sm text-[var(--color-accent-contrast)]/70 md:col-span-2">
            <strong className="font-medium text-[var(--color-accent-contrast)]">Visit</strong>
            <p className="max-w-md leading-relaxed">
              Our atelier invites you to experience geometric luxury with bespoke fittings and private consultations.
              Walk-ins are welcome during open hours, or book a private session for our custom bridal collection.
            </p>
          </div>
        </div>

        <div className="mt-24 border-t border-white/20 pt-8 text-center text-xs uppercase tracking-widest text-[var(--color-accent-contrast)]/50">
          © {year} – All rights reserved.
        </div>
      </SectionContainer>
    </footer>
  )
}