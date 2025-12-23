'use client'

import Link from 'next/link'
import { Mail, MessageCircle, Phone, BookOpen } from 'lucide-react'

import { Button } from '@/components/ui'
import { Section, SectionContainer } from '@/components/layout/Section'
import { cn } from '@/lib/utils'

type SupportChannel = {
  title: string
  description: string
  actionLabel: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

type FAQ = {
  question: string
  answer: string
}

const supportChannels: SupportChannel[] = [
  {
    title: 'Support Hub',
    description: 'Browse FAQs and reach our concierge team in one place.',
    actionLabel: 'Open Support Hub',
    href: '/support/help',
    icon: MessageCircle,
  },
  {
    title: 'Email Concierge',
    description: 'Replies land in your inbox within 2 business hours.',
    actionLabel: 'Email the concierge',
    href: 'mailto:concierge@glowglitch.com',
    icon: Mail,
  },
  {
    title: 'Call Scheduling',
    description: 'Book a weekday call with our creator success team.',
    actionLabel: 'Schedule now',
    href: 'https://cal.com/glowglitch/support',
    icon: Phone,
  },
  {
    title: 'Help Center',
    description: 'Browse quick-start guides, sizing tips, and token updates.',
    actionLabel: 'Browse articles',
    href: '/support',
    icon: BookOpen,
  },
]

const faqs: FAQ[] = [
  {
    question: 'Are GlowGlitch diamonds lab-grown or mined?',
    answer:
      'Every capsule uses certified lab-grown stones grown with renewable energy. You get identical sparkle to mined diamonds without the environmental trade-offs.',
  },
  {
    question: 'How long does it take to make my jewelry?',
    answer:
      'Production starts as soon as your order is confirmed. Most custom pieces ship within 12–15 business days, and we’ll email progress updates along the way.',
  },
  {
    question: 'Can I preview my design before buying?',
    answer:
      'Yes—use the 3D customizer to rotate, swap metals, and view Coral & Sky lighting presets. You can save renders or share a link for feedback before checkout.',
  },
  {
    question: 'What metals and stones are available?',
    answer:
      'Choose from platinum, yellow, or rose gold paired with DEF/VVS lab-grown diamonds. Select styles also support moissanite and colored lab-grown gemstones.',
  },
  {
    question: 'Do you offer resizing or adjustments?',
    answer:
      'We provide one complimentary resizing for rings within 60 days of delivery. Email the concierge team and we’ll send a prepaid return label.',
  },
  {
    question: 'What warranty is included?',
    answer:
      'Every GlowGlitch piece is backed by a lifetime manufacturing warranty plus one year of free cleanings and prong checks through our concierge team.',
  },
  {
    question: 'How do shipping and delivery work?',
    answer:
      'Orders ship fully insured via FedEx Priority. U.S. delivery typically arrives in 2 business days once your piece leaves the studio. International timelines vary by region.',
  },
  {
    question: 'What is your return policy?',
    answer:
      'Ready-to-ship items can be returned within 30 days in unworn condition. Custom capsules qualify for exchanges or studio credit—contact support for tailored options.',
  },
  {
    question: 'Is the jewelry sustainably made?',
    answer:
      'Yes. We produce in low-volume studio runs, use recycled precious metals, and source diamonds from carbon-neutral growers with third-party traceability.',
  },
  {
    question: 'How should I care for my GlowGlitch piece?',
    answer:
      'Store it in the provided microfiber pouch, avoid harsh chemicals, and clean with warm soapy water or the included polishing cloth. Schedule annual checkups for long-term shine.',
  },
]

const contactTopics = ['Creator program', 'Order support', 'Customization help', 'Partnerships']

export function SupportSection() {
  return (
    <Section spacing="compact" className="relative bg-app text-ink">
      <SectionContainer size="full" className="px-0 flex flex-col gap-[var(--space-fluid-2xl)] pb-[var(--space-fluid-md)]">
        <SectionContainer size="content" className="flex flex-col gap-[var(--space-fluid-sm)] text-center items-center md:items-start md:text-left">
          <span className="font-accent text-xs tracking-[0.28em] uppercase text-muted">Need a hand?</span>
          <h2 className="m-0 font-heading text-[clamp(2.2rem,4vw,3rem)] leading-[1.18] text-ink">How can we help?</h2>
          <p className="m-0 max-w-[720px] text-base leading-[1.7] text-ink-2">
            Reach the GlowGlitch concierge team or browse the essentials for creators, shoppers, and stylists.
          </p>
        </SectionContainer>

        <SectionContainer size="gallery" bleed className="px-4 sm:px-6 lg:px-10 xl:px-0 grid gap-[var(--space-fluid-sm)] md:grid-cols-2 xl:grid-cols-4">
          {supportChannels.map((channel) => {
            const Icon = channel.icon
            return (
              <div key={channel.title} className="group flex flex-col justify-between gap-[var(--space-fluid-sm)] border border-border-subtle rounded-none bg-surface shadow-soft p-[var(--space-fluid-md)] transition-all duration-250 min-h-full hover:-translate-y-1 hover:shadow-lift hover:border-line-strong focus-visible:-translate-y-1 focus-visible:shadow-lift focus-visible:border-line-strong focus-visible:outline-none">
                <div className="flex gap-3 items-start">
                  <Icon className="w-8 h-8 text-accent" aria-hidden />
                  <div>
                    <p className="font-heading m-[0_0_4px] text-[1.05rem] font-semibold text-ink">{channel.title}</p>
                    <p className="m-0 text-[0.95rem] leading-[1.6] text-ink-2">{channel.description}</p>
                  </div>
                </div>
                <Link href={channel.href} className="font-accent text-[0.75rem] font-semibold tracking-[0.18em] uppercase text-ink-2 no-underline transition-colors duration-200 group-hover:text-ink group-focus-visible:text-ink">
                  {channel.actionLabel} →
                </Link>
              </div>
            )
          })}
        </SectionContainer>

        <SectionContainer size="gallery" bleed className="px-4 sm:px-6 lg:px-10 xl:px-0 grid gap-[var(--space-fluid-lg)] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="border border-border-subtle rounded-none bg-surface shadow-soft p-[var(--space-fluid-lg)]">
            <h3 className="font-heading m-[0_0_12px] text-[1.2rem] font-semibold text-ink">Frequently Asked</h3>
            <div className="flex flex-col gap-3">
              {faqs.map((faq) => (
                <details key={faq.question} className="border border-border-subtle rounded-none bg-neutral-050/50 px-[18px] py-[14px] transition-all duration-200 open:border-line-strong open:bg-neutral-050 open:shadow-soft group/faq">
                  <summary className="flex items-center justify-between cursor-pointer list-none text-[0.95rem] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <span className="ml-4 text-[1.1rem] text-muted transition-all duration-200 group-open/faq:rotate-45 group-open/faq:text-accent">+</span>
                  </summary>
                  <p className="m-[12px_0_0] text-[0.92rem] leading-[1.6] text-ink-2">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="border border-border-subtle rounded-none bg-surface shadow-soft p-[var(--space-fluid-lg)]">
            <h3 className="font-heading m-[0_0_12px] text-[1.2rem] font-semibold text-ink">Contact Us</h3>
            <p className="m-[0_0_18px] text-[0.95rem] leading-[1.6] text-ink-2">
              Share a quick note and we’ll follow up within one business day. Prefer live help? Chat is fastest.
            </p>
            <form action="mailto:support@glowglitch.com" method="post" className="flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-[0.72rem] font-semibold tracking-[0.18em] uppercase text-muted">Your name</span>
                <input type="text" name="name" className="w-full p-[14px] border border-border-subtle rounded-none bg-neutral-050/50 text-[0.95rem] text-ink transition-all duration-200 focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-focus" placeholder="Add your name" required />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[0.72rem] font-semibold tracking-[0.18em] uppercase text-muted">Email address</span>
                <input type="email" name="email" className="w-full p-[14px] border border-border-subtle rounded-none bg-neutral-050/50 text-[0.95rem] text-ink transition-all duration-200 focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-focus" placeholder="you@example.com" required />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[0.72rem] font-semibold tracking-[0.18em] uppercase text-muted">Topic</span>
                <select name="topic" className="w-full p-[14px] border border-border-subtle rounded-none bg-neutral-050/50 text-[0.95rem] text-ink transition-all duration-200 focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-focus appearance-none">
                  {contactTopics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[0.72rem] font-semibold tracking-[0.18em] uppercase text-muted">How can we help?</span>
                <textarea
                  name="message"
                  rows={4}
                  className="w-full p-[14px] border border-border-subtle rounded-none bg-neutral-050/50 text-[0.95rem] text-ink transition-all duration-200 focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-focus resize-y min-h-[140px]"
                  placeholder="Share the details and any timelines."
                  required
                />
              </label>
              <Button type="submit" variant="primary" className="w-full justify-center bg-accent text-accent-contrast">
                Send Message
              </Button>
            </form>
          </div>
        </SectionContainer>
      </SectionContainer>
    </Section>
  )
}
