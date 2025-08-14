'use client'

import React from 'react'
import { SustainabilityStorySection } from './SustainabilityStorySection'

/**
 * Example implementations of the SustainabilityStorySection component
 * showcasing different configurations and use cases
 */

// Default configuration - Full sustainability story
export function DefaultSustainabilityStory() {
  return (
    <SustainabilityStorySection />
  )
}

// Compact version - Focus on key metrics only
export function CompactSustainabilityStory() {
  return (
    <SustainabilityStorySection 
      spacing="compact"
      style="subtle"
      headline="Conscious Luxury, Proven Impact"
      description="Lab-grown diamonds with 95% less environmental impact. Same beauty, better story."
      showComparison={false}
      showProcess={false}
      showMetrics={true}
      showCertifications={false}
      ctaText="See Our Impact"
      secondaryCtaText="Shop Now"
    />
  )
}

// Education-focused version - Detailed comparison and process
export function EducationalSustainabilityStory() {
  return (
    <SustainabilityStorySection 
      spacing="spacious"
      style="vibrant"
      headline="Lab-Grown vs. Mined: The Facts"
      description="Understanding the difference between lab-grown and mined diamonds empowers you to make conscious choices aligned with your values."
      showComparison={true}
      showProcess={true}
      showMetrics={true}
      showCertifications={true}
      ctaText="Learn More About Lab-Grown Diamonds"
      secondaryCtaText="Compare Our Diamonds"
    />
  )
}

// Metrics-focused version - For impact-conscious consumers
export function MetricsFocusedSustainabilityStory() {
  const customMetrics = [
    {
      icon: '🌱',
      value: '95%',
      label: 'Less Environmental Impact',
      description: 'Compared to traditional diamond mining operations',
      comparison: 'vs. conventional mining practices'
    },
    {
      icon: '💧',
      value: '99%',
      label: 'Less Water Usage',
      description: 'Minimal water consumption in controlled lab environment',
      comparison: 'mining uses 126+ gallons per carat'
    },
    {
      icon: '⚡',
      value: '100%',
      label: 'Renewable Energy',
      description: 'Solar and wind power all our lab facilities',
      comparison: 'industry-leading commitment'
    },
    {
      icon: '🌍',
      value: 'Zero',
      label: 'Land Disruption',
      description: 'No mining means no habitat destruction',
      comparison: 'mining disrupts 1,750 tons of earth per carat'
    }
  ]

  return (
    <SustainabilityStorySection 
      spacing="comfortable"
      style="default"
      headline="The Numbers Don't Lie"
      description="Data-driven sustainability that makes a real difference for our planet's future."
      showComparison={false}
      showProcess={false}
      showMetrics={true}
      showCertifications={true}
      customMetrics={customMetrics}
      ctaText="Explore Detailed Impact Report"
      secondaryCtaText="Choose Sustainable Luxury"
    />
  )
}

// Story-focused version - Emotional connection
export function StoryFocusedSustainabilityStory() {
  return (
    <SustainabilityStorySection 
      spacing="spacious"
      style="vibrant"
      headline="Your Jewelry, Your Values, Your Future"
      description="Every piece tells a story of innovation, responsibility, and the power of conscious choices. Join a generation that's redefining luxury for the better."
      showComparison={true}
      showProcess={true}
      showMetrics={false}
      showCertifications={false}
      ctaText="Start Your Sustainable Journey"
      secondaryCtaText="Design Your Piece"
    />
  )
}

// Certification-focused version - Trust and verification
export function CertificationFocusedSustainabilityStory() {
  return (
    <SustainabilityStorySection 
      spacing="comfortable"
      style="default"
      headline="Verified. Certified. Trusted."
      description="Third-party validation you can count on. Our sustainability claims are backed by industry-leading certifications and transparent reporting."
      showComparison={false}
      showProcess={false}
      showMetrics={false}
      showCertifications={true}
      ctaText="View All Certifications"
      secondaryCtaText="Read Sustainability Report"
    />
  )
}

// Mobile-optimized version - Streamlined for smaller screens
export function MobileSustainabilityStory() {
  return (
    <SustainabilityStorySection 
      spacing="compact"
      layout="default"
      style="subtle"
      headline="Sustainable. Beautiful. Certified."
      description="Lab-grown diamonds with 95% less environmental impact. Same atomic structure, better conscience."
      showComparison={false}
      showProcess={true}
      showMetrics={true}
      showCertifications={false}
      ctaText="Learn More"
      secondaryCtaText="Shop"
    />
  )
}

// Landing page version - Conversion-optimized
export function LandingPageSustainabilityStory() {
  return (
    <SustainabilityStorySection 
      spacing="comfortable"
      style="vibrant"
      headline="The Future of Luxury is Here"
      description="Lab-grown diamonds that are chemically, physically, and optically identical to mined diamonds—but with a conscience. Join 50,000+ conscious consumers who choose better."
      showComparison={true}
      showProcess={false}
      showMetrics={true}
      showCertifications={true}
      ctaText="Get Your Sustainable Diamond"
      ctaHref="/catalog?filter=lab-grown"
      secondaryCtaText="Book Consultation"
      secondaryCtaHref="/consultation"
    />
  )
}

// Usage examples for different page contexts
export const SustainabilityExamples = {
  // Homepage - Full story
  homepage: <DefaultSustainabilityStory />,
  
  // About page - Educational focus
  about: <EducationalSustainabilityStory />,
  
  // Product pages - Compact version
  product: <CompactSustainabilityStory />,
  
  // Sustainability page - Metrics focus
  sustainability: <MetricsFocusedSustainabilityStory />,
  
  // Mobile app - Optimized version
  mobile: <MobileSustainabilityStory />,
  
  // Landing pages - Conversion focus
  landing: <LandingPageSustainabilityStory />,
  
  // Trust/certification page
  trust: <CertificationFocusedSustainabilityStory />,
  
  // Storytelling page
  story: <StoryFocusedSustainabilityStory />
}

export default SustainabilityExamples