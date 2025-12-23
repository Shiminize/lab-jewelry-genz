'use server'

import { getProductDetail } from '@/services/neon/productService'
import { type CatalogProductDetail } from '@/services/neon/catalogRepository'

/**
 * Fetches product details for the quiz result.
 * @param slug The product slug to fetch
 * @returns The product details or null if not found
 */
export async function getQuizResultProduct(slug: string): Promise<CatalogProductDetail | null> {
    try {
        const product = await getProductDetail(slug)
        return product
    } catch (error) {
        console.error('Failed to fetch quiz result product:', error)
        return null
    }
}
