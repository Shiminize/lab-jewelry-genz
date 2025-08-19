/**
 * Creator Program Test Data Seeder
 * Creates sample creator applications and data for demonstration
 */

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// MongoDB connection
const connectToDatabase = async () => {
  try {
    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/glowglitch-dev'
    await mongoose.connect(connectionString)
    console.log('Connected to MongoDB for creator seeding')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

// Creator Schema (simplified for seeding)
const CreatorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creatorCode: { type: String, required: true, unique: true, uppercase: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true },
  profileImage: { type: String },
  bio: { type: String, maxlength: 500 },
  socialLinks: {
    instagram: { type: String },
    tiktok: { type: String },
    youtube: { type: String },
    twitter: { type: String },
    website: { type: String }
  },
  commissionRate: { type: Number, required: true, min: 0, max: 50, default: 10 },
  minimumPayout: { type: Number, required: true, default: 50 },
  paymentInfo: {
    method: { type: String, enum: ['paypal', 'bank', 'stripe'], required: true },
    details: { type: String, required: true }
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'suspended', 'inactive'], 
    default: 'pending' 
  },
  metrics: {
    totalClicks: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalCommission: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    lastSaleDate: { type: Date }
  },
  settings: {
    emailNotifications: { type: Boolean, default: true },
    publicProfile: { type: Boolean, default: true },
    allowDirectMessages: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  suspendedAt: { type: Date },
  notes: { type: String }
}, {
  timestamps: true
})

// Referral Link Schema
const ReferralLinkSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
  linkCode: { type: String, required: true, unique: true },
  originalUrl: { type: String, required: true },
  shortUrl: { type: String, required: true, unique: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  customAlias: { type: String },
  title: { type: String },
  description: { type: String, maxlength: 200 },
  isActive: { type: Boolean, default: true },
  clickCount: { type: Number, default: 0 },
  uniqueClickCount: { type: Number, default: 0 },
  conversionCount: { type: Number, default: 0 },
  lastClickedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
}, {
  timestamps: true
})

// Commission Transaction Schema
const CommissionTransactionSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  linkId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReferralLink', required: true },
  clickId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReferralClick', required: true },
  commissionRate: { type: Number, required: true },
  orderAmount: { type: Number, required: true },
  commissionAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'paid', 'cancelled'], 
    default: 'pending' 
  },
  type: { type: String, enum: ['sale', 'return', 'adjustment'], default: 'sale' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  paidAt: { type: Date }
})

const Creator = mongoose.models.Creator || mongoose.model('Creator', CreatorSchema)
const ReferralLink = mongoose.models.ReferralLink || mongoose.model('ReferralLink', ReferralLinkSchema)
const CommissionTransaction = mongoose.models.CommissionTransaction || mongoose.model('CommissionTransaction', CommissionTransactionSchema)

// Test creator data
const testCreators = [
  {
    displayName: 'Emma StyleGuru',
    email: 'emma@styleguru.com',
    bio: 'Gen-Z fashion creator passionate about sustainable jewelry. Spreading good vibes and ethical choices to my 52K followers! ✨',
    socialLinks: {
      instagram: '@emmastyles',
      tiktok: '@emmafashion',
      youtube: 'Emma StyleGuru',
      twitter: '@emmastyle',
      website: 'https://emmastyle.com'
    },
    commissionRate: 15,
    status: 'approved',
    approvedAt: new Date('2024-08-01'),
    metrics: {
      totalClicks: 1247,
      totalSales: 47,
      totalCommission: 627.53,
      conversionRate: 3.77
    },
    notes: 'High-performing creator with strong engagement rate. Approved with 15% commission due to proven track record.'
  },
  {
    displayName: 'Alex Jewelry Lover',
    email: 'alex@jewelrylover.com',
    bio: 'Minimalist jewelry enthusiast sharing authentic reviews and sustainable fashion choices with my community.',
    socialLinks: {
      instagram: '@alexjewelry',
      tiktok: '@alexminimal',
      website: 'https://alexjewelry.blog'
    },
    commissionRate: 12,
    status: 'approved',
    approvedAt: new Date('2024-08-05'),
    metrics: {
      totalClicks: 892,
      totalSales: 23,
      totalCommission: 412.75,
      conversionRate: 2.58
    }
  },
  {
    displayName: 'Maya Eco Fashion',
    email: 'maya@ecofashion.com',
    bio: 'Sustainability advocate and fashion creator. Promoting ethical jewelry and eco-conscious lifestyle choices.',
    socialLinks: {
      instagram: '@mayaecofashion',
      tiktok: '@mayasustainable',
      youtube: 'Maya Eco Life'
    },
    commissionRate: 18,
    status: 'approved',
    approvedAt: new Date('2024-08-10'),
    metrics: {
      totalClicks: 1543,
      totalSales: 67,
      totalCommission: 892.45,
      conversionRate: 4.34
    },
    notes: 'Top-tier creator with excellent content quality and high conversion rates. Platinum commission rate.'
  },
  {
    displayName: 'Jamie Style Vibes',
    email: 'jamie@stylevibes.com',
    bio: 'Fashion content creator sharing the latest trends and style inspiration for Gen-Z.',
    socialLinks: {
      instagram: '@jamiestylevibes',
      tiktok: '@jamievibes'
    },
    commissionRate: 10,
    status: 'pending',
    metrics: {
      totalClicks: 0,
      totalSales: 0,
      totalCommission: 0,
      conversionRate: 0
    },
    notes: 'New application pending review. Good social media presence but needs verification of follower engagement.'
  },
  {
    displayName: 'Riley Fashion Forward',
    email: 'riley@fashionforward.com',
    bio: 'Body jewelry specialist with sensitive skin expertise. Helping others find hypoallergenic, beautiful pieces.',
    socialLinks: {
      instagram: '@rileysfashion',
      tiktok: '@rileyforward',
      website: 'https://rileyfashion.com'
    },
    commissionRate: 14,
    status: 'suspended',
    suspendedAt: new Date('2024-08-15'),
    metrics: {
      totalClicks: 456,
      totalSales: 12,
      totalCommission: 156.78,
      conversionRate: 2.63
    },
    notes: 'Suspended due to content guideline violations. Can reapply in 30 days after reviewing guidelines.'
  }
]

// Generate creator codes
const generateCreatorCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate link codes
const generateLinkCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Seed creators
const seedCreators = async () => {
  console.log('🌱 Seeding creator data...')
  
  // Clear existing data
  await Creator.deleteMany({})
  await ReferralLink.deleteMany({})
  await CommissionTransaction.deleteMany({})
  
  const createdCreators = []
  
  for (const creatorData of testCreators) {
    // Generate unique creator code
    let creatorCode, isUnique = false
    do {
      creatorCode = generateCreatorCode()
      const existing = await Creator.findOne({ creatorCode })
      if (!existing) isUnique = true
    } while (!isUnique)
    
    // Encrypt payment details
    const encryptedPaymentDetails = await bcrypt.hash('test@paypal.com', 12)
    
    const creator = new Creator({
      ...creatorData,
      creatorCode,
      paymentInfo: {
        method: 'paypal',
        details: encryptedPaymentDetails
      }
    })
    
    await creator.save()
    createdCreators.push(creator)
    console.log(`✅ Created creator: ${creator.displayName} (${creator.creatorCode})`)
  }
  
  // Create referral links for approved creators
  console.log('🔗 Creating referral links...')
  
  for (const creator of createdCreators) {
    if (creator.status === 'approved') {
      const linkCount = Math.floor(Math.random() * 5) + 2 // 2-6 links per creator
      
      for (let i = 0; i < linkCount; i++) {
        const linkCode = generateLinkCode()
        const productTypes = ['rings', 'necklaces', 'earrings', 'bracelets']
        const productType = productTypes[Math.floor(Math.random() * productTypes.length)]
        
        const link = new ReferralLink({
          creatorId: creator._id,
          linkCode,
          originalUrl: `https://glowglitch.com/products/${productType}?ref=${creator.creatorCode}`,
          shortUrl: `https://glowglitch.com/r/${linkCode}`,
          customAlias: `${creator.displayName.toLowerCase().replace(/\s+/g, '-')}-${productType}`,
          title: `${creator.displayName}'s ${productType.charAt(0).toUpperCase() + productType.slice(1)}`,
          description: `Curated ${productType} collection by ${creator.displayName}`,
          clickCount: Math.floor(Math.random() * 500) + 50,
          uniqueClickCount: Math.floor(Math.random() * 300) + 30,
          conversionCount: Math.floor(Math.random() * 20) + 2,
          lastClickedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Last 7 days
        })
        
        await link.save()
      }
    }
  }
  
  // Create commission transactions for approved creators
  console.log('💰 Creating commission transactions...')
  
  for (const creator of createdCreators) {
    if (creator.status === 'approved' && creator.metrics.totalSales > 0) {
      const transactionCount = creator.metrics.totalSales
      
      for (let i = 0; i < transactionCount; i++) {
        const orderAmount = Math.floor(Math.random() * 200) + 50 // $50-$250
        const commissionAmount = Math.round(orderAmount * (creator.commissionRate / 100) * 100) / 100
        
        const transaction = new CommissionTransaction({
          creatorId: creator._id,
          orderId: new mongoose.Types.ObjectId(), // Dummy order ID
          linkId: new mongoose.Types.ObjectId(), // Dummy link ID
          clickId: new mongoose.Types.ObjectId(), // Dummy click ID
          commissionRate: creator.commissionRate,
          orderAmount,
          commissionAmount,
          status: Math.random() > 0.2 ? 'approved' : 'pending', // 80% approved
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days
        })
        
        await transaction.save()
      }
    }
  }
  
  console.log('✨ Creator seeding completed!')
  console.log(`📊 Created ${createdCreators.length} creators`)
  console.log(`🔗 Created referral links for approved creators`)
  console.log(`💰 Created commission transactions`)
}

// Run seeding
const main = async () => {
  try {
    await connectToDatabase()
    await seedCreators()
    console.log('🎉 All done! Creator data seeded successfully.')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { seedCreators }