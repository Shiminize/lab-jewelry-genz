/**
 * Product Catalog Page
 * Main product browsing and search interface
 * Implements PRD requirements for mobile-first design
 */

import React from 'react'
import { Metadata } from 'next'
import { ProductSearch } from '@/components/catalog/ProductSearch'
import { H1, BodyText } from '@/components/foundation/Typography'

export const metadata: Metadata = {
  title: 'Lab-Grown Diamond Jewelry Catalog | GlowGlitch',
  description: 'Browse our collection of sustainable lab-grown diamond jewelry. Engagement rings, necklaces, earrings, and bracelets with 3D customization.',
  keywords: ['lab-grown diamonds', 'sustainable jewelry', 'engagement rings', 'diamond necklaces', 'custom jewelry'],
  openGraph: {
    title: 'Lab-Grown Diamond Jewelry Catalog | GlowGlitch',
    description: 'Browse our collection of sustainable lab-grown diamond jewelry with 3D customization.',
    images: ['/images/catalog-og.jpg'],
  }
}

export default function CatalogPage() {

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-background via-border-muted to-background border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <H1 className="mb-4">
              Lab-Grown Diamond Jewelry Collection
            </H1>
            <BodyText size="lg" className="text-muted mb-6">
              Discover our curated collection of sustainable, ethically-sourced lab-grown diamond jewelry. 
              Each piece is customizable with our advanced 3D preview technology.
            </BodyText>
            
            {/* Key selling points */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <BodyText className="font-semibold mb-1">100% Lab-Grown</BodyText>
                <BodyText size="sm" className="text-muted">
                  Ethically created diamonds, identical to mined diamonds but more sustainable
                </BodyText>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <BodyText className="font-semibold mb-1">3D Customization</BodyText>
                <BodyText size="sm" className="text-muted">
                  Preview and customize your jewelry in real-time with our 3D technology
                </BodyText>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-cta/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-cta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <BodyText className="font-semibold mb-1">Best Value</BodyText>
                <BodyText size="sm" className="text-muted">
                  Premium quality at 30-40% less than traditional mined diamonds
                </BodyText>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Catalog Section */}
      <div className="container mx-auto px-4 py-8">
        <ProductSearch />
      </div>

      {/* Categories Quick Access */}
      <div className="bg-border-muted border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <H1 className="mb-2">Shop by Category</H1>
            <BodyText className="text-muted">
              Find the perfect piece for any occasion
            </BodyText>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Engagement Rings', href: '/catalog?categories=rings&subcategories=engagement-rings', image: '/images/categories/engagement-rings.jpg' },
              { name: 'Wedding Bands', href: '/catalog?categories=rings&subcategories=wedding-bands', image: '/images/categories/wedding-bands.jpg' },
              { name: 'Necklaces', href: '/catalog?categories=necklaces', image: '/images/categories/necklaces.jpg' },
              { name: 'Earrings', href: '/catalog?categories=earrings', image: '/images/categories/earrings.jpg' }
            ].map((category) => (
              <a
                key={category.name}
                href={category.href}
                className="group block text-center hover:scale-105 transition-transform duration-200"
              >
                <div className="aspect-square bg-gradient-to-br from-border-muted to-muted-light/20 rounded-xl overflow-hidden mb-3">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback to gradient if image fails to load
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/40 flex items-center justify-center">
                    <BodyText className="font-semibold text-foreground">
                      {category.name}
                    </BodyText>
                  </div>
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
  )
}