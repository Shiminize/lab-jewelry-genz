'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, User, Heart, Sparkles, Brain, TrendingUp, Award, BarChart3, Menu, X, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface MinimalistNavOption3Props {
  className?: string
}

interface SmartRecommendation {
  product: string
  savings: string
  match: number
}

export function MinimalistNavOption3({ className }: MinimalistNavOption3Props) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [userBehavior, setUserBehavior] = useState<'value' | 'luxury' | 'sustainable'>('value')
  const [dynamicPrice, setDynamicPrice] = useState(299)
  
  const cartItemCount = 0
  const wishlistCount = 0

  // Simulate dynamic pricing based on inventory
  useEffect(() => {
    const interval = setInterval(() => {
      setDynamicPrice(prev => {
        const change = Math.random() * 20 - 10
        return Math.max(289, Math.min(309, prev + change))
      })
    }, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  // Smart recommendations based on user behavior
  const smartRecommendations: SmartRecommendation[] = userBehavior === 'value' ? [
    { product: "Moissanite Solitaire", savings: "$3,201", match: 98 },
    { product: "925 Silver Band", savings: "$450", match: 94 },
    { product: "Lab Diamond Studs", savings: "$1,800", match: 89 }
  ] : userBehavior === 'luxury' ? [
    { product: "3ct Moissanite Halo", savings: "$8,500", match: 96 },
    { product: "Rose Gold 925 Set", savings: "$2,100", match: 92 },
    { product: "Designer Collection", savings: "$5,400", match: 88 }
  ] : [
    { product: "Eco Moissanite Ring", savings: "90% less CO₂", match: 99 },
    { product: "Recycled Silver Band", savings: "100% sustainable", match: 95 },
    { product: "Carbon Neutral Set", savings: "Zero footprint", match: 91 }
  ]

  return (
    <header className={cn('sticky top-0 z-50 w-full bg-background border-b border-border', className)}>
      {/* Smart Value Banner - Adaptive Content */}
      <div className="bg-gradient-to-r from-blue-50 via-green-50 to-blue-50 border-b border-blue-100">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center space-x-4 text-sm">
            <Brain className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="text-foreground bg-background font-medium">
              AI recommends: Moissanite for {userBehavior === 'value' ? 'best value' : userBehavior === 'luxury' ? 'premium quality' : 'sustainability'}
            </span>
            <span className="text-aurora-nav-muted bg-background hidden sm:inline">
              Dynamic pricing: ${dynamicPrice.toFixed(0)} (save ${(5000 - dynamicPrice).toFixed(0)})
            </span>
            <button 
              onClick={() => setUserBehavior(prev => prev === 'value' ? 'luxury' : prev === 'luxury' ? 'sustainable' : 'value')}
              className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2"
            >
              Personalize
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo with Smart Badge */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-background" />
            </div>
            <span className="font-headline font-bold text-xl text-foreground bg-background">
              GlowGlitch
            </span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              AI
            </span>
          </Link>

          {/* Desktop Navigation - Adaptive */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {/* Your Style - Personalized */}
            <div 
              className="relative"
              onMouseEnter={() => setHoveredItem('style')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link href="/your-style" className="group flex items-center space-x-2 py-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-foreground bg-background font-semibold group-hover:text-blue-600 transition-colors">
                  Your Style
                </span>
                <span className="bg-gradient-to-r from-blue-100 to-green-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {userBehavior === 'value' ? 'Value Hunter' : userBehavior === 'luxury' ? 'Premium' : 'Eco Warrior'}
                </span>
              </Link>
              
              {/* AI-Curated Dropdown */}
              {hoveredItem === 'style' && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-background rounded-xl shadow-lg border border-border p-4">
                  <div className="space-y-4">
                    <h3 className="text-foreground bg-background font-semibold flex items-center space-x-2">
                      <Brain className="w-4 h-4 text-blue-600" />
                      <span>AI-Curated for You</span>
                    </h3>
                    
                    {/* Smart Matches */}
                    <div className="space-y-2">
                      {smartRecommendations.map((rec, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                          <div>
                            <div className="text-sm font-medium text-foreground bg-background">{rec.product}</div>
                            <div className="text-xs text-aurora-nav-muted bg-background">Save {rec.savings}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-blue-600">{rec.match}%</div>
                            <div className="text-xs text-aurora-nav-muted">match</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button variant="primary" size="sm" className="w-full">
                      Take Style Quiz
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Smart Designer */}
            <div 
              className="relative"
              onMouseEnter={() => setHoveredItem('designer')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link href="/smart-designer" className="group flex items-center space-x-2 py-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-foreground bg-background font-medium group-hover:text-blue-600 transition-colors">
                  Smart Designer
                </span>
              </Link>
              
              {hoveredItem === 'designer' && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-background rounded-xl shadow-lg border border-border p-4">
                  <div className="space-y-3">
                    <h3 className="text-foreground bg-background font-semibold">Intelligent 3D Customizer</h3>
                    
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3">
                      <div className="text-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-aurora-nav-muted bg-background">Budget Optimizer</span>
                          <span className="font-medium text-foreground bg-background">ON</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-aurora-nav-muted bg-background">AI Suggestions</span>
                          <span className="text-green-600 font-medium">Active</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-aurora-nav-muted bg-background">Best Value Mode</span>
                          <span className="text-blue-600 font-medium">Moissanite</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-aurora-nav-muted bg-background">
                      AI steering toward Moissanite/925 for optimal value
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Value Vault */}
            <div 
              className="relative"
              onMouseEnter={() => setHoveredItem('vault')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link href="/value-vault" className="group flex items-center space-x-2 py-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-foreground bg-background font-medium group-hover:text-blue-600 transition-colors">
                  Value Vault
                </span>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium animate-pulse">
                  ${dynamicPrice}
                </span>
              </Link>
              
              {hoveredItem === 'vault' && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-background rounded-xl shadow-lg border border-border p-4">
                  <div className="space-y-4">
                    <h3 className="text-foreground bg-background font-semibold">Best Bang for Buck</h3>
                    
                    {/* Value Score System */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
                      <div className="text-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground bg-background">Moissanite Solitaire</span>
                          <div className="flex items-center space-x-1">
                            <BarChart3 className="w-4 h-4 text-green-600" />
                            <span className="font-bold text-green-600">98/100</span>
                          </div>
                        </div>
                        <div className="text-xs text-aurora-nav-muted bg-background">
                          Value Score • Save $3,201 vs diamond
                        </div>
                      </div>
                    </div>
                    
                    {/* Upgrade Path */}
                    <div className="text-sm">
                      <div className="text-aurora-nav-muted bg-background mb-2">Upgrade Path:</div>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="px-2 py-1 bg-muted rounded">925 Silver</span>
                        <span>→</span>
                        <span className="px-2 py-1 bg-yellow-100 rounded">Gold Plated</span>
                        <span>→</span>
                        <span className="px-2 py-1 bg-yellow-200 rounded">14k Gold</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Impact Dashboard */}
            <div 
              className="relative"
              onMouseEnter={() => setHoveredItem('impact')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link href="/impact" className="group flex items-center space-x-2 py-2">
                <Award className="w-4 h-4 text-purple-600" />
                <span className="text-foreground bg-background font-medium group-hover:text-blue-600 transition-colors">
                  Impact
                </span>
              </Link>
              
              {hoveredItem === 'impact' && (
                <div className="absolute top-full right-0 mt-1 w-72 bg-background rounded-xl shadow-lg border border-border p-4">
                  <div className="space-y-3">
                    <h3 className="text-foreground bg-background font-semibold">Your Impact Score</h3>
                    
                    <div className="text-center py-3">
                      <div className="text-3xl font-bold text-purple-600">847</div>
                      <div className="text-xs text-aurora-nav-muted bg-background">Impact Points</div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-aurora-nav-muted bg-background">CO₂ Saved</span>
                        <span className="font-medium text-green-600">2.3 tons</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-aurora-nav-muted bg-background">Water Saved</span>
                        <span className="font-medium text-blue-600">45,000 gal</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-aurora-nav-muted bg-background">Conscious Choices</span>
                        <span className="font-medium text-purple-600">12</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-center text-aurora-nav-muted bg-background pt-2 border-t border-border">
                      Moissanite purchases = 10x impact points
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Smart Search (Desktop) */}
          <div className="hidden lg:block max-w-xs">
            <div className="relative">
              <Brain className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 w-4 h-4" />
              <Input
                type="search"
                placeholder="AI search..."
                className="pl-10 pr-4 bg-gradient-to-r from-blue-50 to-green-50 border-0 rounded-xl h-9"
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

            {/* Value Score Badge */}
            <div className="hidden sm:flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-green-100 to-blue-100 rounded-full">
              <BarChart3 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-bold text-green-600">847</span>
            </div>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist">
                <div className="relative">
                  <Heart size={20} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-background text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </div>
              </Link>
            </Button>

            {/* Cart with Smart Badge */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart">
                <div className="relative">
                  <ShoppingCart size={20} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-background text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                  {/* AI Recommendation Badge */}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Adaptive Interface */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background">
          {/* Adaptive Header Based on User Behavior */}
          <div className={cn(
            "p-4 border-b",
            userBehavior === 'value' ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-100' :
            userBehavior === 'luxury' ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100' :
            'bg-gradient-to-r from-blue-50 to-green-50 border-blue-100'
          )}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-foreground bg-background font-semibold flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span>Smart Recommendations</span>
                </h3>
                <p className="text-sm text-aurora-nav-muted bg-background mt-1">
                  Based on your {userBehavior} preferences
                </p>
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setUserBehavior(prev => prev === 'value' ? 'luxury' : prev === 'luxury' ? 'sustainable' : 'value')}
              >
                Switch
              </Button>
            </div>
          </div>

          {/* Dynamic Quick Actions */}
          <div className="p-4 space-y-4">
            {/* Personalized Recommendations */}
            <div className="space-y-2">
              {smartRecommendations.slice(0, 2).map((rec, index) => (
                <Link key={index} href={`/product/${rec.product.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="bg-background rounded-lg border border-border p-3 flex items-center justify-between hover:border-blue-200 transition-colors">
                    <div>
                      <div className="font-medium text-foreground bg-background">{rec.product}</div>
                      <div className="text-xs text-aurora-nav-muted bg-background">
                        {userBehavior === 'sustainable' ? rec.savings : `Save ${rec.savings}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{rec.match}%</div>
                      <div className="text-xs text-aurora-nav-muted">match</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Smart Actions Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/smart-designer" className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-100">
                <Zap className="w-5 h-5 text-yellow-600 mb-1" />
                <div className="text-foreground bg-background font-medium text-sm">Smart Design</div>
                <div className="text-xs text-aurora-nav-muted bg-background">AI-powered</div>
              </Link>
              <Link href="/value-vault" className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-100">
                <TrendingUp className="w-5 h-5 text-green-600 mb-1" />
                <div className="text-foreground bg-background font-medium text-sm">Best Deals</div>
                <div className="text-xs text-aurora-nav-muted bg-background">${dynamicPrice} Moissanite</div>
              </Link>
            </div>

            {/* Impact Score */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground bg-background">Your Impact</div>
                  <div className="text-xs text-aurora-nav-muted bg-background mt-1">2.3 tons CO₂ saved</div>
                </div>
                <div className="text-2xl font-bold text-purple-600">847</div>
              </div>
            </div>

            {/* Gesture Hint */}
            <div className="text-center text-xs text-aurora-nav-muted pt-2">
              <span>Swipe left for more options →</span>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}