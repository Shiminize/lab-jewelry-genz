'use client'

import React from 'react'
import { Calculator, Info, Star } from 'lucide-react'

export function EarringReference() {
  const earringStyles = [
    {
      style: 'Stud Earrings',
      sizes: ['2mm', '4mm', '6mm', '8mm', '10mm'],
      description: 'Classic, versatile style perfect for daily wear',
      faceShape: 'Suits all face shapes',
      occasion: 'Everyday, professional, formal'
    },
    {
      style: 'Hoop Earrings',
      sizes: ['15mm', '20mm', '30mm', '40mm', '50mm'],
      description: 'Circular style ranging from delicate to statement',
      faceShape: 'Best for oval and square faces',
      occasion: 'Casual to formal depending on size'
    },
    {
      style: 'Drop Earrings',
      sizes: ['10mm', '15mm', '25mm', '35mm', '45mm'],
      description: 'Hanging style that moves with you',
      faceShape: 'Elongates round faces',
      occasion: 'Evening wear, special occasions'
    },
    {
      style: 'Chandelier',
      sizes: ['30mm', '40mm', '50mm', '60mm', '70mm'],
      description: 'Elaborate, multi-tiered statement pieces',
      faceShape: 'Best for heart and oval faces',
      occasion: 'Formal events, parties'
    }
  ]

  const faceShapeGuide = [
    {
      shape: 'Round Face',
      features: 'Width and length are similar, soft curves',
      bestStyles: ['Drop earrings', 'Long dangles', 'Angular shapes'],
      avoid: ['Large hoops', 'Button studs', 'Circular shapes'],
      goal: 'Add length and angles to elongate'
    },
    {
      shape: 'Oval Face',
      features: 'Length greater than width, balanced proportions',
      bestStyles: ['Most styles work', 'Studs', 'Hoops', 'Drops'],
      avoid: ['Very long styles that over-elongate'],
      goal: 'Most versatile - can wear any style'
    },
    {
      shape: 'Square Face',
      features: 'Strong jawline, width and length similar',
      bestStyles: ['Curved hoops', 'Soft drops', 'Rounded shapes'],
      avoid: ['Geometric shapes', 'Square studs', 'Angular designs'],
      goal: 'Soften strong angles with curves'
    },
    {
      shape: 'Heart Face',
      features: 'Wider forehead, narrow chin',
      bestStyles: ['Wider bottoms', 'Teardrops', 'Chandelier'],
      avoid: ['Top-heavy designs', 'Wide studs'],
      goal: 'Balance wider forehead with wider bottom'
    },
    {
      shape: 'Long Face',
      features: 'Length significantly greater than width',
      bestStyles: ['Studs', 'Small hoops', 'Wide horizontals'],
      avoid: ['Long drops', 'Linear designs', 'Very long styles'],
      goal: 'Add width and avoid extra length'
    }
  ]

  const sizeComparison = [
    { size: '2-4mm', description: 'Delicate, barely-there look', wear: 'Professional, everyday subtle' },
    { size: '5-6mm', description: 'Classic, noticeable but not bold', wear: 'Most popular everyday size' },
    { size: '7-8mm', description: 'Statement without being dramatic', wear: 'Evening out, special occasions' },
    { size: '9-10mm', description: 'Bold, conversation starter', wear: 'Fashion-forward, statement looks' },
    { size: '11mm+', description: 'Dramatic, red-carpet worthy', wear: 'Special events, photo shoots' }
  ]

  return (
    <section className="py-12 bg-background">
      <div className="container-luxury">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <Calculator className="w-12 h-12 mx-auto mb-6 text-accent" />
            <h2 className="text-section-heading mb-6">Earring Style & Size Guide</h2>
            <p className="text-body-large text-foreground/70 max-w-3xl mx-auto text-left">
              Choose earrings that complement your face shape and personal style.
            </p>
          </div>

          {/* Earring Styles */}
          <div className="mb-16">
            <h3 className="text-subsection-heading mb-8 align-marketing">Earring Styles & Sizes</h3>
            
            <div className="space-y-6">
              {earringStyles.map((style, index) => (
                <div key={index} className="bg-muted p-8">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-subsection-heading text-accent mb-3">{style.style}</h4>
                      <p className="text-body-small text-foreground/70">{style.description}</p>
                    </div>
                    
                    <div>
                      <h5 className="text-body-small font-medium text-foreground mb-3">Common Sizes:</h5>
                      <div className="flex flex-wrap gap-2">
                        {style.sizes.map((size, idx) => (
                          <span key={idx} className="px-3 py-1 bg-background text-body-small border border-border">
                            {size}
                          </span>
                        ))}
                      </div>
                      
                      <div className="mt-4">
                        <h5 className="text-body-small font-medium text-foreground mb-2">Best For:</h5>
                        <p className="text-body-small text-foreground/70">{style.faceShape}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-body-small font-medium text-foreground mb-2">Occasions:</h5>
                      <p className="text-body-small text-foreground/70">{style.occasion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Face Shape Guide */}
          <div className="mb-16">
            <h3 className="text-subsection-heading mb-8 align-marketing">Face Shape Guide</h3>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {faceShapeGuide.map((guide, index) => (
                <div key={index} className="bg-background border border-border p-6">
                  <h4 className="text-subsection-heading mb-3">{guide.shape}</h4>
                  <p className="text-body-small text-foreground/70 mb-4">{guide.features}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-body-small font-medium text-green-700 mb-2">✓ Best Styles:</h5>
                      <ul className="space-y-1">
                        {guide.bestStyles.map((style, idx) => (
                          <li key={idx} className="text-body-small text-foreground/80">• {style}</li>
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
                    
                    <div className="bg-muted p-3">
                      <h5 className="text-body-small font-medium text-foreground mb-1">Goal:</h5>
                      <p className="text-caption text-foreground/80">{guide.goal}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Size Comparison */}
          <div className="bg-muted p-8">
            <h3 className="text-subsection-heading mb-8 align-marketing">Size Impact Guide</h3>
            
            <div className="space-y-4">
              {sizeComparison.map((size, index) => (
                <div key={index} className="bg-background p-6 border-l-4 border-accent">
                  <div className="grid md:grid-cols-3 gap-4 items-center">
                    <div className="font-medium text-accent text-body-regular">{size.size}</div>
                    <div className="text-body-small text-foreground/80">{size.description}</div>
                    <div className="text-body-small text-foreground/70">{size.wear}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Professional Tips */}
          <div className="mt-12 bg-blue-50 border border-blue-200 p-8">
            <div className="align-marketing mb-6">
              <Star className="w-8 h-8 mx-auto mb-4 text-blue-600" />
              <h3 className="text-subsection-heading text-blue-900 mb-4">Professional Styling Tips</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-body-small font-medium text-blue-900 mb-3">Proportion Guidelines:</h4>
                <ul className="space-y-2 text-body-small text-blue-800">
                  <li>• Earrings should be proportional to your features</li>
                  <li>• Larger features can handle bigger earrings</li>
                  <li>• Petite features look best with delicate styles</li>
                  <li>• Consider your hairstyle when choosing size</li>
                </ul>
              </div>
              <div>
                <h4 className="text-body-small font-medium text-blue-900 mb-3">Styling Considerations:</h4>
                <ul className="space-y-2 text-body-small text-blue-800">
                  <li>• Short hair showcases earrings more prominently</li>
                  <li>• Up-dos call for statement earrings</li>
                  <li>• Long hair works with longer, more dramatic styles</li>
                  <li>• Consider neckline when choosing earring length</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Metal & Stone Considerations */}
          <div className="mt-8 bg-background border border-border p-8">
            <h3 className="text-subsection-heading mb-6 align-marketing">Additional Considerations</h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-body-small font-medium text-foreground mb-3">Metal Choice:</h4>
                <ul className="space-y-2 text-body-small text-foreground/70">
                  <li>• Gold tones warm cool complexions</li>
                  <li>• Silver/white metals complement warm tones</li>
                  <li>• Consider existing jewelry in your outfit</li>
                  <li>• Mix metals thoughtfully for modern looks</li>
                </ul>
              </div>
              <div>
                <h4 className="text-body-small font-medium text-foreground mb-3">Stone Selection:</h4>
                <ul className="space-y-2 text-body-small text-foreground/70">
                  <li>• Clear stones like diamonds are most versatile</li>
                  <li>• Colored stones can complement eye color</li>
                  <li>• Consider skin undertones when choosing colors</li>
                  <li>• Matte finishes for understated elegance</li>
                </ul>
              </div>
              <div>
                <h4 className="text-body-small font-medium text-foreground mb-3">Comfort Factors:</h4>
                <ul className="space-y-2 text-body-small text-foreground/70">
                  <li>• Weight matters for long wear comfort</li>
                  <li>• Secure backs prevent loss</li>
                  <li>• Hypoallergenic materials for sensitive ears</li>
                  <li>• Consider lifestyle and activity level</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}