/**
 * Style Ecosystem Navigation
 * Lifestyle integration navigation optimizing jewelry choices across all occasions
 * CLAUDE_RULES.md compliant design system
 */

'use client'

import React, { useState } from 'react'
import { 
  Palette, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Coffee, 
  Plane,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Clock,
  Settings,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { H1, H2, H3, BodyText, MutedText } from '@/components/foundation/Typography'

interface StyleEcosystemProps {
  className?: string
}

export function StyleEcosystem({ className }: StyleEcosystemProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const lifestyleCategories = [
    {
      title: 'Work & Professional',
      description: 'Sophisticated pieces that command respect',
      icon: Briefcase,
      occasions: ['Client Meetings', 'Presentations', 'Networking'],
      recommendation: 'Classic Silver with Moissanite accents',
      versatilityScore: '9/10'
    },
    {
      title: 'Social & Events',
      description: 'Statement pieces that steal the spotlight',
      icon: Sparkles,
      occasions: ['Date Nights', 'Parties', 'Celebrations'],
      recommendation: 'Bold Moissanite with Silver settings',
      versatilityScore: '10/10'
    },
    {
      title: 'Travel & Adventure',
      description: 'Durable luxury that travels beautifully',
      icon: Plane,
      occasions: ['Vacation', 'Business Travel', 'Weekend Trips'],
      recommendation: 'Lightweight Silver with secure settings',
      versatilityScore: '8/10'
    }
  ]

  const styleMetrics = [
    { label: 'Occasions Covered', value: '24/7', icon: Clock },
    { label: 'Style Synergy', value: '98%', icon: Settings },
    { label: 'Versatility Score', value: '9.2/10', icon: Star }
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
                <Palette className="w-5 h-5 text-background" />
              </div>
              <H2 className="text-foreground bg-background">GlowGlitch</H2>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {lifestyleCategories.map((category, index) => {
                const IconComponent = category.icon
                return (
                  <div key={index} className="relative">
                    <button
                      onMouseEnter={() => setActiveDropdown(category.title)}
                      onMouseLeave={() => setActiveDropdown(null)}
                      className="flex items-center space-x-2 text-foreground bg-background hover:text-accent transition-colors"
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="font-body">{category.title.split(' & ')[0]}</span>
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
                          <div className="flex items-center space-x-2 mb-3">
                            <IconComponent className="w-5 h-5 text-accent" />
                            <H3 className="text-foreground bg-background">{category.title}</H3>
                          </div>
                          <BodyText className="text-aurora-nav-muted bg-background mb-4">{category.description}</BodyText>
                          
                          {/* Occasions */}
                          <div className="mb-4">
                            <MutedText className="font-medium mb-2">Perfect For:</MutedText>
                            <div className="space-y-1">
                              {category.occasions.map((occasion, occasionIndex) => (
                                <div key={occasionIndex} className="flex items-center space-x-2">
                                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                                  <BodyText className="text-foreground bg-background text-sm">{occasion}</BodyText>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Recommendation */}
                          <div className="bg-muted p-3 rounded-lg mb-4">
                            <MutedText className="font-medium text-accent mb-1">Recommendation</MutedText>
                            <BodyText className="text-foreground bg-muted text-sm">{category.recommendation}</BodyText>
                          </div>

                          {/* Versatility Score */}
                          <div className="flex items-center justify-between">
                            <MutedText>Versatility Score</MutedText>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-accent" />
                              <span className="text-accent font-medium">{category.versatilityScore}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* Style Metrics */}
            <div className="hidden lg:flex items-center space-x-6">
              {styleMetrics.map((metric, index) => {
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
            {/* Style Metrics Mobile */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {styleMetrics.map((metric, index) => {
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

            {/* Lifestyle Categories Mobile */}
            <div className="space-y-4">
              {lifestyleCategories.map((category, index) => {
                const IconComponent = category.icon
                return (
                  <div key={index} className="border border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <IconComponent className="w-5 h-5 text-accent" />
                      <H3 className="text-foreground bg-background">{category.title}</H3>
                    </div>
                    <BodyText className="text-aurora-nav-muted bg-background text-sm mb-3">{category.description}</BodyText>
                    
                    <div className="flex items-center justify-between">
                      <MutedText className="text-xs">{category.recommendation}</MutedText>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-accent" />
                        <span className="text-accent font-medium text-sm">{category.versatilityScore}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* CTA */}
            <div className="mt-6 pt-6 border-t border text-center">
              <Button variant="primary" className="w-full mb-3">
                <Settings className="w-4 h-4 mr-2" />
                Optimize My Style
              </Button>
              <Button variant="secondary" className="w-full">
                Build My Ecosystem
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Palette className="w-8 h-8 text-accent" />
            <Calendar className="w-8 h-8 text-accent" />
            <MapPin className="w-8 h-8 text-accent" />
          </div>
          <H1 className="text-foreground bg-muted mb-6">Your Complete Style Ecosystem</H1>
          <BodyText className="text-aurora-nav-muted bg-muted max-w-2xl mx-auto mb-8">
            From boardroom to ballroom, weekend coffee to international travel. 
            Build a jewelry collection that seamlessly integrates with every aspect of your dynamic lifestyle.
          </BodyText>
          
          {/* Lifestyle Integration */}
          <div className="bg-background rounded-lg p-6 max-w-lg mx-auto">
            <MutedText className="mb-4">Today's Optimal Combination</MutedText>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Briefcase className="w-6 h-6 text-accent mx-auto mb-2" />
                <div className="text-lg font-headline font-bold text-accent mb-1">Work</div>
                <MutedText className="text-xs">Silver Minimalist</MutedText>
              </div>
              <div className="text-center">
                <Coffee className="w-6 h-6 text-accent mx-auto mb-2" />
                <div className="text-lg font-headline font-bold text-accent mb-1">Evening</div>
                <MutedText className="text-xs">Moissanite Statement</MutedText>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border">
              <div className="flex items-center justify-center space-x-2">
                <Star className="w-4 h-4 text-accent" />
                <span className="text-accent font-medium text-sm">98% Style Synergy</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}