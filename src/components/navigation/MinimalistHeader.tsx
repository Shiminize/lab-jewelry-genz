'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, User, Heart, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface MinimalistHeaderProps {
  className?: string
}

const minimalistNavigation = [
  {
    name: 'Moissanite',
    href: '/collections/moissanite',
    description: 'Our signature sustainable luxury',
    badge: 'Popular'
  },
  {
    name: 'Custom Design',
    href: '/customizer',
    description: '3D jewelry customization',
    badge: 'New'
  },
  {
    name: 'Collections',
    href: '/collections',
    description: 'Curated jewelry lines'
  },
  {
    name: 'Creators',
    href: '/creators',
    description: 'Join our creator program'
  }
]

export function MinimalistHeader({ className }: MinimalistHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  
  const cartItemCount = 0 // TODO: Connect to cart state
  const wishlistCount = 0 // TODO: Connect to wishlist state

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b border-gray-100',
      className
    )}>
      {/* Value Proposition Banner */}
      <div className="bg-gradient-to-r from-cta/5 to-accent/5 border-b border-cta/10">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2 text-foreground bg-background">
              <Sparkles className="w-4 h-4 text-cta" />
              <span className="font-medium">Moissanite: 2.5x brighter than diamonds</span>
            </div>
            <div className="text-gray-600 bg-background">70% more affordable</div>
            <div className="text-gray-600 bg-background">90% more sustainable</div>
            <Link
              href="/learn-more"
              className="text-cta bg-background hover:text-cta-hover font-medium underline decoration-dotted underline-offset-2 transition-colors"
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-cta to-accent rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-background" />
              </div>
              <span className="font-headline font-bold text-xl text-foreground bg-background group-hover:text-cta transition-colors">
                GlowGlitch
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8" role="navigation">
            {minimalistNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group relative py-2"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-foreground bg-background font-medium group-hover:text-cta transition-colors">
                    {item.name}
                  </span>
                  {item.badge && (
                    <span className="text-xs bg-cta/10 text-cta px-2 py-0.5 rounded-full font-medium">
                      {item.badge}
                    </span>
                  )}
                </div>
                
                {/* Hover tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-foreground text-background text-xs px-3 py-1 rounded-lg whitespace-nowrap">
                    {item.description}
                  </div>
                </div>
              </Link>
            ))}
          </nav>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:block flex-1 max-w-sm mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="search"
                placeholder="Search Moissanite, Silver..."
                className="pl-10 pr-4 bg-muted border-0 rounded-xl focus:ring-2 focus:ring-cta focus:ring-offset-2"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search size={20} />
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist">
                <div className="relative">
                  <Heart size={20} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-cta text-background text-xs font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </div>
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart">
                <div className="relative">
                  <ShoppingCart size={20} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-cta text-background text-xs font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </span>
                  )}
                </div>
              </Link>
            </Button>

            {/* Account */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/account">
                <User size={20} />
              </Link>
            </Button>

            {/* CTA Button */}
            <Button variant="primary" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/customizer">
                <Sparkles className="w-4 h-4 mr-2" />
                Design Now
              </Link>
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="lg:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="search"
                placeholder="Search Moissanite, Silver..."
                className="pl-10 pr-4"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      <div className="lg:hidden border-t border-gray-100 bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            {minimalistNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-cta/20 hover:bg-cta/5 transition-all"
              >
                <div>
                  <div className="font-medium text-foreground bg-background">{item.name}</div>
                  <div className="text-xs text-gray-600 bg-background">{item.description}</div>
                </div>
                {item.badge && (
                  <span className="text-xs bg-cta/10 text-cta px-2 py-0.5 rounded-full font-medium">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}