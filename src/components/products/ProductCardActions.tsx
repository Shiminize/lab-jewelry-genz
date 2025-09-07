'use client'

import React from 'react'
import { Heart, Eye, ShoppingCart, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MutedText } from '@/components/foundation/Typography'

interface ProductCardActionsProps {
  variant?: 'standard' | 'featured' | 'compact'
  isAurora?: boolean
  isWishlisted?: boolean
  getClassName: (legacy: string, aurora?: string) => string
  onWishlistClick: (e: React.MouseEvent) => void
  onQuickViewClick: (e: React.MouseEvent) => void
  onAddToCartClick: (e: React.MouseEvent) => void
}

export function ProductCardActions({
  variant = 'standard',
  isAurora = false,
  isWishlisted = false,
  getClassName,
  onWishlistClick,
  onQuickViewClick,
  onAddToCartClick
}: ProductCardActionsProps) {
  // Wishlist Button (for non-compact variants)
  const WishlistButton = () => (
    <Button
      variant="ghost"
      size="md"
      className={getClassName(
        'absolute top-token-sm right-token-sm bg-surface/90 hover:bg-surface text-text-secondary opacity-0 group-hover:opacity-100 transition-all duration-300 p-token-sm rounded-token-lg shadow-md',
        'absolute top-token-md right-token-md bg-background/90 hover:bg-background text-foreground opacity-0 group-hover:opacity-100 transition-all duration-500 p-token-sm min-h-[2.75rem] min-w-[2.75rem] aurora-interactive-shadow rounded-token-lg backdrop-blur-sm'
      )}
      onClick={onWishlistClick}
    >
      <Heart 
        className={getClassName(
          `w-token-sm h-token-sm transition-colors duration-300 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`,
          `w-token-sm h-token-sm transition-all duration-300 ${isWishlisted ? 'fill-accent text-accent aurora-pulse' : 'group-hover:scale-110'}`
        )} 
      />
    </Button>
  )

  // Featured Badge for featured variant
  const FeaturedBadge = () => (
    <div className={getClassName(
      'flex items-center space-x-token-sm p-token-sm bg-accent/10 rounded-token-lg shadow-sm',
      'flex items-center space-x-token-sm p-token-md bg-gradient-to-r from-accent/10 to-aurora-nav-muted/10 rounded-token-md aurora-interactive-shadow group-hover:from-accent/20 group-hover:to-aurora-nav-muted/20 transition-all duration-500'
    )}>
      <Sparkles size={16} className={getClassName(
        'text-accent',
        'text-accent-secondary aurora-pulse'
      )} />
      <MutedText size="sm" className={getClassName(
        'text-text-secondary font-semibold',
        'text-foreground font-semibold aurora-gradient-text'
      )}>
        Featured Design
      </MutedText>
      {isAurora && (
        <div className="aurora-floating w-1 h-1 bg-accent-secondary rounded-token-sm" />
      )}
    </div>
  )

  // Compact Actions for compact variant
  const CompactActions = () => (
    <div className={getClassName('flex space-x-token-sm', 'flex space-x-token-sm')}>
      <Button
        variant="ghost"
        size="md"
        onClick={onWishlistClick}
        className={getClassName(
          'p-token-sm rounded-token-lg hover:bg-surface-hover transition-colors duration-200',
          'p-token-sm min-h-[2.75rem] min-w-[2.75rem] hover:bg-accent-interactive/10 aurora-interactive-shadow group-hover:scale-105 transition-all duration-300'
        )}
      >
        <Heart className={getClassName(
          `w-token-xs h-token-xs ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-text-secondary'}`,
          `w-token-xs h-token-xs ${isWishlisted ? 'fill-accent text-accent aurora-pulse' : 'text-foreground group-hover:scale-110'} transition-all duration-300`
        )} />
      </Button>
      
      <Button
        variant="ghost"  
        size="md"
        onClick={onQuickViewClick}
        className={getClassName(
          'p-token-sm rounded-token-lg hover:bg-surface-hover transition-colors duration-200',
          'p-token-sm min-h-[2.75rem] min-w-[2.75rem] hover:bg-accent-interactive/10 aurora-interactive-shadow group-hover:scale-105 transition-all duration-300'
        )}
      >
        <Eye className={getClassName(
          'w-token-xs h-token-xs text-text-secondary',
          'w-token-xs h-token-xs text-foreground group-hover:scale-110 transition-all duration-300'
        )} />
      </Button>
    </div>
  )

  // Standard Actions for standard and featured variants
  const StandardActions = () => (
    <div className={getClassName(
      'flex items-center space-x-token-sm pt-token-md',
      'flex items-center space-x-token-md pt-token-lg'
    )}>
      <Button
        variant="outline"
        size="md"
        onClick={onQuickViewClick}
        className={getClassName(
          'flex-1 rounded-token-lg hover:bg-surface-hover transition-colors duration-300',
          'flex-1 min-h-[2.75rem] aurora-interactive-shadow group-hover:scale-105 transition-all duration-300 hover:bg-accent-interactive/10'
        )}
      >
        <Eye className={getClassName(
          'w-token-sm h-token-sm mr-token-xs',
          'w-token-sm h-token-sm mr-token-sm group-hover:scale-110 transition-all duration-300'
        )} />
        <span className={getClassName('text-sm', 'text-token-sm')}>View</span>
      </Button>
      
      <Button
        variant="default"
        size="md"
        onClick={onAddToCartClick}
        className={getClassName(
          'flex-1 rounded-token-lg transition-colors duration-300',
          'flex-1 min-h-[2.75rem] aurora-interactive-shadow group-hover:scale-105 transition-all duration-300'
        )}
      >
        <ShoppingCart className={getClassName(
          'w-token-sm h-token-sm mr-token-xs',
          'w-token-sm h-token-sm mr-token-sm group-hover:scale-110 transition-all duration-300'
        )} />
        <span className={getClassName('text-sm', 'text-token-sm')}>Add</span>
      </Button>
    </div>
  )

  return (
    <>
      {/* Wishlist Button - Only for non-compact variants */}
      {variant !== 'compact' && <WishlistButton />}
      
      {/* Featured Badge - Only for featured variant */}
      {variant === 'featured' && <FeaturedBadge />}
      
      {/* Actions based on variant */}
      {variant === 'compact' ? <CompactActions /> : <StandardActions />}
    </>
  )
}