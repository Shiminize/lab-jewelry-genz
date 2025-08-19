/**
 * Standardized Product Description Template
 * Ensures consistency across all product descriptions
 */

export interface ProductDescriptionParams {
  productName: string
  primaryFeature: string // Main selling point
  materialType: 'Lab-grown diamonds' | 'Moissanite' | 'Lab-grown gemstone' | 'Recycled precious metals'
  sustainabilityBenefit?: string // e.g., "ocean cleanup", "carbon neutral", "artisan support"
  creatorAttribution?: string // e.g., "@maya_jewels"
  personalityHook: string // Gen Z engaging opening
}

export function generateStandardizedDescription(params: ProductDescriptionParams): string {
  const {
    productName,
    primaryFeature,
    materialType,
    sustainabilityBenefit,
    creatorAttribution,
    personalityHook
  } = params

  // Template structure: [Personality Hook] [Primary Feature]. [Material Statement] [Sustainability/Creator Hook].
  let description = `${personalityHook}. ${primaryFeature}`
  
  // Add material statement with standardized terminology
  const materialStatement = getMaterialStatement(materialType)
  description += `. ${materialStatement}`
  
  // Add sustainability or creator attribution
  if (creatorAttribution && sustainabilityBenefit) {
    description += `. Created by ${creatorAttribution} for ${sustainabilityBenefit}`
  } else if (creatorAttribution) {
    description += `. Created by ${creatorAttribution} for conscious jewelry lovers`
  } else if (sustainabilityBenefit) {
    description += `. Supporting ${sustainabilityBenefit} with every purchase`
  } else {
    description += '. Master-crafted luxury that aligns with your values'
  }
  
  return description
}

function getMaterialStatement(materialType: string): string {
  switch (materialType) {
    case 'Lab-grown diamonds':
      return '100% Conflict-Free Lab-grown diamonds with identical beauty to mined stones'
    case 'Moissanite':
      return 'Brilliant moissanite with superior fire and 100% conflict-free sourcing'
    case 'Lab-grown gemstone':
      return 'Vibrant lab-grown gemstone with traceable ethical origins'
    case 'Recycled precious metals':
      return '100% recycled precious metals supporting circular luxury'
    default:
      return 'Master-crafted with sustainable materials and ethical practices'
  }
}

// Pre-defined personality hooks for different product categories
export const PERSONALITY_HOOKS = {
  engagement: [
    'The ring that says forever, designed for couples changing the world together',
    'Your love story deserves better than mining damage',
    'Forever starts with conscious choices',
    'Love that leaves the planet better than you found it'
  ],
  everyday: [
    'The piece that goes everywhere and says everything',
    'Daily luxury that matches your values',
    'Everyday elegance with zero compromise',
    'The jewelry that becomes part of your story'
  ],
  statement: [
    'Bold pieces for people making bold choices',
    'When subtle isn\'t in your vocabulary',
    'Conversation starter meets conscience cleaner',
    'For those who sparkle inside and out'
  ],
  minimalist: [
    'Less is more, especially when it\'s ethical',
    'Clean lines, clear conscience',
    'Understated elegance with overstated impact',
    'Minimalist design, maximalist values'
  ]
}

// Sustainability benefits mapping
export const SUSTAINABILITY_BENEFITS = {
  oceanCleanup: 'ocean cleanup initiatives',
  carbonNeutral: 'carbon-neutral luxury',
  artisanSupport: 'artisan community support',
  treeRestoration: 'forest restoration projects',
  ethicalSourcing: 'ethical sourcing programs'
}