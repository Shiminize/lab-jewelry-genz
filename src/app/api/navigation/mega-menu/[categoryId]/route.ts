/**
 * Mega Menu API Endpoint
 * CLAUDE_RULES compliant: Dynamic mega menu data for specific categories
 * 
 * Provides detailed mega menu data including subcategories,
 * featured products, and promotional content
 */

import { NextRequest, NextResponse } from 'next/server'
import { categoryService } from '@/services/categoryService'

interface MegaMenuParams {
  params: {
    categoryId: string
  }
}

/**
 * Featured products data for mega menus
 */
const FEATURED_PRODUCTS_DATA: Record<string, any[]> = {
  rings: [
    { 
      id: '1', 
      name: 'Classic Solitaire 1.5ct', 
      price: '$1,299', 
      originalPrice: '$1,499',
      image: '/images/products/rings/solitaire-1-5ct.jpg', 
      href: '/products/classic-solitaire', 
      badge: 'Bestseller',
      rating: 4.9,
      description: 'Timeless elegance with lab-grown diamond'
    },
    { 
      id: '2', 
      name: 'Modern Band Set', 
      price: '$899', 
      image: '/images/products/rings/modern-band-set.jpg', 
      href: '/products/modern-band', 
      badge: 'New',
      rating: 4.8,
      description: 'Contemporary matching wedding band set'
    },
    { 
      id: '3', 
      name: 'Custom Engagement Ring', 
      price: 'From $999', 
      image: '/images/products/rings/custom-engagement.jpg', 
      href: '/customizer?template=engagement',
      badge: 'Popular',
      rating: 5.0,
      description: 'Design your perfect engagement ring'
    }
  ],
  necklaces: [
    { 
      id: '1', 
      name: 'Diamond Pendant', 
      price: '$899', 
      image: '/images/products/necklaces/diamond-pendant.jpg', 
      href: '/products/diamond-pendant', 
      badge: 'New',
      rating: 4.7,
      description: 'Elegant solitaire diamond pendant'
    },
    { 
      id: '2', 
      name: 'Gold Chain 18"', 
      price: '$699', 
      originalPrice: '$799',
      image: '/images/products/necklaces/gold-chain-18.jpg', 
      href: '/products/gold-chain',
      rating: 4.6,
      description: 'Classic 18k gold chain necklace'
    },
    { 
      id: '3', 
      name: 'Custom Pendant', 
      price: 'From $399', 
      image: '/images/products/necklaces/custom-pendant.jpg', 
      href: '/customizer?template=pendant',
      badge: 'Trending',
      rating: 4.9,
      description: 'Create your unique pendant design'
    }
  ],
  earrings: [
    { 
      id: '1', 
      name: 'Diamond Studs 1ct', 
      price: '$599', 
      originalPrice: '$699',
      image: '/images/products/earrings/diamond-studs-1ct.jpg', 
      href: '/products/diamond-studs', 
      badge: 'Bestseller',
      rating: 4.9,
      description: 'Classic diamond stud earrings'
    },
    { 
      id: '2', 
      name: 'Gold Hoops', 
      price: '$399', 
      image: '/images/products/earrings/gold-hoops.jpg', 
      href: '/products/gold-hoops',
      rating: 4.8,
      description: 'Modern 14k gold hoop earrings'
    },
    { 
      id: '3', 
      name: 'Custom Studs', 
      price: 'From $299', 
      image: '/images/products/earrings/custom-studs.jpg', 
      href: '/customizer?template=studs',
      badge: 'New',
      rating: 4.7,
      description: 'Design your custom stud earrings'
    }
  ],
  customizer: [
    { 
      id: '1', 
      name: 'Design Your Ring', 
      price: 'From $999', 
      image: '/images/customizer/ring-designer.jpg', 
      href: '/customizer?category=rings',
      badge: 'Popular',
      rating: 5.0,
      description: '3D ring customizer with real-time preview'
    },
    { 
      id: '2', 
      name: 'Necklace Designer', 
      price: 'From $399', 
      image: '/images/customizer/necklace-designer.jpg', 
      href: '/customizer?category=necklaces',
      badge: 'New',
      rating: 4.9,
      description: 'Custom pendant and chain designer'
    },
    { 
      id: '3', 
      name: 'Earring Creator', 
      price: 'From $299', 
      image: '/images/customizer/earring-creator.jpg', 
      href: '/customizer?category=earrings',
      rating: 4.8,
      description: 'Create unique custom earrings'
    }
  ]
}

/**
 * Quick links data for mega menus
 */
const QUICK_LINKS_DATA: Record<string, any[]> = {
  rings: [
    { id: 'ring-size-guide', label: 'Ring Size Guide', href: '/sizing', icon: 'ruler', description: 'Find your perfect fit' },
    { id: 'diamond-education', label: 'Diamond Education', href: '/education', icon: 'gem', description: 'Learn about diamonds' },
    { id: 'lifetime-warranty', label: 'Lifetime Warranty', href: '/warranty', icon: 'shield', description: 'Protect your investment' },
    { id: 'care-guide', label: 'Care Instructions', href: '/care', icon: 'heart', description: 'Keep your jewelry beautiful' }
  ],
  necklaces: [
    { id: 'necklace-length', label: 'Length Guide', href: '/sizing/necklaces', icon: 'ruler', description: 'Choose the right length' },
    { id: 'care-instructions', label: 'Care Instructions', href: '/care', icon: 'heart', description: 'Proper jewelry care' },
    { id: 'metal-guide', label: 'Metal Guide', href: '/materials', icon: 'settings', description: 'Understanding metals' },
    { id: 'engraving', label: 'Engraving Service', href: '/services/engraving', icon: 'edit', description: 'Personalize your piece' }
  ],
  earrings: [
    { id: 'earring-backs', label: 'Earring Backs', href: '/earring-backs', icon: 'settings', description: 'Secure earring backs' },
    { id: 'piercing-guide', label: 'Piercing Guide', href: '/piercing-guide', icon: 'target', description: 'Piercing information' },
    { id: 'care-guide', label: 'Care Instructions', href: '/care', icon: 'heart', description: 'Keep earrings pristine' },
    { id: 'fit-guide', label: 'Fit Guide', href: '/sizing#earrings', icon: 'ruler', description: 'Perfect earring fit' }
  ],
  customizer: [
    { id: 'tutorial', label: '3D Tutorial', href: '/tutorial', icon: 'play', description: 'Learn the customizer' },
    { id: 'design-gallery', label: 'Design Gallery', href: '/gallery', icon: 'grid', description: 'Browse customer designs' },
    { id: 'save-designs', label: 'Save & Share', href: '/designs', icon: 'share', description: 'Save your creations' },
    { id: 'consultation', label: 'Free Consultation', href: '/consultation', icon: 'users', description: 'Get expert help' }
  ]
}

export async function GET(request: NextRequest, { params }: MegaMenuParams) {
  const startTime = Date.now()
  const { categoryId } = params
  
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('📋 [MEGA MENU API] Fetching mega menu for:', categoryId)
    }

    // Get category data from category service
    const category = await categoryService.getCategoryById(categoryId)
    
    if (!category) {
      return NextResponse.json(
        { error: `Category '${categoryId}' not found` },
        { status: 404 }
      )
    }

    // Build mega menu response
    const megaMenuData = {
      id: category.id,
      label: category.label,
      description: category.description,
      categories: category.children || [],
      featuredProducts: FEATURED_PRODUCTS_DATA[categoryId] || [],
      quickLinks: QUICK_LINKS_DATA[categoryId] || [],
      promotionalBanner: category.promotionalBanner || null,
      metadata: {
        categoryCount: category.children?.length || 0,
        featuredProductCount: FEATURED_PRODUCTS_DATA[categoryId]?.length || 0,
        quickLinkCount: QUICK_LINKS_DATA[categoryId]?.length || 0,
        hasPromotionalBanner: !!category.promotionalBanner,
        lastUpdated: new Date().toISOString()
      }
    }

    const responseTime = Date.now() - startTime
    
    // Add performance headers
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=600, s-maxage=1800', // 10 min cache, 30 min CDN
      'X-Response-Time': responseTime.toString(),
      'X-Category-Id': categoryId,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [MEGA MENU API] Returned mega menu for', categoryId, 'in', responseTime + 'ms')
    }

    return NextResponse.json(megaMenuData, { headers })
    
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error('❌ [MEGA MENU API] Error fetching mega menu for', categoryId + ':', error)
    
    // Return minimal fallback data
    const fallbackData = {
      id: categoryId,
      label: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
      description: `Browse our ${categoryId} collection`,
      categories: [],
      featuredProducts: [],
      quickLinks: [],
      promotionalBanner: null,
      metadata: {
        categoryCount: 0,
        featuredProductCount: 0,
        quickLinkCount: 0,
        hasPromotionalBanner: false,
        fallback: true,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastUpdated: new Date().toISOString()
      }
    }

    return NextResponse.json(
      fallbackData,
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Response-Time': responseTime.toString(),
          'X-Fallback': 'true',
          'X-Category-Id': categoryId
        }
      }
    )
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  })
}