// Example usage of HeroSection component
// This file demonstrates various implementation patterns

import { HeroSection } from './HeroSection'

// Basic Usage
export function BasicHeroExample() {
  return (
    <HeroSection
      onPrimaryCtaClick={() => {
        // Navigate to product catalog
        window.location.href = '/catalog'
      }}
      onSecondaryCtaClick={() => {
        // Navigate to customizer
        window.location.href = '/customizer'
      }}
    />
  )
}

// Custom Content Example
export function CustomContentHeroExample() {
  return (
    <HeroSection
      headline="Discover Your Perfect Sparkle"
      subHeadline="Lab-grown diamonds and Moissanite pieces crafted for the conscious consumer. Luxury without compromise."
      primaryCtaText="Shop Collection"
      secondaryCtaText="Design Custom Piece"
      overlay="dark"
      textPosition="left"
      spacing="spacious"
      onPrimaryCtaClick={() => console.log('Shopping clicked')}
      onSecondaryCtaClick={() => console.log('Custom design clicked')}
    />
  )
}

// With Analytics Tracking Example
export function HeroWithAnalyticsExample() {
  const trackCtaClick = (ctaType: 'primary' | 'secondary') => {
    // Example analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cta_click', {
        event_category: 'hero_section',
        event_label: ctaType,
        value: ctaType === 'primary' ? 1 : 2
      })
    }
  }

  return (
    <HeroSection
      onPrimaryCtaClick={() => {
        trackCtaClick('primary')
        // Navigate to catalog
      }}
      onSecondaryCtaClick={() => {
        trackCtaClick('secondary')
        // Navigate to customizer
      }}
    />
  )
}

// Accessibility-Focused Example
export function AccessibleHeroExample() {
  return (
    <HeroSection
      respectReducedMotion={true}
      fallbackImageSrc="/hero-static-jewelry.jpg"
      fallbackImageAlt="Beautiful display of ethically-sourced diamond and moissanite jewelry pieces arranged on elegant marble surface"
    />
  )
}