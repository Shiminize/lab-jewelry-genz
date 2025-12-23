export type HomepageHeroLayout = 'simple' | 'split'

export interface HomepageHeroCta {
  label: string
  href: string
  tone?: 'coral' | 'sky' | 'magenta' | 'lime' | 'volt' | 'cyan' | 'ink'
  variant?: 'primary' | 'glass' | 'outline' | 'ghost' | 'accent' | 'inverse'
}

export interface HomepageHeroStat {
  label: string
  value: string
}

export interface HomepageHeroContent {
  layout: HomepageHeroLayout
  theme: string
  kicker: string
  headlineLine1: string
  body: string
  primaryCta: HomepageHeroCta
  secondaryCta?: HomepageHeroCta
  stats: HomepageHeroStat[]
  media?: {
    image: string
    alt: string
  }
  background?: {
    image: string
    alt: string
    mobileImage?: string
  }
}

export interface HomepageCollectionType {
  title: string
  description: string
  href: string
  image?: string
}

export interface HomepageCollectionSectionContent {
  title: string
  description: string
}

export interface HomepageCustomizerOnboardingStep {
  title: string
  description: string
}

export interface HomepageCustomizerOnboardingContent {
  eyebrow: string
  headline: string
  body: string
  steps: HomepageCustomizerOnboardingStep[]
  primaryCta: HomepageHeroCta
  secondaryCta?: HomepageHeroCta
  media?: {
    image?: string
    video?: string
    alt: string
  }
  stat?: HomepageHeroStat
}

export interface HomepageCreatorCtaContent {
  headline: string
  subheadline: string
  supporting: string
  proof: {
    text: string
    href: string
    linkLabel: string
  }
  primaryCta: HomepageHeroCta
  secondaryCta: HomepageHeroCta
}

export interface HomepageFeaturedProduct {
  slug: string
  name: string
  category: string
  price: number
  tone: 'volt' | 'cyan' | 'magenta' | 'lime'
  tagline?: string
  heroImage?: string
  gallery?: Array<{ src?: string | null }>
}

export interface HomepageContent {
  hero: HomepageHeroContent
  features: string[]
  featuredProducts: HomepageFeaturedProduct[]
  collectionTypes: HomepageCollectionType[]
  collectionSection: HomepageCollectionSectionContent
  customizerOnboarding: HomepageCustomizerOnboardingContent
  creatorCta: HomepageCreatorCtaContent
}

export const homepageContent: HomepageContent = {
  hero: {
    layout: 'simple',
    theme: 'coral-sky-light',
    kicker: '',
    headlineLine1: 'MAKE IT YOURS.',
    body: "Create luminous, lasting pieces you'll reach for every day, customized in minutes.",
    primaryCta: {
      label: 'Start Designing',
      href: '/customizer',
      tone: 'coral',
      variant: 'inverse',
    },
    secondaryCta: {
      label: 'View Collection',
      href: '/collections',
      variant: 'glass',
    },
    stats: [],
    background: {
      image: 'https://res.cloudinary.com/dgyf0osrx/image/upload/v1/glowglitch/categories/misc/home_hero_shelves.webp',
      mobileImage: 'https://res.cloudinary.com/dgyf0osrx/image/upload/v1/glowglitch/categories/misc/home_hero_shelves.webp',
      alt: 'Gold necklace and earrings displayed in an ivory and deep green shelf with soft spotlights',
    },
  },
  features: [
    'Real-time 3D customization',
    'AR try-on in one tap',
    'Certified sustainable materials',
  ],
  featuredProducts: [
    {
      slug: 'coral-orbit',
      name: 'Coral Orbit Ring',
      category: 'Rings',
      price: 1980,
      tone: 'magenta',
      tagline: 'Radiant coral gradients with everyday wear comfort.',
      heroImage: '/images/products/ring-luxury-001/poster.webp',
    },
    {
      slug: 'skyline-pendant',
      name: 'Skyline Pendant',
      category: 'Necklaces',
      price: 860,
      tone: 'cyan',
      tagline: 'Minimal silhouette that mirrors the Coral Sky glow.',
      gallery: [{ src: '/images/products/static/diamond-pendant/hero.webp' }],
    },
    {
      slug: 'mint-line-hoops',
      name: 'Mint Line Hoops',
      category: 'Earrings',
      price: 640,
      tone: 'lime',
      tagline: 'Lightweight hoops with a cool seafoam sheen.',
      gallery: [],
    },
    {
      slug: 'daybreak-cuff',
      name: 'Daybreak Cuff',
      category: 'Bracelets',
      price: 1250,
      tone: 'volt',
      tagline: 'Structured cuff capturing sunrise reflections.',
    },
  ],
  collectionTypes: [
    {
      title: 'Engagement Rings',
      description: 'Design a lab-grown centerpiece that reflects your story.',
      href: '/collections?category=engagement-rings',
      image: 'https://res.cloudinary.com/dgyf0osrx/image/upload/v1/glowglitch/categories/misc/home_collection_eternal_pieces_3x2_stone.webp',
    },
    {
      title: 'Everyday Essentials',
      description: 'Minimal silhouettes crafted for daily wear and easy stacking.',
      href: '/collections?category=everyday-essentials',
      image: 'https://res.cloudinary.com/dgyf0osrx/image/upload/v1/glowglitch/categories/misc/home_collection_everyday_essential_3x2_stone.webp',
    },
    {
      title: 'Creator Capsules',
      description: 'Limited drops from our 500+ creator network, ready to customize.',
      href: '/collections?category=creator-capsules',
      image: 'https://res.cloudinary.com/dgyf0osrx/image/upload/v1/glowglitch/categories/misc/home_collection_creator_capsule_3x2_stone.webp',
    },
    {
      title: 'Sustainable Icons',
      description: 'Certified materials with full traceability and carbon-neutral finishing.',
      href: '/collections/sustainable-icons',
      image: 'https://res.cloudinary.com/dgyf0osrx/image/upload/v1/glowglitch/categories/misc/home_collection_Sustainable_3x2_stone.webp',
    },
  ],
  collectionSection: {
    title: 'Shop by Collection',
    description: 'Pick your launch point and remix every detail in Coral & Sky lighting.',
  },
  customizerOnboarding: {
    eyebrow: '3D Customizer',
    headline: 'Craft the exact piece you imagined in minutes.',
    body: 'Start with a base design, fine-tune stones and metals in real time, and preview everything in photoreal Coral & Sky lighting before you buy.',
    steps: [
      {
        title: 'Step 1: Choose your base',
        description: 'Select a setting or band that fits your style and budget.',
      },
      {
        title: 'Step 2: Tune every detail',
        description: 'Swap stones, metals, and finishes with instant 3D feedback.',
      },
      {
        title: 'Step 3: Preview & share',
        description: 'View AR try-ons, capture renders, and share with your crew.',
      },
    ],
    primaryCta: {
      label: 'Launch the customizer',
      href: '/customizer',
      tone: 'coral',
      variant: 'accent',
    },
    secondaryCta: {
      label: 'Watch the 45-sec tour',
      href: '/customizer-preview-demo',
      variant: 'glass',
    },
    media: {
      image: 'https://res.cloudinary.com/dgyf0osrx/image/upload/v1/glowglitch/categories/misc/home_customizer_render_3x2_grid.webp',
      alt: '3D render of a sculptural pendant above an ivory plane with a deep green grid accent',
    },
    stat: { label: 'Avg. time to checkout', value: '6 min' },
  },
  creatorCta: {
    headline: 'Join the Collective.',
    subheadline: 'Curate your edit. Share your style. Earn on every piece from our vault.',
    supporting:
      'An exclusive ambassador program for creators who define the zeitgeist. Access our inventory, gift your audience, and build your revenue stream.',
    proof: {
      text: 'CURRENTLY ACCEPTING APPLICATIONS FOR Q3.',
      href: '/creators',
      linkLabel: 'View the criteria →',
    },
    primaryCta: {
      label: 'Apply to Join',
      href: '/creators#apply',
      tone: 'coral',
      variant: 'accent',
    },
    secondaryCta: {
      label: 'View Perks',
      href: '/creators',
      variant: 'glass',
    },
  },
}
