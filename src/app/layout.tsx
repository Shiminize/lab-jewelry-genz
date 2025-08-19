import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import { Header, Footer } from '@/components/layout'
import { PerformanceMonitor } from '@/components/utils/PerformanceMonitor'

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
        
        {/* Preload critical 3D assets for better performance */}
        <link rel="preload" href="/models/test-model.glb" as="fetch" type="model/gltf-binary" crossOrigin="anonymous" />
        <link rel="preload" href="/models/goldringred.glb" as="fetch" type="model/gltf-binary" crossOrigin="anonymous" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//cdn.glowglitch.com" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        
        {/* Preconnect for critical external resources */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <PerformanceMonitor />
      </body>
    </html>
  )
}