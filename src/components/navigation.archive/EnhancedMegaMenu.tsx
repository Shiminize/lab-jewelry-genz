'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BodyText, H4 } from '@/components/foundation/Typography'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { EnhancedNavigationItem } from '@/data/enhanced-navigation'

interface EnhancedMegaMenuProps {
  item: EnhancedNavigationItem
  isVisible: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

// SVG Icon Component
const SVGIcon = ({ 
  svgString, 
  className = "w-4 h-4" 
}: { 
  svgString: string
  className?: string 
}) => (
  <div 
    className={className}
    dangerouslySetInnerHTML={{ __html: svgString }}
  />
)

export function EnhancedMegaMenu({ 
  item, 
  isVisible, 
  onMouseEnter, 
  onMouseLeave 
}: EnhancedMegaMenuProps) {
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Special handling for Full Genome Scan - auto-start analysis
  useEffect(() => {
    if (isVisible && item.id === 'full-genome-scan') {
      setIsAnalyzing(true)
      setAnalysisProgress(0)
    }
  }, [isVisible, item.id])

  // Simulate real-time analysis for Full Genome Scan
  useEffect(() => {
    if (isAnalyzing && item.id === 'full-genome-scan') {
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            setIsAnalyzing(false)
            return 100
          }
          return prev + Math.random() * 12
        })
      }, 300)
      return () => clearInterval(interval)
    }
  }, [isAnalyzing, item.id])

  if (!isVisible) return null

  const isGenomeScan = item.id === 'full-genome-scan'
  const isMoissanite = item.id === 'moissanite'

  return (
    <div
      className={cn(
        "absolute top-full left-0 right-0 bg-background border-t shadow-2xl z-50",
        isGenomeScan && "border-blue-200 bg-gradient-to-br from-blue-50 via-green-50 to-purple-50",
        isMoissanite && "border-green-200 bg-gradient-to-br from-green-50 to-blue-50"
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="menu"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Special Full Genome Scan Header */}
        {isGenomeScan && (
          <div className="mb-6 bg-background/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-green-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                  <SVGIcon svgString={item.icon} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <H4 className="font-headline font-bold text-foreground text-xl">
                    Advanced Genome Analysis Active
                  </H4>
                  <BodyText size="sm" className="text-green-600 font-medium">
                    Real-time genetic compatibility assessment in progress
                  </BodyText>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {item.badge}
                </div>
                <BodyText size="sm" className="text-aurora-nav-muted">
                  Moissanite Match
                </BodyText>
              </div>
            </div>
            
            {/* Analysis Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <BodyText size="sm" className="font-medium text-foreground">
                  Genetic Analysis Progress
                </BodyText>
                <BodyText size="sm" className="font-bold text-green-600">
                  {Math.round(analysisProgress)}%
                </BodyText>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 rounded-full transition-all duration-1000 relative"
                  style={{ width: `${analysisProgress}%` }}
                >
                  <div className="absolute inset-0 bg-background opacity-30 animate-pulse"></div>
                </div>
              </div>
              <BodyText size="xs" className="text-aurora-nav-muted">
                {isAnalyzing 
                  ? "Analyzing rare genetic markers and molecular compatibility..." 
                  : "Analysis complete - Rare genetic profile detected (0.3% population)"
                }
              </BodyText>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-8">
          {/* Navigation Sections */}
          <div className="col-span-8 grid grid-cols-2 gap-8">
            {item.megaMenuContent.sections.map((section, index) => (
              <div key={section.title} className="space-y-4">
                <div className="flex items-center space-x-2">
                  {isGenomeScan && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                  <H4 className={cn(
                    "font-headline font-semibold border-b pb-2 text-lg",
                    isGenomeScan ? "text-blue-700 border-blue-200" : "text-foreground border-border"
                  )}>
                    {section.title}
                  </H4>
                </div>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="group block"
                        role="menuitem"
                        tabIndex={0}
                      >
                        <BodyText className={cn(
                          "font-body font-medium transition-colors duration-200",
                          isGenomeScan 
                            ? "text-blue-700 group-hover:text-green-600" 
                            : "text-foreground group-hover:text-cta"
                        )}>
                          {link.name}
                        </BodyText>
                        {link.description && (
                          <BodyText size="sm" className={cn(
                            "mt-1 transition-colors duration-200",
                            isGenomeScan 
                              ? "text-blue-600 group-hover:text-green-500" 
                              : "text-muted group-hover:text-foreground"
                          )}>
                            {link.description}
                          </BodyText>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Featured Content */}
          <div className="col-span-4 space-y-6">
            {/* Featured Products */}
            {item.megaMenuContent.featuredProducts && (
              <div>
                <H4 className={cn(
                  "font-headline font-semibold mb-4 text-lg",
                  isGenomeScan ? "text-blue-700" : "text-foreground"
                )}>
                  {isGenomeScan ? "Genetically Matched" : "Featured"}
                </H4>
                <div className="grid grid-cols-2 gap-4">
                  {item.megaMenuContent.featuredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={product.href}
                      className={cn(
                        "group block rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200",
                        isGenomeScan 
                          ? "bg-background/80 hover:bg-background border border-blue-200 hover:border-green-300 hover:shadow-lg focus:ring-blue-500"
                          : "bg-background hover:bg-muted focus:ring-cta"
                      )}
                      role="menuitem"
                      tabIndex={0}
                    >
                      <div className="aspect-square relative bg-muted">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isGenomeScan && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            99.7%
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <BodyText size="sm" className={cn(
                          "font-medium transition-colors duration-200",
                          isGenomeScan 
                            ? "text-blue-700 group-hover:text-green-600" 
                            : "text-foreground group-hover:text-cta"
                        )}>
                          {product.name}
                        </BodyText>
                        <BodyText size="sm" className={cn(
                          "font-semibold mt-1",
                          isGenomeScan ? "text-green-600" : "text-cta"
                        )}>
                          {product.price}
                        </BodyText>
                        {isGenomeScan && (
                          <BodyText size="xs" className="text-blue-600 mt-1">
                            Genetically optimized for your profile
                          </BodyText>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Promotional Banner */}
            {item.megaMenuContent.promotionalBanner && (
              <div className={cn(
                "rounded-lg p-6 border",
                isGenomeScan 
                  ? "bg-gradient-to-br from-blue-50 to-green-50 border-blue-200"
                  : "bg-accent/10 border-accent/20"
              )}>
                {item.megaMenuContent.promotionalBanner.image && (
                  <div className="aspect-video relative mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={item.megaMenuContent.promotionalBanner.image}
                      alt={item.megaMenuContent.promotionalBanner.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <H4 className={cn(
                  "font-headline font-semibold mb-2 text-lg",
                  isGenomeScan ? "text-blue-700" : "text-foreground"
                )}>
                  {item.megaMenuContent.promotionalBanner.title}
                </H4>
                <BodyText size="sm" className={cn(
                  "mb-4",
                  isGenomeScan ? "text-blue-600" : "text-foreground"
                )}>
                  {item.megaMenuContent.promotionalBanner.description}
                </BodyText>
                <Button
                  variant="primary"
                  size="sm"
                  asChild
                  className={cn(
                    "transition-colors duration-200",
                    isGenomeScan && "bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  )}
                >
                  <Link
                    href={item.megaMenuContent.promotionalBanner.href}
                    role="menuitem"
                    tabIndex={0}
                  >
                    {isGenomeScan ? "View Analysis" : "Learn More"}
                  </Link>
                </Button>
              </div>
            )}

            {/* Scientific Status for Genome Scan */}
            {isGenomeScan && (
              <div className="bg-background/80 rounded-lg p-4 border border-green-200">
                <H4 className="font-headline font-semibold text-green-700 mb-3 text-sm">
                  Live Laboratory Status
                </H4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <BodyText size="xs" className="text-aurora-nav-muted">Active Sequences</BodyText>
                    <BodyText size="xs" className="font-bold text-green-600">23/23</BodyText>
                  </div>
                  <div className="flex items-center justify-between">
                    <BodyText size="xs" className="text-aurora-nav-muted">Molecular Sync</BodyText>
                    <BodyText size="xs" className="font-bold text-blue-600">99.7%</BodyText>
                  </div>
                  <div className="flex items-center justify-between">
                    <BodyText size="xs" className="text-aurora-nav-muted">Lab Certification</BodyText>
                    <BodyText size="xs" className="font-bold text-orange-600">ISO-9001</BodyText>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}