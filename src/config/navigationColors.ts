/**
 * Navigation Color Configuration
 * CLAUDE_RULES compliant: Simple config file for navigation-specific colors
 * Based on Progressive Aurora Consolidation strategy
 */

// Pantone-standard material colors for jewelry visualization
export const MATERIAL_COLORS = {
  gold: '#D4AF37',        // Pantone 871C (actual gold appearance)
  'rose-gold': '#E0BFB8', // Pantone 5025C (authentic rose gold)
  platinum: '#E5E4E2',    // Pantone Cool Gray 1C
  'white-gold': '#F5F5F0' // Pantone 9060C
} as const;

// Simplified brand colors (replacing emotional Aurora names with professional ones)
export const BRAND_COLORS = {
  'signature-purple': '#6B46C1', // Primary brand (was nebula-purple)
  blush: '#FF6B9D',              // Secondary brand (was aurora-pink)
  emerald: '#10B981',            // Success/trust (was emerald-flash)
  champagne: '#F5F5F0',          // Trust bar background
  'deep-space': '#0A0E27',       // Text and depth
  'lunar-grey': '#F7F7F9'        // Light backgrounds
} as const;

// Navigation-specific color tokens
export const NAVIGATION_COLORS = {
  background: '#FFFFFF',
  text: BRAND_COLORS['deep-space'],
  border: '#E5E7EB',
  hover: 'rgba(107, 70, 193, 0.08)', // Subtle signature-purple
  active: BRAND_COLORS['signature-purple'],
  muted: '#6B7280',
  trust: BRAND_COLORS.champagne,
  'trust-text': BRAND_COLORS['deep-space'],
  'trust-icon': BRAND_COLORS.emerald
} as const;

// Shadow system for luxury feel
export const NAVIGATION_SHADOWS = {
  near: '0 1px 3px rgba(10, 14, 39, 0.08)',
  luxury: `
    0 1px 3px rgba(10, 14, 39, 0.08),
    0 4px 8px rgba(10, 14, 39, 0.04),
    0 8px 16px rgba(10, 14, 39, 0.02)
  `,
  'material-gold': `0 4px 12px ${MATERIAL_COLORS.gold}20`,
  'material-platinum': `0 4px 12px ${MATERIAL_COLORS.platinum}30`,
  'material-rose-gold': `0 4px 12px ${MATERIAL_COLORS['rose-gold']}25`
} as const;

// CSS custom properties for runtime usage
export const getCSSVariables = () => ({
  '--nav-bg': NAVIGATION_COLORS.background,
  '--nav-text': NAVIGATION_COLORS.text,
  '--nav-border': NAVIGATION_COLORS.border,
  '--nav-hover': NAVIGATION_COLORS.hover,
  '--nav-active': NAVIGATION_COLORS.active,
  '--nav-muted': NAVIGATION_COLORS.muted,
  '--nav-trust': NAVIGATION_COLORS.trust,
  '--nav-trust-text': NAVIGATION_COLORS['trust-text'],
  '--nav-trust-icon': NAVIGATION_COLORS['trust-icon'],
  '--material-gold': MATERIAL_COLORS.gold,
  '--material-rose-gold': MATERIAL_COLORS['rose-gold'],
  '--material-platinum': MATERIAL_COLORS.platinum,
  '--material-white-gold': MATERIAL_COLORS['white-gold'],
  '--brand-signature': BRAND_COLORS['signature-purple'],
  '--brand-blush': BRAND_COLORS.blush,
  '--brand-emerald': BRAND_COLORS.emerald
});

export type MaterialColor = keyof typeof MATERIAL_COLORS;
export type BrandColor = keyof typeof BRAND_COLORS;
export type NavigationColor = keyof typeof NAVIGATION_COLORS;