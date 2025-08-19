/**
 * Wishlist Button Component
 * Shows wishlist count and navigates to wishlist page
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWishlist } from '@/hooks/useWishlist'
import { MutedText } from '@/components/foundation/Typography'

interface WishlistButtonProps {
  className?: string
  showCount?: boolean
  variant?: 'icon' | 'text' | 'both'
}

export function WishlistButton({ 
  className, 
  showCount = true,
  variant = 'icon'
}: WishlistButtonProps) {
  const { getWishlistCount, loading } = useWishlist()
  const count = getWishlistCount()
  
  return (
    <Link
      href="/wishlist"
      className={cn(
        'relative group flex items-center gap-2 p-2 rounded-lg',
        'hover:bg-accent/10 transition-colors',
        className
      )}
      aria-label={`Wishlist (${count} items)`}
    >
      <div className="relative">
        <Heart 
          className={cn(
            'w-5 h-5 transition-colors',
            count > 0 ? 'text-accent fill-accent' : 'text-muted-foreground'
          )}
        />
        
        {showCount && count > 0 && (
          <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-accent text-white text-xs font-semibold rounded-full px-1">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </div>
      
      {(variant === 'text' || variant === 'both') && (
        <MutedText className="hidden sm:block">
          Wishlist
        </MutedText>
      )}
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </Link>
  )
}