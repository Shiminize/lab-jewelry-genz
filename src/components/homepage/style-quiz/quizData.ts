// Style Quiz Data - Extracted for CLAUDE_RULES compliance
// Icons stored as string references to avoid JSX in data files

export interface QuizAnswer {
  id: string
  text: string
  value: string
  iconName?: 'gem' | 'crown' | 'heart' | 'star'
  image?: string
  description?: string
}

export interface QuizQuestion {
  id: string
  question: string
  subtitle?: string
  answers: QuizAnswer[]
  type: 'single' | 'multiple'
  category: 'style' | 'occasion' | 'metal' | 'stone' | 'personality' | 'budget'
}

export interface QuizProgress {
  currentStep: number
  totalSteps: number
  answers: Record<string, string | string[]>
  startTime: number
}

export interface PersonalityType {
  id: string
  name: string
  description: string
  traits: string[]
  iconName: 'gem' | 'crown' | 'heart' | 'star'
  color: string
  styleGuide: {
    metals: string[]
    stones: string[]
    styles: string[]
    occasions: string[]
  }
}

export interface QuizResult {
  personalityType: PersonalityType
  confidence: number
  recommendations: QuizRecommendation[]
  completionTime: number
}

export interface QuizRecommendation {
  productId: string
  reason: string
  matchScore: number
}

// Mock product data for recommendations
export const MOCK_PRODUCTS = [
  {
    _id: 'prod-1',
    name: 'Classic Solitaire Engagement Ring',
    category: 'rings' as const,
    basePrice: 2500,
    originalPrice: 3000,
    images: {
      primary: '/api/placeholder/300/300',
      gallery: [],
      thumbnail: '/api/placeholder/150/150'
    }
  },
  {
    _id: 'prod-2', 
    name: 'Vintage Art Deco Necklace',
    category: 'necklaces' as const,
    basePrice: 1800,
    images: {
      primary: '/api/placeholder/300/300',
      gallery: [],
      thumbnail: '/api/placeholder/150/150'
    }
  },
  {
    _id: 'prod-3',
    name: 'Minimalist Gold Hoops',
    category: 'earrings' as const, 
    basePrice: 650,
    images: {
      primary: '/api/placeholder/300/300',
      gallery: [],
      thumbnail: '/api/placeholder/150/150'
    }
  }
]

export const PERSONALITY_TYPES: PersonalityType[] = [
  {
    id: 'minimalist-maven',
    name: 'Minimalist Maven',
    description: 'You appreciate clean lines, subtle elegance, and timeless design. Less is always more in your world.',
    traits: ['Clean aesthetic', 'Quality over quantity', 'Versatile pieces', 'Understated elegance'],
    iconName: 'gem' as const,
    color: 'text-accent',
    styleGuide: {
      metals: ['White Gold', 'Platinum', 'Silver'],
      stones: ['Classic Solitaire', 'Simple Settings'],
      styles: ['Clean Lines', 'Geometric Shapes'],
      occasions: ['Everyday', 'Work']
    }
  },
  {
    id: 'statement-maker',
    name: 'Statement Maker', 
    description: 'Bold, confident, and unapologetic. You love pieces that turn heads and start conversations.',
    traits: ['Bold designs', 'Eye-catching pieces', 'Confident expression', 'Trend-forward'],
    iconName: 'crown' as const,
    color: 'text-cta',
    styleGuide: {
      metals: ['Yellow Gold', 'Rose Gold'],
      stones: ['Colorful Gems', 'Large Centers'],
      styles: ['Bold Settings', 'Unique Designs'],
      occasions: ['Special Events', 'Date Night']
    }
  },
  {
    id: 'classic-romantic',
    name: 'Classic Romantic',
    description: 'You adore traditional beauty, vintage charm, and pieces with romantic storytelling.',
    traits: ['Vintage inspiration', 'Romantic details', 'Traditional beauty', 'Sentimental value'],
    iconName: 'heart' as const,
    color: 'text-foreground',
    styleGuide: {
      metals: ['Rose Gold', 'Yellow Gold'],
      stones: ['Vintage Settings', 'Halo Designs'],
      styles: ['Ornate Details', 'Classic Cuts'],
      occasions: ['Special Events', 'Romantic Moments']
    }
  },
  {
    id: 'bohemian-spirit',
    name: 'Bohemian Spirit',
    description: 'Free-spirited and creative, you mix and match unique pieces that reflect your artistic soul.',
    traits: ['Artistic expression', 'Mixed metals', 'Unique combinations', 'Cultural influences'],
    iconName: 'star' as const,
    color: 'text-foreground',
    styleGuide: {
      metals: ['Mixed Metals', 'Textured Finishes'],
      stones: ['Colorful Gems', 'Unique Cuts'],
      styles: ['Layered Looks', 'Organic Shapes'],
      occasions: ['Creative Events', 'Self-Expression']
    }
  }
]

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'style-preference',
    question: 'Which aesthetic speaks to you?',
    subtitle: 'Choose the style that resonates with your personal taste',
    type: 'single',
    category: 'style',
    answers: [
      {
        id: 'minimalist',
        text: 'Minimalist',
        value: 'minimalist',
        description: 'Clean lines, simple elegance',
        iconName: 'gem' as const
      },
      {
        id: 'statement',
        text: 'Statement',
        value: 'statement', 
        description: 'Bold, eye-catching pieces',
        iconName: 'crown' as const
      },
      {
        id: 'classic',
        text: 'Classic',
        value: 'classic',
        description: 'Timeless, traditional beauty',
        iconName: 'heart' as const
      },
      {
        id: 'bohemian',
        text: 'Bohemian',
        value: 'bohemian',
        description: 'Artistic, free-spirited design',
        iconName: 'star' as const
      }
    ]
  },
  {
    id: 'occasion-focus',
    question: 'When do you wear jewelry most?',
    subtitle: 'Think about your lifestyle and daily routine',
    type: 'single',
    category: 'occasion',
    answers: [
      {
        id: 'everyday',
        text: 'Everyday',
        value: 'everyday',
        description: 'Daily wear, versatile pieces'
      },
      {
        id: 'special-events',
        text: 'Special Events',
        value: 'special-events',
        description: 'Celebrations, parties, occasions'
      },
      {
        id: 'work',
        text: 'Work',
        value: 'work',
        description: 'Professional, polished look'
      },
      {
        id: 'date-night',
        text: 'Date Night',
        value: 'date-night',
        description: 'Romantic, elegant moments'
      }
    ]
  },
  {
    id: 'metal-preference',
    question: 'Which metal makes you feel confident?',
    subtitle: 'Your metal choice says a lot about your personal style',
    type: 'single',
    category: 'metal',
    answers: [
      {
        id: 'silver',
        text: 'Silver/White Gold',
        value: 'silver',
        description: 'Cool, modern, versatile'
      },
      {
        id: 'gold',
        text: 'Yellow Gold',
        value: 'gold',
        description: 'Warm, classic, luxurious'
      },
      {
        id: 'rose-gold',
        text: 'Rose Gold',
        value: 'rose-gold',
        description: 'Romantic, trendy, feminine'
      },
      {
        id: 'mixed',
        text: 'Mixed Metals',
        value: 'mixed',
        description: 'Creative, eclectic, artistic'
      }
    ]
  },
  {
    id: 'stone-style',
    question: 'What catches your eye?',
    subtitle: 'The gemstone setting that speaks to your soul',
    type: 'single',
    category: 'stone',
    answers: [
      {
        id: 'solitaire',
        text: 'Classic Solitaire',
        value: 'solitaire',
        description: 'Simple, elegant, timeless'
      },
      {
        id: 'colorful',
        text: 'Colorful Gems',
        value: 'colorful',
        description: 'Vibrant, unique, expressive'
      },
      {
        id: 'vintage',
        text: 'Vintage Settings',
        value: 'vintage',
        description: 'Ornate, detailed, romantic'
      },
      {
        id: 'geometric',
        text: 'Modern Geometric',
        value: 'geometric',
        description: 'Contemporary, angular, bold'
      }
    ]
  },
  {
    id: 'personality',
    question: 'How do you express yourself?',
    subtitle: 'Your jewelry should reflect your inner personality',
    type: 'single',
    category: 'personality',
    answers: [
      {
        id: 'subtle',
        text: 'Subtle Elegance',
        value: 'subtle',
        description: 'Refined, understated, graceful'
      },
      {
        id: 'bold',
        text: 'Bold Statement',
        value: 'bold',
        description: 'Confident, dramatic, fearless'
      },
      {
        id: 'timeless',
        text: 'Timeless Classic',
        value: 'timeless',
        description: 'Traditional, sophisticated, enduring'
      },
      {
        id: 'creative',
        text: 'Creative Artist',
        value: 'creative',
        description: 'Unique, expressive, unconventional'
      }
    ]
  },
  {
    id: 'budget-range',
    question: 'What\'s your comfort zone?',
    subtitle: 'Investment level for your perfect piece',
    type: 'single',
    category: 'budget',
    answers: [
      {
        id: 'budget-1',
        text: '$500 - $1,000',
        value: '500-1000',
        description: 'Quality everyday pieces'
      },
      {
        id: 'budget-2',
        text: '$1,000 - $2,500',
        value: '1000-2500',
        description: 'Special occasion jewelry'
      },
      {
        id: 'budget-3',
        text: '$2,500 - $5,000',
        value: '2500-5000',
        description: 'Investment pieces'
      },
      {
        id: 'budget-4',
        text: '$5,000+',
        value: '5000+',
        description: 'Luxury collections'
      }
    ]
  }
]