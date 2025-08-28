/**
 * Product Catalog Page
 * Main product browsing and search interface
 * Implements PRD requirements for mobile-first design
 * Optimized for fast loading with critical resource hints
 */

'use client'

import React from 'react'
import { EnhancedProductSearch } from '@/components/catalog/EnhancedProductSearch'
import { H1, BodyText } from '@/components/foundation/Typography'
import Head from 'next/head'

// Critical styles for above-the-fold content
const criticalStyles = `
  .catalog-hero { 
    background: linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--border-muted)) 50%, hsl(var(--background)) 100%);
    border-bottom: 1px solid hsl(var(--border));
  }
  .feature-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
  }
`

export default function CatalogPage() {
  // Preload critical resources
  React.useEffect(() => {
    // Preload product API
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = '/api/products'
    document.head.appendChild(link)
    
    return () => {
      document.head.removeChild(link)
    }
  }, [])

  return (
    <>
      {/* Critical CSS for above-the-fold */}
      <style jsx>{criticalStyles}</style>
      
      <div className="min-h-screen bg-background">
        {/* Header Section */}
        <div className="catalog-hero">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <H1 className="mb-4">
              Lab-Grown Diamond Jewelry Collection
            </H1>
            <BodyText size="lg" className="text-aurora-nav-muted mb-6">
              Your jewelry, reimagined: From sterling silver to platinum, we offer lab-grown diamonds, moissanite, and sustainable gems that spark conversation and change. 
              Customize your piece, support ethical innovation, and wear a story that's uniquely yours.
            </BodyText>
          </div>
        </div>
      </div>

      {/* Search and Catalog Section */}
      <div className="container mx-auto px-4 py-8">
        <EnhancedProductSearch />
      </div>

      {/* Categories Quick Access */}
      <div className="bg-muted border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <H1 className="mb-2">Shop by Category</H1>
            <BodyText className="text-aurora-nav-muted">
              Find the perfect piece for any occasion
            </BodyText>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Engagement Rings', href: '/catalog?categories=rings&subcategories=engagement-rings&stones=lab-diamond', image: '/images/categories/engagement-rings.jpg' },
              { name: 'Wedding Bands', href: '/catalog?categories=rings&subcategories=wedding-bands&metals=14k-gold,platinum', image: '/images/categories/wedding-bands.jpg' },
              { name: 'Necklaces', href: '/catalog?categories=necklaces&stones=moissanite&metals=silver', image: '/images/categories/necklaces.jpg' },
              { name: 'Earrings', href: '/catalog?categories=earrings&stones=lab-diamond&caratMin=0.5', image: '/images/categories/earrings.jpg' }
            ].map((category) => (
              <a
                key={category.name}
                href={category.href}
                className="group block text-center hover:scale-105 transition-transform duration-200"
              >
                <div className="aspect-square bg-gradient-to-br from-accent/20 to-accent/40 overflow-hidden mb-3 flex items-center justify-center">
                  <BodyText className="font-semibold text-foreground">
                    {category.name}
                  </BodyText>
                </div>
                <BodyText className="font-semibold group-hover:text-accent transition-colors">
                  {category.name}
                </BodyText>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}