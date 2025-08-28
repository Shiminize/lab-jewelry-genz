'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, User, Heart, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

// Psychological Profile Types
export type PersonalityType = 'analytical' | 'intuitive' | 'practical' | 'creative'
export type ValuesPriority = 'environment' | 'ethics' | 'community' | 'future'
export type StyleAesthetic = 'minimalist' | 'bohemian' | 'classic' | 'modern' | 'eclectic'
export type InvestmentProfile = 'conservative' | 'moderate' | 'aggressive'

export interface UserPsychProfile {
  // DNA Variation
  gemstonePersonality?: {
    dnaType: PersonalityType
    compatibilityScores: {
      moissanite: number
      diamond: number
      silver: number
      gold: number
    }
    rareTraits: string[]
    uniquenessScore: number
  }
  
  // Conscious Variation
  consciousProfile?: {
    valuesPriority: ValuesPriority
    impactScore: number
    consciousLevel: 'awakening' | 'active' | 'advocate' | 'leader'
    carbonSaved: number
    waterSaved: number
  }
  
  // Style Variation
  styleEcosystem?: {
    coreAesthetic: StyleAesthetic
    synergyScore: number
    lifestyleFactors: string[]
    occasionNeeds: string[]
    evolutionStage: 'foundation' | 'building' | 'refinement' | 'mastery'
  }
  
  // Investment Variation
  investmentProfile?: {
    riskTolerance: InvestmentProfile
    portfolioValue: number
    roiScore: number
    timeHorizon: 'short' | 'medium' | 'long'
    marketTiming: number
  }
}

interface PsychologicalContext {
  userProfile: UserPsychProfile
  updateProfile: (updates: Partial<UserPsychProfile>) => void
  recommendedProducts: RecommendedProduct[]
  personalizedMessage: string
  uniquenessFactors: string[]
}

interface RecommendedProduct {
  id: string
  name: string
  type: 'moissanite' | 'lab-diamond' | 'gem'
  metal: 'silver' | 'gold' | 'platinum'
  matchScore: number
  psychReason: string
  urgency?: string
}

const PsychContext = createContext<PsychologicalContext | null>(null)

export const usePsychProfile = () => {
  const context = useContext(PsychContext)
  if (!context) throw new Error('usePsychProfile must be used within PsychProvider')
  return context
}

interface EnhancedSmartNavBaseProps {
  variant: 'dna' | 'conscious' | 'ecosystem' | 'investment'
  children: React.ReactNode
  className?: string
}

export function EnhancedSmartNavBase({ 
  variant, 
  children, 
  className 
}: EnhancedSmartNavBaseProps) {
  const [userProfile, setUserProfile] = useState<UserPsychProfile>({})
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const [cartItemCount] = useState(0)
  const [wishlistCount] = useState(0)

  // Initialize profile based on variant
  useEffect(() => {
    const initializeProfile = () => {
      const updates: Partial<UserPsychProfile> = {}
      
      switch (variant) {
        case 'dna':
          updates.gemstonePersonality = {
            dnaType: 'analytical',
            compatibilityScores: {
              moissanite: 98,
              diamond: 76,
              silver: 95,
              gold: 82
            },
            rareTraits: ['Precision Seeker', 'Quality Focused', 'Value Optimizer'],
            uniquenessScore: 94
          }
          break
        case 'conscious':
          updates.consciousProfile = {
            valuesPriority: 'environment',
            impactScore: 847,
            consciousLevel: 'active',
            carbonSaved: 2.3,
            waterSaved: 45000
          }
          break
        case 'ecosystem':
          updates.styleEcosystem = {
            coreAesthetic: 'minimalist',
            synergyScore: 94,
            lifestyleFactors: ['Professional', 'Travel', 'Social'],
            occasionNeeds: ['Work', 'Evening', 'Weekend'],
            evolutionStage: 'building'
          }
          break
        case 'investment':
          updates.investmentProfile = {
            riskTolerance: 'moderate',
            portfolioValue: 12500,
            roiScore: 24,
            timeHorizon: 'long',
            marketTiming: 78
          }
          break
      }
      
      setUserProfile(updates)
      setIsProfileComplete(true)
    }

    initializeProfile()
  }, [variant])

  // Generate personalized recommendations
  const generateRecommendations = (): RecommendedProduct[] => {
    const baseRecommendations: RecommendedProduct[] = [
      {
        id: 'moiss-silver-1',
        name: 'Signature Moissanite Solitaire',
        type: 'moissanite',
        metal: 'silver',
        matchScore: 98,
        psychReason: 'Perfect alignment with your profile',
        urgency: 'Limited availability for your personality type'
      },
      {
        id: 'moiss-silver-2',
        name: 'Classic Silver Band Set',
        type: 'moissanite',
        metal: 'silver',
        matchScore: 95,
        psychReason: 'Optimal value-quality balance'
      },
      {
        id: 'lab-gold-1',
        name: 'Lab Diamond Gold Ring',
        type: 'lab-diamond',
        metal: 'gold',
        matchScore: 78,
        psychReason: 'Secondary recommendation for special occasions'
      }
    ]

    // Adjust recommendations based on variant
    switch (variant) {
      case 'dna':
        baseRecommendations[0].psychReason = 'Genetically matched to your sparkle DNA'
        baseRecommendations[1].psychReason = 'Molecularly optimized for your personality'
        break
      case 'conscious':
        baseRecommendations[0].psychReason = 'Maximum positive impact choice'
        baseRecommendations[1].psychReason = 'Sustainable luxury that saves 2.1 tons CO₂'
        break
      case 'ecosystem':
        baseRecommendations[0].psychReason = 'Perfect synergy with your lifestyle'
        baseRecommendations[1].psychReason = 'Adapts seamlessly across all occasions'
        break
      case 'investment':
        baseRecommendations[0].psychReason = 'Best ROI in your portfolio'
        baseRecommendations[1].psychReason = 'Strategic value appreciation potential'
        break
    }

    return baseRecommendations
  }

  // Generate personalized message
  const generatePersonalizedMessage = (): string => {
    switch (variant) {
      case 'dna':
        return `Your Gemstone DNA shows 98% compatibility with Moissanite + Silver`
      case 'conscious':
        return `Your conscious choices have saved 2.3 tons CO₂ • Next goal: Sustainable Set`
      case 'ecosystem':
        return `Style Ecosystem Harmony: 94% • Your perfect lifestyle integration`
      case 'investment':
        return `Portfolio Performance: +24% • Smart allocation: 78% Moissanite`
      default:
        return 'Your personalized jewelry experience awaits'
    }
  }

  // Generate uniqueness factors
  const generateUniquenessFactors = (): string[] => {
    switch (variant) {
      case 'dna':
        return ['Only 3% share your exact gemstone DNA', 'Rare precision-seeking traits', 'Genetically optimal sparkle preferences']
      case 'conscious':
        return ['Top 5% of conscious consumers', 'Pioneering sustainable luxury', 'Leading environmental impact']
      case 'ecosystem':
        return ['Unique lifestyle integration pattern', 'Sophisticated style evolution', 'Multi-occasion harmony expert']
      case 'investment':
        return ['Strategic value optimizer', 'Long-term thinking advantage', 'Calculated elegance investor']
      default:
        return ['Uniquely you']
    }
  }

  const updateProfile = (updates: Partial<UserPsychProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }))
  }

  const contextValue: PsychologicalContext = {
    userProfile,
    updateProfile,
    recommendedProducts: generateRecommendations(),
    personalizedMessage: generatePersonalizedMessage(),
    uniquenessFactors: generateUniquenessFactors()
  }

  return (
    <PsychContext.Provider value={contextValue}>
      <header className={cn('sticky top-0 z-50 w-full bg-background border-b border-border', className)}>
        {children}
        
        {/* Smart Cart Enhancement */}
        <div className="hidden lg:block absolute top-full right-4 mt-2">
          {cartItemCount === 0 && isProfileComplete && (
            <div className="bg-background rounded-lg shadow-lg border border-border p-3 max-w-xs">
              <div className="text-xs text-aurora-nav-muted bg-background mb-1">Recommended for you:</div>
              <div className="text-sm font-medium text-foreground bg-background">
                {contextValue.recommendedProducts[0]?.name}
              </div>
              <div className="text-xs text-cta bg-background mt-1">
                {contextValue.recommendedProducts[0]?.matchScore}% match
              </div>
            </div>
          )}
        </div>
      </header>
    </PsychContext.Provider>
  )
}

// Shared components for all enhanced navigation variants
export const SmartSearch = ({ variant, placeholder }: { variant: string, placeholder: string }) => {
  const { userProfile } = usePsychProfile()
  
  const getSearchIcon = () => {
    switch (variant) {
      case 'dna': return '🧬'
      case 'conscious': return '🌱'
      case 'ecosystem': return '🔗'
      case 'investment': return '📈'
      default: return '🔍'
    }
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm">
        {getSearchIcon()}
      </span>
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-10 pr-4 bg-gradient-to-r from-gray-50 to-white border-0 rounded-xl h-9"
      />
    </div>
  )
}

export const SmartCartIcon = () => {
  const { recommendedProducts } = usePsychProfile()
  const [cartItemCount] = useState(0)
  
  return (
    <Button variant="ghost" size="icon" asChild>
      <Link href="/cart">
        <div className="relative">
          <ShoppingCart size={20} />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-cta text-background text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
          {/* Smart recommendation indicator */}
          {cartItemCount === 0 && recommendedProducts.length > 0 && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          )}
        </div>
      </Link>
    </Button>
  )
}

export const PersonalizedBanner = ({ variant }: { variant: string }) => {
  const { personalizedMessage, uniquenessFactors } = usePsychProfile()
  
  const getBannerGradient = () => {
    switch (variant) {
      case 'dna': return 'from-blue-50 via-purple-50 to-blue-50'
      case 'conscious': return 'from-green-50 via-blue-50 to-green-50'
      case 'ecosystem': return 'from-orange-50 via-pink-50 to-orange-50'
      case 'investment': return 'from-gray-50 via-green-50 to-gray-50'
      default: return 'from-gray-50 to-white'
    }
  }

  return (
    <div className={cn('bg-gradient-to-r border-b border-border', getBannerGradient())}>
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center space-x-4 text-sm">
          <span className="text-foreground bg-background font-medium">
            {personalizedMessage}
          </span>
          <span className="text-aurora-nav-muted bg-background hidden sm:inline">
            {uniquenessFactors[0]}
          </span>
          <button className="text-cta bg-background hover:text-cta-hover font-medium underline underline-offset-2">
            Personalize
          </button>
        </div>
      </div>
    </div>
  )
}