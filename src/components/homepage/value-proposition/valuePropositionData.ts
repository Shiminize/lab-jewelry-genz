import type { ValueProp } from '../../../types/value-prop'

export const defaultValueProps: ValueProp[] = [
  {
    icon: '🌱',
    headline: 'Ethically Sourced & Conflict-Free',
    description: 'Every piece tells a story of responsibility. Our lab-grown diamonds and ethically sourced materials mean you can wear your values with pride, knowing your jewelry creates positive impact.',
    trustSignals: [
      { icon: '✨', text: '100% Conflict-Free', variant: 'accent' },
      { icon: '🔬', text: 'Lab-Grown Certified', variant: 'accent' }
    ]
  },
  {
    icon: '🎨',
    headline: 'Your Vision, Your Voice',
    description: 'Self-expression shouldn\'t be limited by what\'s on the shelf. Design jewelry that speaks your language - from subtle statements to bold declarations of who you are.',
    trustSignals: [
      { icon: '⚡', text: 'Unlimited Customization', variant: 'accent' },
      { icon: '💎', text: 'Premium Quality', variant: 'accent' }
    ]
  },
  {
    icon: '♻️',
    headline: 'Planet-Positive Luxury',
    description: 'True luxury means caring about tomorrow. Our sustainable practices and recycled metals prove that conscious choices can be absolutely stunning.',
    trustSignals: [
      { icon: '🌍', text: 'Carbon Neutral', variant: 'accent' },
      { icon: '♻️', text: 'Recycled Metals', variant: 'accent' }
    ]
  }
]

// Analytics tracking helper
export const createTrackingEvent = (action: string, signal: string) => ({
  action,
  signal,
  timestamp: new Date().toISOString(),
  component: 'ValuePropositionSection'
})