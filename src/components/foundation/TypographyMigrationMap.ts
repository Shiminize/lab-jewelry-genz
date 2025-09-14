/**
 * Typography Migration Map - Legacy to Aurora Mapping
 * CLAUDE_RULES compliant: Helper utilities for typography migration
 * 
 * Purpose: Mapping between legacy Typography components and Aurora classes
 * Usage: Reference guide for migrating from legacy to Aurora typography
 */

// Migration mapping from legacy to Aurora classes
export const TYPOGRAPHY_MIGRATION_MAP = {
  // Legacy components -> Aurora classes
  'H1': 'aurora-title-xl',
  'H2': 'aurora-title-l', 
  'H3': 'aurora-title-m',
  'H4': 'aurora-body-xl',
  'H5': 'aurora-body-l',
  'H6': 'aurora-body-m',
  
  // Body text variants
  'BodyText (size="lg")': 'aurora-body-l',
  'BodyText (size="md")': 'aurora-body-m', 
  'BodyText (size="sm")': 'aurora-small',
  
  // Display text
  'DisplayText': 'aurora-hero',
  
  // Specialized typography
  'PriceDisplay (size="display")': 'aurora-price-hero',
  'PriceDisplay (size="small")': 'aurora-price',
  
  // Jewelry specifications
  'JewelrySpec (type="carat")': 'aurora-micro',
  'JewelrySpec (type="metal")': 'aurora-micro',
  'JewelrySpec (type="caption")': 'aurora-small',
} as const

// Aurora class descriptions for reference
export const AURORA_CLASS_REFERENCE = {
  'aurora-hero': {
    description: 'Maximum impact headlines',
    size: 'clamp(3rem, 8vw, 6rem)',
    usage: 'Hero sections, main page headings',
    weight: '800',
    opticalSize: '60'
  },
  'aurora-statement': {
    description: 'Emotional section headers', 
    size: 'clamp(2.5rem, 6vw, 4rem)',
    usage: 'Section headings, feature callouts',
    weight: '700',
    opticalSize: '48'
  },
  'aurora-title-xl': {
    description: 'Major section headers',
    size: 'clamp(2rem, 4vw, 3rem)', 
    usage: 'Page sections, article titles',
    weight: '700',
    opticalSize: '36'
  },
  'aurora-title-l': {
    description: 'Subsection headers',
    size: 'clamp(1.5rem, 3vw, 2.25rem)',
    usage: 'Content sections, card headers',
    weight: '600', 
    opticalSize: '24'
  },
  'aurora-title-m': {
    description: 'Component headers',
    size: 'clamp(1.25rem, 2.5vw, 1.75rem)',
    usage: 'Component titles, form labels',
    weight: '600',
    opticalSize: '20'
  },
  'aurora-body-xl': {
    description: 'Large body text',
    size: 'clamp(1.125rem, 2vw, 1.5rem)',
    usage: 'Introductory paragraphs, callouts',
    weight: '400',
    opticalSize: '16'
  },
  'aurora-body-l': {
    description: 'Standard large body text',
    size: '1.125rem',
    usage: 'Article content, descriptions',
    weight: '400',
    opticalSize: '14'
  },
  'aurora-body-m': {
    description: 'Standard body text',
    size: '1rem',
    usage: 'Default text, paragraphs',
    weight: '400', 
    opticalSize: '12'
  },
  'aurora-small': {
    description: 'Small supporting text',
    size: '0.875rem',
    usage: 'Captions, helper text',
    weight: '400',
    opticalSize: '10'
  },
  'aurora-micro': {
    description: 'Micro text with emphasis',
    size: '0.75rem', 
    usage: 'Labels, metadata, specs',
    weight: '500',
    opticalSize: '8',
    features: 'Uppercase, wider letter-spacing'
  },
  'aurora-price': {
    description: 'Standard price display',
    size: '1.125rem',
    usage: 'Product prices, costs',
    weight: '600',
    color: 'Primary brand color'
  },
  'aurora-price-hero': {
    description: 'Large price display',
    size: 'clamp(1.25rem, 2.5vw, 1.75rem)',
    usage: 'Feature prices, hero pricing',
    weight: '700', 
    color: 'Primary brand color'
  }
} as const

// Helper function to get Aurora class for legacy component
export function getAuroraClass(legacyComponent: keyof typeof TYPOGRAPHY_MIGRATION_MAP): string {
  return TYPOGRAPHY_MIGRATION_MAP[legacyComponent]
}

// Helper function to get description for Aurora class  
export function getAuroraDescription(auroraClass: keyof typeof AURORA_CLASS_REFERENCE) {
  return AURORA_CLASS_REFERENCE[auroraClass]
}

// Quick migration examples
export const MIGRATION_EXAMPLES = [
  {
    legacy: '<H1>Product Title</H1>',
    aurora: '<h1 className="aurora-title-xl">Product Title</h1>',
    note: 'H1 maps to aurora-title-xl (responsive 2rem-3rem)'
  },
  {
    legacy: '<H2>Section Header</H2>', 
    aurora: '<h2 className="aurora-title-l">Section Header</h2>',
    note: 'H2 maps to aurora-title-l (responsive 1.5rem-2.25rem)'
  },
  {
    legacy: '<BodyText size="lg">Description</BodyText>',
    aurora: '<p className="aurora-body-l">Description</p>',
    note: 'Large body text maps to aurora-body-l (1.125rem)'
  },
  {
    legacy: '<PriceDisplay size="display" currency="$">1299</PriceDisplay>',
    aurora: '<span className="aurora-price-hero">$1299</span>',
    note: 'Display price maps to aurora-price-hero with responsive sizing'
  },
  {
    legacy: '<DisplayText>Hero Headline</DisplayText>',
    aurora: '<h1 className="aurora-hero">Hero Headline</h1>',
    note: 'Display text maps to aurora-hero (responsive 3rem-6rem)'
  }
] as const