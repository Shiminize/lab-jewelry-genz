'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { Ruler, Info, CheckCircle } from 'lucide-react'

interface BraceletSizerProps {
  measurements: any
  handleMeasurementChange: (field: string, value: string) => void
}

export function BraceletSizer({ measurements, handleMeasurementChange }: BraceletSizerProps) {
  const braceletSizes = [
    { size: 'XS', length: '6.5"', wrist: '5.5-6"', comfort: 'Snug' },
    { size: 'S', length: '7"', wrist: '6-6.5"', comfort: 'Fitted' },
    { size: 'M', length: '7.5"', wrist: '6.5-7"', comfort: 'Comfortable' },
    { size: 'L', length: '8"', wrist: '7-7.5"', comfort: 'Loose' },
    { size: 'XL', length: '8.5"', wrist: '7.5-8"', comfort: 'Very Loose' }
  ]

  const braceletStyles = [
    {
      type: 'Tennis Bracelet',
      description: 'Delicate chain with continuous stones',
      fitRecommendation: 'Snug to fitted for security',
      addLength: '+0.5" to wrist measurement'
    },
    {
      type: 'Chain Bracelet',
      description: 'Classic link or rope chain styles',
      fitRecommendation: 'Comfortable with slight movement',
      addLength: '+0.75" to +1" to wrist measurement'
    },
    {
      type: 'Bangle',
      description: 'Rigid circular bracelet',
      fitRecommendation: 'Must slide over hand easily',
      addLength: '+1" to +1.5" to wrist measurement'
    },
    {
      type: 'Charm Bracelet',
      description: 'Chain with dangling charms',
      fitRecommendation: 'Loose fit to accommodate charms',
      addLength: '+1" to +1.25" to wrist measurement'
    }
  ]

  const getRecommendedSize = (wristSize: number) => {
    if (wristSize <= 6) return braceletSizes[0]
    if (wristSize <= 6.5) return braceletSizes[1]
    if (wristSize <= 7) return braceletSizes[2]
    if (wristSize <= 7.5) return braceletSizes[3]
    return braceletSizes[4]
  }

  const wristMeasurement = parseFloat(measurements.braceletLength)
  const recommendedSize = wristMeasurement ? getRecommendedSize(wristMeasurement) : null

  return (
    <section className="py-12 bg-background">
      <div className="container-luxury">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <Ruler className="w-12 h-12 mx-auto mb-6 text-accent" />
            <h2 className="text-section-heading mb-6">Bracelet Sizing Guide</h2>
            <p className="text-body-large text-foreground/70 max-w-3xl mx-auto text-left">
              Find your perfect bracelet fit for comfort and style.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Measurement Tool */}
            <div className="bg-muted p-8">
              <h3 className="text-subsection-heading mb-6">Measure Your Wrist</h3>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-body-small font-medium text-foreground">How to Measure:</h4>
                  <ol className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-foreground text-luxury-gold text-body-tiny flex items-center justify-center font-bold">1</span>
                      <span className="text-body-small text-foreground/80">Use a flexible measuring tape or string</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-foreground text-luxury-gold text-body-tiny flex items-center justify-center font-bold">2</span>
                      <span className="text-body-small text-foreground/80">Wrap around wrist where bracelet will sit</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-foreground text-luxury-gold text-body-tiny flex items-center justify-center font-bold">3</span>
                      <span className="text-body-small text-foreground/80">Make sure tape is snug but not tight</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-foreground text-luxury-gold text-body-tiny flex items-center justify-center font-bold">4</span>
                      <span className="text-body-small text-foreground/80">Record measurement in inches</span>
                    </li>
                  </ol>
                </div>

                <div>
                  <label className="block text-body-small font-medium text-foreground mb-2">
                    Wrist Measurement (inches)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={measurements.braceletLength}
                    onChange={(e) => handleMeasurementChange('braceletLength', e.target.value)}
                    className="w-full px-4 py-3 border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-colors"
                    placeholder="Enter wrist size in inches"
                  />
                </div>

                {recommendedSize && (
                  <div className="bg-background p-6 border border-accent/30">
                    <h4 className="text-body-small font-medium text-foreground mb-3">Recommended Size:</h4>
                    <div className="grid grid-cols-3 gap-4 align-marketing">
                      <div>
                        <div className="text-subsection-heading text-accent">{recommendedSize.size}</div>
                        <div className="text-caption text-foreground/70">Size</div>
                      </div>
                      <div>
                        <div className="text-subsection-heading text-accent">{recommendedSize.length}</div>
                        <div className="text-caption text-foreground/70">Length</div>
                      </div>
                      <div>
                        <div className="text-subsection-heading text-accent">{recommendedSize.comfort}</div>
                        <div className="text-caption text-foreground/70">Fit</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Size Chart */}
            <div>
              <h3 className="text-subsection-heading mb-6">Bracelet Size Chart</h3>
              
              <div className="space-y-4">
                {braceletSizes.map((size, index) => (
                  <div 
                    key={index} 
                    className={`p-4 border transition-colors ${
                      recommendedSize?.size === size.size 
                        ? 'border-accent bg-accent/5' 
                        : 'border-border hover:border-border'
                    }`}
                  >
                    <div className="grid grid-cols-4 gap-4 items-center">
                      <div className="font-medium text-foreground">{size.size}</div>
                      <div className="text-body-small text-foreground/80">{size.length}</div>
                      <div className="text-body-small text-foreground/80">{size.wrist}</div>
                      <div className="text-body-small text-foreground/80">{size.comfort}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-4 py-3 border-b border-border text-body-small font-medium text-foreground mb-4">
                <div>Size</div>
                <div>Length</div>
                <div>Wrist Size</div>
                <div>Fit</div>
              </div>
            </div>
          </div>

          {/* Style-Specific Recommendations */}
          <div className="bg-muted p-8">
            <h3 className="text-subsection-heading mb-8 align-marketing">Style-Specific Sizing</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {braceletStyles.map((style, index) => (
                <div key={index} className="bg-background p-6">
                  <h4 className="text-subsection-heading mb-3">{style.type}</h4>
                  <p className="text-body-small text-foreground/70 mb-4">{style.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-body-small text-foreground/80">
                        <strong>Fit:</strong> {style.fitRecommendation}
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-body-small text-foreground/80">
                        <strong>Sizing:</strong> {style.addLength}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fit Guide */}
          <div className="mt-12 bg-blue-50 border border-blue-200 p-8">
            <div className="align-marketing mb-6">
              <Info className="w-8 h-8 mx-auto mb-4 text-blue-600" />
              <h3 className="text-subsection-heading text-blue-900 mb-4">Perfect Fit Guidelines</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="align-marketing">
                <h4 className="text-body-small font-medium text-blue-900 mb-2">Too Tight</h4>
                <p className="text-caption text-blue-800">Leaves marks, difficult to move, uncomfortable</p>
              </div>
              <div className="align-marketing">
                <h4 className="text-body-small font-medium text-blue-900 mb-2">Perfect Fit</h4>
                <p className="text-caption text-blue-800">Moves freely, comfortable, secure positioning</p>
              </div>
              <div className="align-marketing">
                <h4 className="text-body-small font-medium text-blue-900 mb-2">Too Loose</h4>
                <p className="text-caption text-blue-800">Slides around, may fall off, catches on things</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}