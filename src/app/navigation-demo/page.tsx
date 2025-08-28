'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { AuroraNavigation } from '@/components/navigation'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, ExternalLink, Layers, Users, Brain, Check } from 'lucide-react'

export default function NavigationDemoPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Header */}
      <div className="bg-foreground text-background">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-background hover:bg-background/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Main Site
              </Button>
              <div className="hidden sm:block w-px h-4 bg-background/20" />
              <span className="text-sm font-medium">Navigation Redesign Demo</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-background/70 hidden sm:inline">Promoting Moissanite + 925 Silver</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-background hover:bg-background/10"
                onClick={() => window.open('/MINIMALIST_REDESIGN_SUMMARY.md', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Summary
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Aurora Navigation Demo */}
      <div className="relative">
        <AuroraNavigation />
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mx-4 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-800">
              Aurora Navigation System Active - Simplified & Functional
            </span>
          </div>
        </div>
      </div>

      {/* Content Area - Demo Information */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center space-y-6 mb-16">
            <h1 className="text-foreground bg-background font-headline font-bold text-4xl lg:text-5xl">
              Navigation Redesign Options
            </h1>
            <p className="text-aurora-nav-muted bg-background font-body text-lg lg:text-xl max-w-4xl mx-auto">
              Three strategic approaches to promote Moissanite with 925 Silver as our volume products 
              while elevating the 3D customizer and integrating creator program visibility.
            </p>
          </div>

          {/* Options Overview */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            
            {/* Option 1: Volume-First */}
            <div className="bg-background rounded-2xl border border-border p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cta/20 to-accent/20 rounded-xl flex items-center justify-center">
                  <Layers className="w-6 h-6 text-cta" />
                </div>
                <h3 className="text-foreground bg-background font-semibold text-lg">Volume-First Discovery</h3>
              </div>
              
              <p className="text-aurora-nav-muted bg-background text-sm">
                Direct promotion strategy with Moissanite prominently featured in navigation and pricing transparency.
              </p>
              
              <div className="space-y-2">
                <h4 className="text-foreground bg-background font-medium text-sm">Key Features:</h4>
                <div className="space-y-1">
                  {[
                    'Moissanite + 925 Silver primary position',
                    'Price savings calculator integration',
                    'Volume incentives and badges',
                    '24-48hr shipping emphasis'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs text-aurora-nav-muted bg-background">
                      <Check className="w-3 h-3 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-3 border-t border-border">
                <div className="text-xs text-aurora-nav-muted">Best for: Conversion optimization & direct sales</div>
              </div>
            </div>

            {/* Option 2: Creator-Led */}
            <div className="bg-background rounded-2xl border border-border p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-foreground bg-background font-semibold text-lg">Creator-Led Discovery</h3>
              </div>
              
              <p className="text-aurora-nav-muted bg-background text-sm">
                Leverages creator influence and social proof to drive Moissanite adoption through authentic content.
              </p>
              
              <div className="space-y-2">
                <h4 className="text-foreground bg-background font-medium text-sm">Key Features:</h4>
                <div className="space-y-1">
                  {[
                    'Creator stories and earnings transparency',
                    'Live content integration',
                    'Social commerce features',
                    'Community-driven recommendations'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs text-aurora-nav-muted bg-background">
                      <Check className="w-3 h-3 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-3 border-t border-border">
                <div className="text-xs text-aurora-nav-muted">Best for: Brand building & trust development</div>
              </div>
            </div>

            {/* Option 3: Smart Value */}
            <div className="bg-background rounded-2xl border border-border p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-foreground bg-background font-semibold text-lg">Smart Value Navigation</h3>
              </div>
              
              <p className="text-aurora-nav-muted bg-background text-sm">
                AI-driven personalization that intelligently promotes volume products based on user behavior.
              </p>
              
              <div className="space-y-2">
                <h4 className="text-foreground bg-background font-medium text-sm">Key Features:</h4>
                <div className="space-y-1">
                  {[
                    'AI recommendations favoring Moissanite',
                    'Dynamic pricing optimization',
                    'Behavioral adaptation system',
                    'Gamified impact scoring'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs text-aurora-nav-muted bg-background">
                      <Check className="w-3 h-3 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-3 border-t border-border">
                <div className="text-xs text-aurora-nav-muted">Best for: Personalization & retention</div>
              </div>
            </div>
          </div>

          {/* Implementation Strategy */}
          <div className="bg-gradient-to-r from-cta/5 to-accent/5 rounded-2xl p-8 mb-16">
            <h2 className="text-foreground bg-background font-headline font-bold text-2xl lg:text-3xl mb-6">
              Implementation Strategy
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-foreground bg-background font-semibold text-lg">Phase 1: A/B Testing</h3>
                <ul className="space-y-2 text-sm text-aurora-nav-muted bg-background">
                  <li>• Test each navigation option with 33% traffic split</li>
                  <li>• Monitor Moissanite collection engagement rates</li>
                  <li>• Track 3D customizer usage and conversions</li>
                  <li>• Measure creator program sign-up rates</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-foreground bg-background font-semibold text-lg">Phase 2: Optimization</h3>
                <ul className="space-y-2 text-sm text-aurora-nav-muted bg-background">
                  <li>• Implement winning navigation option</li>
                  <li>• Integrate successful elements from other options</li>
                  <li>• Fine-tune Moissanite promotion strategies</li>
                  <li>• Scale creator program integration</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Success Metrics */}
          <div className="bg-background rounded-2xl border border-border p-8">
            <h2 className="text-foreground bg-background font-headline font-bold text-2xl lg:text-3xl mb-6">
              Success Metrics
            </h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-cta bg-background">+35%</div>
                <div className="text-sm text-aurora-nav-muted bg-background">Moissanite Page Visits</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-accent bg-background">+40%</div>
                <div className="text-sm text-aurora-nav-muted bg-background">3D Customizer Usage</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-green-600">+50%</div>
                <div className="text-sm text-aurora-nav-muted bg-background">Creator Sign-ups</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-blue-600">+25%</div>
                <div className="text-sm text-aurora-nav-muted bg-background">Mobile Conversion</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-aurora-nav-muted bg-background text-sm">
            Navigation redesign demo • Use the floating selector to switch between options • 
            <button
              onClick={() => window.open('/MINIMALIST_REDESIGN_SUMMARY.md', '_blank')}
              className="text-cta hover:underline ml-1"
            >
              View complete summary
            </button>
          </p>
        </div>
      </footer>
    </div>
  )
}