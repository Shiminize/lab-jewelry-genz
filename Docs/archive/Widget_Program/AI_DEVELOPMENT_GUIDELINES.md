# AI Development Guidelines for GlowGlitch

> **Comprehensive rules and patterns for AI developers working on the GlowGlitch luxury jewelry platform**

This document extends the basic rules.md with detailed AI-specific guidelines, patterns, and anti-patterns for consistent development.

## Table of Contents
1. [Core AI Development Principles](#core-ai-development-principles)
2. [Component Architecture](#component-architecture)
3. [API Development Patterns](#api-development-patterns)
4. [Database & State Management](#database--state-management)
5. [Design System Compliance](#design-system-compliance)
6. [Testing Requirements](#testing-requirements)
7. [Security & Performance](#security--performance)
8. [Common Anti-Patterns](#common-anti-patterns)
9. [Code Review Checklist](#code-review-checklist)

---

## Core AI Development Principles

### 1. Context-Aware Development
**AI developers must understand the luxury jewelry business context.**

✅ **DO:**
- Consider the premium customer experience in every decision
- Prioritize mobile-first design (60% of luxury buyers browse on mobile)
- Implement smooth animations and transitions for luxury feel
- Ensure accessibility for all users (WCAG 2.1 AA compliance)

❌ **DON'T:**
- Create generic e-commerce patterns without luxury consideration
- Ignore mobile responsiveness for complex components
- Skip accessibility testing for interactive elements

### 2. Design System First Approach
**Every visual element must use the defined design system.**

```tsx
// ✅ CORRECT: Using design system tokens
<button className="bg-cta text-background hover:bg-cta-hover font-headline">
  Shop Now
</button>

// ❌ INCORRECT: Generic Tailwind classes
<button className="bg-blue-500 text-white hover:bg-blue-600 font-bold">
  Shop Now
</button>
```

### 3. TypeScript Enforcement
**All code must be fully typed with no `any` types.**

```tsx
// ✅ CORRECT: Proper typing
interface ProductCardProps {
  product: {
    _id: string
    name: string
    basePrice: number
    images: string[]
    category: 'rings' | 'necklaces' | 'earrings' | 'bracelets'
  }
  onAddToCart?: (productId: string) => Promise<void>
  className?: string
}

// ❌ INCORRECT: Loose typing
interface ProductCardProps {
  product: any
  onAddToCart?: Function
  className?: string
}
```

---

## Component Architecture

### Component Creation Decision Tree

```
New Component Needed?
├─ 🔍 Search existing components first
│   ├─ Found similar? → Add variant to existing
│   └─ No match? → Continue to creation
├─ 🎨 Choose appropriate directory
│   ├─ Generic UI → src/components/ui/
│   ├─ Business logic → src/components/[domain]/
│   └─ Page-specific → colocate with page
└─ 📝 Follow component template
```

### Standard Component Template

```tsx
'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// 1. Define variants with CVA
const componentVariants = cva(
  // Base styles using design system
  'font-body transition-colors focus:outline-none focus:ring-2 focus:ring-accent',
  {
    variants: {
      variant: {
        primary: 'bg-cta text-background hover:bg-cta-hover',
        secondary: 'bg-background text-foreground border border-border hover:bg-muted',
        ghost: 'text-foreground hover:bg-muted'
      },
      size: {
        sm: 'px-3 py-1.5 text-sm min-h-9',
        md: 'px-4 py-2 text-base min-h-11', 
        lg: 'px-6 py-3 text-lg min-h-12'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
)

// 2. Define component interface
interface ComponentNameProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof componentVariants> {
  children: React.ReactNode
  isLoading?: boolean
}

// 3. Component implementation
export function ComponentName({ 
  className,
  variant,
  size,
  children,
  isLoading,
  disabled,
  ...props
}: ComponentNameProps) {
  return (
    <button
      className={cn(componentVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}
```

### Component Best Practices

#### ✅ DO: Prop Composition
```tsx
// Extend HTML element props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  isLoading?: boolean
}

// Forward all props
<button {...props} className={cn(baseStyles, className)}>
  {children}
</button>
```

#### ✅ DO: Forward Refs for Form Components
```tsx
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn("bg-background border border-border", className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"
```

#### ❌ DON'T: Hardcode Styles or Data
```tsx
// ❌ Bad: Hardcoded styles and data
function ProductCard() {
  return (
    <div style={{ backgroundColor: '#f3f4f6', padding: '16px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>
        Diamond Ring
      </h3>
      <p>$2,500</p>
    </div>
  )
}

// ✅ Good: Props and design system
function ProductCard({ product, className }: ProductCardProps) {
  return (
    <div className={cn("bg-background p-4", className)}>
      <H3 className="text-foreground">{product.name}</H3>
      <BodyText className="text-muted">${product.basePrice}</BodyText>
    </div>
  )
}
```

---

## API Development Patterns

### Standard API Route Structure

```typescript
// src/app/api/[endpoint]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth/next'
import connectToDatabase from '@/lib/mongodb'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'

// 1. Define request/response schemas
const CreateProductSchema = z.object({
  name: z.string().min(1).max(100),
  basePrice: z.number().positive(),
  category: z.enum(['rings', 'necklaces', 'earrings', 'bracelets']),
  images: z.array(z.string().url()).min(1)
})

const ProductResponseSchema = z.object({
  _id: z.string(),
  name: z.string(),
  basePrice: z.number(),
  category: z.string(),
  images: z.array(z.string())
})

// 2. Implement HTTP methods
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    // Input validation
    const body = await request.json()
    const validatedData = CreateProductSchema.parse(body)

    // Database operation
    await connectToDatabase()
    const product = await Product.create(validatedData)

    // Response validation
    const responseData = ProductResponseSchema.parse(product.toObject())
    
    return NextResponse.json({
      success: true,
      data: responseData
    }, { status: 201 })

  } catch (error) {
    console.error('[API] Product creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50)
    const category = searchParams.get('category')

    await connectToDatabase()
    
    const filter = category ? { category } : {}
    const products = await Product.find(filter)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const total = await Product.countDocuments(filter)

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('[API] Product fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
```

### API Best Practices

#### ✅ DO: Consistent Error Handling
```typescript
// Standard error response format
const errorResponse = {
  error: 'Human-readable message',
  code: 'MACHINE_READABLE_CODE',
  details?: any, // Additional context
  timestamp: new Date().toISOString()
}
```

#### ✅ DO: Request Validation
```typescript
// Always validate inputs with Zod
const RequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  preferences: z.object({
    newsletter: z.boolean(),
    notifications: z.boolean()
  }).optional()
})
```

#### ❌ DON'T: Expose Sensitive Data
```typescript
// ❌ Bad: Returning user passwords
const user = await User.findById(userId) // Contains password hash
return NextResponse.json(user)

// ✅ Good: Select only safe fields
const user = await User.findById(userId).select('-password -resetToken')
return NextResponse.json(user)
```

---

## Database & State Management

### MongoDB Schema Patterns

```typescript
// src/models/Product.ts

import mongoose, { Document, Schema } from 'mongoose'

// 1. Define TypeScript interface
interface IProduct extends Document {
  name: string
  description: string
  basePrice: number
  originalPrice?: number
  category: 'rings' | 'necklaces' | 'earrings' | 'bracelets'
  subcategory: string
  images: {
    primary: string
    gallery: string[]
    thumbnail?: string
  }
  specifications: {
    materials: string[]
    gemstone?: {
      type: string
      carat: number
      color: string
      clarity: string
    }
    dimensions: {
      length?: number
      width?: number
      height?: number
    }
  }
  inventory: {
    sku: string
    quantity: number
    reserved: number
    available: number
  }
  seo: {
    slug: string
    metaTitle: string
    metaDescription: string
  }
  metadata: {
    featured: boolean
    bestseller: boolean
    newArrival: boolean
    customizable: boolean
  }
  createdAt: Date
  updatedAt: Date
}

// 2. Define Mongoose schema
const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative'],
    validate: {
      validator: function(this: IProduct, v: number) {
        return !v || v >= this.basePrice
      },
      message: 'Original price must be greater than or equal to base price'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['rings', 'necklaces', 'earrings', 'bracelets']
  },
  // ... other fields
  inventory: {
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      index: true
    },
    quantity: { type: Number, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 },
    available: { type: Number, default: 0, min: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// 3. Add indexes for performance
ProductSchema.index({ category: 1, 'metadata.featured': 1 })
ProductSchema.index({ 'seo.slug': 1 }, { unique: true })
ProductSchema.index({ 'inventory.sku': 1 }, { unique: true })
ProductSchema.index({ createdAt: -1 })

// 4. Add virtuals
ProductSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.basePrice) {
    return Math.round(((this.originalPrice - this.basePrice) / this.originalPrice) * 100)
  }
  return 0
})

// 5. Add middleware
ProductSchema.pre('save', function(next) {
  // Update available inventory
  this.inventory.available = Math.max(0, this.inventory.quantity - this.inventory.reserved)
  
  // Generate slug if not provided
  if (!this.seo.slug) {
    this.seo.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  }
  
  next()
})

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)
```

### State Management with Zustand

```typescript
// src/stores/cartStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  productId: string
  name: string
  basePrice: number
  image: string
  quantity: number
  customizations?: Record<string, any>
}

interface CartStore {
  items: CartItem[]
  total: number
  itemCount: number
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  
  // Computed
  getItemById: (productId: string) => CartItem | undefined
  getSubtotal: () => number
}

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: (newItem) => set((state) => {
        const existingItem = state.items.find(item => item.productId === newItem.productId)
        
        if (existingItem) {
          return {
            ...state,
            items: state.items.map(item =>
              item.productId === newItem.productId
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          }
        }

        return {
          ...state,
          items: [...state.items, { ...newItem, quantity: 1 }]
        }
      }),

      removeItem: (productId) => set((state) => ({
        ...state,
        items: state.items.filter(item => item.productId !== productId)
      })),

      updateQuantity: (productId, quantity) => set((state) => {
        if (quantity <= 0) {
          return {
            ...state,
            items: state.items.filter(item => item.productId !== productId)
          }
        }

        return {
          ...state,
          items: state.items.map(item =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          )
        }
      }),

      clearCart: () => set({ items: [], total: 0, itemCount: 0 }),

      getItemById: (productId) => {
        return get().items.find(item => item.productId === productId)
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + (item.basePrice * item.quantity), 0)
      }
    }),
    {
      name: 'glowglitch-cart',
      partialize: (state) => ({ items: state.items })
    }
  )
)

export { useCartStore }
```

---

## Design System Compliance

### Color Usage Rules

```tsx
// ✅ CORRECT: Using semantic tokens
const correctColors = {
  background: 'bg-background',      // Ivory mist
  text: 'text-foreground',         // Graphite green  
  cta: 'bg-cta',                   // Coral gold
  accent: 'text-accent',           // Champagne gold
  muted: 'text-muted',             // Rose beige
  border: 'border-border'          // Rose beige
}

// ❌ INCORRECT: Generic Tailwind colors
const incorrectColors = {
  background: 'bg-white',
  text: 'text-black',
  cta: 'bg-blue-500',
  accent: 'text-yellow-400',
  muted: 'text-gray-500',
  border: 'border-gray-300'
}
```

### Typography Hierarchy

```tsx
// Design system typography components
import { H1, H2, H3, H4, BodyText, BodyTextLarge, BodyTextSmall } from '@/components/foundation/Typography'

// ✅ CORRECT: Using typography components
function ProductDetail({ product }: { product: Product }) {
  return (
    <div>
      <H1 className="text-foreground mb-4">{product.name}</H1>
      <H2 className="text-foreground mb-3">Specifications</H2>
      <BodyTextLarge className="text-muted mb-6">
        {product.description}
      </BodyTextLarge>
      <BodyText className="text-muted">
        {product.specifications.materials.join(', ')}
      </BodyText>
    </div>
  )
}

// ❌ INCORRECT: Generic HTML with Tailwind classes
function ProductDetail({ product }: { product: Product }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
      <h2 className="text-xl font-semibold text-gray-800">Specifications</h2>
      <p className="text-lg text-gray-600">{product.description}</p>
      <p className="text-base text-gray-500">
        {product.specifications.materials.join(', ')}
      </p>
    </div>
  )
}
```

### Spacing & Layout

```tsx
// ✅ CORRECT: Using design system spacing scale (8px base)
const correctSpacing = [
  'p-1',   // 4px
  'p-2',   // 8px
  'p-3',   // 12px
  'p-4',   // 16px
  'p-5',   // 20px
  'p-6',   // 24px
  'p-7',   // 32px
  'p-8',   // 40px
  'p-9'    // 48px
]

// Container patterns
'max-w-6xl mx-auto px-4'  // Standard content container
'space-y-6'               // Vertical spacing between elements
'gap-4'                   // Grid/flex gap
```

---

## Testing Requirements

### Component Testing Template

```tsx
// __tests__/components/Button.test.tsx

import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'
import '@testing-library/jest-dom'

describe('Button Component', () => {
  // Basic rendering
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  // Variant testing
  it('applies correct styles for primary variant', () => {
    render(<Button variant="primary">Primary</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-cta', 'text-background')
  })

  it('applies correct styles for secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-background', 'border-border')
  })

  // Size testing
  it('applies correct size classes', () => {
    render(<Button size="lg">Large</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-6', 'py-3', 'min-h-12')
  })

  // Interaction testing
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  // Loading state
  it('shows loading state correctly', () => {
    render(<Button isLoading>Loading</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('disabled')
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  // Accessibility
  it('is keyboard accessible', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Accessible</Button>)
    
    const button = screen.getByRole('button')
    button.focus()
    fireEvent.keyDown(button, { key: 'Enter' })
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### API Testing Template

```typescript
// __tests__/api/products.test.ts

import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/products/route'
import connectToDatabase from '@/lib/mongodb'
import Product from '@/models/Product'

jest.mock('@/lib/mongodb')
jest.mock('@/models/Product')

describe('/api/products', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/products', () => {
    it('returns paginated products', async () => {
      const mockProducts = [
        { _id: '1', name: 'Ring 1', basePrice: 1000 },
        { _id: '2', name: 'Ring 2', basePrice: 2000 }
      ]

      ;(Product.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockProducts)
      })
      ;(Product.countDocuments as jest.Mock).mockResolvedValue(2)

      const { req } = createMocks({ method: 'GET' })
      const response = await handler(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.pagination).toEqual({
        page: 1,
        limit: 12,
        total: 2,
        totalPages: 1
      })
    })
  })

  describe('POST /api/products', () => {
    it('creates new product with valid data', async () => {
      const newProduct = {
        name: 'Test Ring',
        basePrice: 1500,
        category: 'rings',
        images: ['https://example.com/image.jpg']
      }

      ;(Product.create as jest.Mock).mockResolvedValue({
        ...newProduct,
        _id: 'new-id',
        toObject: () => ({ ...newProduct, _id: 'new-id' })
      })

      const { req } = createMocks({
        method: 'POST',
        body: newProduct
      })
      
      const response = await handler(req)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe(newProduct.name)
    })
  })
})
```

---

## Security & Performance

### Security Checklist

```typescript
// ✅ Input Validation
const userInputSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100).regex(/^[a-zA-Z\s]+$/)
})

// ✅ Authentication Check
const session = await getServerSession(authOptions)
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// ✅ Authorization Check  
if (session.user.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// ✅ SQL Injection Prevention (using Mongoose)
const products = await Product.find({ 
  category: req.body.category // Mongoose handles escaping
})

// ✅ XSS Prevention
import DOMPurify from 'dompurify'
const cleanHTML = DOMPurify.sanitize(userInput)

// ✅ Rate Limiting (implement in middleware)
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}
```

### Performance Optimization

```tsx
// ✅ Code Splitting with Dynamic Imports
const ExpensiveComponent = dynamic(
  () => import('@/components/ExpensiveComponent'),
  { 
    loading: () => <div>Loading...</div>,
    ssr: false // if component doesn't need SSR
  }
)

// ✅ Image Optimization
import Image from 'next/image'

<Image
  src="/images/product.jpg"
  alt="Product name"
  width={400}
  height={300}
  quality={85}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// ✅ Memoization for Expensive Calculations
const expensiveValue = useMemo(() => {
  return products.reduce((total, product) => total + product.price, 0)
}, [products])

// ✅ Debounced Search
const [searchTerm, setSearchTerm] = useState('')
const debouncedSearchTerm = useDebounce(searchTerm, 500)

useEffect(() => {
  if (debouncedSearchTerm) {
    performSearch(debouncedSearchTerm)
  }
}, [debouncedSearchTerm])
```

---

## Common Anti-Patterns

### ❌ Don't: Create Component Variations

```tsx
// ❌ BAD: Multiple similar components
function PrimaryButton({ children, ...props }) {
  return <button className="bg-blue-500 text-white" {...props}>{children}</button>
}

function SecondaryButton({ children, ...props }) {
  return <button className="bg-gray-500 text-white" {...props}>{children}</button>
}

function DangerButton({ children, ...props }) {
  return <button className="bg-red-500 text-white" {...props}>{children}</button>
}

// ✅ GOOD: Single component with variants
function Button({ variant = 'primary', children, ...props }) {
  const variants = {
    primary: 'bg-cta text-background',
    secondary: 'bg-background border border-border',
    danger: 'bg-error text-background'
  }
  
  return (
    <button className={variants[variant]} {...props}>
      {children}
    </button>
  )
}
```

### ❌ Don't: Ignore Error Handling

```tsx
// ❌ BAD: No error handling
async function fetchProducts() {
  const response = await fetch('/api/products')
  const data = await response.json()
  setProducts(data.products)
}

// ✅ GOOD: Comprehensive error handling
async function fetchProducts() {
  try {
    setLoading(true)
    const response = await fetch('/api/products')
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch products')
    }
    
    setProducts(data.data)
    setError(null)
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error occurred')
    console.error('Failed to fetch products:', err)
  } finally {
    setLoading(false)
  }
}
```

### ❌ Don't: Mix Business Logic with UI

```tsx
// ❌ BAD: Business logic in component
function ShoppingCart() {
  const [items, setItems] = useState([])
  
  const addItem = (product) => {
    // Complex business logic in component
    const existingItem = items.find(item => item.id === product.id)
    if (existingItem) {
      setItems(items.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setItems([...items, { ...product, quantity: 1 }])
    }
    
    // Update inventory
    fetch(`/api/inventory/${product.id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity: product.inventory - 1 })
    })
  }
  
  return <div>{/* UI code */}</div>
}

// ✅ GOOD: Separate business logic
function ShoppingCart() {
  const { items, addItem, isLoading } = useCart()
  
  return (
    <div>
      {items.map(item => (
        <CartItem 
          key={item.id} 
          item={item}
          onAdd={() => addItem(item.product)}
        />
      ))}
    </div>
  )
}
```

---

## Code Review Checklist

### Before Submitting PR

- [ ] **Design System**: All styles use design tokens from `tailwind.config.js`
- [ ] **TypeScript**: No `any` types, proper interfaces defined
- [ ] **Testing**: Components have tests, API endpoints tested
- [ ] **Accessibility**: ARIA labels, keyboard navigation, color contrast
- [ ] **Performance**: No unnecessary re-renders, images optimized
- [ ] **Security**: Inputs validated, authentication checked
- [ ] **Error Handling**: Try-catch blocks, user-friendly error messages
- [ ] **Documentation**: Complex logic documented, component props described

### During Code Review

- [ ] **Business Logic**: Does the code fit the luxury jewelry context?
- [ ] **Code Reuse**: Could existing components be used instead?
- [ ] **Consistency**: Does the code follow established patterns?
- [ ] **Scalability**: Will this code work with more data/users?
- [ ] **Maintainability**: Is the code easy to understand and modify?

---

**Last Updated**: August 12, 2025
**Version**: 1.0.0

*These guidelines ensure consistent, high-quality development for the GlowGlitch luxury jewelry platform. All AI developers must follow these patterns for code consistency and maintainability.*