/**
 * Sustainability Story Data & Configuration
 * Aurora Design System - Batch 1 Migration
 * Extracted from SustainabilityStorySection.tsx for better maintainability
 */

// Type definitions for Sustainability content
export interface ImpactMetric {
  icon: string
  value: string
  label: string
  description: string
  comparison?: string
}

export interface ProcessStep {
  icon: string
  title: string
  description: string
}

export interface Certification {
  icon: string
  name: string
  description: string
  variant?: 'verified' | 'certified' | 'partner'
}

export interface ComparisonPoint {
  aspect: string
  traditional: string
  labGrown: string
  impact: 'negative' | 'positive' | 'neutral'
}

export interface SustainabilityContent {
  headline: string
  description: string
  ctaText: string
  ctaHref: string
  secondaryCtaText: string
  secondaryCtaHref: string
  keyMessage: string
  keyMessageHighlight: string
}

export interface CommunityStats {
  consumersJoined: string
  earthPreserved: string
  satisfaction: string
}

// Default content configuration
export const DEFAULT_SUSTAINABILITY_CONTENT: SustainabilityContent = {
  headline: 'The Future of Luxury is Sustainable',
  description: "We're redefining what luxury means for your generation. Every piece tells a story of innovation, responsibility, and conscious choices that create positive impact for our planet and communities.",
  ctaText: 'Explore Our Sustainability Commitment',
  ctaHref: '/sustainability',
  secondaryCtaText: 'Choose Your Sustainable Piece',
  secondaryCtaHref: '/catalog',
  keyMessage: 'Lab-grown diamonds: Same atomic structure, same beauty, zero compromise.',
  keyMessageHighlight: '95% less environmental impact.'
}

// Impact metrics data
export const IMPACT_METRICS: ImpactMetric[] = [
  {
    icon: '🌱',
    value: '95%',
    label: 'Less Environmental Impact',
    description: 'Compared to traditional diamond mining',
    comparison: 'vs. mined diamonds'
  },
  {
    icon: '💧',
    value: '0',
    label: 'Water Pollution',
    description: 'Zero contamination from mining operations',
    comparison: 'mining causes 100+ toxic spills yearly'
  },
  {
    icon: '⚡',
    value: '100%',
    label: 'Renewable Energy',
    description: 'All our lab facilities powered by clean energy',
    comparison: 'traditional mining: <10% renewable'
  },
  {
    icon: '♻️',
    value: '80%',
    label: 'Recycled Metals',
    description: 'Precious metals given new life in our settings',
    comparison: '2x industry average'
  },
  {
    icon: '🚚',
    value: '100%',
    label: 'Carbon Neutral Shipping',
    description: 'Offset all emissions from production to your door',
    comparison: 'industry first commitment'
  },
  {
    icon: '🌍',
    value: '0.07',
    label: 'Carats per Ton of Earth',
    description: 'Lab creation vs mining displacement',
    comparison: 'mining: removes 250 tons per carat'
  }
]

// Lab diamond creation process steps
export const PROCESS_STEPS: ProcessStep[] = [
  {
    icon: '🔬',
    title: 'Carbon Seed Placement',
    description: 'A tiny diamond seed is placed in a specialized chamber with precise carbon composition'
  },
  {
    icon: '🔥',
    title: 'High Pressure & Heat',
    description: 'Conditions mirror deep Earth: 2,000°F temperature and 1.5 million PSI pressure'
  },
  {
    icon: '⏱️',
    title: '2-4 Week Growth',
    description: 'Carbon atoms crystallize layer by layer, forming identical atomic structure to mined diamonds'
  },
  {
    icon: '💎',
    title: 'Cut & Polish',
    description: 'Master craftsmen cut and polish each diamond to reveal its maximum brilliance and fire'
  }
]

// Certifications and partnerships
export const CERTIFICATIONS: Certification[] = [
  {
    icon: '🔬',
    name: 'IGI Certified',
    description: 'International Gemological Institute authentication',
    variant: 'certified'
  },
  {
    icon: '✅',
    name: 'SCS Global Verified',
    description: 'Third-party sustainability certification',
    variant: 'verified'
  },
  {
    icon: '🤝',
    name: 'Responsible Jewelry Council',
    description: 'Industry-leading ethical standards member',
    variant: 'partner'
  },
  {
    icon: '🌱',
    name: 'Carbon Trust Certified',
    description: 'Carbon footprint measurement and reduction verified',
    variant: 'verified'
  }
]

// Lab-grown vs traditional comparison data
export const COMPARISON_DATA: ComparisonPoint[] = [
  {
    aspect: 'Environmental Impact',
    traditional: 'Massive land disruption, habitat destruction',
    labGrown: 'Minimal footprint, controlled environment',
    impact: 'positive'
  },
  {
    aspect: 'Water Usage',
    traditional: '126+ gallons per carat',
    labGrown: '<1 gallon per carat',
    impact: 'positive'
  },
  {
    aspect: 'Carbon Emissions',
    traditional: '125+ lbs CO₂ per carat',
    labGrown: '6 lbs CO₂ per carat (offset to zero)',
    impact: 'positive'
  },
  {
    aspect: 'Human Impact',
    traditional: 'Potential conflict sourcing, dangerous working conditions',
    labGrown: 'Safe, ethical working conditions, living wages',
    impact: 'positive'
  },
  {
    aspect: 'Quality & Beauty',
    traditional: 'Identical chemical & optical properties',
    labGrown: 'Identical chemical & optical properties',
    impact: 'neutral'
  },
  {
    aspect: 'Value & Pricing',
    traditional: 'Higher cost due to mining complexity',
    labGrown: '30-40% better value for equivalent quality',
    impact: 'positive'
  }
]

// Community impact statistics
export const COMMUNITY_STATS: CommunityStats = {
  consumersJoined: '50K+',
  earthPreserved: '2.5M',
  satisfaction: '100%'
}

// Section configuration data
export const SUSTAINABILITY_SECTIONS = {
  hero: {
    title: 'Hero Section',
    showByDefault: true,
    decorativeElements: {
      topRight: '🌱',
      bottomLeft: '♻️'
    }
  },
  metrics: {
    title: 'Real Impact, Real Numbers',
    subtitle: 'Transparency matters. Here\'s exactly how choosing lab-grown diamonds creates positive change for our planet and future generations.',
    showByDefault: true
  },
  comparison: {
    title: 'Lab-Grown vs. Traditional Mining',
    subtitle: 'Same diamonds, different story. See why lab-grown is the conscious choice for the future-focused generation.',
    showByDefault: true
  },
  process: {
    title: 'How Lab-Grown Diamonds Are Created',
    subtitle: 'Discover the fascinating science behind lab-grown diamond creation. In just weeks, we recreate millions of years of natural formation.',
    showByDefault: true
  },
  certifications: {
    title: 'Certified & Verified',
    subtitle: 'Third-party verification you can trust. Our sustainability claims are backed by industry-leading certifications and partnerships.',
    showByDefault: true
  },
  community: {
    title: 'Join the Conscious Luxury Movement',
    subtitle: 'Every purchase supports a future where luxury and responsibility go hand in hand. You\'re not just buying jewelry—you\'re investing in a world where beautiful choices create beautiful change.',
    showByDefault: true
  }
} as const

// Screen reader accessibility content
export const ACCESSIBILITY_SUMMARY = {
  title: 'Sustainability Story Summary',
  content: `GlowGlitch creates lab-grown diamonds that are chemically, physically, and optically 
    identical to mined diamonds but with 95% less environmental impact. Our process uses 
    renewable energy, creates zero water pollution, and supports ethical working conditions. 
    Each diamond is certified by international gemological institutes and our sustainability 
    practices are verified by third-party organizations. We are committed to carbon-neutral 
    shipping and use 80% recycled metals in our jewelry settings.`
}

// Export types for external usage
export type ImpactMetricType = typeof IMPACT_METRICS[0]
export type ProcessStepType = typeof PROCESS_STEPS[0]
export type CertificationType = typeof CERTIFICATIONS[0]
export type ComparisonPointType = typeof COMPARISON_DATA[0]
export type SustainabilityContentType = typeof DEFAULT_SUSTAINABILITY_CONTENT
export type CommunityStatsType = typeof COMMUNITY_STATS