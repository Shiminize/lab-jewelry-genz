'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Search, Heart, ShoppingBag, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { mainNavigation, mobileNavigation } from '@/data/clean-navigation'

// Luxury Navigation Header - CLAUDE_RULES.md Compliant
export function CleanHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  return (
    <header className="bg-background border-b border-border relative z-50">
      {/* Luxury Top Banner */}
      <div className="bg-cta text-background text-center py-2 text-sm font-body">
        Free shipping on orders over $500 • 30-day returns • Lab-grown luxury
      </div>

      {/* Main Header */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          {/* Luxury Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 10.93 5.16-1.191 9-5.38 9-10.93V7l-10-5z"/>
              </svg>
            </div>
            <span className="font-headline font-bold text-xl text-foreground">GlowGlitch</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {mainNavigation.map((category) => (
              <div
                key={category.id}
                className="relative"
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link
                  href={category.href}
                  className="text-foreground hover:text-cta font-body font-medium transition-colors py-2"
                >
                  {category.label}
                </Link>

                {/* Luxury Mega Menu */}
                {hoveredCategory === category.id && (
                  <div 
                    className="absolute top-full left-1/2 transform -translate-x-1/2 w-screen max-w-4xl bg-white border border-border shadow-xl rounded-lg mt-2 p-8 z-50 animate-fade-in"
                    onMouseEnter={() => setHoveredCategory(category.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <div className="mb-6 pb-4 border-b border-border">
                      <h3 className="font-headline text-xl font-semibold text-foreground mb-2">{category.label}</h3>
                      <p className="font-body text-sm text-gray-600 max-w-2xl">{category.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8">
                      {category.sections.map((section) => (
                        <div key={section.title} className="space-y-4">
                          <h4 className="font-body font-semibold text-foreground border-l-2 border-accent pl-3">{section.title}</h4>
                          <ul className="space-y-3 ml-5">
                            {section.items.map((item) => (
                              <li key={item.id}>
                                <Link
                                  href={item.href}
                                  className="group flex items-center justify-between hover:bg-muted/50 -mx-3 px-3 py-2 rounded-md transition-all"
                                >
                                  <div className="flex-1">
                                    <div className="font-body font-medium text-foreground group-hover:text-cta transition-colors">{item.label}</div>
                                    {item.description && (
                                      <div className="font-body text-xs text-foreground opacity-70 mt-1">{item.description}</div>
                                    )}
                                  </div>
                                  {item.badge && (
                                    <span className="font-body text-xs bg-accent/20 text-accent px-2 py-1 rounded-full border border-accent/30">
                                      {item.badge}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Call to Action in Mega Menu */}
                    <div className="mt-6 pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-body text-sm text-foreground font-medium">Ready to create something unique?</p>
                          <p className="font-body text-xs text-foreground opacity-70">Design your perfect piece with our 3D customizer</p>
                        </div>
                        <Button variant="accent" size="sm" asChild>
                          <Link href="/customizer">Start Designing</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center space-x-3">
            {/* Search - Desktop */}
            <div className="hidden md:flex">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground opacity-70 w-4 h-4" />
                <input
                  type="search"
                  placeholder="Search luxury jewelry..."
                  className="font-body pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 w-64 text-foreground placeholder:text-foreground opacity-70 transition-all"
                />
              </div>
            </div>

            {/* User Actions */}
            <Button variant="ghost" size="icon" asChild className="text-foreground hover:text-cta">
              <Link href="/account" aria-label="Account">
                <User className="w-5 h-5" />
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild className="text-foreground hover:text-cta">
              <Link href="/wishlist" aria-label="Wishlist">
                <Heart className="w-5 h-5" />
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild className="text-foreground hover:text-cta relative">
              <Link href="/cart" aria-label="Shopping Cart">
                <ShoppingBag className="w-5 h-5" />
                {/* Cart count badge */}
                <span className="absolute -top-1 -right-1 bg-cta text-background text-xs w-5 h-5 rounded-full flex items-center justify-center font-body font-semibold">
                  0
                </span>
              </Link>
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-foreground hover:text-cta"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Luxury Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Mobile Menu Panel */}
          <div className="fixed top-0 right-0 w-80 h-full bg-background z-50 lg:hidden overflow-y-auto shadow-2xl animate-slide-in">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <span className="font-headline font-semibold text-foreground">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground hover:text-cta"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Mobile Search */}
            <div className="p-6 border-b border-border bg-muted">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground opacity-70 w-4 h-4" />
                <input
                  type="search"
                  placeholder="Search luxury jewelry..."
                  className="font-body w-full pl-10 pr-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-foreground placeholder:text-foreground opacity-70"
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="p-6">
              <MobileNavigationAccordion 
                items={mobileNavigation}
                onItemClick={() => setIsMobileMenuOpen(false)}
              />
            </div>

            {/* Mobile CTA */}
            <div className="p-6 border-t border-border bg-muted">
              <Button variant="primary" size="lg" className="w-full mb-3" asChild>
                <Link href="/customizer">Design Your Ring</Link>
              </Button>
              <Button variant="secondary" size="md" className="w-full" asChild>
                <Link href="/about">Learn Our Story</Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </header>
  )
}

// Mobile Navigation Accordion Component
interface MobileNavigationAccordionProps {
  items: typeof mobileNavigation
  onItemClick: () => void
}

function MobileNavigationAccordion({ items, onItemClick }: MobileNavigationAccordionProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="border-b border-border pb-3">
          {/* Main Item */}
          <div className="flex items-center justify-between">
            <Link
              href={item.href}
              onClick={onItemClick}
              className="flex-1 py-3 text-foreground hover:text-cta font-body font-medium transition-colors"
            >
              {item.label}
            </Link>
            {item.children && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleItem(item.id)}
                className="ml-2 text-foreground hover:text-cta"
              >
                <svg
                  className={cn(
                    "w-4 h-4 transition-transform",
                    expandedItems.has(item.id) ? "rotate-180" : "rotate-0"
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
            )}
          </div>

          {/* Sub Items */}
          {item.children && expandedItems.has(item.id) && (
            <div className="ml-4 space-y-2 mt-2">
              {item.children.map((child) => (
                <Link
                  key={child.id}
                  href={child.href}
                  onClick={onItemClick}
                  className="block py-2 px-3 text-sm text-foreground opacity-70 hover:text-cta hover:bg-muted/50 rounded-md transition-all font-body"
                >
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}