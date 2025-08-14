'use client'

import { useRouter } from 'next/navigation'
import { 
  HeroSection, 
  ValuePropositionSection, 
  FeaturedProductsSection,
  CustomizerPreviewSection,
  StyleQuizSection,
  SocialProofSection,
  SustainabilityStorySection
} from '@/components/homepage'

export default function HomePage() {
  const router = useRouter()

  const handleNavigateToCustomizer = () => {
    router.push('/customizer')
  }

  const handleNavigateToCatalog = () => {
    router.push('/catalog')
  }


  return (
    <div className="min-h-screen">
      {/* Hero Section with Video Background */}
      <HeroSection 
        onPrimaryCtaClick={handleNavigateToCatalog}
        onSecondaryCtaClick={handleNavigateToCustomizer}
        overlay="gradient"
        textPosition="center"
        spacing="comfortable"
      />
      
      {/* Value Proposition - Sustainability Focus */}
      <ValuePropositionSection />
      
      {/* Featured Products Showcase */}
      <FeaturedProductsSection 
        productCount={6}
        onAddToWishlist={(productId) => {
          console.log('Added to wishlist:', productId)
        }}
        onQuickView={(productId) => {
          console.log('Quick view:', productId)
        }}
        onAddToCart={(productId) => {
          console.log('Added to cart:', productId)
        }}
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