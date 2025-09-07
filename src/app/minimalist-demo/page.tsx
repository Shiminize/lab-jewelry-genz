'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { AuroraNavigation } from '@/components/navigation'
import { MinimalistMoissaniteHero } from 'html-demo/MinimalistMoissaniteHero'
import { MinimalistWireframes } from 'html-demo/MinimalistWireframes'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, ExternalLink, Sparkles } from 'lucide-react'

export default function MinimalistDemoPage() {
  const router = useRouter()

  const handleExploreCollection = () => {
    console.log('Navigate to Moissanite collection')
    router.push('/collections/moissanite')
  }

  const handleStartCustomizer = () => {
    console.log('Navigate to 3D customizer')
    router.push('/customizer')
  }

  const handleWatchDemo = () => {
    console.log('Show 3D demo video')
  }

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
              <span className="text-sm font-medium">Minimalist Redesign Demo</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-background/70 hidden sm:inline">Based on PRD requirements</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-background hover:bg-background/10"
                onClick={() => window.open('/Docs/PRD_COMPLETE_2025.md', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View PRD
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Minimalist Header Demo */}
      <section>
        <MinimalistHeader />
      </section>

      {/* Minimalist Hero Demo */}
      <section>
        <MinimalistMoissaniteHero
          onExploreCollection={handleExploreCollection}
          onStartCustomizer={handleStartCustomizer}
          onWatchDemo={handleWatchDemo}
        />
      </section>

      {/* Design Rationale Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-token-md">
              <h2 className="text-foreground bg-background font-headline font-bold text-3xl lg:text-4xl">
                Minimalist Design Strategy
              </h2>
              <p className="text-aurora-nav-muted bg-background font-body text-lg">
                This redesign focuses on promoting our volume products (Moissanite + 925 Silver) 
                while maintaining the luxury positioning outlined in our PRD.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background rounded-xl p-6 space-y-token-md">
                <div className="w-12 h-12 bg-cta/10 rounded-xl flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-cta" />
                </div>
                <h3 className="text-foreground bg-background font-semibold text-lg">Product Focus</h3>
                <p className="text-aurora-nav-muted bg-background text-sm">
                  Hero section prominently features Moissanite collection with clear value propositions: 
                  2.5x brighter, 70% more affordable, 90% more sustainable.
                </p>
              </div>

              <div className="bg-background rounded-xl p-6 space-y-token-md">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto">
                  <div className="w-6 h-6 bg-accent rounded-sm" />
                </div>
                <h3 className="text-foreground bg-background font-semibold text-lg">Simplified Navigation</h3>
                <p className="text-aurora-nav-muted bg-background text-sm">
                  Reduced from 8+ categories to 4 core sections: Moissanite, Custom Design, 
                  Collections, and Creators program.
                </p>
              </div>

              <div className="bg-background rounded-xl p-6 space-y-token-md">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                  <div className="w-6 h-6 bg-green-500 rounded-full" />
                </div>
                <h3 className="text-foreground bg-background font-semibold text-lg">PRD Compliance</h3>
                <p className="text-aurora-nav-muted bg-background text-sm">
                  Uses approved color combinations and typography system from PRD. 
                  Maintains accessibility and performance requirements.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-cta/5 to-accent/5 rounded-xl p-6">
              <h3 className="text-foreground bg-background font-semibold text-lg mb-4">Key Improvements</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <ul className="space-y-token-sm text-sm text-aurora-nav-muted bg-background">
                  <li>• Moissanite prominently featured in header banner</li>
                  <li>• 3D customizer elevated to primary navigation</li>
                  <li>• Creator program integration throughout</li>
                  <li>• Social proof positioned strategically</li>
                </ul>
                <ul className="space-y-token-sm text-sm text-aurora-nav-muted bg-background">
                  <li>• Reduced cognitive load with cleaner hierarchy</li>
                  <li>• Mobile-first responsive design</li>
                  <li>• Clear value propositions and CTAs</li>
                  <li>• Sustainability messaging integrated naturally</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wireframe Options */}
      <section className="py-16">
        <MinimalistWireframes />
      </section>

      {/* Implementation Next Steps */}
      <section className="py-16 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-token-md">
              <h2 className="font-headline font-bold text-3xl lg:text-4xl">
                Implementation Strategy
              </h2>
              <p className="font-body text-lg text-background/80">
                Ready to transform this design into a conversion-optimized experience 
                that supports our $5M Year 1 revenue target.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="space-y-token-md">
                <h3 className="font-semibold text-lg">Phase 1: Core Implementation</h3>
                <ul className="space-y-token-sm text-sm text-background/80">
                  <li>• Replace existing header with minimalist version</li>
                  <li>• Implement Moissanite-focused hero section</li>
                  <li>• Update navigation hierarchy and categories</li>
                  <li>• Add 3D customizer prominence throughout</li>
                </ul>
              </div>

              <div className="space-y-token-md">
                <h3 className="font-semibold text-lg">Phase 2: Enhanced Features</h3>
                <ul className="space-y-token-sm text-sm text-background/80">
                  <li>• Integrate creator program social proof</li>
                  <li>• Add interactive 3D product previews</li>
                  <li>• Implement conversion tracking for Moissanite</li>
                  <li>• A/B test layout variations</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push('/')}
                className="bg-background text-foreground hover:bg-background/90"
              >
                Compare with Current Design
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartCustomizer}
                className="bg-cta text-background hover:bg-cta-hover"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Start Implementation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-aurora-nav-muted bg-background text-sm">
            Minimalist redesign prototype • Based on {' '}
            <button
              onClick={() => window.open('/Docs/PRD_COMPLETE_2025.md', '_blank')}
              className="text-cta hover:underline"
            >
              PRD requirements
            </button>
            {' '} • Promoting Moissanite + 925 Silver collection
          </p>
        </div>
      </footer>
    </div>
  )
}