'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  Menu,
  User,
  Sparkles,
  Star,
  Package,
  Shield,
  Award,
  ChevronDown
} from 'lucide-react'

interface LuxuryHeaderProps {
  onMegaMenuOpen: (category: string | null) => void
  onMobileMenuOpen: () => void
}

export function LuxuryHeader({ onMegaMenuOpen, onMobileMenuOpen }: LuxuryHeaderProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [cartCount, setCartCount] = useState(2)
  const [wishlistCount, setWishlistCount] = useState(5)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Maintain current navigation hierarchy with value-focused icons
  const navigationCategories = [
    { 
      name: 'Rings', 
      href: '/rings', 
      subcategories: ['Engagement', 'Wedding', 'Fashion', 'Men\'s'],
      featured: 'New: Lab Diamond Solitaires',
      icon: '✨'
    },
    { 
      name: 'Necklaces', 
      href: '/necklaces', 
      subcategories: ['Pendants', 'Chains', 'Chokers', 'Statement'],
      featured: 'Trending: Layered Sets',
      icon: '🎨'
    },
    { 
      name: 'Earrings', 
      href: '/earrings', 
      subcategories: ['Studs', 'Hoops', 'Drop', 'Climbers'],
      featured: 'Bestseller: Diamond Studs',
      icon: '💎'
    },
    { 
      name: 'Bracelets', 
      href: '/bracelets', 
      subcategories: ['Tennis', 'Chain', 'Cuff', 'Charm'],
      featured: 'Popular: Tennis Bracelets',
      icon: '🌱'
    },
    { 
      name: 'Sustainability', 
      href: '/sustainability',
      subcategories: [],
      featured: 'Our Commitment',
      icon: '♻️'
    }
  ]

  const handleCategoryHover = (category: string) => {
    setHoveredCategory(category)
    onMegaMenuOpen(category)
  }

  const handleMouseLeave = () => {
    setHoveredCategory(null)
    onMegaMenuOpen(null)
  }

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-foreground text-background">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              <span>Free Shipping on Orders $500+</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Lifetime Warranty</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <Award className="w-3 h-3" />
              <span>Certified Lab Diamonds</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              <span>4.9/5 from 12,000+ Reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header 
        className={cn(
          "sticky top-0 z-50 bg-background transition-all duration-300",
          scrolled ? "shadow-lg py-2" : "py-4"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onMobileMenuOpen}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-headline text-foreground">
                  GlowGlitch
                </h1>
                <p className="text-xs text-gray-600 tracking-widest uppercase font-body">Luxury Jewelry</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav 
              className="hidden md:flex items-center space-x-1"
              onMouseLeave={handleMouseLeave}
            >
              {navigationCategories.map((category) => (
                <div
                  key={category.name}
                  className="relative"
                  onMouseEnter={() => handleCategoryHover(category.name)}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "px-4 py-2 rounded-none border-b-2 transition-all duration-200",
                      hoveredCategory === category.name
                        ? "border-accent text-accent bg-muted"
                        : "border-transparent hover:text-accent"
                    )}
                  >
                    <span className="text-sm font-medium tracking-wide">
                      {category.name.toUpperCase()}
                    </span>
                    <ChevronDown className={cn(
                      "ml-1 h-3 w-3 transition-transform duration-200",
                      hoveredCategory === category.name && "rotate-180"
                    )} />
                  </Button>
                  
                  {/* Featured Badge */}
                  {hoveredCategory === category.name && category.featured && (
                    <div className="absolute top-full left-0 mt-2 z-10">
                      <Badge className="bg-accent text-foreground text-xs whitespace-nowrap">
                        {category.featured}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-muted hover:text-accent"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Account */}
              <Button 
                variant="ghost" 
                size="icon"
                className="hidden md:flex hover:bg-muted hover:text-accent"
              >
                <User className="h-5 w-5" />
              </Button>

              {/* Wishlist */}
              <Button 
                variant="ghost" 
                size="icon"
                className="relative hover:bg-muted hover:text-accent"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-cta text-background"
                  >
                    {wishlistCount}
                  </Badge>
                )}
              </Button>

              {/* Cart */}
              <Button 
                variant="ghost" 
                size="icon"
                className="relative hover:bg-muted hover:text-accent"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-accent text-foreground"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>

              {/* CTA Button */}
              <Button 
                variant="primary"
                className="hidden md:flex"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Design Custom
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}