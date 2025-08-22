/**
 * Investment Impact Navigation
 * Financial + ethical framework navigation presenting jewelry as smart investments
 * CLAUDE_RULES.md compliant design system
 */

'use client'

import React, { useState } from 'react'
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  BarChart3, 
  Shield, 
  Award,
  ChevronDown,
  Menu,
  X,
  Calculator,
  Target,
  Clock,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { H1, H2, H3, BodyText, MutedText } from '@/components/foundation/Typography'

interface InvestmentImpactProps {
  className?: string
}

export function InvestmentImpact({ className }: InvestmentImpactProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const investmentCategories = [
    {
      title: 'Growth Assets',
      description: 'Lab-created gemstones with appreciation potential',
      icon: TrendingUp,
      assets: ['Lab Diamonds', 'Premium Moissanite', 'Synthetic Emeralds'],
      roi: '+12-18% annually',
      riskScore: 'Low-Medium',
      esgScore: 'AAA'
    },
    {
      title: 'Stable Holdings',
      description: 'Precious metals with inflation protection',
      icon: Shield,
      assets: ['925 Silver', 'Gold Vermeil', 'Platinum Plating'],
      roi: '+6-10% annually',
      riskScore: 'Low',
      esgScore: 'AA+'
    },
    {
      title: 'Impact Investments',
      description: 'Ethical choices with financial returns',
      icon: Award,
      assets: ['Recycled Metals', 'Conflict-Free Settings', 'Lab Certifications'],
      roi: '+8-14% annually',
      riskScore: 'Low',
      esgScore: 'AAA+'
    }
  ]

  const portfolioMetrics = [
    { label: '5Y Returns', value: '+127%', icon: TrendingUp },
    { label: 'Risk Score', value: '3.2/10', icon: Shield },
    { label: 'ESG Rating', value: 'AAA', icon: Award }
  ]

  return (
    <div className={cn('bg-background', className)}>
      {/* Header */}
      <header className="bg-white border-b border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-background" />
              </div>
              <H2 className="text-foreground bg-white">GlowGlitch</H2>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {investmentCategories.map((category, index) => {
                const IconComponent = category.icon
                return (
                  <div key={index} className="relative">
                    <button
                      onMouseEnter={() => setActiveDropdown(category.title)}
                      onMouseLeave={() => setActiveDropdown(null)}
                      className="flex items-center space-x-2 text-foreground bg-white hover:text-accent transition-colors"
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="font-body">{category.title.split(' ')[0]}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {/* Dropdown */}
                    {activeDropdown === category.title && (
                      <div
                        className="absolute top-full left-0 mt-2 w-80 bg-white border border rounded-lg shadow-lg z-50"
                        onMouseEnter={() => setActiveDropdown(category.title)}
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        <div className="p-6">
                          <div className="flex items-center space-x-2 mb-3">
                            <IconComponent className="w-5 h-5 text-accent" />
                            <H3 className="text-foreground bg-white">{category.title}</H3>
                          </div>
                          <BodyText className="text-gray-600 bg-white mb-4">{category.description}</BodyText>
                          
                          {/* Assets */}
                          <div className="mb-4">
                            <MutedText className="font-medium mb-2">Key Assets:</MutedText>
                            <div className="space-y-1">
                              {category.assets.map((asset, assetIndex) => (
                                <div key={assetIndex} className="flex items-center space-x-2">
                                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                                  <BodyText className="text-foreground bg-white text-sm">{asset}</BodyText>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Performance Metrics */}
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="text-center">
                              <div className="text-accent font-headline font-bold text-lg">{category.roi}</div>
                              <MutedText className="text-xs">Expected ROI</MutedText>
                            </div>
                            <div className="text-center">
                              <div className="text-accent font-headline font-bold text-lg">{category.riskScore}</div>
                              <MutedText className="text-xs">Risk Level</MutedText>
                            </div>
                            <div className="text-center">
                              <div className="text-accent font-headline font-bold text-lg">{category.esgScore}</div>
                              <MutedText className="text-xs">ESG Rating</MutedText>
                            </div>
                          </div>

                          {/* Investment Highlight */}
                          <div className="bg-muted p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <Calculator className="w-4 h-4 text-accent" />
                              <MutedText className="font-medium text-accent">Smart Investment</MutedText>
                            </div>
                            <BodyText className="text-foreground bg-muted text-sm">
                              Optimal risk-adjusted returns with positive ESG impact
                            </BodyText>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* Portfolio Metrics */}
            <div className="hidden lg:flex items-center space-x-6">
              {portfolioMetrics.map((metric, index) => {
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
              className="md:hidden p-2 text-foreground bg-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border">
          <div className="container mx-auto px-4 py-6">
            {/* Portfolio Metrics Mobile */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {portfolioMetrics.map((metric, index) => {
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

            {/* Investment Categories Mobile */}
            <div className="space-y-4">
              {investmentCategories.map((category, index) => {
                const IconComponent = category.icon
                return (
                  <div key={index} className="border border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <IconComponent className="w-5 h-5 text-accent" />
                      <H3 className="text-foreground bg-white">{category.title}</H3>
                    </div>
                    <BodyText className="text-gray-600 bg-white text-sm mb-3">{category.description}</BodyText>
                    
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div>
                        <div className="text-accent font-medium text-sm">{category.roi}</div>
                        <MutedText className="text-xs">Expected ROI</MutedText>
                      </div>
                      <div>
                        <div className="text-accent font-medium text-sm">{category.esgScore}</div>
                        <MutedText className="text-xs">ESG Rating</MutedText>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* CTA */}
            <div className="mt-6 pt-6 border-t border text-center">
              <Button variant="primary" className="w-full mb-3">
                <Calculator className="w-4 h-4 mr-2" />
                Calculate ROI
              </Button>
              <Button variant="secondary" className="w-full">
                Start Investing
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TrendingUp className="w-8 h-8 text-accent" />
            <PieChart className="w-8 h-8 text-accent" />
            <DollarSign className="w-8 h-8 text-accent" />
          </div>
          <H1 className="text-foreground bg-muted mb-6">Smart Investment Portfolio</H1>
          <BodyText className="text-gray-600 bg-muted max-w-2xl mx-auto mb-8">
            Build wealth while building a better world. Our lab-created luxury combines 
            superior financial returns with positive environmental and social impact.
          </BodyText>
          
          {/* Portfolio Performance */}
          <div className="bg-white rounded-lg p-6 max-w-lg mx-auto">
            <MutedText className="mb-4">5-Year Portfolio Performance</MutedText>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="text-3xl font-headline font-bold text-accent mb-1">+127%</div>
                <MutedText className="text-sm">Total Returns</MutedText>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="text-3xl font-headline font-bold text-accent mb-1">3.2/10</div>
                <MutedText className="text-sm">Risk Score</MutedText>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border">
              <div className="flex items-center justify-center space-x-2">
                <Award className="w-5 h-5 text-accent" />
                <span className="text-accent font-medium">AAA ESG Rating</span>
              </div>
              <MutedText className="text-xs mt-1">Top 1% for Environmental & Social Impact</MutedText>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}