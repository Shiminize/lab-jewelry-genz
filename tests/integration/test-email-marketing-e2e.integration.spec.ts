/**
 * Email Marketing Automation E2E Tests
 * Comprehensive testing for campaigns, segments, triggers, templates, and analytics
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

console.log('============================================================')
console.log('📧 EMAIL MARKETING AUTOMATION E2E TEST SUITE')
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

// Test email campaign management
async function testCampaignManagement() {
  console.log('\n📋 Testing Email Campaign Management...\n')
  
  try {
    // Test list campaigns
    const listResponse = await fetch(`${BASE_URL}/api/admin/email-marketing/campaigns`)
    const listData = await listResponse.json()
    
    assert(listResponse.ok, 'Campaigns list API responds successfully')
    assert(listData.success === true, 'Campaigns list returns success response')
    assert(Array.isArray(listData.data.campaigns), 'Campaigns list returns campaigns array')
    assert(typeof listData.data.summary === 'object', 'Campaigns list returns summary object')
    assert(typeof listData.data.pagination === 'object', 'Campaigns list returns pagination object')
    
    console.log(`   Found ${listData.data.campaigns.length} campaigns`)
    console.log(`   Total campaigns: ${listData.data.summary.totalCampaigns || 0}`)
    console.log(`   Active campaigns: ${listData.data.summary.activeCampaigns || 0}`)
    
    // Test create campaign
    const newCampaign = {
      name: 'Test Welcome Campaign',
      type: 'welcome-series',
      subject: 'Welcome to GenZ Jewelry!',
      content: {
        html: '<h1>Welcome {{firstName}}!</h1><p>Thank you for joining us.</p>',
        text: 'Welcome {{firstName}}! Thank you for joining us.'
      },
      segments: [],
      createdBy: 'test-user'
    }
    
    const createResponse = await fetch(`${BASE_URL}/api/admin/email-marketing/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCampaign)
    })
    const createData = await createResponse.json()
    
    assert(createResponse.ok, 'Campaign creation API responds successfully')
    assert(createData.success === true, 'Campaign creation returns success response')
    assert(typeof createData.data.campaign === 'object', 'Campaign creation returns campaign object')
    assert(createData.data.campaign.name === newCampaign.name, 'Created campaign has correct name')
    
    const campaignId = createData.data.campaign._id
    console.log(`   Created campaign with ID: ${campaignId}`)
    
    // Test get campaign details
    const detailResponse = await fetch(`${BASE_URL}/api/admin/email-marketing/campaigns/${campaignId}`)
    const detailData = await detailResponse.json()
    
    assert(detailResponse.ok, 'Campaign details API responds successfully')
    assert(detailData.success === true, 'Campaign details returns success response')
    assert(detailData.data.campaign._id === campaignId, 'Campaign details returns correct campaign')
    
    // Test update campaign
    const updatePayload = {
      name: 'Updated Test Welcome Campaign',
      subject: 'Updated Welcome Subject'
    }
    
    const updateResponse = await fetch(`${BASE_URL}/api/admin/email-marketing/campaigns/${campaignId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    })
    const updateData = await updateResponse.json()
    
    assert(updateResponse.ok, 'Campaign update API responds successfully')
    assert(updateData.success === true, 'Campaign update returns success response')
    assert(updateData.data.campaign.name === updatePayload.name, 'Campaign update changes name correctly')
    
    console.log(`   Updated campaign name to: ${updateData.data.campaign.name}`)
    
  } catch (error) {
    assert(false, `Campaign management test failed: ${error.message}`)
  }
}

// Test customer segmentation
async function testCustomerSegmentation() {
  console.log('\n🎯 Testing Customer Segmentation...\n')
  
  try {
    // Test list segments
    const listResponse = await fetch(`${BASE_URL}/api/admin/email-marketing/segments`)
    const listData = await listResponse.json()
    
    assert(listResponse.ok, 'Segments list API responds successfully')
    assert(listData.success === true, 'Segments list returns success response')
    assert(Array.isArray(listData.data.segments), 'Segments list returns segments array')
    assert(typeof listData.data.summary === 'object', 'Segments list returns summary object')
    
    console.log(`   Found ${listData.data.segments.length} segments`)
    console.log(`   Total segments: ${listData.data.summary.totalSegments || 0}`)
    console.log(`   Active segments: ${listData.data.summary.activeSegments || 0}`)
    
    // Test create segment
    const newSegment = {
      name: 'High Value Customers',
      description: 'Customers who have spent over $500',
      type: 'transactional',
      criteria: {
        rules: [
          {
            field: 'totalSpent',
            operator: 'greater_than',
            value: 500,
            logic: 'AND'
          }
        ],
        conditions: 'Total spent is greater than $500'
      },
      createdBy: 'test-user'
    }
    
    const createResponse = await fetch(`${BASE_URL}/api/admin/email-marketing/segments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSegment)
    })
    const createData = await createResponse.json()
    
    assert(createResponse.ok, 'Segment creation API responds successfully')
    assert(createData.success === true, 'Segment creation returns success response')
    assert(typeof createData.data.segment === 'object', 'Segment creation returns segment object')
    assert(createData.data.segment.name === newSegment.name, 'Created segment has correct name')
    
    const segmentId = createData.data.segment._id
    console.log(`   Created segment with ID: ${segmentId}`)
    console.log(`   Segment customer count: ${createData.data.segment.customerCount}`)
    
    // Test get segment details
    const detailResponse = await fetch(`${BASE_URL}/api/admin/email-marketing/segments/${segmentId}`)
    const detailData = await detailResponse.json()
    
    assert(detailResponse.ok, 'Segment details API responds successfully')
    assert(detailData.success === true, 'Segment details returns success response')
    assert(detailData.data.segment._id === segmentId, 'Segment details returns correct segment')
    assert(Array.isArray(detailData.data.sampleCustomers), 'Segment details includes sample customers')
    
    console.log(`   Sample customers count: ${detailData.data.sampleCustomers.length}`)
    
  } catch (error) {
    assert(false, `Customer segmentation test failed: ${error.message}`)
  }
}

// Test email automation triggers
async function testEmailTriggers() {
  console.log('\n⚡ Testing Email Automation Triggers...\n')
  
  try {
    // Test list triggers
    const listResponse = await fetch(`${BASE_URL}/api/admin/email-marketing/triggers`)
    const listData = await listResponse.json()
    
    assert(listResponse.ok, 'Triggers list API responds successfully')
    assert(listData.success === true, 'Triggers list returns success response')
    assert(Array.isArray(listData.data.triggers), 'Triggers list returns triggers array')
    assert(typeof listData.data.summary === 'object', 'Triggers list returns summary object')
    
    console.log(`   Found ${listData.data.triggers.length} triggers`)
    console.log(`   Total triggers: ${listData.data.summary.totalTriggers || 0}`)
    console.log(`   Active triggers: ${listData.data.summary.activeTriggers || 0}`)
    console.log(`   Average conversion rate: ${listData.data.summary.avgConversionRate || 0}%`)
    
    // Test create trigger
    const newTrigger = {
      name: 'Abandoned Cart Recovery',
      type: 'abandoned-cart',
      description: 'Send email to users who abandon their cart',
      trigger: {
        event: 'cart_abandoned',
        conditions: [],
        delay: 60 // 1 hour
      },
      campaign: {
        subject: 'Don\'t forget your items!',
        template: 'abandoned-cart',
        content: {
          html: '<h1>Hi {{firstName}}!</h1><p>You left some items in your cart.</p>',
          text: 'Hi {{firstName}}! You left some items in your cart.'
        }
      },
      targeting: {
        segments: [],
        maxFrequency: {
          count: 1,
          period: 'week'
        }
      },
      createdBy: 'test-user'
    }
    
    const createResponse = await fetch(`${BASE_URL}/api/admin/email-marketing/triggers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTrigger)
    })
    const createData = await createResponse.json()
    
    assert(createResponse.ok, 'Trigger creation API responds successfully')
    assert(createData.success === true, 'Trigger creation returns success response')
    assert(typeof createData.data.trigger === 'object', 'Trigger creation returns trigger object')
    assert(createData.data.trigger.name === newTrigger.name, 'Created trigger has correct name')
    
    const triggerId = createData.data.trigger._id
    console.log(`   Created trigger with ID: ${triggerId}`)
    
    // Test trigger processing (dry run)
    const processResponse = await fetch(`${BASE_URL}/api/admin/email-marketing/triggers/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        triggerType: 'abandoned-cart',
        maxProcessing: 10,
        dryRun: true
      })
    })
    const processData = await processResponse.json()
    
    assert(processResponse.ok, 'Trigger processing API responds successfully')
    assert(processData.success === true, 'Trigger processing returns success response')
    assert(typeof processData.data.summary === 'object', 'Trigger processing returns summary')
    assert(processData.data.dryRun === true, 'Trigger processing confirms dry run mode')
    
    console.log(`   Processed ${processData.data.summary.triggersProcessed} triggers`)
    console.log(`   Would send ${processData.data.summary.emailsSent} emails`)
    
  } catch (error) {
    assert(false, `Email triggers test failed: ${error.message}`)
  }
}

// Test email templates
async function testEmailTemplates() {
  console.log('\n🎨 Testing Email Templates...\n')
  
  try {
    // Test list templates
    const listResponse = await fetch(`${BASE_URL}/api/admin/email-marketing/templates`)
    const listData = await listResponse.json()
    
    assert(listResponse.ok, 'Templates list API responds successfully')
    assert(listData.success === true, 'Templates list returns success response')
    assert(Array.isArray(listData.data.templates), 'Templates list returns templates array')
    assert(typeof listData.data.summary === 'object', 'Templates list returns summary object')
    
    console.log(`   Found ${listData.data.templates.length} templates`)
    console.log(`   Total templates: ${listData.data.summary.totalTemplates || 0}`)
    console.log(`   Active templates: ${listData.data.summary.activeTemplates || 0}`)
    
    // Test create template
    const newTemplate = {
      name: 'Welcome Email Template',
      description: 'Template for welcome emails',
      category: 'marketing',
      type: 'welcome',
      design: {
        layout: 'single-column',
        colorScheme: {
          primary: '#d4af37',
          secondary: '#f4e4bc',
          background: '#ffffff',
          text: '#1a1a1a',
          accent: '#b8941f'
        }
      },
      content: {
        html: `
          <div class="email-container">
            <div class="email-header">
              <h1>Welcome {{firstName}}!</h1>
            </div>
            <div class="email-content">
              <p>Thank you for joining GenZ Jewelry. We're excited to have you!</p>
              <a href="{{shopUrl}}" class="button">Start Shopping</a>
            </div>
            <div class="email-footer">
              <p>© 2025 GenZ Jewelry. All rights reserved.</p>
            </div>
          </div>
        `,
        variables: [
          {
            name: 'firstName',
            type: 'text',
            description: 'Customer first name',
            required: true
          },
          {
            name: 'shopUrl',
            type: 'url',
            description: 'Link to shop',
            required: true
          }
        ]
      },
      preview: {
        thumbnail: '',
        previewData: {
          firstName: 'John',
          shopUrl: 'https://example.com/shop'
        }
      },
      createdBy: 'test-user'
    }
    
    const createResponse = await fetch(`${BASE_URL}/api/admin/email-marketing/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTemplate)
    })
    const createData = await createResponse.json()
    
    assert(createResponse.ok, 'Template creation API responds successfully')
    assert(createData.success === true, 'Template creation returns success response')
    assert(typeof createData.data.template === 'object', 'Template creation returns template object')
    assert(createData.data.template.name === newTemplate.name, 'Created template has correct name')
    assert(Array.isArray(createData.data.template.content.variables), 'Template includes variables array')
    
    const templateId = createData.data.template._id
    console.log(`   Created template with ID: ${templateId}`)
    console.log(`   Template variables: ${createData.data.template.content.variables.length}`)
    
  } catch (error) {
    assert(false, `Email templates test failed: ${error.message}`)
  }
}

// Test email analytics
async function testEmailAnalytics() {
  console.log('\n📊 Testing Email Analytics...\n')
  
  try {
    // Test overall analytics
    const analyticsResponse = await fetch(`${BASE_URL}/api/admin/email-marketing/analytics?period=30d`)
    const analyticsData = await analyticsResponse.json()
    
    assert(analyticsResponse.ok, 'Email analytics API responds successfully')
    assert(analyticsData.success === true, 'Email analytics returns success response')
    assert(typeof analyticsData.data.overview === 'object', 'Analytics includes overview object')
    assert(Array.isArray(analyticsData.data.campaigns), 'Analytics includes campaigns array')
    assert(Array.isArray(analyticsData.data.triggers), 'Analytics includes triggers array')
    assert(Array.isArray(analyticsData.data.timeSeries), 'Analytics includes time series data')
    assert(typeof analyticsData.data.audience === 'object', 'Analytics includes audience insights')
    assert(typeof analyticsData.data.deliverability === 'object', 'Analytics includes deliverability metrics')
    
    console.log(`   Overview - Sent: ${analyticsData.data.overview.sent}`)
    console.log(`   Overview - Open rate: ${analyticsData.data.overview.openRate}%`)
    console.log(`   Overview - Click rate: ${analyticsData.data.overview.clickRate}%`)
    console.log(`   Overview - Delivery rate: ${analyticsData.data.overview.deliveryRate}%`)
    console.log(`   Time series data points: ${analyticsData.data.timeSeries.length}`)
    console.log(`   Top campaigns: ${analyticsData.data.campaigns.length}`)
    
    // Test analytics with filters
    const filteredResponse = await fetch(`${BASE_URL}/api/admin/email-marketing/analytics?period=7d`)
    const filteredData = await filteredResponse.json()
    
    assert(filteredResponse.ok, 'Filtered analytics API responds successfully')
    assert(filteredData.success === true, 'Filtered analytics returns success response')
    assert(filteredData.data.period === '7d', 'Analytics respects period filter')
    
    console.log(`   7-day analytics - Sent: ${filteredData.data.overview.sent}`)
    
  } catch (error) {
    assert(false, `Email analytics test failed: ${error.message}`)
  }
}

// Test API performance
async function testAPIPerformance() {
  console.log('\n⚡ Testing Email Marketing API Performance...\n')
  
  const endpoints = [
    '/api/admin/email-marketing/campaigns',
    '/api/admin/email-marketing/segments',
    '/api/admin/email-marketing/triggers',
    '/api/admin/email-marketing/templates',
    '/api/admin/email-marketing/analytics'
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
    // Test invalid campaign creation
    const invalidCampaign = await fetch(`${BASE_URL}/api/admin/email-marketing/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // Missing required fields
    })
    const invalidData = await invalidCampaign.json()
    
    assert(invalidData.success === false, 'Invalid campaign creation returns error')
    assert(invalidData.error.code === 'VALIDATION_ERROR', 'Invalid campaign has correct error code')
    
    // Test invalid segment creation
    const invalidSegment = await fetch(`${BASE_URL}/api/admin/email-marketing/segments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        type: 'invalid-type'
      })
    })
    const invalidSegmentData = await invalidSegment.json()
    
    assert(invalidSegmentData.success === false, 'Invalid segment creation returns error')
    assert(invalidSegmentData.error.code === 'VALIDATION_ERROR', 'Invalid segment has correct error code')
    
    // Test non-existent resource
    const notFoundResponse = await fetch(`${BASE_URL}/api/admin/email-marketing/campaigns/invalid-id`)
    const notFoundData = await notFoundResponse.json()
    
    assert(notFoundData.success === false, 'Non-existent campaign returns error')
    assert(notFoundData.error.code === 'INVALID_ID', 'Non-existent campaign has correct error code')
    
  } catch (error) {
    assert(false, `Error handling test failed: ${error.message}`)
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testCampaignManagement()
    await testCustomerSegmentation()
    await testEmailTriggers()
    await testEmailTemplates()
    await testEmailAnalytics()
    await testAPIPerformance()
    await testErrorHandling()
    
  } catch (error) {
    console.error('Test suite failed:', error)
  }
  
  // Final summary
  console.log('\n============================================================')
  console.log('📊 EMAIL MARKETING AUTOMATION TEST SUMMARY')
  console.log('============================================================')
  console.log(`Total Tests: ${totalTests}`)
  console.log(`✅ Passed: ${passedTests}`)
  console.log(`❌ Failed: ${totalTests - passedTests}`)
  console.log(`Pass Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All email marketing automation systems are operational!')
  } else {
    console.log('\n⚠️ Some email marketing tests failed. Review the output above.')
  }
  
  console.log('============================================================')
}

// Execute the test suite
if (require.main === module) {
  runAllTests()
}

module.exports = { runAllTests }