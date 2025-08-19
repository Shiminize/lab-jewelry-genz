'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BodyText, H4, H3 } from '@/components/foundation/Typography'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { MegaMenuContent } from './MegaMenu'
import { SocialProofData } from '@/data/navigation-genz'

interface GenZMegaMenuProps {
  content: MegaMenuContent & { socialProof?: SocialProofData }
  isVisible: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function GenZMegaMenu({ content, isVisible, onMouseEnter, onMouseLeave }: GenZMegaMenuProps) {
  if (!isVisible) return null

  return (
    <div
      className="absolute top-full left-0 w-full bg-background border-t border-border shadow-2xl z-50"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="menu"
      aria-label="Navigation menu"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Social Proof Header */}
        {content.socialProof && (
          <div className="mb-6 pb-4 border-b border-muted">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6">
                {content.socialProof.activeViewers && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <BodyText size="sm" className="text-muted">
                      {content.socialProof.activeViewers} others exploring this now
                    </BodyText>
                  </div>
                )}
                {content.socialProof.recentPurchases && content.socialProof.recentPurchases.length > 0 && (
                  <BodyText size="sm" className="text-muted">
                    💎 {content.socialProof.recentPurchases[0].customer} just designed "{content.socialProof.recentPurchases[0].product}"
                  </BodyText>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-1">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className="w-6 h-6 bg-gradient-to-br from-cta to-accent rounded-full border-2 border-background"
                    />
                  ))}
                </div>
                <BodyText size="sm" className="text-muted">
                  Join 50,000+ happy customers
                </BodyText>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-8">
          {/* Navigation Sections */}
          <div className="col-span-7 grid grid-cols-2 gap-8">
            {content.sections.map((section, index) => (
              <div key={section.title} className="space-y-4">
                <H4 className="font-headline font-semibold text-foreground border-b border-accent/20 pb-2 text-lg">
                  {section.title}
                  {index === 0 && (
                    <span className="ml-2 text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                </H4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="group block"
                        role="menuitem"
                        tabIndex={0}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <BodyText className="font-body font-medium text-foreground group-hover:text-cta transition-colors duration-200">
                              {link.name}
                            </BodyText>
                            {link.description && (
                              <BodyText size="sm" className="text-muted mt-1 group-hover:text-foreground transition-colors duration-200">
                                {link.description}
                              </BodyText>
                            )}
                          </div>
                          <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <svg className="w-4 h-4 text-cta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Featured Content & Social Proof */}
          <div className="col-span-5 space-y-6">
            {/* Featured Products */}
            {content.featuredProducts && (
              <div>
                <H4 className="font-headline font-semibold text-foreground mb-4 text-lg flex items-center">
                  Trending Now
                  <span className="ml-2 text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-1 rounded-full">
                    🔥 Hot
                  </span>
                </H4>
                <div className="grid grid-cols-2 gap-4">
                  {content.featuredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={product.href}
                      className="group block bg-background hover:bg-muted transition-all duration-300 rounded-lg overflow-hidden border border-transparent hover:border-cta/20 hover:shadow-lg"
                      role="menuitem"
                      tabIndex={0}
                    >
                      <div className="aspect-square relative bg-muted">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="bg-background/90 backdrop-blur-sm rounded-full p-1">
                            <svg className="w-4 h-4 text-cta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <BodyText size="sm" className="font-medium text-foreground group-hover:text-cta transition-colors duration-200">
                          {product.name}
                        </BodyText>
                        <div className="flex items-center justify-between mt-1">
                          <BodyText size="sm" className="text-cta font-semibold">
                            {product.price}
                          </BodyText>
                          <div className="flex items-center space-x-1">
                            <div className="flex text-yellow-400">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <BodyText size="xs" className="text-muted">4.9</BodyText>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Promotional Banner */}
            {content.promotionalBanner && (
              <div className="bg-gradient-to-r from-accent/10 via-cta/10 to-accent/10 rounded-lg p-6 border border-accent/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/20 to-cta/20 rounded-full blur-xl transform translate-x-16 -translate-y-16"></div>
                <div className="relative z-10">
                  <H4 className="font-headline font-semibold text-foreground mb-2 text-lg">
                    {content.promotionalBanner.title}
                  </H4>
                  <BodyText size="sm" className="text-foreground mb-4">
                    {content.promotionalBanner.description}
                  </BodyText>
                  <Button
                    asChild
                    variant="primary"
                    size="sm"
                    className="bg-cta hover:bg-cta-hover text-background font-medium"
                  >
                    <Link href={content.promotionalBanner.href} role="menuitem" tabIndex={0}>
                      Get Started
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Trust Signals */}
            <div className="bg-background border border-border rounded-lg p-4">
              <H4 className="font-headline font-medium text-foreground mb-3 text-base">
                Why Gen Z Chooses Us
              </H4>
              <div className="space-y-2">
                {[
                  { icon: "🌱", text: "100% sustainable materials" },
                  { icon: "💎", text: "Lab-grown diamonds, same quality" },
                  { icon: "📱", text: "Design on mobile, see in 3D" },
                  { icon: "🤝", text: "30% to our creator community" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-lg">{item.icon}</span>
                    <BodyText size="sm" className="text-foreground">
                      {item.text}
                    </BodyText>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}