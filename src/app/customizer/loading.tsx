import React from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { H1, MutedText } from '@/components/foundation/Typography'

export default function CustomizerLoading() {
  return (
    <PageContainer className="py-6">
      <div className="text-center space-y-token-md mb-8">
        <H1 className="text-foreground">Loading Customizer...</H1>
        <MutedText className="text-lg">
          Preparing your 3D design experience
        </MutedText>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 3D Viewer Skeleton */}
        <div className="space-y-6">
          <div className="space-y-token-sm">
            <div className="h-8 w-32 bg-muted/20 rounded animate-pulse" />
            <div className="h-4 w-48 bg-muted/20 rounded animate-pulse" />
          </div>
          
          <div className="w-full h-[500px] bg-muted/20 rounded-xl flex items-center justify-center">
            <div className="text-center space-y-token-md">
              <div className="w-12 h-12 border-4 border-cta border-t-transparent rounded-full animate-spin mx-auto" />
              <MutedText>Loading 3D viewer...</MutedText>
            </div>
          </div>
        </div>

        {/* Controls Skeleton */}
        <div className="space-y-6">
          {/* Style Selection Skeleton */}
          <div className="space-y-token-md">
            <div className="h-8 w-40 bg-muted/20 rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-token-sm p-3 border border-border rounded-lg">
                  <div className="aspect-square bg-muted/20 rounded animate-pulse" />
                  <div className="h-4 bg-muted/20 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-muted/20 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Material Selection Skeleton */}
          <div className="space-y-token-md">
            <div className="h-8 w-28 bg-muted/20 rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted/20 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>

          {/* Stone Selection Skeleton */}
          <div className="space-y-token-md">
            <div className="h-8 w-36 bg-muted/20 rounded animate-pulse" />
            <div className="space-y-token-sm">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted/20 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>

          {/* Size Selection Skeleton */}
          <div className="space-y-token-md">
            <div className="h-8 w-24 bg-muted/20 rounded animate-pulse" />
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="aspect-square bg-muted/20 rounded animate-pulse" />
              ))}
            </div>
          </div>

          {/* Price Display Skeleton */}
          <div className="bg-muted/20 rounded-lg p-6 space-y-token-md">
            <div className="flex justify-between items-center">
              <div className="h-6 w-24 bg-muted/20 rounded animate-pulse" />
              <div className="h-8 w-32 bg-muted/20 rounded animate-pulse" />
            </div>
            <div className="h-4 bg-muted/20 rounded animate-pulse" />
          </div>

          {/* Action Buttons Skeleton */}
          <div className="space-y-3">
            <div className="h-12 bg-muted/20 rounded-lg animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-12 bg-muted/20 rounded-lg animate-pulse" />
              <div className="h-12 bg-muted/20 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}