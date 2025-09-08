/**
 * Navigation Categories API Endpoint
 * CLAUDE_RULES compliant: Service layer data endpoint
 * 
 * Provides navigation categories data in standardized format
 * for the navigationDataService to consume
 */

import { NextRequest, NextResponse } from 'next/server'
import { categoryService } from '@/services/categoryService'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    if (process.env.NODE_ENV === 'development') {

    }

    // Get navigation categories from category service
    const categories = await categoryService.getNavigationCategories()
    
    const responseTime = Date.now() - startTime
    
    // Add performance headers for monitoring
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, s-maxage=900', // 5 min cache, 15 min CDN
      'X-Response-Time': responseTime.toString(),
      'X-Categories-Count': categories.length.toString(),
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    }

    if (process.env.NODE_ENV === 'development') {

    }

    return NextResponse.json(
      {
        categories,
        metadata: {
          totalCount: categories.length,
          responseTime,
          timestamp: new Date().toISOString(),
          cacheHint: 'Categories cached for 5 minutes'
        }
      },
      { headers }
    )
    
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error('❌ [NAV CATEGORIES API] Error fetching categories:', error)
    
    // Return fallback categories on error
    const fallbackCategories = [
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
            description: 'Lab-grown diamond solitaires and halo designs',
            trending: true,
            productCount: 150,
            children: []
          }
        ],
        featuredProducts: [],
        quickFilters: [],
        promotionalBanner: undefined
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
            trending: true,
            productCount: 98,
            children: []
          }
        ],
        featuredProducts: [],
        quickFilters: [],
        promotionalBanner: undefined
      },
      {
        id: 'earrings',
        label: 'Earrings',
        href: '/catalog?category=earrings',
        description: 'Studs, Hoops & Statement Earrings',
        hasDropdown: true,
        children: [
          {
            id: 'stud-earrings',
            label: 'Stud Earrings',
            href: '/catalog?category=earrings&type=studs',
            description: 'Classic and modern studs',
            trending: false,
            productCount: 123,
            children: []
          }
        ],
        featuredProducts: [],
        quickFilters: [],
        promotionalBanner: undefined
      },
      {
        id: 'customizer',
        label: 'Customize',
        href: '/customizer',
        description: '3D Jewelry Customizer',
        hasDropdown: true,
        children: [
          {
            id: 'design-rings',
            label: 'Design Rings',
            href: '/customizer?type=rings',
            description: 'Create your perfect ring',
            trending: true,
            productCount: null,
            children: []
          }
        ],
        featuredProducts: [],
        quickFilters: [],
        promotionalBanner: {
          id: 'customizer-promo',
          title: 'Free 3D Design Consultation',
          description: 'Get expert help with your custom design',
          ctaText: 'Book Now',
          ctaHref: '/consultation',
          backgroundColor: 'bg-gradient-to-r from-aurora-pink to-aurora-plum',
          textColor: 'text-white'
        }
      }
    ]

    return NextResponse.json(
      {
        categories: fallbackCategories,
        metadata: {
          totalCount: fallbackCategories.length,
          responseTime,
          timestamp: new Date().toISOString(),
          fallback: true,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { 
        status: 200, // Return 200 with fallback data
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Response-Time': responseTime.toString(),
          'X-Fallback': 'true'
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