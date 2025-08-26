/**
 * Phase 3 E2E Test: API Compliance and Material-Only Filtering
 * Validates CLAUDE_RULES.md compliance and ProductDisplayDTO format
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

async function testAPICompliance() {
  console.log('🧪 Phase 3 E2E Test: API Compliance Validation')
  console.log('=' .repeat(60))
  
  try {
    const startTime = Date.now()
    const response = await fetch(`${BASE_URL}/api/featured-products?limit=6`)
    const responseTime = Date.now() - startTime
    
    // Test 1: Response time (CLAUDE_RULES.md <300ms target)
    if (responseTime >= 300) {
      throw new Error(`API response time too slow: ${responseTime}ms (target: <300ms)`)
    }
    console.log(`✅ API response time: ${responseTime}ms (target: <300ms)`)
    
    // Test 2: HTTP status
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }
    console.log('✅ HTTP status: 200 OK')
    
    // Test 3: Response headers
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid content-type header')
    }
    console.log('✅ Content-Type: application/json')
    
    const data = await response.json()
    
    // Test 4: CLAUDE_RULES.md envelope format
    if (!data.hasOwnProperty('success')) {
      throw new Error('Missing "success" property in response envelope')
    }
    
    if (!data.hasOwnProperty('data')) {
      throw new Error('Missing "data" property in response envelope')
    }
    
    if (!data.hasOwnProperty('meta')) {
      throw new Error('Missing "meta" property in response envelope')
    }
    console.log('✅ CLAUDE_RULES envelope format validated')
    
    // Test 5: Meta properties (CLAUDE_RULES.md requirements)
    const requiredMeta = ['timestamp', 'version', 'responseTime']
    for (const prop of requiredMeta) {
      if (!data.meta.hasOwnProperty(prop)) {
        throw new Error(`Missing meta property: ${prop}`)
      }
    }
    console.log('✅ Meta properties complete')
    
    // Test 6: Success response structure
    if (data.success !== true) {
      throw new Error('Success property should be true')
    }
    
    if (!Array.isArray(data.data)) {
      throw new Error('Data should be an array')
    }
    console.log('✅ Success response structure validated')
    
    // Test 7: ProductDisplayDTO structure validation
    const products = data.data
    const requiredProductProps = [
      '_id', 'name', 'description', 'category', 'subcategory', 'slug',
      'basePrice', 'currency', 'primaryImage', 'images', 'materialSpecs',
      'inventory', 'metadata', 'seo'
    ]
    
    for (const product of products) {
      for (const prop of requiredProductProps) {
        if (!product.hasOwnProperty(prop)) {
          throw new Error(`Product missing property: ${prop}`)
        }
      }
      
      // Test unified image structure
      if (product.primaryImage !== product.images.primary) {
        throw new Error('Image structure inconsistency detected')
      }
      
      // Test material specs structure
      if (!product.materialSpecs.primaryMetal) {
        throw new Error('Missing primaryMetal in materialSpecs')
      }
      
      if (!product.materialSpecs.primaryMetal.type) {
        throw new Error('Missing metal type')
      }
    }
    console.log('✅ ProductDisplayDTO structure validated')
    
    // Test 8: Material-only compliance (CLAUDE_RULES.md enforcement)
    const allowedMetalTypes = ['silver', '14k-gold', '18k-gold', 'platinum']
    const allowedStoneTypes = ['lab-diamond', 'moissanite', 'lab-emerald', 'lab-ruby', 'lab-sapphire']
    const allowedTags = ['lab-grown', 'moissanite', 'lab-diamond', 'lab-emerald', 'lab-ruby', 'lab-sapphire', 'customizable']
    
    for (const product of products) {
      // Check metal compliance
      if (!allowedMetalTypes.includes(product.materialSpecs.primaryMetal.type)) {
        throw new Error(`Non-compliant metal type: ${product.materialSpecs.primaryMetal.type}`)
      }
      
      // Check stone compliance (if present)
      if (product.materialSpecs.primaryStone) {
        if (!allowedStoneTypes.includes(product.materialSpecs.primaryStone.type)) {
          throw new Error(`Non-compliant stone type: ${product.materialSpecs.primaryStone.type}`)
        }
      }
      
      // Check tag compliance (material-only tags)
      for (const tag of product.metadata.tags) {
        if (!allowedTags.includes(tag)) {
          throw new Error(`Non-compliant tag found: ${tag}`)
        }
      }
    }
    console.log('✅ Material-only compliance validated')
    
    // Test 9: Performance metadata validation
    if (!data.meta.materialFilteringCompliant) {
      throw new Error('Material filtering compliance flag should be true')
    }
    
    if (!data.meta.performance || !data.meta.performance.compliant) {
      throw new Error('Performance compliance flag should be true')
    }
    console.log('✅ Performance metadata validated')
    
    // Test 10: Material compliance metadata
    if (!data.meta.materialCompliance) {
      throw new Error('Missing materialCompliance metadata')
    }
    
    const expectedExclusions = ['natural-diamonds', 'mined-gems']
    const expectedInclusions = ['lab-grown-diamonds', 'moissanite', 'lab-gemstones']
    
    for (const exclusion of expectedExclusions) {
      if (!data.meta.materialCompliance.exclusions.includes(exclusion)) {
        throw new Error(`Missing exclusion: ${exclusion}`)
      }
    }
    
    for (const inclusion of expectedInclusions) {
      if (!data.meta.materialCompliance.inclusions.includes(inclusion)) {
        throw new Error(`Missing inclusion: ${inclusion}`)
      }
    }
    console.log('✅ Material compliance metadata validated')
    
    console.log('\n' + '=' .repeat(60))
    console.log('📊 API COMPLIANCE SUMMARY')
    console.log('=' .repeat(60))
    console.log(`✅ Products returned: ${products.length}`)
    console.log(`✅ Response time: ${responseTime}ms`)
    console.log(`✅ Material compliance: 100%`)
    console.log(`✅ CLAUDE_RULES envelope format: ✓`)
    console.log(`✅ ProductDisplayDTO structure: ✓`)
    console.log(`✅ Material-only filtering: ✓`)
    
    console.log('\n🎉 Phase 3 E2E Test: PASSED')
    console.log('✅ API fully compliant with CLAUDE_RULES.md')
    console.log('✅ ProductDisplayDTO format working correctly')
    console.log('✅ Material-only filtering enforced')
    console.log('✅ Performance targets met')
    
  } catch (error) {
    console.error('❌ Phase 3 E2E Test: FAILED')
    console.error('Error:', error.message)
    process.exit(1)
  }
}

// Run the test
testAPICompliance()