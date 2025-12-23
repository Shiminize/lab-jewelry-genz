'use client'

import { Mail } from 'lucide-react'
import { Button, Typography } from '@/components/ui'

const SUPPORT_EMAIL = 'concierge@glowglitch.com'

const faqs = [
  {
    question: 'How long do made-to-order GlowGlitch pieces take?',
    answer:
      'Most custom designs move from sketch to polish in 10–15 business days. We fast-track capsule refreshes and keep you posted at each studio milestone.',
  },
  {
    question: 'Can I request adjustments after receiving my jewelry?',
    answer:
      'Yes. Rings include one complimentary resize within 60 days, and all capsule pieces qualify for fit tweaks or finishing touch requests—just email the concierge team.',
  },
  {
    question: 'What sustainability practices does GlowGlitch follow?',
    answer:
      'We rely on recycled gold, carbon-neutral lab-grown stones, and low-volume studio runs. Packaging is curbside recyclable and we offset shipping by default.',
  },
  {
    question: 'Do you offer digital previews before production?',
    answer:
      'Every request receives a 3D turntable preview with Coral & Sky lighting presets. You can approve or give feedback by replying to the concierge email.',
  },
  {
    question: 'How are repairs or refresh services handled?',
    answer:
      'Email the concierge with photos or a short video. We arrange insured shipping both ways and return most clean-and-polish refreshes within five business days.',
  },
  {
    question: 'What payment plans are available?',
    answer:
      'Split your capsule across Shop Pay Installments or Klarna at checkout. The concierge can also stage custom invoices if you need longer studio timelines.',
  },
]

const highlightPills = [
  { title: 'Response time', description: 'Under 1 hour on studio days' },
  { title: 'Availability', description: 'Mon–Fri, 9am–7pm ET' },
  { title: 'Follow-up', description: 'Every message receives a designer reply' },
]

export function SupportHelpPanel() {
  return (
    <div className="grid gap-14 lg:grid-cols-[minmax(0,2.4fr)_minmax(0,3fr)]">
      <div className="space-y-8">
        <div className="flex flex-col gap-6 rounded-3xl border border-border-subtle/60 bg-surface-base/70 p-8 lg:p-10">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-primary/12 text-accent-primary">
              <Mail className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="space-y-1.5">
              <Typography as="h2" variant="title" className="text-text-primary">
                concierge@glowglitch.com
              </Typography>
              <Typography className="text-sm leading-6 text-text-secondary">
                Send render approvals, sizing requests, or production tweaks and our studio team will match metals,
                stones, or finishing touches.
              </Typography>
            </div>
          </div>
          <Button
            href={`mailto:${SUPPORT_EMAIL}?subject=GlowGlitch%20Support%20Request`}
            className="w-full justify-center lg:w-auto"
            tone="sky"
          >
            Email the concierge team
          </Button>
          <dl className="grid gap-3 border-t border-border-subtle/60 pt-6 sm:grid-cols-3">
            {highlightPills.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-surface-base/60 p-4 text-left"
              >
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                  {item.title}
                </dt>
                <dd className="mt-2 text-sm text-text-secondary">{item.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="flex flex-col gap-6 rounded-3xl border border-border-subtle/60 bg-surface-base/70 p-6 lg:p-8">
        <div>
          <Typography as="h2" variant="title" className="text-text-primary">
            Popular questions
          </Typography>
          <Typography className="text-sm text-text-secondary">
            Quick guidance for the questions we hear most often from custom capsule clients.
          </Typography>
        </div>
        <div className="divide-y divide-border-subtle/60">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group py-4"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-sm font-semibold text-text-primary marker:content-none transition hover:text-accent-primary">
                {faq.question}
                <span className="text-xl leading-none text-accent-primary transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pt-3 text-sm leading-7 text-text-secondary">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
