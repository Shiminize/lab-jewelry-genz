'use client'

import React from 'react'
import { H2, H3, BodyText, MutedText } from '@/components/foundation/Typography'
import { Star } from 'lucide-react'
import type { CreatorStats } from './socialProofData'

interface CreatorProgramHighlightProps {
  stats: CreatorStats
}

const creatorBenefits = [
  'Exclusive early access to new designs',
  'Personal analytics dashboard',
  'Dedicated creator support team',
  'Monthly creator spotlights',
  'Custom discount codes for followers'
]

export const CreatorProgramHighlight: React.FC<CreatorProgramHighlightProps> = ({ stats }) => (
  <div className="bg-gradient-to-r from-accent/5 to-accent/10 p-8 border border-accent/20 rounded-token-md">
    <div className="grid md:grid-cols-2 gap-8 items-center">
      <div>
        <H2 className="mb-4 text-foreground">Join Our Creator Community</H2>
        <BodyText className="mb-6 text-foreground">
          Earn industry-leading {stats.commissionRate}% commission while promoting 
          jewelry that aligns with your values. Our {stats.totalCreators}+ creators 
          average {stats.averageEarnings} monthly.
        </BodyText>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-background rounded-token-md">
            <H3 className="text-2xl font-bold text-accent">{stats.commissionRate}%</H3>
            <MutedText className="text-sm">Commission Rate</MutedText>
          </div>
          <div className="text-center p-4 bg-background rounded-token-md">
            <H3 className="text-2xl font-bold text-accent">{stats.averageEarnings}</H3>
            <MutedText className="text-sm">Avg Monthly</MutedText>
          </div>
        </div>
        <button 
          className="bg-cta text-background px-6 py-3 rounded-token-md font-semibold hover:bg-cta/90 transition-colors"
        >
          Apply Now
        </button>
      </div>
      <div className="space-y-token-md">
        <H3 className="text-foreground">Creator Benefits</H3>
        <ul className="space-y-token-sm">
          {creatorBenefits.map((benefit, index) => (
            <li key={index} className="flex items-center gap-2 text-foreground">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <BodyText className="text-sm">{benefit}</BodyText>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
)