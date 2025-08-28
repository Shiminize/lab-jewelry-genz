'use client'

import React, { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, Star, Award, Heart } from 'lucide-react'

// Types for Mega Menu Data Structure
interface MegaMenuProduct {
  id: string
  name: string
  price: string
  image: string
  href: string
  badge?: string
}

interface MegaMenuCategory {
  id: string
  label: string
  href: string
  description?: string
  icon?: React.ReactNode
}

interface MegaMenuFeature {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  href?: string
}

interface MegaMenuData {
  id: string
  label: string
  href: string
  description: string
  categories: MegaMenuCategory[]
  featuredProducts: MegaMenuProduct[]
  features: MegaMenuFeature[]
  quickLinks: MegaMenuCategory[]
}

interface AuroraMegaMenuProps {
  data: MegaMenuData
  isOpen: boolean
  onClose: () => void
  position?: 'left' | 'center' | 'right'
}

// Mega Menu Category Column Component
const MegaMenuCategoryColumn = memo(({ categories, onLinkClick }: {
  categories: MegaMenuCategory[]
  onLinkClick: () => void
}) => (
  <div className="space-y-1" role="group" aria-labelledby="categories-heading">
    <div className="relative mb-6">
      <h3 id="categories-heading" className="font-headline font-bold text-base text-[var(--aurora-deep-space)] mb-1 tracking-tight">
        Categories
      </h3>
      <div className="w-12 h-0.5 bg-gradient-to-r from-[var(--aurora-nebula-purple)] to-[var(--aurora-pink)] rounded-full"></div>
    </div>
    {categories.map((category) => (
      <Link
        key={category.id}
        href={category.href}
        onClick={onLinkClick}
        className="
          group flex items-center space-x-3 p-2 rounded-lg transition-colors duration-100
          hover:bg-[var(--aurora-lunar-grey)]/15
          focus:bg-[var(--aurora-lunar-grey)]/15
          focus:outline-none focus:ring-2 focus:ring-[var(--aurora-nebula-purple)]/30 focus:ring-offset-2
          border border-transparent hover:border-[var(--aurora-nebula-purple)]/10
        "
        role="menuitem"
        aria-describedby={category.description ? `${category.id}-desc` : undefined}
      >
        {category.icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--aurora-nebula-purple)]/10 to-[var(--aurora-pink)]/10 
                          flex items-center justify-center group-hover:from-[var(--aurora-nebula-purple)]/20 group-hover:to-[var(--aurora-pink)]/20 
                          transition-colors duration-150">
            <span className="text-[var(--aurora-nebula-purple)] group-hover:text-[var(--aurora-pink)] transition-colors duration-150">
              {category.icon}
            </span>
          </div>
        )}
        <div className="flex-1">
          <div className="font-semibold text-[var(--aurora-deep-space)] group-hover:text-[var(--aurora-nebula-purple)] transition-colors duration-150 text-sm tracking-tight">
            {category.label}
          </div>
          {category.description && (
            <div id={`${category.id}-desc`} className="text-xs text-[var(--aurora-deep-space)]/60 group-hover:text-[var(--aurora-deep-space)]/80 transition-colors duration-150 leading-relaxed mt-0.5">
              {category.description}
            </div>
          )}
        </div>
      </Link>
    ))}
  </div>
))

MegaMenuCategoryColumn.displayName = 'MegaMenuCategoryColumn'

// Mega Menu Product Showcase Component
const MegaMenuShowcase = memo(({ products, onLinkClick }: {
  products: MegaMenuProduct[]
  onLinkClick: () => void
}) => (
  <div className="space-y-6" role="group" aria-labelledby="featured-products-heading">
    <div className="relative">
      <h3 id="featured-products-heading" className="font-headline font-bold text-base text-[var(--aurora-deep-space)] mb-1 tracking-tight">
        Featured Products
      </h3>
      <div className="w-16 h-0.5 bg-gradient-to-r from-[var(--aurora-pink)] to-[var(--aurora-nebula-purple)] rounded-full"></div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {products.slice(0, 2).map((product) => (
        <Link
          key={product.id}
          href={product.href}
          onClick={onLinkClick}
          className="
            group relative block p-3 rounded-lg transition-colors duration-100
            bg-white
            hover:bg-[var(--aurora-lunar-grey)]/10
            focus:bg-[var(--aurora-lunar-grey)]/10
            focus:outline-none focus:ring-2 focus:ring-[var(--aurora-nebula-purple)]/30 focus:ring-offset-2
            border border-[var(--aurora-lunar-grey)]/20 hover:border-[var(--aurora-nebula-purple)]/20
          "
          role="menuitem"
          aria-label={`Featured product: ${product.name} - ${product.price}`}
        >
          <div className="relative aspect-square mb-2 overflow-hidden rounded-lg bg-[var(--aurora-lunar-grey)]/5">
            <Image
              src={product.image}
              alt={`${product.name} jewelry piece - ${product.price}`}
              fill
              className="object-cover transition-transform duration-100 group-hover:scale-102"
              sizes="140px"
              priority={false}
              loading="lazy"
            />
            {product.badge && (
              <span className="
                absolute top-2 right-2 px-3 py-1 text-xs font-semibold rounded-full
                bg-[var(--aurora-crimson)] text-white
                shadow-sm
              ">
                {product.badge}
              </span>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
          </div>
          <div className="text-center space-y-1">
            <h4 className="font-semibold text-[var(--aurora-deep-space)] text-sm mb-1 group-hover:text-[var(--aurora-nebula-purple)] transition-colors duration-150 tracking-tight">
              {product.name}
            </h4>
            <p className="text-[var(--aurora-nebula-purple)] font-bold text-base group-hover:text-[var(--aurora-pink)] transition-colors duration-150">
              {product.price}
            </p>
          </div>
        </Link>
      ))}
    </div>
  </div>
))

MegaMenuShowcase.displayName = 'MegaMenuShowcase'

// Mega Menu Features Column Component
const MegaMenuFeatures = memo(({ features, onLinkClick }: {
  features: MegaMenuFeature[]
  onLinkClick: () => void
}) => (
  <div className="space-y-4">
    <h3 className="font-headline font-semibold text-[var(--aurora-deep-space)] mb-3 text-sm uppercase tracking-wide">
      Why Choose Us
    </h3>
    {features.map((feature) => (
      <div key={feature.id} className="flex items-start space-x-3 p-2">
        <div className="flex-shrink-0 text-[var(--aurora-pink)] mt-1">
          {feature.icon}
        </div>
        <div>
          <h4 className="font-medium text-[var(--aurora-deep-space)] text-sm mb-1">
            {feature.title}
          </h4>
          <p className="text-xs opacity-70 leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    ))}
  </div>
))

MegaMenuFeatures.displayName = 'MegaMenuFeatures'

// Main Aurora Mega Menu Component
export const AuroraMegaMenu = memo(({ 
  data, 
  isOpen, 
  onClose, 
  position = 'left' 
}: AuroraMegaMenuProps) => {
  if (!isOpen) return null

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose()
    }
  }

  // Position classes removed - now using fixed full-width centering

  return (
    <>
      {/* Skip link for accessibility */}
      <a 
        href="#mega-menu-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-[var(--aurora-nebula-purple)] focus:text-white focus:px-3 focus:py-2 focus:rounded focus:z-50"
      >
        Skip to navigation menu content
      </a>
      
      {/* Mega Menu Container - Responsive sizing */}
      <div 
        className={`
          absolute top-full mt-1 z-50 
          left-1/2 -translate-x-1/2 w-screen max-w-screen
          bg-white border border-[var(--aurora-lunar-grey)]/20
          rounded-xl
          animate-in slide-in-from-top-1 duration-150
          will-change-transform
          contain-layout contain-style contain-paint
        `}
        style={{
          boxShadow: '0 8px 24px rgba(107, 70, 193, 0.06), 0 2px 8px rgba(107, 70, 193, 0.04)',
          contain: 'layout paint'
        }}
        data-testid="mega-menu"
        role="menu"
        aria-label={`${data.label} navigation menu`}
        aria-describedby={`${data.id}-description`}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Full-Width Content Wrapper - Maintains readable content width */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
        <header className="mb-8 pb-6 border-b border-gradient-to-r from-[var(--aurora-lunar-grey)]/20 via-[var(--aurora-nebula-purple)]/10 to-[var(--aurora-lunar-grey)]/20">
          <div className="relative">
            <h2 className="font-headline font-bold text-2xl md:text-3xl text-[var(--aurora-deep-space)] mb-2 tracking-tight">
              {data.label}
            </h2>
            <div className="absolute -left-2 top-0 w-1 h-8 bg-gradient-to-b from-[var(--aurora-nebula-purple)] to-[var(--aurora-pink)] rounded-full opacity-80"></div>
          </div>
          <p className="text-base text-[var(--aurora-deep-space)]/70 font-light leading-relaxed" id={`${data.id}-description`}>
            {data.description}
          </p>
        </header>

        {/* Main Content Grid - Responsive: 4-col desktop, 3-col tablet, 1-col mobile */}
        <div 
          id="mega-menu-content"
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
          data-testid="mega-menu-columns"
          role="group"
          aria-label="Navigation menu sections"
        >
          {/* Column 1: Categories */}
          <nav className="space-y-6" aria-label="Product categories">
            <MegaMenuCategoryColumn 
              categories={data.categories} 
              onLinkClick={onClose}
            />
            
            {/* Quick Links */}
            {data.quickLinks.length > 0 && (
              <div className="pt-4 border-t border-[var(--aurora-lunar-grey)]">
                <h4 className="font-medium text-[var(--aurora-deep-space)] mb-2 text-xs uppercase tracking-wide">
                  Quick Access
                </h4>
                <div className="space-y-1">
                  {data.quickLinks.map((link) => (
                    <Link
                      key={link.id}
                      href={link.href}
                      onClick={onClose}
                      className="
                        block text-sm text-[var(--aurora-deep-space)] hover:text-[var(--aurora-nebula-purple)] 
                        focus:text-[var(--aurora-nebula-purple)] transition-colors py-1
                        focus:outline-none focus:ring-2 focus:ring-[var(--aurora-nebula-purple)] focus:ring-offset-2 rounded
                      "
                      role="menuitem"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* Column 2: Popular Styles & Materials (James Allen-inspired) */}
          <section className="space-y-6" aria-labelledby="popular-styles-heading">
            <div className="space-y-4" role="group" aria-labelledby="popular-styles-heading">
              <div className="relative">
                <h3 id="popular-styles-heading" className="font-headline font-bold text-base text-[var(--aurora-deep-space)] mb-1 tracking-tight">
                  Popular Styles
                </h3>
                <div className="w-14 h-0.5 bg-gradient-to-r from-[var(--aurora-emerald-flash)] to-[var(--aurora-nebula-purple)] rounded-full"></div>
              </div>
              {/* Dynamic popular styles based on category */}
              {data.categories.slice(0, 3).map((category) => (
                <Link
                  key={`popular-${category.id}`}
                  href={category.href}
                  onClick={onClose}
                  className="
                    group flex items-center justify-between p-3 rounded-xl transition-all duration-150
                    hover:bg-gradient-to-r hover:from-[var(--aurora-emerald-flash)]/5 hover:to-[var(--aurora-nebula-purple)]/5
                    hover:translate-x-1
                    focus:bg-gradient-to-r focus:from-[var(--aurora-emerald-flash)]/5 focus:to-[var(--aurora-nebula-purple)]/5
                    focus:outline-none focus:ring-2 focus:ring-[var(--aurora-nebula-purple)]/30 focus:ring-offset-2
                    border border-transparent hover:border-[var(--aurora-emerald-flash)]/10
                  "
                  role="menuitem"
                  aria-label={`Popular style: ${category.label}`}
                >
                  <div className="flex items-center space-x-2">
                    {category.icon && (
                      <span className="text-[var(--aurora-nebula-purple)] group-hover:text-[var(--aurora-pink)] transition-colors duration-150 opacity-60">
                        {category.icon}
                      </span>
                    )}
                    <span className="text-sm font-medium text-[var(--aurora-deep-space)] group-hover:text-[var(--aurora-nebula-purple)] transition-colors duration-150">
                      {category.label}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--aurora-deep-space)] opacity-40 group-hover:opacity-60 transition-opacity duration-150">
                    →
                  </span>
                </Link>
              ))}
            </div>
            
            {/* Material Information */}
            <div className="pt-4 border-t border-[var(--aurora-lunar-grey)]" role="group" aria-labelledby="materials-heading">
              <h4 id="materials-heading" className="font-medium text-[var(--aurora-deep-space)] mb-3 text-sm uppercase tracking-wide">
                Materials
              </h4>
              <div className="space-y-2" role="list" aria-label="Available materials">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--aurora-lunar-grey)]/50" role="listitem">
                  <span className="text-sm font-medium text-[var(--aurora-deep-space)]">18K Gold</span>
                  <span className="text-xs text-[var(--aurora-nebula-purple)] font-medium">Most Popular</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--aurora-lunar-grey)]/30 transition-colors" role="listitem">
                  <span className="text-sm text-[var(--aurora-deep-space)]">Platinum</span>
                  <span className="text-xs text-[var(--aurora-deep-space)] opacity-70">Premium</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--aurora-lunar-grey)]/30 transition-colors" role="listitem">
                  <span className="text-sm text-[var(--aurora-deep-space)]">Lab Diamonds</span>
                  <span className="text-xs text-[var(--aurora-emerald-flash)] font-medium">Ethical</span>
                </div>
              </div>
            </div>
          </section>

          {/* Column 3-4: Product Showcase - Responsive spanning */}
          <section className="col-span-1 md:col-span-2 lg:col-span-2" aria-labelledby="featured-products-heading">
            <MegaMenuShowcase 
              products={data.featuredProducts} 
              onLinkClick={onClose}
            />
            
            {/* CTA Section */}
            <div className="mt-8 pt-6 border-t border-gradient-to-r from-transparent via-[var(--aurora-nebula-purple)]/20 to-transparent" role="group" aria-label="Category actions">
              <Link
                href={data.href}
                onClick={onClose}
                className="
                  inline-flex items-center space-x-3 px-6 py-3 rounded-2xl
                  bg-gradient-to-r from-[var(--aurora-nebula-purple)] to-[var(--aurora-plum)]
                  text-white font-semibold text-sm tracking-wide
                  hover:from-[var(--aurora-plum)] hover:to-[var(--aurora-pink)]
                  hover:shadow-md hover:shadow-[var(--aurora-nebula-purple)]/15
                  focus:from-[var(--aurora-plum)] focus:to-[var(--aurora-pink)]
                  transition-all duration-150 transform
                  focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[var(--aurora-nebula-purple)]
                  group relative overflow-hidden
                "
                role="button"
                aria-label={`View all ${data.label} products`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative z-10">View All {data.label}</span>
                <Sparkles className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-150" />
              </Link>
            </div>
          </section>
        </div>

          {/* Features Section */}
          <footer className="mt-6 pt-6 border-t border-[var(--aurora-lunar-grey)]" role="contentinfo" aria-label="Brand features and benefits">
            <MegaMenuFeatures 
              features={data.features} 
              onLinkClick={onClose}
            />
          </footer>
        </div> {/* Close Full-Width Content Wrapper */}
      </div>
    </>
  )
})

AuroraMegaMenu.displayName = 'AuroraMegaMenu'

// Enhanced mega menu data structure inspired by James Allen patterns
export const createMegaMenuData = (categoryId: string): MegaMenuData => {
  const baseData = {
    rings: {
      label: 'Rings',
      description: 'Discover our collection of ethically crafted rings, from engagement to everyday elegance.',
      categories: [
        { id: 'engagement', label: 'Engagement Rings', href: '/catalog?category=rings&type=engagement', description: 'Lab-grown diamond solitaires & settings', icon: <Heart className="w-4 h-4" /> },
        { id: 'wedding', label: 'Wedding Bands', href: '/catalog?category=rings&type=wedding', description: 'Classic & modern matching bands', icon: <Star className="w-4 h-4" /> },
        { id: 'fashion', label: 'Fashion Rings', href: '/catalog?category=rings&type=fashion', description: 'Statement rings & everyday elegance', icon: <Sparkles className="w-4 h-4" /> },
        { id: 'men', label: 'Men\'s Rings', href: '/catalog?category=rings&gender=men', description: 'Sophisticated masculine designs', icon: <Award className="w-4 h-4" /> },
        { id: 'stackable', label: 'Stackable Rings', href: '/catalog?category=rings&type=stackable', description: 'Mix & match ring collections', icon: <Sparkles className="w-4 h-4" /> },
        { id: 'vintage', label: 'Vintage Inspired', href: '/catalog?category=rings&style=vintage', description: 'Art deco & heritage designs', icon: <Star className="w-4 h-4" /> },
        { id: 'custom', label: 'Custom Design', href: '/customizer?category=rings', description: 'Create your unique piece', icon: <Award className="w-4 h-4" /> }
      ],
      featuredProducts: [
        { id: '1', name: 'Classic Solitaire 1.5ct', price: '$1,299', image: '/glitchglow_logo_empty_gold.png', href: '/products/classic-solitaire', badge: 'Bestseller' },
        { id: '2', name: 'Modern Band Set', price: '$899', image: '/glitchglow_logo_empty_gold.png', href: '/products/modern-band', badge: 'New' },
        { id: '3', name: 'Custom Engagement', price: 'From $999', image: '/glitchglow_logo_empty_gold.png', href: '/customizer?template=engagement' }
      ],
      quickLinks: [
        { id: 'sizing', label: 'Ring Sizing Guide', href: '/sizing' },
        { id: 'care', label: 'Care Instructions', href: '/care' },
        { id: 'returns', label: '60-Day Returns', href: '/returns' },
        { id: 'warranty', label: 'Lifetime Warranty', href: '/warranty' }
      ]
    },
    necklaces: {
      label: 'Necklaces',
      description: 'Elegant chains, pendants, and statement pieces crafted with ethical materials.',
      categories: [
        { id: 'pendants', label: 'Pendant Necklaces', href: '/catalog?category=necklaces&type=pendants', description: 'Diamond & gemstone pendants', icon: <Sparkles className="w-4 h-4" /> },
        { id: 'chains', label: 'Chain Necklaces', href: '/catalog?category=necklaces&type=chains', description: 'Gold, silver & platinum chains', icon: <Star className="w-4 h-4" /> },
        { id: 'chokers', label: 'Chokers', href: '/catalog?category=necklaces&type=chokers', description: 'Contemporary choker designs', icon: <Heart className="w-4 h-4" /> },
        { id: 'layered', label: 'Layered Sets', href: '/catalog?category=necklaces&type=layered', description: 'Multi-strand necklace collections', icon: <Sparkles className="w-4 h-4" /> },
        { id: 'statement', label: 'Statement Pieces', href: '/catalog?category=necklaces&type=statement', description: 'Bold & dramatic designs', icon: <Award className="w-4 h-4" /> },
        { id: 'everyday', label: 'Everyday Elegance', href: '/catalog?category=necklaces&type=everyday', description: 'Simple & versatile pieces', icon: <Star className="w-4 h-4" /> }
      ],
      featuredProducts: [
        { id: '1', name: 'Diamond Pendant', price: '$899', image: '/glitchglow_logo_empty_gold.png', href: '/products/diamond-pendant', badge: 'New' },
        { id: '2', name: 'Gold Chain 18"', price: '$699', image: '/glitchglow_logo_empty_gold.png', href: '/products/gold-chain' },
        { id: '3', name: 'Custom Pendant', price: 'From $399', image: '/glitchglow_logo_empty_gold.png', href: '/customizer?template=pendant' }
      ],
      quickLinks: [
        { id: 'length-guide', label: 'Length Guide', href: '/sizing#necklaces' },
        { id: 'care', label: 'Care Instructions', href: '/care' },
        { id: 'metal-guide', label: 'Metal Guide', href: '/materials' },
        { id: 'engraving', label: 'Engraving Service', href: '/services/engraving' }
      ]
    },
    earrings: {
      label: 'Earrings',
      description: 'Stunning studs, hoops, and statement earrings for every occasion.',
      categories: [
        { id: 'studs', label: 'Stud Earrings', href: '/catalog?category=earrings&type=studs', description: 'Diamond & gemstone studs', icon: <Star className="w-4 h-4" /> },
        { id: 'hoops', label: 'Hoop Earrings', href: '/catalog?category=earrings&type=hoops', description: 'Classic to statement hoops', icon: <Sparkles className="w-4 h-4" /> },
        { id: 'drops', label: 'Drop Earrings', href: '/catalog?category=earrings&type=drops', description: 'Elegant hanging designs', icon: <Heart className="w-4 h-4" /> },
        { id: 'chandelier', label: 'Chandelier Earrings', href: '/catalog?category=earrings&type=chandelier', description: 'Dramatic statement pieces', icon: <Award className="w-4 h-4" /> },
        { id: 'huggie', label: 'Huggie Earrings', href: '/catalog?category=earrings&type=huggie', description: 'Close-fitting hoop styles', icon: <Sparkles className="w-4 h-4" /> },
        { id: 'climber', label: 'Ear Climbers', href: '/catalog?category=earrings&type=climber', description: 'Modern ascending designs', icon: <Star className="w-4 h-4" /> }
      ],
      featuredProducts: [
        { id: '1', name: 'Diamond Studs', price: '$599', image: '/glitchglow_logo_empty_gold.png', href: '/products/diamond-studs', badge: 'Bestseller' },
        { id: '2', name: 'Gold Hoops', price: '$399', image: '/glitchglow_logo_empty_gold.png', href: '/products/gold-hoops' },
        { id: '3', name: 'Custom Studs', price: 'From $299', image: '/glitchglow_logo_empty_gold.png', href: '/customizer?template=studs' }
      ],
      quickLinks: [
        { id: 'care', label: 'Care Instructions', href: '/care' },
        { id: 'sizing', label: 'Fit Guide', href: '/sizing#earrings' },
        { id: 'piercing', label: 'Piercing Guide', href: '/guides/piercing' },
        { id: 'backs', label: 'Earring Backs', href: '/accessories/earring-backs' }
      ]
    },
    customizer: {
      label: 'Customize',
      description: 'Design your perfect piece with our advanced 3D customizer.',
      categories: [
        { id: 'rings', label: 'Design Your Ring', href: '/customizer?category=rings', description: 'Create your perfect ring', icon: <Sparkles className="w-4 h-4" /> },
        { id: 'necklaces', label: 'Design Necklaces', href: '/customizer?category=necklaces', description: 'Custom pendants & chains', icon: <Heart className="w-4 h-4" /> },
        { id: 'earrings', label: 'Design Earrings', href: '/customizer?category=earrings', description: 'Custom studs & drops', icon: <Star className="w-4 h-4" /> },
        { id: 'materials', label: 'Choose Materials', href: '/customizer#materials', description: 'Lab diamonds & precious metals', icon: <Award className="w-4 h-4" /> },
        { id: 'settings', label: 'Ring Settings', href: '/customizer?type=settings', description: 'Solitaire, halo & vintage styles', icon: <Sparkles className="w-4 h-4" /> },
        { id: 'preview', label: '3D Preview', href: '/customizer#preview', description: 'See your design in 360°', icon: <Star className="w-4 h-4" /> }
      ],
      featuredProducts: [
        { id: '1', name: 'Custom Ring', price: 'From $999', image: '/glitchglow_logo_empty_gold.png', href: '/customizer?template=solitaire', badge: 'Popular' },
        { id: '2', name: 'Custom Pendant', price: 'From $399', image: '/glitchglow_logo_empty_gold.png', href: '/customizer?template=pendant' },
        { id: '3', name: 'Custom Earrings', price: 'From $299', image: '/glitchglow_logo_empty_gold.png', href: '/customizer?template=studs' }
      ],
      quickLinks: [
        { id: 'guide', label: 'Design Guide', href: '/customizer/guide' },
        { id: 'materials', label: 'Material Guide', href: '/customizer/materials' },
        { id: 'consultation', label: 'Free Consultation', href: '/services/consultation' },
        { id: 'gallery', label: 'Design Gallery', href: '/gallery' }
      ]
    }
  }

  const defaultFeatures = [
    { id: '1', title: 'Lab-Grown Diamonds', description: 'Ethically sourced, conflict-free diamonds', icon: <Sparkles className="w-4 h-4" /> },
    { id: '2', title: 'Lifetime Warranty', description: 'Comprehensive coverage for your investment', icon: <Award className="w-4 h-4" /> },
    { id: '3', title: 'Free Resizing', description: 'Perfect fit guarantee within 60 days', icon: <Star className="w-4 h-4" /> }
  ]

  return {
    id: categoryId,
    href: `/catalog?category=${categoryId}`,
    features: defaultFeatures,
    ...(baseData[categoryId as keyof typeof baseData] || baseData.rings)
  }
}

export default AuroraMegaMenu