/**
 * Page Loading Skeleton - React 18 Suspense Fallback
 * CLAUDE_RULES: <300ms render time for loading states
 */
import React from 'react'

export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Hero section skeleton */}
      <div className="h-96 bg-gradient-to-r from-muted/50 to-muted/20 mb-8">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl space-y-token-md">
            <div className="h-12 bg-muted rounded-token-lg w-3/4" />
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="flex gap-3">
              <div className="h-10 bg-muted rounded w-32" />
              <div className="h-10 bg-muted rounded w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Content grid skeleton */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square bg-muted rounded-token-lg" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>

        {/* Features section skeleton */}
        <div className="space-y-8">
          <div className="text-center space-y-token-md">
            <div className="h-8 bg-muted rounded w-64 mx-auto" />
            <div className="h-4 bg-muted rounded w-96 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center space-y-token-md">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto" />
                <div className="h-5 bg-muted rounded w-32 mx-auto" />
                <div className="space-y-token-sm">
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-5/6 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="fixed bottom-8 right-8">
        <div className="bg-primary/10 backdrop-blur-sm rounded-full p-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  )
}

export default PageLoadingSkeleton