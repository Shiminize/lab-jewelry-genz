/**
 * Phase 1 E2E Test: ProductDisplayDTO Type Validation
 * Tests the unified interface and transformation functions
 */

const { 
  transformToProductDisplayDTO, 
  isProductDisplayDTO 
} = require('./src/types/product-dto.ts')

// Mock ProductListDTO data (from API)
const mockProductListDTO = {
  _id: 'test-123',
  name: 'Test Ring',
  description: 'A test ring',
  category: 'rings',
  subcategory: 'engagement-rings',
  slug: 'test-ring',
  primaryImage: '/images/test-ring.jpg',
  pricing: {
    basePrice: 1200,
    currency: 'USD'
  },
  inventory: {
    available: true,
    quantity: 5
  },
  metadata: {
    featured: true,
    bestseller: false,
    newArrival: true,
    tags: ['lab-grown', 'customizable']
  },
  materialSpecs: {
    primaryMetal: {
      type: '14k-gold',
      purity: '14K',
      displayName: '14K Gold'
    }
  }
}

// Test transformation
try {
  console.log('🧪 Testing ProductDisplayDTO transformation...')
  
  const displayDTO = transformToProductDisplayDTO(mockProductListDTO)
  console.log('✅ Transformation successful')
  
  // Test type guard
  if (isProductDisplayDTO(displayDTO)) {
    console.log('✅ Type guard validation passed')
  } else {
    console.log('❌ Type guard validation failed')
    process.exit(1)
  }
  
  // Test required properties
  const requiredProps = ['_id', 'name', 'basePrice', 'primaryImage', 'images', 'materialSpecs']
  for (const prop of requiredProps) {
    if (!(prop in displayDTO)) {
      console.log(`❌ Missing required property: ${prop}`)
      process.exit(1)
    }
  }
  console.log('✅ All required properties present')
  
  // Test material-only compliance
  if (displayDTO.materialSpecs.primaryMetal.type === '14k-gold') {
    console.log('✅ Material-only compliance validated')
  } else {
    console.log('❌ Material-only compliance failed')
    process.exit(1)
  }
  
  console.log('🎉 Phase 1 E2E Test: PASSED')
  console.log('✅ ProductDisplayDTO interface validation successful')
  console.log('✅ Type transformation working correctly')
  console.log('✅ Material-only compliance enforced')
  
} catch (error) {
  console.error('❌ Phase 1 E2E Test: FAILED')
  console.error('Error:', error.message)
  process.exit(1)
}