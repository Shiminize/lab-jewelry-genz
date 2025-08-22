'use client'

import React from 'react'
import { Ruler, Calculator, Target, Heart } from 'lucide-react'

interface SizingHeroProps {
  selectedTool: string
  setSelectedTool: (tool: string) => void
}

export function SizingHero({ selectedTool, setSelectedTool }: SizingHeroProps) {
  const tools = [
    {
      id: 'ring-finder',
      name: 'Ring Finder',
      icon: Target,
      description: 'Find your perfect ring size with multiple measurement methods'
    },
    {
      id: 'bracelet-sizer',
      name: 'Bracelet Sizer',
      icon: Ruler,
      description: 'Determine ideal bracelet length for comfort and style'
    },
    {
      id: 'necklace-guide',
      name: 'Necklace Guide',
      icon: Heart,
      description: 'Choose the perfect necklace length for your style'
    },
    {
      id: 'earring-reference',
      name: 'Earring Reference',
      icon: Calculator,
      description: 'Size and style guide for earring selection'
    }
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="bg-background py-12 lg:py-20 border-b border-gray-100/30">
        <div className="container-luxury">
          <div className="max-w-4xl mx-auto align-marketing">
            <Ruler className="w-16 h-16 mx-auto mb-8 text-accent" />
            
            <h1 className="text-hero-headline mb-8">
              Perfect <span className="text-accent italic font-light">Fit Guarantee</span>
            </h1>
            
            <p className="text-body-large text-foreground/80 max-w-3xl mx-auto mb-12 leading-relaxed">
              Get the perfect fit every time with our comprehensive sizing tools and expert guidance. 
              From ring measurements to necklace lengths, we ensure your jewelry fits beautifully.
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="align-marketing">
                <div className="text-subsection-heading text-foreground mb-2">99.8%</div>
                <div className="text-body-small text-foreground/60 uppercase tracking-wider">Accuracy Rate</div>
              </div>
              <div className="align-marketing">
                <div className="text-subsection-heading text-foreground mb-2">Free</div>
                <div className="text-body-small text-foreground/60 uppercase tracking-wider">Resize Policy</div>
              </div>
              <div className="align-marketing">
                <div className="text-subsection-heading text-foreground mb-2">24/7</div>
                <div className="text-body-small text-foreground/60 uppercase tracking-wider">Sizing Support</div>
              </div>
              <div className="align-marketing">
                <div className="text-subsection-heading text-foreground mb-2">50K+</div>
                <div className="text-body-small text-foreground/60 uppercase tracking-wider">Perfect Fits</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Selection */}
      <section className="bg-muted py-8 sticky top-0 z-10 border-b border-gray-100/30">
        <div className="container-luxury">
          <div className="flex flex-wrap justify-center gap-4">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`flex items-center space-x-3 px-6 py-3 font-medium transition-all duration-300 ${
                  selectedTool === tool.id
                    ? 'bg-foreground text-luxury-gold shadow-md'
                    : 'bg-background text-foreground hover:bg-luxury-gold/10 hover:text-foreground'
                }`}
              >
                <tool.icon className="w-4 h-4" />
                <div className="text-left">
                  <div className="text-body-small font-medium">{tool.name}</div>
                  <div className="text-caption text-inherit opacity-80 hidden lg:block">{tool.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}