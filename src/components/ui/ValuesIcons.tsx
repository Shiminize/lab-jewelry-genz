'use client'

import React from 'react'

export interface ValuesIconProps {
  className?: string
  size?: number
}

// Ethical Sourcing Icon - Shield with certification symbols
export const EthicalSourcingIcon: React.FC<ValuesIconProps> = ({ 
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
      <linearGradient id="ethicalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
      </linearGradient>
      <linearGradient id="shieldGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
      </linearGradient>
    </defs>
    
    {/* Shield outline */}
    <path 
      d="M16 2 L26 7 L26 16 C26 22 21 26 16 30 C11 26 6 22 6 16 L6 7 L16 2 Z" 
      stroke="currentColor" 
      strokeWidth="2" 
      fill="url(#ethicalGradient)"
    />
    
    {/* Inner shield glow */}
    <path 
      d="M16 4 L24 8 L24 16 C24 21 20 24 16 27 C12 24 8 21 8 16 L8 8 L16 4 Z" 
      fill="url(#shieldGlow)" 
      opacity="0.3"
    />
    
    {/* Checkmark - conflict-free symbol */}
    <path 
      d="M12 16 L15 19 L20 13" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      fill="none"
    />
    
    {/* Certification seal */}
    <circle 
      cx="22" cy="10" 
      r="3" 
      fill="currentColor" 
      opacity="0.8"
    />
    <path 
      d="M21 10 L21.5 10.5 L23 9" 
      stroke="white" 
      strokeWidth="1" 
      strokeLinecap="round" 
      fill="none"
    />
    
    {/* Sparkle elements */}
    <path 
      d="M10 6 L11 8 L10 10 L9 8 Z" 
      fill="currentColor" 
      opacity="0.6"
    />
    <path 
      d="M24 22 L25 24 L24 26 L23 24 Z" 
      fill="currentColor" 
      opacity="0.4"
    />
  </svg>
)

// Custom Vision Icon - Artist palette with design tools
export const CustomVisionIcon: React.FC<ValuesIconProps> = ({ 
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
      <linearGradient id="paletteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
        <stop offset="50%" stopColor="currentColor" stopOpacity="0.6" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    
    {/* Palette base */}
    <path 
      d="M8 12 C8 8 11 6 16 6 C24 6 28 10 28 16 C28 20 26 22 24 22 C22 22 22 20 20 20 C18 20 18 22 16 22 C12 22 8 18 8 12 Z" 
      fill="url(#paletteGradient)"
      stroke="currentColor" 
      strokeWidth="2"
    />
    
    {/* Color dots on palette */}
    <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.8" />
    <circle cx="18" cy="10" r="2" fill="currentColor" opacity="0.6" />
    <circle cx="22" cy="14" r="2" fill="currentColor" opacity="0.7" />
    <circle cx="14" cy="18" r="2" fill="currentColor" opacity="0.5" />
    
    {/* Brush */}
    <path 
      d="M26 4 L28 6 L20 14 L18 12 L26 4 Z" 
      fill="currentColor" 
      stroke="currentColor" 
      strokeWidth="1"
    />
    <path 
      d="M18 12 L16 14 C15 15 15 17 16 18 C17 19 19 19 20 18 L22 16" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      fill="none"
    />
    
    {/* Sparkle effects */}
    <path 
      d="M6 8 L7 10 L6 12 L5 10 Z" 
      fill="currentColor" 
      opacity="0.5"
    />
    <path 
      d="M26 20 L27 22 L26 24 L25 22 Z" 
      fill="currentColor" 
      opacity="0.6"
    />
    <circle cx="30" cy="8" r="1" fill="currentColor" opacity="0.4" />
  </svg>
)

// Planet Positive Icon - Earth with sustainability elements
export const PlanetPositiveIcon: React.FC<ValuesIconProps> = ({ 
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
      <linearGradient id="earthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
      </linearGradient>
      <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.5" />
      </linearGradient>
    </defs>
    
    {/* Earth globe */}
    <circle 
      cx="16" cy="16" 
      r="12" 
      fill="url(#earthGradient)"
      stroke="currentColor" 
      strokeWidth="2"
    />
    
    {/* Continents */}
    <path 
      d="M8 12 C10 10 14 10 16 12 C18 10 22 12 24 14 C22 16 20 18 18 16 C16 18 12 16 10 14 C8 16 6 14 8 12 Z" 
      fill="currentColor" 
      opacity="0.4"
    />
    
    {/* Recycling symbol overlay */}
    <path 
      d="M14 8 L16 4 L18 8 M18 8 L22 6 L20 10 M20 10 L24 12 L20 14 M20 14 L18 18 L16 14 M16 14 L12 16 L14 12 M14 12 L10 10 L14 8" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      fill="none" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      opacity="0.8"
    />
    
    {/* Leaves growing around earth */}
    <path 
      d="M4 16 C4 14 5 12 7 12 C9 12 10 14 10 16 C8 16 6 16 4 16 Z" 
      fill="url(#leafGradient)"
    />
    <path 
      d="M22 16 C22 14 23 12 25 12 C27 12 28 14 28 16 C26 16 24 16 22 16 Z" 
      fill="url(#leafGradient)"
    />
    <path 
      d="M16 4 C14 4 12 5 12 7 C12 9 14 10 16 10 C16 8 16 6 16 4 Z" 
      fill="url(#leafGradient)"
    />
    <path 
      d="M16 22 C14 22 12 23 12 25 C12 27 14 28 16 28 C16 26 16 24 16 22 Z" 
      fill="url(#leafGradient)"
    />
    
    {/* Carbon neutral symbol */}
    <circle cx="24" cy="8" r="2" fill="currentColor" opacity="0.7" />
    <path 
      d="M23 8 L24 8.5 L25 7.5" 
      stroke="white" 
      strokeWidth="1" 
      strokeLinecap="round" 
      fill="none"
    />
  </svg>
)

// Trust Badge Icons
export const ConflictFreeIcon: React.FC<ValuesIconProps> = ({ 
  className = "", 
  size = 16 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M8 1 L13 3.5 L13 8 C13 11 10.5 13 8 15 C5.5 13 3 11 3 8 L3 3.5 L8 1 Z" 
      stroke="currentColor" 
      strokeWidth="1" 
      fill="currentColor" 
      fillOpacity="0.2"
    />
    <path 
      d="M6 8 L7.5 9.5 L10 6.5" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
)

export const LabGrownIcon: React.FC<ValuesIconProps> = ({ 
  className = "", 
  size = 16 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="2" y="4" width="12" height="8" rx="2" stroke="currentColor" fill="currentColor" fillOpacity="0.2" />
    <path d="M8 6 L10 8 L8 12 L6 8 Z" fill="currentColor" />
    <circle cx="5" cy="7" r="0.5" fill="currentColor" opacity="0.6" />
    <circle cx="11" cy="9" r="0.5" fill="currentColor" opacity="0.6" />
    <rect x="1" y="8" width="1" height="4" rx="0.5" fill="currentColor" />
    <rect x="14" y="8" width="1" height="4" rx="0.5" fill="currentColor" />
  </svg>
)

export const RecycledMetalIcon: React.FC<ValuesIconProps> = ({ 
  className = "", 
  size = 16 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M8 2 L6 4 L10 4 L8 2 Z M12 8 L14 6 L14 10 L12 8 Z M8 14 L10 12 L6 12 L8 14 Z M4 8 L2 10 L2 6 L4 8 Z" 
      fill="currentColor" 
      opacity="0.7"
    />
    <path 
      d="M8 4 C10 4 12 6 12 8 C12 10 10 12 8 12 C6 12 4 10 4 8 C4 6 6 4 8 4" 
      stroke="currentColor" 
      strokeWidth="1" 
      fill="none"
    />
  </svg>
)

export const CarbonNeutralIcon: React.FC<ValuesIconProps> = ({ 
  className = "", 
  size = 16 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="8" cy="8" r="6" stroke="currentColor" fill="currentColor" fillOpacity="0.1" />
    <path d="M5 8 C5 6 6 5 8 5 C10 5 11 6 11 8 C11 10 10 11 8 11 C6 11 5 10 5 8 Z" fill="currentColor" opacity="0.3" />
    <path d="M3 8 C3 6 4 5 5 5 C6 5 7 6 7 8 C6 8 5 8 3 8 Z" fill="currentColor" opacity="0.5" />
    <path d="M9 8 C9 6 10 5 11 5 C12 5 13 6 13 8 C12 8 11 8 9 8 Z" fill="currentColor" opacity="0.5" />
    <circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.6" />
  </svg>
)

export const PremiumQualityIcon: React.FC<ValuesIconProps> = ({ 
  className = "", 
  size = 16 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M8 2 L12 6 L8 14 L4 6 Z" fill="currentColor" opacity="0.3" stroke="currentColor" />
    <path d="M8 2 L8 14" stroke="currentColor" opacity="0.4" />
    <path d="M4 6 L12 6" stroke="currentColor" opacity="0.4" />
    <path d="M6 4 L10 4" stroke="currentColor" opacity="0.3" />
    <path d="M5 8 L11 8" stroke="currentColor" opacity="0.3" />
    <path d="M6 10 L10 10" stroke="currentColor" opacity="0.3" />
    <circle cx="10" cy="3" r="0.5" fill="currentColor" opacity="0.8" />
    <circle cx="13" cy="5" r="0.5" fill="currentColor" opacity="0.6" />
    <circle cx="3" cy="4" r="0.5" fill="currentColor" opacity="0.6" />
  </svg>
)

export const UnlimitedCustomizationIcon: React.FC<ValuesIconProps> = ({ 
  className = "", 
  size = 16 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M2 8 C2 5 4.5 3 8 3 C11.5 3 14 5 14 8 C14 11 11.5 13 8 13 C4.5 13 2 11 2 8 Z" 
          fill="currentColor" opacity="0.2" stroke="currentColor" />
    <circle cx="6" cy="6" r="1" fill="currentColor" opacity="0.8" />
    <circle cx="10" cy="6" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="12" cy="9" r="1" fill="currentColor" opacity="0.7" />
    <circle cx="7" cy="11" r="1" fill="currentColor" opacity="0.5" />
    <path d="M13 2 L15 4 L10 9 L8 7 L13 2 Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5" />
    <path d="M8 7 L6 9 C5.5 9.5 5.5 10.5 6 11 C6.5 11.5 7.5 11.5 8 11 L10 9" 
          stroke="currentColor" strokeWidth="1" fill="none" />
  </svg>
)