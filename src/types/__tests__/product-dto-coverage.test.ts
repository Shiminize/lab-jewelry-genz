/**
 * Additional tests to achieve 100% coverage for ProductDTO type guards
 * Specifically targeting the uncovered isProductDTO function
 */

import { isProductDTO, ProductDTO } from '../product-dto'

describe('ProductDTO Coverage Tests', () => {
  test('should validate complete ProductDTO structure', () => {
    const validProductDTO: ProductDTO = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Test Product',
      description: 'A test product description',
      category: 'rings',
      subcategory: 'engagement-rings',
      assets: {
        primary: 'https://example.com/primary.jpg',
        gallery: ['https://example.com/gallery1.jpg'],
        thumbnail: 'https://example.com/thumb.jpg'
      },
      pricing: {
        basePrice: 999.99,
        currency: 'USD'
      },
      inventory: {
        sku: 'TEST-001',
        quantity: 10,
        reserved: 0,
        available: 10,
        lowStockThreshold: 5,
        isCustomMade: false
      },
      customization: {
        materials: [],
        sizes: [],
        engraving: {
          available: false
        }
      },
      seo: {
        slug: 'test-product',
        keywords: ['test', 'product']
      },
      certifications: {},
      metadata: {
        featured: false,
        bestseller: false,
        newArrival: false,
        limitedEdition: false,
        status: 'active',
        collections: [],
        tags: []
      }
    }

    expect(isProductDTO(validProductDTO)).toBe(true)
  })

  test('should reject ProductDTO with missing assets', () => {
    const invalidProductDTO = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Test Product',
      // Missing assets property
    }

    expect(isProductDTO(invalidProductDTO)).toBe(false)
  })

  test('should reject ProductDTO with invalid assets structure', () => {
    const invalidProductDTO = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Test Product',
      assets: {
        // Missing primary property
        gallery: []
      }
    }

    expect(isProductDTO(invalidProductDTO)).toBe(false)
  })

  test('should reject ProductDTO with non-string primary asset', () => {
    const invalidProductDTO = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Test Product',
      assets: {
        primary: 123, // Should be string
        gallery: []
      }
    }

    expect(isProductDTO(invalidProductDTO)).toBe(false)
  })
})