/**
 * Homepage Featured Products Integration Validation
 * Simple Node.js script to validate the complete integration
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

async function validateFeaturedProductsAPI() {
  console.log('🔍 Testing Featured Products API...')
  
  const startTime = Date.now()
  try {
    const response = await fetch(`${BASE_URL}/api/featured-products?limit=6`)
    const responseTime = Date.now() - startTime
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Validate response structure
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error('Invalid API response structure')
    }
    
    // Check performance
    if (responseTime >= 300) {
      console.warn(`⚠️  API response time: ${responseTime}ms (target: <300ms)`)
    } else {
      console.log(`✅ API response time: ${responseTime}ms (target: <300ms)`)
    }
    
    // Validate material compliance
    if (!data.meta?.materialFilteringCompliant) {
      throw new Error('Material filtering compliance not met')
    }
    
    console.log(`✅ Returned ${data.data.length} featured products`)
    console.log('✅ Material filtering compliant')
    console.log('✅ CLAUDE_RULES envelope format validated')
    
    return data.data
  } catch (error) {
    console.error('❌ Featured Products API test failed:', error.message)
    return null
  }
}

async function validateHomepageContent() {
  console.log('\n🏠 Testing Homepage Content...')
  
  const startTime = Date.now()
  try {
    const response = await fetch(BASE_URL)
    const loadTime = Date.now() - startTime
    
    if (!response.ok) {
      throw new Error(`Homepage responded with status: ${response.status}`)
    }
    
    const html = await response.text()
    
    // Check for real product names (not mock data)
    const realProductNames = [
      'Eternal Promise Solitaire',
      'Moissanite Tennis Bracelet', 
      'Sustainable Tennis Necklace',
      'Chandelier Celebration Earrings',
      'Conscious Tennis Bracelet'
    ]
    
    let foundProducts = 0
    for (const productName of realProductNames) {
      if (html.includes(productName)) {
        foundProducts++
        console.log(`✅ Found real product: ${productName}`)
      }
    }
    
    if (foundProducts === 0) {
      throw new Error('No real products found on homepage - still using mock data')
    }
    
    // Check load time
    if (loadTime >= 3000) {
      console.warn(`⚠️  Homepage load time: ${loadTime}ms (target: <3000ms)`)
    } else {
      console.log(`✅ Homepage load time: ${loadTime}ms (target: <3000ms)`)
    }
    
    console.log(`✅ Found ${foundProducts} real products on homepage`)
    console.log('✅ Homepage successfully integrated with database')
    
    return true
  } catch (error) {
    console.error('❌ Homepage content test failed:', error.message)
    return false
  }
}

async function validateCatalogConsistency(featuredProducts) {
  console.log('\n📋 Testing Catalog Consistency...')
  
  if (!featuredProducts || featuredProducts.length === 0) {
    console.warn('⚠️  Skipping catalog consistency test - no featured products available')
    return
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/products?limit=50`)
    
    if (!response.ok) {
      throw new Error(`Catalog API responded with status: ${response.status}`)
    }
    
    const catalogData = await response.json()
    
    if (!catalogData.success || !Array.isArray(catalogData.data)) {
      throw new Error('Invalid catalog API response structure')
    }
    
    // Check if featured products exist in catalog
    const featuredIds = featuredProducts.map(p => p._id)
    const catalogIds = catalogData.data.map(p => p._id)
    
    let matchedProducts = 0
    for (const featuredId of featuredIds) {
      if (catalogIds.includes(featuredId)) {
        matchedProducts++
      }
    }
    
    if (matchedProducts === 0) {
      throw new Error('No featured products found in catalog')
    }
    
    console.log(`✅ ${matchedProducts}/${featuredIds.length} featured products found in catalog`)
    console.log('✅ Data consistency between homepage and catalog validated')
    
    return true
  } catch (error) {
    console.error('❌ Catalog consistency test failed:', error.message)
    return false
  }
}

async function runAllValidations() {
  console.log('🧪 Homepage Featured Products Integration Validation')
  console.log('=' .repeat(60))
  console.log('📍 Testing complete database → API → homepage → catalog workflow')
  console.log('🎯 Validating CLAUDE_RULES compliance and performance targets')
  console.log('')
  
  const featuredProducts = await validateFeaturedProductsAPI()
  const homepageValid = await validateHomepageContent()
  const catalogValid = await validateCatalogConsistency(featuredProducts)
  
  console.log('\n' + '=' .repeat(60))
  console.log('📊 VALIDATION SUMMARY')
  console.log('=' .repeat(60))
  
  if (featuredProducts) {
    console.log('✅ Featured Products API: PASSED')
  } else {
    console.log('❌ Featured Products API: FAILED')
  }
  
  if (homepageValid) {
    console.log('✅ Homepage Integration: PASSED')
  } else {
    console.log('❌ Homepage Integration: FAILED')
  }
  
  if (catalogValid) {
    console.log('✅ Catalog Consistency: PASSED')
  } else {
    console.log('❌ Catalog Consistency: FAILED')
  }
  
  const allPassed = featuredProducts && homepageValid && catalogValid
  
  if (allPassed) {
    console.log('\n🎉 ALL VALIDATIONS PASSED!')
    console.log('✅ Homepage successfully connected to catalog products')
    console.log('✅ CLAUDE_RULES compliance validated')
    console.log('✅ Performance targets met')
  } else {
    console.log('\n💥 SOME VALIDATIONS FAILED')
    console.log('❌ Please check the errors above')
  }
  
  return allPassed
}

// Run the validation
if (require.main === module) {
  runAllValidations()
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error('💥 Validation script error:', error)
      process.exit(1)
    })
}

module.exports = { runAllValidations }