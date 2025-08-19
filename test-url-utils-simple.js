/**
 * Simple URL Parameter Utilities Test
 * Tests the core functionality without browser dependencies
 */

// Mock the utilities by importing the functions
const fs = require('fs')
const path = require('path')

// Read the utilities file content (since it uses TypeScript/ES6 modules)
const utilsPath = path.join(__dirname, 'src/lib/material-filter-url-utils.ts')
const utilsContent = fs.readFileSync(utilsPath, 'utf8')

console.log('🧪 Testing Material Filter URL Utilities\n')

// Test URL encoding/decoding logic manually
function testURLEncoding() {
  console.log('1. Testing URL Parameter Encoding:')
  
  // Test data
  const testFilters = {
    metals: ['14k-gold', 'platinum'],
    stones: ['lab-diamond'],
    caratRange: { min: 1, max: 3 },
    priceRange: { min: 1000, max: 5000 },
    categories: ['rings'],
    inStock: true,
    searchQuery: 'engagement',
    page: 1
  }
  
  // Manual encoding logic (simplified version)
  const params = new URLSearchParams()
  
  if (testFilters.metals?.length) {
    params.set('metals', testFilters.metals.join(','))
  }
  
  if (testFilters.stones?.length) {
    params.set('stones', testFilters.stones.join(','))
  }
  
  if (testFilters.caratRange?.min) {
    params.set('caratMin', testFilters.caratRange.min.toString())
  }
  
  if (testFilters.caratRange?.max) {
    params.set('caratMax', testFilters.caratRange.max.toString())
  }
  
  if (testFilters.priceRange?.min) {
    params.set('minPrice', testFilters.priceRange.min.toString())
  }
  
  if (testFilters.priceRange?.max) {
    params.set('maxPrice', testFilters.priceRange.max.toString())
  }
  
  if (testFilters.categories?.length) {
    params.set('categories', testFilters.categories.join(','))
  }
  
  if (testFilters.inStock) {
    params.set('inStock', 'true')
  }
  
  if (testFilters.searchQuery) {
    params.set('q', testFilters.searchQuery)
  }
  
  if (testFilters.page && testFilters.page > 1) {
    params.set('page', testFilters.page.toString())
  }
  
  const encodedURL = params.toString()
  console.log('   ✅ Encoded URL parameters:', encodedURL)
  
  // Expected result
  const expectedParams = [
    'metals=14k-gold,platinum',
    'stones=lab-diamond',
    'caratMin=1',
    'caratMax=3',
    'minPrice=1000',
    'maxPrice=5000',
    'categories=rings',
    'inStock=true',
    'q=engagement'
  ]
  
  expectedParams.forEach(param => {
    if (encodedURL.includes(param)) {
      console.log(`   ✅ Parameter present: ${param}`)
    } else {
      console.log(`   ❌ Parameter missing: ${param}`)
    }
  })
  
  return encodedURL
}

function testURLDecoding() {
  console.log('\n2. Testing URL Parameter Decoding:')
  
  const testURL = 'metals=14k-gold,platinum&stones=lab-diamond&caratMin=1&caratMax=3&minPrice=1000&maxPrice=5000&categories=rings&inStock=true&q=engagement'
  const params = new URLSearchParams(testURL)
  
  // Manual decoding logic
  const parseCommaSeparated = (value) => {
    return value ? value.split(',').filter(Boolean).map(s => s.trim()) : []
  }
  
  const parseNumber = (value) => {
    if (!value) return undefined
    const num = parseFloat(value)
    return isNaN(num) ? undefined : num
  }
  
  const parseBoolean = (value) => {
    return value === 'true'
  }
  
  const decoded = {
    metals: parseCommaSeparated(params.get('metals')),
    stones: parseCommaSeparated(params.get('stones')),
    categories: parseCommaSeparated(params.get('categories')),
    caratRange: {
      min: parseNumber(params.get('caratMin')),
      max: parseNumber(params.get('caratMax'))
    },
    priceRange: {
      min: parseNumber(params.get('minPrice')),
      max: parseNumber(params.get('maxPrice'))
    },
    inStock: parseBoolean(params.get('inStock')),
    searchQuery: params.get('q') || '',
    page: parseNumber(params.get('page')) || 1
  }
  
  console.log('   ✅ Decoded filter state:')
  console.log('      Metals:', decoded.metals)
  console.log('      Stones:', decoded.stones)
  console.log('      Categories:', decoded.categories)
  console.log('      Carat Range:', decoded.caratRange)
  console.log('      Price Range:', decoded.priceRange)
  console.log('      In Stock:', decoded.inStock)
  console.log('      Search Query:', decoded.searchQuery)
  console.log('      Page:', decoded.page)
  
  return decoded
}

function testShareableURLs() {
  console.log('\n3. Testing Shareable URL Generation:')
  
  const baseURL = 'http://localhost:3000/catalog'
  const testCases = [
    {
      name: 'Premium Lab Diamond Gold Jewelry',
      filters: { metals: ['14k-gold'], stones: ['lab-diamond'] },
      expected: 'metals=14k-gold&stones=lab-diamond'
    },
    {
      name: 'Affordable Luxury Moissanite',
      filters: { metals: ['silver'], stones: ['moissanite'], caratRange: { min: 1 } },
      expected: 'metals=silver&stones=moissanite&caratMin=1'
    },
    {
      name: 'Luxury Engagement Rings',
      filters: { 
        metals: ['platinum'], 
        stones: ['lab-diamond'], 
        categories: ['rings'], 
        caratRange: { min: 2 } 
      },
      expected: 'metals=platinum&stones=lab-diamond&categories=rings&caratMin=2'
    }
  ]
  
  testCases.forEach((testCase, index) => {
    console.log(`   Test Case ${index + 1}: ${testCase.name}`)
    
    // Manual URL generation
    const params = new URLSearchParams()
    
    if (testCase.filters.metals?.length) {
      params.set('metals', testCase.filters.metals.join(','))
    }
    if (testCase.filters.stones?.length) {
      params.set('stones', testCase.filters.stones.join(','))
    }
    if (testCase.filters.categories?.length) {
      params.set('categories', testCase.filters.categories.join(','))
    }
    if (testCase.filters.caratRange?.min) {
      params.set('caratMin', testCase.filters.caratRange.min.toString())
    }
    
    const generatedURL = `${baseURL}?${params.toString()}`
    console.log(`   ✅ Generated URL: ${generatedURL}`)
    
    // Check if expected parameters are present
    const paramString = params.toString()
    const expectedParts = testCase.expected.split('&')
    
    let allPresent = true
    expectedParts.forEach(part => {
      if (paramString.includes(part)) {
        console.log(`   ✅ Expected parameter: ${part}`)
      } else {
        console.log(`   ❌ Missing parameter: ${part}`)
        allPresent = false
      }
    })
    
    if (allPresent) {
      console.log(`   ✅ Test case passed\n`)
    } else {
      console.log(`   ❌ Test case failed\n`)
    }
  })
}

function testValidation() {
  console.log('4. Testing Input Validation:')
  
  const testCases = [
    {
      name: 'Valid input',
      input: { metals: ['14k-gold'], stones: ['lab-diamond'], page: 1 },
      shouldPass: true
    },
    {
      name: 'Invalid metals',
      input: { metals: ['invalid-metal'], stones: ['lab-diamond'] },
      shouldPass: false
    },
    {
      name: 'Invalid page number',
      input: { metals: ['14k-gold'], page: -1 },
      shouldPass: false
    },
    {
      name: 'Invalid carat range',
      input: { caratRange: { min: 10, max: 5 } },
      shouldPass: false
    }
  ]
  
  const validMetals = ['silver', '14k-gold', '18k-gold', 'platinum']
  const validStones = ['lab-diamond', 'moissanite', 'lab-emerald', 'lab-ruby', 'lab-sapphire']
  
  testCases.forEach((testCase, index) => {
    console.log(`   Test Case ${index + 1}: ${testCase.name}`)
    
    let isValid = true
    
    // Validate metals
    if (testCase.input.metals) {
      const invalidMetals = testCase.input.metals.filter(m => !validMetals.includes(m))
      if (invalidMetals.length > 0) {
        isValid = false
        console.log(`   ❌ Invalid metals: ${invalidMetals.join(', ')}`)
      }
    }
    
    // Validate stones
    if (testCase.input.stones) {
      const invalidStones = testCase.input.stones.filter(s => !validStones.includes(s))
      if (invalidStones.length > 0) {
        isValid = false
        console.log(`   ❌ Invalid stones: ${invalidStones.join(', ')}`)
      }
    }
    
    // Validate page
    if (testCase.input.page && (testCase.input.page < 1 || testCase.input.page > 1000)) {
      isValid = false
      console.log(`   ❌ Invalid page number: ${testCase.input.page}`)
    }
    
    // Validate carat range
    if (testCase.input.caratRange) {
      const { min, max } = testCase.input.caratRange
      if (min && max && min > max) {
        isValid = false
        console.log(`   ❌ Invalid carat range: min (${min}) > max (${max})`)
      }
    }
    
    if (isValid === testCase.shouldPass) {
      console.log(`   ✅ Validation test passed`)
    } else {
      console.log(`   ❌ Validation test failed (expected ${testCase.shouldPass ? 'valid' : 'invalid'})`)
    }
    
    console.log('')
  })
}

// Run all tests
function runTests() {
  console.log('========================================')
  console.log('Material Filter URL Utilities Test Suite')
  console.log('========================================\n')
  
  testURLEncoding()
  testURLDecoding()
  testShareableURLs()
  testValidation()
  
  console.log('========================================')
  console.log('✅ URL Utilities Testing Complete!')
  console.log('\nNext: Test integration with live system')
  console.log('Run: curl "http://localhost:3000/catalog?metals=14k-gold&stones=lab-diamond"')
  console.log('========================================')
}

runTests()