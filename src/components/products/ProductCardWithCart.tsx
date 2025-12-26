'use client'

import { useState } from 'react'
import { ProductCard, type ProductCardProps } from '@/components/ui'
import { useCartClient } from '@/features/cart/hooks/useCartClient'

import { useRouter } from 'next/navigation'

export interface ProductCardWithCartProps extends Omit<ProductCardProps, 'onAddToCart' | 'isAddingToCart'> {
    // We can extend this if we need specific cart props later, but strictly speaking 
    // we just need the product info to add it.
}

export function ProductCardWithCart(props: ProductCardWithCartProps) {
    const { addItem } = useCartClient()
    const [isAdding, setIsAdding] = useState(false)
    const router = useRouter()

    const handleAddToCart = async () => {
        setIsAdding(true)
        try {
            await addItem(props.slug, 1) // Default quantity of 1
            // Removed redirect to keep user on page
        } catch (err) {
            console.error('Failed to add to cart:', err)
            // Optional: Add toast notification here
        } finally {
            setIsAdding(false)
        }
    }

    return (
        <ProductCard
            {...props}
            onAddToCart={handleAddToCart}
            isAddingToCart={isAdding}
        />
    )
}
