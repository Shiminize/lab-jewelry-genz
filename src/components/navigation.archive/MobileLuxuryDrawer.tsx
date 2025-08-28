'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { 
  X, 
  ChevronRight, 
  ChevronDown,
  Star,
  Heart,
  ShoppingCart,
  User,
  Search,
  Home,
  Sparkles,
  Package2,
  Award,
  Zap
} from 'lucide-react'

interface MobileLuxuryDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileLuxuryDrawer({ isOpen, onClose }: MobileLuxuryDrawerProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [cartCount] = useState(2)
  const [wishlistCount] = useState(5)

  // Maintain current navigation hierarchy with value-focused icons
  const navigationCategories = [
    { 
      name: 'Rings', 
      href: '/rings', 
      subcategories: ['Engagement', 'Wedding', 'Fashion', 'Men\'s'],
      featured: 'New: Lab Diamond Solitaires',
      icon: '✨',
      trending: true
    },
    { 
      name: 'Necklaces', 
      href: '/necklaces', 
      subcategories: ['Pendants', 'Chains', 'Chokers', 'Statement'],
      featured: 'Trending: Layered Sets',
      icon: '🎨',
      trending: false
    },
    { 
      name: 'Earrings', 
      href: '/earrings', 
      subcategories: ['Studs', 'Hoops', 'Drop', 'Climbers'],
      featured: 'Bestseller: Diamond Studs',
      icon: '💎',
      trending: true
    },
    { 
      name: 'Bracelets', 
      href: '/bracelets', 
      subcategories: ['Tennis', 'Chain', 'Cuff', 'Charm'],
      featured: 'Popular: Tennis Bracelets',
      icon: '🌱',
      trending: false
    },
    { 
      name: 'Sustainability', 
      href: '/sustainability',
      subcategories: [],
      featured: 'Our Commitment',
      icon: '♻️',
      trending: false
    }
  ]

  const quickActions = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Search', href: '/search' },
    { icon: Heart, label: 'Wishlist', href: '/wishlist', badge: wishlistCount },
    { icon: ShoppingCart, label: 'Cart', href: '/cart', badge: cartCount },
    { icon: User, label: 'Account', href: '/account' }
  ]

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute inset-y-0 left-0 w-full bg-white shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-starlight-gray">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-nebula-purple rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-headline text-deep-space">
                  GlowGlitch
                </h1>
                <p className="text-xs text-gray-600 tracking-wider uppercase font-body">Luxury Jewelry</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="p-4 bg-nebula-purple/10 border-b border-border">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center">
                <Package2 className="w-4 h-4 text-deep-space mb-1" />
                <span className="text-xs text-deep-space font-medium font-body">Free Ship $500+</span>
              </div>
              <div className="flex flex-col items-center">
                <Award className="w-4 h-4 text-deep-space mb-1" />
                <span className="text-xs text-deep-space font-medium font-body">Lifetime Warranty</span>
              </div>
              <div className="flex flex-col items-center">
                <Star className="w-4 h-4 text-deep-space mb-1 fill-current" />
                <span className="text-xs text-deep-space font-medium font-body">4.9/5 Reviews</span>
              </div>
            </div>
          </div>

          {/* Navigation Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-1">
              {navigationCategories.map((category) => (
                <Card key={category.name} className="border overflow-hidden">
                  <CardContent className="p-0">
                    <button
                      onClick={() => category.subcategories.length > 0 ? toggleCategory(category.name) : null}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-starlight-gray transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-xl">{category.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-deep-space tracking-wide font-body">
                              {category.name.toUpperCase()}
                            </span>
                            {category.trending && (
                              <Badge className="bg-nebula-purple text-white text-xs"
                                <Zap className="w-2 h-2 mr-1" />
                                Hot
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-nebula-purple font-medium font-body">
                            {category.featured}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform duration-200",
                        expandedCategory === category.name && "rotate-180"
                      )} />
                    </button>
                    
                    {/* Subcategories */}
                    {category.subcategories.length > 0 && expandedCategory === category.name && (
                      <div className="border-t border bg-muted">
                        {category.subcategories.map((subcategory) => (
                          <Link
                            key={subcategory}
                            href={`/${category.name.toLowerCase()}/${subcategory.toLowerCase()}`}
                            className="block px-8 py-3 text-sm text-aurora-nav-muted hover:text-accent hover:bg-muted transition-colors duration-200 flex items-center justify-between font-body"
                            onClick={onClose}
                          >
                            {subcategory}
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Featured Offers */}
            <div className="p-4 space-y-4">
              <h3 className="font-medium text-foreground mb-3 font-body">Special Offers</h3>
              
              <Card className="border bg-foreground">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-background font-body">Limited Time</h4>
                    <Badge className="bg-cta text-background text-xs">20% OFF</Badge>
                  </div>
                  <p className="text-sm text-background mb-3 font-body">
                    Save on all engagement rings
                  </p>
                  <Button variant="primary" size="sm" className="w-full">
                    Shop Sale
                  </Button>
                </CardContent>
              </Card>

              <Card className="border bg-accent">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground font-body">Custom Design</h4>
                    <Sparkles className="w-4 h-4 text-foreground" />
                  </div>
                  <p className="text-sm text-foreground mb-3 font-body">
                    Create your perfect piece
                  </p>
                  <Button variant="primary" size="sm" className="w-full">
                    Start Designing
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Why Choose Us */}
            <div className="p-4">
              <h3 className="font-medium text-foreground mb-3 font-body">Why Choose GlowGlitch</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-aurora-nav-muted font-body">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span>Ethically sourced lab diamonds</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-aurora-nav-muted font-body">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span>Free lifetime cleaning & inspection</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-aurora-nav-muted font-body">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span>30-day hassle-free returns</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-aurora-nav-muted font-body">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span>Custom design consultation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="border-t border bg-muted p-4">
            <div className="grid grid-cols-5 gap-1 mb-4">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-background transition-colors relative"
                    onClick={onClose}
                  >
                    <Icon className="w-5 h-5 text-aurora-nav-muted mb-1" />
                    <span className="text-xs text-aurora-nav-muted">{action.label}</span>
                    {action.badge && action.badge > 0 && (
                      <Badge 
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-accent text-foreground"
                      >
                        {action.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Main CTA */}
            <Button 
              variant="primary"
              className="w-full shadow-lg"
              onClick={onClose}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Explore Collection
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}