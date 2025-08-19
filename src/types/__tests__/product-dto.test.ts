/**
 * Comprehensive E2E tests for ProductListDTO with material specifications
 * Following CLAUDE_RULES.md compliance requirements
 * 
 * Test coverage includes:
 * - Type validation for MetalType and StoneType
 * - Material spec creation functions
 * - ProductListDTO integration
 * - Performance validation (<50ms)
 * - Edge cases and error handling
 */

import {
  MetalType,
  StoneType,
  ProductListMaterialSpecs,
  ProductListDTO,
  ProductCategory,
  ProductSubcategory,
  isValidMetalType,
  isValidStoneType,
  isValidMaterialSpecs,
  isProductListDTO,
  createMetalSpec,
  createStoneSpec,
  createMaterialSpecs,
} from '../product-dto'

// Test utility functions
const measurePerformance = async <T>(fn: () => T): Promise<{ result: T; timeMs: number }> => {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  return { result, timeMs: end - start }
}

const createValidProductListDTO = (materialSpecs: ProductListMaterialSpecs): ProductListDTO => ({
  _id: '507f1f77bcf86cd799439011',
  name: 'Test Product',
  description: 'A beautiful test product',
  category: 'rings' as ProductCategory,
  subcategory: 'engagement-rings' as ProductSubcategory,
  slug: 'test-product',
  primaryImage: 'https://example.com/image.jpg',
  pricing: {
    basePrice: 999.99,
    currency: 'USD'
  },
  inventory: {
    available: true,
    quantity: 10
  },
  metadata: {
    featured: true,
    bestseller: false,
    newArrival: true,
    tags: ['premium', 'bestseller']
  },
  materialSpecs,
  creator: {
    handle: '@testcreator',
    name: 'Test Creator'
  }
})

describe('ProductListDTO Material Specifications - E2E Test Suite', () => {

  describe('Type Validation Tests', () => {
    describe('MetalType validation', () => {
      test('should validate all valid metal types', () => {
        const validMetalTypes: MetalType[] = ['silver', '14k-gold', '18k-gold', 'platinum']
        
        validMetalTypes.forEach(metalType => {
          expect(isValidMetalType(metalType)).toBe(true)
        })
      })

      test('should reject invalid metal types', () => {
        const invalidMetalTypes = [
          'gold',
          'copper',
          'titanium',
          'bronze',
          '24k-gold',
          '10k-gold',
          '',
          null,
          undefined,
          123,
          {},
          []
        ]

        invalidMetalTypes.forEach(invalidType => {
          expect(isValidMetalType(invalidType as any)).toBe(false)
        })
      })

      test('should validate metal types under performance threshold', async () => {
        const { timeMs } = await measurePerformance(() => {
          for (let i = 0; i < 1000; i++) {
            isValidMetalType('silver')
            isValidMetalType('invalid-type')
          }
        })

        expect(timeMs).toBeLessThan(50)
      })
    })

    describe('StoneType validation', () => {
      test('should validate all valid stone types', () => {
        const validStoneTypes: StoneType[] = [
          'lab-diamond',
          'moissanite',
          'lab-emerald',
          'lab-ruby',
          'lab-sapphire'
        ]

        validStoneTypes.forEach(stoneType => {
          expect(isValidStoneType(stoneType)).toBe(true)
        })
      })

      test('should reject invalid stone types', () => {
        const invalidStoneTypes = [
          'diamond',
          'emerald',
          'ruby',
          'sapphire',
          'natural-diamond',
          'cubic-zirconia',
          'amethyst',
          '',
          null,
          undefined,
          123,
          {},
          []
        ]

        invalidStoneTypes.forEach(invalidType => {
          expect(isValidStoneType(invalidType as any)).toBe(false)
        })
      })

      test('should validate stone types under performance threshold', async () => {
        const { timeMs } = await measurePerformance(() => {
          for (let i = 0; i < 1000; i++) {
            isValidStoneType('lab-diamond')
            isValidStoneType('invalid-type')
          }
        })

        expect(timeMs).toBeLessThan(50)
      })
    })
  })

  describe('Material Spec Creation Function Tests', () => {
    describe('createMetalSpec function', () => {
      test('should create correct silver spec', () => {
        const silverSpec = createMetalSpec('silver')
        
        expect(silverSpec).toEqual({
          type: 'silver',
          purity: '925',
          displayName: '925 Silver'
        })
      })

      test('should create correct 14K gold spec', () => {
        const goldSpec = createMetalSpec('14k-gold')
        
        expect(goldSpec).toEqual({
          type: '14k-gold',
          purity: '14K',
          displayName: '14K Gold'
        })
      })

      test('should create correct 18K gold spec', () => {
        const goldSpec = createMetalSpec('18k-gold')
        
        expect(goldSpec).toEqual({
          type: '18k-gold',
          purity: '18K',
          displayName: '18K Gold'
        })
      })

      test('should create correct platinum spec', () => {
        const platinumSpec = createMetalSpec('platinum')
        
        expect(platinumSpec).toEqual({
          type: 'platinum',
          purity: 'PLAT',
          displayName: 'Platinum'
        })
      })

      test('should create metal specs under performance threshold', async () => {
        const { timeMs } = await measurePerformance(() => {
          for (let i = 0; i < 1000; i++) {
            createMetalSpec('silver')
            createMetalSpec('14k-gold')
            createMetalSpec('18k-gold')
            createMetalSpec('platinum')
          }
        })

        expect(timeMs).toBeLessThan(50)
      })
    })

    describe('createStoneSpec function', () => {
      test('should create correct lab diamond spec', () => {
        const stoneSpec = createStoneSpec('lab-diamond', 1.5)
        
        expect(stoneSpec).toEqual({
          type: 'lab-diamond',
          carat: 1.5,
          displayName: '1.5CT Lab Diamond'
        })
      })

      test('should create correct moissanite spec', () => {
        const stoneSpec = createStoneSpec('moissanite', 2.0)
        
        expect(stoneSpec).toEqual({
          type: 'moissanite',
          carat: 2.0,
          displayName: '2CT Moissanite'
        })
      })

      test('should create correct lab emerald spec', () => {
        const stoneSpec = createStoneSpec('lab-emerald', 0.75)
        
        expect(stoneSpec).toEqual({
          type: 'lab-emerald',
          carat: 0.75,
          displayName: '0.75CT Lab Emerald'
        })
      })

      test('should create correct lab ruby spec', () => {
        const stoneSpec = createStoneSpec('lab-ruby', 1.25)
        
        expect(stoneSpec).toEqual({
          type: 'lab-ruby',
          carat: 1.25,
          displayName: '1.25CT Lab Ruby'
        })
      })

      test('should create correct lab sapphire spec', () => {
        const stoneSpec = createStoneSpec('lab-sapphire', 3.0)
        
        expect(stoneSpec).toEqual({
          type: 'lab-sapphire',
          carat: 3.0,
          displayName: '3CT Lab Sapphire'
        })
      })

      test('should handle decimal carat values correctly', () => {
        const specs = [
          { carat: 0.25, expected: '0.25CT Lab Diamond' },
          { carat: 0.5, expected: '0.5CT Lab Diamond' },
          { carat: 1.333, expected: '1.333CT Lab Diamond' },
          { carat: 2.75, expected: '2.75CT Lab Diamond' }
        ]

        specs.forEach(({ carat, expected }) => {
          const stoneSpec = createStoneSpec('lab-diamond', carat)
          expect(stoneSpec.displayName).toBe(expected)
          expect(stoneSpec.carat).toBe(carat)
        })
      })

      test('should create stone specs under performance threshold', async () => {
        const { timeMs } = await measurePerformance(() => {
          for (let i = 0; i < 1000; i++) {
            createStoneSpec('lab-diamond', 1.0)
            createStoneSpec('moissanite', 2.0)
            createStoneSpec('lab-emerald', 0.5)
          }
        })

        expect(timeMs).toBeLessThan(50)
      })
    })

    describe('createMaterialSpecs function', () => {
      test('should create material specs with only metal (no stone)', () => {
        const materialSpecs = createMaterialSpecs('silver')
        
        expect(materialSpecs).toEqual({
          primaryMetal: {
            type: 'silver',
            purity: '925',
            displayName: '925 Silver'
          },
          primaryStone: undefined
        })
      })

      test('should create material specs with metal and stone', () => {
        const materialSpecs = createMaterialSpecs('18k-gold', { type: 'lab-diamond', carat: 2.0 })
        
        expect(materialSpecs).toEqual({
          primaryMetal: {
            type: '18k-gold',
            purity: '18K',
            displayName: '18K Gold'
          },
          primaryStone: {
            type: 'lab-diamond',
            carat: 2.0,
            displayName: '2CT Lab Diamond'
          }
        })
      })

      test('should create various metal-stone combinations', () => {
        const combinations = [
          { metal: 'silver' as MetalType, stone: { type: 'moissanite' as StoneType, carat: 1.5 } },
          { metal: '14k-gold' as MetalType, stone: { type: 'lab-emerald' as StoneType, carat: 0.75 } },
          { metal: 'platinum' as MetalType, stone: { type: 'lab-ruby' as StoneType, carat: 1.25 } }
        ]

        combinations.forEach(({ metal, stone }) => {
          const materialSpecs = createMaterialSpecs(metal, stone)
          
          expect(materialSpecs.primaryMetal.type).toBe(metal)
          expect(materialSpecs.primaryStone?.type).toBe(stone.type)
          expect(materialSpecs.primaryStone?.carat).toBe(stone.carat)
        })
      })

      test('should create material specs under performance threshold', async () => {
        const { timeMs } = await measurePerformance(() => {
          for (let i = 0; i < 1000; i++) {
            createMaterialSpecs('silver')
            createMaterialSpecs('14k-gold', { type: 'lab-diamond', carat: 1.0 })
          }
        })

        expect(timeMs).toBeLessThan(50)
      })
    })
  })

  describe('Material Specs Validation Tests', () => {
    describe('isValidMaterialSpecs function', () => {
      test('should validate correct material specs with only metal', () => {
        const validSpecs: ProductListMaterialSpecs = {
          primaryMetal: {
            type: 'silver',
            purity: '925',
            displayName: '925 Silver'
          }
        }

        expect(isValidMaterialSpecs(validSpecs)).toBe(true)
      })

      test('should validate correct material specs with metal and stone', () => {
        const validSpecs: ProductListMaterialSpecs = {
          primaryMetal: {
            type: '18k-gold',
            purity: '18K',
            displayName: '18K Gold'
          },
          primaryStone: {
            type: 'lab-diamond',
            carat: 1.5,
            displayName: '1.5CT Lab Diamond'
          }
        }

        expect(isValidMaterialSpecs(validSpecs)).toBe(true)
      })

      test('should reject material specs with invalid metal type', () => {
        const invalidSpecs = {
          primaryMetal: {
            type: 'invalid-metal',
            purity: '925',
            displayName: '925 Silver'
          }
        }

        expect(isValidMaterialSpecs(invalidSpecs)).toBe(false)
      })

      test('should reject material specs with invalid stone type', () => {
        const invalidSpecs = {
          primaryMetal: {
            type: 'silver',
            purity: '925',
            displayName: '925 Silver'
          },
          primaryStone: {
            type: 'invalid-stone',
            carat: 1.0,
            displayName: '1CT Invalid Stone'
          }
        }

        expect(isValidMaterialSpecs(invalidSpecs)).toBe(false)
      })

      test('should reject material specs with missing required fields', () => {
        const invalidSpecs = [
          { primaryMetal: {} },
          { primaryMetal: { type: 'silver' } },
          { primaryMetal: { type: 'silver', purity: '925' } },
          null,
          undefined,
          {},
          'invalid'
        ]

        invalidSpecs.forEach(specs => {
          expect(isValidMaterialSpecs(specs)).toBe(false)
        })
      })

      test('should validate material specs under performance threshold', async () => {
        const validSpecs = createMaterialSpecs('silver', { type: 'lab-diamond', carat: 1.0 })
        
        const { timeMs } = await measurePerformance(() => {
          for (let i = 0; i < 1000; i++) {
            isValidMaterialSpecs(validSpecs)
            isValidMaterialSpecs({ invalid: 'data' })
          }
        })

        expect(timeMs).toBeLessThan(50)
      })
    })
  })

  describe('ProductListDTO Integration Tests', () => {

    describe('isProductListDTO validation', () => {
      test('should validate complete ProductListDTO with material specs', () => {
        const materialSpecs = createMaterialSpecs('platinum', { type: 'lab-diamond', carat: 2.0 })
        const productDTO = createValidProductListDTO(materialSpecs)

        expect(isProductListDTO(productDTO)).toBe(true)
      })

      test('should validate ProductListDTO with only metal specs', () => {
        const materialSpecs = createMaterialSpecs('silver')
        const productDTO = createValidProductListDTO(materialSpecs)

        expect(isProductListDTO(productDTO)).toBe(true)
      })

      test('should reject ProductListDTO with invalid material specs', () => {
        const invalidProductDTO = {
          ...createValidProductListDTO(createMaterialSpecs('silver')),
          materialSpecs: {
            primaryMetal: {
              type: 'invalid-metal',
              purity: '925',
              displayName: '925 Silver'
            }
          }
        }

        expect(isProductListDTO(invalidProductDTO)).toBe(false)
      })

      test('should reject ProductListDTO with missing required fields', () => {
        const materialSpecs = createMaterialSpecs('silver')
        const baseDTO = createValidProductListDTO(materialSpecs)

        const invalidDTOs = [
          { ...baseDTO, _id: undefined },
          { ...baseDTO, name: undefined },
          { ...baseDTO, primaryImage: undefined },
          { ...baseDTO, materialSpecs: undefined },
          null,
          undefined,
          'invalid'
        ]

        invalidDTOs.forEach(dto => {
          expect(isProductListDTO(dto)).toBe(false)
        })
      })

      test('should validate ProductListDTO under performance threshold', async () => {
        const materialSpecs = createMaterialSpecs('18k-gold', { type: 'moissanite', carat: 1.5 })
        const validDTO = createValidProductListDTO(materialSpecs)
        
        const { timeMs } = await measurePerformance(() => {
          for (let i = 0; i < 1000; i++) {
            isProductListDTO(validDTO)
            isProductListDTO({ invalid: 'data' })
          }
        })

        expect(timeMs).toBeLessThan(50)
      })
    })

    describe('Backward compatibility tests', () => {
      test('should handle DTOs without optional creator field', () => {
        const materialSpecs = createMaterialSpecs('14k-gold')
        const dtoWithoutCreator = {
          ...createValidProductListDTO(materialSpecs),
          creator: undefined
        }

        expect(isProductListDTO(dtoWithoutCreator)).toBe(true)
      })

      test('should handle DTOs without optional primaryStone', () => {
        const materialSpecs = createMaterialSpecs('platinum')
        const productDTO = createValidProductListDTO(materialSpecs)

        expect(isProductListDTO(productDTO)).toBe(true)
        expect(productDTO.materialSpecs.primaryStone).toBeUndefined()
      })

      test('should handle DTOs with minimal inventory data', () => {
        const materialSpecs = createMaterialSpecs('silver')
        const dtoWithMinimalInventory = {
          ...createValidProductListDTO(materialSpecs),
          inventory: {
            available: false
          }
        }

        expect(isProductListDTO(dtoWithMinimalInventory)).toBe(true)
      })
    })
  })

  describe('Edge Cases and Error Handling', () => {
    describe('Carat value edge cases', () => {
      test('should handle very small carat values', () => {
        const stoneSpec = createStoneSpec('lab-diamond', 0.01)
        
        expect(stoneSpec.carat).toBe(0.01)
        expect(stoneSpec.displayName).toBe('0.01CT Lab Diamond')
      })

      test('should handle large carat values', () => {
        const stoneSpec = createStoneSpec('lab-diamond', 10.0)
        
        expect(stoneSpec.carat).toBe(10.0)
        expect(stoneSpec.displayName).toBe('10CT Lab Diamond')
      })

      test('should handle zero carat (edge case)', () => {
        const stoneSpec = createStoneSpec('lab-diamond', 0)
        
        expect(stoneSpec.carat).toBe(0)
        expect(stoneSpec.displayName).toBe('0CT Lab Diamond')
      })

      test('should handle negative carat values gracefully', () => {
        // Note: In real implementation, you might want to add validation
        const stoneSpec = createStoneSpec('lab-diamond', -1)
        
        expect(stoneSpec.carat).toBe(-1)
        expect(stoneSpec.displayName).toBe('-1CT Lab Diamond')
      })

      test('should handle fractional carat precision', () => {
        const stoneSpec = createStoneSpec('lab-diamond', 1.23456789)
        
        expect(stoneSpec.carat).toBe(1.23456789)
        expect(stoneSpec.displayName).toBe('1.23456789CT Lab Diamond')
      })
    })

    describe('Display name edge cases', () => {
      test('should generate consistent display names', () => {
        const metalSpecs = ['silver', '14k-gold', '18k-gold', 'platinum'] as MetalType[]
        
        metalSpecs.forEach(metalType => {
          const spec1 = createMetalSpec(metalType)
          const spec2 = createMetalSpec(metalType)
          
          expect(spec1.displayName).toBe(spec2.displayName)
        })
      })

      test('should generate unique display names for different stones', () => {
        const stoneTypes: StoneType[] = ['lab-diamond', 'moissanite', 'lab-emerald', 'lab-ruby', 'lab-sapphire']
        const displayNames = stoneTypes.map(type => createStoneSpec(type, 1.0).displayName)
        
        const uniqueNames = new Set(displayNames)
        expect(uniqueNames.size).toBe(stoneTypes.length)
      })
    })

    describe('Type safety edge cases', () => {
      test('should maintain type safety with as const assertions', () => {
        const metalTypes = ['silver', '14k-gold', '18k-gold', 'platinum'] as const
        
        metalTypes.forEach(metalType => {
          expect(isValidMetalType(metalType)).toBe(true)
          const spec = createMetalSpec(metalType)
          expect(spec.type).toBe(metalType)
        })
      })

      test('should handle undefined and null gracefully in type guards', () => {
        expect(isValidMetalType(undefined)).toBe(false)
        expect(isValidMetalType(null)).toBe(false)
        expect(isValidStoneType(undefined)).toBe(false)
        expect(isValidStoneType(null)).toBe(false)
        expect(isValidMaterialSpecs(undefined)).toBe(false)
        expect(isValidMaterialSpecs(null)).toBe(false)
        expect(isProductListDTO(undefined)).toBe(false)
        expect(isProductListDTO(null)).toBe(false)
      })

      test('should handle object with prototype pollution safely', () => {
        const maliciousObject = Object.create(null)
        maliciousObject.constructor = { name: 'malicious' }
        maliciousObject.type = 'silver'
        
        expect(isValidMetalType(maliciousObject)).toBe(false)
        expect(isValidMaterialSpecs(maliciousObject)).toBe(false)
      })
    })
  })

  describe('API Response Integration Tests', () => {
    describe('JSON serialization/deserialization', () => {
      test('should serialize and deserialize ProductListDTO correctly', () => {
        const originalDTO = createValidProductListDTO(
          createMaterialSpecs('18k-gold', { type: 'lab-emerald', carat: 1.5 })
        )

        const jsonString = JSON.stringify(originalDTO)
        const deserializedDTO = JSON.parse(jsonString)

        expect(isProductListDTO(deserializedDTO)).toBe(true)
        expect(deserializedDTO).toEqual(originalDTO)
      })

      test('should handle material specs in API response format', () => {
        const apiResponseMock = {
          _id: '507f1f77bcf86cd799439011',
          name: 'Premium Engagement Ring',
          description: 'A stunning engagement ring',
          category: 'rings',
          subcategory: 'engagement-rings',
          slug: 'premium-engagement-ring',
          primaryImage: 'https://cdn.example.com/ring.jpg',
          pricing: { basePrice: 2499.99, currency: 'USD' },
          inventory: { available: true, quantity: 5 },
          metadata: {
            featured: true,
            bestseller: true,
            newArrival: false,
            tags: ['premium', 'engagement', 'bestseller']
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
        }

        expect(isProductListDTO(apiResponseMock)).toBe(true)
        expect(isValidMaterialSpecs(apiResponseMock.materialSpecs)).toBe(true)
      })
    })

    describe('Bulk operations performance', () => {
      test('should validate large arrays of ProductListDTOs efficiently', async () => {
        const materialSpecsVariations = [
          createMaterialSpecs('silver'),
          createMaterialSpecs('14k-gold', { type: 'moissanite', carat: 1.0 }),
          createMaterialSpecs('18k-gold', { type: 'lab-diamond', carat: 1.5 }),
          createMaterialSpecs('platinum', { type: 'lab-emerald', carat: 0.75 })
        ]

        const products = Array.from({ length: 100 }, (_, i) => 
          createValidProductListDTO(materialSpecsVariations[i % materialSpecsVariations.length])
        )

        const { timeMs, result } = await measurePerformance(() => {
          return products.every(product => isProductListDTO(product))
        })

        expect(result).toBe(true)
        expect(timeMs).toBeLessThan(50)
      })
    })
  })

  describe('Real-world Usage Scenarios', () => {
    test('should support common jewelry catalog scenarios', () => {
      const scenarios = [
        {
          name: 'Silver Moissanite Engagement Ring',
          specs: createMaterialSpecs('silver', { type: 'moissanite', carat: 1.5 })
        },
        {
          name: '14K Gold Lab Diamond Necklace',
          specs: createMaterialSpecs('14k-gold', { type: 'lab-diamond', carat: 0.5 })
        },
        {
          name: '18K Gold Lab Ruby Earrings',
          specs: createMaterialSpecs('18k-gold', { type: 'lab-ruby', carat: 0.75 })
        },
        {
          name: 'Platinum Lab Emerald Ring',
          specs: createMaterialSpecs('platinum', { type: 'lab-emerald', carat: 2.0 })
        },
        {
          name: 'Silver Chain Bracelet (no stones)',
          specs: createMaterialSpecs('silver')
        }
      ]

      scenarios.forEach(({ name, specs }) => {
        const product = createValidProductListDTO(specs)
        product.name = name

        expect(isProductListDTO(product)).toBe(true)
        expect(isValidMaterialSpecs(product.materialSpecs)).toBe(true)
      })
    })

    test('should support material filtering scenarios', () => {
      const products = [
        createValidProductListDTO(createMaterialSpecs('silver', { type: 'moissanite', carat: 1.0 })),
        createValidProductListDTO(createMaterialSpecs('14k-gold', { type: 'lab-diamond', carat: 1.5 })),
        createValidProductListDTO(createMaterialSpecs('platinum')),
        createValidProductListDTO(createMaterialSpecs('18k-gold', { type: 'lab-emerald', carat: 0.5 }))
      ]

      // Filter by metal type
      const silverProducts = products.filter(p => p.materialSpecs.primaryMetal.type === 'silver')
      expect(silverProducts).toHaveLength(1)

      // Filter by stone type
      const diamondProducts = products.filter(p => p.materialSpecs.primaryStone?.type === 'lab-diamond')
      expect(diamondProducts).toHaveLength(1)

      // Filter by carat range
      const highCaratProducts = products.filter(p => 
        p.materialSpecs.primaryStone && p.materialSpecs.primaryStone.carat >= 1.0
      )
      expect(highCaratProducts).toHaveLength(2)
    })
  })
})