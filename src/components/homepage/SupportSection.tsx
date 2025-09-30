'use client'

import { useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'

import {
  BookOpen,
  Mail,
  MessageSquare,
  Phone,
} from 'lucide-react'

import { Button, Card, CardContent, CardHeader, CardTitle, Typography, buttonVariants } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { SupportSectionData } from './types'

const ACTION_ACCENT_CLASSES = {
  volt: {
    icon: 'bg-gradient-volt text-void-950 shadow-neon-volt',
    buttonGlow: 'volt' as const,
  },
  cyber: {
    icon: 'bg-gradient-cyber text-void-950 shadow-neon-cyber',
    buttonGlow: 'cyber' as const,
  },
  digital: {
    icon: 'bg-gradient-digital text-void-950 shadow-neon-digital',
    buttonGlow: 'digital' as const,
  },
  acid: {
    icon: 'bg-gradient-acid text-void-950 shadow-neon-acid',
    buttonGlow: 'acid' as const,
  },
} as const

const ICONS = {
  'message-square': MessageSquare,
  mail: Mail,
  phone: Phone,
  'book-open': BookOpen,
} as const

export function SupportSection({ eyebrow, heading, description, quickActions, faq, form }: SupportSectionData) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const handleToggle = (index: number) => {
    setActiveIndex((prev) => (prev === index ? -1 : index))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    event.currentTarget.reset()
  }

  const accentMap = useMemo(() => ACTION_ACCENT_CLASSES, [])

  return (
    <section data-testid="support-section" className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_center,_rgba(0,212,255,0.12),_transparent_70%)]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(65%_65%_at_50%_10%,rgba(255,0,244,0.08),transparent_75%)]" aria-hidden />
      <div className="container space-y-12">
        <div className="space-y-4 text-center lg:text-left">
          <Typography variant="eyebrow" className="text-digital-blue">
            {eyebrow}
          </Typography>
          <Typography variant="headline" className="gradient-holo-text">
            {heading}
          </Typography>
          <Typography variant="body-lg" tone="muted" className="mx-auto max-w-3xl lg:mx-0">
            {description}
          </Typography>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-10">
            <div className="grid gap-6 md:grid-cols-2">
              {quickActions.map((action) => {
                const accent = accentMap[action.accent]
                const Icon = ICONS[action.icon] ?? MessageSquare
                return (
                  <Card
                    key={action.title}
                    variant="glass"
                    glow={accent.buttonGlow}
                    className="flex h-full flex-col border border-white/10 bg-void-900/70"
                  >
                    <CardHeader className="space-y-4 p-6">
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-pill text-xl',
                          accent.icon,
                        )}
                      >
                        <Icon className="h-6 w-6" aria-hidden />
                      </div>
                      <CardTitle className="text-lg text-void-50">{action.title}</CardTitle>
                      <Typography variant="body" tone="muted">
                        {action.description}
                      </Typography>
                    </CardHeader>
                    <CardContent className="mt-auto px-6 pb-6">
                      {action.href ? (
                        <Link
                          href={action.href}
                          className={cn(
                            buttonVariants({ variant: 'primary', size: 'sm', glow: accent.buttonGlow }),
                            'rounded-pill px-5 font-semibold text-void-950',
                          )}
                        >
                          {action.ctaLabel}
                        </Link>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          tone={action.accent}
                          glow={accent.buttonGlow}
                          className="px-5 font-semibold"
                          type="button"
                        >
                          {action.ctaLabel}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="space-y-4">
              <Typography variant="title" className="text-void-50">
                {faq.title}
              </Typography>
              <div className="space-y-3">
                {faq.items.map((item, index) => {
                  const isActive = activeIndex === index
                  return (
                    <Card
                      key={item.question}
                      variant="glass"
                      glow={isActive ? 'digital' : 'none'}
                      className="border border-white/10 bg-void-900/70"
                    >
                      <CardHeader className="p-6 pb-4">
                        <button
                          type="button"
                          onClick={() => handleToggle(index)}
                          aria-expanded={isActive}
                          aria-controls={`support-faq-${index}`}
                          className="flex w-full items-center justify-between text-left text-void-50"
                        >
                          <span className="text-heading font-semibold">{item.question}</span>
                          <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-pill border border-white/20 bg-white/10 text-lg leading-none">
                            {isActive ? '−' : '+'}
                          </span>
                        </button>
                      </CardHeader>
                      <CardContent
                        id={`support-faq-${index}`}
                        role="region"
                        aria-hidden={!isActive}
                        className={cn(
                          'overflow-hidden px-6 pt-0 text-body text-void-200 transition-all duration-300',
                          isActive ? 'max-h-96 pb-6' : 'max-h-0'
                        )}
                      >
                        <p>{item.answer}</p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>

          <Card variant="glass" glow="digital" className="border border-white/10 bg-void-900/70">
            <CardHeader className="space-y-4 p-8 pb-6">
              <Typography variant="eyebrow">Contact Guild</Typography>
              <CardTitle className="text-2xl text-void-50">{form.heading}</CardTitle>
              <Typography variant="body" tone="muted">
                {form.description}
              </Typography>
              {submitted && (
                <div className="rounded-pill border border-volt-glow/40 bg-volt-glow/10 px-4 py-2 text-small text-volt-glow">
                  {form.successMessage}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-5 p-8 pt-0">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block text-sm font-semibold text-void-100">
                  {form.nameLabel}
                  <input
                    name="name"
                    required
                    autoComplete="name"
                    className="mt-2 w-full rounded-pill border border-white/10 bg-void-950/60 px-4 py-3 text-body text-void-100 placeholder-void-400 focus:border-volt-glow focus:outline-none"
                  />
                </label>
                <label className="block text-sm font-semibold text-void-100">
                  {form.emailLabel}
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="mt-2 w-full rounded-pill border border-white/10 bg-void-950/60 px-4 py-3 text-body text-void-100 placeholder-void-400 focus:border-volt-glow focus:outline-none"
                  />
                </label>
                <label className="block text-sm font-semibold text-void-100">
                  {form.messageLabel}
                  <textarea
                    name="message"
                    required
                    rows={4}
                    className="mt-2 w-full rounded-ultra border border-white/10 bg-void-950/60 px-4 py-3 text-body text-void-100 placeholder-void-400 focus:border-volt-glow focus:outline-none"
                  />
                </label>
                <Button type="submit" tone="digital" glow="digital" className="rounded-pill px-8 font-semibold">
                  {form.submitLabel}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default SupportSection
