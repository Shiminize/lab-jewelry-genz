'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, User, Heart, Sparkles, Calculator, TrendingUp, Clock, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface MinimalistNavOption1Props {
  className?: string
}

export function MinimalistNavOption1({ className }: MinimalistNavOption1Props) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  
  const cartItemCount = 0
  const wishlistCount = 0

  // Calculate savings for display
  const moissaniteSavings = "70%"
  const averagePrice = "$299"

  return (
    <header className={cn('sticky top-0 z-50 w-full bg-background border-b border-gray-100', className)}>
      {/* Top Banner - Moissanite Value Proposition */}
      <div className="bg-gradient-to-r from-cta/10 via-accent/5 to-cta/10 border-b border-cta/20">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center space-x-4 text-sm">
            <Sparkles className="w-4 h-4 text-cta animate-pulse" />
            <span className="text-foreground bg-background font-medium">
              Moissanite + 925 Silver from {averagePrice}
            </span>
            <span className="text-gray-600 bg-background hidden sm:inline">
              Save {moissaniteSavings} vs traditional diamonds
            </span>
            <button className="text-cta bg-background hover:text-cta-hover font-medium underline underline-offset-2">
              See savings calculator
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-cta to-accent rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-background" />
            </div>
            <span className="font-headline font-bold text-xl text-foreground bg-background">
              GlowGlitch
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {/* Moissanite + 925 Silver - PRIMARY */}
            <div 
              className="relative"
              onMouseEnter={() => setHoveredItem('moissanite')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link href="/collections/moissanite-silver" className="group flex items-center space-x-2 py-2">
                <span className="text-foreground bg-background font-semibold group-hover:text-cta transition-colors">
                  Moissanite + 925 Silver
                </span>
                <span className="bg-cta text-background text-xs px-2 py-0.5 rounded-full font-medium">
                  Best Value
                </span>
              </Link>
              
              {/* Mega Menu Dropdown */}
              {hoveredItem === 'moissanite' && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <h3 className="text-foreground bg-white font-semibold">Why Moissanite?</h3>
                      <Calculator className="w-4 h-4 text-cta" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <div className="text-cta bg-white font-bold text-lg">2.5x</div>
                        <div className="text-gray-600 bg-white">More Brilliant</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-cta bg-white font-bold text-lg">$299+</div>
                        <div className="text-gray-600 bg-white">Starting Price</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-accent bg-white font-bold text-lg">90%</div>
                        <div className="text-gray-600 bg-white">More Sustainable</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-accent bg-white font-bold text-lg">925</div>
                        <div className="text-gray-600 bg-white">Premium Silver</div>
                      </div>
                    </div>
                    <Link href="/moissanite-calculator" className="block w-full">
                      <Button variant="primary" size="sm" className="w-full">
                        Calculate Your Savings
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 3D Designer */}
            <div 
              className="relative"
              onMouseEnter={() => setHoveredItem('designer')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link href="/customizer" className="group flex items-center space-x-2 py-2">
                <span className="text-foreground bg-background font-medium group-hover:text-cta transition-colors">
                  3D Designer
                </span>
                <span className="bg-accent/10 text-accent text-xs px-2 py-0.5 rounded-full font-medium">
                  Try Now
                </span>
              </Link>
              
              {hoveredItem === 'designer' && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                  <div className="space-y-3">
                    <h3 className="text-foreground bg-white font-semibold">Design in 30 seconds</h3>
                    <p className="text-gray-600 bg-white text-sm">
                      Create your perfect piece with our industry-leading 3D customizer
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white">
                      <Clock className="w-4 h-4" />
                      <span>Average design time: 3 minutes</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Ready to Ship */}
            <Link href="/ready-to-ship" className="group flex items-center space-x-2 py-2">
              <span className="text-foreground bg-background font-medium group-hover:text-cta transition-colors">
                Ready to Ship
              </span>
              <span className="text-xs text-gray-600 bg-background">24-48hr</span>
            </Link>

            {/* Creator Picks */}
            <div 
              className="relative"
              onMouseEnter={() => setHoveredItem('creators')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link href="/creator-picks" className="group flex items-center space-x-2 py-2">
                <span className="text-foreground bg-background font-medium group-hover:text-cta transition-colors">
                  Creator Picks
                </span>
              </Link>
              
              {hoveredItem === 'creators' && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                  <div className="space-y-3">
                    <h3 className="text-foreground bg-white font-semibold">Creator-Designed Moissanite</h3>
                    <p className="text-gray-600 bg-white text-sm">
                      Exclusive designs from our top creators. 30% commission disclosed.
                    </p>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-cta" />
                      <span className="text-sm text-cta bg-white font-medium">
                        Maya earned $2,400 last month
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sustainability */}
            <Link href="/sustainability" className="group flex items-center space-x-2 py-2">
              <span className="text-foreground bg-background font-medium group-hover:text-cta transition-colors">
                Sustainability
              </span>
            </Link>
          </nav>

          {/* Search (Desktop) */}
          <div className="hidden lg:block max-w-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="search"
                placeholder="Search Moissanite..."
                className="pl-10 pr-4 bg-muted border-0 rounded-xl h-9"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>

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
                    <span className="absolute -top-1 -right-1 bg-cta text-background text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {wishlistCount}
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
                    <span className="absolute -top-1 -right-1 bg-cta text-background text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </div>
              </Link>
            </Button>

            {/* Account */}
            <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
              <Link href="/account">
                <User size={20} />
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
                placeholder="Search Moissanite..."
                className="pl-10 pr-4"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background border-t border-gray-100">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {/* Moissanite CTA - Mobile Priority */}
            <Link href="/collections/moissanite-silver" className="block">
              <div className="bg-gradient-to-r from-cta/10 to-accent/10 rounded-xl p-4 border border-cta/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-foreground bg-background font-semibold">Moissanite + 925 Silver</h3>
                    <p className="text-sm text-gray-600 bg-background mt-1">From $299 • Save 70%</p>
                  </div>
                  <span className="bg-cta text-background text-xs px-3 py-1 rounded-full font-medium">
                    Best Value
                  </span>
                </div>
              </div>
            </Link>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/customizer" className="bg-white rounded-lg p-3 border border-gray-100">
                <div className="text-foreground bg-white font-medium">3D Designer</div>
                <div className="text-xs text-gray-600 bg-white mt-1">Design in 30 sec</div>
              </Link>
              <Link href="/ready-to-ship" className="bg-white rounded-lg p-3 border border-gray-100">
                <div className="text-foreground bg-white font-medium">Ready to Ship</div>
                <div className="text-xs text-gray-600 bg-white mt-1">24-48hr delivery</div>
              </Link>
            </div>

            {/* Other Links */}
            <div className="space-y-2 pt-2">
              <Link href="/creator-picks" className="block py-2 text-foreground bg-background">
                Creator Picks
              </Link>
              <Link href="/sustainability" className="block py-2 text-foreground bg-background">
                Sustainability
              </Link>
              <Link href="/account" className="block py-2 text-foreground bg-background">
                My Account
              </Link>
            </div>

            {/* Mobile-Only: Live Purchase Feed */}
            <div className="bg-muted rounded-lg p-3 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-600 bg-muted">
                  Sarah just purchased Moissanite Solitaire Ring
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}