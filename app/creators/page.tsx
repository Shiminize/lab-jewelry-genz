import Link from 'next/link'
import Image from 'next/image'

import { Button, Typography } from '@/components/ui'
import { Section, SectionContainer } from '@/components/layout/Section'

const ambassadorTiers = [
  {
    name: 'Insider',
    rate: '15%',
    focus: 'Community',
    cadence: '1 shared edit per month',
    perks: ['Personal discount code', '20% off personal orders'],
  },
  {
    name: 'Stylist',
    rate: '20%',
    focus: 'Content Creation',
    cadence: '2 shared edits per month',
    perks: ['Free monthly seeding', '30% off personal orders'],
  },
  {
    name: 'Muse',
    rate: '25%',
    focus: 'Campaign Features',
    cadence: '4 shared edits per month',
    perks: ['Homepage spotlight', 'Quarterly gifting box'],
  },
  {
    name: 'Icon',
    rate: 'Custom',
    focus: 'Brand Partnership',
    cadence: 'Full campaign usage',
    perks: ['Co-branded collection', 'Paid media support'],
  },
]

const ambassadorToolkit = [
  {
    title: 'The Vault',
    description: 'Full access to our entire catalog for styling, curation, and content creation.',
  },
  {
    title: 'Affiliate Dashboard',
    description: 'Real-time tracking of your clicks, conversions, and payouts via a dedicated portal.',
  },
  {
    title: 'Priority Seeding',
    description: 'Be the first to wear and review new drops before they launch to the public.',
  },
]

const ambassadorFlow = [
  {
    title: 'Apply',
    body: 'Connect your socials and tell us about your style. Most applications are approved in 48 hours.',
  },
  {
    title: 'Select',
    body: 'Choose your favorites from our "Stylist Vault" to receive as your welcome seeding kit.',
  },
  {
    title: 'Share',
    body: 'Post your look with your exclusive code. You earn commission whenever your community shops.',
  },
]

const ambassadorFAQ = [
  {
    question: 'Do I need to buy jewelry?',
    answer: 'No. Accepted Ambassadors receive a seeding credit to order their first pieces for free.',
  },
  {
    question: 'How do I get paid?',
    answer: 'Payouts are processed weekly via Stripe once your balance hits $50. You can track everything in your dashboard.',
  },
  {
    question: 'Can I choose what I promote?',
    answer: 'Absolutely. You have full creative freedom to curate edits that match your personal style.',
  },
]

const ambassadorMetrics = [
  { label: 'Avg. approval time', value: '48 hrs' },
  { label: 'Avg. monthly earnings', value: '$1.5K' },
  { label: 'Ambassador retention', value: '94%' },
]

type CreatorProgramPageProps = {
  searchParams?: Record<string, string | string[]>
}

export default function CreatorProgramPage({ searchParams }: CreatorProgramPageProps) {
  const submittedParam = searchParams ? getParam(searchParams, 'submitted') : undefined
  const errorParam = searchParams ? getParam(searchParams, 'error') : undefined

  const submissionState =
    submittedParam === '1'
      ? 'success'
      : errorParam === '1'
        ? 'error'
        : undefined

  return (
    <div className="bg-app pb-24">
      <Section spacing="relaxed">
        <SectionContainer className="space-y-10">
          <div className="relative w-full aspect-[3/1] bg-surface-base">
            <Image
              src="/images/catalog/Sora/creators/Creators-header.webp"
              alt="GlowGlitch Creators Header"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          </div>
          <div className="space-y-5">
            <Typography variant="eyebrow" className="text-text-muted">
              The GlowGlitch Collective
            </Typography>
            <Typography as="h1" variant="heading" className="max-w-3xl">
              Curate. Capture. Commission.
            </Typography>
            <Typography variant="body" className="max-w-2xl text-text-secondary">
              Become a GlowGlitch Ambassador. Select your favorite pieces from our catalog, style them for your feed, and
              earn 15-25% on every sale you inspire.
            </Typography>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button tone="coral" variant="accent" className="justify-center sm:min-w-[12rem]" href="#apply">
              Apply to Join
            </Button>
            <Button variant="glass" className="justify-center sm:min-w-[12rem]" href="#overview">
              View Perks
            </Button>
          </div>
        </SectionContainer>
      </Section>

      <Section id="overview">
        <SectionContainer className="space-y-12">
          <div className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-base p-6 shadow-soft md:grid-cols-4 md:p-8">
            {ambassadorTiers.map((tier) => (
              <div key={tier.name} className="flex flex-col gap-4">
                <div>
                  <Typography variant="caption" className="uppercase tracking-[0.18em] text-text-muted">
                    {tier.focus}
                  </Typography>
                  <Typography variant="title" className="text-text-primary">
                    {tier.name}
                  </Typography>
                </div>
                <Typography variant="caption" className="font-semibold uppercase tracking-[0.18em] text-accent-primary">
                  {tier.rate} commission
                </Typography>
                <Typography variant="body" className="text-text-secondary">
                  {tier.cadence}
                </Typography>
                <ul className="space-y-1.5 text-sm text-text-secondary">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent-primary" aria-hidden />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {ambassadorToolkit.map((tool) => (
              <div
                key={tool.title}
                className="space-y-3 rounded-2xl border border-border-subtle bg-surface-base px-6 py-5 shadow-soft"
              >
                <Typography as="h3" variant="title" className="text-text-primary">
                  {tool.title}
                </Typography>
                <Typography variant="body" className="text-text-secondary">
                  {tool.description}
                </Typography>
              </div>
            ))}
          </div>

          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <Typography as="h2" variant="title" className="text-text-primary">
                How it works
              </Typography>
              <ol className="space-y-4">
                {ambassadorFlow.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
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
            <div className="space-y-5">
              <Typography as="h2" variant="title" className="text-text-primary">
                Ambassador FAQ
              </Typography>
              <div className="space-y-4">
                {ambassadorFAQ.map((faq) => (
                  <details key={faq.question} className="group rounded-xl border border-border-subtle bg-surface-base/60 p-4 text-text-secondary">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-text-primary outline-none">
                      {faq.question}
                    </summary>
                    <p className="pt-2 text-sm text-text-secondary">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-base px-6 py-5 shadow-soft md:grid-cols-3">
            {ambassadorMetrics.map((metric) => (
              <div key={metric.label} className="space-y-1 text-center md:text-left">
                <Typography variant="caption" className="uppercase tracking-[0.18em] text-text-muted">
                  {metric.label}
                </Typography>
                <Typography variant="title" className="text-text-primary">
                  {metric.value}
                </Typography>
              </div>
            ))}
          </div>
        </SectionContainer>
      </Section>

      <Section id="apply">
        <SectionContainer className="space-y-8">
          {submissionState === 'success' ? (
            <Callout tone="success" title="Application received">
              Thank you for applying. Our team will review your submission and be in touch within two business days.
            </Callout>
          ) : null}
          {submissionState === 'error' ? (
            <Callout tone="error" title="Something went wrong">
              We couldn’t capture your application. Please try again or email{' '}
              <Link href="mailto:creators@glowglitch.com" className="text-accent-primary hover:text-text-primary">
                creators@glowglitch.com
              </Link>
              .
            </Callout>
          ) : null}
          <div className="rounded-2xl border border-border-subtle bg-surface-base p-6 shadow-soft md:p-10">
            <div className="space-y-3 pb-6 text-body md:pb-8">
              <Typography as="h2" variant="heading">
                Apply to the Collective
              </Typography>
              <p className="max-w-2xl text-sm text-text-secondary md:text-base">
                Submit your profile below. Accepted stylists will receive their welcome kit and code within 48 hours.
              </p>
            </div>
            <form className="space-y-6" action="/api/creators/apply" method="post">
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Name" htmlFor="name">
                  <input
                    id="name"
                    name="name"
                    required
                    autoComplete="name"
                    className="w-full rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-secondary/40"
                    placeholder="Taylor Jordan"
                  />
                </Field>
                <Field label="Email" htmlFor="email">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-secondary/40"
                    placeholder="you@example.com"
                  />
                </Field>
                <Field label="Primary platform" htmlFor="platform">
                  <select
                    id="platform"
                    name="platform"
                    required
                    className="w-full appearance-none rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-secondary/40"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select a platform
                    </option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="twitch">Twitch</option>
                    <option value="blog">Blog or newsletter</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Audience size" htmlFor="audience">
                  <select
                    id="audience"
                    name="audience"
                    required
                    className="w-full appearance-none rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-secondary/40"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Choose a range
                    </option>
                    <option value="under-10k">Under 10K followers</option>
                    <option value="10k-50k">10K – 50K followers</option>
                    <option value="50k-100k">50K – 100K followers</option>
                    <option value="100k-250k">100K – 250K followers</option>
                    <option value="250k-plus">250K+ followers</option>
                  </select>
                </Field>
              </div>
              <Field label="Why GlowGlitch? (Optional)" htmlFor="notes">
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  className="w-full rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-secondary/40"
                  placeholder="Tell us about your style or link your portfolio."
                />
              </Field>
              <label className="flex items-center gap-3 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  name="mediaKit"
                  value="yes"
                  className="h-4 w-4 rounded border border-border-subtle text-accent-primary focus:ring-accent-primary"
                />
                Send me the latest media kit and asset drop.
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button tone="coral" variant="accent" type="submit" className="justify-center sm:min-w-[12rem]">
                  Submit Application
                </Button>
                <p className="text-xs text-text-muted sm:text-sm">
                  Questions?{' '}
                  <Link href="mailto:creators@glowglitch.com" className="text-accent-primary hover:text-text-primary">
                    creators@glowglitch.com
                  </Link>{' '}
                  or{' '}
                  <Link href="https://cal.com/glowglitch/creator-demo" className="text-accent-primary hover:text-text-primary">
                    book a consult
                  </Link>
                  .
                </p>
              </div>
            </form>
          </div>
        </SectionContainer>
      </Section>

      <footer className="mx-auto mt-16 flex max-w-4xl flex-col items-center gap-3 px-6 text-center text-sm text-text-secondary">
        <p>Ready to collaborate? Apply now and start building your edit.</p>
        <Button tone="coral" variant="accent" href="#apply" className="justify-center">
          Apply to Join
        </Button>
      </footer>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-2 text-body" htmlFor={htmlFor}>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">{label}</span>
      {children}
    </label>
  )
}

function getParam(params: Record<string, string | string[]>, key: string) {
  const value = params[key]
  if (!value) return undefined
  return Array.isArray(value) ? value[0] : value
}

function Callout({
  tone,
  title,
  children,
}: {
  tone: 'success' | 'error'
  title: string
  children: React.ReactNode
}) {
  const toneStyles =
    tone === 'success'
      ? 'border-accent-secondary/40 bg-accent-secondary/10 text-text-primary'
      : 'border-accent-primary/40 bg-accent-primary/10 text-text-primary'

  return (
    <div className={`space-y-1.5 rounded-2xl border px-4 py-3 text-sm shadow-soft md:px-6 md:py-4 ${toneStyles}`}>
      <p className="font-semibold uppercase tracking-[0.18em]">{title}</p>
      <p>{children}</p>
    </div>
  )
}
