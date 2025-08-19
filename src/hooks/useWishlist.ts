/**
 * Wishlist Hook
 * Manages wishlist state and operations with optimistic updates
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// Simple toast replacement for notifications
const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message),
  info: (message: string) => console.log('ℹ️', message)
}

interface WishlistItem {
  productId: string
  productName: string
  productImage: string
  productSKU: string
  currentPrice: number
  originalPrice?: number
  customizations?: any
  variantSKU?: string
  addedAt: Date
  notes?: string
}

interface Wishlist {
  _id: string
  userId: string
  name: string
  description?: string
  items: WishlistItem[]
  isPublic: boolean
  shareUrl?: string
  totalValue: number
  itemCount: number
  createdAt: string
  updatedAt: string
}

interface UseWishlistReturn {
  wishlists: Wishlist[]
  loading: boolean
  error: string | null
  isInWishlist: (productId: string, customizations?: any) => boolean
  addToWishlist: (productId: string, customizations?: any, notes?: string) => Promise<boolean>
  removeFromWishlist: (productId: string, customizations?: any) => Promise<boolean>
  toggleWishlist: (productId: string, customizations?: any) => Promise<void>
  getWishlistCount: () => number
  refreshWishlists: () => Promise<void>
  clearGuestWishlist: () => void
}

// Guest ID management
const getGuestId = (): string => {
  if (typeof window === 'undefined') return ''
  
  let guestId = localStorage.getItem('guestWishlistId')
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`
    localStorage.setItem('guestWishlistId', guestId)
  }
  return guestId
}

export function useWishlist(): UseWishlistReturn {
  const [wishlists, setWishlists] = useState<Wishlist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Always use guest ID for now (auth not set up yet)
  const guestId = useMemo(() => {
    return getGuestId()
  }, [])
  
  // Fetch wishlists
  const fetchWishlists = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (guestId) params.set('guestId', guestId)
      
      const response = await fetch(`/api/wishlist?${params.toString()}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated - use local storage for guest
          const localWishlist = localStorage.getItem('guestWishlist')
          if (localWishlist) {
            setWishlists([JSON.parse(localWishlist)])
          } else {
            setWishlists([])
          }
          return
        }
        throw new Error('Failed to fetch wishlists')
      }
      
      const data = await response.json()
      setWishlists(data.data || [])
      
      // Save to local storage for offline access
      if (guestId && data.data?.length > 0) {
        localStorage.setItem('guestWishlist', JSON.stringify(data.data[0]))
      }
      
    } catch (err) {
      console.error('Error fetching wishlists:', err)
      setError(err instanceof Error ? err.message : 'Failed to load wishlist')
      
      // Fallback to local storage
      const localWishlist = localStorage.getItem('guestWishlist')
      if (localWishlist) {
        setWishlists([JSON.parse(localWishlist)])
      }
    } finally {
      setLoading(false)
    }
  }, [guestId])
  
  // Initial fetch
  useEffect(() => {
    fetchWishlists()
  }, [fetchWishlists])
  
  // Check if item is in wishlist
  const isInWishlist = useCallback((productId: string, customizations?: any): boolean => {
    if (wishlists.length === 0) return false
    
    return wishlists.some(wishlist => 
      wishlist.items.some(item => 
        item.productId === productId && 
        JSON.stringify(item.customizations) === JSON.stringify(customizations)
      )
    )
  }, [wishlists])
  
  // Add item to wishlist
  const addToWishlist = useCallback(async (
    productId: string, 
    customizations?: any, 
    notes?: string
  ): Promise<boolean> => {
    try {
      // Optimistic update
      const optimisticItem: WishlistItem = {
        productId,
        productName: 'Loading...',
        productImage: '',
        productSKU: '',
        currentPrice: 0,
        customizations,
        addedAt: new Date(),
        notes
      }
      
      setWishlists(prev => {
        if (prev.length === 0) {
          return [{
            _id: 'temp',
            userId: guestId || '',
            name: 'My Wishlist',
            items: [optimisticItem],
            isPublic: false,
            totalValue: 0,
            itemCount: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }]
        }
        
        const updated = [...prev]
        updated[0] = {
          ...updated[0],
          items: [...updated[0].items, optimisticItem],
          itemCount: updated[0].itemCount + 1
        }
        return updated
      })
      
      // Make API call
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          customizations,
          notes,
          guestId
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to add to wishlist')
      }
      
      // Refresh wishlists to get accurate data
      await fetchWishlists()
      
      toast.success('Added to wishlist')
      return true
      
    } catch (err) {
      console.error('Error adding to wishlist:', err)
      
      // Revert optimistic update
      await fetchWishlists()
      
      toast.error('Failed to add to wishlist')
      return false
    }
  }, [guestId, fetchWishlists])
  
  // Remove item from wishlist
  const removeFromWishlist = useCallback(async (
    productId: string, 
    customizations?: any
  ): Promise<boolean> => {
    try {
      // Optimistic update
      setWishlists(prev => {
        if (prev.length === 0) return prev
        
        const updated = [...prev]
        updated[0] = {
          ...updated[0],
          items: updated[0].items.filter(item => 
            !(item.productId === productId && 
              JSON.stringify(item.customizations) === JSON.stringify(customizations))
          ),
          itemCount: updated[0].itemCount - 1
        }
        return updated
      })
      
      // Make API call
      const params = new URLSearchParams({
        productId,
        ...(customizations && { customizations: JSON.stringify(customizations) }),
        ...(guestId && { guestId })
      })
      
      const response = await fetch(`/api/wishlist?${params.toString()}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to remove from wishlist')
      }
      
      // Refresh wishlists
      await fetchWishlists()
      
      toast.success('Removed from wishlist')
      return true
      
    } catch (err) {
      console.error('Error removing from wishlist:', err)
      
      // Revert optimistic update
      await fetchWishlists()
      
      toast.error('Failed to remove from wishlist')
      return false
    }
  }, [guestId, fetchWishlists])
  
  // Toggle wishlist status
  const toggleWishlist = useCallback(async (
    productId: string, 
    customizations?: any
  ): Promise<void> => {
    const inWishlist = isInWishlist(productId, customizations)
    
    if (inWishlist) {
      await removeFromWishlist(productId, customizations)
    } else {
      await addToWishlist(productId, customizations)
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist])
  
  // Get total wishlist count
  const getWishlistCount = useCallback((): number => {
    return wishlists.reduce((sum, wishlist) => sum + wishlist.itemCount, 0)
  }, [wishlists])
  
  // Refresh wishlists
  const refreshWishlists = useCallback(async (): Promise<void> => {
    await fetchWishlists()
  }, [fetchWishlists])
  
  // Clear guest wishlist (for when user logs in)
  const clearGuestWishlist = useCallback((): void => {
    localStorage.removeItem('guestWishlist')
    localStorage.removeItem('guestWishlistId')
    setWishlists([])
  }, [])
  
  return {
    wishlists,
    loading,
    error,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    getWishlistCount,
    refreshWishlists,
    clearGuestWishlist
  }
}