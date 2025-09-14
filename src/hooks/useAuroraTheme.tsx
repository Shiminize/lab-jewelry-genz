'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { auroraTokens } from '@/config/aurora-tokens'

// =========================================
// AURORA THEME TYPES
// =========================================

interface AuroraTheme {
  mode: 'light' | 'dark' | 'auto'
  variant: 'default' | 'premium' | 'exclusive' | 'minimalist'
  material: 'gold' | 'platinum' | 'silver' | 'rose-gold' | 'diamond'
  psychology: 'luxury' | 'comfort' | 'energy' | 'trust' | 'passion'
  accessibility: {
    reducedMotion: boolean
    highContrast: boolean
    fontScale: number
  }
}

interface AuroraThemeContextValue {
  theme: AuroraTheme
  setTheme: (theme: Partial<AuroraTheme>) => void
  tokens: typeof auroraTokens
  getColorValue: (colorKey: string) => string
  getSpacingValue: (spacingKey: string) => string
  getShadowValue: (shadowKey: string) => string
  applyMaterial: (material: AuroraTheme['material']) => void
  toggleMode: () => void
  resetToDefaults: () => void
}

// =========================================
// AURORA THEME CONTEXT
// =========================================

const AuroraThemeContext = createContext<AuroraThemeContextValue | undefined>(undefined)

// Default theme configuration
const defaultTheme: AuroraTheme = {
  mode: 'light',
  variant: 'default',
  material: 'gold',
  psychology: 'luxury',
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    fontScale: 1
  }
}

// =========================================
// AURORA THEME PROVIDER
// =========================================

export function AuroraThemeProvider({ 
  children,
  initialTheme = defaultTheme 
}: { 
  children: React.ReactNode
  initialTheme?: Partial<AuroraTheme>
}) {
  const [theme, setThemeState] = useState<AuroraTheme>({ ...defaultTheme, ...initialTheme })

  // Initialize theme from localStorage and system preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('aurora-theme')
    const systemPreferences = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    const parsedTheme = savedTheme ? JSON.parse(savedTheme) : {}
    
    setThemeState(prev => ({
      ...prev,
      ...parsedTheme,
      mode: parsedTheme.mode === 'auto' ? (systemPreferences.darkMode ? 'dark' : 'light') : prev.mode,
      accessibility: {
        ...prev.accessibility,
        reducedMotion: systemPreferences.reducedMotion,
        highContrast: systemPreferences.highContrast
      }
    }))
  }, [])

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('aurora-theme', JSON.stringify(theme))
  }, [theme])

  // Apply theme to CSS custom properties
  useEffect(() => {
    const root = document.documentElement
    
    // Apply color scheme
    root.setAttribute('data-aurora-mode', theme.mode)
    root.setAttribute('data-aurora-variant', theme.variant)
    root.setAttribute('data-aurora-material', theme.material)
    root.setAttribute('data-aurora-psychology', theme.psychology)
    
    // Apply accessibility settings
    if (theme.accessibility.reducedMotion) {
      root.style.setProperty('--aurora-animation-duration', '0ms')
    } else {
      root.style.removeProperty('--aurora-animation-duration')
    }
    
    if (theme.accessibility.highContrast) {
      root.classList.add('aurora-high-contrast')
    } else {
      root.classList.remove('aurora-high-contrast')
    }
    
    // Apply font scaling
    root.style.setProperty('--aurora-font-scale', theme.accessibility.fontScale.toString())
    
    // Apply material-specific CSS custom properties
    const materialColors = auroraTokens.colors.materials
    Object.entries(materialColors).forEach(([key, value]) => {
      root.style.setProperty(`--aurora-material-${key}`, value)
    })

  }, [theme])

  // Theme manipulation methods
  const setTheme = (newTheme: Partial<AuroraTheme>) => {
    setThemeState(prev => ({ ...prev, ...newTheme }))
  }

  const getColorValue = (colorKey: string): string => {
    const [category, color] = colorKey.split('.')
    const colorCategories = auroraTokens.colors as any
    
    if (colorCategories[category] && colorCategories[category][color]) {
      return colorCategories[category][color]
    }
    
    // Fallback to primary colors
    return auroraTokens.colors.primary['deep-space']
  }

  const getSpacingValue = (spacingKey: string): string => {
    const tokens = auroraTokens.spacing.tokens as any
    return tokens[spacingKey] || auroraTokens.spacing.tokens['token-md']
  }

  const getShadowValue = (shadowKey: string): string => {
    const [category, shadow] = shadowKey.split('.')
    const shadowCategories = auroraTokens.shadows as any
    
    if (shadowCategories[category] && shadowCategories[category][shadow]) {
      return shadowCategories[category][shadow]
    }
    
    return auroraTokens.shadows.base['aurora-md']
  }

  const applyMaterial = (material: AuroraTheme['material']) => {
    setTheme({ material })
    
    // Trigger material-aware component updates
    const event = new CustomEvent('aurora-material-change', { 
      detail: { material, colors: auroraTokens.colors.materials } 
    })
    window.dispatchEvent(event)
  }

  const toggleMode = () => {
    setTheme({ 
      mode: theme.mode === 'light' ? 'dark' : 'light' 
    })
  }

  const resetToDefaults = () => {
    setThemeState(defaultTheme)
    localStorage.removeItem('aurora-theme')
  }

  const contextValue: AuroraThemeContextValue = {
    theme,
    setTheme,
    tokens: auroraTokens,
    getColorValue,
    getSpacingValue, 
    getShadowValue,
    applyMaterial,
    toggleMode,
    resetToDefaults
  }

  return (
    <AuroraThemeContext.Provider value={contextValue}>
      {children}
    </AuroraThemeContext.Provider>
  )
}

// =========================================
// AURORA THEME HOOKS
// =========================================

export function useAuroraTheme(): AuroraThemeContextValue {
  const context = useContext(AuroraThemeContext)
  
  if (context === undefined) {
    throw new Error('useAuroraTheme must be used within an AuroraThemeProvider')
  }
  
  return context
}

// Specialized hooks for specific theme aspects
export function useAuroraColors() {
  const { getColorValue, theme, tokens } = useAuroraTheme()
  
  return {
    getColor: getColorValue,
    material: theme.material,
    colors: tokens.colors,
    materialColors: tokens.colors.materials
  }
}

export function useAuroraSpacing() {
  const { getSpacingValue, tokens } = useAuroraTheme()
  
  return {
    getSpacing: getSpacingValue,
    tokens: tokens.spacing.tokens,
    semantic: tokens.spacing.semantic
  }
}

export function useAuroraShadows() {
  const { getShadowValue, theme, tokens } = useAuroraTheme()
  
  return {
    getShadow: getShadowValue,
    material: theme.material,
    shadows: tokens.shadows
  }
}

export function useAuroraAccessibility() {
  const { theme, setTheme } = useAuroraTheme()
  
  const updateAccessibility = (updates: Partial<AuroraTheme['accessibility']>) => {
    setTheme({ 
      accessibility: { ...theme.accessibility, ...updates } 
    })
  }
  
  return {
    accessibility: theme.accessibility,
    updateAccessibility,
    isReducedMotion: theme.accessibility.reducedMotion,
    isHighContrast: theme.accessibility.highContrast,
    fontScale: theme.accessibility.fontScale
  }
}

export function useAuroraMaterial() {
  const { theme, applyMaterial, tokens } = useAuroraTheme()
  
  const getMaterialColor = (material?: AuroraTheme['material']) => {
    const mat = material || theme.material
    return tokens.colors.materials[`material-${mat}` as keyof typeof tokens.colors.materials]
  }
  
  const getMaterialShadow = (material?: AuroraTheme['material']) => {
    const mat = material || theme.material
    return tokens.shadows.materials[mat as keyof typeof tokens.shadows.materials]
  }
  
  return {
    currentMaterial: theme.material,
    applyMaterial,
    getMaterialColor,
    getMaterialShadow,
    availableMaterials: Object.keys(tokens.shadows.materials) as AuroraTheme['material'][]
  }
}

// Psychology-based theme hook
export function useAuroraPsychology() {
  const { theme, setTheme } = useAuroraTheme()
  
  const psychologyMap = {
    luxury: {
      colors: ['nebula-purple', 'aurora-crimson', 'deep-space'],
      timing: 'aurora-luxe',
      shadows: 'aurora-xl'
    },
    comfort: {
      colors: ['lunar-grey', 'starlight-gray', 'emerald-flash'],
      timing: 'aurora-smooth',
      shadows: 'aurora-md'
    },
    energy: {
      colors: ['aurora-pink', 'amber-glow', 'aurora-crimson'],
      timing: 'aurora-swift',
      shadows: 'aurora-glow'
    },
    trust: {
      colors: ['emerald-flash', 'nebula-purple', 'deep-space'],
      timing: 'aurora-smooth',
      shadows: 'aurora-md'
    },
    passion: {
      colors: ['aurora-crimson', 'aurora-pink', 'aurora-plum'],
      timing: 'aurora-dramatic',
      shadows: 'aurora-glow'
    }
  }
  
  const applyPsychology = (psychology: AuroraTheme['psychology']) => {
    setTheme({ psychology })
  }
  
  return {
    currentPsychology: theme.psychology,
    applyPsychology,
    psychologyConfig: psychologyMap[theme.psychology],
    availablePsychologies: Object.keys(psychologyMap) as AuroraTheme['psychology'][]
  }
}


