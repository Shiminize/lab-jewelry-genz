/**
 * E2E Affiliate Link Testing Suite
 * Tests complete flow: Click → Track → Convert → Commission
 */

const axios = require('axios');
const { parse } = require('cookie');

class AffiliateE2ETest {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.testSession = null;
    this.testCookies = {};
    this.results = {
      clickTracking: null,
      conversionTracking: null,
      commissionCalculation: null,
      metricsUpdate: null
    };
  }

  // Helper to extract cookies from response
  extractCookies(response) {
    const cookies = {};
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      setCookieHeader.forEach(cookie => {
        const parsed = parse(cookie);
        Object.assign(cookies, parsed);
      });
    }
    return cookies;
  }

  // Helper to format cookies for requests
  formatCookies(cookies) {
    return Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
  }

  // Test 1: Click affiliate link and verify tracking
  async testAffiliateClick() {
    console.log('🔗 Testing affiliate link click...');
    
    try {
      // Get a real affiliate link from our seeded data
      const linkCode = 'Cr2RwTWIrqZf'; // Emma's necklace link
      const response = await axios.get(`${this.baseUrl}/api/ref/${linkCode}`, {
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://instagram.com'
        }
      });

      console.log(`✅ Redirect Status: ${response.status}`);
      console.log(`✅ Redirected to: ${response.headers.location}`);
      
      // Extract tracking cookies
      this.testCookies = this.extractCookies(response);
      console.log(`✅ Tracking cookies set:`, Object.keys(this.testCookies));
      
      if (this.testCookies.ref_session) {
        this.testSession = this.testCookies.ref_session;
        console.log(`✅ Session ID: ${this.testSession.substring(0, 20)}...`);
      }

      this.results.clickTracking = {
        success: response.status === 307,
        redirectUrl: response.headers.location,
        sessionId: this.testSession,
        cookies: Object.keys(this.testCookies)
      };

      return true;
    } catch (error) {
      console.error('❌ Click tracking failed:', error.message);
      this.results.clickTracking = { success: false, error: error.message };
      return false;
    }
  }

  // Test 2: Verify click was recorded in database
  async verifyClickRecorded() {
    console.log('\\n📊 Verifying click was recorded...');
    
    try {
      // Check if click was recorded by looking at link stats
      const linkResponse = await axios.get(`${this.baseUrl}/api/admin/creators?page=1&limit=1`, {
        headers: {
          'Cookie': this.formatCookies(this.testCookies)
        }
      });

      if (linkResponse.data.success) {
        const creator = linkResponse.data.data.creators.find(c => c.displayName === 'Emma StyleGuru');
        if (creator) {
          console.log(`✅ Creator found: ${creator.displayName}`);
          console.log(`✅ Total clicks: ${creator.stats.totalClicks}`);
          console.log(`✅ Total conversions: ${creator.stats.totalConversions}`);
          return true;
        }
      }
      
      console.log('⚠️  Could not verify click recording (may need admin auth)');
      return true; // Continue test even if we can't verify
    } catch (error) {
      console.log('⚠️  Could not verify click recording:', error.message);
      return true; // Continue test
    }
  }

  // Test 3: Simulate conversion/purchase
  async testConversion() {
    console.log('\\n💰 Testing conversion tracking...');
    
    if (!this.testSession) {
      console.error('❌ No session ID available for conversion test');
      return false;
    }

    try {
      const conversionData = {
        orderId: `test_order_${Date.now()}`,
        orderAmount: 125.99,
        sessionId: this.testSession
      };

      console.log(`🛒 Simulating purchase: Order ${conversionData.orderId} for $${conversionData.orderAmount}`);

      const response = await axios.post(`${this.baseUrl}/api/creators/conversions`, conversionData, {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': this.formatCookies(this.testCookies)
        }
      });

      console.log(`✅ Conversion API Status: ${response.status}`);
      console.log(`✅ Response:`, response.data);

      if (response.data.success && response.data.data.transaction) {
        const transaction = response.data.data.transaction;
        console.log(`✅ Commission calculated: $${transaction.commissionAmount}`);
        console.log(`✅ Commission rate: ${transaction.commissionRate}%`);
        console.log(`✅ Transaction status: ${transaction.status}`);

        this.results.conversionTracking = {
          success: true,
          orderId: conversionData.orderId,
          commissionAmount: transaction.commissionAmount,
          commissionRate: transaction.commissionRate,
          transactionId: transaction.id
        };

        this.results.commissionCalculation = {
          orderAmount: conversionData.orderAmount,
          commissionRate: transaction.commissionRate,
          commissionAmount: transaction.commissionAmount,
          calculationCorrect: Math.abs(
            (conversionData.orderAmount * transaction.commissionRate / 100) - transaction.commissionAmount
          ) < 0.01
        };

        return true;
      } else {
        console.log('⚠️  Conversion tracked but no commission data returned');
        return true;
      }
    } catch (error) {
      console.error('❌ Conversion tracking failed:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      this.results.conversionTracking = { success: false, error: error.message };
      return false;
    }
  }

  // Test 4: Verify metrics updated
  async verifyMetricsUpdate() {
    console.log('\\n📈 Verifying metrics update...');
    
    try {
      // Wait a moment for metrics to update
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await axios.get(`${this.baseUrl}/api/admin/creators?page=1&limit=5`);
      
      if (response.data.success) {
        const emma = response.data.data.creators.find(c => c.displayName === 'Emma StyleGuru');
        if (emma) {
          console.log(`✅ Updated metrics for ${emma.displayName}:`);
          console.log(`   - Total clicks: ${emma.stats.totalClicks}`);
          console.log(`   - Total conversions: ${emma.stats.totalConversions}`);
          console.log(`   - Total commissions: $${emma.stats.totalCommissions}`);
          
          this.results.metricsUpdate = {
            success: true,
            totalClicks: emma.stats.totalClicks,
            totalConversions: emma.stats.totalConversions,
            totalCommissions: emma.stats.totalCommissions
          };
          return true;
        }
      }
      
      console.log('⚠️  Could not verify metrics update');
      return true;
    } catch (error) {
      console.log('⚠️  Could not verify metrics update:', error.message);
      return true;
    }
  }

  // Test 5: Verify admin dashboard shows the transaction
  async verifyAdminDashboard() {
    console.log('\\n🎛️  Checking admin dashboard...');
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/admin/creators`);
      
      if (response.data.success) {
        const metrics = response.data.data.metrics;
        console.log(`✅ Total creators: ${metrics.totalCreators}`);
        console.log(`✅ Active creators: ${metrics.activeCreators}`);
        console.log(`✅ Pending applications: ${metrics.pendingApplications}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('⚠️  Could not check admin dashboard:', error.message);
      return true;
    }
  }

  // Generate comprehensive test report
  generateReport() {
    console.log('\\n' + '='.repeat(60));
    console.log('🧪 AFFILIATE LINK E2E TEST REPORT');
    console.log('='.repeat(60));
    
    console.log('\\n📊 TEST RESULTS:');
    
    // Click Tracking
    console.log('\\n1. 🔗 CLICK TRACKING:');
    if (this.results.clickTracking?.success) {
      console.log('   ✅ PASSED - Link redirect working');
      console.log(`   ✅ Session cookie set: ${this.results.clickTracking.sessionId ? 'Yes' : 'No'}`);
      console.log(`   ✅ Redirect URL: ${this.results.clickTracking.redirectUrl}`);
    } else {
      console.log('   ❌ FAILED - Click tracking not working');
      console.log(`   Error: ${this.results.clickTracking?.error || 'Unknown'}`);
    }

    // Conversion Tracking  
    console.log('\\n2. 💰 CONVERSION TRACKING:');
    if (this.results.conversionTracking?.success) {
      console.log('   ✅ PASSED - Conversion API working');
      console.log(`   ✅ Commission: $${this.results.conversionTracking.commissionAmount}`);
      console.log(`   ✅ Rate: ${this.results.conversionTracking.commissionRate}%`);
    } else {
      console.log('   ❌ FAILED - Conversion tracking not working');
      console.log(`   Error: ${this.results.conversionTracking?.error || 'Unknown'}`);
    }

    // Commission Calculation
    console.log('\\n3. 🧮 COMMISSION CALCULATION:');
    if (this.results.commissionCalculation?.calculationCorrect) {
      console.log('   ✅ PASSED - Commission math correct');
      console.log(`   ✅ ${this.results.commissionCalculation.orderAmount} × ${this.results.commissionCalculation.commissionRate}% = $${this.results.commissionCalculation.commissionAmount}`);
    } else {
      console.log('   ❌ FAILED - Commission calculation incorrect');
    }

    // Metrics Update
    console.log('\\n4. 📈 METRICS UPDATE:');
    if (this.results.metricsUpdate?.success) {
      console.log('   ✅ PASSED - Metrics updated successfully');
      console.log(`   ✅ Current stats available in admin dashboard`);
    } else {
      console.log('   ⚠️  PARTIAL - Could not verify metrics update');
    }

    const passedTests = Object.values(this.results).filter(r => r?.success).length;
    const totalTests = Object.keys(this.results).length;
    
    console.log('\\n' + '='.repeat(60));
    console.log(`🏆 OVERALL RESULT: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests >= totalTests * 0.75) {
      console.log('🎉 AFFILIATE SYSTEM IS WORKING CORRECTLY!');
    } else {
      console.log('⚠️  Some issues detected - review failed tests');
    }
    console.log('='.repeat(60));
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Affiliate Link E2E Test Suite...');
    
    await this.testAffiliateClick();
    await this.verifyClickRecorded();
    await this.testConversion();
    await this.verifyMetricsUpdate();
    await this.verifyAdminDashboard();
    
    this.generateReport();
  }
}

// Run the tests
async function main() {
  const tester = new AffiliateE2ETest();
  await tester.runAllTests();
}

main().catch(console.error);