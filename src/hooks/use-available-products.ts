/**
 * Available Products Hook
 * Fetches the list of all customizable ring products for the product selector
 * Uses seed product data endpoint
 */

'use client'

import { useState, useEffect } from 'react'

interface ProductSummary {
  id: string
  name: string
  basePrice: number
  originalPrice?: number
  description: string
  category: string
  tags?: string[]
  genZAppeal?: string
  sustainabilityScore?: number
}

interface UseAvailableProductsReturn {
  products: ProductSummary[]
  isLoading: boolean
  error: string | null
  categories: string[]
  refetch: () => void
}

/**
 * Hook for fetching all available customizable products
 */
export function useAvailableProducts(): UseAvailableProductsReturn {
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Use a hypothetical endpoint that returns summaries of all products
      // This would be implemented to work with the seed data
      const response = await fetch('/api/products/customizable', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to load products')
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error?.message || 'API returned unsuccessful response')
      }
      
      // Extract product summaries from the full product data
      const productSummaries: ProductSummary[] = data.data.map((productData: any) => ({
        id: productData.product.id,
        name: productData.product.name,
        basePrice: productData.product.basePrice,
        originalPrice: productData.product.originalPrice,
        description: productData.product.description,
        category: productData.product.category,
        tags: productData.metadata?.tags,
        genZAppeal: productData.metadata?.genZAppeal,
        sustainabilityScore: productData.metadata?.sustainabilityScore
      }))
      
      setProducts(productSummaries)
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(productSummaries.map(p => p.category)))
      setCategories(uniqueCategories)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
      console.error('Available products loading error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return {
    products,
    isLoading,
    error,
    categories,
    refetch: fetchProducts
  }
}

/**
 * Fallback seed data in case API is not available
 * This represents the 8 ring designs from our seed data
 */
export function useFallbackProducts(): ProductSummary[] {
  return [
    {
      id: 'ring-001',
      name: 'Chaos Ring',
      basePrice: 425,
      originalPrice: 650,
      description: 'For the beautifully unorganized souls who find harmony in controlled disorder.',
      category: 'Statement Rings',
      tags: ['Organized Chaos', 'Lab-Grown Diamonds', 'Recycled Materials'],
      genZAppeal: 'Perfect for your beautifully chaotic energy ✨',
      sustainabilityScore: 9.2
    },
    {
      id: 'ring-002', 
      name: 'Digital Detox Ring',
      basePrice: 385,
      description: 'Minimalist design for mindful living and authentic moments.',
      category: 'Minimalist Rings',
      tags: ['Mindful Living', 'Screen-Free Vibes', 'Ethical Luxury'],
      genZAppeal: 'For when you need to touch grass instead of glass 🌱',
      sustainabilityScore: 9.5
    },
    {
      id: 'ring-003',
      name: 'Main Character Energy Ring', 
      basePrice: 595,
      originalPrice: 890,
      description: 'Bold statement piece that commands attention and radiates confidence.',
      category: 'Statement Rings',
      tags: ['Main Character', 'Statement Piece', 'Confidence Boost'],
      genZAppeal: 'Because you ARE the main character 👑',
      sustainabilityScore: 8.8
    },
    {
      id: 'ring-004',
      name: 'Therapy Ring',
      basePrice: 355,
      description: 'Comfort jewelry with healing crystal accents for emotional wellness.',
      category: 'Wellness Rings',
      tags: ['Mental Health Awareness', 'Healing Crystals', 'Self-Care'],
      genZAppeal: 'Your daily reminder that healing is not linear 💚',
      sustainabilityScore: 9.1
    },
    {
      id: 'ring-005',
      name: 'Climate Anxiety Ring',
      basePrice: 475,
      description: 'Eco-conscious design made from 100% recycled materials with carbon offset.',
      category: 'Eco-Conscious Rings',
      tags: ['Climate Positive', '100% Recycled', 'Carbon Offset'],
      genZAppeal: 'Saving the planet never looked so good 🌍',
      sustainabilityScore: 10.0
    },
    {
      id: 'ring-006',
      name: 'Gig Economy Ring',
      basePrice: 325,
      description: 'Versatile everyday piece that transitions from Zoom calls to coffee dates.',
      category: 'Everyday Rings',
      tags: ['Work From Home', 'Zoom Ready', 'Side Hustle Approved'],
      genZAppeal: 'From your bedroom office to brunch dates 💼',
      sustainabilityScore: 8.7
    },
    {
      id: 'ring-007',
      name: 'Plant Parent Ring',
      basePrice: 395,
      description: 'Nature-inspired design celebrating your green thumb and urban jungle.',
      category: 'Nature-Inspired Rings',
      tags: ['Plant Parent', 'Urban Jungle', 'Green Thumb'],
      genZAppeal: 'For when your plants are your children 🪴',
      sustainabilityScore: 9.3
    },
    {
      id: 'ring-008',
      name: 'Rent Money Ring',
      basePrice: 225,
      description: 'Affordable luxury that won\'t break the bank or compromise on ethics.',
      category: 'Accessible Luxury',
      tags: ['Budget Friendly', 'Student Approved', 'Guilt-Free Luxury'],
      genZAppeal: 'Luxury that fits your ramen noodle budget 🍜',
      sustainabilityScore: 8.9
    }
  ]
}