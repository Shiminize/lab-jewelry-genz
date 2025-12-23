/**
 * Seed Admin User Script
 * Creates an admin user for accessing the Creator Management Dashboard
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Admin user schema (simplified version)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['customer', 'creator', 'admin'], default: 'customer' },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  emailVerified: { type: Boolean, default: false },
  providers: [{
    provider: String,
    providerId: String,
    connected: Date
  }],
  gdprConsent: {
    consented: { type: Boolean, default: false },
    consentDate: Date,
    ipAddress: String,
    version: { type: String, default: '1.0' }
  },
  preferences: {
    emailNotifications: {
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
      newsletter: { type: Boolean, default: false },
      priceAlerts: { type: Boolean, default: false },
      creatorProgram: { type: Boolean, default: false }
    },
    smsNotifications: {
      orderUpdates: { type: Boolean, default: false },
      deliveryAlerts: { type: Boolean, default: false }
    },
    privacy: {
      profileVisibility: { type: String, default: 'private' },
      allowDataCollection: { type: Boolean, default: false },
      allowPersonalization: { type: Boolean, default: false }
    },
    currency: { type: String, default: 'USD' },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'America/New_York' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function seedAdminUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/glowglitch-dev';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@glowglitch.com';
    const existingAdmin = await User.findOne({ role: 'admin', email: adminEmail });
    
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);
      console.log(`Status: ${existingAdmin.status}`);
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active',
      emailVerified: true,
      providers: [{
        provider: 'credentials',
        providerId: 'admin',
        connected: new Date()
      }],
      gdprConsent: {
        consented: true,
        consentDate: new Date(),
        ipAddress: '127.0.0.1',
        version: '1.0'
      },
      preferences: {
        emailNotifications: {
          orderUpdates: true,
          promotions: false,
          newsletter: false,
          priceAlerts: false,
          creatorProgram: false
        },
        smsNotifications: {
          orderUpdates: false,
          deliveryAlerts: false
        },
        privacy: {
          profileVisibility: 'private',
          allowDataCollection: false,
          allowPersonalization: false
        },
        currency: 'USD',
        language: 'en',
        timezone: 'America/New_York'
      }
    });
    
    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Role: admin`);
    console.log(`Status: active`);
    
  } catch (error) {
    console.error('❌ Failed to seed admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding
seedAdminUser().catch(console.error);