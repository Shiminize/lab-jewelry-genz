/**
 * Conscious Luxury Journey Navigation
 * Values-driven experience tracking environmental impact and ethical choices
 * CLAUDE_RULES.md compliant design system
 */

'use client'

import React, { useState } from 'react'
import { 
  Heart, 
  Leaf, 
  Globe, 
  TrendingUp, 
  Shield, 
  Award,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Users,
  Calculator
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { H1, H2, H3, BodyText, MutedText } from '@/components/foundation/Typography'

interface ConsciousLuxuryJourneyProps {
  className?: string
}

export function ConsciousLuxuryJourney({ className }: ConsciousLuxuryJourneyProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const impactMetrics = [
    { label: 'Carbon Saved', value: '2.4 tons', icon: Leaf },
    { label: 'Ethical Impact', value: '94% Score', icon: Shield },
    { label: 'Community Supported', value: '1,200 jobs', icon: Users }
  ]

  const consciousCategories = [
    {
      title: 'Lab-Grown Diamonds',
      description: 'Zero mining impact, maximum sparkle',
      impact: '99% less environmental impact',
      products: ['Engagement Rings', 'Earrings', 'Necklaces'],
      ethicalScore: '10/10'
    },
    {
      title: 'Moissanite Collection',
      description: 'Lab-created brilliance, guilt-free glamour',
      impact: 'Carbon neutral production',
      products: ['Solitaires', 'Wedding Bands', 'Tennis Bracelets'],
      ethicalScore: '10/10'
    },
    {
      title: 'Recycled Metals',
      description: 'Reclaimed precious metals, renewed purpose',
      impact: '95% less mining required',
      products: ['925 Silver', 'Gold Vermeil', 'Platinum'],
      ethicalScore: '9/10'
    }
  ]

  return (
    <div className={cn('bg-background', className)}>
      {/* Header */}
      <header className="bg-background border-b border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-background" />
              </div>
              <H2 className="text-foreground bg-background">GlowGlitch</H2>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {consciousCategories.map((category, index) => (
                <div key={index} className="relative">
                  <button
                    onMouseEnter={() => setActiveDropdown(category.title)}
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="flex items-center space-x-1 text-foreground bg-background hover:text-accent transition-colors"
                  >
                    <span className="font-body">{category.title}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Dropdown */}
                  {activeDropdown === category.title && (
                    <div
                      className="absolute top-full left-0 mt-2 w-80 bg-background border border rounded-lg shadow-lg z-50"
                      onMouseEnter={() => setActiveDropdown(category.title)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <div className="p-6">
                        <H3 className="text-foreground bg-background mb-2">{category.title}</H3>
                        <BodyText className="text-aurora-nav-muted bg-background mb-4">{category.description}</BodyText>
                        
                        {/* Impact Highlight */}
                        <div className="bg-muted p-3 rounded-lg mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Leaf className="w-4 h-4 text-accent" />
                            <MutedText className="font-medium text-accent">Impact</MutedText>
                          </div>
                          <BodyText className="text-foreground bg-muted text-sm">{category.impact}</BodyText>
                        </div>

                        {/* Products */}
                        <div className="space-y-2 mb-4">
                          {category.products.map((product, productIndex) => (
                            <button
                              key={productIndex}
                              className="block w-full text-left text-foreground bg-background hover:text-accent text-sm transition-colors"
                            >
                              {product}
                            </button>
                          ))}
                        </div>

                        {/* Ethical Score */}
                        <div className="flex items-center justify-between">
                          <MutedText>Ethical Score</MutedText>
                          <div className="flex items-center space-x-1">
                            <Award className="w-4 h-4 text-accent" />
                            <span className="text-accent font-medium">{category.ethicalScore}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Impact Dashboard */}
            <div className="hidden lg:flex items-center space-x-6">
              {impactMetrics.map((metric, index) => {
                const IconComponent = metric.icon
                return (
                  <div key={index} className="text-center">
                    <div className="flex items-center space-x-1 mb-1">
                      <IconComponent className="w-4 h-4 text-accent" />
                      <span className="text-accent font-headline font-bold text-sm">{metric.value}</span>
                    </div>
                    <MutedText className="text-xs">{metric.label}</MutedText>
                  </div>
                )
              })}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-foreground bg-background"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border">
          <div className="container mx-auto px-4 py-6">
            {/* Impact Metrics Mobile */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {impactMetrics.map((metric, index) => {
                const IconComponent = metric.icon
                return (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <IconComponent className="w-4 h-4 text-accent" />
                      <span className="text-accent font-headline font-bold text-sm">{metric.value}</span>
                    </div>
                    <MutedText className="text-xs">{metric.label}</MutedText>
                  </div>
                )
              })}
            </div>

            {/* Categories Mobile */}
            <div className="space-y-4">
              {consciousCategories.map((category, index) => (
                <div key={index} className="border border rounded-lg p-4">
                  <H3 className="text-foreground bg-background mb-2">{category.title}</H3>
                  <BodyText className="text-aurora-nav-muted bg-background text-sm mb-3">{category.description}</BodyText>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Leaf className="w-4 h-4 text-accent" />
                      <MutedText className="text-xs">{category.impact}</MutedText>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Award className="w-4 h-4 text-accent" />
                      <span className="text-accent font-medium text-sm">{category.ethicalScore}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-6 pt-6 border-t border text-center">
              <Button variant="primary" className="w-full mb-3">
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Your Impact
              </Button>
              <Button variant="secondary" className="w-full">
                Start Your Journey
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="w-8 h-8 text-accent" />
            <Globe className="w-8 h-8 text-accent" />
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <H1 className="text-foreground bg-muted mb-6">Your Conscious Luxury Journey</H1>
          <BodyText className="text-aurora-nav-muted bg-muted max-w-2xl mx-auto mb-8">
            Every piece tells a story of positive impact. Track your environmental savings, 
            support ethical practices, and build a legacy of conscious choices that sparkle as bright as your jewelry.
          </BodyText>
          
          {/* Journey Progress */}
          <div className="bg-background rounded-lg p-6 max-w-md mx-auto">
            <MutedText className="mb-3">Your Impact This Year</MutedText>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-headline font-bold text-accent mb-1">2.4 tons</div>
                <MutedText className="text-xs">CO₂ Saved</MutedText>
              </div>
              <div className="text-center">
                <div className="text-2xl font-headline font-bold text-accent mb-1">94%</div>
                <MutedText className="text-xs">Ethical Score</MutedText>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}