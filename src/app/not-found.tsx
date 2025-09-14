'use client'

import React from 'react'
import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { H1, BodyText, MutedText } from '@/components/foundation/Typography'
import { Button } from '@/components/ui/Button'
import { Search, Home, ArrowLeft, Sparkles } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <PageContainer className="py-12">
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          {/* 404 Icon */}
          <div className="w-16 h-16 bg-accent/10 rounded-34 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8 text-accent" />
          </div>

          {/* 404 Content */}
          <div className="space-y-token-md">
            <H1>Page not found</H1>
            <BodyText className="text-lg text-muted-foreground">
              We couldn't find the jewelry piece you're looking for. It might have been moved or is no longer available.
            </BodyText>
          </div>

          {/* Suggestions */}
          <div className="bg-muted/20 border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-center space-x-2 text-accent">
              <Sparkles className="w-5 h-5" />
              <MutedText className="font-medium text-accent">
                Discover something beautiful instead
              </MutedText>
              <Sparkles className="w-5 h-5" />
            </div>
            
            <BodyText className="text-sm text-muted-foreground">
              Our collection features over 75 stunning pieces including engagement rings, necklaces, bracelets, and custom jewelry.
            </BodyText>
          </div>

          {/* Navigation Actions */}
          <div className="space-y-token-lg">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="primary"
                size="lg"
                className="min-w-40"
                asChild
              >
                <Link href="/catalog">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Collection
                </Link>
              </Button>
              
              <Button 
                variant="secondary"
                size="lg"
                className="min-w-40"
                asChild
              >
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Return Home
                </Link>
              </Button>
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              <MutedText className="text-sm">
                Popular categories:
              </MutedText>
              
              <div className="flex flex-wrap gap-2 justify-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  asChild
                >
                  <Link href="/catalog?category=rings">
                    Engagement Rings
                  </Link>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  asChild
                >
                  <Link href="/catalog?category=necklaces">
                    Necklaces
                  </Link>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  asChild
                >
                  <Link href="/catalog?category=bracelets">
                    Bracelets
                  </Link>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  asChild
                >
                  <Link href="/customizer">
                    Custom Design
                  </Link>
                </Button>
              </div>

              <div className="pt-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </div>
          </div>

          {/* SEO and Accessibility Information */}
          <div 
            role="status" 
            aria-live="polite"
            className="sr-only"
          >
            Page not found. This jewelry piece may have been moved or is no longer available. Please browse our collection or return to the homepage.
          </div>
        </div>
      </PageContainer>
    </div>
  )
}