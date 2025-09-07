'use client'

import React, { useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { H1, H2, MutedText } from '@/components/foundation/Typography'
import { Button } from '@/components/ui/Button'

interface CustomizerErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function CustomizerError({
  error,
  reset,
}: CustomizerErrorProps) {
  useEffect(() => {
    // Log error with requestId for CLAUDE_RULES compliance
    const requestId = crypto.randomUUID()
    console.error('Customizer error:', {
      message: error.message,
      digest: error.digest,
      requestId,
      timestamp: new Date().toISOString(),
      stack: error.stack
    })
  }, [error])

  return (
    <PageContainer className="py-12">
      <div className="text-center space-y-6 max-w-2xl mx-auto">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-cta/10 rounded-full flex items-center justify-center mx-auto">
          <svg 
            className="w-8 h-8 text-cta" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>

        {/* Error Content */}
        <div className="space-y-token-md">
          <H1 className="text-foreground">Hang tight! The customizer is taking a moment</H1>
          <MutedText className="text-lg">
            Our 3D design tools are having a brief hiccup. 
            No worries - this usually fixes itself in a few seconds.
          </MutedText>
        </div>

        {/* Error Details for Development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-muted/20 rounded-lg p-4 text-left">
            <H2 className="text-sm font-headline mb-2 text-foreground">Error Details:</H2>
            <pre className="text-xs text-muted whitespace-pre-wrap overflow-x-auto">
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
        <div className="space-y-token-md">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={reset}
              className="px-6"
            >
              Try Again
            </Button>
            
            <Button 
              variant="ghost"
              onClick={() => window.location.reload()}
              className="px-6"
            >
              Refresh Page
            </Button>
          </div>

          <div className="border-t border-border pt-6 space-y-3">
            <MutedText className="text-sm">
              If this problem persists, you can:
            </MutedText>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.history.back()}
              >
                ← Go Back
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/catalog'}
              >
                Browse Catalog
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/'}
              >
                Return Home
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
          An error occurred while loading the jewelry customizer. Please try refreshing the page or use the navigation links to continue browsing.
        </div>
      </div>
    </PageContainer>
  )
}