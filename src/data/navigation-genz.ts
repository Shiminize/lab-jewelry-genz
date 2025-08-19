import { MegaMenuContent } from '@/components/navigation/MegaMenu'
import { MobileNavigationCategory } from '@/components/navigation/MobileNavigationDrawer'

// Gen Z Values-First Navigation Structure
// Prioritizes customization, sustainability, and social proof

export interface NavigationSection {
  id: string
  name: string
  href: string
  description?: string
  badge?: string
  icon?: string
  priority: 'primary' | 'secondary' | 'tertiary'
}

export interface SocialProofData {
  activeViewers?: number
  recentPurchases?: Array<{
    customer: string
    product: string
    timeAgo: string
  }>
  creatorSpotlight?: {
    name: string
    image: string
    followers: string
    latestPost: string
  }
}

// Primary Values-Driven Navigation
export const primaryNavigation: NavigationSection[] = [
  {
    id: 'design-your-story',
    name: 'Create Your Vibe',
    href: '/customizer',
    description: 'Design something that screams YOU',
    badge: 'Most Popular',
    priority: 'primary'
  },
  {
    id: 'shop-values',
    name: 'Shop Your Values',
    href: '/values',
    description: 'Jewelry that actually aligns with who you are',
    priority: 'primary'
  },
  {
    id: 'creator-collective',
    name: 'Creator Community',
    href: '/creators',
    description: 'Designs by creators who get it',
    badge: 'New',
    priority: 'primary'
  },
  {
    id: 'impact-story',
    name: 'Real Impact',
    href: '/sustainability',
    description: 'The actual difference we\'re making (with receipts)',
    priority: 'secondary'
  }
]

// Values-First Mega Menu Content
export const valuesNavigationData = {
  'design-your-story': {
    sections: [
      {
        title: "Build Something Iconic",
        links: [
          { 
            name: "3D Ring Creator", 
            href: "/customizer/rings",
            description: "Design rings that are 100% you (zero cookie-cutter vibes)"
          },
          { 
            name: "Necklace Creator", 
            href: "/customizer/necklaces",
            description: "Build necklaces that hit different"
          },
          { 
            name: "Earring Studio", 
            href: "/customizer/earrings",
            description: "Earrings that are actually conversation starters"
          },
          { 
            name: "Bracelet Builder", 
            href: "/customizer/bracelets",
            description: "Stack worthy bracelets that say everything"
          }
        ]
      },
      {
        title: "Find Your Aesthetic",
        links: [
          { 
            name: "Style Quiz", 
            href: "/quiz/style",
            description: "Find your jewelry personality (it's giving main character energy)"
          },
          { 
            name: "Trend Explorer", 
            href: "/trends",
            description: "What's actually trending (not what brands think is trending)"
          },
          { 
            name: "Inspiration Gallery", 
            href: "/inspiration",
            description: "Real people, real designs, real inspiration"
          },
          { 
            name: "Design Challenges", 
            href: "/challenges",
            description: "Weekly themes to spark creativity"
          }
        ]
      }
    ],
    featuredProducts: [
      {
        id: "custom-engagement-ring",
        name: "Custom Engagement Ring",
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&crop=center",
        href: "/customizer/rings?type=engagement",
        price: "From $1,200"
      },
      {
        id: "personalized-necklace",
        name: "Personalized Necklace",
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop&crop=center",
        href: "/customizer/necklaces?type=pendant",
        price: "From $400"
      }
    ],
    promotionalBanner: {
      title: "🎨 Free Design Session",
      description: "Hop on a video call with our team and turn your wild ideas into reality (yes, even the crazy ones).",
      href: "/consultation"
    },
    socialProof: {
      activeViewers: 47,
      recentPurchases: [
        { customer: "Emma L.", product: "Custom Rose Gold Ring", timeAgo: "2 minutes ago" },
        { customer: "Alex R.", product: "Personalized Pendant", timeAgo: "5 minutes ago" }
      ]
    }
  } as MegaMenuContent & { socialProof: SocialProofData },

  'shop-values': {
    sections: [
      {
        title: "Sustainable Luxury",
        links: [
          { 
            name: "Lab-Grown Diamonds", 
            href: "/products?material=lab-grown",
            description: "All the sparkle, none of the environmental damage"
          },
          { 
            name: "Recycled Metals", 
            href: "/products?material=recycled",
            description: "Turning old metal into new favorites (circular economy vibes)"
          },
          { 
            name: "Carbon Neutral", 
            href: "/products?impact=carbon-neutral",
            description: "Jewelry that doesn't hurt the planet (we offset everything)"
          },
          { 
            name: "Ethical Sourcing", 
            href: "/ethics",
            description: "Full transparency on where everything comes from (no sketchy stuff)"
          }
        ]
      },
      {
        title: "Social Impact",
        links: [
          { 
            name: "Community Giving", 
            href: "/products?impact=community",
            description: "Your purchase = real change in communities that need it"
          },
          { 
            name: "Creator Support", 
            href: "/products?creator=supported",
            description: "Supporting underrepresented artists (because diversity isn't just a buzzword)"
          },
          { 
            name: "Education Fund", 
            href: "/impact/education",
            description: "Supporting jewelry artisans worldwide"
          },
          { 
            name: "Ocean Cleanup", 
            href: "/impact/ocean",
            description: "Every order = less plastic in our oceans (flex on pollution)"
          }
        ]
      }
    ],
    featuredProducts: [
      {
        id: "ocean-impact-ring",
        name: "Ocean Impact Ring",
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center",
        href: "/products/ocean-impact-ring",
        price: "From $800"
      },
      {
        id: "community-necklace",
        name: "Community Necklace",
        image: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=400&fit=crop&crop=center",
        href: "/products/community-necklace",
        price: "From $350"
      }
    ],
    promotionalBanner: {
      title: "🌍 Impact Dashboard",
      description: "See exactly how your purchase is changing the world (with actual data).",
      href: "/impact/dashboard"
    }
  } as MegaMenuContent,

  'creator-collective': {
    sections: [
      {
        title: "Featured Creators",
        links: [
          { 
            name: "Rising Stars", 
            href: "/creators/rising",
            description: "Emerging artists making waves"
          },
          { 
            name: "Sustainability Champions", 
            href: "/creators/sustainability",
            description: "Creators leading eco-conscious design"
          },
          { 
            name: "Cultural Storytellers", 
            href: "/creators/cultural",
            description: "Jewelry celebrating heritage"
          },
          { 
            name: "Gen Z Innovators", 
            href: "/creators/genz",
            description: "Young designers pushing boundaries"
          }
        ]
      },
      {
        title: "Join the Community",
        links: [
          { 
            name: "Creator Application", 
            href: "/creators/apply",
            description: "Earn 30% commission on every sale"
          },
          { 
            name: "Creator Resources", 
            href: "/creators/resources",
            description: "Content tools and brand guidelines"
          },
          { 
            name: "Success Stories", 
            href: "/creators/stories",
            description: "How creators build their following"
          },
          { 
            name: "Creator Dashboard", 
            href: "/creators/dashboard",
            description: "Track your impact and earnings"
          }
        ]
      }
    ],
    featuredProducts: [
      {
        id: "creator-spotlight-ring",
        name: "@maya_jewels Design",
        image: "https://images.unsplash.com/photo-1544724107-6d5c4caaff5e?w=400&h=400&fit=crop&crop=center",
        href: "/creators/maya-jewels/designs",
        price: "From $650"
      },
      {
        id: "trending-creator-piece",
        name: "@eco_elegance Collection",
        image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop&crop=center",
        href: "/creators/eco-elegance/collection",
        price: "From $420"
      }
    ],
    promotionalBanner: {
      title: "🤝 Creator of the Month",
      description: "Meet Sarah (@sustainable_sparkle) and shop her exclusive biodegradable packaging collection.",
      href: "/creators/featured/sustainable-sparkle"
    }
  } as MegaMenuContent
}

// Traditional Categories as Secondary Navigation
export const categoryNavigation = {
  rings: {
    sections: [
      {
        title: "By Moment",
        links: [
          { 
            name: "Engagement Rings", 
            href: "/rings/engagement",
            description: "Start your forever story sustainably"
          },
          { 
            name: "Promise Rings", 
            href: "/rings/promise",
            description: "Meaningful symbols of commitment"
          },
          { 
            name: "Everyday Rings", 
            href: "/rings/everyday",
            description: "Daily reminders of your values"
          },
          { 
            name: "Statement Rings", 
            href: "/rings/statement",
            description: "Bold pieces that spark conversations"
          }
        ]
      },
      {
        title: "By Impact",
        links: [
          { 
            name: "Ocean-Positive", 
            href: "/rings/ocean",
            description: "Each ring removes 1lb ocean plastic"
          },
          { 
            name: "Community-Made", 
            href: "/rings/community",
            description: "Supporting artisan communities"
          },
          { 
            name: "Carbon-Negative", 
            href: "/rings/carbon",
            description: "Rings that heal the planet"
          },
          { 
            name: "Conflict-Free", 
            href: "/rings/ethical",
            description: "100% verified ethical sourcing"
          }
        ]
      }
    ],
    featuredProducts: [
      {
        id: "sustainable-solitaire",
        name: "Sustainable Solitaire",
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&crop=center",
        href: "/products/sustainable-solitaire",
        price: "From $1,200"
      },
      {
        id: "ocean-ring",
        name: "Ocean Cleanup Ring",
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center",
        href: "/products/ocean-cleanup-ring",
        price: "From $800"
      }
    ],
    promotionalBanner: {
      title: "💍 Ring Finder Quiz",
      description: "Answer 3 questions to find your perfect ring style and values match.",
      href: "/quiz/rings"
    }
  } as MegaMenuContent
}

// Mobile Navigation with Values-First Approach
export const genZMobileNavigation: MobileNavigationCategory[] = [
  {
    name: "Design Your Story",
    href: "/customizer",
    subcategories: [
      { name: "3D Ring Designer", href: "/customizer/rings" },
      { name: "Necklace Creator", href: "/customizer/necklaces" },
      { name: "Earring Studio", href: "/customizer/earrings" },
      { name: "Bracelet Builder", href: "/customizer/bracelets" },
      { name: "Style Quiz", href: "/quiz/style" }
    ]
  },
  {
    name: "Shop by Values",
    href: "/values",
    subcategories: [
      { name: "Lab-Grown Diamonds", href: "/products?material=lab-grown" },
      { name: "Ocean-Positive", href: "/products?impact=ocean" },
      { name: "Community-Made", href: "/products?impact=community" },
      { name: "Carbon-Negative", href: "/products?impact=carbon" }
    ]
  },
  {
    name: "Creator Collective",
    href: "/creators",
    subcategories: [
      { name: "Featured Creators", href: "/creators/featured" },
      { name: "Rising Stars", href: "/creators/rising" },
      { name: "Apply to Create", href: "/creators/apply" },
      { name: "Creator Resources", href: "/creators/resources" }
    ]
  },
  {
    name: "Browse Categories",
    href: "/categories",
    subcategories: [
      { name: "Rings", href: "/rings" },
      { name: "Necklaces", href: "/necklaces" },
      { name: "Earrings", href: "/earrings" },
      { name: "Bracelets", href: "/bracelets" }
    ]
  }
]

// Trust Signals and Social Proof
export const trustSignals = {
  guarantees: [
    "100 days to fall in love (or send it back, no questions)",
    "Lifetime warranty (because forever means forever)",
    "Free shipping worldwide (we've got you covered)",
    "1-on-1 video calls with our experts (real humans, not bots)"
  ],
  certifications: [
    "B-Corp Certified",
    "Carbon Neutral Certified",
    "Ethical Trade Verified",
    "Lab-Grown Diamond Certified"
  ],
  socialProof: {
    totalCustomers: "50,000+",
    averageRating: 4.9,
    reviewCount: "12,847",
    creatorNetwork: "500+"
  }
}

// Dynamic Content for Gen Z Engagement
export const dynamicContent = {
  headerMessages: [
    {
      id: "sustainability",
      text: "🌱 Your order = 5 trees planted (because the planet needs us)",
      href: "/impact/trees",
      audience: "sustainability-focused"
    },
    {
      id: "customization",
      text: "✨ Create something that's 100% you (zero copies)",
      href: "/customizer",
      audience: "customization-focused"
    },
    {
      id: "creator",
      text: "💎 Join 500+ creators making real money (30% commission)",
      href: "/creators/apply",
      audience: "creator-interested"
    },
    {
      id: "social",
      text: "📱 Post your design & get the spotlight you deserve",
      href: "/community/share",
      audience: "social-native"
    }
  ],
  urgencyMessages: [
    "47 people viewing this category",
    "3 people added this to cart in the last hour",
    "This design was shared 12 times today"
  ]
}