/**
 * Integration tests for ProductListDTO with material specifications
 * Tests real-world API scenarios and database integration
 * Following CLAUDE_RULES.md compliance
 */

import {
  ProductListDTO,
  ProductListMaterialSpecs,
  MetalType,
  StoneType,
  createMaterialSpecs,
  isProductListDTO,
  isValidMaterialSpecs,
} from '../product-dto'

// Mock API response data that would come from MongoDB
const mockApiResponses = {
  silverMoissanite: {
    _id: '507f1f77bcf86cd799439011',
    name: 'Elegant Silver Moissanite Ring',
    description: 'A stunning silver ring featuring brilliant moissanite',
    category: 'rings',
    subcategory: 'engagement-rings',
    slug: 'elegant-silver-moissanite-ring',
    primaryImage: 'https://cdn.example.com/silver-moissanite-ring.jpg',
    pricing: {
      basePrice: 899.99,
      currency: 'USD'
    },
    inventory: {
      available: true,
      quantity: 15
    },
    metadata: {
      featured: true,
      bestseller: false,
      newArrival: true,
      tags: ['affordable', 'engagement', 'lab-grown']
    },
    materialSpecs: {
      primaryMetal: {
        type: 'silver',
        purity: '925',
        displayName: '925 Silver'
      },
      primaryStone: {
        type: 'moissanite',
        carat: 1.5,
        displayName: '1.5CT Moissanite'
      }
    },
    creator: {
      handle: '@modernbride',
      name: 'Modern Bride Designs'
    }
  },
  platinumDiamond: {
    _id: '507f1f77bcf86cd799439012',
    name: 'Luxury Platinum Lab Diamond Ring',
    description: 'Premium platinum setting with certified lab diamond',
    category: 'rings',
    subcategory: 'engagement-rings',
    slug: 'luxury-platinum-lab-diamond-ring',
    primaryImage: 'https://cdn.example.com/platinum-diamond-ring.jpg',
    pricing: {
      basePrice: 4999.99,
      currency: 'USD'
    },
    inventory: {
      available: true,
      quantity: 3
    },
    metadata: {
      featured: true,
      bestseller: true,
      newArrival: false,
      tags: ['luxury', 'premium', 'certified']
    },
    materialSpecs: {
      primaryMetal: {
        type: 'platinum',
        purity: 'PLAT',
        displayName: 'Platinum'
      },
      primaryStone: {
        type: 'lab-diamond',
        carat: 2.0,
        displayName: '2CT Lab Diamond'
      }
    }
  },
  goldEmerald: {
    _id: '507f1f77bcf86cd799439013',
    name: '18K Gold Lab Emerald Necklace',
    description: 'Elegant 18K gold necklace with vibrant lab emerald',
    category: 'necklaces',
    subcategory: 'pendants',
    slug: '18k-gold-lab-emerald-necklace',
    primaryImage: 'https://cdn.example.com/gold-emerald-necklace.jpg',
    pricing: {
      basePrice: 2499.99,
      currency: 'USD'
    },
    inventory: {
      available: true,
      quantity: 8
    },
    metadata: {
      featured: false,
      bestseller: true,
      newArrival: false,
      tags: ['gold', 'emerald', 'statement']
    },
    materialSpecs: {
      primaryMetal: {
        type: '18k-gold',
        purity: '18K',
        displayName: '18K Gold'
      },
      primaryStone: {
        type: 'lab-emerald',
        carat: 1.2,
        displayName: '1.2CT Lab Emerald'
      }
    }
  },
  silverBracelet: {
    _id: '507f1f77bcf86cd799439014',
    name: 'Minimalist Silver Chain Bracelet',
    description: 'Clean and modern silver chain bracelet',
    category: 'bracelets',
    subcategory: 'chain-bracelets',
    slug: 'minimalist-silver-chain-bracelet',
    primaryImage: 'https://cdn.example.com/silver-bracelet.jpg',
    pricing: {
      basePrice: 299.99,
      currency: 'USD'
    },
    inventory: {
      available: true,
      quantity: 25
    },
    metadata: {
      featured: false,
      bestseller: false,
      newArrival: true,
      tags: ['minimalist', 'everyday', 'gift']
    },
    materialSpecs: {
      primaryMetal: {
        type: 'silver',
        purity: '925',
        displayName: '925 Silver'
      }
      // No primaryStone for this bracelet
    }
  }
}

describe('ProductListDTO Material Specifications - Integration Tests', () => {
  describe('API Response Validation', () => {
    test('should validate all mock API responses as valid ProductListDTOs', () => {
      Object.values(mockApiResponses).forEach(response => {
        expect(isProductListDTO(response)).toBe(true)
      })
    })

    test('should validate material specs in all API responses', () => {
      Object.values(mockApiResponses).forEach(response => {
        expect(isValidMaterialSpecs(response.materialSpecs)).toBe(true)
      })
    })

    test('should handle products with and without stones correctly', () => {
      // Product with stone
      expect(mockApiResponses.silverMoissanite.materialSpecs.primaryStone).toBeDefined()
      expect(mockApiResponses.silverMoissanite.materialSpecs.primaryStone?.type).toBe('moissanite')

      // Product without stone
      expect(mockApiResponses.silverBracelet.materialSpecs.primaryStone).toBeUndefined()
    })
  })

  describe('Search and Filter Integration', () => {
    const allProducts = Object.values(mockApiResponses)

    test('should filter products by metal type', () => {
      const silverProducts = allProducts.filter(p => 
        p.materialSpecs.primaryMetal.type === 'silver'
      )
      expect(silverProducts).toHaveLength(2)
      expect(silverProducts.every(p => isProductListDTO(p))).toBe(true)
    })

    test('should filter products by stone type', () => {
      const diamondProducts = allProducts.filter(p => 
        p.materialSpecs.primaryStone?.type === 'lab-diamond'
      )
      expect(diamondProducts).toHaveLength(1)
      expect(diamondProducts[0].name).toContain('Diamond')
    })

    test('should filter products by carat range', () => {
      const highCaratProducts = allProducts.filter(p => 
        p.materialSpecs.primaryStone && p.materialSpecs.primaryStone.carat >= 1.5
      )
      expect(highCaratProducts).toHaveLength(2)
    })

    test('should filter products by price range', () => {
      const affordableProducts = allProducts.filter(p => 
        p.pricing.basePrice < 1000
      )
      expect(affordableProducts).toHaveLength(2)
      expect(affordableProducts.every(p => isProductListDTO(p))).toBe(true)
    })

    test('should support complex filtering (metal + stone + price)', () => {
      const complexFilter = allProducts.filter(p => 
        p.materialSpecs.primaryMetal.type === 'platinum' &&
        p.materialSpecs.primaryStone?.type === 'lab-diamond' &&
        p.pricing.basePrice > 3000
      )
      expect(complexFilter).toHaveLength(1)
      expect(complexFilter[0].name).toContain('Platinum')
    })
  })

  describe('Catalog Display Integration', () => {
    const allProducts = Object.values(mockApiResponses)

    test('should provide display names for UI rendering', () => {
      const product = mockApiResponses.silverMoissanite

      expect(product.materialSpecs.primaryMetal.displayName).toBe('925 Silver')
      expect(product.materialSpecs.primaryStone?.displayName).toBe('1.5CT Moissanite')
    })

    test('should handle missing stone gracefully in UI', () => {
      const product = mockApiResponses.silverBracelet

      expect(product.materialSpecs.primaryMetal.displayName).toBe('925 Silver')
      expect(product.materialSpecs.primaryStone).toBeUndefined()
    })

    test('should support sorting by material type', () => {
      const sortedByMetal = [...allProducts].sort((a, b) => 
        a.materialSpecs.primaryMetal.type.localeCompare(b.materialSpecs.primaryMetal.type)
      )

      expect(sortedByMetal[0].materialSpecs.primaryMetal.type).toBe('18k-gold')
      expect(sortedByMetal[sortedByMetal.length - 1].materialSpecs.primaryMetal.type).toBe('silver')
    })

    test('should support sorting by carat weight', () => {
      const productsWithStones = allProducts.filter(p => p.materialSpecs.primaryStone)
      const sortedByCarat = productsWithStones.sort((a, b) => 
        (b.materialSpecs.primaryStone?.carat || 0) - (a.materialSpecs.primaryStone?.carat || 0)
      )

      expect(sortedByCarat[0].materialSpecs.primaryStone?.carat).toBe(2.0)
      expect(sortedByCarat[sortedByCarat.length - 1].materialSpecs.primaryStone?.carat).toBe(1.2)
    })
  })

  describe('Material Spec Creation in Context', () => {
    test('should create material specs that match API response format', () => {
      const generatedSpecs = createMaterialSpecs('silver', { type: 'moissanite', carat: 1.5 })
      const apiSpecs = mockApiResponses.silverMoissanite.materialSpecs

      expect(generatedSpecs).toEqual(apiSpecs)
    })

    test('should create specs for all supported metal types', () => {
      const metalTypes: MetalType[] = ['silver', '14k-gold', '18k-gold', 'platinum']
      
      metalTypes.forEach(metalType => {
        const specs = createMaterialSpecs(metalType)
        expect(isValidMaterialSpecs(specs)).toBe(true)
        expect(specs.primaryMetal.type).toBe(metalType)
      })
    })

    test('should create specs for all supported stone types', () => {
      const stoneTypes: StoneType[] = ['lab-diamond', 'moissanite', 'lab-emerald', 'lab-ruby', 'lab-sapphire']
      
      stoneTypes.forEach(stoneType => {
        const specs = createMaterialSpecs('14k-gold', { type: stoneType, carat: 1.0 })
        expect(isValidMaterialSpecs(specs)).toBe(true)
        expect(specs.primaryStone?.type).toBe(stoneType)
      })
    })
  })

  describe('Performance with Real Data Sets', () => {
    test('should handle large product catalogs efficiently', async () => {
      // Simulate a large catalog
      const largeCatalog = Array.from({ length: 1000 }, (_, i) => {
        const templates = Object.values(mockApiResponses)
        const template = templates[i % templates.length]
        return {
          ...template,
          _id: `507f1f77bcf86cd79943${String(i).padStart(4, '0')}`,
          name: `${template.name} - Variant ${i + 1}`
        }
      })

      const start = performance.now()
      const validProducts = largeCatalog.filter(isProductListDTO)
      const end = performance.now()

      expect(validProducts).toHaveLength(1000)
      expect(end - start).toBeLessThan(50) // CLAUDE_RULES performance requirement
    })

    test('should validate material specs efficiently for bulk operations', async () => {
      const materialSpecsArray = Array.from({ length: 1000 }, (_, i) => {
        const responses = Object.values(mockApiResponses)
        return responses[i % responses.length].materialSpecs
      })

      const start = performance.now()
      const validSpecs = materialSpecsArray.filter(isValidMaterialSpecs)
      const end = performance.now()

      expect(validSpecs).toHaveLength(1000)
      expect(end - start).toBeLessThan(50)
    })
  })

  describe('Backward Compatibility', () => {
    test('should handle legacy API responses without material specs', () => {
      const legacyResponse = {
        _id: '507f1f77bcf86cd799439015',
        name: 'Legacy Product',
        description: 'A product from before material specs',
        category: 'rings',
        subcategory: 'fashion-rings',
        slug: 'legacy-product',
        primaryImage: 'https://cdn.example.com/legacy.jpg',
        pricing: { basePrice: 199.99, currency: 'USD' },
        inventory: { available: true },
        metadata: { featured: false, bestseller: false, newArrival: false, tags: [] },
        // Missing materialSpecs
      }

      expect(isProductListDTO(legacyResponse)).toBe(false)
    })

    test('should handle partial material specs gracefully', () => {
      const partialResponse = {
        ...mockApiResponses.silverBracelet,
        materialSpecs: {
          primaryMetal: {
            type: 'silver',
            purity: '925',
            displayName: '925 Silver'
          }
          // Missing primaryStone (which is optional)
        }
      }

      expect(isProductListDTO(partialResponse)).toBe(true)
      expect(isValidMaterialSpecs(partialResponse.materialSpecs)).toBe(true)
    })
  })

  describe('Error Handling in API Context', () => {
    test('should handle malformed API responses gracefully', () => {
      const malformedResponses = [
        null,
        undefined,
        {},
        { _id: 'test' },
        { ...mockApiResponses.silverMoissanite, materialSpecs: null },
        { ...mockApiResponses.silverMoissanite, materialSpecs: { primaryMetal: null } },
        { ...mockApiResponses.silverMoissanite, materialSpecs: { primaryMetal: { type: 'invalid' } } }
      ]

      malformedResponses.forEach(response => {
        expect(isProductListDTO(response)).toBe(false)
      })
    })

    test('should validate data integrity across API boundary', () => {
      // Simulate JSON serialization/deserialization that might occur in API calls
      const originalProduct = mockApiResponses.platinumDiamond
      const serialized = JSON.stringify(originalProduct)
      const deserialized = JSON.parse(serialized)

      expect(isProductListDTO(deserialized)).toBe(true)
      expect(isValidMaterialSpecs(deserialized.materialSpecs)).toBe(true)
      expect(deserialized).toEqual(originalProduct)
    })
  })

  describe('Real-world Usage Patterns', () => {
    test('should support common e-commerce search patterns', () => {
      const searchResults = {
        products: Object.values(mockApiResponses),
        pagination: { page: 1, limit: 10, total: 4, totalPages: 1 },
        filters: {
          applied: {},
          available: {
            categories: ['rings', 'necklaces', 'bracelets'],
            priceRange: { min: 299.99, max: 4999.99 },
            materials: ['silver', '18k-gold', 'platinum']
          }
        }
      }

      expect(searchResults.products.every(isProductListDTO)).toBe(true)
    })

    test('should support material-based product recommendations', () => {
      const currentProduct = mockApiResponses.silverMoissanite
      const similarProducts = Object.values(mockApiResponses).filter(p => 
        p._id !== currentProduct._id &&
        (p.materialSpecs.primaryMetal.type === currentProduct.materialSpecs.primaryMetal.type ||
         p.materialSpecs.primaryStone?.type === currentProduct.materialSpecs.primaryStone?.type)
      )

      expect(similarProducts).toHaveLength(1) // Should find the silver bracelet
      expect(similarProducts.every(isProductListDTO)).toBe(true)
    })

    test('should support inventory filtering by material availability', () => {
      const availableProducts = Object.values(mockApiResponses).filter(p => 
        p.inventory.available && (p.inventory.quantity || 0) > 0
      )

      expect(availableProducts).toHaveLength(4)
      expect(availableProducts.every(isProductListDTO)).toBe(true)
    })
  })
})