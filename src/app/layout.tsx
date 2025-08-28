import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import './globals.css'
import { Footer } from '@/components/layout'
import { AuroraNavigation } from '@/components/navigation'
import { PerformanceMonitor } from '@/components/utils/PerformanceMonitor'
import { ErrorProvider } from '@/contexts/ErrorContext'
import { WithPageErrorBoundary } from '@/components/errors/ErrorBoundary'
import { PageLoadingSkeleton } from '@/components/loading/PageLoadingSkeleton'
import { WebVitalsProvider } from '@/components/providers/WebVitalsProvider'

export const metadata: Metadata = {
  title: 'GlowGlitch | Custom Lab-Grown Diamond Jewelry',
  description: 'Create unique lab-grown diamond jewelry with our 3D customizer. Ethical, beautiful, and personalized just for you.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* 3D assets are loaded lazily when customizer is opened for optimal performance */}
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//cdn.glowglitch.com" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        
        {/* Preconnect for critical external resources */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <React.StrictMode>
          <WebVitalsProvider>
            <ErrorProvider>
              <WithPageErrorBoundary>
                <AuroraNavigation />
                <main className="flex-1" id="main-content" tabIndex={-1}>
                  <Suspense fallback={<PageLoadingSkeleton />}>
                    {children}
                  </Suspense>
                </main>
                <Footer />
                <PerformanceMonitor />
              </WithPageErrorBoundary>
            </ErrorProvider>
          </WebVitalsProvider>
        </React.StrictMode>
      </body>
    </html>
  )
}