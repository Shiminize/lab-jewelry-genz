import Link from 'next/link'

import { Button } from '@/components/ui'
import { Section, SectionContainer } from '@/components/layout/Section'
import { cn } from '@/lib/utils'
import type { HomepageCreatorCtaContent, HomepageHeroCta } from '@/content/homepage'

type CTASectionProps = {
  content: HomepageCreatorCtaContent
  className?: string
}

export function CreatorCTASection({ content, className }: CTASectionProps) {
  const primaryVariant = mapVariant(content.primaryCta?.variant, 'primary')
  const secondaryVariant = mapVariant(content.secondaryCta?.variant, 'ghost')

  return (
    <Section className={cn("bg-[var(--color-ink)] text-[var(--color-accent-contrast)] border-y border-white/10", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-30 pointer-events-none" />

      <SectionContainer size="gallery" bleed className="relative py-[var(--space-fluid-2xl)] px-4 sm:px-6 lg:px-10 xl:px-0">
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-12 items-center">
          {/* Left: Editorial Text */}
          <div className="space-y-6">
            <span className="text-xs font-accent tracking-widest text-[#D4C5B5] uppercase">Artist Residency</span>
            <h2 className="font-heading font-semibold text-4xl md:text-5xl text-[var(--color-accent-contrast)] leading-tight">
              {content.headline}
            </h2>
            <div className="space-y-4 max-w-lg">
              <p className="text-lg text-[var(--color-accent-contrast)]/90 leading-relaxed font-medium">
                {content.subheadline}
              </p>
              <p className="text-base text-[var(--color-accent-contrast)]/70 leading-relaxed">
                {content.supporting}
              </p>
            </div>
          </div>

          {/* Right: Actions & Status */}
          <div className="flex flex-col items-start lg:items-end gap-8">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <Button
                href={content.primaryCta.href}
                variant={primaryVariant}
                className="inline-flex justify-center bg-[var(--color-accent-contrast)] text-[var(--color-ink)] border-none hover:bg-white min-w-[180px]"
              >
                {content.primaryCta.label}
              </Button>
              <Button
                href={content.secondaryCta.href}
                variant={secondaryVariant}
                className="inline-flex justify-center text-[var(--color-accent-contrast)] border-white/40 hover:bg-white/10 hover:border-white hover:text-white min-w-[180px]"
              >
                {content.secondaryCta.label}
              </Button>
            </div>

            <div className="text-right">
              <p className="text-xs font-mono text-[var(--color-accent-contrast)]/50 uppercase tracking-widest mb-1">
                Status
              </p>
              <p className="text-sm text-[var(--color-accent-contrast)]/80">
                <span className="font-semibold text-[var(--color-accent-contrast)]">{content.proof.text}</span>{' '}
                <Link href={content.proof.href} className="inline-block ml-1 underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white focus-visible:text-white focus-visible:outline-none">
                  {content.proof.linkLabel}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </SectionContainer>
    </Section>
  )
}

function mapVariant(variant: HomepageHeroCta['variant'] | undefined, fallback: 'primary' | 'outline' | 'ghost'): 'primary' | 'outline' | 'ghost' {
  switch (variant) {
    case 'ghost':
      return 'ghost'
    case 'outline':
      return 'outline'
    case 'primary':
      return 'primary'
    default:
      return fallback
  }
}
