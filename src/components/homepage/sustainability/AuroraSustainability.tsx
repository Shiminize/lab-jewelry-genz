'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { H2, H3, BodyText, AuroraStatement, AuroraTitleM, AuroraBodyM } from '@/components/foundation/Typography'
import { Button } from '@/components/ui'
import { Icon } from '@/components/ui/Icon'

export function AuroraSustainability({ className }: { className?: string }) {
  const impacts = [
    {
      iconName: 'globe',
      iconColor: 'text-semantic-success',
      title: 'Zero Mining Impact',
      description:
        'Our lab-grown diamonds require no mining, preserving natural ecosystems and communities.'
    },
    {
      iconName: 'zap',
      iconColor: 'text-semantic-warning',
      title: 'Renewable Energy',
      description:
        '100% renewable energy powers our diamond growing facilities and production centers.'
    },
    {
      iconName: 'certificate',
      iconColor: 'text-brand-primary',
      title: 'Full Transparency',
      description:
        'Complete supply chain visibility with certification for every stone and metal we use.'
    },
    {
      iconName: 'recycle',
      iconColor: 'text-semantic-success',
      title: 'Circular Design',
      description:
        'Designed for longevity with lifetime warranties and recycling programs for metals.'
    }
  ]

  return (
    <section className={cn('py-token-4xl bg-neutral-900 text-white', className)}>
      <div className="container mx-auto px-token-lg">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-token-3xl items-center">
            <div>
              <AuroraStatement>
                The Future of Luxury
                <span className="block text-brand-secondary">is Sustainable</span>
              </AuroraStatement>
              <AuroraBodyM>
                We believe luxury shouldn&apos;t come at the expense of our planet. Every piece in our
                collection represents a commitment to ethical sourcing, environmental responsibility,
                and social impact.
              </AuroraBodyM>
              <div className="grid sm:grid-cols-2 gap-token-xl mb-token-xl">
                {impacts.map((impact, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Icon name={impact.iconName} size={24} className={cn('transition-all duration-300', impact.iconColor)} />
                    </div>
                    <div>
                      <AuroraTitleM>{impact.title}</AuroraTitleM>
                      <AuroraBodyM>{impact.description}</AuroraBodyM>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="default" size="lg">Learn Our Impact Story</Button>
            </div>
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-3xl p-token-xl h-80 flex flex-col items-center justify-center border border-white/10">
                <div className="mb-6">
                  <Icon name="leaf" size={64} className="text-semantic-success transition-all duration-token-normal" />
                </div>
                <H3>Impact Visualization</H3>
                <BodyText>Interactive sustainability metrics and impact data would be displayed here</BodyText>
              </div>
              <div className="grid grid-cols-3 gap-token-md">
                {[
                  { name: 'B-Corp', iconName: 'award', color: 'text-yellow-400' },
                  { name: 'Carbon Neutral', iconName: 'leaf', color: 'text-semantic-success' },
                  { name: 'Fair Trade', iconName: 'verified', color: 'text-brand-primary' }
                ].map((cert, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <div className="mb-2 flex justify-center">
                      <Icon name={cert.iconName} size={20} className={cn('transition-all duration-300', cert.color)} />
                    </div>
                    <div className="text-sm font-semibold">{cert.name}</div>
                    <div className="text-xs text-neutral-400">Certified</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-token-5xl pt-token-4xl border-t border-white/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: '0', label: 'Mining Required', unit: 'tons' },
                { number: '75%', label: 'Less Energy', unit: 'vs traditional' },
                { number: '100%', label: 'Traceable', unit: 'supply chain' },
                { number: '50K+', label: 'Trees Protected', unit: 'equivalent' }
              ].map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl md:text-4xl font-bold text-brand-secondary mb-2">{stat.number}</div>
                  <div className="font-semibold mb-1">{stat.label}</div>
                  <div className="text-sm text-neutral-400">{stat.unit}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


