'use client'

import React, { useState } from 'react'
import { Gift, Users, TrendingUp, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { H1, BodyText } from '@/components/foundation/Typography'
// TODO: Create referral components
// import { ReferralHero } from '@/components/referral/ReferralHero'
// import { HowItWorks } from '@/components/referral/HowItWorks'  
// import { ReferralTracking } from '@/components/referral/ReferralTracking'
// import { RewardsLevels } from '@/components/referral/RewardsLevels'

type ReferralTab = 'overview' | 'how-it-works' | 'tracking' | 'rewards'

// Mock referral code - replace with real auth data
const mockReferralCode = 'GLITCH50'

export default function ReferralPage() {
  const [activeTab, setActiveTab] = useState<ReferralTab>('overview')

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <section className="py-12">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Gift className="w-16 h-16 mx-auto mb-6 text-accent" />
                <h2 className="text-3xl font-headline mb-6 text-foreground">
                  Your Friends Deserve Better Than Mined Diamonds Too
                </h2>
                <p className="text-xl text-aurora-nav-muted max-w-2xl mx-auto mb-8">
                  You found the secret to guilt-free gorgeous jewelry—now share it! When your friends discover 
                  lab-grown diamonds, you both win. They get $25 off, you get $50 credit. It's like getting paid to be a good friend.
                </p>
                
                <div className="bg-background p-8 rounded-lg border border-border mb-8">
                  <div className="text-center mb-6">
                    <div className="inline-block bg-accent/10 px-6 py-3 rounded-lg mb-4">
                      <span className="text-2xl font-headline text-accent">
                        {mockReferralCode}
                      </span>
                    </div>
                    <p className="text-aurora-nav-muted">Your Referral Code</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="primary">
                      Start Earning
                    </Button>
                    <Button variant="secondary">
                      Share the Love
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💰</span>
                    </div>
                    <h3 className="font-medium text-foreground mb-2">You Get Paid $50</h3>
                    <p className="text-sm text-aurora-nav-muted">Basically free jewelry for being awesome</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🎁</span>
                    </div>
                    <h3 className="font-medium text-foreground mb-2">They Save $25</h3>
                    <p className="text-sm text-aurora-nav-muted">Their first sustainable jewelry purchase</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">♾️</span>
                    </div>
                    <h3 className="font-medium text-foreground mb-2">Unlimited Good Karma</h3>
                    <p className="text-sm text-aurora-nav-muted">The more you share, the more you save</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )
      case 'how-it-works':
        return (
          <div className="py-12 text-center">
            <H1>How It Works</H1>
            <BodyText>Referral process coming soon!</BodyText>
          </div>
        )
      case 'tracking':
        return (
          <div className="py-12 text-center">
            <H1>Tracking</H1>
            <BodyText>Your referral code: {mockReferralCode}</BodyText>
          </div>
        )
      case 'rewards':
        return (
          <div className="py-12 text-center">
            <H1>Rewards</H1>
            <BodyText>Reward levels coming soon!</BodyText>
          </div>
        )
      default:
        return (
          <section className="py-12">
            <div className="text-center">
              <p className="text-foreground/70">Select a section to view content.</p>
            </div>
          </section>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Placeholder for ReferralHero component */}
      <div className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
          <H1>Referral Program</H1>
          <BodyText>Share the love and earn rewards!</BodyText>
          <BodyText>Your code: {mockReferralCode}</BodyText>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {renderContent()}
      </main>
    </div>
  )
}