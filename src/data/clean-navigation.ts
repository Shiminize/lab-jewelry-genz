// Enhanced Gen Z Navigation Data Structure
// Emotionally compelling content that resonates with Gen Z and young millennials
// Balancing luxury positioning with authentic, inclusive messaging

export interface NavigationItem {
  id: string
  label: string
  href: string
  description?: string
  badge?: string
  children?: NavigationItem[]
}

export interface MegaMenuSection {
  title: string
  items: NavigationItem[]
}

export interface NavigationCategory {
  id: string
  label: string
  href: string
  description: string
  sections: MegaMenuSection[]
}

export const mainNavigation: NavigationCategory[] = [
  {
    id: 'lab-diamonds',
    label: 'Lab Diamonds',
    href: '/lab-diamonds',
    description: 'Real luxury, real values - diamonds that align with your ethics',
    sections: [
      {
        title: 'The Glow-Up Collection',
        items: [
          { id: 'premium', label: 'The Icon', href: '/lab-diamonds/premium', description: 'VVS clarity that hits different - pure main character energy', badge: 'Most Loved' },
          { id: 'excellent', label: 'The Classic', href: '/lab-diamonds/excellent', description: 'Timeless luxury for those who know quality', badge: 'Trending' },
          { id: 'good', label: 'The Essential', href: '/lab-diamonds/good', description: 'Accessible luxury without compromising on sparkle' },
        ]
      },
      {
        title: 'Your Perfect Size', 
        items: [
          { id: 'under-half', label: 'Delicate Vibes', href: '/lab-diamonds/under-0.5', description: 'Subtle elegance for everyday luxury' },
          { id: 'half-to-one', label: 'The Sweet Spot', href: '/lab-diamonds/0.5-1.0', description: 'Perfect balance of presence and wearability', badge: 'Popular Choice' },
          { id: 'one-to-two', label: 'Statement Makers', href: '/lab-diamonds/1.0-2.0', description: 'For when you want all eyes on you' },
          { id: 'over-two', label: 'Absolutely Iconic', href: '/lab-diamonds/2.0-plus', description: 'Because you deserve nothing less than extraordinary', badge: 'Elite' },
        ]
      }
    ]
  },
  {
    id: 'moissanite',
    label: 'Moissanite',
    href: '/moissanite',
    description: 'Guilt-free glamour with more fire than diamonds - your secret weapon',
    sections: [
      {
        title: 'Find Your Vibe',
        items: [
          { id: 'round', label: 'Classic Round', href: '/moissanite/round', description: 'Timeless choice that never misses', badge: 'Viral' },
          { id: 'oval', label: 'Elongated Oval', href: '/moissanite/oval', description: 'Makes your fingers look endless' },
          { id: 'princess', label: 'Edgy Princess', href: '/moissanite/princess', description: 'For those who like their luxury with an edge' },
          { id: 'emerald', label: 'Vintage Emerald', href: '/moissanite/emerald', description: 'Old Hollywood glamour meets modern ethics' },
        ]
      },
      {
        title: 'Size Your Impact',
        items: [
          { id: 'small', label: 'Everyday Elegance', href: '/moissanite/1-3ct', description: '1-3 carats of daily luxury' },
          { id: 'medium', label: 'Statement Ready', href: '/moissanite/3-5ct', description: '3-5 carats that demand attention', badge: 'Trending' },
          { id: 'large', label: 'Absolutely Unhinged', href: '/moissanite/5ct-plus', description: '5+ carats because subtlety is overrated', badge: 'Iconic' },
        ]
      }
    ]
  },
  {
    id: 'jewelry-types',
    label: 'Your Style Story',
    href: '/jewelry',
    description: 'Pieces that speak your language and tell your story',
    sections: [
      {
        title: 'Ring Goals',
        items: [
          { id: 'engagement', label: 'Forever Starts Here', href: '/jewelry/engagement', description: 'Engagement rings as unique as your love story', badge: 'Most Loved' },
          { id: 'wedding', label: 'Sealed With Style', href: '/jewelry/wedding', description: 'Wedding bands that complete your perfect pair' },
          { id: 'fashion', label: 'Daily Luxe', href: '/jewelry/fashion', description: 'Rings that elevate every outfit' },
        ]
      },
      {
        title: 'Complete The Look',
        items: [
          { id: 'necklaces', label: 'Neck Candy', href: '/jewelry/necklaces', description: 'From delicate layers to bold statements' },
          { id: 'earrings', label: 'Face Framers', href: '/jewelry/earrings', description: 'Earrings that highlight your best features' },
          { id: 'bracelets', label: 'Wrist Game', href: '/jewelry/bracelets', description: 'Stack them, mix them, make them yours' },
        ]
      }
    ]
  },
  {
    id: 'customizer',
    label: 'Make It Yours',
    href: '/customizer',
    description: 'Design something nobody else has - your vision, our craft',
    sections: [
      {
        title: 'Start Your Story',
        items: [
          { id: 'solitaire', label: 'Classic Solitaire', href: '/customizer?style=solitaire', description: 'Timeless elegance, your way', badge: 'Trending' },
          { id: 'three-stone', label: 'Past Present Future', href: '/customizer?style=three-stone', description: 'Three stones, infinite meaning' },
          { id: 'halo', label: 'Halo Dreams', href: '/customizer?style=halo', description: 'Maximum sparkle, maximum impact' },
        ]
      },
      {
        title: 'Choose Your Metal Mood',
        items: [
          { id: 'gold', label: 'Golden Hour', href: '/customizer?metal=gold', description: 'Warm, luxurious, eternally chic' },
          { id: 'platinum', label: 'Platinum Prestige', href: '/customizer?metal=platinum', description: 'The ultimate in luxury and durability' },
          { id: 'silver', label: 'Silver Sophistication', href: '/customizer?metal=silver', description: 'Modern elegance that works with everything' },
        ]
      }
    ]
  }
]

// Mobile navigation - Gen Z optimized for thumb-friendly navigation
export const mobileNavigation: NavigationItem[] = [
  {
    id: 'lab-diamonds',
    label: 'Lab Diamonds',
    href: '/lab-diamonds',
    children: [
      { id: 'premium', label: 'The Icon ✨', href: '/lab-diamonds/premium', description: 'VVS clarity that hits different' },
      { id: 'excellent', label: 'The Classic 💎', href: '/lab-diamonds/excellent', description: 'Timeless luxury for those who know' },
      { id: 'good', label: 'The Essential 🤍', href: '/lab-diamonds/good', description: 'Accessible luxury, no compromise' },
      { id: 'all-diamonds', label: 'All Lab Diamonds', href: '/lab-diamonds' },
    ]
  },
  {
    id: 'moissanite',
    label: 'Moissanite',
    href: '/moissanite', 
    children: [
      { id: 'round', label: 'Classic Round 🔥', href: '/moissanite/round', description: 'Never misses' },
      { id: 'oval', label: 'Elongated Oval ✨', href: '/moissanite/oval', description: 'Makes fingers look endless' },
      { id: 'princess', label: 'Edgy Princess 💫', href: '/moissanite/princess', description: 'Luxury with an edge' },
      { id: 'all-moissanite', label: 'All Moissanite', href: '/moissanite' },
    ]
  },
  {
    id: 'jewelry',
    label: 'Your Style',
    href: '/jewelry',
    children: [
      { id: 'engagement', label: 'Forever Starts Here 💍', href: '/jewelry/engagement', description: 'Engagement rings as unique as your love' },
      { id: 'wedding', label: 'Sealed With Style 💕', href: '/jewelry/wedding', description: 'Complete your perfect pair' },
      { id: 'necklaces', label: 'Neck Candy ✨', href: '/jewelry/necklaces', description: 'Delicate to bold statements' },
      { id: 'earrings', label: 'Face Framers 🌟', href: '/jewelry/earrings', description: 'Highlight your best features' },
    ]
  },
  {
    id: 'customizer',
    label: 'Make It Yours',
    href: '/customizer',
    description: 'Design something nobody else has'
  },
  {
    id: 'about',
    label: 'Our Story',
    href: '/about',
    description: 'Real luxury, real values'
  },
  {
    id: 'contact',
    label: 'Get In Touch',
    href: '/contact',
    description: 'We are here for you'
  }
]

// Gen Z Engagement Features
export interface TopBannerMessage {
  id: string
  text: string
  href: string
  audience: string
  urgency?: boolean
}

export interface SocialProofElement {
  type: 'trending' | 'purchase' | 'creator' | 'review'
  message: string
  timestamp?: string
  badge?: string
}

// Rotating top banner messages with FOMO and social proof
export const topBannerMessages: TopBannerMessage[] = [
  {
    id: 'sustainability',
    text: '🌱 Every purchase plants 5 trees - join 50k+ eco-conscious jewelry lovers',
    href: '/impact/trees',
    audience: 'sustainability-focused'
  },
  {
    id: 'customization',
    text: '✨ Design something nobody else has - 3D preview in real-time',
    href: '/customizer',
    audience: 'customization-focused'
  },
  {
    id: 'social-proof',
    text: '🔥 2.3M views on TikTok this month - see what everyone is obsessing over',
    href: '/trending',
    audience: 'social-native',
    urgency: true
  },
  {
    id: 'creator-community',
    text: '💎 Join 500+ creators earning 30% commission - applications open',
    href: '/creators/apply',
    audience: 'creator-interested'
  },
  {
    id: 'reviews',
    text: '⭐ 4.9/5 stars from 12,847 reviews - see why Gen Z loves us',
    href: '/reviews',
    audience: 'social-proof-focused'
  }
]

// Dynamic social proof messages
export const socialProofMessages: SocialProofElement[] = [
  {
    type: 'trending',
    message: '47 people viewing lab diamonds right now',
    badge: 'Live'
  },
  {
    type: 'purchase',
    message: 'Emma from NYC just bought The Icon engagement ring',
    timestamp: '2 minutes ago'
  },
  {
    type: 'creator',
    message: '@sustainable_sparkle just shared their custom design',
    timestamp: '5 minutes ago',
    badge: 'Creator Spotlight'
  },
  {
    type: 'review',
    message: '"Absolutely obsessed with my moissanite ring!" - Sarah K.',
    badge: '5 stars'
  }
]

// Enhanced search placeholders for engagement
export const searchPlaceholders: string[] = [
  "Search 'rose gold engagement'...",
  "Try 'lab diamond earrings'...",
  "Find 'sustainable jewelry'...",
  "Look for 'custom necklace'...",
  "Discover 'trending rings'...",
  "Search 'your vibe'...",
  "Find 'statement pieces'...",
  "Try 'eco-friendly luxury'..."
]

// Call-to-action variants for different contexts
export const ctaVariants = {
  shop: [
    'Shop Your Vibe',
    'Find Your Perfect Match',
    'Start Your Story',
    'Make It Yours',
    'Get That Look'
  ],
  customize: [
    'Design It Your Way',
    'Create Something Unique',
    'Make It Personal',
    'Your Vision, Our Craft',
    'Build Your Dream Piece'
  ],
  learn: [
    'Get The Details',
    'Learn More',
    'See The Difference',
    'Discover Why',
    'Get Educated'
  ],
  social: [
    'Share Your Story',
    'Join The Community',
    'Show Your Style',
    'Get Featured',
    'Connect With Us'
  ]
}

// Trust signals specifically for Gen Z concerns
export const trustSignals = {
  sustainability: [
    '🌍 Carbon neutral shipping',
    '♻️ 100% recycled packaging',
    '🌱 Tree planted with every order',
    '🔄 Circular economy certified'
  ],
  authenticity: [
    '💎 Lab certificates included',
    '🔬 Third-party verified',
    '📱 Scan QR for full story',
    '📋 Transparent sourcing'
  ],
  community: [
    '⭐ 4.9/5 from 12,847 reviews',
    '👥 50k+ satisfied customers',
    '📱 2.3M TikTok views',
    '💜 Gen Z approved brand'
  ],
  support: [
    '💬 24/7 chat support',
    '📹 Free video consultations',
    '🔄 100-day return policy',
    '🛡️ Lifetime warranty'
  ]
}

// Trend indicators and badges
export const trendBadges: string[] = [
  'Trending',
  'Viral',
  'Most Loved',
  'Gen Z Approved',
  'Creator Favorite',
  'TikTok Famous',
  'Sustainable Choice',
  'Limited Edition',
  'Just Dropped',
  'Selling Fast'
]