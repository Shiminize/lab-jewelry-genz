import React from 'react'
import { headers } from 'next/headers'
import dynamic from 'next/dynamic'
import { redirect } from 'next/navigation'
import { HeroSection } from '../components/homepage/HeroSection'
import { EnhancedValueProposition } from '../components/homepage/EnhancedValueProposition'
import { FeaturedProductsSection } from '../components/homepage/FeaturedProductsSection'
import SocialProofSection from '../components/homepage/SocialProofSection'
import { SustainabilityStorySection } from '../components/homepage/SustainabilityStorySection'
import type { ProductDisplayDTO } from '../types/product-dto'

// Server-side data fetching function
async function getFeaturedProducts(): Promise<ProductDisplayDTO[]> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2000)
    // Build absolute URL for Node fetch in server environment (prefer request headers)
    const hdrs = headers()
    const host = hdrs.get('x-forwarded-host') || hdrs.get('host')
    const proto = hdrs.get('x-forwarded-proto') || 'http'
    const inferredBase = host ? `${proto}://${host}` : ''
    const port = process.env.PORT || '3000'
    const envBase = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${port}`
    const baseUrl = inferredBase || envBase
    const response = await fetch(`${baseUrl}/api/products/featured?limit=6`, {
      // Avoid blocking server rendering during tests/dev if the route is slow
      cache: 'no-store',
      signal: controller.signal,
    })
    clearTimeout(timeout)
    
    if (!response.ok) {
      console.error('Failed to fetch featured products:', response.status)
      return []
    }
    
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

export default async function HomePage() {
  // Fetch featured products on the server
  const featuredProducts = await getFeaturedProducts()

  // Load CustomizerPreviewSection and StyleQuizSection with client-only due to 3D/interactive content
  const CustomizerPreviewSection = dynamic(
    () => import('../components/homepage/CustomizerPreviewSection').then(m => m.CustomizerPreviewSection),
    { 
      ssr: false,
      loading: () => <div className="min-h-[60vh] bg-muted/20 animate-pulse rounded-token-lg" />
    }
  )
  const StyleQuizSection = dynamic(
    () => import('../components/homepage/StyleQuizSection').then(m => m.StyleQuizSection),
    { 
      ssr: false,
      loading: () => <div className="min-h-[50vh] bg-muted/20 animate-pulse rounded-token-lg" />
    }
  )

  return (
    <div className="min-h-screen">
      {/* Hero Section with Video Background */}
      <HeroSection 
        overlay="gradient"
        textPosition="center"
        spacing="comfortable"
      />
      
      {/* Value Proposition - Sustainability Focus */}
      <EnhancedValueProposition />
      
      {/* Featured Products Showcase with Real Data */}
      <FeaturedProductsSection 
        productCount={6}
        products={featuredProducts}
      />
      
      {/* 3D Customizer Preview */}
      <CustomizerPreviewSection />
      
      {/* Interactive Style Quiz */}
      <StyleQuizSection />
      
      {/* Social Proof & Testimonials */}
      <SocialProofSection />
      
      {/* Sustainability Story */}
      <SustainabilityStorySection />
    </div>
  )
}