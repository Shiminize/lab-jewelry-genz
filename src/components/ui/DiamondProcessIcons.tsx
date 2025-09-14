'use client'

import React from 'react'

export interface ProcessIconProps {
  className?: string
  size?: number
}

// Carbon Seed Placement Icon
export const CarbonSeedIcon: React.FC<ProcessIconProps> = ({ 
  className = "", 
  size = 32 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="carbonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
      </linearGradient>
    </defs>
    
    {/* Chamber outline */}
    <rect 
      x="4" y="8" 
      width="24" height="16" 
      rx="3" 
      stroke="currentColor" 
      strokeWidth="2" 
      fill="none"
    />
    
    {/* Chamber interior */}
    <rect 
      x="6" y="10" 
      width="20" height="12" 
      rx="2" 
      fill="url(#carbonGradient)" 
      opacity="0.2"
    />
    
    {/* Carbon seed (central diamond) */}
    <path 
      d="M16 12 L18 16 L16 20 L14 16 Z" 
      fill="currentColor"
    />
    
    {/* Carbon particles */}
    <circle cx="10" cy="13" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="22" cy="14" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="12" cy="19" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="20" cy="18" r="1" fill="currentColor" opacity="0.6" />
    
    {/* Precision controls */}
    <rect x="2" y="12" width="2" height="8" rx="1" fill="currentColor" />
    <rect x="28" y="12" width="2" height="8" rx="1" fill="currentColor" />
  </svg>
)

// High Pressure & Heat Icon
export const PressureHeatIcon: React.FC<ProcessIconProps> = ({ 
  className = "", 
  size = 32 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="heatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
        <stop offset="50%" stopColor="currentColor" stopOpacity="0.6" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    
    {/* Pressure chamber */}
    <circle 
      cx="16" cy="16" 
      r="12" 
      stroke="currentColor" 
      strokeWidth="2" 
      fill="none"
    />
    
    {/* Inner chamber */}
    <circle 
      cx="16" cy="16" 
      r="8" 
      fill="url(#heatGradient)" 
      opacity="0.3"
    />
    
    {/* Pressure indicators */}
    <path d="M6 16 L2 16" stroke="currentColor" strokeWidth="2" />
    <path d="M26 16 L30 16" stroke="currentColor" strokeWidth="2" />
    <path d="M16 6 L16 2" stroke="currentColor" strokeWidth="2" />
    <path d="M16 26 L16 30" stroke="currentColor" strokeWidth="2" />
    
    {/* Heat waves */}
    <path 
      d="M16 10 Q18 12 16 14 Q14 16 16 18" 
      stroke="url(#heatGradient)" 
      strokeWidth="2" 
      fill="none"
    />
    <path 
      d="M13 11 Q15 13 13 15" 
      stroke="url(#heatGradient)" 
      strokeWidth="1.5" 
      fill="none"
    />
    <path 
      d="M19 11 Q21 13 19 15" 
      stroke="url(#heatGradient)" 
      strokeWidth="1.5" 
      fill="none"
    />
  </svg>
)

// Crystal Growth Icon
export const CrystalGrowthIcon: React.FC<ProcessIconProps> = ({ 
  className = "", 
  size = 32 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="growthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
      </linearGradient>
    </defs>
    
    {/* Growth layers */}
    <path 
      d="M16 6 L20 10 L20 22 L12 22 L12 10 Z" 
      fill="url(#growthGradient)"
      stroke="currentColor" 
      strokeWidth="2"
    />
    
    {/* Layer lines */}
    <line x1="12" y1="14" x2="20" y2="14" stroke="currentColor" opacity="0.4" />
    <line x1="12" y1="18" x2="20" y2="18" stroke="currentColor" opacity="0.4" />
    
    {/* Crystal facets */}
    <path 
      d="M16 6 L20 10 L16 14 L12 10 Z" 
      fill="currentColor" 
      opacity="0.2"
    />
    
    {/* Time indicators */}
    <circle cx="26" cy="8" r="1.5" fill="currentColor" opacity="0.6" />
    <circle cx="26" cy="12" r="1.5" fill="currentColor" opacity="0.4" />
    <circle cx="26" cy="16" r="1.5" fill="currentColor" opacity="0.2" />
    
    {/* Growth arrows */}
    <path 
      d="M8 12 L6 10 L8 8" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      fill="none"
    />
    <path 
      d="M8 20 L6 18 L8 16" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      fill="none"
    />
  </svg>
)

// Cut & Polish Icon
export const CutPolishIcon: React.FC<ProcessIconProps> = ({ 
  className = "", 
  size = 32 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="sparkleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" />
        <stop offset="50%" stopColor="currentColor" stopOpacity="0.6" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
      </linearGradient>
    </defs>
    
    {/* Diamond outline */}
    <path 
      d="M16 4 L24 12 L16 28 L8 12 Z" 
      fill="url(#sparkleGradient)"
      stroke="currentColor" 
      strokeWidth="2"
    />
    
    {/* Facet lines */}
    <path d="M16 4 L16 28" stroke="currentColor" opacity="0.4" />
    <path d="M8 12 L24 12" stroke="currentColor" opacity="0.4" />
    <path d="M12 8 L20 8" stroke="currentColor" opacity="0.3" />
    <path d="M10 16 L22 16" stroke="currentColor" opacity="0.3" />
    <path d="M12 20 L20 20" stroke="currentColor" opacity="0.3" />
    
    {/* Sparkle effects */}
    <circle cx="20" cy="6" r="1" fill="currentColor" opacity="0.8" />
    <circle cx="26" cy="10" r="0.5" fill="currentColor" opacity="0.6" />
    <circle cx="6" cy="8" r="0.5" fill="currentColor" opacity="0.6" />
    <circle cx="24" cy="18" r="1" fill="currentColor" opacity="0.4" />
    
    {/* Star sparkles */}
    <path 
      d="M28 6 L29 8 L28 10 L27 8 Z" 
      fill="currentColor" 
      opacity="0.7"
    />
    <path 
      d="M4 14 L5 16 L4 18 L3 16 Z" 
      fill="currentColor" 
      opacity="0.5"
    />
  </svg>
)

// Animated Arrow Component
export const AnimatedArrow: React.FC<{ className?: string }> = ({ 
  className = "" 
}) => (
  <svg 
    width="64" 
    height="24" 
    viewBox="0 0 64 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
        <stop offset="50%" stopColor="currentColor" stopOpacity="0.8" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
      </linearGradient>
      <linearGradient id="arrowGlow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
        <stop offset="50%" stopColor="currentColor" stopOpacity="0.4" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
      </linearGradient>
    </defs>
    
    {/* Curved arrow path */}
    <path 
      d="M8 12 Q32 8 56 12" 
      stroke="url(#arrowGradient)" 
      strokeWidth="2" 
      fill="none"
      strokeDasharray="4 2"
    />
    
    {/* Arrow head */}
    <path 
      d="M54 9 L60 12 L54 15" 
      stroke="currentColor" 
      strokeWidth="2" 
      fill="none"
    />
    
    {/* Glow effect */}
    <path 
      d="M8 12 Q32 8 56 12" 
      stroke="url(#arrowGlow)" 
      strokeWidth="6" 
      fill="none"
      opacity="0.3"
    />
  </svg>
)