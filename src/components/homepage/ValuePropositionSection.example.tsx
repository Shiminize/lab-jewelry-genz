'use client'

import React from 'react'
import { ValuePropositionSection } from './ValuePropositionSection'

// Example usage of the ValuePropositionSection component
export function ValuePropositionSectionExample() {
  return (
    <div className="min-h-screen bg-background">
      {/* Default Usage */}
      <ValuePropositionSection />

      {/* Custom Layout with Different Styling */}
      <ValuePropositionSection
        spacing="spacious"
        layout="wide"
        style="card"
        emphasis="strong"
        columns="two"
        alignment="start"
        className="bg-muted/20"
        headline="Why Gen Z Chooses GlowGlitch"
        description="We're not just another jewelry brand. We're a movement toward conscious luxury that doesn't compromise on style, ethics, or your individual expression."
      />

      {/* Minimal Version */}
      <ValuePropositionSection
        spacing="compact"
        style="minimal"
        emphasis="none"
        showTrustSignals={false}
        headline="Simple. Ethical. Stunning."
        description="Three pillars that define everything we create."
      />

      {/* Custom Value Props Example */}
      <ValuePropositionSection
        headline="Design Your Impact"
        description="Every choice you make with GlowGlitch creates ripples of positive change."
        valueProps={[
          {
            icon: '💡',
            headline: 'Innovation Meets Tradition',
            description: 'Cutting-edge lab-grown technology preserves the timeless beauty of natural gems while protecting our planet.',
            trustSignals: [
              { icon: '🔬', text: 'Science-Backed', variant: 'accent' },
              { icon: '💎', text: 'Identical Quality', variant: 'success' }
            ]
          },
          {
            icon: '🤝',
            headline: 'Community-Driven Design',
            description: 'Your feedback shapes our collections. We listen, iterate, and create pieces that truly resonate with your generation.',
            trustSignals: [
              { icon: '👥', text: '10K+ Community', variant: 'accent' },
              { icon: '⭐', text: '4.9/5 Rating', variant: 'success' }
            ]
          }
        ]}
        columns="two"
        style="bordered"
      />
    </div>
  )
}

export default ValuePropositionSectionExample