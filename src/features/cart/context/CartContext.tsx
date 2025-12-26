'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react'
import type { CartItem, CartSummary } from '@/services/neon/cartService'

const STORAGE_KEY = 'neon_cart_id'

interface CartContextValue {
    cartId?: string
    items: CartItem[]
    isLoading: boolean
    error?: string
    addItem: (slug: string, quantity?: number) => Promise<boolean>
    updateItem: (slug: string, quantity: number) => Promise<void>
    removeItem: (slug: string) => Promise<void>
    clear: () => Promise<void>
    refresh: () => Promise<void>
}

// ... (omitted, need to target correctly)



const CartContext = createContext<CartContextValue | undefined>(undefined)

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

// Helper to manage cookies
function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    return null
}

function setCookie(name: string, value: string, days = 30) {
    if (typeof document === 'undefined') return
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartId, setCartId] = useState<string | undefined>(undefined)
    const [items, setItems] = useState<CartItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | undefined>(undefined)

    const ensureCartId = useCallback(async () => {
        if (cartId) return cartId

        // 1. Try to get from cookie
        const stored = getCookie(STORAGE_KEY)
        if (stored) {
            setCartId(stored)
            return stored
        }

        // 2. Create new if missing
        const nextId = await createCartId()
        setCookie(STORAGE_KEY, nextId)
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
        async (slug: string, quantity = 1): Promise<boolean> => {
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
                return true
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Failed to add item to cart')
                return false
            }
        },
        [ensureCartId],
    )

    const updateItem = useCallback(
        async (slug: string, quantity: number) => {
            try {
                const id = await ensureCartId()
                const response = await fetch(`/api/neon/cart/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slug, quantity }),
                })
                if (!response.ok) {
                    throw new Error('Failed to update item in cart')
                }
                const payload = await response.json()
                setItems(payload.data.items)
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Failed to update item in cart')
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

    const value = useMemo(
        () => ({
            cartId,
            items,
            isLoading,
            error,
            addItem,
            updateItem,
            removeItem,
            clear,
            refresh,
        }),
        [cartId, items, isLoading, error, addItem, updateItem, removeItem, clear, refresh],
    )

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
