# GlowGlitch MongoDB Database Foundation

## Overview

This document provides a comprehensive guide to the MongoDB database foundation for the GlowGlitch jewelry e-commerce platform. The database is designed to support a luxury GenZ jewelry marketplace with creator program functionality, 3D customization, and GDPR compliance.

## Architecture Overview

### Technology Stack
- **Database**: MongoDB with Mongoose ODM
- **Connection**: Connection pooling with automatic reconnection
- **Performance**: Advanced indexing and aggregation pipelines
- **Security**: GDPR compliance, audit logging, and data encryption
- **Scaling**: Designed for horizontal scaling and high performance

### Key Features
- ✅ User management with role-based access control
- ✅ Product catalog with 3D model integration
- ✅ Shopping cart and wishlist functionality
- ✅ Order processing with payment tracking
- ✅ Creator referral and commission system
- ✅ Review and rating system with moderation
- ✅ 3D customization with configuration saving
- ✅ Comprehensive audit logging
- ✅ GDPR compliance features
- ✅ Performance optimization and monitoring

## File Structure

```
src/lib/
├── mongoose.ts                    # MongoDB connection utility
├── database-utils.ts             # Database operation utilities
├── database-migrations.ts        # Migration and seeding utilities
├── database-performance.ts       # Performance optimization
├── schemas/
│   ├── index.ts                  # Schema exports
│   ├── user.schema.ts            # User and authentication
│   ├── product.schema.ts         # Product catalog
│   ├── order.schema.ts           # Order management
│   ├── cart.schema.ts            # Shopping cart
│   ├── wishlist.schema.ts        # User wishlists
│   ├── referral.schema.ts        # Creator program
│   ├── review.schema.ts          # Reviews and ratings
│   ├── customization.schema.ts   # 3D customization
│   └── audit.schema.ts           # Audit and GDPR compliance
```

## Database Collections

### Core Collections

#### 1. Users Collection
**Purpose**: User management, authentication, and creator profiles
**Schema**: `user.schema.ts`
**Key Features**:
- Role-based access control (customer, creator, admin)
- NextAuth.js integration
- Creator program profiles with commission tracking
- GDPR consent and data retention
- Security features (account locking, 2FA)

```typescript
// Example usage
import { UserModel } from '@/lib/schemas'

const user = await UserModel.findByEmail('user@example.com')
```

#### 2. Products Collection
**Purpose**: Product catalog with 3D models and customization options
**Schema**: `product.schema.ts`
**Key Features**:
- Complete product information with pricing
- 3D model assets and AR support
- Customization options (materials, gemstones, sizes)
- Inventory management with reservation
- SEO optimization

```typescript
// Example usage
import { ProductModel } from '@/lib/schemas'

const featuredProducts = await ProductModel.findFeatured(8)
const product = await ProductModel.findBySlug('classic-solitaire-ring')
```

#### 3. Orders Collection
**Purpose**: Order management with payment and shipping tracking
**Schema**: `order.schema.ts`
**Key Features**:
- Complete order lifecycle management
- Payment integration (Stripe, PayPal)
- Shipping tracking and status updates
- Creator commission calculation
- Order timeline and audit trail

```typescript
// Example usage
import { OrderModel } from '@/lib/schemas'

const userOrders = await OrderModel.findByUser(userId)
const order = await OrderModel.findOne({ orderNumber: 'GG-123456' })
```

#### 4. Shopping Cart Collection
**Purpose**: Shopping cart functionality with inventory reservation
**Schema**: `cart.schema.ts`
**Key Features**:
- Guest and authenticated user carts
- Product customization support
- Inventory reservation (15-minute window)
- Discount code application
- Cart abandonment tracking

```typescript
// Example usage
import { CartModel } from '@/lib/schemas'

const cart = await CartModel.findByUser(userId)
await cart.addItem(productId, quantity, customizations)
```

#### 5. Wishlists Collection
**Purpose**: User wishlist functionality with sharing and price alerts
**Schema**: `wishlist.schema.ts`
**Key Features**:
- Multiple wishlists per user
- Price alert notifications
- Social sharing capabilities
- Move to cart functionality
- Privacy controls

```typescript
// Example usage
import { WishlistModel } from '@/lib/schemas'

const wishlists = await WishlistModel.findByUser(userId)
await wishlist.addItem(productId, customizations, notes)
```

### Creator Program Collections

#### 6. Referrals Collection
**Purpose**: Creator referral tracking with fraud detection
**Schema**: `referral.schema.ts`
**Key Features**:
- Click tracking and attribution
- Fraud detection and scoring
- Conversion tracking
- Geographic and device analytics
- 30-day attribution window

#### 7. Commissions Collection
**Purpose**: Creator commission management and payment tracking
**Schema**: `referral.schema.ts`
**Key Features**:
- Commission calculation and tracking
- Payment batch processing
- Dispute handling
- Performance analytics
- Payment method integration

### Review System Collections

#### 8. Reviews Collection
**Purpose**: Product reviews with moderation and sentiment analysis
**Schema**: `review.schema.ts`
**Key Features**:
- Verified purchase reviews
- Media uploads (images, videos)
- Sentiment analysis
- Helpfulness voting
- Moderation workflow

#### 9. Product Ratings Collection
**Purpose**: Aggregated product rating summaries
**Schema**: `review.schema.ts`
**Key Features**:
- Real-time rating calculation
- Rating distribution analysis
- Verified vs unverified breakdowns
- Performance optimization

### Customization Collections

#### 10. Customizations Collection
**Purpose**: 3D product customization and configuration saving
**Schema**: `customization.schema.ts`
**Key Features**:
- 3D configuration storage
- Version control and history
- Sharing and collaboration
- Performance optimization
- Analytics tracking

#### 11. Model Assets Collection
**Purpose**: 3D model asset management and optimization
**Schema**: `customization.schema.ts`
**Key Features**:
- Multi-quality level assets
- Performance metrics
- Version control
- Usage analytics
- Asset optimization

### Compliance and Audit Collections

#### 12. Audit Logs Collection
**Purpose**: Comprehensive audit trail for all system actions
**Schema**: `audit.schema.ts`
**Key Features**:
- Detailed event logging
- GDPR compliance tracking
- Security monitoring
- Performance metrics
- Data retention management

#### 13. GDPR Processing Records Collection
**Purpose**: GDPR compliance and data processing records
**Schema**: `audit.schema.ts`
**Key Features**:
- Legal basis tracking
- Consent management
- Data retention policies
- Risk assessments
- Compliance reporting

## Database Utilities

### Connection Management
```typescript
import connectToDatabase from '@/lib/mongoose'

// Automatic connection with pooling
await connectToDatabase()

// Health check
import { checkDatabaseHealth } from '@/lib/mongoose'
const health = await checkDatabaseHealth()
```

### Safe Operations
```typescript
import { safeFind, safeCreate, safeUpdate } from '@/lib/database-utils'

// Safe database operations with error handling
const result = await safeFind(UserModel, { email: 'user@example.com' })
if (result.success) {
  console.log('User found:', result.data)
}
```

### Transactions
```typescript
import { dbUtils } from '@/lib/database-utils'

// Execute operations in transaction
const result = await dbUtils.executeTransaction(async (context) => {
  const user = await UserModel.create(userData, { session: context.session })
  const cart = await CartModel.create({ userId: user._id }, { session: context.session })
  return { user, cart }
})
```

### Performance Optimization
```typescript
import { OptimizedQueries, AggregationBuilder } from '@/lib/database-performance'

// Pre-built optimized queries
const analytics = await OptimizedQueries.getProductAnalytics({
  productIds: ['product1', 'product2'],
  includeReviews: true
}).execute(ProductModel)

// Custom aggregation pipelines
const pipeline = new AggregationBuilder('products')
  .match({ category: 'rings' })
  .lookup({
    from: 'reviews',
    localField: '_id',
    foreignField: 'productId',
    as: 'reviews'
  })
  .sort({ createdAt: -1 })
  .limit(10)

const results = await pipeline.execute(ProductModel)
```

## Database Initialization

### Initial Setup
```typescript
import { initializeDatabase } from '@/lib/database-migrations'

// Initialize database with migrations and seeding
await initializeDatabase()
```

### Seeding Data
```typescript
import { seeder } from '@/lib/database-migrations'

// Seed initial data
await seeder.seedAll()

// Seed specific data
await seeder.seedAdminUser()
await seeder.seedSampleProducts()
```

### Migrations
```typescript
import { migrationManager } from '@/lib/database-migrations'

// Execute migrations
await migrationManager.executeMigrations(migrations)

// Check migration status
const executed = await migrationManager.getExecutedMigrations()
```

## Environment Configuration

### Required Environment Variables
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/glowglitch
DATABASE_NAME=glowglitch

# Admin User (for seeding)
ADMIN_EMAIL=admin@glowglitch.com
ADMIN_PASSWORD=SecureAdminPassword123!

# Performance Settings
DB_POOL_SIZE=10
DB_TIMEOUT=30000
```

### Development Setup
```bash
# Install dependencies
npm install mongoose

# Start MongoDB locally
mongod --dbpath ./data/db

# Initialize database
npm run db:init

# Seed test data
npm run db:seed
```

## Performance Considerations

### Indexing Strategy
- **Compound Indexes**: Query + sort combinations
- **Text Indexes**: Full-text search optimization
- **Sparse Indexes**: Optional fields (creator profiles, tokens)
- **TTL Indexes**: Automatic cleanup (sessions, tokens)
- **Geospatial Indexes**: Location-based features

### Query Optimization
- **Aggregation Pipelines**: Complex queries with multiple joins
- **Projection**: Return only needed fields
- **Pagination**: Efficient skip/limit with cursors
- **Caching**: Query result caching with Redis integration

### Performance Monitoring
```typescript
import { dbUtils } from '@/lib/database-utils'

// Get performance metrics
const metrics = dbUtils.getPerformanceMetrics()

// Health check
const health = await dbUtils.healthCheck()
```

## Security and Compliance

### GDPR Compliance
- **Consent Tracking**: User consent management
- **Data Export**: Right to data portability
- **Data Deletion**: Right to be forgotten
- **Audit Logging**: All personal data access
- **Retention Policies**: Automatic data cleanup

### Security Features
- **Input Validation**: Mongoose schema validation
- **Query Sanitization**: Prevent NoSQL injection
- **Rate Limiting**: Per-user and per-IP limits
- **Audit Logging**: All security-relevant events
- **Data Encryption**: Sensitive field encryption

## Error Handling

### Database Errors
```typescript
// Automatic retry for transient errors
const result = await dbUtils.executeOperation('find-users', async () => {
  return UserModel.find({ role: 'customer' })
}, { retries: 3, timeout: 30000 })

if (!result.success) {
  console.error('Database operation failed:', result.error)
}
```

### Connection Issues
- **Automatic Reconnection**: Built-in connection recovery
- **Connection Pooling**: Efficient connection management
- **Health Monitoring**: Regular connection health checks
- **Fallback Strategies**: Graceful degradation

## Monitoring and Analytics

### Performance Metrics
- Query execution time tracking
- Slow query detection and logging
- Index usage statistics
- Connection pool monitoring

### Business Analytics
- User behavior tracking
- Product performance metrics
- Creator program analytics
- Revenue and conversion tracking

## API Integration

### Database API Routes
```typescript
// Initialize database
GET/POST /api/db/init

// Seed database
POST /api/db/seed

// Health check
GET /api/db/health

// Performance metrics
GET /api/db/metrics
```

### Usage in API Routes
```typescript
// pages/api/products/[id].ts
import { ProductModel } from '@/lib/schemas'
import { safeFind } from '@/lib/database-utils'

export default async function handler(req, res) {
  const { id } = req.query
  
  const result = await safeFind(ProductModel, { _id: id })
  
  if (result.success) {
    res.json({ success: true, data: result.data })
  } else {
    res.status(500).json({ success: false, error: result.error })
  }
}
```

## Best Practices

### Schema Design
1. **Denormalization**: Store frequently accessed data together
2. **Embedding vs Referencing**: Based on data access patterns
3. **Index Planning**: Design indexes before implementing queries
4. **Data Types**: Use appropriate MongoDB data types
5. **Validation**: Comprehensive schema validation

### Query Patterns
1. **Aggregation**: Use for complex data analysis
2. **Projection**: Always limit returned fields
3. **Pagination**: Implement cursor-based pagination
4. **Caching**: Cache frequently accessed data
5. **Batch Operations**: Use bulk operations for efficiency

### Error Handling
1. **Graceful Degradation**: Handle database unavailability
2. **Retry Logic**: Implement exponential backoff
3. **Logging**: Comprehensive error logging
4. **Monitoring**: Real-time error monitoring
5. **Recovery**: Automatic recovery procedures

## Deployment Considerations

### Production Setup
- **Replica Sets**: For high availability
- **Sharding**: For horizontal scaling
- **Monitoring**: MongoDB Atlas or self-hosted monitoring
- **Backups**: Automated backup strategies
- **Security**: Network security and access controls

### Scaling Strategies
- **Read Replicas**: Distribute read operations
- **Connection Pooling**: Optimize connection usage
- **Index Optimization**: Regular index analysis
- **Query Optimization**: Performance monitoring
- **Caching**: Redis integration for hot data

This comprehensive database foundation provides a robust, scalable, and GDPR-compliant solution for the GlowGlitch jewelry e-commerce platform, supporting all required features including the creator program, 3D customization, and advanced analytics.