import React from 'react'
import { redirect } from 'next/navigation'
import { 
  HeroSection, 
  EnhancedValueProposition, 
  FeaturedProductsSection,
  CustomizerPreviewSection,
  StyleQuizSection,
  SocialProofSection,
  SustainabilityStorySection
} from '@/components/homepage'
import type { ProductDisplayDTO } from '@/types/product-dto'

// Server-side data fetching function
async function getFeaturedProducts(): Promise<ProductDisplayDTO[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/featured-products?limit=6`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
      timeout: 5000 // 5 second timeout
    })
    
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