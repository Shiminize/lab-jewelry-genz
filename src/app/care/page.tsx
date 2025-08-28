'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'

export default function CarePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-headline mb-6 text-foreground">
              Keep Your Jewelry Looking Fresh
            </h1>
            <p className="text-xl text-aurora-nav-muted max-w-2xl mx-auto mb-8 leading-relaxed">
              Your jewelry should sparkle as long as you do. Here's how to keep your lab-grown diamonds 
              and favorite pieces looking like the day you got them.
            </p>
          </div>
        </div>
      </section>

      {/* Daily Care Tips */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-headline text-foreground mb-8 text-center">
              Daily Care That Actually Works
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-background p-6 rounded-lg border border-border">
                <h3 className="text-xl font-headline text-foreground mb-3">Before You Do Anything</h3>
                <ul className="text-aurora-nav-muted space-y-2">
                  <li>• Take off your jewelry before you hit the gym, jump in the pool, or deep-clean your apartment</li>
                  <li>• Remove rings before you wash your hands with harsh soaps</li>
                  <li>• Skip the jewelry when you're cooking with oils or messy ingredients</li>
                  <li>• Put jewelry on last when getting ready (after perfume, lotions, makeup)</li>
                </ul>
              </div>

              <div className="bg-background p-6 rounded-lg border border-border">
                <h3 className="text-xl font-headline text-foreground mb-3">After You Wear It</h3>
                <ul className="text-aurora-nav-muted space-y-2">
                  <li>• Give it a gentle wipe with a soft cloth before putting it away</li>
                  <li>• Check for any loose stones or bent prongs (better safe than sorry)</li>
                  <li>• Store each piece separately so they don't scratch each other</li>
                  <li>• Keep chains fastened so they don't tangle into a nightmare</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cleaning Guide */}
      <section className="py-16 bg-muted text-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-headline text-foreground mb-8 text-center">
              Cleaning Your Pieces
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-background p-6 rounded-lg">
                <h3 className="text-lg font-headline text-foreground mb-4">Lab-Grown Diamonds</h3>
                <div className="text-aurora-nav-muted space-y-2">
                  <p className="font-medium">What you need:</p>
                  <p>Warm water, mild dish soap, soft toothbrush</p>
                  <p className="font-medium mt-3">How to do it:</p>
                  <p>Soak for 15 minutes, gently brush, rinse with clean water, pat dry</p>
                </div>
              </div>

              <div className="bg-background p-6 rounded-lg">
                <h3 className="text-lg font-headline text-foreground mb-4">Moissanite</h3>
                <div className="text-aurora-nav-muted space-y-2">
                  <p className="font-medium">What you need:</p>
                  <p>Same as diamonds - they're basically indestructible</p>
                  <p className="font-medium mt-3">Pro tip:</p>
                  <p>Moissanite actually gets more sparkly when it's clean, so clean it often</p>
                </div>
              </div>

              <div className="bg-background p-6 rounded-lg">
                <h3 className="text-lg font-headline text-foreground mb-4">Gold & Silver</h3>
                <div className="text-aurora-nav-muted space-y-2">
                  <p className="font-medium">What you need:</p>
                  <p>Jewelry cleaning cloth or mild soap solution</p>
                  <p className="font-medium mt-3">Avoid:</p>
                  <p>Harsh chemicals, bleach, chlorine, ultrasonic cleaners for hollow pieces</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Storage Tips */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-headline text-foreground mb-8">
              Storage That Actually Protects
            </h2>
            
            <div className="bg-background p-8 rounded-lg border border-border mb-8">
              <div className="text-left space-y-4 text-aurora-nav-muted">
                <div>
                  <span className="inline-block w-8 h-8 bg-accent rounded-full text-background font-bold text-sm flex items-center justify-center mr-3 float-left mt-1">1</span>
                  <p><strong>Separate everything.</strong> Think of it like roommates - they need their own space or they'll fight. Use individual pouches or compartments.</p>
                </div>
                <div>
                  <span className="inline-block w-8 h-8 bg-accent rounded-full text-background font-bold text-sm flex items-center justify-center mr-3 float-left mt-1">2</span>
                  <p><strong>Keep it dry and dark.</strong> Your dresser drawer is perfect. Avoid the bathroom (too humid) and direct sunlight.</p>
                </div>
                <div>
                  <span className="inline-block w-8 h-8 bg-accent rounded-full text-background font-bold text-sm flex items-center justify-center mr-3 float-left mt-1">3</span>
                  <p><strong>Hang necklaces when possible.</strong> Less tangling = less frustration when you're rushing to get ready.</p>
                </div>
                <div>
                  <span className="inline-block w-8 h-8 bg-accent rounded-full text-background font-bold text-sm flex items-center justify-center mr-3 float-left mt-1">4</span>
                  <p><strong>Store rings in slots.</strong> Rolling around loose in a box is asking for scratches.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Care Checklist */}
      <section className="py-16 bg-muted text-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-headline text-foreground mb-8 text-center">
              Quick Care Checklist
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-background p-6 rounded-lg">
                <h3 className="text-lg font-headline text-foreground mb-4 text-center">✅ Do This</h3>
                <ul className="text-aurora-nav-muted space-y-2">
                  <li>• Clean your pieces regularly (monthly is fine)</li>
                  <li>• Check for loose stones or damage</li>
                  <li>• Store pieces separately</li>
                  <li>• Take jewelry off before swimming or exercising</li>
                  <li>• Get professional cleaning once a year</li>
                  <li>• Use a soft cloth for quick touch-ups</li>
                </ul>
              </div>

              <div className="bg-background p-6 rounded-lg">
                <h3 className="text-lg font-headline text-foreground mb-4 text-center">❌ Don't Do This</h3>
                <ul className="text-aurora-nav-muted space-y-2">
                  <li>• Don't use toothpaste to clean jewelry</li>
                  <li>• Don't store everything in one tangled pile</li>
                  <li>• Don't wear jewelry in hot tubs or pools</li>
                  <li>• Don't use harsh chemicals or bleach</li>
                  <li>• Don't ignore loose stones or bent prongs</li>
                  <li>• Don't sleep in delicate pieces</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-headline text-foreground mb-4">
              Need Professional Help?
            </h2>
            <p className="text-aurora-nav-muted mb-6">
              Some things are better left to the pros. Find a local jeweler for deep cleaning, 
              repairs, or if something doesn't look right.
            </p>
            <Button variant="primary" size="lg">
              Find Local Jewelers
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}