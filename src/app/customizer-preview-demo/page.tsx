/**
 * Demo page for CustomizerPreviewSection component
 * Shows the component in action for testing and demonstration
 */

import React from 'react'
import { CustomizerPreviewSection } from '@/components/homepage/CustomizerPreviewSection'
import { H1, BodyText } from '@/components/foundation/Typography'

export default function CustomizerPreviewDemo() {
  return (
    <div className="min-h-screen bg-background">
      {/* Demo header */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <H1 className="text-foreground mb-4">CustomizerPreviewSection Demo</H1>
          <BodyText className="text-muted max-w-2xl mx-auto">
            This demonstrates the CustomizerPreviewSection component that can be embedded 
            on the homepage to showcase 3D customization capabilities and drive users to 
            the full customizer experience.
          </BodyText>
        </div>
      </div>

      {/* Main component demo */}
      <CustomizerPreviewSection
        onStartDesigning={() => {
          console.log('Navigate to /customizer')
          // In production, this would navigate to the customizer
          alert('Would navigate to /customizer page')
        }}
        onChatWithDesigner={() => {
          console.log('Open chat with designer')
          // In production, this would open chat widget
          alert('Would open chat with designer')
        }}
      />

      {/* Additional examples */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="space-y-12">
          {/* Compact version */}
          <div>
            <H1 level="h2" className="text-foreground mb-6">Compact Version</H1>
            <CustomizerPreviewSection 
              padding="compact"
              className="bg-muted/20 rounded-xl"
            />
          </div>

          {/* Stacked layout for mobile */}
          <div>
            <H1 level="h2" className="text-foreground mb-6">Stacked Layout</H1>
            <CustomizerPreviewSection 
              layout="stacked"
              className="bg-accent/5 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Component usage info */}
      <div className="max-w-6xl mx-auto px-4 py-8 border-t border-border">
        <div className="bg-muted/10 rounded-lg p-6">
          <H1 level="h3" className="text-foreground mb-4">Usage Information</H1>
          <div className="space-y-4">
            <BodyText className="text-muted">
              <strong>Features:</strong> 3D model integration, real-time price updates, 
              simplified material/stone selection, mobile-optimized touch controls, 
              accessibility compliant, performance optimized with lazy loading.
            </BodyText>
            <BodyText className="text-muted">
              <strong>Integration:</strong> Import from `@/components/customizer/CustomizerPreviewSection` 
              and use on homepage or landing pages to showcase customization capabilities.
            </BodyText>
            <BodyText className="text-muted">
              <strong>Performance:</strong> 3D viewer is lazy loaded to prevent homepage slowdown. 
              Fallback static preview shows immediately while 3D loads in background.
            </BodyText>
          </div>
        </div>
      </div>
    </div>
  )
}