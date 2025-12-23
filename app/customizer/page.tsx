import { Section, SectionContainer } from '@/components/layout/Section'
import { Button, Typography } from '@/components/ui'
import { CustomizerExperience } from '@/features/customizer/components/CustomizerExperience'

export default function CustomizerPage() {
  return (
    <div className="space-y-16 pb-16">
      <HeroSection />
      <ExperienceSection />
    </div>
  )
}

function HeroSection() {
  return (
    <section className="pt-12">
      <SectionContainer className="max-w-4xl space-y-5 text-center">
        <Typography variant="eyebrow" align="center">
          Aurora Custom Studio
        </Typography>
        <Typography variant="heading" align="center">
          Preview your piece in Coral & Sky lighting
        </Typography>
        <Typography variant="body" align="center" className="mx-auto max-w-2xl text-text-secondary">
          Pick a style, choose your fit, and swap finishes in real time.
        </Typography>
        <div className="flex flex-wrap justify-center gap-3">
          <Button tone="coral" variant="accent" href="#viewer">
            Start with Astronaut Demo
          </Button>
          <Button variant="outline" tone="sky" href="/custom">
            Back to Custom Hub
          </Button>
        </div>
      </SectionContainer>
    </section>
  )
}

function ExperienceSection() {
  return (
    <section id="viewer" className="py-8">
      <SectionContainer className="space-y-8">
        <div className="space-y-2 text-center">
          <Typography variant="title">Live customizer</Typography>
          <Typography variant="body" className="text-text-secondary">
            Select a variant, pick your fit, and try material finishes.
          </Typography>
        </div>
        <CustomizerExperience
          initialVariantId="astro-demo"
          pipelineSteps={[]}
          roadmapItems={[]}
        />
      </SectionContainer>
    </section >
  )
}
