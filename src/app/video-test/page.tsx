'use client'

import { HeroSection } from '@/components/homepage/HeroSection'

export default function VideoTestPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="text-center p-8 bg-muted">
        <h1 className="text-2xl font-bold mb-4">Hero Video Debugging Test</h1>
        <p className="text-sm text-muted-foreground">
          Open browser developer console to see detailed video loading logs
        </p>
      </div>
      
      <HeroSection 
        onPrimaryCtaClick={() => console.log('Primary CTA clicked')}
        onSecondaryCtaClick={() => console.log('Secondary CTA clicked')}
        overlay="gradient"
        textPosition="center"
        spacing="comfortable"
      />
    </div>
  )
}