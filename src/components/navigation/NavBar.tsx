/*
 * NAVIGATION STRATEGY IMPLEMENTATION
 * 
 * Desktop Hierarchy: Option B (Balanced Material & Technical Navigation)
 * - Logic: Balanced approach with technical precision + emotional appeal
 * - Conversion Impact: 38% increase expected, serves both browsers and targeted shoppers
 * - Top-level order: Necklaces → Earrings → Bracelets → Rings → Customize → About
 * 
 * Mobile Pattern: Option 2 (Morphing Panel System)
 * - Space-efficient slide-in from right with blur backdrop
 * - One-handed operation optimized with ChevronDown icons
 * - Aurora Design System compliant throughout
 * 
 * Key Features:
 * - Lab-Grown Spotlight panel in rightmost mega menu column
 * - Persistent hover behavior with 150ms delay
 * - Staggered column animations (40-60ms delays)
 * - Aurora tokens for all colors, typography, shadows, and radii
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Search, ShoppingBag, Heart, User, ChevronDown } from 'lucide-react'
import { navItems } from '@/data/navigation/navItems'

export function NavBar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Smart hover logic for dropdown persistence
  const handleMouseEnter = (itemId: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setActiveDropdown(itemId)
  }

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150) // Reduced from 300ms for better UX
  }

  // Cleanup timer on unmount to prevent hydration issues
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
    }
  }, [])


  return (
    <>
      {/* Main Navigation Bar */}
      <nav className="sticky top-0 w-full bg-surface z-50 shadow-near">
        <div className="max-w-screen-xl mx-auto px-token-lg">
          <div className="flex items-center justify-between h-token-4xl md:h-token-5xl">
            
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-token-sm">
              <div className="relative w-token-lg h-token-lg md:w-token-xl md:h-token-xl">
                <Image 
                  src="/glitchglow_logo_v3.1.png" 
                  alt="GlitchGlow Logo" 
                  fill 
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold bg-gradient-primary bg-clip-text text-transparent text-token-lg md:text-token-xl">
                  GlitchGlow
                </span>
                <span className="text-token-xs text-text-secondary opacity-70 -mt-token-xs">
                  Uniquely Yours. Consciously Made
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-token-xl">
              {navItems.map((item) => (
                <div key={item.id} className="relative"
                     onMouseEnter={() => item.hasDropdown && handleMouseEnter(item.id)}
                     onMouseLeave={handleMouseLeave}>
                  <Link href={item.href} className={`text-token-base font-medium px-token-sm py-token-xs rounded-token-sm transition-all duration-300 ease-in-out hover:brightness-115 hover:scale-101 ${item.highlight ? 'bg-gradient-primary text-text-inverse hover:brightness-115' : 'text-text-primary hover:bg-surface-hover'}`}>
                    {item.label}
                  </Link>
                </div>
              ))}
            </nav>

            {/* Action Icons */}
            <div className="flex items-center space-x-token-sm">
              {[
                { href: '/search', icon: Search, color: 'nebula-purple' },
                { href: '/wishlist', icon: Heart, color: 'aurora-pink' },
                { href: '/cart', icon: ShoppingBag, color: 'nebula-purple' }
              ].map(({ href, icon: Icon, color }) => (
                <Link key={href} href={href} 
                      className={`p-token-sm rounded-token-sm transition-all duration-300 hover:scale-110 ${color === 'nebula-purple' ? 'hover:bg-accent/10' : 'hover:bg-accent/10'}`}>
                  <Icon className="w-token-sm h-token-sm text-text-primary" />
                </Link>
              ))}
              
              {/* Mobile Menu Toggle */}
              <button onClick={() => setIsMobileOpen(!isMobileOpen)}
                      className="md:hidden p-token-xs rounded-token-sm transition-all duration-300 hover:brightness-115 hover:scale-101 hover:bg-surface-hover">
                {isMobileOpen ? <X className="w-token-lg h-token-lg" /> : <Menu className="w-token-lg h-token-lg" />}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Mega Menu - Full Width */}
        {navItems.map((navItem) => (
          navItem.hasDropdown && (
            <div key={navItem.id} className={`
              absolute top-full left-0 w-screen overflow-hidden
              transition-all duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)]
              aurora-mega-menu
              ${activeDropdown === navItem.id ? 
                'opacity-100 translate-y-0 scale-100 pointer-events-auto shadow-xl' : 
                'opacity-0 -translate-y-3 scale-[0.98] pointer-events-none'}
            `}
            onMouseEnter={() => handleMouseEnter(navItem.id)}
            onMouseLeave={handleMouseLeave}>
              {navItem.categories && (
                <div className="max-w-[1440px] mx-auto px-token-xl py-token-xl">
                  <div className="grid grid-cols-5 gap-token-xl">
                    {/* Primary Category Columns */}
                    {navItem.categories.map((category, idx) => (
                      <div key={category.title}
                           className="animate-fade-in"
                           style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className="group">
                          <Link href={category.href}
                                className="block">
                            <h3 className="text-token-lg font-semibold text-text-primary mb-token-sm 
                                         transition-all duration-300 hover:text-accent
                                         hover:scale-101">
                              {category.title}
                            </h3>
                          </Link>
                          <ul className="space-y-token-sm">
                            {category.items.map(item => (
                              <li key={item}>
                                <Link href={`${category.href}&type=${item.toLowerCase().replace(/ /g, '-')}`}
                                      className="text-token-sm text-text-primary opacity-80
                                               hover:opacity-100 hover:text-accent
                                               transition-all duration-300 hover:translate-x-1 hover:scale-101
                                               inline-block">
                                  {item}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                    
                    {/* Lab-Grown Spotlight - 5th Column */}
                    <div className="animate-fade-in"
                         style={{ animationDelay: '200ms' }}>
                      <div className="group">
                        <h3 className="text-token-lg font-semibold text-text-primary mb-token-sm">
                          Lab-Grown Spotlight
                        </h3>
                        <div className="h-token-10xl bg-gradient-primary
                                      rounded-token-lg p-token-md mb-token-sm transition-all duration-300
                                      group-hover:scale-101 group-hover:shadow-hover
                                      flex flex-col justify-between text-text-inverse">
                          <div>
                            <h4 className="text-token-base font-bold mb-token-xs">Sustainable Luxury</h4>
                            <p className="text-token-sm opacity-90">Lab-grown diamonds with brilliant sparkle & ethical sourcing</p>
                          </div>
                          <div className="mt-token-sm">
                            <Link href="/lab-grown"
                                  className="inline-flex items-center px-token-sm py-token-xs bg-surface/20 backdrop-blur-sm
                                           rounded-token-md font-medium text-token-sm
                                           transition-all duration-300 hover:bg-surface/30 hover:scale-101">
                              Explore Collection →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        ))}
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`
        fixed inset-0 z-[100] md:hidden
        transition-all duration-[380ms] ease-[cubic-bezier(0.32,0.72,0,1)]
        ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-text-primary/80 backdrop-blur-md"
             onClick={() => setIsMobileOpen(false)} />
        
        {/* Mobile Panel */}
        <div className={`
          absolute right-0 top-0 h-full w-[90%] max-w-aurora-lg
          bg-gradient-luxury-midnight
          rounded-l-token-lg overflow-y-auto shadow-far
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-token-lg border-b border-text-inverse/20">
            <div className="flex items-center space-x-token-sm">
              <div className="relative w-token-lg h-token-lg">
                <Image 
                  src="/glitchglow_logo_v3.1.png" 
                  alt="GlitchGlow Logo" 
                  fill 
                  className="object-contain"
                />
              </div>
              <span className="font-semibold text-text-inverse text-token-xl md:text-token-2xl">GlitchGlow</span>
            </div>
            <button onClick={() => setIsMobileOpen(false)}
                    className="p-token-sm rounded-token-sm transition-all duration-300
                             hover:bg-text-inverse/20 hover:scale-110">
              <X className="w-token-lg h-token-lg text-text-inverse" />
            </button>
          </div>
          
          {/* Mobile Navigation */}
          <nav className="p-token-lg space-y-token-sm">
            {navItems.map((item) => (
              <div key={item.id}>
                <div className="flex items-center justify-between">
                  <Link href={item.href} onClick={() => setIsMobileOpen(false)}
                        className={`flex-1 py-token-sm text-token-lg font-medium transition-all duration-300 hover:translate-x-2 ${item.highlight ? 'text-accent' : 'text-text-inverse hover:text-accent'}`}>
                    {item.label}
                  </Link>
                  {item.hasDropdown && (
                    <button onClick={() => setMobileExpanded(mobileExpanded === item.id ? null : item.id)}
                            className="p-token-sm text-text-inverse/60 hover:text-text-inverse transition-colors">
                      <ChevronDown className={`w-token-sm h-token-sm transition-transform duration-300 ${mobileExpanded === item.id ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
                {/* Collapsible Submenu */}
                {item.hasDropdown && item.categories && (
                  <div className={`overflow-hidden transition-all duration-[380ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${mobileExpanded === item.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pl-token-md py-token-sm space-y-token-sm bg-text-primary/20 rounded-token-sm mt-token-sm">
                      {item.categories.map(cat => (
                        <Link key={cat.title} href={cat.href} onClick={() => setIsMobileOpen(false)}
                              className="block text-token-sm text-text-inverse/80 hover:text-accent transition-all duration-300 hover:translate-x-2">
                          {cat.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Mobile Secondary Actions */}
            <div className="pt-token-lg mt-token-lg border-t border-text-inverse/20 space-y-token-sm">
              {[
                { href: '/account', icon: User, label: 'Account' },
                { href: '/wishlist', icon: Heart, label: 'Wishlist' }
              ].map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href} onClick={() => setIsMobileOpen(false)}
                      className="flex items-center space-x-token-sm text-text-inverse hover:text-accent
                               transition-all duration-300 hover:translate-x-2">
                  <Icon className="w-token-sm h-token-sm" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>

    </>
  )
}