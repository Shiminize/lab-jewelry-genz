/**
 * Test page for MaterialStatusBar component
 * Allows isolated testing of the status bar functionality
 */

'use client'

import React, { useState } from 'react'
import { MaterialStatusBar } from '@/components/customizer/MaterialStatusBar'
import { H1, BodyText } from '@/components/foundation/Typography'

export default function TestStatusBarPage() {
  const [isVisible, setIsVisible] = useState(true)

  const materialSelection = {
    metal: '18K Rose Gold',
    stone: 'Moissanite', 
    style: 'Classic'
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <H1 className="text-foreground mb-4">MaterialStatusBar Test Page</H1>
        <BodyText className="text-gray-600 mb-8">
          This page tests the MaterialStatusBar component in isolation to verify 
          positioning, responsive behavior, and CLAUDE_RULES compliance.
        </BodyText>

        <div className="space-y-6">
          <div className="p-6 bg-white rounded-xl border border-border">
            <h2 className="font-headline text-lg text-foreground mb-4">Component Controls</h2>
            <button
              onClick={() => setIsVisible(!isVisible)}
              className="bg-cta text-background px-4 py-2 rounded-lg font-body text-sm hover:bg-cta-hover transition-colors"
            >
              {isVisible ? 'Hide' : 'Show'} Status Bar
            </button>
          </div>

          <div className="p-6 bg-white rounded-xl border border-border">
            <h2 className="font-headline text-lg text-foreground mb-4">Material Selection Preview</h2>
            <div className="space-y-2 font-body text-sm text-foreground">
              <div>Metal: {materialSelection.metal}</div>
              <div>Stone: {materialSelection.stone}</div>
              <div>Style: {materialSelection.style}</div>
            </div>
          </div>

          {/* Spacer content to test fixed positioning */}
          <div className="space-y-6">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="p-6 bg-muted rounded-xl">
                <h3 className="font-headline text-lg text-foreground mb-2">
                  Test Content Block {i + 1}
                </h3>
                <BodyText className="text-gray-600">
                  This content helps test that the fixed-position status bar doesn't 
                  interfere with page scrolling and content interaction. The status bar 
                  should remain visible at the bottom while this content scrolls normally.
                </BodyText>
              </div>
            ))}
          </div>
        </div>

        <MaterialStatusBar
          isVisible={isVisible}
          materialSelection={materialSelection}
          onDismiss={() => setIsVisible(false)}
          onToggleExpanded={(expanded) => {
            console.log('Status bar expanded:', expanded)
          }}
        />
      </div>
    </div>
  )
}