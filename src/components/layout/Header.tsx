'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  ShoppingCart, 
  User,
  Menu,
  Star,
  Package,
  Shield,
  Award,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { LuxuryMegaMenu } from '@/components/navigation/LuxuryMegaMenu'
import { SimpleMobileDrawer } from '@/components/navigation/SimpleMobileDrawer'
import { WishlistButton } from '@/components/wishlist/WishlistButton'
import { useWishlist } from '@/hooks/useWishlist'
import { useNavigation, useMobileMenu, useCategoryNavigation } from '@/contexts/NavigationProvider'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { config } = useNavigation()
  const { isOpen: mobileMenuOpen, toggle: toggleMobileMenu } = useMobileMenu()
  const { 
    activeMegaMenu, 
    hoveredCategory, 
    handleHover, 
    handleLeave 
  } = useCategoryNavigation()
  const { getWishlistCount } = useWishlist()
  const wishlistCount = getWishlistCount()
  const [cartCount] = useState(2)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Keyboard navigation support
  const handleKeyDown = (event: React.KeyboardEvent, categoryId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleHover(categoryId)
    }
    if (event.key === 'Escape') {
      handleLeave()
    }
  }

  return (
    <>
      {/* Skip to main content link for screen readers */}
      <Link 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-foreground text-background px-4 py-2 z-[100] font-body"
        tabIndex={1}
      >
        Skip to main content
      </Link>

      {/* Top Announcement Bar */}
      <div className="bg-foreground text-background" role="banner" aria-label="Site announcements">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3" aria-hidden="true" />
              <span>Free Shipping on Orders $500+</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <Shield className="w-3 h-3" aria-hidden="true" />
              <span>Lifetime Warranty</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <Award className="w-3 h-3" aria-hidden="true" />
              <span>Certified Lab Diamonds</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" aria-hidden="true" />
              <span>4.9/5 from 12,000+ Reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Container */}
      <div className="relative">
        {/* Main Header */}
        <header 
          className={cn(
            "sticky top-0 z-50 bg-background transition-all duration-300",
            scrolled ? "shadow-lg py-0" : "py-0",
            className
          )}
          role="banner"
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              {/* Mobile Menu */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover:bg-muted hover:text-accent min-h-11 min-w-11"
                onClick={toggleMobileMenu}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
                tabIndex={2}
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>

              {/* Logo */}
              <Link 
                href="/" 
                className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded"
                tabIndex={3}
                aria-label="GlowGlitch homepage"
              >
                <img 
                  src="/glitchglow_logo_empty_green.png" 
                  alt="GlowGlitch - Custom Lab-Grown Diamond Jewelry" 
                  className="h-32" 
                />
              </Link>

              {/* Desktop Navigation - WCAG 2.1 AA Compliant */}
              <nav 
                className="hidden md:flex items-center space-x-1"
                onMouseLeave={handleLeave}
                role="navigation"
                aria-label="Main navigation"
              >
                {config.navigation.map((category, index) => (
                  <div
                    key={category.id}
                    className="relative"
                    onMouseEnter={() => handleHover(category.id)}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "px-4 py-2 rounded-none border-b-2 transition-all duration-200 min-h-11 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                        hoveredCategory === category.id
                          ? "border-accent text-accent bg-muted"
                          : "border-transparent hover:text-accent hover:bg-muted/50"
                      )}
                      aria-expanded={hoveredCategory === category.id}
                      aria-haspopup={category.children && category.children.length > 0}
                      aria-describedby={category.metadata?.description ? `${category.id}-desc` : undefined}
                      onKeyDown={(e) => handleKeyDown(e, category.id)}
                      tabIndex={4 + index}
                    >
                      <span className="text-sm font-body font-medium tracking-wide">
                        {category.label}
                      </span>
                      {category.children && category.children.length > 0 && (
                        <ChevronDown 
                          className={cn(
                            "ml-1 h-3 w-3 transition-transform duration-200",
                            hoveredCategory === category.id && "rotate-180"
                          )} 
                          aria-hidden="true"
                        />
                      )}
                    </Button>
                    
                    {/* Featured Badge with improved accessibility */}
                    {hoveredCategory === category.id && category.metadata?.featured && (
                      <div className="absolute top-full left-0 mt-2 z-10">
                        <Badge 
                          className="text-accent bg-white text-xs whitespace-nowrap border border-accent/20"
                          id={`${category.id}-desc`}
                          role="tooltip"
                          aria-live="polite"
                        >
                          {category.metadata.description}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              {/* Right Actions - WCAG 2.1 AA Compliant */}
              <div className="flex items-center space-x-2" role="toolbar" aria-label="User actions">
                {/* Search */}
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:bg-muted hover:text-accent min-h-11 min-w-11 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                  aria-label="Search jewelry"
                  tabIndex={8}
                >
                  <Search className="h-5 w-5" aria-hidden="true" />
                </Button>

                {/* Account */}
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hidden md:flex hover:bg-muted hover:text-accent min-h-11 min-w-11 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                  aria-label="My account"
                  tabIndex={9}
                >
                  <User className="h-5 w-5" aria-hidden="true" />
                </Button>

                {/* Wishlist with improved accessibility */}
                <WishlistButton 
                  showCount={true}
                  variant="icon"
                  className="hover:bg-muted hover:text-accent min-h-11 min-w-11 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                  tabIndex={10}
                  aria-label={`Wishlist with ${wishlistCount} items`}
                />

                {/* Cart with improved accessibility */}
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative hover:bg-muted hover:text-accent min-h-11 min-w-11 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                  aria-label={`Shopping cart with ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
                  tabIndex={11}
                >
                  <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                  {cartCount > 0 && (
                    <Badge 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-accent text-foreground text-xs"
                      aria-hidden="true"
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Button>

                {/* CTA Button with improved accessibility */}
                <Button 
                  variant="primary"
                  className="hidden md:flex font-body focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                  asChild
                  tabIndex={12}
                >
                  <Link href="/customizer" aria-label="Start designing custom jewelry">
                    Start Designing
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Luxury Mega Menu with accessibility */}
        <LuxuryMegaMenu 
          activeCategory={activeMegaMenu}
          onClose={handleLeave}
        />
      </div>
      
      {/* Simple Mobile Drawer with accessibility */}
      <SimpleMobileDrawer />

      {/* Main content landmark for skip link */}
      <div id="main-content" tabIndex={-1} className="sr-only">
        Main content starts here
      </div>
    </>
  )
}

