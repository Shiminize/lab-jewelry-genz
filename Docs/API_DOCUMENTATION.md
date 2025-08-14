# GlowGlitch API Documentation

> **Complete REST API reference for the GlowGlitch luxury jewelry platform**

## Table of Contents
1. [Authentication](#authentication)
2. [Product Management](#product-management)
3. [Shopping Cart](#shopping-cart)
4. [Wishlist Management](#wishlist-management)
5. [Order Processing](#order-processing)
6. [User Management](#user-management)
7. [Inventory Management](#inventory-management)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)

---

## Authentication

All API endpoints require authentication unless otherwise noted. Authentication uses NextAuth.js with JWT tokens.

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer"
  },
  "token": "jwt_token_here"
}
```

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "Jane Doe",
  "preferences": {
    "newsletter": true,
    "notifications": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "new_user_id",
    "email": "newuser@example.com",
    "name": "Jane Doe",
    "role": "customer"
  }
}
```

### Get Session
```http
GET /api/auth/session
Authorization: Bearer {token}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer"
  },
  "expires": "2025-08-12T14:00:00.000Z"
}
```

---

## Product Management

### Get Products
```http
GET /api/products
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12, max: 50)
- `category` (string): Filter by category (`rings`, `necklaces`, `earrings`, `bracelets`)
- `sortBy` (string): Sort field (`name`, `basePrice`, `createdAt`)
- `sortOrder` (string): Sort direction (`asc`, `desc`)
- `search` (string): Search term for product names
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `featured` (boolean): Filter featured products only

**Example:**
```http
GET /api/products?category=rings&page=1&limit=12&sortBy=basePrice&sortOrder=desc&featured=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "product_id_1",
      "name": "Eternal Solitaire Ring",
      "description": "A timeless solitaire setting with lab-grown diamond",
      "basePrice": 2400,
      "originalPrice": 2800,
      "category": "rings",
      "subcategory": "engagement",
      "images": {
        "primary": "/images/rings/eternal-solitaire-primary.jpg",
        "gallery": [
          "/images/rings/eternal-solitaire-gallery-1.jpg",
          "/images/rings/eternal-solitaire-gallery-2.jpg"
        ],
        "thumbnail": "/images/rings/eternal-solitaire-thumb.jpg"
      },
      "specifications": {
        "materials": ["18K White Gold", "Lab-Grown Diamond"],
        "gemstone": {
          "type": "Diamond",
          "carat": 1.0,
          "color": "D",
          "clarity": "VVS1"
        },
        "dimensions": {
          "length": 12,
          "width": 8,
          "height": 5
        }
      },
      "inventory": {
        "sku": "ER-SOL-001",
        "quantity": 5,
        "reserved": 1,
        "available": 4
      },
      "metadata": {
        "featured": true,
        "bestseller": false,
        "newArrival": true,
        "customizable": true
      },
      "discountPercentage": 14,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-08-12T14:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4
  }
}
```

### Get Single Product
```http
GET /api/products/{productId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "product_id_1",
    "name": "Eternal Solitaire Ring",
    // ... complete product details
    "relatedProducts": [
      {
        "_id": "related_product_1",
        "name": "Related Ring",
        "basePrice": 2200,
        "images": { "primary": "/images/rings/related-primary.jpg" }
      }
    ],
    "reviews": {
      "average": 4.8,
      "count": 124,
      "recent": [
        {
          "rating": 5,
          "comment": "Beautiful ring, exactly as described",
          "author": "Sarah M.",
          "date": "2025-08-10T00:00:00.000Z"
        }
      ]
    }
  }
}
```

### Create Product (Admin Only)
```http
POST /api/products
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Custom Diamond Ring",
  "description": "Beautiful custom engagement ring",
  "basePrice": 3500,
  "category": "rings",
  "subcategory": "engagement",
  "images": {
    "primary": "/images/rings/custom-primary.jpg",
    "gallery": ["/images/rings/custom-gallery-1.jpg"]
  },
  "specifications": {
    "materials": ["18K Yellow Gold", "Lab-Grown Diamond"],
    "gemstone": {
      "type": "Diamond",
      "carat": 1.5,
      "color": "E",
      "clarity": "VS1"
    }
  },
  "inventory": {
    "sku": "ER-CUS-001",
    "quantity": 3
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "new_product_id",
    "name": "Custom Diamond Ring",
    // ... complete product details
  }
}
```

---

## Shopping Cart

### Get Cart
```http
GET /api/cart
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": "product_id_1",
        "product": {
          "_id": "product_id_1",
          "name": "Eternal Solitaire Ring",
          "basePrice": 2400,
          "images": { "primary": "/images/rings/eternal-primary.jpg" }
        },
        "quantity": 1,
        "customizations": {
          "metalType": "18K White Gold",
          "ringSize": "7",
          "engraving": "Forever Yours"
        },
        "unitPrice": 2400,
        "totalPrice": 2400
      }
    ],
    "summary": {
      "itemCount": 1,
      "subtotal": 2400,
      "tax": 192,
      "shipping": 0,
      "total": 2592
    }
  }
}
```

### Add to Cart
```http
POST /api/cart
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product_id_1",
  "quantity": 1,
  "customizations": {
    "metalType": "18K White Gold",
    "ringSize": "7",
    "engraving": "Forever Yours"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "cartItemId": "cart_item_id",
    "quantity": 1
  }
}
```

### Update Cart Item
```http
PUT /api/cart/{productId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 2,
  "customizations": {
    "metalType": "18K Rose Gold",
    "ringSize": "7",
    "engraving": "Always & Forever"
  }
}
```

### Remove from Cart
```http
DELETE /api/cart/{productId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

### Clear Cart
```http
DELETE /api/cart
Authorization: Bearer {token}
```

---

## Wishlist Management

### Get Wishlist
```http
GET /api/wishlist
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": "product_id_1",
        "product": {
          "_id": "product_id_1",
          "name": "Eternal Solitaire Ring",
          "basePrice": 2400,
          "originalPrice": 2800,
          "images": { "primary": "/images/rings/eternal-primary.jpg" }
        },
        "customizations": {
          "metalType": "18K White Gold",
          "ringSize": "7"
        },
        "addedAt": "2025-08-10T12:00:00.000Z",
        "notes": "For anniversary gift"
      }
    ],
    "totalItems": 5
  }
}
```

### Add to Wishlist
```http
POST /api/wishlist
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product_id_1",
  "customizations": {
    "metalType": "18K White Gold",
    "ringSize": "7"
  },
  "notes": "For anniversary gift"
}
```

### Remove from Wishlist
```http
DELETE /api/wishlist/{productId}
Authorization: Bearer {token}
```

### Move to Cart
```http
POST /api/wishlist/{productId}/move-to-cart
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 1
}
```

---

## Order Processing

### Get Orders
```http
GET /api/orders
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status (`pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "order_id_1",
      "orderNumber": "GL-2025-000001",
      "status": "processing",
      "items": [
        {
          "productId": "product_id_1",
          "product": {
            "name": "Eternal Solitaire Ring",
            "images": { "primary": "/images/rings/eternal-primary.jpg" }
          },
          "quantity": 1,
          "unitPrice": 2400,
          "customizations": {
            "metalType": "18K White Gold",
            "ringSize": "7"
          }
        }
      ],
      "totals": {
        "subtotal": 2400,
        "tax": 192,
        "shipping": 0,
        "total": 2592
      },
      "shippingAddress": {
        "name": "John Doe",
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "US"
      },
      "paymentStatus": "paid",
      "tracking": {
        "carrier": "FedEx",
        "trackingNumber": "1234567890",
        "estimatedDelivery": "2025-08-15T00:00:00.000Z"
      },
      "createdAt": "2025-08-12T10:00:00.000Z",
      "updatedAt": "2025-08-12T14:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

### Get Single Order
```http
GET /api/orders/{orderId}
Authorization: Bearer {token}
```

### Create Order
```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    {
      "productId": "product_id_1",
      "quantity": 1,
      "customizations": {
        "metalType": "18K White Gold",
        "ringSize": "7"
      }
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  },
  "paymentMethod": {
    "type": "stripe",
    "token": "stripe_payment_token"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "new_order_id",
    "orderNumber": "GL-2025-000002",
    "status": "pending",
    "paymentStatus": "processing",
    // ... complete order details
  }
}
```

---

## User Management

### Get Profile
```http
GET /api/user/profile
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "addresses": [
      {
        "type": "shipping",
        "name": "John Doe",
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "US",
        "isDefault": true
      }
    ],
    "preferences": {
      "newsletter": true,
      "notifications": true,
      "currency": "USD",
      "language": "en"
    },
    "stats": {
      "totalOrders": 5,
      "totalSpent": 12500,
      "wishlistCount": 3,
      "loyaltyPoints": 1250
    },
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Update Profile
```http
PUT /api/user/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Smith",
  "phone": "+1987654321",
  "preferences": {
    "newsletter": false,
    "notifications": true
  }
}
```

### Add Address
```http
POST /api/user/addresses
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "billing",
  "name": "John Doe",
  "street": "456 Oak Avenue",
  "city": "Los Angeles",
  "state": "CA",
  "zipCode": "90210",
  "country": "US",
  "isDefault": false
}
```

### Update Address
```http
PUT /api/user/addresses/{addressId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "street": "789 Pine Street",
  "isDefault": true
}
```

### Delete Address
```http
DELETE /api/user/addresses/{addressId}
Authorization: Bearer {token}
```

---

## Inventory Management

### Check Availability
```http
GET /api/inventory/{productId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "product_id_1",
    "sku": "ER-SOL-001",
    "quantity": 5,
    "reserved": 1,
    "available": 4,
    "status": "in_stock",
    "restockDate": null,
    "lastUpdated": "2025-08-12T14:00:00.000Z"
  }
}
```

### Reserve Inventory (Internal)
```http
POST /api/inventory/{productId}/reserve
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "quantity": 1,
  "reservationId": "reservation_id",
  "expiresAt": "2025-08-12T15:00:00.000Z"
}
```

### Release Reservation (Internal)
```http
POST /api/inventory/{productId}/release
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "reservationId": "reservation_id",
  "quantity": 1
}
```

### Update Stock (Admin Only)
```http
PUT /api/inventory/{productId}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "quantity": 10,
  "reason": "Restock from supplier",
  "notes": "Monthly inventory update"
}
```

---

## Error Handling

All API endpoints follow a consistent error response format:

### Error Response Format
```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  },
  "timestamp": "2025-08-12T14:00:00.000Z"
}
```

### Common HTTP Status Codes

- **200 OK**: Successful GET request
- **201 Created**: Successful POST request (resource created)
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required or failed
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict (e.g., duplicate email)
- **422 Unprocessable Entity**: Validation errors
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

### Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_REQUIRED`: Authentication token missing
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `DUPLICATE_RESOURCE`: Resource already exists
- `INVENTORY_INSUFFICIENT`: Not enough stock available
- `PAYMENT_FAILED`: Payment processing error
- `RATE_LIMIT_EXCEEDED`: Too many requests

---

## Rate Limiting

API endpoints are rate limited to ensure fair usage and prevent abuse:

### Rate Limits by Endpoint Type

- **Authentication**: 5 requests per minute per IP
- **Product Catalog**: 100 requests per minute per IP
- **Cart Operations**: 30 requests per minute per user
- **Order Creation**: 3 requests per minute per user
- **Admin Operations**: 200 requests per minute per admin user

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1692710400
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "limit": 100,
    "remaining": 0,
    "resetTime": "2025-08-12T15:00:00.000Z"
  },
  "timestamp": "2025-08-12T14:30:00.000Z"
}
```

---

## Webhooks

### Stripe Payment Webhooks

```http
POST /api/webhooks/stripe
Content-Type: application/json
Stripe-Signature: t=timestamp,v1=signature

{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1234567890",
      "amount": 259200,
      "currency": "usd",
      "metadata": {
        "orderId": "order_id_1"
      }
    }
  }
}
```

**Supported Events:**
- `payment_intent.succeeded`: Payment completed successfully
- `payment_intent.payment_failed`: Payment failed
- `charge.dispute.created`: Chargeback initiated

---

## SDK Examples

### JavaScript/TypeScript SDK

```typescript
// Installation
npm install @glowglitch/api-client

// Usage
import { GlowGlitchAPI } from '@glowglitch/api-client'

const client = new GlowGlitchAPI({
  baseURL: 'https://api.glowglitch.com',
  apiKey: 'your_api_key_here'
})

// Get products
const products = await client.products.list({
  category: 'rings',
  limit: 12,
  featured: true
})

// Add to cart
const cartItem = await client.cart.add({
  productId: 'product_id_1',
  quantity: 1,
  customizations: {
    metalType: '18K White Gold',
    ringSize: '7'
  }
})

// Create order
const order = await client.orders.create({
  items: [{ productId: 'product_id_1', quantity: 1 }],
  shippingAddress: { /* address data */ },
  paymentMethod: { type: 'stripe', token: 'stripe_token' }
})
```

---

## Testing

### Postman Collection

Import the GlowGlitch API Postman collection for easy testing:

```bash
# Download collection
curl -O https://api.glowglitch.com/docs/glowglitch-api-collection.json

# Import into Postman and set environment variables:
# - base_url: https://api.glowglitch.com
# - auth_token: your_jwt_token
```

### Test Data

Use these test product IDs in development:

- **Rings**: `65a1b2c3d4e5f6789012345a`, `65a1b2c3d4e5f6789012345b`
- **Necklaces**: `65a1b2c3d4e5f6789012345c`, `65a1b2c3d4e5f6789012345d`
- **Test User**: Email: `test@glowglitch.com`, Password: `TestPass123!`

---

**Last Updated**: August 12, 2025  
**API Version**: v1.0.0  
**Base URL**: `https://api.glowglitch.com/v1`

*For support or questions, contact the development team or create an issue in the repository.*