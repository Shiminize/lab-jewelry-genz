'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { H4, BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

interface HeaderProps {
  className?: string
}

const navigationCategories = [
  { name: 'Rings', href: '/rings', subcategories: ['Engagement', 'Wedding', 'Fashion', 'Men\'s'] },
  { name: 'Necklaces', href: '/necklaces', subcategories: ['Pendants', 'Chains', 'Chokers', 'Statement'] },
  { name: 'Earrings', href: '/earrings', subcategories: ['Studs', 'Hoops', 'Drop', 'Climbers'] },
  { name: 'Bracelets', href: '/bracelets', subcategories: ['Tennis', 'Chain', 'Cuff', 'Charm'] },
]

export function Header({ className }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  const cartItemCount = 0 // TODO: Connect to cart state
  const wishlistCount = 0 // TODO: Connect to wishlist state

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      className
    )}>
      {/* Top announcement bar */}
      <div className="w-full bg-accent text-foreground">
        <div className="container mx-auto px-4 py-2">
          <BodyText size="sm" className="text-center font-medium">
            Free shipping on orders over $500 • Lab-grown diamonds • Sustainable luxury
          </BodyText>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="block">
              <H4 className="font-headline font-bold text-foreground">
                GlowGlitch
              </H4>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:block">
            <ul className="flex items-center space-x-8">
              {navigationCategories.map((category) => (
                <li
                  key={category.name}
                  className="relative"
                  onMouseEnter={() => setHoveredCategory(category.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link
                    href={category.href}
                    className="font-body font-medium text-foreground hover:text-cta transition-colors"
                  >
                    {category.name}
                  </Link>
                  
                  {/* Dropdown menu */}
                  {hoveredCategory === category.name && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg py-2 z-50">
                      {category.subcategories.map((subcategory) => (
                        <Link
                          key={subcategory}
                          href={`${category.href}/${subcategory.toLowerCase().replace(' ', '-')}`}
                          className="block px-4 py-2 text-sm font-body text-foreground hover:bg-muted transition-colors"
                        >
                          {subcategory}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}
              <li>
                <Link
                  href="/sustainability"
                  className="font-body font-medium text-foreground hover:text-cta transition-colors"
                >
                  Sustainability
                </Link>
              </li>
            </ul>
          </nav>

          {/* Search bar (desktop) */}
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
              <Input
                type="search"
                placeholder="Search jewelry..."
                className="pl-10 pr-4"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            {/* Mobile search toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Toggle search"
            >
              <Search size={20} />
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist" aria-label={`Wishlist (${wishlistCount} items)`}>
                <div className="relative">
                  <Heart size={20} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-cta text-background text-2xs font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </div>
              </Link>
            </Button>

            {/* Shopping cart */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart" aria-label={`Shopping cart (${cartItemCount} items)`}>
                <div className="relative">
                  <ShoppingCart size={20} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-cta text-background text-2xs font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </span>
                  )}
                </div>
              </Link>
            </Button>

            {/* User account */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/account" aria-label="User account">
                <User size={20} />
              </Link>
            </Button>
          </div>
        </div>

        {/* Mobile search bar */}
        {isSearchOpen && (
          <div className="lg:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
              <Input
                type="search"
                placeholder="Search jewelry..."
                className="pl-10 pr-4"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-4">
              {navigationCategories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={category.href}
                    className="block font-body font-medium text-foreground hover:text-cta transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                  <ul className="ml-4 mt-2 space-y-2">
                    {category.subcategories.map((subcategory) => (
                      <li key={subcategory}>
                        <Link
                          href={`${category.href}/${subcategory.toLowerCase().replace(' ', '-')}`}
                          className="block font-body text-sm text-muted hover:text-foreground transition-colors py-1"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {subcategory}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
              <li>
                <Link
                  href="/sustainability"
                  className="block font-body font-medium text-foreground hover:text-cta transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sustainability
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}