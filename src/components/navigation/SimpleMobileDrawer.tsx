'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { X, ChevronRight, ChevronDown, Sparkles, Heart, Users, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { H3, BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'
import { genZMobileNavigation, trustSignals } from '@/data/navigation-genz'

interface SimpleMobileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function SimpleMobileDrawer({ isOpen, onClose }: SimpleMobileDrawerProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(prev => prev === categoryName ? null : categoryName)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Simple backdrop */}
      <div
        className="fixed inset-0 bg-foreground/30 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main drawer - solid and simple */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-[90vw] max-w-xs bg-background shadow-lg z-50 transform transition-transform duration-250 ease-out md:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <div className="flex flex-col h-full">
          {/* Fixed Header */}
          <div className="flex-shrink-0 border-b border-border">
            {/* Top bar with logo and close */}
            <div className="flex items-center justify-between p-4">
              <H3 className="font-headline font-bold text-foreground">
                ✨ GlowGlitch
              </H3>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close navigation menu"
                className="text-foreground hover:bg-muted rounded-full"
              >
                <X size={24} />
              </Button>
            </div>

            {/* Search bar */}
            <div className="px-4 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cta" />
                <Input
                  type="search"
                  placeholder="Find your perfect piece..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 bg-muted border-0 rounded-full text-foreground placeholder:text-foreground/60 focus:ring-2 focus:ring-cta"
                  aria-label="Search jewelry"
                />
              </div>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* Quick actions */}
            <div className="p-4 border-b border-border">
              <div className="space-y-3">
                <Link
                  href="/customizer"
                  onClick={onClose}
                  className="flex items-center p-3 bg-cta/10 rounded-lg border border-cta/20 hover:bg-cta/20 transition-colors duration-200"
                >
                  <div className="w-10 h-10 bg-cta rounded-full flex items-center justify-center mr-3">
                    <Sparkles className="w-5 h-5 text-background" />
                  </div>
                  <div className="flex-1">
                    <BodyText className="font-medium text-foreground">
                      Design Your Story
                    </BodyText>
                    <BodyText size="sm" className="text-foreground/70">
                      Start creating in 3D
                    </BodyText>
                  </div>
                  <ChevronRight className="w-5 h-5 text-cta" />
                </Link>

                <Link
                  href="/creators"
                  onClick={onClose}
                  className="flex items-center p-3 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors duration-200"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <BodyText className="font-medium text-foreground">
                      Creator Collective
                    </BodyText>
                    <BodyText size="sm" className="text-foreground/70">
                      Join & earn 30%
                    </BodyText>
                  </div>
                  <ChevronRight className="w-5 h-5 text-purple-500" />
                </Link>
              </div>
            </div>

            {/* Navigation categories */}
            <div className="p-4">
              <nav>
                <ul className="space-y-1">
                  {genZMobileNavigation.map((category) => (
                    <li key={category.name}>
                      <div>
                        {/* Main category */}
                        <div className="flex items-center">
                          <Link
                            href={category.href}
                            className="flex-1 flex items-center py-3 text-foreground hover:text-cta transition-colors duration-200"
                            onClick={onClose}
                          >
                            {category.name === 'Design Your Story' && <Sparkles className="w-5 h-5 text-cta mr-3" />}
                            {category.name === 'Shop by Values' && <Heart className="w-5 h-5 text-green-500 mr-3" />}
                            {category.name === 'Creator Collective' && <Users className="w-5 h-5 text-purple-500 mr-3" />}
                            <span className="font-medium">{category.name}</span>
                          </Link>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCategory(category.name)}
                            aria-label={`Toggle ${category.name} subcategories`}
                            className="text-foreground hover:bg-muted rounded-full p-2"
                          >
                            {expandedCategory === category.name ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </Button>
                        </div>

                        {/* Subcategories */}
                        {expandedCategory === category.name && (
                          <div className="ml-8 space-y-2 py-2">
                            {category.subcategories.map((subcategory) => (
                              <Link
                                key={subcategory.name}
                                href={subcategory.href}
                                className="flex items-center justify-between py-2 text-foreground/80 hover:text-foreground transition-colors duration-200"
                                onClick={onClose}
                              >
                                <span>{subcategory.name}</span>
                                {subcategory.name === '3D Ring Designer' && (
                                  <span className="text-xs bg-cta/20 text-cta px-2 py-1 rounded-full">
                                    Popular
                                  </span>
                                )}
                                {subcategory.name === 'Apply to Create' && (
                                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                                    Earn 30%
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Social proof */}
            <div className="p-4 border-t border-border bg-muted/30">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <div className="flex -space-x-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i} 
                        className="w-6 h-6 bg-cta rounded-full border-2 border-background"
                      />
                    ))}
                  </div>
                  <BodyText size="sm" className="text-foreground font-medium">
                    {trustSignals.socialProof.totalCustomers} customers
                  </BodyText>
                </div>
                
                <div className="flex items-center justify-center space-x-6">
                  <div className="text-center">
                    <BodyText className="font-bold text-cta">
                      {trustSignals.socialProof.averageRating}★
                    </BodyText>
                    <BodyText size="sm" className="text-foreground/70">
                      Rating
                    </BodyText>
                  </div>
                  <div className="text-center">
                    <BodyText className="font-bold text-accent">
                      {trustSignals.socialProof.creatorNetwork}
                    </BodyText>
                    <BodyText size="sm" className="text-foreground/70">
                      Creators
                    </BodyText>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed footer */}
          <div className="flex-shrink-0 p-4 border-t border-border bg-background">
            <div className="space-y-3">
              <Button
                asChild
                size="lg"
                className="w-full bg-cta hover:bg-cta-hover text-background font-medium"
              >
                <Link href="/customizer" onClick={onClose}>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Designing Now
                </Link>
              </Button>
              
              <div className="flex items-center justify-center space-x-6">
                <Link
                  href="/account"
                  className="text-foreground hover:text-cta transition-colors duration-200 font-medium"
                  onClick={onClose}
                >
                  My Account
                </Link>
                <Link
                  href="/support"
                  className="text-foreground hover:text-cta transition-colors duration-200 font-medium"
                  onClick={onClose}
                >
                  Get Help
                </Link>
              </div>

              <div className="flex items-center justify-center space-x-4 pt-2">
                <BodyText size="sm" className="text-foreground/60">🌱 Sustainable</BodyText>
                <BodyText size="sm" className="text-foreground/60">💎 Lab-Grown</BodyText>
                <BodyText size="sm" className="text-foreground/60">📱 Mobile-First</BodyText>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}