/**
 * Centralized Navigation Configuration
 * Single source of truth for all navigation data
 * Follows CLAUDE_RULES.md design system requirements
 */

export interface NavigationItem {
  id: string
  label: string
  href: string
  children?: NavigationItem[]
  metadata?: {
    badge?: string
    description?: string
    featured?: boolean
    icon?: string
    genZLabel?: string // Alternative Gen Z-friendly label for mobile
  }
}

export interface NavigationSection {
  id: string
  label: string
  items: NavigationItem[]
  featured?: {
    title: string
    description: string
    cta: {
      label: string
      href: string
    }
  }
}

// Simplified Navigation Structure - 4 Primary Categories
export const NAVIGATION_CONFIG: NavigationItem[] = [
  {
    id: 'shop',
    label: 'SHOP',
    href: '/catalog',
    metadata: {
      description: 'Discover your next obsession',
      featured: true,
      genZLabel: 'Find Your Vibe'
    },
    children: [
      {
        id: 'rings',
        label: 'Rings',
        href: '/catalog?category=rings',
        metadata: {
          genZLabel: 'Statement Rings',
          description: 'Rings that say everything without saying a word',
          icon: '✨'
        },
        children: [
          { id: 'engagement', label: 'Engagement', href: '/catalog?category=rings&subcategory=engagement', metadata: { genZLabel: 'Main Character Energy' } },
          { id: 'wedding', label: 'Wedding', href: '/catalog?category=rings&subcategory=wedding', metadata: { genZLabel: 'Couple Goals' } },
          { id: 'fashion', label: 'Fashion', href: '/catalog?category=rings&subcategory=fashion', metadata: { genZLabel: 'Solo Stunners' } },
          { id: 'mens', label: 'Men\'s', href: '/catalog?category=rings&subcategory=mens', metadata: { genZLabel: 'His & Hers' } }
        ]
      },
      {
        id: 'necklaces',
        label: 'Necklaces',
        href: '/catalog?category=necklaces',
        metadata: {
          genZLabel: 'Layer Game',
          description: 'Necklaces that stack your story',
          icon: '🎨'
        },
        children: [
          { id: 'pendants', label: 'Pendants', href: '/catalog?category=necklaces&subcategory=pendants', metadata: { genZLabel: 'Signature Pieces' } },
          { id: 'chains', label: 'Chains', href: '/catalog?category=necklaces&subcategory=chains', metadata: { genZLabel: 'Chain Reactions' } },
          { id: 'chokers', label: 'Chokers', href: '/catalog?category=necklaces&subcategory=chokers', metadata: { genZLabel: 'Choker Check' } },
          { id: 'statement', label: 'Statement', href: '/catalog?category=necklaces&subcategory=statement', metadata: { genZLabel: 'Statement Makers' } }
        ]
      },
      {
        id: 'earrings',
        label: 'Earrings',
        href: '/catalog?category=earrings',
        metadata: {
          genZLabel: 'Ear Party',
          description: 'Earrings that bring the energy',
          icon: '💎'
        },
        children: [
          { id: 'studs', label: 'Studs', href: '/catalog?category=earrings&subcategory=studs', metadata: { genZLabel: 'Everyday Studs' } },
          { id: 'hoops', label: 'Hoops', href: '/catalog?category=earrings&subcategory=hoops', metadata: { genZLabel: 'Hoop Dreams' } },
          { id: 'drop', label: 'Drop', href: '/catalog?category=earrings&subcategory=drop', metadata: { genZLabel: 'Drop It' } },
          { id: 'climbers', label: 'Climbers', href: '/catalog?category=earrings&subcategory=climbers', metadata: { genZLabel: 'Stack Attack' } }
        ]
      },
      {
        id: 'bracelets',
        label: 'Bracelets',
        href: '/catalog?category=bracelets',
        metadata: {
          genZLabel: 'Wrist Candy',
          description: 'Bracelets that complete the look',
          icon: '🌱'
        },
        children: [
          { id: 'tennis', label: 'Tennis', href: '/catalog?category=bracelets&subcategory=tennis', metadata: { genZLabel: 'Tennis Energy' } },
          { id: 'chain', label: 'Chain', href: '/catalog?category=bracelets&subcategory=chain', metadata: { genZLabel: 'Chain Vibes' } },
          { id: 'cuff', label: 'Cuff', href: '/catalog?category=bracelets&subcategory=cuff', metadata: { genZLabel: 'Cuff Love' } },
          { id: 'charm', label: 'Charm', href: '/catalog?category=bracelets&subcategory=charm', metadata: { genZLabel: 'Charm Stories' } }
        ]
      }
    ]
  },
  {
    id: 'create',
    label: 'CREATE',
    href: '/customizer',
    metadata: {
      description: 'Design jewelry that tells your story',
      featured: true,
      genZLabel: 'Make It Yours',
      icon: '🎨'
    },
    children: [
      {
        id: 'customizer',
        label: '3D Customizer',
        href: '/customizer',
        metadata: {
          genZLabel: 'Design Your Moment',
          description: '3D customization that brings your vision to life'
        }
      },
      {
        id: 'personalization',
        label: 'Personalization',
        href: '/personalize',
        metadata: {
          genZLabel: 'Make It Yours',
          description: 'Personalized touches that tell your unique story'
        }
      },
      {
        id: 'custom-orders',
        label: 'Custom Orders',
        href: '/custom',
        metadata: {
          genZLabel: 'Dream It, We\'ll Make It',
          description: 'Bespoke jewelry designed just for you'
        }
      }
    ]
  },
  {
    id: 'impact',
    label: 'IMPACT',
    href: '/sustainability',
    metadata: {
      description: 'Conscious luxury that feels good',
      featured: true,
      genZLabel: 'Good Vibes Only',
      icon: '♻️'
    },
    children: [
      {
        id: 'sustainability',
        label: 'Sustainability',
        href: '/sustainability',
        metadata: {
          genZLabel: 'Planet-Positive Shine',
          description: 'Lab-grown diamonds. Real impact. Zero compromise.'
        }
      },
      {
        id: 'ethics',
        label: 'Ethical Sourcing',
        href: '/ethics',
        metadata: {
          genZLabel: 'Good Vibes Only',
          description: 'Ethically sourced. Responsibly made. Consciously cool.'
        }
      },
      {
        id: 'creators',
        label: 'Creator Program',
        href: '/referral',
        metadata: {
          genZLabel: 'Get Paid for Your Influence',
          description: 'Turn your style into your side hustle'
        }
      }
    ]
  },
  {
    id: 'support',
    label: 'SUPPORT',
    href: '/support',
    metadata: {
      description: 'We\'ve got you covered',
      genZLabel: 'We\'ve Got You',
      icon: '💬'
    },
    children: [
      {
        id: 'sizing',
        label: 'Size Guide',
        href: '/sizing',
        metadata: {
          genZLabel: 'Perfect Fit Promise',
          description: 'Get the perfect fit every time'
        }
      },
      {
        id: 'care',
        label: 'Care Guide',
        href: '/care',
        metadata: {
          genZLabel: 'Keep It Glowing',
          description: 'Make your jewelry last forever'
        }
      },
      {
        id: 'quality',
        label: 'Quality & Returns',
        href: '/quality',
        metadata: {
          genZLabel: 'We\'ve Got You Covered',
          description: 'Quality guarantee and hassle-free returns'
        }
      },
      {
        id: 'help',
        label: 'Help Center',
        href: '/help',
        metadata: {
          genZLabel: 'Questions? We\'re Here',
          description: '24/7 support for all your needs'
        }
      }
    ]
  }
]

// Quick Actions for Mobile Footer
export const QUICK_ACTIONS: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    metadata: {
      icon: '🏠',
      genZLabel: 'Home'
    }
  },
  {
    id: 'wishlist',
    label: 'Wishlist',
    href: '/wishlist',
    metadata: {
      icon: '💖',
      genZLabel: 'Saved Vibes',
      badge: 'dynamic' // Will be populated from wishlist count
    }
  },
  {
    id: 'cart',
    label: 'Cart',
    href: '/cart',
    metadata: {
      icon: '🛍️',
      genZLabel: 'Your Picks',
      badge: 'dynamic' // Will be populated from cart count
    }
  },
  {
    id: 'account',
    label: 'Account',
    href: '/account',
    metadata: {
      icon: '👤',
      genZLabel: 'Your Space'
    }
  }
]

// Featured Content for Navigation
export const FEATURED_CONTENT = {
  shop: {
    title: 'New Arrivals',
    description: 'Fresh drops that match your energy',
    cta: {
      label: 'Shop New',
      href: '/catalog?filter=new'
    }
  },
  create: {
    title: 'Make It Yours',
    description: 'Design jewelry that tells your story - your values, your vibe, your vision.',
    cta: {
      label: 'Start Your Story',
      href: '/customizer'
    }
  },
  impact: {
    title: 'Lab-Grown & Loving It',
    description: 'Sustainable luxury that doesn\'t compromise on sparkle',
    cta: {
      label: 'Learn More',
      href: '/sustainability'
    }
  },
  support: {
    title: 'Questions?',
    description: 'Our jewelry experts are here to help you find the perfect piece',
    cta: {
      label: 'Get Help',
      href: '/help'
    }
  }
}

// Navigation utilities
export function getNavigationItem(id: string): NavigationItem | undefined {
  function findItem(items: NavigationItem[]): NavigationItem | undefined {
    for (const item of items) {
      if (item.id === id) return item
      if (item.children) {
        const found = findItem(item.children)
        if (found) return found
      }
    }
    return undefined
  }
  return findItem(NAVIGATION_CONFIG)
}

export function getNavigationItemLabel(id: string, isMobile = false): string {
  const item = getNavigationItem(id)
  if (!item) return ''
  return isMobile && item.metadata?.genZLabel ? item.metadata.genZLabel : item.label
}

export function getAllShopCategories(): NavigationItem[] {
  const shopSection = getNavigationItem('shop')
  return shopSection?.children || []
}