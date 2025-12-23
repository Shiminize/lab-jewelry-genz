import Image from 'next/image'
import type { ReactNode } from 'react'
import { Section, SectionContainer } from '@/components/layout/Section'
import { Button, Typography } from '@/components/ui'

type Cta = {
  label: string
  href: string
}

export type MarketingHero = {
  eyebrow?: string
  heading: string
  body?: string
  primaryCta?: Cta
  secondaryCta?: Cta
  image?: {
    src: string
    alt: string
  }
  highlight?: {
    eyebrow?: string
    title: string
    body?: string
    cta?: Cta
  }
}

type RichTextModule = {
  type: 'richText'
  eyebrow?: string
  title?: string
  body: string[]
}

type CardModule = {
  type: 'cardGrid'
  title?: string
  cards: Array<{ eyebrow?: string; title: string; body: string }>
}

type StatsModule = {
  type: 'stats'
  title?: string
  stats: Array<{ label: string; value: string }>
}

type TimelineModule = {
  type: 'timeline'
  eyebrow?: string
  items: Array<{ eyebrow?: string; title: string; body: string }>
}

type SplitPanelsModule = {
  type: 'splitPanels'
  panels: Array<{
    eyebrow?: string
    title: string
    body: string
    bullets?: string[]
    cta?: Cta
  }>
}

type FaqModule = {
  type: 'faq'
  title?: string
  items: Array<{ question: string; answer: string }>
}

export type MarketingModule =
  | RichTextModule
  | CardModule
  | StatsModule
  | TimelineModule
  | SplitPanelsModule
  | FaqModule

export type MarketingPageContent = {
  hero: MarketingHero
  modules: MarketingModule[]
}

interface MarketingPageProps {
  content: MarketingPageContent
  children?: ReactNode
}

export function MarketingPage({ content, children }: MarketingPageProps) {
  const { hero, modules } = content
  const hasHighlight = Boolean(hero.highlight)
  const showImage = Boolean(hero.image)
  const useGrid = hasHighlight || showImage

  return (
    <div className="bg-app">
      <Section spacing="relaxed" id={hero.eyebrow ? hero.eyebrow.toLowerCase().replace(/\\s+/g, '-') : undefined}>
        <SectionContainer
          className={
            useGrid
              ? 'grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]'
              : 'space-y-6 text-center md:space-y-8'
          }
        >
          <div className={useGrid ? 'space-y-6' : 'space-y-6'}>
            {hero.eyebrow ? (
              <Typography variant="eyebrow" className="text-accent-primary">
                {hero.eyebrow}
              </Typography>
            ) : null}
            <Typography as="h1" variant="heading" className={hasHighlight ? 'max-w-3xl' : 'mx-auto max-w-3xl'}>
              {hero.heading}
            </Typography>
            {hero.body ? (
              <Typography
                variant="body"
                className={hasHighlight ? 'max-w-2xl text-text-secondary' : 'mx-auto max-w-2xl text-text-secondary'}
              >
                {hero.body}
              </Typography>
            ) : null}
            {(hero.primaryCta || hero.secondaryCta) && (
              <div className={`flex flex-wrap gap-3 ${hasHighlight ? '' : 'justify-center'}`}>
                {hero.primaryCta ? (
                  <Button tone="coral" variant="accent" href={hero.primaryCta.href}>
                    {hero.primaryCta.label}
                  </Button>
                ) : null}
                {hero.secondaryCta ? (
                  <Button variant="outline" tone="sky" href={hero.secondaryCta.href}>
                    {hero.secondaryCta.label}
                  </Button>
                ) : null}
              </div>
            )}
          </div>
          {useGrid ? (
            hero.highlight ? (
              <div className="space-y-4 rounded-none border border-border-subtle/60 bg-surface-base/80 p-6 shadow-soft">
                {hero.highlight.eyebrow ? (
                  <Typography variant="eyebrow" className="text-accent-secondary">
                    {hero.highlight.eyebrow}
                  </Typography>
                ) : null}
                <Typography as="h3" variant="title" className="text-text-primary">
                  {hero.highlight.title}
                </Typography>
                {hero.highlight.body ? (
                  <Typography className="text-sm leading-7 text-text-secondary">{hero.highlight.body}</Typography>
                ) : null}
                {hero.highlight.cta ? (
                  <Button variant="outline" tone="sky" href={hero.highlight.cta.href} className="justify-center">
                    {hero.highlight.cta.label}
                  </Button>
                ) : null}
              </div>
            ) : hero.image ? (
              <div className="relative aspect-[3/2] overflow-hidden rounded-none border border-border-subtle/60 bg-surface-base/80 shadow-soft">
                <Image
                  src={hero.image.src}
                  alt={hero.image.alt}
                  fill
                  sizes="(min-width: 1280px) 640px, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
            ) : null
          ) : hero.image ? (
            <div className="mx-auto mt-6 max-w-5xl">
              <div className="relative aspect-[3/2] overflow-hidden rounded-none border border-border-subtle/60 bg-surface-base/80 shadow-soft">
                <Image
                  src={hero.image.src}
                  alt={hero.image.alt}
                  fill
                  sizes="(min-width: 1280px) 1100px, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          ) : null}
        </SectionContainer>
      </Section>

      {modules.map((module, index) => {
        const sectionId =
          module.type === 'timeline'
            ? 'story'
            : module.type === 'cardGrid' && module.title
              ? module.title.toLowerCase().replace(/\\s+/g, '-')
              : module.type === 'stats'
                ? 'footprint'
                : module.type === 'richText' && module.title
                  ? module.title.toLowerCase().replace(/\\s+/g, '-')
                  : module.type === 'faq'
                    ? 'faq'
                    : undefined

        return (
          <Section
            key={`${module.type}-${index}`}
            id={sectionId}
            spacing={module.type === 'splitPanels' ? 'relaxed' : 'compact'}
          >
            <SectionContainer className="space-y-6">{renderModule(module)}</SectionContainer>
          </Section>
        )
      })}

      {children}
    </div>
  )
}

function renderModule(module: MarketingModule) {
  switch (module.type) {
    case 'richText':
      return (
        <div className="space-y-4">
          {module.eyebrow ? (
            <Typography variant="eyebrow" className="text-accent-primary">
              {module.eyebrow}
            </Typography>
          ) : null}
          {module.title ? (
            <Typography as="h2" variant="heading">
              {module.title}
            </Typography>
          ) : null}
          <div className="space-y-3 text-text-secondary">
            {module.body.map((paragraph) => (
              <Typography key={paragraph} variant="body">
                {paragraph}
              </Typography>
            ))}
          </div>
        </div>
      )
    case 'cardGrid':
      return (
        <div className="space-y-5">
          {module.title ? (
            <Typography as="h2" variant="title">
              {module.title}
            </Typography>
          ) : null}
          <div className="grid gap-4 md:grid-cols-3">
            {module.cards.map((card) => (
              <article key={card.title} className="space-y-3 rounded-none border border-border-subtle/60 bg-surface-base/80 p-5">
                {card.eyebrow ? (
                  <Typography variant="caption" className="uppercase tracking-[0.2em] text-text-muted">
                    {card.eyebrow}
                  </Typography>
                ) : null}
                <Typography as="h3" variant="title">
                  {card.title}
                </Typography>
                <Typography variant="body" className="text-text-secondary">
                  {card.body}
                </Typography>
              </article>
            ))}
          </div>
        </div>
      )
    case 'stats':
      return (
        <div className="space-y-4">
          {module.title ? (
            <Typography as="h2" variant="title">
              {module.title}
            </Typography>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {module.stats.map((stat) => (
              <div key={stat.label} className="rounded-none border border-border-subtle/60 bg-surface-base/80 p-5 text-center">
                <Typography variant="heading">{stat.value}</Typography>
                <Typography variant="caption" className="text-text-secondary">
                  {stat.label}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      )
    case 'timeline':
      return (
        <div className="space-y-5">
          {module.eyebrow ? (
            <Typography variant="eyebrow" className="text-accent-primary">
              {module.eyebrow}
            </Typography>
          ) : null}
          <div className="grid gap-4 md:grid-cols-3">
            {module.items.map((item) => (
              <article key={item.title} className="space-y-3 rounded-none border border-border-subtle/60 bg-surface-base/80 p-5">
                {item.eyebrow ? (
                  <Typography variant="caption" className="uppercase tracking-[0.2em] text-text-muted">
                    {item.eyebrow}
                  </Typography>
                ) : null}
                <Typography as="h3" variant="title">
                  {item.title}
                </Typography>
                <Typography variant="body" className="text-text-secondary">
                  {item.body}
                </Typography>
              </article>
            ))}
          </div>
        </div>
      )
    case 'splitPanels':
      return (
        <div className="grid gap-4 lg:grid-cols-2">
          {module.panels.map((panel) => (
            <article key={panel.title} className="space-y-4 rounded-none border border-border-subtle/60 bg-surface-base/80 p-6">
              {panel.eyebrow ? (
                <Typography variant="eyebrow" className="text-accent-primary">
                  {panel.eyebrow}
                </Typography>
              ) : null}
              <Typography as="h3" variant="title">
                {panel.title}
              </Typography>
              <Typography variant="body" className="text-text-secondary">
                {panel.body}
              </Typography>
              {panel.bullets ? (
                <ul className="list-disc space-y-1 pl-5 text-sm text-text-secondary">
                  {panel.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
              {panel.cta ? (
                <Button tone="coral" variant="accent" href={panel.cta.href} className="justify-center">
                  {panel.cta.label}
                </Button>
              ) : null}
            </article>
          ))}
        </div>
      )
    case 'faq':
      return (
        <div className="space-y-4">
          {module.title ? (
            <Typography as="h2" variant="title">
              {module.title}
            </Typography>
          ) : null}
          <div className="divide-y divide-border-subtle/60 rounded-none border border-border-subtle/60 bg-surface-base/80">
            {module.items.map((faq) => (
              <details key={faq.question} className="group p-5">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-left text-sm font-semibold text-text-primary">
                  {faq.question}
                  <span className="text-xl leading-none text-accent-primary transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <Typography variant="body" className="pt-3 text-text-secondary">
                  {faq.answer}
                </Typography>
              </details>
            ))}
          </div>
        </div>
      )
    default:
      return null
  }
}
