
# Codebase Audit & Refactoring Plan

This document outlines the results of a comprehensive codebase audit focused on identifying unused and dead code within the `src` directory. The audit followed the guidelines specified in `Docs/Claude_Rules.md`.

## Summary of Findings

The audit identified a significant number of unused components, hooks, and services. These files are candidates for removal to improve codebase maintainability, reduce bundle size, and simplify the project structure.

## Unused Components

The following components were identified as unused. They are not imported or used by any other component in the application.

| Component Name | File Path |
| :--- | :--- |
| `ValuePropositionSection` | `src/components/homepage/ValuePropositionSection.tsx` |
| `AuroraPlayground` | `src/components/aurora/AuroraPlayground.tsx` |
| `PriceDisplay` | `src/components/foundation/SpecializedTypography.tsx` |
| `CaratDisplay` | `src/components/foundation/SpecializedTypography.tsx` |
| `MetalTypeDisplay` | `src/components/foundation/SpecializedTypography.tsx` |
| `CaptionText` | `src/components/foundation/SpecializedTypography.tsx` |
| `NavText` | `src/components/foundation/SpecializedTypography.tsx` |
| `LinkText` | `src/components/foundation/SpecializedTypography.tsx` |
| `AuroraBodyXL` | `src/components/foundation/AuroraTypography.tsx` |

### Sample Unused Component: `ValuePropositionSection`

```tsx
'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { H2, H3, BodyText, MutedText } from '../foundation/Typography'
import { useABTest } from '../../hooks/useDesignVersion'
import { Container } from '../layout/Container'
import { TrustSignalsRow } from './value-proposition/TrustSignalsRow'
import { defaultValueProps } from './value-proposition/valuePropositionData'
import type { ValueProp } from '../../types/value-prop'

const valuePropositionVariants = cva(
  'bg-background',
  {
    variants: {
      spacing: {
        comfortable: 'py-token-4xl sm:py-token-5xl lg:py-token-6xl',
        compact: 'py-token-3xl sm:py-token-4xl lg:py-token-5xl',
        spacious: 'py-token-5xl sm:py-token-6xl lg:py-token-8xl'
      },
      layout: {
        default: 'px-token-md sm:px-token-lg lg:px-token-xl',
        wide: 'px-token-lg sm:px-token-xl lg:px-token-3xl',
        contained: 'px-token-md sm:px-token-lg lg:px-token-xl'
      }
    },
    defaultVariants: {
      spacing: 'comfortable',
      layout: 'contained'
    }
  }
)

const gridVariants = cva(
  'grid gap-token-xl lg:gap-token-3xl',
  {
    variants: {
      columns: {
        three: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        two: 'grid-cols-1 lg:grid-cols-2',
        stacked: 'grid-cols-1'
      },
      alignment: {
        center: 'items-center text-center',
        start: 'items-start text-left',
        stretch: 'items-stretch'
      }
    },
    defaultVariants: {
      columns: 'three',
      alignment: 'center'
    }
  }
)

const valueCardVariants = cva(
  'group relative',
  {
    variants: {
      cardStyle: {
        minimal: 'space-y-token-md',
        card: 'bg-muted/30 p-6 lg:p-8 space-y-token-md hover:bg-muted/40 transition-colors duration-300 rounded-token-md',
        bordered: 'border border-muted p-6 lg:p-8 space-y-token-md hover:border-accent/30 transition-colors duration-300 rounded-token-md'
      },
      emphasis: {
        none: '',
        subtle: 'transform hover:scale-101 transition-transform duration-token-normal',
        strong: 'transform hover:scale-105 transition-all duration-token-normal hover:shadow-near'
      }
    },
    defaultVariants: {
      cardStyle: 'minimal',
      emphasis: 'subtle'
    }
  }
)

const iconVariants = cva(
  'flex items-center justify-center',
  {
    variants: {
      size: {
        sm: 'w-12 h-12 text-lg rounded-34',
        md: 'w-16 h-16 text-xl rounded-34',
        lg: 'w-20 h-20 text-2xl rounded-34'
      },
      style: {
        accent: 'bg-accent/10 text-accent',
        muted: 'bg-muted text-foreground',
        gradient: 'bg-gradient-to-br from-accent/20 to-accent/10 text-accent'
      }
    },
    defaultVariants: {
      size: 'md',
      style: 'accent'
    }
  }
)

const trustSignalVariants = cva(
  'inline-flex items-center gap-token-sm px-token-md py-token-xs rounded-34 text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-muted/50 text-foreground',
        accent: 'bg-accent/10 text-accent',
        success: 'bg-accent/20 text-accent'
      }
    },
    defaultVariants: {
      variant: 'accent'
    }
  }
)


interface ValuePropositionSectionProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof valuePropositionVariants>,
    VariantProps<typeof gridVariants>,
    VariantProps<typeof valueCardVariants> {
  /** Main section headline */
  headline?: string
  /** Section description/subtitle */
  description?: string
  /** Custom value propositions - if not provided, defaults will be used */
  valueProps?: ValueProp[]
  /** Show trust signals at the bottom */
  showTrustSignals?: boolean
  /** Icon size for value prop icons */
  iconSize?: 'sm' | 'md' | 'lg'
  /** Icon style variant */
  iconStyle?: 'accent' | 'muted' | 'gradient'
}


export function ValuePropositionSection({
  className,
  spacing,
  layout,
  columns,
  alignment,
  cardStyle,
  emphasis,
  headline = 'Luxury That Aligns With Your Values',
  description = 'We believe true luxury comes from knowing your choices make a positive impact. Every piece is crafted with ethical sourcing, sustainable practices, and the freedom to express your authentic self.',
  valueProps = defaultValueProps,
  showTrustSignals = true,
  iconSize = 'md',
  iconStyle = 'accent',
  ...props
}: ValuePropositionSectionProps) {
  // A/B Testing for Value Proposition Section
  const { 
    version, 
    isAurora, 
    trackInteraction, 
    trackConversion 
  } = useABTest('ValuePropositionSection')
  
  return (
    <section
      className={cn(
        valuePropositionVariants({ spacing, layout: layout === 'contained' ? 'default' : layout }), 
        // A/B Test: Add aurora glow for enhanced version
        isAurora ? 'bg-gradient-to-b from-background to-background/95 backdrop-blur-sm' : '',
        className
      )}
      {...props}
    >
      <Container maxWidth="default">
      {/* Section Header */}
      <div className="text-center max-w-4xl mx-auto mb-12 lg:mb-16">
        <H2 
          id="value-proposition-heading"
          className={cn(
            "mb-4 lg:mb-6",
            // A/B Test: Enhanced headline styling for Aurora version
            isAurora ? 'bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent' : ''
          )}
        >
          {isAurora ? `${headline} ✨` : headline}
        </H2>
        <BodyText 
          size="lg" 
          className="text-foreground max-w-3xl mx-auto"
        >
          {description}
        </BodyText>
      </div>

      {/* Value Propositions Grid */}
      <div className={cn(gridVariants({ columns, alignment }))}>
        {valueProps.map((prop, index) => (
          <article 
            key={index}
            className={cn(valueCardVariants({ cardStyle, emphasis }))}
          >
            {/* Icon */}
            <div className={cn(
              iconVariants({ size: iconSize, style: iconStyle }),
              alignment === 'center' ? 'mx-auto' : ''
            )}>
              <span className={cn(
                iconSize === 'sm' ? 'text-lg' : 
                iconSize === 'md' ? 'text-xl' : 'text-2xl'
              )}>
                {prop.icon}
              </span>
            </div>

            {/* Content */}
            <div className="space-y-token-md">
              <H3 
                id={`value-prop-${index}-heading`}
                className="text-foreground"
              >
                {prop.headline}
              </H3>
              <BodyText className="text-foreground leading-relaxed">
                {prop.description}
              </BodyText>
            </div>

            {/* Trust Signals */}
            {showTrustSignals && prop.trustSignals && (
              <div className="flex flex-wrap gap-token-sm pt-token-sm">
                {prop.trustSignals.map((signal, signalIndex) => (
                  <div 
                    key={signalIndex}
                    className={cn(trustSignalVariants({ variant: signal.variant }))}
                  >
                    <span>
                      {signal.icon}
                    </span>
                    <MutedText size="sm" className="font-medium">
                      {signal.text}
                    </MutedText>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Additional Trust Signals Row */}
      <TrustSignalsRow 
        showTrustSignals={showTrustSignals}
        isAurora={isAurora}
        trackInteraction={trackInteraction}
      />

      {/* Screen Reader Enhancement */}
      <div className="sr-only">
        <h3>Our Core Values Summary</h3>
        <p>
          GlowGlitch is committed to ethical sourcing with 100% conflict-free diamonds, 
          unlimited customization for personal expression, and sustainable practices 
          including recycled metals and carbon-neutral operations. We believe luxury 
          should align with your values and make a positive impact on the world.
        </p>
      </div>
      </Container>
    </section>
  )
}

export type ValuePropositionVariant = VariantProps<typeof valuePropositionVariants>
export type ValuePropositionGridVariant = VariantProps<typeof gridVariants>
export type ValuePropositionCardVariant = VariantProps<typeof valueCardVariants>
```

## Unused Hooks

The following hooks were identified as unused.

| Hook Name | File Path |
| :--- | :--- |
| `useValueProposition` | `src/hooks/useValueProposition.ts` |
| `useAvailableProducts` | `src/hooks/use-available-products.ts` |
| `useProductCustomization` | `src/hooks/use-product-customization.ts` |
| `useCartManagement` | `src/hooks/useCartManagement.ts` |
| `useClickOutside` | `src/hooks/useClickOutside.ts` |
| `useCustomizableProduct` | `src/hooks/useCustomizableProduct.ts` |
| `useCustomization` | `src/hooks/useCustomization.ts` |
| `useDatabaseCustomizer` | `src/hooks/useDatabaseCustomizer.ts` |
| `useProductData` | `src/hooks/useProductData.ts` |
| `useScrollBehavior` | `src/hooks/useScrollBehavior.ts` |
| `useSearch` | `src/hooks/useSearch.ts` |
| `useTypeSafety` | `src/hooks/useTypeSafety.ts` |
| `useUserSession` | `src/hooks/useUserSession.ts` |

### Sample Unused Hook: `useValueProposition`

```ts
/**
 * useValueProposition Hook
 * Aurora Design System - Batch 2 Migration
 * Extracted from EnhancedValueProposition.tsx for better maintainability
 * Handles card interactions, animation orchestration, and keyboard navigation
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { AnimationConfig, ResponsiveConfig } from '../data/valuePropositionData'

export interface CardInteractionState {
  activeCard: string | null
  animatedCards: Set<string>
  isInView: boolean
  hoveredCard: string | null
}

export interface CardInteractionControls {
  setActiveCard: (cardId: string | null) => void
  handleCardEnter: (cardId: string) => void
  handleCardLeave: (cardId: string) => void
  handleCardFocus: (cardId: string) => void
  handleCardBlur: () => void
  resetInteractions: () => void
}

export interface UseValuePropositionOptions {
  animationConfig: AnimationConfig
  responsiveConfig: ResponsiveConfig
  cardIds: string[]
  threshold?: number
}

export interface UseValuePropositionReturn {
  intersectionRef: React.RefObject<HTMLDivElement>
  interactionState: CardInteractionState
  interactionControls: CardInteractionControls
  shouldAnimate: boolean
  isCardActive: (cardId: string) => boolean
  isCardAnimated: (cardId: string) => boolean
  getCardState: (cardId: string) => 'default' | 'active' | 'dimmed'
}

/**
 * Custom hook for managing value proposition card interactions and animations
 * Handles staggered animations, hover states, keyboard navigation, and accessibility
 */
export function useValueProposition({
  animationConfig,
  responsiveConfig,
  cardIds,
  threshold = 0.2
}: UseValuePropositionOptions): UseValuePropositionReturn {
  // Intersection observer reference
  const intersectionRef = useRef<HTMLDivElement>(null)
  
  // Interaction state management
  const [interactionState, setInteractionState] = useState<CardInteractionState>({
    activeCard: null,
    animatedCards: new Set(),
    isInView: false,
    hoveredCard: null
  })
  
  // Intersection Observer for animation trigger
  useEffect(() => {
    if (!animationConfig.enableAnimation) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInteractionState(prev => ({
            ...prev,
            isInView: true
          }))
        }
      },
      { threshold }
    )
    
    const element = intersectionRef.current
    if (element) {
      observer.observe(element)
    }
    
    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [animationConfig.enableAnimation, threshold])
  
  // Staggered animation for cards
  useEffect(() => {
    if (!interactionState.isInView || !animationConfig.enableAnimation) return
    
    cardIds.forEach((cardId, index) => {
      setTimeout(() => {
        setInteractionState(prev => ({
          ...prev,
          animatedCards: new Set(Array.from(prev.animatedCards).concat(cardId))
        }))
      }, index * animationConfig.animationDelay)
    })
  }, [interactionState.isInView, animationConfig.enableAnimation, animationConfig.animationDelay, cardIds])
  
  // Card interaction handlers
  const handleCardEnter = useCallback((cardId: string) => {
    if (!animationConfig.enableInteraction) return
    
    setInteractionState(prev => ({
      ...prev,
      hoveredCard: cardId,
      activeCard: cardId
    }))
  }, [animationConfig.enableInteraction])
  
  const handleCardLeave = useCallback((cardId: string) => {
    if (!animationConfig.enableInteraction) return
    
    setInteractionState(prev => ({
      ...prev,
      hoveredCard: null,
      activeCard: prev.activeCard === cardId ? null : prev.activeCard
    }))
  }, [animationConfig.enableInteraction])
  
  const handleCardFocus = useCallback((cardId: string) => {
    setInteractionState(prev => ({
      ...prev,
      activeCard: cardId
    }))
  }, [])
  
  const handleCardBlur = useCallback(() => {
    setInteractionState(prev => ({
      ...prev,
      activeCard: null
    }))
  }, [])
  
  const setActiveCard = useCallback((cardId: string | null) => {
    setInteractionState(prev => ({
      ...prev,
      activeCard: cardId
    }))
  }, [])
  
  const resetInteractions = useCallback(() => {
    setInteractionState(prev => ({
      ...prev,
      activeCard: null,
      hoveredCard: null
    }))
  }, [])
  
  // Interaction controls
  const interactionControls: CardInteractionControls = {
    setActiveCard,
    handleCardEnter,
    handleCardLeave,
    handleCardFocus,
    handleCardBlur,
    resetInteractions
  }
  
  // Utility functions
  const isCardActive = useCallback((cardId: string) => {
    return interactionState.activeCard === cardId
  }, [interactionState.activeCard])
  
  const isCardAnimated = useCallback((cardId: string) => {
    return interactionState.animatedCards.has(cardId)
  }, [interactionState.animatedCards])
  
  const getCardState = useCallback((cardId: string): 'default' | 'active' | 'dimmed' => {
    const { activeCard, hoveredCard } = interactionState
    
    if (!animationConfig.enableInteraction) {
      return 'default'
    }
    
    if (activeCard === cardId || hoveredCard === cardId) {
      return 'active'
    }
    
    if (activeCard && activeCard !== cardId) {
      return 'dimmed'
    }
    
    return 'default'
  }, [interactionState, animationConfig.enableInteraction])
  
  // Handle keyboard navigation
  useEffect(() => {
    if (!animationConfig.enableInteraction) return
    
    const handleKeyDown = (event: KeyboardEvent) => {
      const { activeCard } = interactionState
      const currentIndex = activeCard ? cardIds.indexOf(activeCard) : -1
      
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault()
          const nextIndex = currentIndex < cardIds.length - 1 ? currentIndex + 1 : 0
          setActiveCard(cardIds[nextIndex])
          break
          
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault()
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : cardIds.length - 1
          setActiveCard(cardIds[prevIndex])
          break
          
        case 'Escape':
          event.preventDefault()
          setActiveCard(null)
          break
          
        case 'Home':
          event.preventDefault()
          setActiveCard(cardIds[0])
          break
          
        case 'End':
          event.preventDefault()
          setActiveCard(cardIds[cardIds.length - 1])
          break
      }
    }
    
    const element = intersectionRef.current
    if (element) {
      element.addEventListener('keydown', handleKeyDown)
      return () => element.removeEventListener('keydown', handleKeyDown)
    }
  }, [animationConfig.enableInteraction, interactionState, cardIds, setActiveCard])
  
  // Determine if animations should run
  const shouldAnimate = animationConfig.enableAnimation && interactionState.isInView
  
  return {
    intersectionRef,
    interactionState,
    interactionControls,
    shouldAnimate,
    isCardActive,
    isCardAnimated,
    getCardState
  }
}
```

## Unused Services

The following services were identified as unused.

| Service Name | File Path |
| :--- | :--- |
| `authService` | `src/services/authService.ts` |
| `cartService` | `src/services/cartService.ts` |
| `productService` | `src/services/productService.ts` |
| `searchService` | `src/services/searchService.ts` |

### Sample Unused Service: `authService`

```ts
/**
 * Authentication Service - Handles all auth-related API interactions
 * Compliant with CLAUDE_RULES: Isolated API logic from UI components
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'creator' | 'admin';
  profile?: {
    phone?: string;
    dateOfBirth?: string;
    preferences: {
      newsletter: boolean;
      notifications: boolean;
      currency: string;
      language: string;
    };
  };
  addresses?: Array<{
    id: string;
    type: 'shipping' | 'billing';
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>;
  creatorProfile?: {
    status: 'pending' | 'approved' | 'suspended';
    commissionRate: number;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    totalCommissions: number;
    referralCode: string;
  };
}

export interface RegisterParams {
  email: string;
  password: string;
  name: string;
  acceptTerms: boolean;
}

export interface LoginParams {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken?: string;
  refreshToken?: string;
}

export interface UpdateProfileParams {
  name?: string;
  phone?: string;
  dateOfBirth?: string;
  preferences?: {
    newsletter?: boolean;
    notifications?: boolean;
    currency?: string;
    language?: string;
  };
}

export interface AddressParams {
  type: 'shipping' | 'billing';
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

/**
 * Register a new user account
 * @param params - Registration parameters
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<AuthResponse>
 */
export async function registerUser(
  params: RegisterParams,
  signal?: AbortSignal
): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Registration failed');
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      throw new Error(data.error?.message || 'Registration failed');
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred during registration');
  }
}

/**
 * Login user
 * @param params - Login parameters
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<AuthResponse>
 */
export async function loginUser(
  params: LoginParams,
  signal?: AbortSignal
): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw new Error(errorData.error?.message || 'Login failed');
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      throw new Error(data.error?.message || 'Login failed');
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred during login');
  }
}

/**
 * Logout current user
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<void>
 */
export async function logoutUser(signal?: AbortSignal): Promise<void> {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      signal,
    });

    if (!response.ok) {
      // Don't throw on logout failure, just log warning
      console.warn('Logout request failed:', response.status, response.statusText);
    }

    const data = await response.json().catch(() => ({}));

    if (!data.success && data.error) {
      console.warn('Logout error:', data.error.message);
    }
  } catch (error) {
    // Don't throw on logout failure, just log warning
    console.warn('Error during logout:', error);
  }
}

/**
 * Get current user session
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<User | null>
 */
export async function getCurrentSession(signal?: AbortSignal): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      signal,
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null; // Not authenticated
      }
      throw new Error(`Session check failed: ${response.status}`);
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      if (data.error?.code === 'UNAUTHENTICATED') {
        return null;
      }
      throw new Error(data.error?.message || 'Session check failed');
    }

    return data.data?.user || null;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    console.warn('Error checking session:', error);
    return null;
  }
}

/**
 * Update user profile
 * @param params - Profile update parameters
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<User>
 */
export async function updateUserProfile(
  params: UpdateProfileParams,
  signal?: AbortSignal
): Promise<User> {
  try {
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Profile update failed');
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      throw new Error(data.error?.message || 'Profile update failed');
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while updating profile');
  }
}

/**
 * Add user address
 * @param params - Address parameters
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<User>
 */
export async function addUserAddress(
  params: AddressParams,
  signal?: AbortSignal
): Promise<User> {
  try {
    const response = await fetch('/api/user/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to add address');
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to add address');
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while adding address');
  }
}

/**
 * Update user address
 * @param addressId - Address ID to update
 * @param params - Updated address parameters
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<User>
 */
export async function updateUserAddress(
  addressId: string,
  params: Partial<AddressParams>,
  signal?: AbortSignal
): Promise<User> {
  try {
    const response = await fetch(`/api/user/addresses/${addressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to update address');
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to update address');
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while updating address');
  }
}

/**
 * Delete user address
 * @param addressId - Address ID to delete
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<User>
 */
export async function deleteUserAddress(
  addressId: string,
  signal?: AbortSignal
): Promise<User> {
  try {
    const response = await fetch(`/api/user/addresses/${addressId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to delete address');
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to delete address');
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while deleting address');
  }
}

/**
 * Request password reset
 * @param email - User email
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<void>
 */
export async function requestPasswordReset(
  email: string,
  signal?: AbortSignal
): Promise<void> {
  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Password reset request failed');
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      throw new Error(data.error?.message || 'Password reset request failed');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred during password reset request');
  }
}
```

## Architectural Guidance for Refactoring

Refactoring is not just "cleaning up code." It's a disciplined process of improving the internal structure of the code without changing its external behavior. Done right, it increases maintainability and velocity. Done wrong, it introduces bugs and slows you down.

Here’s what to focus on:

### 1. Start with "Why" - Define the Goal

Before you change a single line of code, be crystal clear about your objective. Are you refactoring to:

*   **Pay Down Technical Debt?** (e.g., removing the unused components from our audit)
*   **Improve Performance?** (e.g., optimizing a slow database query or a component's render cycle)
*   **Increase Maintainability?** (e.g., breaking down a large component into smaller, single-responsibility ones)
*   **Prepare for a New Feature?** (e.g., abstracting a piece of logic that will be needed elsewhere)

Your goal dictates your strategy. Don't refactor for the sake of refactoring.

### 2. Safety First: Your Safety Net is Non-Negotiable

**Never refactor without a safety net.**

*   **Tests are your best friend.** Before you start, ensure the code you're about to refactor has solid test coverage. If it doesn't, your first step is to **write tests**. These "characterization tests" document the current behavior, warts and all. They are the only way you'll know if you broke something.
*   **Use Version Control.** Create a dedicated branch for your refactoring. Make small, atomic commits with clear messages (e.g., `refactor: Extract ProductPrice component from ProductCard`). This makes it easy to revert changes if you go down a wrong path.

### 3. Make Small, Incremental Changes

**Avoid "big bang" refactoring.** Large, sweeping changes are hard to review, risky to merge, and a nightmare to debug if something goes wrong.

*   **One change at a time.** A single refactoring should be a small, verifiable step. For example, renaming a variable is one refactoring. Extracting a function is another.
*   **Run tests after every small change.** This gives you immediate feedback and builds confidence.
*   **Don't mix refactoring with feature development.** A commit should either be a refactoring or a feature, never both. This keeps your changes clean and your intent clear.

### 4. Follow the "Boy Scout Rule"

"Always leave the code better than you found it." This principle encourages a culture of continuous, small-scale refactoring. If you're in a file to fix a bug, and you see a poorly named variable, take 10 seconds to rename it. This prevents technical debt from accumulating.

### 5. Architectural & Code-Level Principles

When you're in the weeds, keep these principles in mind:

*   **Single Responsibility Principle (SRP):** A component or function should have only one reason to change. If a component is fetching data, managing state, *and* handling user input, it's doing too much. Break it apart.
*   **Don't Repeat Yourself (DRY):** If you see the same block of code in multiple places, it's a candidate for extraction into a shared function or component.
*   **Adhere to Project Structure:** Respect the established architecture (e.g., the `services` -> `hooks` -> `components` flow in this project). Don't introduce new patterns without discussing it with the team. The goal is a consistent, predictable codebase.
*   **YAGNI (You Ain't Gonna Need It):** Resist the urge to build abstractions for future use cases you *think* might happen. Solve today's problem in the simplest way possible.

### 6. The Human Element

*   **Communicate.** Let your team know what you're refactoring and why. This avoids merge conflicts and ensures everyone is aligned.
*   **Pair Programming & Code Reviews.** Refactoring is a great opportunity for collaboration. A second pair of eyes will spot things you miss and can lead to better solutions. Keep pull requests small and focused to make them easy to review.

### Applying This to Our Audit

The list of unused files we just generated is the "low-hanging fruit" of refactoring. It's a perfect starting point because the risk is low and the benefit (a cleaner, smaller codebase) is immediate.

Your next steps should be:
1.  Create a new branch: `git checkout -b refactor/remove-unused-code`.
2.  Pick one file from the list, delete it, and remove its imports from any `index.ts` files.
3.  Commit that single change: `git commit -m "refactor: remove unused ValuePropositionSection component"`.
4.  Run your tests.
5.  Repeat for the next file.

By following this disciplined process, you'll make the codebase significantly better without introducing unnecessary risk.

## Refactoring Plan

1.  **Review and Confirm:** Review the list of unused files with the development team to confirm they are safe to delete.
2.  **Delete Files:** Delete the identified unused component, hook, and service files.
3.  **Remove Exports:** Remove the exports of the deleted files from any `index.ts` files.
4.  **Run Tests:** Run the full test suite to ensure that the changes have not introduced any regressions.
5.  **Manual Testing:** Perform a round of manual testing on the application to verify that everything is working as expected.

By following this plan, we can safely and efficiently clean up the codebase, leading to a more maintainable and performant application.
