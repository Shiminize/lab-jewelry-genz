/**
 * Category Service - Comprehensive jewelry taxonomy and navigation data
 * CLAUDE_RULES compliant: Service layer handles data fetching and transformation
 */

export interface NavigationCategory {
  id: string
  label: string
  href: string
  description: string
  hasDropdown: boolean
  children: NavigationSubcategory[]
  featuredProducts: FeaturedProduct[]
  quickFilters: QuickFilter[]
  promotionalBanner?: PromotionalBanner
}

export interface NavigationSubcategory {
  id: string
  label: string
  href: string
  description: string
  children?: NavigationSubcategory[]
  productCount?: number
  trending?: boolean
}

export interface FeaturedProduct {
  id: string
  name: string
  price: string
  originalPrice?: string
  image: string
  href: string
  badge?: string
  rating?: number
}

export interface QuickFilter {
  id: string
  label: string
  type: 'material' | 'price' | 'style' | 'stone'
  options: FilterOption[]
}

export interface FilterOption {
  value: string
  label: string
  count?: number
  href: string
}

export interface PromotionalBanner {
  title: string
  description: string
  ctaText: string
  ctaHref: string
  backgroundImage?: string
}

/**
 * Comprehensive jewelry category taxonomy
 * Based on luxury jewelry site analysis (Blue Nile, James Allen, Tiffany)
 */
const JEWELRY_CATEGORIES: NavigationCategory[] = [
  {
    id: 'rings',
    label: 'Rings',
    href: '/catalog?category=rings',
    description: 'Engagement, Wedding & Fashion Rings',
    hasDropdown: true,
    children: [
      {
        id: 'engagement-rings',
        label: 'Engagement Rings',
        href: '/catalog?category=rings&type=engagement',
        description: 'Lab-grown diamond solitaires',
        productCount: 156,
        trending: true,
        children: [
          {
            id: 'solitaire',
            label: 'Solitaire',
            href: '/catalog?category=rings&type=engagement&style=solitaire',
            description: 'Classic single stone design',
            productCount: 45
          },
          {
            id: 'halo',
            label: 'Halo',
            href: '/catalog?category=rings&type=engagement&style=halo',
            description: 'Center stone surrounded by diamonds',
            productCount: 38
          },
          {
            id: 'three-stone',
            label: 'Three Stone',
            href: '/catalog?category=rings&type=engagement&style=three-stone',
            description: 'Past, present, future symbolism',
            productCount: 24
          },
          {
            id: 'vintage',
            label: 'Vintage',
            href: '/catalog?category=rings&type=engagement&style=vintage',
            description: 'Art deco and antique inspired',
            productCount: 29
          }
        ]
      },
      {
        id: 'wedding-bands',
        label: 'Wedding Bands',
        href: '/catalog?category=rings&type=wedding',
        description: 'Matching bands in precious metals',
        productCount: 89,
        children: [
          {
            id: 'womens-bands',
            label: "Women's Bands",
            href: '/catalog?category=rings&type=wedding&gender=womens',
            description: 'Elegant bands for her',
            productCount: 54
          },
          {
            id: 'mens-bands',
            label: "Men's Bands",
            href: '/catalog?category=rings&type=wedding&gender=mens',
            description: 'Sophisticated bands for him',
            productCount: 35
          },
          {
            id: 'matching-sets',
            label: 'Matching Sets',
            href: '/catalog?category=rings&type=wedding&style=matching',
            description: 'Perfectly paired bands',
            productCount: 18
          }
        ]
      },
      {
        id: 'fashion-rings',
        label: 'Fashion Rings',
        href: '/catalog?category=rings&type=fashion',
        description: 'Statement and everyday rings',
        productCount: 67,
        children: [
          {
            id: 'cocktail',
            label: 'Cocktail Rings',
            href: '/catalog?category=rings&type=fashion&style=cocktail',
            description: 'Bold statement pieces',
            productCount: 23
          },
          {
            id: 'stackable',
            label: 'Stackable Rings',
            href: '/catalog?category=rings&type=fashion&style=stackable',
            description: 'Mix and match designs',
            productCount: 31
          },
          {
            id: 'signet',
            label: 'Signet Rings',
            href: '/catalog?category=rings&type=fashion&style=signet',
            description: 'Personalized and classic',
            productCount: 13
          }
        ]
      }
    ],
    featuredProducts: [
      {
        id: 'featured-solitaire-1',
        name: '1.5 Carat Lab-Grown Diamond Solitaire',
        price: '$2,899',
        originalPrice: '$3,299',
        image: '/products/solitaire-1.jpg',
        href: '/products/lab-grown-solitaire-15ct',
        badge: 'Best Seller',
        rating: 4.9
      },
      {
        id: 'featured-halo-1',
        name: 'Classic Halo Engagement Ring',
        price: '$1,599',
        image: '/products/halo-1.jpg',
        href: '/products/classic-halo-ring',
        rating: 4.8
      },
      {
        id: 'featured-vintage-1',
        name: 'Art Deco Vintage Ring',
        price: '$2,199',
        image: '/products/vintage-1.jpg',
        href: '/products/art-deco-vintage',
        badge: 'New',
        rating: 4.7
      }
    ],
    quickFilters: [
      {
        id: 'ring-material',
        label: 'Metal',
        type: 'material',
        options: [
          { value: '14k-gold', label: '14K Gold', count: 89, href: '/catalog?category=rings&metal=14k-gold' },
          { value: '18k-gold', label: '18K Gold', count: 67, href: '/catalog?category=rings&metal=18k-gold' },
          { value: 'platinum', label: 'Platinum', count: 45, href: '/catalog?category=rings&metal=platinum' },
          { value: 'white-gold', label: 'White Gold', count: 78, href: '/catalog?category=rings&metal=white-gold' }
        ]
      },
      {
        id: 'ring-price',
        label: 'Price Range',
        type: 'price',
        options: [
          { value: 'under-1000', label: 'Under $1,000', count: 34, href: '/catalog?category=rings&price=0-1000' },
          { value: '1000-2500', label: '$1,000 - $2,500', count: 67, href: '/catalog?category=rings&price=1000-2500' },
          { value: '2500-5000', label: '$2,500 - $5,000', count: 45, href: '/catalog?category=rings&price=2500-5000' },
          { value: 'over-5000', label: 'Over $5,000', count: 23, href: '/catalog?category=rings&price=5000-plus' }
        ]
      }
    ],
    promotionalBanner: {
      title: 'Free Ring Sizing',
      description: 'Professional sizing included with every ring purchase',
      ctaText: 'Learn More',
      ctaHref: '/services/ring-sizing'
    }
  },
  {
    id: 'necklaces',
    label: 'Necklaces',
    href: '/catalog?category=necklaces',
    description: 'Chains, Pendants & Statement Pieces',
    hasDropdown: true,
    children: [
      {
        id: 'pendants',
        label: 'Pendants',
        href: '/catalog?category=necklaces&type=pendants',
        description: 'Elegant pendant necklaces',
        productCount: 78,
        trending: true,
        children: [
          {
            id: 'solitaire-pendants',
            label: 'Diamond Solitaire',
            href: '/catalog?category=necklaces&type=pendants&style=solitaire',
            description: 'Single diamond pendants',
            productCount: 23
          },
          {
            id: 'heart-pendants',
            label: 'Heart Pendants',
            href: '/catalog?category=necklaces&type=pendants&style=heart',
            description: 'Romantic heart designs',
            productCount: 18
          },
          {
            id: 'initial-pendants',
            label: 'Initial Pendants',
            href: '/catalog?category=necklaces&type=pendants&style=initial',
            description: 'Personalized letter charms',
            productCount: 26
          }
        ]
      },
      {
        id: 'chains',
        label: 'Chains',
        href: '/catalog?category=necklaces&type=chains',
        description: 'Fine jewelry chains',
        productCount: 45,
        children: [
          {
            id: 'box-chain',
            label: 'Box Chain',
            href: '/catalog?category=necklaces&type=chains&style=box',
            description: 'Square linked chains',
            productCount: 12
          },
          {
            id: 'cable-chain',
            label: 'Cable Chain',
            href: '/catalog?category=necklaces&type=chains&style=cable',
            description: 'Classic oval links',
            productCount: 18
          },
          {
            id: 'rope-chain',
            label: 'Rope Chain',
            href: '/catalog?category=necklaces&type=chains&style=rope',
            description: 'Twisted rope design',
            productCount: 15
          }
        ]
      },
      {
        id: 'statement-necklaces',
        label: 'Statement Necklaces',
        href: '/catalog?category=necklaces&type=statement',
        description: 'Bold and dramatic pieces',
        productCount: 34,
        children: [
          {
            id: 'chokers',
            label: 'Chokers',
            href: '/catalog?category=necklaces&type=statement&style=choker',
            description: 'Close-fitting necklaces',
            productCount: 11
          },
          {
            id: 'layering',
            label: 'Layering Sets',
            href: '/catalog?category=necklaces&type=statement&style=layering',
            description: 'Multiple chain combinations',
            productCount: 23
          }
        ]
      }
    ],
    featuredProducts: [
      {
        id: 'featured-pendant-1',
        name: '0.75ct Lab Diamond Solitaire Pendant',
        price: '$899',
        image: '/products/pendant-1.jpg',
        href: '/products/lab-diamond-pendant',
        badge: 'Best Seller',
        rating: 4.9
      },
      {
        id: 'featured-chain-1',
        name: '18K Gold Box Chain',
        price: '$459',
        image: '/products/chain-1.jpg',
        href: '/products/18k-box-chain',
        rating: 4.8
      }
    ],
    quickFilters: [
      {
        id: 'necklace-length',
        label: 'Length',
        type: 'style',
        options: [
          { value: '16-inch', label: '16"', count: 45, href: '/catalog?category=necklaces&length=16' },
          { value: '18-inch', label: '18"', count: 67, href: '/catalog?category=necklaces&length=18' },
          { value: '20-inch', label: '20"', count: 34, href: '/catalog?category=necklaces&length=20' }
        ]
      }
    ]
  },
  {
    id: 'earrings',
    label: 'Earrings',
    href: '/catalog?category=earrings',
    description: 'Studs, Hoops & Statement Earrings',
    hasDropdown: true,
    children: [
      {
        id: 'studs',
        label: 'Stud Earrings',
        href: '/catalog?category=earrings&type=studs',
        description: 'Classic and modern studs',
        productCount: 89,
        trending: true,
        children: [
          {
            id: 'diamond-studs',
            label: 'Diamond Studs',
            href: '/catalog?category=earrings&type=studs&stone=diamond',
            description: 'Lab-grown diamond studs',
            productCount: 45
          },
          {
            id: 'gemstone-studs',
            label: 'Gemstone Studs',
            href: '/catalog?category=earrings&type=studs&stone=gemstone',
            description: 'Colorful gemstone options',
            productCount: 28
          },
          {
            id: 'pearl-studs',
            label: 'Pearl Studs',
            href: '/catalog?category=earrings&type=studs&stone=pearl',
            description: 'Classic cultured pearls',
            productCount: 16
          }
        ]
      },
      {
        id: 'hoops',
        label: 'Hoop Earrings',
        href: '/catalog?category=earrings&type=hoops',
        description: 'Small to large hoops',
        productCount: 56,
        children: [
          {
            id: 'small-hoops',
            label: 'Small Hoops',
            href: '/catalog?category=earrings&type=hoops&size=small',
            description: 'Under 20mm diameter',
            productCount: 23
          },
          {
            id: 'medium-hoops',
            label: 'Medium Hoops',
            href: '/catalog?category=earrings&type=hoops&size=medium',
            description: '20-40mm diameter',
            productCount: 21
          },
          {
            id: 'large-hoops',
            label: 'Large Hoops',
            href: '/catalog?category=earrings&type=hoops&size=large',
            description: 'Over 40mm diameter',
            productCount: 12
          }
        ]
      },
      {
        id: 'drop-earrings',
        label: 'Drop Earrings',
        href: '/catalog?category=earrings&type=drop',
        description: 'Elegant hanging designs',
        productCount: 34,
        children: [
          {
            id: 'chandelier',
            label: 'Chandelier',
            href: '/catalog?category=earrings&type=drop&style=chandelier',
            description: 'Multi-tiered designs',
            productCount: 15
          },
          {
            id: 'linear-drop',
            label: 'Linear Drop',
            href: '/catalog?category=earrings&type=drop&style=linear',
            description: 'Straight line designs',
            productCount: 19
          }
        ]
      }
    ],
    featuredProducts: [
      {
        id: 'featured-studs-1',
        name: '1ct Total Weight Diamond Studs',
        price: '$1,299',
        image: '/products/studs-1.jpg',
        href: '/products/1ct-diamond-studs',
        badge: 'Best Seller',
        rating: 4.9
      },
      {
        id: 'featured-hoops-1',
        name: '14K Gold Medium Hoops',
        price: '$399',
        image: '/products/hoops-1.jpg',
        href: '/products/14k-medium-hoops',
        rating: 4.7
      }
    ],
    quickFilters: [
      {
        id: 'earring-backing',
        label: 'Backing Type',
        type: 'style',
        options: [
          { value: 'push-back', label: 'Push Back', count: 67, href: '/catalog?category=earrings&backing=push' },
          { value: 'screw-back', label: 'Screw Back', count: 45, href: '/catalog?category=earrings&backing=screw' },
          { value: 'lever-back', label: 'Lever Back', count: 23, href: '/catalog?category=earrings&backing=lever' }
        ]
      }
    ]
  },
  {
    id: 'bracelets',
    label: 'Bracelets',
    href: '/catalog?category=bracelets',
    description: 'Tennis, Chain & Statement Bracelets',
    hasDropdown: true,
    children: [
      {
        id: 'tennis-bracelets',
        label: 'Tennis Bracelets',
        href: '/catalog?category=bracelets&type=tennis',
        description: 'Classic diamond line bracelets',
        productCount: 34,
        trending: true
      },
      {
        id: 'chain-bracelets',
        label: 'Chain Bracelets',
        href: '/catalog?category=bracelets&type=chain',
        description: 'Various chain styles',
        productCount: 45
      },
      {
        id: 'bangle-bracelets',
        label: 'Bangles',
        href: '/catalog?category=bracelets&type=bangle',
        description: 'Rigid circular bracelets',
        productCount: 23
      },
      {
        id: 'charm-bracelets',
        label: 'Charm Bracelets',
        href: '/catalog?category=bracelets&type=charm',
        description: 'Personalized with charms',
        productCount: 18
      }
    ],
    featuredProducts: [
      {
        id: 'featured-tennis-1',
        name: '2ct Lab Diamond Tennis Bracelet',
        price: '$1,899',
        image: '/products/tennis-1.jpg',
        href: '/products/2ct-tennis-bracelet',
        badge: 'New',
        rating: 4.8
      }
    ],
    quickFilters: [
      {
        id: 'bracelet-size',
        label: 'Size',
        type: 'style',
        options: [
          { value: '6-5-inch', label: '6.5"', count: 23, href: '/catalog?category=bracelets&size=6.5' },
          { value: '7-inch', label: '7"', count: 45, href: '/catalog?category=bracelets&size=7' },
          { value: '7-5-inch', label: '7.5"', count: 34, href: '/catalog?category=bracelets&size=7.5' }
        ]
      }
    ]
  },
  {
    id: 'customizer',
    label: 'Customize',
    href: '/customizer',
    description: '3D Jewelry Customizer',
    hasDropdown: false,
    children: [],
    featuredProducts: [],
    quickFilters: []
  }
]

/**
 * Category Service API
 */
class CategoryService {
  /**
   * Get all navigation categories
   * Performance: <50ms response time (CLAUDE_RULES requirement)
   */
  async getNavigationCategories(): Promise<NavigationCategory[]> {
    // Simulate API call with minimal delay for realism
    await new Promise(resolve => setTimeout(resolve, 10))
    
    console.log('📊 [CATEGORY SERVICE] Loaded', JEWELRY_CATEGORIES.length, 'categories')
    return JEWELRY_CATEGORIES
  }

  /**
   * Get specific category by ID
   */
  async getCategoryById(id: string): Promise<NavigationCategory | null> {
    await new Promise(resolve => setTimeout(resolve, 5))
    
    const category = JEWELRY_CATEGORIES.find(cat => cat.id === id)
    console.log('📊 [CATEGORY SERVICE] Category lookup:', id, category ? 'found' : 'not found')
    return category || null
  }

  /**
   * Get mega menu data for specific category
   */
  async getMegaMenuData(categoryId: string): Promise<NavigationCategory | null> {
    await new Promise(resolve => setTimeout(resolve, 8))
    
    const category = await this.getCategoryById(categoryId)
    if (category && category.hasDropdown) {
      console.log('📋 [CATEGORY SERVICE] Mega menu data for:', categoryId)
      return category
    }
    
    return null
  }

  /**
   * Search categories and subcategories
   */
  async searchCategories(query: string): Promise<NavigationSubcategory[]> {
    await new Promise(resolve => setTimeout(resolve, 15))
    
    const results: NavigationSubcategory[] = []
    
    JEWELRY_CATEGORIES.forEach(category => {
      category.children.forEach(subcategory => {
        if (subcategory.label.toLowerCase().includes(query.toLowerCase()) ||
            subcategory.description.toLowerCase().includes(query.toLowerCase())) {
          results.push(subcategory)
        }
        
        // Search nested children
        subcategory.children?.forEach(nested => {
          if (nested.label.toLowerCase().includes(query.toLowerCase()) ||
              nested.description.toLowerCase().includes(query.toLowerCase())) {
            results.push(nested)
          }
        })
      })
    })
    
    console.log('🔍 [CATEGORY SERVICE] Search results for "' + query + '":', results.length)
    return results.slice(0, 10) // Limit results
  }

  /**
   * Get trending categories
   */
  async getTrendingCategories(): Promise<NavigationSubcategory[]> {
    await new Promise(resolve => setTimeout(resolve, 12))
    
    const trending: NavigationSubcategory[] = []
    
    JEWELRY_CATEGORIES.forEach(category => {
      category.children.forEach(subcategory => {
        if (subcategory.trending) {
          trending.push(subcategory)
        }
      })
    })
    
    console.log('🔥 [CATEGORY SERVICE] Trending categories:', trending.length)
    return trending
  }
}

// Export singleton instance
export const categoryService = new CategoryService()
export default categoryService