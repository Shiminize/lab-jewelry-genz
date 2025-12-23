import Image from 'next/image'

import { Button } from '@/components/ui'
import { Section, SectionContainer } from '@/components/layout/Section'
import { StatsStrip } from '@/components/layout/StatsStrip'
import type { HomepageCustomizerOnboardingContent } from '@/content/homepage'

interface CustomizerOnboardingSectionProps {
  content: HomepageCustomizerOnboardingContent
  className?: string
}

export function CustomizerOnboardingSection({ content, className }: CustomizerOnboardingSectionProps) {
  if (!content) return null

  const { eyebrow, headline, body, steps, primaryCta, secondaryCta, media, stat } = content

  return (
    <Section spacing="compact" className={className}>
      <SectionContainer size="full" className="px-0">
        <div className="grid gap-[var(--space-fluid-xl)] w-full max-w-[1440px] mx-auto px-[clamp(24px,4vw,72px)] lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="flex flex-col gap-[var(--space-fluid-md)] text-ink-2">
            {eyebrow ? <span className="font-accent text-xs tracking-[0.28em] uppercase text-muted">{eyebrow}</span> : null}
            <div className="flex flex-col gap-4 max-w-[720px]">
              <h2 className="m-0 font-heading text-[clamp(2.2rem,4vw,2.8rem)] font-semibold leading-[1.2] text-ink">{headline}</h2>
              <p className="m-0 text-[1.05rem] leading-[1.65]">{body}</p>
            </div>

            {steps?.length ? (
              <ol className="flex flex-col gap-[var(--space-fluid-sm)]">
                {steps.map((step) => (
                  <li key={step.title} className="border border-border-subtle rounded-none bg-surface shadow-soft p-[var(--space-fluid-md)]">
                    <p className="font-heading m-[0_0_6px] text-[0.95rem] font-semibold text-ink">{step.title}</p>
                    <p className="m-0 text-[0.9rem] text-ink-2">{step.description}</p>
                  </li>
                ))}
              </ol>
            ) : null}

            <div className="flex flex-col gap-[var(--space-fluid-sm)] max-w-[420px] sm:flex-row sm:items-center">
              <Button href={primaryCta.href} variant={mapVariant(primaryCta.variant)} className="inline-flex justify-center w-full sm:w-auto sm:min-w-[12rem]">
                {primaryCta.label}
              </Button>
              {secondaryCta ? (
                <Button href={secondaryCta.href} variant={mapVariant(secondaryCta.variant, 'ghost')} className="inline-flex justify-center w-full sm:w-auto sm:min-w-[12rem]">
                  {secondaryCta.label}
                </Button>
              ) : null}
            </div>

            {stat ? <StatsStrip items={[stat]} columns={{ base: 1 }} className="max-w-[320px]" /> : null}
          </div>

          <div className="flex flex-col gap-[var(--space-fluid-sm)]">
            {media?.image ? (
              <div className="relative overflow-hidden rounded-none border border-[color-mix(in_oklab,var(--color-accent)_18%,var(--color-line-subtle))] shadow-soft bg-surface w-full aspect-video">
                <Image
                  src={media.image}
                  alt={media.alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1280px) 520px, (min-width: 1024px) 440px, 90vw"
                />
              </div>
            ) : null}
            {media?.video ? (
              <video className="relative overflow-hidden rounded-none border border-[color-mix(in_oklab,var(--color-accent)_18%,var(--color-line-subtle))] shadow-soft bg-surface w-full aspect-video" autoPlay muted loop playsInline>
                <source src={media.video} type="video/mp4" />
              </video>
            ) : null}
          </div>
        </div>
      </SectionContainer>
    </Section>
  )
}

function mapVariant(
  variant: HomepageCustomizerOnboardingContent['primaryCta']['variant'] | undefined,
  fallback: 'primary' | 'outline' | 'ghost' = 'primary',
): 'primary' | 'outline' | 'ghost' {
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
