/**
 * Creator Program Workflow Demonstration
 * Shows the complete flow from creator submission to admin dashboard management
 */

const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

class CreatorWorkflowDemo {
  constructor() {
    this.testCreator = {
      // Initial submission data (what creator fills out)
      userId: '507f1f77bcf86cd799439011', // Mock user ID
      displayName: 'Emma Rodriguez',
      email: 'emma.rodriguez@influencer.com',
      profileImage: 'https://example.com/emma-profile.jpg',
      bio: 'Fashion & jewelry influencer with 150K followers on Instagram and TikTok. Passionate about sustainable luxury and helping others discover their unique style.',
      socialLinks: {
        instagram: 'https://instagram.com/emmaR_style',
        tiktok: 'https://tiktok.com/@emmaRodriguezStyle',
        youtube: 'https://youtube.com/c/EmmaStyleGuide',
        twitter: 'https://twitter.com/emmaR_fashion',
        website: 'https://emmarodriguez.style'
      },
      paymentInfo: {
        method: 'paypal',
        details: 'emma.payments@gmail.com' // This would be encrypted in real system
      },
      // These are set by the system automatically
      status: 'pending',
      commissionRate: 10, // Default 10%, can be adjusted by admin
      minimumPayout: 50,  // Default $50 minimum
      settings: {
        emailNotifications: true,
        publicProfile: true,
        allowDirectMessages: true
      }
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      error: '\x1b[31m',   // Red
      warning: '\x1b[33m', // Yellow
      step: '\x1b[35m',    // Magenta
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async demonstrateWorkflow() {
    this.log('\n🚀 CREATOR PROGRAM WORKFLOW DEMONSTRATION', 'step');
    this.log('='.repeat(60), 'step');

    // STEP 1: Creator Submission
    this.log('\n📝 STEP 1: CREATOR SUBMISSION', 'step');
    this.log('When a user wants to become a creator, they submit an application with:', 'info');
    
    const submissionData = {
      displayName: this.testCreator.displayName,
      email: this.testCreator.email,
      bio: this.testCreator.bio,
      socialLinks: this.testCreator.socialLinks,
      paymentInfo: this.testCreator.paymentInfo
    };
    
    console.log('\n📋 SUBMISSION DATA:');
    console.log(JSON.stringify(submissionData, null, 2));

    // STEP 2: System Processing
    this.log('\n⚙️ STEP 2: SYSTEM PROCESSING', 'step');
    this.log('The system automatically processes the submission:', 'info');
    
    const processedCreator = {
      ...this.testCreator,
      _id: '67c0a1b2c3d4e5f6g7h8i9j0', // Generated MongoDB ID
      creatorCode: this.generateCreatorCode(), // Auto-generated unique code
      createdAt: new Date(),
      updatedAt: new Date(),
      metrics: {
        totalClicks: 0,
        totalSales: 0,
        totalCommission: 0,
        conversionRate: 0
      }
    };

    console.log('\n🔧 PROCESSED CREATOR RECORD:');
    console.log(JSON.stringify({
      id: processedCreator._id,
      creatorCode: processedCreator.creatorCode,
      status: processedCreator.status,
      commissionRate: `${processedCreator.commissionRate}%`,
      minimumPayout: `$${processedCreator.minimumPayout}`,
      createdAt: processedCreator.createdAt.toISOString()
    }, null, 2));

    // STEP 3: Admin Dashboard View
    this.log('\n👑 STEP 3: ADMIN DASHBOARD VIEW', 'step');
    this.log('Admin sees the pending application in the dashboard:', 'info');
    
    const adminDashboardView = {
      creator: {
        id: processedCreator._id,
        displayName: processedCreator.displayName,
        email: processedCreator.email,
        creatorCode: processedCreator.creatorCode,
        status: processedCreator.status,
        commissionRate: processedCreator.commissionRate,
        submissionDate: processedCreator.createdAt.toLocaleDateString(),
        socialFollowing: this.calculateFollowing(processedCreator.socialLinks),
        paymentMethod: processedCreator.paymentInfo.method
      },
      adminActions: [
        'Approve Application',
        'Reject Application', 
        'Suspend Creator',
        'Edit Commission Rate',
        'Edit Minimum Payout',
        'Add Admin Notes',
        'View Full Profile'
      ]
    };

    console.log('\n📊 ADMIN DASHBOARD VIEW:');
    console.log(JSON.stringify(adminDashboardView, null, 2));

    // STEP 4: Admin Approval Process
    this.log('\n✅ STEP 4: ADMIN APPROVAL PROCESS', 'step');
    this.log('Admin reviews and approves the creator:', 'info');
    
    const approvalAction = {
      action: 'approve',
      adminId: 'admin-user-123',
      approvedAt: new Date(),
      commissionRateAdjustment: 12, // Admin increases from 10% to 12%
      notes: 'Strong social media presence with engaged audience. Approved with higher commission rate due to follower count.'
    };

    const approvedCreator = {
      ...processedCreator,
      status: 'approved',
      commissionRate: approvalAction.commissionRateAdjustment,
      approvedAt: approvalAction.approvedAt,
      notes: approvalAction.notes
    };

    console.log('\n✅ APPROVAL ACTION:');
    console.log(JSON.stringify(approvalAction, null, 2));

    // STEP 5: Creator Gets Access
    this.log('\n🎉 STEP 5: CREATOR GETS ACCESS', 'step');
    this.log('Approved creator can now:', 'info');
    
    const creatorCapabilities = [
      'Generate referral links for products',
      'Track clicks and conversions',
      'View earnings dashboard',
      'Request payouts when minimum is reached',
      'Access performance analytics',
      'Update profile and social links'
    ];

    console.log('\n🛠️ CREATOR CAPABILITIES:');
    creatorCapabilities.forEach(capability => {
      console.log(`   • ${capability}`);
    });

    // STEP 6: Referral Link Generation
    this.log('\n🔗 STEP 6: REFERRAL LINK GENERATION', 'step');
    this.log('Creator generates referral links:', 'info');
    
    const referralLink = {
      _id: 'link-id-123',
      creatorId: approvedCreator._id,
      linkCode: this.generateLinkCode(),
      originalUrl: 'https://genzjewelry.com/products/diamond-solitaire-ring',
      shortUrl: `https://genzjewelry.com/ref/${this.generateLinkCode()}`,
      productId: 'product-diamond-ring-001',
      title: 'Emma\'s Pick: Stunning Diamond Solitaire',
      description: 'Perfect for engagements or special occasions',
      isActive: true,
      clickCount: 0,
      conversionCount: 0,
      createdAt: new Date()
    };

    console.log('\n🔗 GENERATED REFERRAL LINK:');
    console.log(JSON.stringify(referralLink, null, 2));

    // STEP 7: Sales and Commission Tracking
    this.log('\n💰 STEP 7: SALES AND COMMISSION TRACKING', 'step');
    this.log('When someone buys through the referral link:', 'info');
    
    const sampleSale = {
      orderId: 'order-789',
      orderAmount: 1299.99,
      commissionRate: approvedCreator.commissionRate,
      commissionAmount: 1299.99 * (approvedCreator.commissionRate / 100),
      clickId: 'click-456',
      conversionDate: new Date()
    };

    const commissionTransaction = {
      _id: 'commission-123',
      creatorId: approvedCreator._id,
      orderId: sampleSale.orderId,
      linkId: referralLink._id,
      clickId: sampleSale.clickId,
      commissionRate: sampleSale.commissionRate,
      orderAmount: sampleSale.orderAmount,
      commissionAmount: sampleSale.commissionAmount,
      status: 'pending',
      type: 'sale',
      createdAt: new Date()
    };

    console.log('\n💵 COMMISSION TRANSACTION:');
    console.log(JSON.stringify({
      orderValue: `$${sampleSale.orderAmount}`,
      commissionRate: `${sampleSale.commissionRate}%`,
      commissionEarned: `$${sampleSale.commissionAmount.toFixed(2)}`,
      status: commissionTransaction.status
    }, null, 2));

    // STEP 8: Admin Commission Management
    this.log('\n👑 STEP 8: ADMIN COMMISSION MANAGEMENT', 'step');
    this.log('Admin can manage commissions:', 'info');
    
    const adminCommissionActions = {
      availableActions: [
        'Approve pending commission',
        'Reject fraudulent commission',
        'Adjust commission amount',
        'Mark as paid',
        'Add notes to transaction'
      ],
      approvalAction: {
        action: 'approve',
        newStatus: 'approved',
        approvedBy: 'admin-user-123',
        approvedAt: new Date(),
        notes: 'Legitimate sale verified'
      }
    };

    console.log('\n👑 ADMIN COMMISSION MANAGEMENT:');
    console.log(JSON.stringify(adminCommissionActions, null, 2));

    // STEP 9: Updated Creator Dashboard
    this.log('\n📈 STEP 9: UPDATED CREATOR DASHBOARD', 'step');
    this.log('Creator dashboard shows updated metrics:', 'info');
    
    const updatedMetrics = {
      totalClicks: 150,
      totalSales: 1,
      totalCommission: sampleSale.commissionAmount,
      conversionRate: (1 / 150) * 100,
      pendingEarnings: sampleSale.commissionAmount,
      eligibleForPayout: sampleSale.commissionAmount >= approvedCreator.minimumPayout,
      lastSaleDate: new Date()
    };

    console.log('\n📊 UPDATED CREATOR METRICS:');
    console.log(JSON.stringify({
      totalClicks: updatedMetrics.totalClicks,
      conversionRate: `${updatedMetrics.conversionRate.toFixed(2)}%`,
      pendingEarnings: `$${updatedMetrics.pendingEarnings.toFixed(2)}`,
      eligibleForPayout: updatedMetrics.eligibleForPayout,
      minimumRequired: `$${approvedCreator.minimumPayout}`
    }, null, 2));

    // STEP 10: Admin Analytics Overview
    this.log('\n📊 STEP 10: ADMIN ANALYTICS OVERVIEW', 'step');
    this.log('Admin dashboard shows comprehensive analytics:', 'info');
    
    const adminAnalytics = {
      creatorOverview: {
        totalCreators: 1,
        pendingApplications: 0,
        activeCreators: 1,
        suspendedCreators: 0
      },
      performanceMetrics: {
        totalCommissionsGenerated: `$${sampleSale.commissionAmount.toFixed(2)}`,
        totalSalesGenerated: `$${sampleSale.orderAmount}`,
        averageConversionRate: `${updatedMetrics.conversionRate.toFixed(2)}%`,
        topPerformer: approvedCreator.displayName
      },
      adminControls: [
        'Approve/Reject creators',
        'Adjust commission rates',
        'Process payouts',
        'Suspend accounts',
        'Export data',
        'View detailed analytics'
      ]
    };

    console.log('\n🎯 ADMIN ANALYTICS OVERVIEW:');
    console.log(JSON.stringify(adminAnalytics, null, 2));

    // Summary
    this.log('\n🎉 WORKFLOW COMPLETE!', 'success');
    this.log('The creator program workflow demonstrates:', 'info');
    console.log('   • Seamless application process');
    console.log('   • Comprehensive admin control and approval workflow'); 
    console.log('   • Real-time tracking and analytics');
    console.log('   • Automated commission calculation');
    console.log('   • Flexible payout management');
    console.log('   • Full audit trail and admin oversight');

    return {
      creator: approvedCreator,
      referralLink,
      commissionTransaction,
      metrics: updatedMetrics,
      adminControls: adminAnalytics.adminControls
    };
  }

  generateCreatorCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  generateLinkCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  calculateFollowing(socialLinks) {
    // Mock calculation based on social presence
    let estimatedFollowing = 0;
    if (socialLinks.instagram) estimatedFollowing += 150000;
    if (socialLinks.tiktok) estimatedFollowing += 125000;
    if (socialLinks.youtube) estimatedFollowing += 75000;
    if (socialLinks.twitter) estimatedFollowing += 25000;
    return estimatedFollowing;
  }
}

// Run the demonstration
const demo = new CreatorWorkflowDemo();
demo.demonstrateWorkflow().then(result => {
  console.log('\n📋 DEMONSTRATION DATA GENERATED - Ready for admin review!');
}).catch(error => {
  console.error('Demo error:', error);
});