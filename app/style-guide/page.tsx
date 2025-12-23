import React from 'react'

import { Button, Card, Chip } from '@/components/ui'
import { Section, SectionContainer } from '@/components/layout/Section'

export default function StyleGuidePage() {
  return (
    <SectionContainer className="py-12">
      <Section className="space-y-4">
        <h1 className="font-heading text-4xl leading-[1.08]">Style Guide — Primitives</h1>
        <p className="text-text-secondary">Tokens-driven primitives with geometric borders, OKLab hovers, AA contrast.</p>
      </Section>

      <Section className="space-y-6">
        <h2 className="font-heading text-2xl">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section className="space-y-6">
        <h2 className="font-heading text-2xl">Chips</h2>
        <div className="flex flex-wrap gap-2">
          <Chip>Default</Chip>
          <Chip selected>Selected</Chip>
          <Chip>Availability</Chip>
          <Chip>Moissanite</Chip>
        </div>
      </Section>

      <Section className="space-y-6">
        <h2 className="font-heading text-2xl">Cards &amp; Grid</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} variant="day" className="p-4">
              <p className="mb-2 font-accent text-[0.68rem] uppercase tracking-[0.25em] text-text-muted">
                Brand
              </p>
              <h3 className="mb-2 font-heading text-lg">Product Title</h3>
              <div className="text-text-secondary">Regular price ¥{(i + 1) * 12000}</div>
            </Card>
          ))}
        </div>
      </Section>
    </SectionContainer>
  )
}
