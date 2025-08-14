/**
 * User Service Layer for Database Operations
 * Handles user CRUD operations with MongoDB
 * Follows CLAUDE_RULES.md data model specifications
 */

import { MongoClient, Db, Collection } from 'mongodb'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { z } from 'zod'

import type { 
  User, 
  UserRole, 
  AccountStatus, 
  UserPreferences,
  UserAddress,
  CreatorProfile 
} from '@/types/auth'

// Database connection
let client: MongoClient
let db: Db
let usersCollection: Collection<User>

// Initialize database connection
async function connectDB() {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()
    db = client.db('glowglitch')
    usersCollection = db.collection<User>('users')
    
    // Create indexes for optimal performance
    await createUserIndexes()
  }
  return { client, db, usersCollection }
}

// Create database indexes
async function createUserIndexes() {
  try {
    await usersCollection.createIndex({ email: 1 }, { unique: true })
    await usersCollection.createIndex({ 'creatorProfile.referralCode': 1 }, { sparse: true })
    await usersCollection.createIndex({ role: 1 })
    await usersCollection.createIndex({ status: 1 })
    await usersCollection.createIndex({ createdAt: 1 })
    await usersCollection.createIndex({ lastActiveAt: 1 })
    await usersCollection.createIndex({ emailVerificationToken: 1 }, { sparse: true })
    await usersCollection.createIndex({ passwordResetToken: 1 }, { sparse: true })
    
    console.log('User indexes created successfully')
  } catch (error) {
    console.error('Error creating user indexes:', error)
  }
}

// Default user preferences
const defaultPreferences: UserPreferences = {
  emailNotifications: {
    marketing: false,
    orderUpdates: true,
    newProducts: false,
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

// User creation interface
interface CreateUserData {
  email: string
  password?: string
  firstName: string
  lastName: string
  role?: UserRole
  status?: AccountStatus
  emailVerified?: boolean
  providers?: Array<{
    provider: string
    providerId: string
    connected: Date
  }>
  profileImage?: string
  referralCode?: string
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    await connectDB()
    const user = await usersCollection.findOne({ 
      email: email.toLowerCase() 
    })
    return user
  } catch (error) {
    console.error('Error getting user by email:', error)
    throw new Error('DATABASE_ERROR')
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    await connectDB()
    const user = await usersCollection.findOne({ _id: id as any })
    return user
  } catch (error) {
    console.error('Error getting user by ID:', error)
    throw new Error('DATABASE_ERROR')
  }
}

// Create new user
export async function createUser(userData: CreateUserData): Promise<User> {
  try {
    await connectDB()
    
    // Check if user already exists
    const existingUser = await getUserByEmail(userData.email)
    if (existingUser) {
      throw new Error('USER_EXISTS')
    }
    
    // Hash password if provided
    let hashedPassword: string | undefined
    if (userData.password) {
      hashedPassword = await bcrypt.hash(userData.password, 12)
    }
    
    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex')
    
    // Create user object
    const now = new Date()
    const newUser: Omit<User, '_id'> = {
      email: userData.email.toLowerCase(),
      emailVerified: userData.emailVerified || false,
      emailVerificationToken: !userData.emailVerified ? emailVerificationToken : undefined,
      emailVerificationExpires: !userData.emailVerified ? new Date(now.getTime() + 24 * 60 * 60 * 1000) : undefined,
      
      firstName: userData.firstName,
      lastName: userData.lastName,
      displayName: `${userData.firstName} ${userData.lastName}`,
      profileImage: userData.profileImage,
      
      password: hashedPassword,
      providers: userData.providers || [],
      
      role: userData.role || 'customer',
      status: userData.status || (userData.emailVerified ? 'active' : 'pending-verification'),
      
      addresses: [],
      preferences: defaultPreferences,
      
      wishlistIds: [],
      
      lastLogin: undefined,
      loginAttempts: 0,
      twoFactorEnabled: false,
      
      gdprConsent: {
        accepted: true,
        acceptedAt: now,
        version: '1.0',
        ipAddress: 'unknown' // Would be passed from request
      },
      dataRetentionConsent: true,
      marketingConsent: false,
      
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now
    }
    
    // Add creator profile if referral code provided
    if (userData.referralCode) {
      // Validate referral code exists
      const referrer = await usersCollection.findOne({
        'creatorProfile.referralCode': userData.referralCode
      })
      
      if (referrer) {
        // User was referred by a creator, but they start as customer
        // The creator will get attribution when user makes first purchase
      }
    }
    
    // Insert user
    const result = await usersCollection.insertOne(newUser as any)
    
    // Fetch and return created user
    const createdUser = await usersCollection.findOne({ _id: result.insertedId })
    if (!createdUser) {
      throw new Error('USER_CREATION_FAILED')
    }
    
    return createdUser
  } catch (error) {
    console.error('Error creating user:', error)
    if (error instanceof Error && error.message === 'USER_EXISTS') {
      throw error
    }
    throw new Error('DATABASE_ERROR')
  }
}

// Update user last login
export async function updateUserLastLogin(userId: string, success: boolean): Promise<void> {
  try {
    await connectDB()
    
    const now = new Date()
    
    if (success) {
      // Reset login attempts on successful login
      await usersCollection.updateOne(
        { _id: userId as any },
        {
          $set: {
            lastLogin: now,
            lastActiveAt: now,
            loginAttempts: 0,
            lockedUntil: undefined
          }
        }
      )
    } else {
      // Increment login attempts on failed login
      const user = await getUserById(userId)
      if (user) {
        const newAttempts = user.loginAttempts + 1
        const lockUntil = newAttempts >= 5 ? new Date(now.getTime() + 15 * 60 * 1000) : undefined // 15 minutes
        
        await usersCollection.updateOne(
          { _id: userId as any },
          {
            $set: {
              loginAttempts: newAttempts,
              lockedUntil: lockUntil,
              lastActiveAt: now
            }
          }
        )
      }
    }
  } catch (error) {
    console.error('Error updating user last login:', error)
    throw new Error('DATABASE_ERROR')
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string, 
  updates: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'dateOfBirth' | 'preferences'>>
): Promise<User | null> {
  try {
    await connectDB()
    
    const updateData: any = {
      ...updates,
      updatedAt: new Date()
    }
    
    // Update display name if first/last name changed
    if (updates.firstName || updates.lastName) {
      const user = await getUserById(userId)
      if (user) {
        updateData.displayName = `${updates.firstName || user.firstName} ${updates.lastName || user.lastName}`
      }
    }
    
    const result = await usersCollection.findOneAndUpdate(
      { _id: userId as any },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    
    return result.value
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw new Error('DATABASE_ERROR')
  }
}

// Add user address
export async function addUserAddress(userId: string, address: Omit<UserAddress, 'id' | 'createdAt' | 'updatedAt'>): Promise<User | null> {
  try {
    await connectDB()
    
    const newAddress: UserAddress = {
      ...address,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // If this is set as default, unset other defaults
    if (address.isDefault) {
      await usersCollection.updateOne(
        { _id: userId as any },
        { $set: { 'addresses.$[].isDefault': false } }
      )
    }
    
    const result = await usersCollection.findOneAndUpdate(
      { _id: userId as any },
      { 
        $push: { addresses: newAddress },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    )
    
    return result.value
  } catch (error) {
    console.error('Error adding user address:', error)
    throw new Error('DATABASE_ERROR')
  }
}

// Update user address
export async function updateUserAddress(userId: string, addressId: string, updates: Partial<UserAddress>): Promise<User | null> {
  try {
    await connectDB()
    
    const updateData: any = {}
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'createdAt') {
        updateData[`addresses.$.${key}`] = (updates as any)[key]
      }
    })
    updateData['addresses.$.updatedAt'] = new Date()
    updateData.updatedAt = new Date()
    
    // If setting as default, unset other defaults first
    if (updates.isDefault) {
      await usersCollection.updateOne(
        { _id: userId as any },
        { $set: { 'addresses.$[].isDefault': false } }
      )
    }
    
    const result = await usersCollection.findOneAndUpdate(
      { _id: userId as any, 'addresses.id': addressId },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    
    return result.value
  } catch (error) {
    console.error('Error updating user address:', error)
    throw new Error('DATABASE_ERROR')
  }
}

// Delete user address
export async function deleteUserAddress(userId: string, addressId: string): Promise<User | null> {
  try {
    await connectDB()
    
    const result = await usersCollection.findOneAndUpdate(
      { _id: userId as any },
      { 
        $pull: { addresses: { id: addressId } },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    )
    
    return result.value
  } catch (error) {
    console.error('Error deleting user address:', error)
    throw new Error('DATABASE_ERROR')
  }
}

// Verify email
export async function verifyEmail(token: string): Promise<User | null> {
  try {
    await connectDB()
    
    const user = await usersCollection.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    })
    
    if (!user) {
      throw new Error('INVALID_TOKEN')
    }
    
    const result = await usersCollection.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          emailVerified: true,
          status: 'active',
          updatedAt: new Date()
        },
        $unset: {
          emailVerificationToken: '',
          emailVerificationExpires: ''
        }
      },
      { returnDocument: 'after' }
    )
    
    return result.value
  } catch (error) {
    console.error('Error verifying email:', error)
    if (error instanceof Error && error.message === 'INVALID_TOKEN') {
      throw error
    }
    throw new Error('DATABASE_ERROR')
  }
}

// Generate password reset token
export async function generatePasswordResetToken(email: string): Promise<string | null> {
  try {
    await connectDB()
    
    const user = await getUserByEmail(email)
    if (!user) {
      return null // Don't reveal if email exists
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetToken: resetToken,
          passwordResetExpires: expires,
          updatedAt: new Date()
        }
      }
    )
    
    return resetToken
  } catch (error) {
    console.error('Error generating password reset token:', error)
    throw new Error('DATABASE_ERROR')
  }
}

// Reset password
export async function resetPassword(token: string, newPassword: string): Promise<User | null> {
  try {
    await connectDB()
    
    const user = await usersCollection.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    })
    
    if (!user) {
      throw new Error('INVALID_TOKEN')
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    const result = await usersCollection.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date()
        },
        $unset: {
          passwordResetToken: '',
          passwordResetExpires: ''
        }
      },
      { returnDocument: 'after' }
    )
    
    return result.value
  } catch (error) {
    console.error('Error resetting password:', error)
    if (error instanceof Error && error.message === 'INVALID_TOKEN') {
      throw error
    }
    throw new Error('DATABASE_ERROR')
  }
}

// Update password
export async function updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
  try {
    await connectDB()
    
    const user = await getUserById(userId)
    if (!user || !user.password) {
      throw new Error('USER_NOT_FOUND')
    }
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isValidPassword) {
      throw new Error('INVALID_PASSWORD')
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    await usersCollection.updateOne(
      { _id: userId as any },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date()
        }
      }
    )
    
    return true
  } catch (error) {
    console.error('Error updating password:', error)
    if (error instanceof Error && ['USER_NOT_FOUND', 'INVALID_PASSWORD'].includes(error.message)) {
      throw error
    }
    throw new Error('DATABASE_ERROR')
  }
}

// Export GDPR data
export async function exportUserData(userId: string): Promise<any> {
  try {
    await connectDB()
    
    const user = await getUserById(userId)
    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }
    
    // Remove sensitive fields
    const { password, passwordResetToken, emailVerificationToken, twoFactorSecret, ...exportData } = user
    
    // TODO: Include order history, reviews, customizations, etc.
    const userData = {
      user: exportData,
      orders: [], // Would fetch from orders collection
      reviews: [], // Would fetch from reviews collection
      customizations: [], // Would fetch from customizations collection
      exportedAt: new Date(),
      format: 'json'
    }
    
    return userData
  } catch (error) {
    console.error('Error exporting user data:', error)
    throw new Error('DATABASE_ERROR')
  }
}

// Delete user (GDPR right to be forgotten)
export async function deleteUser(userId: string, retainOrderHistory: boolean = false): Promise<boolean> {
  try {
    await connectDB()
    
    const user = await getUserById(userId)
    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }
    
    if (retainOrderHistory) {
      // Anonymize user data but keep order history
      await usersCollection.updateOne(
        { _id: userId as any },
        {
          $set: {
            email: `deleted_${userId}@deleted.com`,
            firstName: 'Deleted',
            lastName: 'User',
            displayName: 'Deleted User',
            phone: undefined,
            profileImage: undefined,
            status: 'inactive' as AccountStatus,
            addresses: [],
            updatedAt: new Date()
          },
          $unset: {
            password: '',
            dateOfBirth: '',
            emailVerificationToken: '',
            passwordResetToken: '',
            twoFactorSecret: ''
          }
        }
      )
    } else {
      // Completely delete user
      await usersCollection.deleteOne({ _id: userId as any })
    }
    
    return true
  } catch (error) {
    console.error('Error deleting user:', error)
    throw new Error('DATABASE_ERROR')
  }
}

// Close database connection
export async function closeDB() {
  if (client) {
    await client.close()
  }
}