'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Sparkles, ArrowRight, Play } from 'lucide-react'

interface MinimalistMoissaniteHeroProps {
  onExploreCollection?: () => void
  onStartCustomizer?: () => void
  onWatchDemo?: () => void
}

export function MinimalistMoissaniteHero({
  onExploreCollection,
  onStartCustomizer,
  onWatchDemo
}: MinimalistMoissaniteHeroProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  return (
    <section className="relative min-h-screen bg-background overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-accent/20 rounded-full animate-pulse" />
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-cta/30 rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-accent/20 rounded-full animate-pulse delay-500" />
      </div>

      <div className="relative z-10 container mx-auto px-4 h-screen flex items-center">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Content Side */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-cta/10 text-cta px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Volume Collection: Moissanite + 925 Silver</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-foreground bg-background font-headline font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight">
                Sustainable Sparkle,
                <br />
                <span className="text-cta">Accessible Luxury</span>
              </h1>
              
              <p className="text-gray-600 bg-background font-body text-lg sm:text-xl leading-relaxed max-w-xl">
                Discover our signature Moissanite collection in premium 925 silver. 
                <strong className="text-foreground bg-background"> 90% more sustainable</strong> than mined diamonds, 
                <strong className="text-foreground bg-background"> 70% more affordable</strong> than traditional luxury.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cta bg-background">2.5x</div>
                <div className="text-sm text-gray-600 bg-background">Brighter Than Diamond</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cta bg-background">925</div>
                <div className="text-sm text-gray-600 bg-background">Premium Silver</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cta bg-background">3D</div>
                <div className="text-sm text-gray-600 bg-background">Custom Design</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={onExploreCollection}
                className="group"
              >
                <span>Explore Moissanite Collection</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                onClick={onStartCustomizer}
                className="group"
              >
                <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                <span>Design Your Piece</span>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-6 text-sm text-gray-600 bg-background">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-1">
                    <div className="w-6 h-6 rounded-full bg-cta/20 border-2 border-background" />
                    <div className="w-6 h-6 rounded-full bg-accent/20 border-2 border-background" />
                    <div className="w-6 h-6 rounded-full bg-cta/30 border-2 border-background" />
                  </div>
                  <span>12k+ happy customers</span>
                </div>
                <div>★★★★★ 4.9/5 rating</div>
                <div>500+ creators earning 30%</div>
              </div>
            </div>
          </div>

          {/* Visual Side */}
          <div className="relative">
            {/* Main Product Showcase */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-muted to-background rounded-3xl p-8 shadow-lg">
                <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center relative overflow-hidden">
                  
                  {/* Placeholder for 3D Model/Product Image */}
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-accent/20 to-cta/20 rounded-full flex items-center justify-center">
                      <Sparkles className="w-16 h-16 text-cta" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-foreground bg-white font-semibold text-lg">Moissanite Solitaire Ring</h3>
                      <p className="text-gray-600 bg-white text-sm">Premium 925 Silver • 1.5ct Equivalent</p>
                      <p className="text-cta bg-white font-bold text-xl">$299</p>
                    </div>
                  </div>

                  {/* 3D Demo Button */}
                  <button
                    onClick={() => {
                      setIsVideoPlaying(!isVideoPlaying)
                      onWatchDemo?.()
                    }}
                    className="absolute top-4 right-4 w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    aria-label="Watch 3D customization demo"
                  >
                    <Play className="w-5 h-5 ml-0.5" />
                  </button>

                  {/* Interactive Badge */}
                  <div className="absolute bottom-4 left-4 bg-foreground text-background px-3 py-1 rounded-full text-xs font-medium">
                    ↻ Rotate to view 360°
                  </div>
                </div>
              </div>

              {/* Floating Action Cards */}
              <div className="absolute -bottom-4 -left-4 bg-white shadow-lg rounded-xl p-4 border border-gray-100">
                <div className="text-center space-y-1">
                  <div className="text-cta bg-white font-bold text-lg">70%</div>
                  <div className="text-gray-600 bg-white text-xs">More Affordable</div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-white shadow-lg rounded-xl p-4 border border-gray-100">
                <div className="text-center space-y-1">
                  <div className="text-accent bg-white font-bold text-lg">0g</div>
                  <div className="text-gray-600 bg-white text-xs">Carbon Footprint</div>
                </div>
              </div>
            </div>

            {/* Secondary Products */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {['Earrings', 'Necklace', 'Bracelet'].map((item) => (
                <div key={item} className="aspect-square bg-muted rounded-xl p-4 flex flex-col items-center justify-center space-y-2 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="w-8 h-8 bg-cta/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-cta" />
                  </div>
                  <span className="text-foreground bg-muted text-xs font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-gray-600 bg-background text-sm mb-2">Discover More</div>
        <div className="w-px h-8 bg-gray-300 mx-auto animate-pulse" />
      </div>
    </section>
  )
}