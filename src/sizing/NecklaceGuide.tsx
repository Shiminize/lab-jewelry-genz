'use client'

import React from 'react'
import { Heart, Info } from 'lucide-react'

interface NecklaceGuideProps {
  measurements: any
  handleMeasurementChange: (field: string, value: string) => void
}

export function NecklaceGuide({ measurements, handleMeasurementChange }: NecklaceGuideProps) {
  const necklaceLengths = [
    {
      name: 'Choker',
      length: '14-16"',
      description: 'Sits snugly around the neck',
      style: 'Bold, statement look',
      bestFor: 'Open necklines, off-shoulder styles'
    },
    {
      name: 'Princess',
      length: '17-19"',
      description: 'Classic length, sits at collarbone',
      style: 'Versatile, most popular',
      bestFor: 'All necklines, everyday wear'
    },
    {
      name: 'Matinee',
      length: '20-24"',
      description: 'Falls below collarbone',
      style: 'Elegant, professional',
      bestFor: 'Business attire, high necklines'
    },
    {
      name: 'Opera',
      length: '28-35"',
      description: 'Reaches the breastbone',
      style: 'Sophisticated, dramatic',
      bestFor: 'Evening wear, formal events'
    },
    {
      name: 'Rope',
      length: '36"+ ',
      description: 'Very long, can be doubled',
      style: 'Bohemian, layering',
      bestFor: 'Layering, versatile styling'
    }
  ]

  const necklineGuide = [
    {
      neckline: 'Crew Neck',
      recommendations: ['Princess (18")', 'Matinee (22")'],
      avoid: ['Choker (too close to neckline)']
    },
    {
      neckline: 'V-Neck',
      recommendations: ['Princess (17-19")', 'Pendant styles'],
      avoid: ['Very long lengths that get lost']
    },
    {
      neckline: 'Scoop Neck',
      recommendations: ['Princess (18")', 'Short Matinee (20")'],
      avoid: ['Chokers (competing lines)']
    },
    {
      neckline: 'Off-Shoulder',
      recommendations: ['Choker (14-16")', 'Short Princess (17")'],
      avoid: ['Long lengths that break the line']
    },
    {
      neckline: 'High Neck',
      recommendations: ['Matinee (22-24")', 'Opera (30-32")'],
      avoid: ['Short lengths that crowd the neck']
    },
    {
      neckline: 'Strapless',
      recommendations: ['All lengths work', 'Great for layering'],
      avoid: ['None - most versatile neckline']
    }
  ]

  return (
    <section className="py-12 bg-muted">
      <div className="container-luxury">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <Heart className="w-12 h-12 mx-auto mb-6 text-accent" />
            <h2 className="text-section-heading mb-6">Necklace Length Guide</h2>
            <p className="text-body-large text-foreground/70 max-w-3xl mx-auto text-left">
              Choose the perfect necklace length to complement your style and neckline.
            </p>
          </div>

          {/* Custom Measurement */}
          <div className="bg-background p-8 mb-12">
            <h3 className="text-subsection-heading mb-6">Find Your Ideal Length</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-body-small font-medium text-foreground">How to Measure:</h4>
                  <ol className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-foreground text-luxury-gold text-body-tiny flex items-center justify-center font-bold">1</span>
                      <span className="text-body-small text-foreground/80">Use a flexible measuring tape</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-foreground text-luxury-gold text-body-tiny flex items-center justify-center font-bold">2</span>
                      <span className="text-body-small text-foreground/80">Start at the base of your neck</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-foreground text-luxury-gold text-body-tiny flex items-center justify-center font-bold">3</span>
                      <span className="text-body-small text-foreground/80">Measure to where you want the necklace to fall</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-foreground text-luxury-gold text-body-tiny flex items-center justify-center font-bold">4</span>
                      <span className="text-body-small text-foreground/80">Double this measurement for total necklace length</span>
                    </li>
                  </ol>
                </div>

                <div>
                  <label className="block text-body-small font-medium text-foreground mb-2">
                    Preferred Necklace Length (inches)
                  </label>
                  <input
                    type="number"
                    value={measurements.necklaceLength}
                    onChange={(e) => handleMeasurementChange('necklaceLength', e.target.value)}
                    className="w-full px-4 py-3 border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-colors"
                    placeholder="Enter desired length"
                  />
                </div>
              </div>

              <div className="bg-muted p-6">
                <h4 className="text-body-small font-medium text-foreground mb-4">Quick Size Reference:</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-body-small text-foreground/70">Choker:</span>
                    <span className="text-body-small font-medium">14-16&quot;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-small text-foreground/70">Princess:</span>
                    <span className="text-body-small font-medium">17-19&quot;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-small text-foreground/70">Matinee:</span>
                    <span className="text-body-small font-medium">20-24&quot;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-small text-foreground/70">Opera:</span>
                    <span className="text-body-small font-medium">28-35&quot;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-small text-foreground/70">Rope:</span>
                    <span className="text-body-small font-medium">36&quot;+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Length Guide */}
          <div className="mb-12">
            <h3 className="text-subsection-heading mb-8 align-marketing">Necklace Length Styles</h3>
            
            <div className="space-y-6">
              {necklaceLengths.map((length, index) => (
                <div key={index} className="bg-background p-8 shadow-sm">
                  <div className="grid md:grid-cols-4 gap-6">
                    <div>
                      <h4 className="text-subsection-heading text-accent mb-2">{length.name}</h4>
                      <div className="text-body-regular font-medium text-foreground">{length.length}</div>
                    </div>
                    <div>
                      <h5 className="text-body-small font-medium text-foreground mb-2">Description</h5>
                      <p className="text-body-small text-foreground/70">{length.description}</p>
                    </div>
                    <div>
                      <h5 className="text-body-small font-medium text-foreground mb-2">Style</h5>
                      <p className="text-body-small text-foreground/70">{length.style}</p>
                    </div>
                    <div>
                      <h5 className="text-body-small font-medium text-foreground mb-2">Best For</h5>
                      <p className="text-body-small text-foreground/70">{length.bestFor}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Neckline Guide */}
          <div className="bg-background p-8">
            <h3 className="text-subsection-heading mb-8 align-marketing">Neckline Pairing Guide</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {necklineGuide.map((guide, index) => (
                <div key={index} className="bg-muted p-6">
                  <h4 className="text-subsection-heading mb-4">{guide.neckline}</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-body-small font-medium text-green-700 mb-2">✓ Recommended:</h5>
                      <ul className="space-y-1">
                        {guide.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-body-small text-foreground/80">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-body-small font-medium text-red-700 mb-2">✗ Avoid:</h5>
                      <ul className="space-y-1">
                        {guide.avoid.map((avoid, idx) => (
                          <li key={idx} className="text-body-small text-foreground/80">• {avoid}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Layering Tips */}
          <div className="mt-12 bg-accent/5 border border-accent/20 p-8">
            <div className="align-marketing mb-6">
              <Info className="w-8 h-8 mx-auto mb-4 text-accent" />
              <h3 className="text-subsection-heading text-foreground mb-4">Layering Tips</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-body-small font-medium text-foreground mb-3">Perfect Layering Formula:</h4>
                <ul className="space-y-2 text-body-small text-foreground/80">
                  <li>• Start with the shortest necklace (choker or princess)</li>
                  <li>• Add 2-4 inches between each layer</li>
                  <li>• Mix different chain styles and pendant sizes</li>
                  <li>• Limit to 3-4 layers for best effect</li>
                </ul>
              </div>
              <div>
                <h4 className="text-body-small font-medium text-foreground mb-3">Popular Combinations:</h4>
                <ul className="space-y-2 text-body-small text-foreground/80">
                  <li>• Choker (15&quot;) + Princess (18&quot;) + Matinee (22&quot;)</li>
                  <li>• Princess (17&quot;) + Matinee (24&quot;) + Opera (30&quot;)</li>
                  <li>• Simple chain + pendant + long chain</li>
                  <li>• Delicate layers in same metal family</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}