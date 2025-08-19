'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, User, Heart, Sparkles, PlayCircle, TrendingUp, Users, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface MinimalistNavOption2Props {
  className?: string
}

interface CreatorHighlight {
  name: string
  earnings: string
  avatar: string
  testimonial: string
}

const featuredCreator: CreatorHighlight = {
  name: "Maya Chen",
  earnings: "$2,400",
  avatar: "MC",
  testimonial: "Why I Choose Moissanite"
}

export function MinimalistNavOption2({ className }: MinimalistNavOption2Props) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  
  const cartItemCount = 0
  const wishlistCount = 0

  return (
    <header className={cn('sticky top-0 z-50 w-full bg-background border-b border-gray-100', className)}>
      {/* Creator Earnings Banner */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-b border-purple-100">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-cta to-accent rounded-full flex items-center justify-center text-xs text-background font-bold">
                {featuredCreator.avatar}
              </div>
              <span className="text-foreground bg-background font-medium">
                {featuredCreator.name} earned {featuredCreator.earnings} last month
              </span>
            </div>
            <span className="text-gray-600 bg-background hidden sm:inline">
              selling Moissanite designs
            </span>
            <Link href="/creator-program" className="text-cta bg-background hover:text-cta-hover font-medium underline underline-offset-2">
              Join creators
            </Link>
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
            {/* Creator Stories */}
            <div 
              className="relative"
              onMouseEnter={() => setHoveredItem('stories')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link href="/creator-stories" className="group flex items-center space-x-2 py-2">
                <Users className="w-4 h-4 text-cta" />
                <span className="text-foreground bg-background font-semibold group-hover:text-cta transition-colors">
                  Creator Stories
                </span>
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  Live
                </span>
              </Link>
              
              {/* Dropdown */}
              {hoveredItem === 'stories' && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                  <div className="space-y-4">
                    <h3 className="text-foreground bg-white font-semibold flex items-center space-x-2">
                      <PlayCircle className="w-4 h-4 text-cta" />
                      <span>Live Creator Content</span>
                    </h3>
                    
                    {/* Creator Testimonial */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 italic">
                        "{featuredCreator.testimonial}: Better brilliance, ethical choice, amazing commission!"
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-600 bg-background">- {featuredCreator.name}</span>
                        <span className="text-xs text-cta bg-background font-medium">View Story</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 bg-white">
                      <div className="flex items-center justify-between py-1">
                        <span>Active Creators</span>
                        <span className="font-bold text-foreground bg-white">1,247</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span>Moissanite Designs Sold</span>
                        <span className="font-bold text-foreground bg-white">50,000+</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Design Your Way */}
            <div 
              className="relative"
              onMouseEnter={() => setHoveredItem('design')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link href="/design-studio" className="group flex items-center space-x-2 py-2">
                <span className="text-foreground bg-background font-medium group-hover:text-cta transition-colors">
                  Design Your Way
                </span>
              </Link>
              
              {hoveredItem === 'design' && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                  <div className="space-y-3">
                    <h3 className="text-foreground bg-white font-semibold">Personalized 3D Experience</h3>
                    <div className="space-y-2">
                      <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm">
                        <div className="font-medium text-foreground bg-white">Style Quiz</div>
                        <div className="text-xs text-gray-600 bg-white">Get Moissanite recommendations</div>
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-lg bg-cta/10 border border-cta/20 text-sm">
                        <div className="font-medium text-cta bg-background">Most Popular</div>
                        <div className="text-xs text-gray-600 bg-background">Moissanite + Rose Gold 925</div>
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm">
                        <div className="font-medium text-foreground bg-white">Creator Tutorials</div>
                        <div className="text-xs text-gray-600 bg-white">Learn from the best</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Moissanite Lab */}
            <div 
              className="relative"
              onMouseEnter={() => setHoveredItem('lab')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link href="/moissanite-lab" className="group flex items-center space-x-2 py-2">
                <span className="text-foreground bg-background font-medium group-hover:text-cta transition-colors">
                  Moissanite Lab
                </span>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  Educational
                </span>
              </Link>
              
              {hoveredItem === 'lab' && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                  <div className="space-y-4">
                    <h3 className="text-foreground bg-white font-semibold">Scientific Comparison</h3>
                    
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="font-semibold text-foreground bg-background">Moissanite</div>
                          <div className="text-xs text-gray-600 bg-background mt-1">
                            • Brilliance: 2.65<br/>
                            • Fire: 0.104<br/>
                            • Price: $300/ct
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-400">Diamond</div>
                          <div className="text-xs text-gray-500 mt-1">
                            • Brilliance: 2.42<br/>
                            • Fire: 0.044<br/>
                            • Price: $5,000/ct
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Link href="/lab-reports" className="block">
                      <Button variant="secondary" size="sm" className="w-full">
                        View Lab Reports
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Trending Now */}
            <div 
              className="relative"
              onMouseEnter={() => setHoveredItem('trending')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link href="/trending" className="group flex items-center space-x-2 py-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span className="text-foreground bg-background font-medium group-hover:text-cta transition-colors">
                  Trending Now
                </span>
              </Link>
              
              {hoveredItem === 'trending' && (
                <div className="absolute top-full right-0 mt-1 w-72 bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                  <div className="space-y-3">
                    <h3 className="text-foreground bg-white font-semibold">Viral Designs</h3>
                    
                    {/* Live Purchase Notification */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600 bg-white">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>Emma purchased Moissanite Halo Ring</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 bg-white">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>Alex designed Custom Silver Band</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-600 bg-white">Most popular combo:</div>
                      <div className="font-medium text-cta bg-white">2ct Moissanite + 925 Silver</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Search (Desktop) */}
          <div className="hidden lg:block max-w-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="search"
                placeholder="Search creator designs..."
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

            {/* Creator Dashboard */}
            <Button variant="primary" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/creator-dashboard">
                <Users className="w-4 h-4 mr-2" />
                Creator Hub
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Stories Style */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background">
          {/* Creator Hero */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-purple-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cta to-accent rounded-full flex items-center justify-center text-background font-bold">
                {featuredCreator.avatar}
              </div>
              <div className="flex-1">
                <h3 className="text-foreground bg-background font-semibold">{featuredCreator.name}</h3>
                <p className="text-sm text-gray-600 bg-background">Earned {featuredCreator.earnings} with Moissanite</p>
              </div>
              <Button variant="primary" size="sm">Follow</Button>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="flex border-b border-gray-100">
            <button className="flex-1 py-3 text-center text-sm font-medium text-cta bg-background border-b-2 border-cta">
              Stories
            </button>
            <button className="flex-1 py-3 text-center text-sm font-medium text-gray-600 bg-background">
              3D Lab
            </button>
            <button className="flex-1 py-3 text-center text-sm font-medium text-gray-600 bg-background">
              Shop
            </button>
            <button className="flex-1 py-3 text-center text-sm font-medium text-gray-600 bg-background">
              About
            </button>
          </div>

          {/* Stories Feed */}
          <div className="p-4 space-y-4">
            {/* Creator Story Cards */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full" />
                <div className="flex-1">
                  <h4 className="text-foreground bg-white font-medium">Sarah's Moissanite Journey</h4>
                  <p className="text-sm text-gray-600 bg-white mt-1">
                    "Why I chose Moissanite over diamonds..."
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>2 hours ago</span>
                    <span>• 1.2k views</span>
                    <span>• $890 earned</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-green-400 rounded-full" />
                <div className="flex-1">
                  <h4 className="text-foreground bg-white font-medium">Design with Me Live</h4>
                  <p className="text-sm text-gray-600 bg-white mt-1">
                    "Creating a Moissanite engagement ring..."
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span className="text-red-500 font-medium">• LIVE</span>
                    <span>• 342 watching</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button variant="secondary" size="sm" className="w-full">
                Design with Creator
              </Button>
              <Button variant="primary" size="sm" className="w-full">
                Join Creators
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}