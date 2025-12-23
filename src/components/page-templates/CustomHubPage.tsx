import { Section, SectionContainer } from '@/components/layout/Section'
import { Button, Typography } from '@/components/ui'
import type { MarketingPageContent } from './MarketingPage'
import { MarketingPage } from './MarketingPage'

type Cta = {
  label: string
  href: string
}

type PresetBase = {
  title: string
  description: string
  href?: string
}

type WorkflowStep = {
  title: string
  body: string
}

type ViewerStep = {
  title: string
  detail: string
}

type ViewerRoadmapItem = {
  title: string
  description: string
  reference: string
}

export type CustomHubContent = MarketingPageContent & {
  launchCta: {
    heading: string
    body: string
    primary: Cta
    secondary?: Cta
  }
  presetBases: PresetBase[]
  workflow: {
    title: string
    steps: WorkflowStep[]
  }
  arOverview: {
    title: string
    body: string
    bullets: string[]
  }
  concierge: {
    title: string
    body: string
    ctas: Cta[]
  }
  viewer?: {
    initialVariantId?: string
    pipelineSteps: ViewerStep[]
    roadmapItems: ViewerRoadmapItem[]
  }
}

interface CustomHubPageProps {
  content: CustomHubContent
}

export function CustomHubPage({ content }: CustomHubPageProps) {
  const { launchCta, presetBases, workflow, arOverview, concierge, viewer, ...marketing } = content

  return (
    <MarketingPage content={marketing}>
      <Section spacing="compact">
        <SectionContainer className="space-y-4 rounded-none border border-border-subtle/60 bg-surface-base/80 p-6 shadow-soft text-center">
          <Typography variant="eyebrow" className="text-accent-primary">
            {launchCta.heading}
          </Typography>
          <Typography variant="body" className="mx-auto max-w-2xl text-text-secondary">
            {launchCta.body}
          </Typography>
          <div className="flex flex-wrap justify-center gap-3">
            <Button tone="coral" variant="accent" href={launchCta.primary.href}>
              {launchCta.primary.label}
            </Button>
            {launchCta.secondary ? (
              <Button variant="outline" tone="sky" href={launchCta.secondary.href}>
                {launchCta.secondary.label}
              </Button>
            ) : null}
          </div>
        </SectionContainer>
      </Section>

      <Section spacing="compact" id="preset-bases">
        <SectionContainer className="space-y-6">
          <Typography as="h2" variant="title">
            Preset bases
          </Typography>
          <div className="grid gap-4 md:grid-cols-3">
            {presetBases.map((preset) => (
              <article key={preset.title} className="space-y-3 rounded-none border border-border-subtle/60 bg-surface-base/70 p-5">
                <Typography variant="title">{preset.title}</Typography>
                <Typography variant="body" className="text-text-secondary">
                  {preset.description}
                </Typography>
                {preset.href ? (
                  <Button href={preset.href} variant="glass" tone="ink" className="justify-start px-0">
                    Preview base →
                  </Button>
                ) : null}
              </article>
            ))}
          </div>
        </SectionContainer>
      </Section>

      <Section spacing="compact" id="workflow">
        <SectionContainer className="space-y-6">
          <Typography as="h2" variant="title">
            {workflow.title}
          </Typography>
          <ol className="space-y-4 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
            {workflow.steps.map((step, index) => (
              <li
                key={step.title}
                className="space-y-2 rounded-none border border-border-subtle/60 bg-surface-base/70 p-4 shadow-soft"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-none bg-accent-primary/12 text-sm font-semibold text-accent-primary">
                  {index + 1}
                </span>
                <Typography variant="body" className="font-semibold text-text-primary">
                  {step.title}
                </Typography>
                <Typography variant="body" className="text-text-secondary">
                  {step.body}
                </Typography>
              </li>
            ))}
          </ol>
        </SectionContainer>
      </Section>

      <Section spacing="compact" id="ar">
        <SectionContainer className="space-y-6 rounded-none border border-border-subtle/60 bg-surface-base/70 p-8">
          <div className="space-y-3">
            <Typography variant="title">{arOverview.title}</Typography>
            <Typography variant="body" className="text-text-secondary">
              {arOverview.body}
            </Typography>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {arOverview.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-none bg-accent-primary" />
                <Typography variant="body" className="text-text-secondary">
                  {bullet}
                </Typography>
              </li>
            ))}
          </ul>
        </SectionContainer>
      </Section>

      <Section spacing="compact">
        <SectionContainer className="space-y-4 rounded-none border border-border-subtle/60 bg-surface-base/70 p-8 text-center">
          <Typography variant="title">{concierge.title}</Typography>
          <Typography variant="body" className="text-text-secondary">
            {concierge.body}
          </Typography>
          <div className="flex flex-wrap justify-center gap-3">
            {concierge.ctas.map((cta) => (
              <Button key={cta.label} href={cta.href} variant="accent" tone="sky">
                {cta.label}
              </Button>
            ))}
          </div>
        </SectionContainer>
      </Section>
    </MarketingPage>
  )
}
