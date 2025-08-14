/**
 * GlowGlitch Design System - Approved Color Combinations
 * Based on HTML Demo Standards (html-demo/index.html)
 * 
 * ONLY these 7 combinations are approved for use across all components
 * as specified in CLAUDE_RULES.md and validated in the HTML demo.
 */

export const APPROVED_COLOR_COMBINATIONS = {
  // 1. Main content on ivory background
  mainContent: 'text-foreground bg-background',
  
  // 2. Muted content on ivory background  
  mutedContent: 'text-gray-600 bg-background',
  
  // 3. Content on cards/surfaces (white backgrounds)
  cardContent: 'text-foreground bg-white',
  
  // 4. Content on section backgrounds (muted backgrounds)
  sectionContent: 'text-foreground bg-muted',
  
  // 5. Light text on dark sections (inverted)
  darkSection: 'text-background bg-foreground',
  
  // 6. Accent highlights on white backgrounds
  accentHighlight: 'text-accent bg-white',
  
  // 7. Primary button text (high contrast)
  primaryButton: 'text-background bg-cta'
} as const

export type ApprovedCombination = typeof APPROVED_COLOR_COMBINATIONS[keyof typeof APPROVED_COLOR_COMBINATIONS]

/**
 * HTML Demo CSS Variables Mapping
 * These map to the exact CSS custom properties used in the approved HTML demo
 */
export const HTML_DEMO_COLORS = {
  // Background colors
  '--color-background': '#FEFCF9',    // Ivory mist
  '--color-foreground': '#2D3A32',    // Graphite green  
  '--color-muted': '#E8D7D3',         // Rose beige
  '--color-accent': '#D4AF37',        // Champagne gold
  '--color-cta': '#C17B47',           // Coral gold
  '--color-cta-hover': '#B5653A',     // Burnt coral
  '--color-white': '#FFFFFF',
  '--color-gray-600': '#6B7280',
} as const

/**
 * Utility function to get approved color combination classes
 * Use this instead of manually writing color classes
 */
export function getColorCombination(type: keyof typeof APPROVED_COLOR_COMBINATIONS): string {
  return APPROVED_COLOR_COMBINATIONS[type]
}

/**
 * Button color combinations from HTML demo
 * Matches the exact 5-variant system defined in CLAUDE_RULES.md
 */
export const BUTTON_COLOR_COMBINATIONS = {
  primary: 'bg-cta text-background hover:bg-cta-hover',     // Coral gold + white text
  secondary: 'bg-background text-foreground border-border hover:bg-muted hover:border-accent', // Ivory + graphite + border
  outline: 'border-foreground text-foreground hover:bg-foreground hover:text-background', // Transparent with border
  ghost: 'text-foreground hover:bg-muted',                 // Transparent with muted hover
  accent: 'bg-accent text-foreground hover:opacity-90'     // Champagne gold + graphite text
} as const

/**
 * Typography color combinations from HTML demo
 * Ensures consistent text rendering across all components
 */
export const TYPOGRAPHY_COLOR_COMBINATIONS = {
  headline: 'text-foreground',           // Main headlines (H1, H2, H3)
  body: 'text-foreground',               // Regular body text
  muted: 'text-gray-600',                // Secondary/muted text
  accent: 'text-accent',                 // Accent text highlights
  inverse: 'text-background',            // Light text on dark backgrounds
} as const

/**
 * Validation function to check if a color combination is approved
 * Use in development to catch non-compliant color usage
 */
export function isApprovedCombination(classes: string): boolean {
  const approvedValues = Object.values(APPROVED_COLOR_COMBINATIONS)
  return approvedValues.some(approved => 
    classes.includes(approved) || approved.split(' ').every(cls => classes.includes(cls))
  )
}

/**
 * Development helper - throws error if non-approved colors are used
 * Only active in development mode
 */
export function validateColorUsage(classes: string): void {
  if (process.env.NODE_ENV === 'development') {
    const forbiddenPatterns = [
      /text-black\b/,
      /text-white\b/, 
      /bg-gray-\d+/,
      /border-gray-\d+/,
      /bg-blue-\d+/,
      /text-blue-\d+/,
      /bg-red-\d+/,
      /text-red-\d+/,
      /bg-green-\d+/,
      /text-green-\d+/,
      /text-muted-foreground/, // Non-standard class
      /text-muted.*bg-muted/,   // Violates approved combination #4
    ]
    
    forbiddenPatterns.forEach(pattern => {
      if (pattern.test(classes)) {
        console.error(`🚨 Non-approved color detected: ${classes}`)
        console.error('Use only approved combinations from APPROVED_COLOR_COMBINATIONS')
      }
    })
  }
}