'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CartItem, CartSummary } from '@/services/neon/cartService'

const STORAGE_KEY = 'neon-cart-id'

interface CartClientState {
  cartId?: string
  items: CartItem[]
  isLoading: boolean
  error?: string
  addItem: (slug: string, quantity?: number) => Promise<void>
  removeItem: (slug: string) => Promise<void>
  clear: () => Promise<void>
  refresh: () => Promise<void>
}

async function createCartId(): Promise<string> {
  const response = await fetch('/api/neon/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new Error('Failed to create cart')
  }

  const payload = await response.json()
  return payload?.data?.cartId as string
}

async function fetchCart(cartId: string): Promise<CartSummary> {
  const response = await fetch(`/api/neon/cart/${cartId}`)
  if (!response.ok) {
    throw new Error('Failed to load cart')
  }
  const payload = await response.json()
  return payload.data as CartSummary
}

export function useCartClient(): CartClientState {
  const [cartId, setCartId] = useState<string | undefined>(undefined)
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)

  const ensureCartId = useCallback(async () => {
    if (cartId) return cartId

    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
    if (stored) {
      setCartId(stored)
      return stored
    }

    const nextId = await createCartId()
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, nextId)
    }
    setCartId(nextId)
    return nextId
  }, [cartId])

  const loadCart = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(undefined)
      const id = await ensureCartId()
      const cart = await fetchCart(id)
      setItems(cart.items)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load cart')
    } finally {
      setIsLoading(false)
    }
  }, [ensureCartId])

  useEffect(() => {
    void loadCart()
  }, [loadCart])

  const addItem = useCallback(
    async (slug: string, quantity = 1) => {
      try {
        const id = await ensureCartId()
        const response = await fetch(`/api/neon/cart/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, quantity }),
        })
        if (!response.ok) {
          throw new Error('Failed to add item to cart')
        }
        const payload = await response.json()
        setItems(payload.data.items)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to add item to cart')
      }
    },
    [ensureCartId],
  )

  const removeItem = useCallback(
    async (slug: string) => {
      try {
        const id = await ensureCartId()
        const response = await fetch(`/api/neon/cart/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        })
        if (!response.ok) {
          throw new Error('Failed to remove item from cart')
        }
        const payload = await response.json()
        setItems(payload.data.items)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to remove item from cart')
      }
    },
    [ensureCartId],
  )

  const clear = useCallback(async () => {
    try {
      const id = await ensureCartId()
      const response = await fetch(`/api/neon/cart/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to clear cart')
      }
      const payload = await response.json()
      setItems(payload.data.items)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to clear cart')
    }
  }, [ensureCartId])

  const refresh = useCallback(async () => {
    await loadCart()
  }, [loadCart])

  return useMemo(
    () => ({
      cartId,
      items,
      isLoading,
      error,
      addItem,
      removeItem,
      clear,
      refresh,
    }),
    [cartId, items, isLoading, error, addItem, removeItem, clear, refresh],
  )
}
