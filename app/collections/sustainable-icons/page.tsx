import { Droplet, Recycle, ShieldCheck, Sun } from 'lucide-react'

import { Section, SectionContainer } from '@/components/layout/Section'
import { StatsStrip } from '@/components/layout/StatsStrip'
import { Button, Typography } from '@/components/ui'

const highlights = [
  {
    title: 'Verified zero-conflict stones',
    description:
      'GlowGlitch lab-grown diamonds and moissanite are IGI-audited with full-chain certificates, so every sparkle comes with proof.',
    icon: ShieldCheck,
  },
  {
    title: 'Closed-loop water systems',
    description:
      'Growth labs recycle more than 95% of water used per carat—dramatically lower than the 126-gallon mining average.',
    icon: Droplet,
  },
  {
    title: 'Solar-backed brilliance',
    description:
      'Our partner labs run on solar and hydro energy, reducing emissions 93% compared with open-pit diamond extraction.',
    icon: Sun,
  },
  {
    title: 'Recycled-metal finishing',
    description:
      'Each Sustainable Icon is set in recycled gold or platinum, with every offcut reclaimed into future Coral & Sky designs.',
    icon: Recycle,
  },
]

const comparisonBlocks = [
  {
    label: 'GlowGlitch Lab-grown Diamond',
    eyebrow: 'Renewable-energy cultured',
    points: [
      'Powered by 100% solar and hydro energy for a 93% emission reduction versus mined stones.',
      'Closed-loop capture limits water use to 15 recycled gallons per carat.',
      'Delivered with IGI traceability papers and our lifetime brilliance pledge.',
    ],
    badge: 'Best for heirloom brilliance',
  },
  {
    label: 'GlowGlitch Moissanite',
    eyebrow: 'Ultra-low footprint sparkle',
    points: [
      'Created from recycled silicon carbide with near-zero waste heat.',
      'Produces under 5% of the carbon and water impact of natural diamonds.',
      '9.25 Mohs hardness and colorless fire that shines through everyday wear.',
    ],
    badge: 'Best for bold everyday wear',
  },
  {
    label: 'Natural Diamond (Industry Avg.)',
    eyebrow: 'High-impact extraction',
    points: [
      'Requires displacing roughly 250 tons of earth per carat in open-pit mines.',
      'Consumes up to 126 gallons of water and emits 150 lbs CO₂ per carat.',
      'Opaque supply chains make wage transparency and traceability difficult.',
    ],
    badge: 'Impact we eliminate',
  },
]

const journeySteps = [
  {
    title: 'Choose a planet-forward setting',
    body: 'Select recycled gold or platinum silhouettes engineered to catch Coral & Sky lighting from every angle.',
  },
  {
    title: 'Compare brilliance in real time',
    body: 'Toggle between lab-grown diamond and moissanite to view footprint, price, and glow adjustments instantly.',
  },
  {
    title: 'Confirm with the concierge team',
    body: 'Our sustainability stylists verify sizing, certify paperwork, and schedule low-impact delivery windows.',
  },
]

const stats = [
  { label: 'Average emissions saved per capsule', value: '2.1 kg CO₂e' },
  { label: 'Water recaptured in growth loops', value: '95%' },
  { label: 'Certified partner labs worldwide', value: '12' },
]

export default function SustainableIconsPage() {
  return (
    <div className="bg-app pb-24">
      <Section spacing="relaxed">
        <SectionContainer size="wide" className="space-y-10">
          <div className="space-y-5 text-body">
            <Typography variant="eyebrow" className="text-accent-primary">
              Planet-positive capsule
            </Typography>
            <Typography as="h1" variant="heading" className="max-w-3xl text-text-primary">
              Sustainable Icons, crafted for luminous impact
            </Typography>
            <Typography variant="body" className="max-w-2xl text-text-secondary">
              Explore low-impact stones finished in recycled metals. GlowGlitch lab-grown diamonds and moissanite capture Coral &amp; Sky glow while keeping your capsule light on the planet.
            </Typography>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              href="/collections?category=sustainable-icons"
              variant="accent"
              tone="coral"
              className="justify-center sm:min-w-[13rem]"
            >
              Explore capsule pieces
            </Button>
            <Button
              href="/support/sustainability"
              variant="glass"
              tone="sky"
              className="justify-center sm:min-w-[13rem]"
            >
              Review sourcing credentials
            </Button>
          </div>
        </SectionContainer>
      </Section>

      <Section>
        <SectionContainer size="wide" className="space-y-12">
          <Typography as="h2" variant="heading" className="text-text-primary">
            Why Sustainable Icons stay light on the planet
          </Typography>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="flex h-full flex-col gap-4 rounded-2xl border border-border-subtle bg-surface-base p-6 shadow-soft"
                >
                  <Icon className="h-8 w-8 text-accent-primary" aria-hidden />
                  <div className="space-y-2">
                    <Typography as="h3" variant="title" className="text-text-primary">
                      {item.title}
                    </Typography>
                    <Typography variant="body" className="text-text-secondary">
                      {item.description}
                    </Typography>
                  </div>
                </div>
              )
            })}
          </div>
        </SectionContainer>
      </Section>

      <Section className="bg-surface-base/40">
        <SectionContainer size="wide" className="space-y-10">
          <div className="space-y-3 text-body">
            <Typography variant="eyebrow" className="text-text-muted">
              Stones compared
            </Typography>
            <Typography as="h2" variant="heading" className="text-text-primary">
              Lab-grown diamond &amp; moissanite vs. mined diamond
            </Typography>
            <Typography variant="body" className="max-w-3xl text-text-secondary">
              Show shoppers the brilliance and impact data side by side—two planet-forward options from GlowGlitch versus the industry baseline.
            </Typography>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {comparisonBlocks.map((block) => (
              <div
                key={block.label}
                className="flex h-full flex-col gap-6 rounded-2xl border border-border-subtle bg-surface-base p-6 text-body shadow-soft"
              >
                <div className="space-y-1">
                  <Typography variant="caption" className="uppercase tracking-[0.18em] text-text-muted">
                    {block.eyebrow}
                  </Typography>
                  <Typography as="h3" variant="title" className="text-text-primary">
                    {block.label}
                  </Typography>
                  <span className="inline-flex w-fit rounded-full bg-accent-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-primary">
                    {block.badge}
                  </span>
                </div>
                <ul className="space-y-3 text-sm text-text-secondary">
                  {block.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-2 block h-1 w-1 flex-shrink-0 rounded-full bg-accent-primary" aria-hidden />
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionContainer>
      </Section>

      <Section>
        <SectionContainer size="wide" className="space-y-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="space-y-6">
              <Typography as="h2" variant="heading" className="text-text-primary">
                Your path to a Sustainable Icon
              </Typography>
              <Typography variant="body" className="text-text-secondary">
                Guide shoppers through three quick steps—mirroring our Support Hub concierge experience so capsule journeys feel intuitive and trusted.
              </Typography>
              <StatsStrip items={stats} columns={{ base: 1, sm: 3 }} className="rounded-2xl border border-border-subtle bg-surface-base p-6 shadow-soft" />
            </div>
            <ol className="space-y-4">
              {journeySteps.map((step, index) => (
                <li
                  key={step.title}
                  className="flex gap-4 rounded-2xl border border-border-subtle bg-surface-base p-5 shadow-soft"
                >
                  <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent-primary/10 text-sm font-semibold text-accent-primary">
                    {index + 1}
                  </span>
                  <div className="space-y-1">
                    <Typography variant="body" className="font-semibold text-text-primary">
                      {step.title}
                    </Typography>
                    <Typography variant="body" className="text-text-secondary">
                      {step.body}
                    </Typography>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </SectionContainer>
      </Section>

      <Section>
        <SectionContainer size="wide">
          <div className="flex flex-col gap-8 rounded-2xl border border-border-subtle bg-surface-base px-8 py-14 text-body shadow-soft md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <Typography variant="eyebrow" className="text-accent-primary">
                Ready to build?
              </Typography>
              <Typography as="h2" variant="heading" className="text-text-primary">
                Launch your next Sustainable Icons capsule
              </Typography>
              <Typography variant="body" className="max-w-xl text-text-secondary">
                Let creators and shoppers design with confidence—toggle between planet-forward stones, share certifications, and keep every capsule aligned with your sustainability goals.
              </Typography>
            </div>
            <div className="flex flex-col gap-3 md:min-w-[15rem]">
              <Button href="/collections?category=sustainable-icons" variant="accent" tone="coral" className="justify-center">
                Browse capsule pieces
              </Button>
              <Button href="/support/help" variant="glass" tone="sky" className="justify-center">
                Chat with sustainability concierge
              </Button>
            </div>
          </div>
        </SectionContainer>
      </Section>
    </div>
  )
}
