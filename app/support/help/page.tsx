import type { Metadata } from 'next'
import Image from 'next/image'

import { Section, SectionContainer } from '@/components/layout/Section'
import { Button, Typography } from '@/components/ui'

export const metadata: Metadata = {
  title: 'GlowGlitch Care & Sizing',
  description: 'Sizing references, care rituals, and concierge contact details.',
}

const sizingGuides = [
  {
    title: 'Necklaces',
    description: 'Use a soft tape and note where each layer lands.',
    bullets: ['Collar 14"', 'Everyday 16–18"', 'Layering 20–22"'],
  },
  {
    title: 'Bracelets',
    description: 'Measure above the wrist bone, add 0.25–0.5".',
    bullets: ['Fitted 5.5–6"', 'Relaxed 6.5–7"', 'Statement 7.5+"'],
  },
  {
    title: 'Rings',
    description: 'Size late in the day when hands are warm.',
    bullets: ['Stacking = true-to-size', 'Statement = +0.25', 'Thumb/Midi = +0.5'],
  },
]

const sizingFaqs = [
  {
    question: 'How do I layer necklaces cleanly?',
    answer:
      'Aim for 1.5–2" between chains. Start with a 14" collar, follow with a 16–18" everyday chain, then finish with a 20–22" charm.',
  },
  {
    question: 'Can I request a sizing consult?',
    answer:
      'Yes. Email concierge@glowglitch.com with photos or measurements and we will reply with fit notes plus an insured label if adjustments are needed.',
  },
]

const careChecklist = [
  { title: 'Weekly wipe', description: 'Microfiber cloth after wear keeps lab stones luminous.' },
  { title: 'Monthly soak', description: 'Mild soap + warm water bath, rinse well, pat dry.' },
  { title: 'Studio refresh', description: 'Twice a year we ultrasonic clean, inspect prongs, and re-plate when needed.' },
]

const careFaqs = [
  {
    question: 'Which cleaners are safe?',
    answer: 'Stick with mild soap and water. Avoid harsh chemicals or at-home ultrasonic machines unless the concierge guides you.',
  },
  {
    question: 'What if my ring needs a resize?',
    answer: 'Every purchase includes one complimentary resize within 60 days. Email the concierge and we will send an insured label with next steps.',
  },
]

export default function SupportHelpPage() {
  return (
    <div className="bg-app">
      <Section spacing="relaxed">
        <SectionContainer className="grid items-center gap-8 text-center lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.8fr)] lg:text-left">
          <div className="space-y-4">
            <Typography variant="eyebrow" className="text-accent-primary">
              GlowGlitch Care & Sizing
            </Typography>
            <Typography as="h1" variant="heading">
              Fit guides and upkeep, backed by concierge
            </Typography>
            <Typography variant="body" className="mx-auto max-w-2xl text-text-secondary lg:mx-0">
              Use these quick references before looping in the studio. We cover measurements, care cadence, and the FAQs we hear
              most. Need a second opinion? Email or book a consult anytime.
            </Typography>
            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <Button tone="coral" variant="accent" href="mailto:concierge@glowglitch.com?subject=Sizing%20Consult">
                Request sizing help
              </Button>
              <Button variant="outline" tone="sky" href="https://cal.com/glowglitch/care">
                Book a care consult
              </Button>
            </div>
          </div>
          <div className="mx-auto w-full max-w-xl overflow-hidden rounded-[12px] border border-border-subtle/60 bg-surface-base/80 shadow-soft">
            <div className="relative aspect-[3/2] max-h-[360px]">
              <Image
                src="/images/catalog/Sora/support/support_hero_sizer_3x2_linen.webp"
                alt="Sizing tools and a microfiber cloth arranged on an ivory linen surface with a deep green edge stripe."
                fill
                sizes="(min-width: 1280px) 720px, (min-width: 768px) 60vw, 100vw"
                className="object-cover object-center"
                priority
              />
            </div>
          </div>
        </SectionContainer>
      </Section>

      <Section spacing="compact">
        <SectionContainer className="space-y-6">
          <Typography as="h2" variant="title">
            Sizing guide
          </Typography>
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,0.45fr)_minmax(0,1fr)]">
            <div className="relative overflow-hidden rounded-3xl border border-border-subtle/60 bg-surface-base/80 shadow-soft">
              <div className="relative aspect-[4/5]">
                <Image
                  src="/images/catalog/Sora/support/support_sizing_necklace_4x5_diagram.webp"
                  alt="Diagram showing necklace length positions on an outline figure."
                  fill
                  sizes="(min-width: 1280px) 520px, (min-width: 768px) 45vw, 100vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                {sizingGuides.map((guide) => (
                  <article key={guide.title} className="space-y-3 rounded-3xl border border-border-subtle/60 bg-surface-base/70 p-5">
                    <Typography variant="caption" className="uppercase tracking-[0.2em] text-text-muted">
                      {guide.title}
                    </Typography>
                    <Typography className="text-sm text-text-secondary">{guide.description}</Typography>
                    <ul className="text-sm text-text-secondary">
                      {guide.bullets.map((bullet) => (
                        <li key={bullet}>• {bullet}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
              <div className="rounded-3xl border border-border-subtle/60 bg-surface-base/70 p-6">
                <Typography as="h3" variant="title" className="mb-4">
                  Sizing FAQs
                </Typography>
                <div className="divide-y divide-border-subtle/60">
                  {sizingFaqs.map((faq) => (
                    <details key={faq.question} className="group py-4">
                      <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold">
                        {faq.question}
                        <span className="text-xl text-accent-primary transition-transform duration-200 group-open:rotate-45">+</span>
                      </summary>
                      <Typography variant="body" className="pt-3 text-text-secondary">
                        {faq.answer}
                      </Typography>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SectionContainer>
      </Section>

      <Section spacing="compact">
        <SectionContainer className="space-y-6">
          <Typography as="h2" variant="title">
            Caring guide
          </Typography>
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,0.45fr)_minmax(0,1fr)]">
            <div className="relative overflow-hidden rounded-3xl border border-border-subtle/60 bg-surface-base/80 shadow-soft">
              <div className="relative aspect-[4/5]">
                <Image
                  src="/images/catalog/Sora/support/support_care_wipe_4x5_cloth.webp"
                  alt="Microfiber cloth wiping a ring on an ivory linen surface."
                  fill
                  sizes="(min-width: 1280px) 520px, (min-width: 768px) 45vw, 100vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                {careChecklist.map((item) => (
                  <article key={item.title} className="space-y-2 rounded-3xl border border-border-subtle/60 bg-surface-base/70 p-5">
                    <Typography variant="caption" className="uppercase tracking-[0.2em] text-accent-primary">
                      {item.title}
                    </Typography>
                    <Typography variant="body" className="text-text-secondary">
                      {item.description}
                    </Typography>
                  </article>
                ))}
              </div>
              <div className="rounded-3xl border border-border-subtle/60 bg-surface-base/70 p-6">
                <Typography as="h3" variant="title" className="mb-4">
                  Care FAQs
                </Typography>
                <div className="divide-y divide-border-subtle/60">
                  {careFaqs.map((faq) => (
                    <details key={faq.question} className="group py-4">
                      <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold">
                        {faq.question}
                        <span className="text-xl text-accent-primary transition-transform duration-200 group-open:rotate-45">+</span>
                      </summary>
                      <Typography variant="body" className="pt-3 text-text-secondary">
                        {faq.answer}
                      </Typography>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SectionContainer>
      </Section>

      <Section spacing="compact">
        <SectionContainer className="space-y-4 rounded-3xl border border-border-subtle/60 bg-surface-base/70 p-8 text-center">
          <Typography as="h2" variant="title">
            Talk to the care team
          </Typography>
          <Typography variant="body" className="text-text-secondary">
            Share photos or measurements and we’ll confirm fits, polishing tips, or next appointment dates.
          </Typography>
          <div className="mx-auto max-w-2xl overflow-hidden rounded-[12px] border border-border-subtle/60 bg-surface-base/80 shadow-soft">
            <div className="relative aspect-[3/2]">
              <Image
                src="/images/catalog/Sora/support/support_concierge_hand_3x2_envelope.webp"
                alt="Hand holding a deep green envelope over an ivory desk with soft window shadows."
                fill
                sizes="(min-width: 1280px) 780px, (min-width: 768px) 640px, 100vw"
                className="object-cover object-center"
              />
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button tone="coral" variant="accent" href="mailto:concierge@glowglitch.com">
              Email care team
            </Button>
            <Button variant="outline" tone="sky" href="https://cal.com/glowglitch/care">
              Book a care consult
            </Button>
          </div>
        </SectionContainer>
      </Section>
    </div>
  )
}
