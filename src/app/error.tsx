'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { H1, H2, BodyText, MutedText } from '@/components/foundation/Typography'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, Home, Search, RefreshCw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({
  error,
  reset,
}: ErrorProps) {
  useEffect(() => {
    // Log error with requestId for debugging
    const requestId = crypto.randomUUID()
    console.error('App error:', {
      message: error.message,
      digest: error.digest,
      requestId,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <PageContainer className="py-12">
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-accent/10 rounded-34 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-accent" />
          </div>

          {/* Error Content */}
          <div className="space-y-token-md">
            <H1>Something went wrong</H1>
            <BodyText className="text-lg text-muted-foreground">
              We encountered an unexpected error. Our team has been notified and we're working to fix it.
            </BodyText>
          </div>

          {/* Error Details for Development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-muted/20 border border-border rounded-lg p-4 text-left">
              <H2 className="text-sm font-semibold mb-2 text-foreground">Error Details:</H2>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-x-auto font-mono">
                {error.message}
              </pre>
              {error.digest && (
                <MutedText className="text-xs mt-2">
                  Error ID: {error.digest}
                </MutedText>
              )}
            </div>
          )}

          {/* Recovery Actions */}
          <div className="space-y-token-lg">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={reset}
                className="min-w-32"
                variant="primary"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                variant="secondary"
                onClick={() => window.location.reload()}
                className="min-w-32"
              >
                Refresh Page
              </Button>
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              <MutedText className="text-sm">
                Or continue exploring:
              </MutedText>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  asChild
                >
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Return Home
                  </Link>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  asChild
                >
                  <Link href="/catalog">
                    <Search className="w-4 h-4 mr-2" />
                    Browse Catalog
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Accessibility Information */}
          <div 
            role="status" 
            aria-live="polite"
            className="sr-only"
          >
            An error occurred. Please try refreshing the page or use the navigation links to continue browsing our jewelry collection.
          </div>
        </div>
      </PageContainer>
    </div>
  )
}