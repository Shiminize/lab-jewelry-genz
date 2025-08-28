'use client'

import React, { useState } from 'react'
import { Ruler, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type ActiveTab = 'rings' | 'necklaces' | 'bracelets'

interface RingSize {
  US: number
  UK: string
  EU: number
  JP: number
  circumference: number
}

const RING_SIZES: RingSize[] = [
  { US: 4, UK: 'H', EU: 46, JP: 6, circumference: 46.7 },
  { US: 4.5, UK: 'I', EU: 47, JP: 7, circumference: 47.7 },
  { US: 5, UK: 'J', EU: 49, JP: 9, circumference: 49.3 },
  { US: 5.5, UK: 'K', EU: 51, JP: 11, circumference: 51.2 },
  { US: 6, UK: 'L', EU: 52, JP: 12, circumference: 52.5 },
  { US: 6.5, UK: 'M', EU: 53, JP: 13, circumference: 53.5 },
  { US: 7, UK: 'N', EU: 54, JP: 14, circumference: 54.4 },
  { US: 7.5, UK: 'O', EU: 55, JP: 15, circumference: 55.7 },
  { US: 8, UK: 'P', EU: 57, JP: 16, circumference: 57.0 },
  { US: 8.5, UK: 'Q', EU: 58, JP: 17, circumference: 58.3 },
  { US: 9, UK: 'R', EU: 59, JP: 18, circumference: 59.5 },
  { US: 9.5, UK: 'S', EU: 60, JP: 19, circumference: 60.8 },
  { US: 10, UK: 'T', EU: 61, JP: 20, circumference: 62.1 }
]

export default function SizingPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('rings')
  
  // Ring sizing states
  const [circumference, setCircumference] = useState('')
  const [existingSize, setExistingSize] = useState('')
  const [calculatedSize, setCalculatedSize] = useState<RingSize | null>(null)
  
  // Necklace states
  const [selectedLength, setSelectedLength] = useState('')
  
  // Bracelet states
  const [wristSize, setWristSize] = useState('')
  const [fitPreference, setFitPreference] = useState('')

  const calculateRingSize = () => {
    const circ = parseFloat(circumference)
    if (circ > 0) {
      const closest = RING_SIZES.reduce((prev, curr) => 
        Math.abs(curr.circumference - circ) < Math.abs(prev.circumference - circ) ? curr : prev
      )
      setCalculatedSize(closest)
    }
  }

  const findExistingSize = () => {
    const size = parseFloat(existingSize)
    if (size > 0) {
      const found = RING_SIZES.find(s => s.US === size)
      if (found) setCalculatedSize(found)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-headline mb-6 text-foreground">
              Find Your Perfect Size
            </h1>
            <p className="text-xl text-aurora-nav-muted max-w-2xl mx-auto mb-8 leading-relaxed">
              No more guessing games. Use our sizing tools to get it right the first time, 
              because returning stuff is annoying.
            </p>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-8 py-4">
            {[
              { id: 'rings' as ActiveTab, label: 'Ring Sizer', icon: '💍' },
              { id: 'necklaces' as ActiveTab, label: 'Necklace Guide', icon: '📿' },
              { id: 'bracelets' as ActiveTab, label: 'Bracelet Sizer', icon: '📿' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-foreground text-background'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Ring Sizing Calculator */}
      {activeTab === 'rings' && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-headline text-foreground mb-8 text-center">
                Ring Size Calculator
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Method 1: Circumference Measurement */}
                <div className="bg-background p-6 rounded-lg border border-border">
                  <h3 className="text-xl font-headline text-foreground mb-4">Method 1: Measure Circumference</h3>
                  <p className="text-aurora-nav-muted mb-4">
                    Wrap a string around your finger, mark where it overlaps, then measure the length.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="circumference" className="block text-sm font-medium text-foreground mb-2">
                        Circumference (mm)
                      </label>
                      <Input
                        id="circumference"
                        type="number"
                        value={circumference}
                        onChange={(e) => setCircumference(e.target.value)}
                        placeholder="Like 16.5 or 18.2"
                        step="0.1"
                      />
                      <p className="text-xs text-aurora-nav-muted mt-1">Room temperature is best - not when you're hot or cold</p>
                    </div>
                    
                    <Button 
                      onClick={calculateRingSize}
                      variant="primary"
                      className="w-full"
                      disabled={!circumference}
                    >
                      Calculate Size
                    </Button>
                  </div>
                </div>

                {/* Method 2: Existing Ring */}
                <div className="bg-background p-6 rounded-lg border border-border">
                  <h3 className="text-xl font-headline text-foreground mb-4">Method 2: I Know My Size</h3>
                  <p className="text-aurora-nav-muted mb-4">
                    Already know your US ring size? Enter it here to see all the conversions.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="existingSize" className="block text-sm font-medium text-foreground mb-2">
                        Your US Ring Size
                      </label>
                      <Input
                        id="existingSize"
                        type="number"
                        value={existingSize}
                        onChange={(e) => setExistingSize(e.target.value)}
                        placeholder="Like 7 or 7.5"
                        step="0.5"
                        min="4"
                        max="12"
                      />
                    </div>
                    
                    <Button 
                      onClick={findExistingSize}
                      variant="primary"
                      className="w-full"
                      disabled={!existingSize}
                    >
                      Convert Size
                    </Button>
                  </div>
                </div>
              </div>

              {/* Size Results */}
              {calculatedSize && (
                <div className="mt-8 bg-muted text-foreground p-6 rounded-lg">
                  <h3 className="text-xl font-headline text-foreground mb-4 text-center">Your Ring Size</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-headline text-accent">{calculatedSize.US}</div>
                      <div className="text-sm text-aurora-nav-muted">US Size</div>
                    </div>
                    <div>
                      <div className="text-2xl font-headline text-accent">{calculatedSize.UK}</div>
                      <div className="text-sm text-aurora-nav-muted">UK Size</div>
                    </div>
                    <div>
                      <div className="text-2xl font-headline text-accent">{calculatedSize.EU}</div>
                      <div className="text-sm text-aurora-nav-muted">EU Size</div>
                    </div>
                    <div>
                      <div className="text-2xl font-headline text-accent">{calculatedSize.JP}</div>
                      <div className="text-sm text-aurora-nav-muted">Japan Size</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sizing Tips */}
              <div className="mt-8 bg-background p-6 rounded-lg border border-border">
                <h3 className="text-lg font-headline text-foreground mb-4">Pro Tips for Accurate Sizing</h3>
                <div className="grid md:grid-cols-2 gap-6 text-aurora-nav-muted">
                  <div>
                    <p className="font-medium mb-2">Best Time to Measure:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• End of day when fingers are slightly swollen</li>
                      <li>• Room temperature (not too hot or cold)</li>
                      <li>• When your hands aren't wet or dry</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Getting It Right:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• Measure the finger you'll actually wear it on</li>
                      <li>• Wide bands need to be 1/2 size larger</li>
                      <li>• If between sizes, go slightly larger</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Necklace Length Guide */}
      {activeTab === 'necklaces' && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-headline text-foreground mb-8 text-center">
                Necklace Length Guide
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-headline text-foreground mb-4">Choose Your Length</h3>
                  <p className="text-aurora-nav-muted mb-6">
                    Different lengths create different looks. Click on a length to see how it typically sits.
                  </p>
                  
                  {[
                    { length: '16"', name: 'Choker', description: 'Sits right at the base of your neck', style: 'close and trendy' },
                    { length: '18"', name: 'Princess', description: 'Most popular length - hits just below your collarbone', style: 'classic everyday' },
                    { length: '20"', name: 'Matinee', description: 'Falls a few inches below the collarbone', style: 'perfect for pendants' },
                    { length: '24"', name: 'Opera', description: 'Hits around your sternum area', style: 'elegant and formal' },
                    { length: '28"', name: 'Rope', description: 'Long enough to layer or wear as a statement', style: 'versatile layering' }
                  ].map((option) => (
                    <div
                      key={option.length}
                      onClick={() => setSelectedLength(option.length)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedLength === option.length 
                          ? 'border-accent bg-accent text-foreground' 
                          : 'border-border bg-background hover:border-accent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-headline text-lg">{option.length} - {option.name}</div>
                          <div className={`text-sm ${selectedLength === option.length ? 'text-foreground' : 'text-aurora-nav-muted'}`}>
                            {option.description}
                          </div>
                          <div className={`text-xs italic ${selectedLength === option.length ? 'text-foreground' : 'text-aurora-nav-muted'}`}>
                            {option.style}
                          </div>
                        </div>
                        {selectedLength === option.length && (
                          <ArrowRight className="w-5 h-5 text-foreground" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-background p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-headline text-foreground mb-4">Sizing Yourself</h3>
                  <div className="space-y-4 text-aurora-nav-muted">
                    <div>
                      <p className="font-medium mb-2">What You Need:</p>
                      <p className="text-sm">A measuring tape or string + ruler</p>
                    </div>
                    <div>
                      <p className="font-medium mb-2">How to Measure:</p>
                      <ol className="text-sm space-y-1 list-decimal list-inside">
                        <li>Put the measuring tape around your neck where you want the necklace to sit</li>
                        <li>Add 2-4 inches depending on how loose you want it</li>
                        <li>That's your ideal necklace length</li>
                      </ol>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Quick Reference:</p>
                      <div className="text-sm space-y-1">
                        <p>• Tight fit: +2 inches to neck measurement</p>
                        <p>• Comfortable: +3 inches</p>
                        <p>• Loose/layering: +4+ inches</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedLength && (
                    <div className="mt-4 p-4 bg-muted text-foreground rounded-lg">
                      <p className="font-medium">You selected: {selectedLength}</p>
                      <p className="text-sm text-aurora-nav-muted mt-1">
                        This length is great for {selectedLength === '16"' ? 'a modern, close-to-neck look' : 
                        selectedLength === '18"' ? 'everyday wear and most outfits' :
                        selectedLength === '20"' ? 'showcasing pendants or charms' :
                        selectedLength === '24"' ? 'formal events and elegant looks' :
                        'layering with shorter necklaces'}.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Bracelet Sizing */}
      {activeTab === 'bracelets' && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-headline text-foreground mb-8 text-center">
                Bracelet Size Calculator
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-background p-6 rounded-lg border border-border">
                  <h3 className="text-xl font-headline text-foreground mb-4">Measure Your Wrist</h3>
                  <p className="text-aurora-nav-muted mb-4">
                    Wrap a measuring tape around your wrist bone, or use a string and measure it.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="wristSize" className="block text-sm font-medium text-foreground mb-2">
                        Wrist Circumference (inches)
                      </label>
                      <Input
                        id="wristSize"
                        type="number"
                        value={wristSize}
                        onChange={(e) => setWristSize(e.target.value)}
                        placeholder="Like 6.5 or 7.25"
                        step="0.25"
                        min="5"
                        max="10"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        How do you like your bracelets to fit?
                      </label>
                      <div className="space-y-2">
                        {[
                          { value: 'snug', label: 'Snug (+0.5")', desc: 'Sits close to wrist' },
                          { value: 'comfortable', label: 'Comfortable (+0.75")', desc: 'Most popular fit' },
                          { value: 'loose', label: 'Loose (+1")', desc: 'Slides around easily' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="fitPreference"
                              value={option.value}
                              checked={fitPreference === option.value}
                              onChange={(e) => setFitPreference(e.target.value)}
                              className="text-accent focus:ring-accent"
                            />
                            <div>
                              <div className="font-medium text-foreground">{option.label}</div>
                              <div className="text-sm text-aurora-nav-muted">{option.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-background p-6 rounded-lg border border-border">
                  <h3 className="text-xl font-headline text-foreground mb-4">Your Bracelet Size</h3>
                  
                  {wristSize && fitPreference ? (
                    <div className="text-center">
                      <div className="text-3xl font-headline text-accent mb-2">
                        {(parseFloat(wristSize) + 
                          (fitPreference === 'snug' ? 0.5 : 
                           fitPreference === 'comfortable' ? 0.75 : 1)).toFixed(2)}"
                      </div>
                      <div className="text-aurora-nav-muted mb-4">Recommended bracelet size</div>
                      
                      <div className="bg-muted text-foreground p-4 rounded-lg text-left">
                        <p className="font-medium mb-2">Size Breakdown:</p>
                        <p className="text-sm text-aurora-nav-muted">Your wrist: {wristSize}"</p>
                        <p className="text-sm text-aurora-nav-muted">
                          Added for {fitPreference} fit: +{
                            fitPreference === 'snug' ? '0.5' : 
                            fitPreference === 'comfortable' ? '0.75' : '1'
                          }"
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-aurora-nav-muted">
                      <Ruler className="w-12 h-12 mx-auto mb-4 text-muted" />
                      <p>Enter your measurements above to see your recommended bracelet size</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* General Sizing Tips */}
      <section className="py-16 bg-muted text-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-headline text-foreground mb-6">
              Still Not Sure?
            </h2>
            <p className="text-aurora-nav-muted mb-6">
              If you're between sizes or have questions, we're here to help. 
              Plus, we offer free exchanges if the size isn't quite right.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg">
                Contact Sizing Help
              </Button>
              <Button variant="secondary" size="lg">
                Order Ring Sizer
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}