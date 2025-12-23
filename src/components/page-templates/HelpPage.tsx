import { Section, SectionContainer } from '@/components/layout/Section'
import { Button, Typography } from '@/components/ui'

type HelpHero = {
  eyebrow?: string
  heading: string
  body?: string
  primaryCta?: { label: string; href: string }
}

type HelpFaq = {
  question: string
  answer: string
}

type HelpChecklistItem = {
  title: string
  description: string
}

type HelpContact = {
  title: string
  body: string
  ctas: Array<{ label: string; href: string; variant?: 'primary' | 'secondary' }>
}

export type HelpPageContent = {
  hero: HelpHero
  faqs: HelpFaq[]
  checklist?: HelpChecklistItem[]
  contact: HelpContact
}

interface HelpPageProps {
  content: HelpPageContent
}

export function HelpPage({ content }: HelpPageProps) {
  const { hero, faqs, checklist, contact } = content

  return (
    <div className="bg-app">
      <Section spacing="relaxed">
        <SectionContainer className="space-y-5 text-center">
          {hero.eyebrow ? (
            <Typography variant="eyebrow" align="center" className="text-accent-primary">
              {hero.eyebrow}
            </Typography>
          ) : null}
          <Typography as="h1" variant="heading" align="center">
            {hero.heading}
          </Typography>
          {hero.body ? (
            <Typography variant="body" align="center" className="mx-auto max-w-2xl text-text-secondary">
              {hero.body}
            </Typography>
          ) : null}
          {hero.primaryCta ? (
            <Button tone="coral" variant="accent" href={hero.primaryCta.href} className="justify-center">
              {hero.primaryCta.label}
            </Button>
          ) : null}
        </SectionContainer>
      </Section>

      {checklist?.length ? (
        <Section spacing="compact">
          <SectionContainer className="space-y-4">
            <Typography as="h2" variant="title">
              Quick checklist
            </Typography>
            <div className="grid gap-4 md:grid-cols-3">
              {checklist.map((item) => (
                <article
                  key={item.title}
                  className="space-y-2 rounded-2xl border border-border-subtle/60 bg-surface-base/70 p-5"
                >
                  <Typography as="h3" variant="body" className="font-semibold text-text-primary">
                    {item.title}
                  </Typography>
                  <Typography variant="body" className="text-text-secondary">
                    {item.description}
                  </Typography>
                </article>
              ))}
            </div>
          </SectionContainer>
        </Section>
      ) : null}

      <Section spacing="compact">
        <SectionContainer className="space-y-4">
          <Typography as="h2" variant="title">
            Frequently asked
          </Typography>
          <div className="divide-y divide-border-subtle/60 rounded-2xl border border-border-subtle/60 bg-surface-base/70">
            {faqs.map((faq) => (
              <details key={faq.question} className="group p-5">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-left font-semibold">
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
        </SectionContainer>
      </Section>

      <Section spacing="compact">
        <SectionContainer className="space-y-4 rounded-3xl border border-border-subtle/60 bg-surface-base/70 p-8 text-center">
          <Typography as="h2" variant="title">
            {contact.title}
          </Typography>
          <Typography variant="body" className="text-text-secondary">
            {contact.body}
          </Typography>
          <div className="flex flex-wrap justify-center gap-3">
            {contact.ctas.map((cta) => (
              <Button
                key={cta.label}
                href={cta.href}
                tone={cta.variant === 'secondary' ? 'sky' : 'coral'}
                variant={cta.variant === 'secondary' ? 'outline' : 'accent'}
              >
                {cta.label}
              </Button>
            ))}
          </div>
        </SectionContainer>
      </Section>
    </div>
  )
}
