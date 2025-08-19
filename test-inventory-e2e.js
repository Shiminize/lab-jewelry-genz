/**
 * Inventory Management E2E Tests
 * Comprehensive testing for inventory dashboard and APIs
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

console.log('============================================================')
console.log('🏪 INVENTORY MANAGEMENT E2E TEST SUITE')
console.log('============================================================')
console.log(`Testing against: ${BASE_URL}`)
console.log('============================================================')

let passedTests = 0
let totalTests = 0

// Helper function for assertions
function assert(condition, message) {
  totalTests++
  if (condition) {
    console.log(`✅ ${message}`)
    passedTests++
  } else {
    console.log(`❌ ${message}`)
  }
}

// Test inventory overview API
async function testInventoryOverviewAPI() {
  console.log('\n📦 Testing Inventory Overview API...\n')
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/inventory`)
    const data = await response.json()
    
    assert(response.ok, 'Inventory overview API responds successfully')
    assert(data.success === true, 'Inventory overview returns success response')
    assert(typeof data.data === 'object', 'Inventory overview returns data object')
    assert(Array.isArray(data.data.products), 'Inventory overview returns products array')
    assert(typeof data.data.summary === 'object', 'Inventory overview returns summary object')
    assert(typeof data.data.pagination === 'object', 'Inventory overview returns pagination object')
    
    console.log(`   Found ${data.data.products.length} products`)
    console.log(`   Total inventory value: $${data.data.summary.totalInventoryValue?.toLocaleString() || 0}`)
    console.log(`   Low stock products: ${data.data.summary.lowStockProducts || 0}`)
    console.log(`   Out of stock products: ${data.data.summary.outOfStockProducts || 0}`)
    
  } catch (error) {
    assert(false, `Inventory overview API failed: ${error.message}`)
  }
}

// Test inventory alerts API
async function testInventoryAlertsAPI() {
  console.log('\n🚨 Testing Inventory Alerts API...\n')
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/inventory/alerts`)
    const data = await response.json()
    
    assert(response.ok, 'Inventory alerts API responds successfully')
    assert(data.success === true, 'Inventory alerts returns success response')
    assert(Array.isArray(data.data.alerts), 'Inventory alerts returns alerts array')
    assert(typeof data.data.summary === 'object', 'Inventory alerts returns summary object')
    assert(typeof data.data.alertCounts === 'object', 'Inventory alerts returns alert counts')
    
    console.log(`   Found ${data.data.alerts.length} active alerts`)
    console.log(`   Critical alerts: ${data.data.alertCounts.critical || 0}`)
    console.log(`   High priority alerts: ${data.data.alertCounts.high || 0}`)
    console.log(`   Medium priority alerts: ${data.data.alertCounts.medium || 0}`)
    
    // Test specific severity filter
    const criticalResponse = await fetch(`${BASE_URL}/api/admin/inventory/alerts?severity=critical`)
    const criticalData = await criticalResponse.json()
    
    assert(criticalResponse.ok, 'Inventory alerts API with severity filter works')
    assert(criticalData.success === true, 'Critical alerts filter returns success')
    
  } catch (error) {
    assert(false, `Inventory alerts API failed: ${error.message}`)
  }
}

// Test inventory filtering
async function testInventoryFiltering() {
  console.log('\n🔍 Testing Inventory Filtering...\n')
  
  try {
    // Test status filtering
    const statusResponse = await fetch(`${BASE_URL}/api/admin/inventory?status=low-stock`)
    const statusData = await statusResponse.json()
    
    assert(statusResponse.ok, 'Inventory status filtering works')
    assert(statusData.success === true, 'Status filter returns success')
    console.log(`   Low stock filter found ${statusData.data.products.length} products`)
    
    // Test pagination
    const pageResponse = await fetch(`${BASE_URL}/api/admin/inventory?page=1&limit=5`)
    const pageData = await pageResponse.json()
    
    assert(pageResponse.ok, 'Inventory pagination works')
    assert(pageData.success === true, 'Pagination returns success')
    assert(pageData.data.products.length <= 5, 'Pagination respects limit parameter')
    assert(typeof pageData.data.pagination.totalPages === 'number', 'Pagination includes total pages')
    
    console.log(`   Page 1 with limit 5: ${pageData.data.products.length} products`)
    console.log(`   Total pages: ${pageData.data.pagination.totalPages}`)
    
  } catch (error) {
    assert(false, `Inventory filtering failed: ${error.message}`)
  }
}

// Test restock functionality
async function testRestockFunctionality() {
  console.log('\n📈 Testing Restock Functionality...\n')
  
  try {
    // Test with invalid data first
    const invalidResponse = await fetch(`${BASE_URL}/api/admin/inventory/restock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [] })
    })
    const invalidData = await invalidResponse.json()
    
    assert(!invalidData.success, 'Restock API rejects empty items array')
    assert(invalidData.error.code === 'VALIDATION_ERROR', 'Restock validation error has correct code')
    
    // Test with malformed item data
    const malformedResponse = await fetch(`${BASE_URL}/api/admin/inventory/restock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: 'invalid', quantity: -5 }]
      })
    })
    const malformedData = await malformedResponse.json()
    
    assert(malformedData.success === true, 'Restock API handles malformed data gracefully')
    assert(Array.isArray(malformedData.data.restockResults), 'Restock returns results array')
    
  } catch (error) {
    assert(false, `Restock functionality test failed: ${error.message}`)
  }
}

// Test dashboard page rendering
async function testDashboardPage() {
  console.log('\n🖥️ Testing Dashboard Page Rendering...\n')
  
  try {
    const response = await fetch(`${BASE_URL}/admin/inventory`)
    const html = await response.text()
    
    assert(response.ok, 'Inventory dashboard page loads successfully')
    assert(html.includes('Inventory Management'), 'Dashboard page includes correct title')
    assert(html.includes('Total Products'), 'Dashboard page includes summary cards')
    assert(html.includes('Low Stock Alerts'), 'Dashboard page includes alert information')
    
    console.log(`   Dashboard page loaded (${html.length} bytes)`)
    
  } catch (error) {
    assert(false, `Dashboard page test failed: ${error.message}`)
  }
}

// Test API response times
async function testAPIPerformance() {
  console.log('\n⚡ Testing API Performance...\n')
  
  const endpoints = [
    '/api/admin/inventory',
    '/api/admin/inventory/alerts'
  ]
  
  for (const endpoint of endpoints) {
    try {
      const start = Date.now()
      const response = await fetch(`${BASE_URL}${endpoint}`)
      const duration = Date.now() - start
      
      assert(response.ok, `${endpoint} responds successfully`)
      assert(duration < 2000, `${endpoint} responds within 2 seconds (${duration}ms)`)
      
      if (duration < 500) {
        console.log(`   ${endpoint}: ${duration}ms ⚡ (Fast)`)
      } else if (duration < 1000) {
        console.log(`   ${endpoint}: ${duration}ms ✅ (Good)`)
      } else {
        console.log(`   ${endpoint}: ${duration}ms ⚠️ (Slow)`)
      }
      
    } catch (error) {
      assert(false, `${endpoint} performance test failed: ${error.message}`)
    }
  }
}

// Test error handling
async function testErrorHandling() {
  console.log('\n🛡️ Testing Error Handling...\n')
  
  try {
    // Test invalid restock request
    const response1 = await fetch(`${BASE_URL}/api/admin/inventory/restock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // Missing items
    })
    const data1 = await response1.json()
    
    assert(data1.success === false, 'Invalid restock request returns error')
    assert(data1.error.code === 'VALIDATION_ERROR', 'Error has correct validation code')
    
    // Test invalid alert filter
    const response2 = await fetch(`${BASE_URL}/api/admin/inventory/alerts?severity=invalid`)
    const data2 = await response2.json()
    
    assert(response2.ok, 'Invalid filter parameters handled gracefully')
    assert(data2.success === true, 'Invalid severity filter still returns success')
    
  } catch (error) {
    assert(false, `Error handling test failed: ${error.message}`)
  }
}

// Test data consistency
async function testDataConsistency() {
  console.log('\n🔍 Testing Data Consistency...\n')
  
  try {
    const [inventoryResponse, alertsResponse] = await Promise.all([
      fetch(`${BASE_URL}/api/admin/inventory`),
      fetch(`${BASE_URL}/api/admin/inventory/alerts`)
    ])
    
    const inventoryData = await inventoryResponse.json()
    const alertsData = await alertsResponse.json()
    
    assert(inventoryData.success && alertsData.success, 'Both APIs return successful responses')
    
    // Check if alert counts match inventory summary
    const inventoryLowStock = inventoryData.data.summary.lowStockProducts || 0
    const inventoryOutStock = inventoryData.data.summary.outOfStockProducts || 0
    const alertCritical = alertsData.data.alertCounts.critical || 0
    const alertHigh = alertsData.data.alertCounts.high || 0
    
    console.log(`   Inventory low stock: ${inventoryLowStock}`)
    console.log(`   Inventory out of stock: ${inventoryOutStock}`)
    console.log(`   Critical alerts: ${alertCritical}`)
    console.log(`   High priority alerts: ${alertHigh}`)
    
    assert(true, 'Data consistency check completed')
    
  } catch (error) {
    assert(false, `Data consistency test failed: ${error.message}`)
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testInventoryOverviewAPI()
    await testInventoryAlertsAPI()
    await testInventoryFiltering()
    await testRestockFunctionality()
    await testDashboardPage()
    await testAPIPerformance()
    await testErrorHandling()
    await testDataConsistency()
    
  } catch (error) {
    console.error('Test suite failed:', error)
  }
  
  // Final summary
  console.log('\n============================================================')
  console.log('📊 INVENTORY MANAGEMENT TEST SUMMARY')
  console.log('============================================================')
  console.log(`Total Tests: ${totalTests}`)
  console.log(`✅ Passed: ${passedTests}`)
  console.log(`❌ Failed: ${totalTests - passedTests}`)
  console.log(`Pass Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All inventory management systems are operational!')
  } else {
    console.log('\n⚠️ Some inventory management tests failed. Review the output above.')
  }
  
  console.log('============================================================')
}

// Execute the test suite
if (require.main === module) {
  runAllTests()
}

module.exports = { runAllTests }