/**
 * Database Migration and Seeding Utilities
 * Handles database schema migrations, data seeding, and initial setup
 * Ensures consistent database state across environments
 */

import mongoose from 'mongoose'
import connectToDatabase from './mongoose'
import { dbUtils } from './database-utils'

// Import all models for seeding
import { UserModel } from './schemas/user.schema'
import { ProductModel } from './schemas/product.schema'
import { OrderModel } from './schemas/order.schema'
import { CartModel } from './schemas/cart.schema'
import { WishlistModel } from './schemas/wishlist.schema'
import { CustomizationModel } from './schemas/customization.schema'
import { ReviewModel, ProductRatingModel } from './schemas/review.schema'
import { ReferralModel, CommissionModel } from './schemas/referral.schema'
import { AuditLogModel } from './schemas/audit.schema'

// Migration interface
export interface Migration {
  version: string
  description: string
  up: () => Promise<void>
  down: () => Promise<void>
}

// Migration record interface
interface MigrationRecord {
  version: string
  description: string
  executedAt: Date
  executionTime: number
  status: 'completed' | 'failed' | 'rolled_back'
  error?: string
}

// Database seeder class
export class DatabaseSeeder {
  private static instance: DatabaseSeeder

  private constructor() {}

  public static getInstance(): DatabaseSeeder {
    if (!DatabaseSeeder.instance) {
      DatabaseSeeder.instance = new DatabaseSeeder()
    }
    return DatabaseSeeder.instance
  }

  /**
   * Seed initial admin user
   */
  async seedAdminUser(): Promise<void> {
    try {
      const existingAdmin = await UserModel.findOne({ role: 'admin' })
      
      if (!existingAdmin) {
        const adminUser = new UserModel({
          email: process.env.ADMIN_EMAIL || 'admin@glowglitch.com',
          password: process.env.ADMIN_PASSWORD || 'AdminPassword123!',
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
            accepted: true,
            acceptedAt: new Date(),
            version: '1.0',
            ipAddress: '127.0.0.1'
          },
          preferences: {
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
        })
        
        await adminUser.save()

      } else {

      }
    } catch (error) {
      console.error('❌ Failed to seed admin user:', error)
      throw error
    }
  }

  /**
   * Seed sample products
   */
  async seedSampleProducts(): Promise<void> {
    try {
      const existingProducts = await ProductModel.countDocuments()
      
      if (existingProducts === 0) {
        const sampleProducts = [
          {
            name: 'Classic Solitaire Engagement Ring',
            description: 'Timeless elegance meets modern craftsmanship in this stunning solitaire engagement ring featuring a brilliant lab-grown diamond.',
            category: 'rings',
            subcategory: 'engagement-rings',
            pricing: {
              basePrice: 1299.99,
              currency: 'USD'
            },
            inventory: {
              sku: 'RING-SOL-001',
              quantity: 50,
              available: 50,
              lowStockThreshold: 5,
              isCustomMade: true,
              leadTime: { min: 7, max: 14 }
            },
            media: {
              primary: '/images/products/solitaire-ring-main.jpg',
              gallery: [
                '/images/products/solitaire-ring-1.jpg',
                '/images/products/solitaire-ring-2.jpg',
                '/images/products/solitaire-ring-3.jpg'
              ],
              thumbnail: '/images/products/solitaire-ring-thumb.jpg',
              model3D: {
                glb: '/models/solitaire-ring.glb',
                textures: ['/textures/gold-material.jpg', '/textures/diamond-material.jpg'],
                animations: ['/animations/ring-rotate.json']
              },
              ar: {
                usdz: '/models/solitaire-ring.usdz',
                glb: '/models/solitaire-ring-ar.glb'
              }
            },
            customization: {
              materials: [
                {
                  id: 'gold-14k-yellow',
                  type: 'gold',
                  name: '14K Yellow Gold',
                  purity: '14K',
                  priceMultiplier: 1.0,
                  description: 'Classic 14K yellow gold with warm tone',
                  sustainability: {
                    recycled: true,
                    ethicallySourced: true,
                    carbonNeutral: false
                  }
                },
                {
                  id: 'gold-14k-white',
                  type: 'white-gold',
                  name: '14K White Gold',
                  purity: '14K',
                  priceMultiplier: 1.1,
                  description: 'Modern 14K white gold with rhodium plating',
                  sustainability: {
                    recycled: true,
                    ethicallySourced: true,
                    carbonNeutral: false
                  }
                }
              ],
              gemstones: [
                {
                  id: 'diamond-1ct-d-vvs1',
                  type: 'diamond',
                  isLabGrown: true,
                  carat: 1.0,
                  color: 'D',
                  clarity: 'VVS1',
                  cut: 'Round Brilliant',
                  certification: {
                    agency: 'IGI',
                    certificateNumber: 'LG12345678'
                  },
                  priceMultiplier: 1.0,
                  sustainability: {
                    labGrown: true,
                    conflictFree: true,
                    traceable: true
                  }
                }
              ],
              sizes: [
                {
                  id: 'ring-size-6',
                  category: 'rings',
                  value: '6',
                  measurement: { unit: 'mm', value: 16.5 },
                  availability: true,
                  priceAdjustment: 0
                },
                {
                  id: 'ring-size-7',
                  category: 'rings',
                  value: '7',
                  measurement: { unit: 'mm', value: 17.3 },
                  availability: true,
                  priceAdjustment: 0
                }
              ],
              engraving: {
                available: true,
                maxCharacters: 25,
                fonts: ['Script', 'Block', 'Cursive'],
                positions: ['inside'],
                pricePerCharacter: 2.5
              },
              personalizations: {
                birthstones: false,
                initials: true,
                dates: true
              }
            },
            seo: {
              slug: 'classic-solitaire-engagement-ring',
              metaTitle: 'Classic Solitaire Engagement Ring | Lab-Grown Diamond',
              metaDescription: 'Discover our stunning classic solitaire engagement ring featuring ethically sourced lab-grown diamonds. Customizable and conflict-free.',
              keywords: ['solitaire ring', 'engagement ring', 'lab-grown diamond', 'ethical jewelry'],
              openGraph: {
                title: 'Classic Solitaire Engagement Ring',
                description: 'Timeless elegance with lab-grown diamonds',
                image: '/images/products/solitaire-ring-og.jpg'
              }
            },
            certifications: {
              hallmarks: ['14K', 'IGI'],
              gemCertificates: ['LG12345678'],
              sustainabilityCerts: ['Certified Carbon Neutral'],
              qualityAssurance: {
                warrantyPeriod: 2,
                returnPolicy: 30,
                careInstructions: [
                  'Clean with mild soap and water',
                  'Store in provided jewelry box',
                  'Avoid harsh chemicals and extreme temperatures'
                ]
              }
            },
            metadata: {
              featured: true,
              bestseller: false,
              newArrival: true,
              limitedEdition: false,
              status: 'active',
              collections: ['Bridal', 'Signature'],
              tags: ['sustainable', 'customizable', 'lab-grown', 'engagement'],
              difficulty: 'beginner'
            },
            analytics: {
              views: 0,
              customizations: 0,
              purchases: 0,
              conversionRate: 0,
              averageTimeOnPage: 0
            }
          },
          {
            name: 'Delicate Tennis Necklace',
            description: 'A stunning tennis necklace featuring perfectly matched lab-grown diamonds set in recycled gold.',
            category: 'necklaces',
            subcategory: 'statement-necklaces',
            pricing: {
              basePrice: 899.99,
              currency: 'USD'
            },
            inventory: {
              sku: 'NECK-TEN-001',
              quantity: 25,
              available: 25,
              lowStockThreshold: 3,
              isCustomMade: false,
              leadTime: { min: 3, max: 7 }
            },
            media: {
              primary: '/images/products/tennis-necklace-main.jpg',
              gallery: [
                '/images/products/tennis-necklace-1.jpg',
                '/images/products/tennis-necklace-2.jpg'
              ],
              thumbnail: '/images/products/tennis-necklace-thumb.jpg',
              model3D: {
                glb: '/models/tennis-necklace.glb',
                textures: ['/textures/gold-material.jpg', '/textures/diamond-material.jpg']
              }
            },
            customization: {
              materials: [
                {
                  id: 'gold-14k-yellow',
                  type: 'gold',
                  name: '14K Yellow Gold',
                  purity: '14K',
                  priceMultiplier: 1.0,
                  description: 'Classic 14K yellow gold',
                  sustainability: {
                    recycled: true,
                    ethicallySourced: true,
                    carbonNeutral: false
                  }
                }
              ],
              gemstones: [
                {
                  id: 'diamond-total-3ct',
                  type: 'diamond',
                  isLabGrown: true,
                  carat: 3.0,
                  color: 'F',
                  clarity: 'VS1',
                  cut: 'Round Brilliant',
                  certification: {
                    agency: 'IGI'
                  },
                  priceMultiplier: 1.0,
                  sustainability: {
                    labGrown: true,
                    conflictFree: true,
                    traceable: true
                  }
                }
              ],
              sizes: [
                {
                  id: 'necklace-16inch',
                  category: 'necklaces',
                  value: '16 inches',
                  measurement: { unit: 'inches', value: 16 },
                  availability: true,
                  priceAdjustment: 0
                },
                {
                  id: 'necklace-18inch',
                  category: 'necklaces',
                  value: '18 inches',
                  measurement: { unit: 'inches', value: 18 },
                  availability: true,
                  priceAdjustment: 50
                }
              ],
              engraving: {
                available: false
              }
            },
            seo: {
              slug: 'delicate-tennis-necklace',
              metaTitle: 'Delicate Tennis Necklace | Lab-Grown Diamonds',
              metaDescription: 'Elegant tennis necklace with perfectly matched lab-grown diamonds. Sustainable luxury jewelry.',
              keywords: ['tennis necklace', 'lab-grown diamonds', 'sustainable jewelry'],
              openGraph: {
                title: 'Delicate Tennis Necklace',
                description: 'Sustainable luxury with lab-grown diamonds',
                image: '/images/products/tennis-necklace-og.jpg'
              }
            },
            certifications: {
              hallmarks: ['14K'],
              gemCertificates: [],
              sustainabilityCerts: ['Recycled Gold Certified'],
              qualityAssurance: {
                warrantyPeriod: 1,
                returnPolicy: 30,
                careInstructions: [
                  'Clean gently with soft cloth',
                  'Store flat to prevent tangling'
                ]
              }
            },
            metadata: {
              featured: false,
              bestseller: true,
              newArrival: false,
              limitedEdition: false,
              status: 'active',
              collections: ['Everyday', 'Signature'],
              tags: ['sustainable', 'elegant', 'lab-grown'],
              difficulty: 'beginner'
            }
          }
        ]

        for (const productData of sampleProducts) {
          const product = new ProductModel(productData)
          await product.save()
        }

      } else {

      }
    } catch (error) {
      console.error('❌ Failed to seed sample products:', error)
      throw error
    }
  }

  /**
   * Seed sample creator user
   */
  async seedCreatorUser(): Promise<void> {
    try {
      const existingCreator = await UserModel.findOne({ role: 'creator' })
      
      if (!existingCreator) {
        const creatorUser = new UserModel({
          email: 'creator@example.com',
          password: 'CreatorPassword123!',
          firstName: 'Jane',
          lastName: 'Creator',
          role: 'creator',
          status: 'active',
          emailVerified: true,
          providers: [{
            provider: 'credentials',
            providerId: 'creator',
            connected: new Date()
          }],
          creatorProfile: {
            status: 'approved',
            referralCode: 'CREATOR1',
            commissionRate: 10,
            socialMedia: {
              instagram: '@janecreator',
              tiktok: '@janecreator'
            },
            bio: 'Jewelry enthusiast and style influencer',
            specialties: ['rings', 'necklaces'],
            applicationDate: new Date(),
            approvalDate: new Date(),
            totalReferrals: 0,
            totalCommissionEarned: 0,
            analytics: {
              clicks: 0,
              conversions: 0,
              conversionRate: 0,
              revenue: 0
            },
            brandPartnership: {
              tier: 'bronze',
              benefits: ['10% commission', 'Early access to new products'],
              exclusiveProducts: []
            }
          },
          gdprConsent: {
            accepted: true,
            acceptedAt: new Date(),
            version: '1.0',
            ipAddress: '127.0.0.1'
          }
        })
        
        await creatorUser.save()

      } else {

      }
    } catch (error) {
      console.error('❌ Failed to seed creator user:', error)
      throw error
    }
  }

  /**
   * Run all seeders
   */
  async seedAll(): Promise<void> {

    try {
      await this.seedAdminUser()
      await this.seedCreatorUser()
      await this.seedSampleProducts()

    } catch (error) {
      console.error('❌ Database seeding failed:', error)
      throw error
    }
  }

  /**
   * Clear all data (for testing purposes)
   */
  async clearAll(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clear database in production environment')
    }

    try {
      await Promise.all([
        UserModel.deleteMany({}),
        ProductModel.deleteMany({}),
        OrderModel.deleteMany({}),
        CartModel.deleteMany({}),
        WishlistModel.deleteMany({}),
        CustomizationModel.deleteMany({}),
        ReviewModel.deleteMany({}),
        ProductRatingModel.deleteMany({}),
        ReferralModel.deleteMany({}),
        CommissionModel.deleteMany({}),
        AuditLogModel.deleteMany({})
      ])

    } catch (error) {
      console.error('❌ Failed to clear database:', error)
      throw error
    }
  }
}

// Migration manager class
export class MigrationManager {
  private static instance: MigrationManager
  private migrationCollection: string = 'migrations'

  private constructor() {}

  public static getInstance(): MigrationManager {
    if (!MigrationManager.instance) {
      MigrationManager.instance = new MigrationManager()
    }
    return MigrationManager.instance
  }

  /**
   * Register migration record
   */
  private async recordMigration(
    version: string, 
    description: string, 
    status: 'completed' | 'failed' | 'rolled_back',
    executionTime: number,
    error?: string
  ): Promise<void> {
    const db = mongoose.connection.db
    await db.collection(this.migrationCollection).insertOne({
      version,
      description,
      executedAt: new Date(),
      executionTime,
      status,
      error
    })
  }

  /**
   * Check if migration has been executed
   */
  private async isMigrationExecuted(version: string): Promise<boolean> {
    const db = mongoose.connection.db
    const migration = await db.collection(this.migrationCollection)
      .findOne({ version, status: 'completed' })
    return !!migration
  }

  /**
   * Get executed migrations
   */
  async getExecutedMigrations(): Promise<MigrationRecord[]> {
    const db = mongoose.connection.db
    return db.collection(this.migrationCollection)
      .find({})
      .sort({ executedAt: 1 })
      .toArray() as Promise<MigrationRecord[]>
  }

  /**
   * Execute a single migration
   */
  async executeMigration(migration: Migration): Promise<void> {
    const { version, description } = migration
    
    if (await this.isMigrationExecuted(version)) {

      return
    }

    const startTime = Date.now()

    try {
      await migration.up()
      const executionTime = Date.now() - startTime
      
      await this.recordMigration(version, description, 'completed', executionTime)

    } catch (error) {
      const executionTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      await this.recordMigration(version, description, 'failed', executionTime, errorMessage)
      console.error(`❌ Migration ${version} failed:`, error)
      throw error
    }
  }

  /**
   * Execute multiple migrations
   */
  async executeMigrations(migrations: Migration[]): Promise<void> {

    for (const migration of migrations) {
      await this.executeMigration(migration)
    }

  }

  /**
   * Rollback a migration
   */
  async rollbackMigration(migration: Migration): Promise<void> {
    const { version, description } = migration

    const startTime = Date.now()

    try {
      await migration.down()
      const executionTime = Date.now() - startTime
      
      await this.recordMigration(version, description, 'rolled_back', executionTime)

    } catch (error) {
      const executionTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      await this.recordMigration(version, description, 'failed', executionTime, errorMessage)
      console.error(`❌ Migration rollback ${version} failed:`, error)
      throw error
    }
  }
}

// Sample migrations
export const migrations: Migration[] = [
  {
    version: '001_initial_setup',
    description: 'Initial database setup and index creation',
    up: async () => {
      await dbUtils.initialize()
    },
    down: async () => {
      // Drop all indexes except _id
      const collections = await mongoose.connection.db.listCollections().toArray()
      for (const collection of collections) {
        await mongoose.connection.db.collection(collection.name).dropIndexes()
      }
    }
  },
  {
    version: '002_seed_initial_data',
    description: 'Seed initial admin user and sample data',
    up: async () => {
      const seeder = DatabaseSeeder.getInstance()
      await seeder.seedAll()
    },
    down: async () => {
      // Remove seeded data only in non-production
      if (process.env.NODE_ENV !== 'production') {
        const seeder = DatabaseSeeder.getInstance()
        await seeder.clearAll()
      }
    }
  }
]

// Main initialization function
export async function initializeDatabase(): Promise<void> {
  try {

    // Connect to database
    await connectToDatabase()
    
    // Initialize database utilities
    await dbUtils.initialize()
    
    // Run migrations
    const migrationManager = MigrationManager.getInstance()
    await migrationManager.executeMigrations(migrations)

  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}

// Export instances
export const seeder = DatabaseSeeder.getInstance()
export const migrationManager = MigrationManager.getInstance()