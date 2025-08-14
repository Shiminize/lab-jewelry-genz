# Component Creation Guidelines

> **Comprehensive guide for creating consistent, reusable components in the GlowGlitch design system**

## Table of Contents
1. [Component Architecture](#component-architecture)
2. [Design System Integration](#design-system-integration)
3. [TypeScript Patterns](#typescript-patterns)
4. [Testing Requirements](#testing-requirements)
5. [Accessibility Standards](#accessibility-standards)
6. [Performance Optimization](#performance-optimization)
7. [Component Templates](#component-templates)
8. [Common Patterns](#common-patterns)

---

## Component Architecture

### Directory Structure

```
src/components/
├── foundation/              # Base typography, layout primitives
│   ├── Typography.tsx       # H1, H2, BodyText components
│   ├── Layout.tsx          # Container, Grid, Flex primitives
│   └── Spacing.tsx         # Spacer, Divider components
├── ui/                     # Generic UI components
│   ├── Button.tsx          # Button with variants
│   ├── Input.tsx           # Form input components
│   ├── Modal.tsx           # Modal, Dialog components
│   └── index.ts            # Barrel exports
├── forms/                  # Form-specific components
│   ├── LoginForm.tsx       # Domain-specific forms
│   ├── CheckoutForm.tsx    # Complex form compositions
│   └── FormField.tsx       # Form field wrapper
├── layout/                 # Page layout components
│   ├── Header.tsx          # Site header
│   ├── Footer.tsx          # Site footer
│   └── Navigation.tsx      # Navigation components
├── products/               # Product-domain components
│   ├── ProductCard.tsx     # Product display
│   ├── ProductGrid.tsx     # Product listings
│   └── ProductFilter.tsx   # Filtering UI
├── cart/                   # Shopping cart components
└── admin/                  # Admin-specific components
```

### Component Hierarchy Decision Tree

```
New Component Needed?
│
├─ Is it a visual primitive? (Button, Input, Card)
│   └─ Place in: src/components/ui/
│
├─ Is it typography or layout?
│   └─ Place in: src/components/foundation/
│
├─ Is it domain-specific? (Product, Order, User)
│   └─ Place in: src/components/[domain]/
│
├─ Is it page layout? (Header, Footer, Sidebar)
│   └─ Place in: src/components/layout/
│
└─ Is it form-related?
    └─ Place in: src/components/forms/
```

---

## Design System Integration

### Using Design Tokens

**Always use design system tokens instead of hardcoded values:**

```tsx
// ✅ CORRECT: Using design system tokens
function ProductCard() {
  return (
    <div className="bg-background text-foreground border border-border rounded-md p-4">
      <H3 className="text-foreground mb-2">Product Name</H3>
      <BodyText className="text-muted">Product description</BodyText>
      <Button variant="primary" size="md">Add to Cart</Button>
    </div>
  )
}

// ❌ INCORRECT: Hardcoded Tailwind classes
function ProductCard() {
  return (
    <div className="bg-white text-black border border-gray-300 rounded-md p-4">
      <h3 className="text-black text-lg font-bold mb-2">Product Name</h3>
      <p className="text-gray-600 text-base">Product description</p>
      <button className="bg-blue-500 text-white px-4 py-2 rounded">Add to Cart</button>
    </div>
  )
}
```

### Design System Tokens Reference

```tsx
// Colors
'bg-background'      // Ivory mist background
'bg-foreground'      // Graphite green (for dark backgrounds)
'bg-cta'            // Coral gold buttons
'bg-cta-hover'      // Burnt coral hover state
'bg-accent'         // Champagne gold highlights
'bg-muted'          // Rose beige secondary elements
'border-border'     // Rose beige borders

'text-background'   // White text on dark backgrounds
'text-foreground'   // Graphite green text
'text-cta'         // Coral gold text
'text-accent'      // Champagne gold text
'text-muted'       // Rose beige muted text

// Typography
'font-headline'     // Fraunces for headlines
'font-body'        // Inter for body text

// Spacing (8px base scale)
'p-1' // 4px    'p-2' // 8px     'p-3' // 12px
'p-4' // 16px   'p-5' // 20px    'p-6' // 24px
'p-7' // 32px   'p-8' // 40px    'p-9' // 48px
```

---

## TypeScript Patterns

### Component Interface Pattern

```tsx
// 1. Define base component props
interface BaseComponentProps {
  children?: React.ReactNode
  className?: string
  id?: string
}

// 2. Extend HTML element props when appropriate
interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: React.ReactNode
}

// 3. For complex components, use composition
interface ProductCardProps extends BaseComponentProps {
  product: {
    _id: string
    name: string
    basePrice: number
    originalPrice?: number
    images: {
      primary: string
      gallery: string[]
    }
    category: 'rings' | 'necklaces' | 'earrings' | 'bracelets'
  }
  onAddToCart?: (productId: string) => Promise<void>
  onAddToWishlist?: (productId: string) => void
  showQuickView?: boolean
  variant?: 'standard' | 'compact' | 'featured'
}
```

### Generic Component Pattern

```tsx
// For flexible, reusable components
interface ListProps<T> extends BaseComponentProps {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string
  loading?: boolean
  emptyState?: React.ReactNode
  loadMore?: () => void
  hasMore?: boolean
}

function List<T>({ 
  items, 
  renderItem, 
  keyExtractor, 
  loading, 
  emptyState,
  loadMore,
  hasMore,
  className 
}: ListProps<T>) {
  if (loading) {
    return <LoadingSpinner />
  }

  if (items.length === 0 && emptyState) {
    return <div>{emptyState}</div>
  }

  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item, index) => (
        <div key={keyExtractor(item)}>
          {renderItem(item, index)}
        </div>
      ))}
      {hasMore && loadMore && (
        <Button onClick={loadMore} variant="secondary">
          Load More
        </Button>
      )}
    </div>
  )
}

// Usage
<List
  items={products}
  renderItem={(product) => <ProductCard product={product} />}
  keyExtractor={(product) => product._id}
  emptyState={<EmptyProductsState />}
  loadMore={handleLoadMore}
  hasMore={hasMoreProducts}
/>
```

---

## Testing Requirements

### Component Test Template

```tsx
// __tests__/components/ProductCard.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductCard } from '@/components/products/ProductCard'
import '@testing-library/jest-dom'

const mockProduct = {
  _id: 'product-1',
  name: 'Test Ring',
  basePrice: 2400,
  originalPrice: 2800,
  images: {
    primary: '/images/test-ring.jpg',
    gallery: ['/images/test-ring-2.jpg']
  },
  category: 'rings' as const
}

describe('ProductCard', () => {
  // Basic rendering tests
  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('Test Ring')).toBeInTheDocument()
    expect(screen.getByText('$2,400')).toBeInTheDocument()
    expect(screen.getByText('$2,800')).toBeInTheDocument()
    expect(screen.getByAltText('Test Ring')).toBeInTheDocument()
  })

  // Interaction tests
  it('calls onAddToCart when add to cart button is clicked', async () => {
    const mockAddToCart = jest.fn().mockResolvedValue(undefined)
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockAddToCart} 
      />
    )
    
    const addButton = screen.getByRole('button', { name: /add to cart/i })
    await userEvent.click(addButton)
    
    expect(mockAddToCart).toHaveBeenCalledWith('product-1')
  })

  // Variant tests
  it('applies compact variant styles', () => {
    render(<ProductCard product={mockProduct} variant="compact" />)
    
    const card = screen.getByRole('article') // assuming semantic markup
    expect(card).toHaveClass('compact-variant-class')
  })

  // Accessibility tests
  it('has proper accessibility attributes', () => {
    render(<ProductCard product={mockProduct} />)
    
    const productLink = screen.getByRole('link')
    expect(productLink).toHaveAttribute('aria-label', expect.stringContaining('Test Ring'))
    
    const image = screen.getByAltText('Test Ring')
    expect(image).toBeInTheDocument()
  })

  // Loading states
  it('shows loading state when adding to cart', async () => {
    const mockAddToCart = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockAddToCart} 
      />
    )
    
    const addButton = screen.getByRole('button', { name: /add to cart/i })
    await userEvent.click(addButton)
    
    expect(screen.getByText('Adding...')).toBeInTheDocument()
    expect(addButton).toBeDisabled()
  })

  // Error states
  it('handles add to cart errors gracefully', async () => {
    const mockAddToCart = jest.fn().mockRejectedValue(new Error('Network error'))
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockAddToCart} 
      />
    )
    
    const addButton = screen.getByRole('button', { name: /add to cart/i })
    await userEvent.click(addButton)
    
    await waitFor(() => {
      expect(screen.getByText(/failed to add/i)).toBeInTheDocument()
    })
  })
})
```

### Integration Test Pattern

```tsx
// __tests__/components/ProductGrid.integration.test.tsx

import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProductGrid } from '@/components/products/ProductGrid'
import { server } from '../mocks/server'

// Mock API responses
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('ProductGrid Integration', () => {
  it('loads and displays products from API', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })

    render(
      <QueryClientProvider client={queryClient}>
        <ProductGrid category="rings" />
      </QueryClientProvider>
    )

    // Loading state
    expect(screen.getByText('Loading products...')).toBeInTheDocument()

    // Products loaded
    await waitFor(() => {
      expect(screen.getByText('Eternal Solitaire Ring')).toBeInTheDocument()
      expect(screen.getByText('Halo Radiance Ring')).toBeInTheDocument()
    })
  })
})
```

---

## Accessibility Standards

### WCAG 2.1 AA Compliance Checklist

```tsx
// ✅ Semantic HTML structure
function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="product-card">
      <header>
        <h3>{product.name}</h3>
      </header>
      <div className="product-image">
        <img 
          src={product.images.primary}
          alt={`${product.name} - ${product.category}`}
          loading="lazy"
        />
      </div>
      <footer className="product-actions">
        <Button 
          onClick={handleAddToCart}
          aria-label={`Add ${product.name} to cart for $${product.basePrice}`}
        >
          Add to Cart
        </Button>
      </footer>
    </article>
  )
}

// ✅ Keyboard navigation support
function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Focus trap
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements?.[0] as HTMLElement
      firstElement?.focus()
    }
  }, [isOpen])

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div 
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
      className="modal-overlay"
    >
      {children}
    </div>
  )
}

// ✅ Color contrast compliance
// All color combinations tested for WCAG AA (4.5:1) contrast ratio
const accessibleColorCombinations = {
  'bg-background text-foreground': '4.8:1', // ✅ Pass
  'bg-cta text-background': '5.2:1',        // ✅ Pass
  'bg-muted text-foreground': '4.6:1',      // ✅ Pass
  'bg-accent text-foreground': '4.9:1'      // ✅ Pass
}
```

### Screen Reader Support

```tsx
// ✅ ARIA labels and descriptions
function PriceDisplay({ current, original }: PriceProps) {
  const discount = original ? Math.round(((original - current) / original) * 100) : 0

  return (
    <div className="price-display">
      <span 
        className="current-price text-foreground font-semibold"
        aria-label={`Current price: $${current}`}
      >
        ${current}
      </span>
      {original && (
        <>
          <span 
            className="original-price text-muted line-through"
            aria-label={`Original price: $${original}`}
          >
            ${original}
          </span>
          <span 
            className="discount-badge bg-accent text-foreground"
            aria-label={`${discount}% discount`}
          >
            {discount}% off
          </span>
        </>
      )}
    </div>
  )
}

// ✅ Loading and error state announcements
function AsyncButton({ onClick, children }: AsyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await onClick()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button 
        onClick={handleClick} 
        disabled={isLoading}
        aria-describedby={error ? 'button-error' : undefined}
      >
        {isLoading ? 'Loading...' : children}
      </Button>
      {error && (
        <div 
          id="button-error" 
          role="alert" 
          className="error-message text-error"
        >
          {error}
        </div>
      )}
      {isLoading && (
        <div 
          role="status" 
          aria-live="polite"
          className="sr-only"
        >
          Loading, please wait...
        </div>
      )}
    </>
  )
}
```

---

## Performance Optimization

### React Performance Patterns

```tsx
// ✅ Memoization for expensive calculations
function ProductGrid({ products, filters }: ProductGridProps) {
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      return (
        (!filters.category || product.category === filters.category) &&
        (!filters.minPrice || product.basePrice >= filters.minPrice) &&
        (!filters.maxPrice || product.basePrice <= filters.maxPrice)
      )
    })
  }, [products, filters])

  return (
    <div className="product-grid">
      {filteredProducts.map(product => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )
}

// ✅ React.memo for preventing unnecessary re-renders
const ProductCard = React.memo(function ProductCard({ 
  product, 
  onAddToCart 
}: ProductCardProps) {
  return (
    <div className="product-card">
      {/* Component content */}
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for complex objects
  return (
    prevProps.product._id === nextProps.product._id &&
    prevProps.product.basePrice === nextProps.product.basePrice
  )
})

// ✅ useCallback for stable function references
function ProductList({ products }: ProductListProps) {
  const [cart, setCart] = useState<CartItem[]>([])

  const handleAddToCart = useCallback((productId: string) => {
    return async () => {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      })
      
      if (response.ok) {
        // Update local cart state
        setCart(prevCart => [...prevCart, { productId, quantity: 1 }])
      }
    }
  }, [])

  return (
    <div>
      {products.map(product => (
        <ProductCard 
          key={product._id}
          product={product}
          onAddToCart={handleAddToCart(product._id)}
        />
      ))}
    </div>
  )
}
```

### Bundle Optimization

```tsx
// ✅ Lazy loading for large components
const ProductCustomizer = lazy(() => 
  import('@/components/products/ProductCustomizer').then(module => ({
    default: module.ProductCustomizer
  }))
)

function ProductDetail({ product }: ProductDetailProps) {
  const [showCustomizer, setShowCustomizer] = useState(false)

  return (
    <div>
      <ProductInfo product={product} />
      
      <Button onClick={() => setShowCustomizer(true)}>
        Customize Product
      </Button>

      {showCustomizer && (
        <Suspense fallback={<CustomizerSkeleton />}>
          <ProductCustomizer product={product} />
        </Suspense>
      )}
    </div>
  )
}

// ✅ Image optimization with Next.js
function ProductImage({ product }: ProductImageProps) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-md">
      <Image
        src={product.images.primary}
        alt={product.name}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        className="object-cover"
        quality={85}
        loading="lazy"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
      />
    </div>
  )
}
```

---

## Component Templates

### Basic UI Component Template

```tsx
// src/components/ui/ComponentName.tsx

'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// 1. Define variants using CVA
const componentVariants = cva(
  // Base styles using design tokens
  'inline-flex items-center justify-center font-body transition-colors focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed',
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

// 2. Define component props interface
interface ComponentNameProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof componentVariants> {
  children: React.ReactNode
  isLoading?: boolean
  icon?: React.ReactNode
}

// 3. Component implementation
export function ComponentName({ 
  className,
  variant,
  size,
  children,
  isLoading = false,
  icon,
  disabled,
  ...props
}: ComponentNameProps) {
  return (
    <button
      className={cn(componentVariants({ variant, size }), className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </div>
      )}
    </button>
  )
}

// 4. Export variants type for external use
export type ComponentNameVariant = VariantProps<typeof componentVariants>
```

### Form Component Template

```tsx
// src/components/forms/FormField.tsx

'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactElement
  className?: string
}

export function FormField({
  label,
  error,
  required = false,
  children,
  className
}: FormFieldProps) {
  const fieldId = children.props.id || `field-${label.toLowerCase().replace(/\s/g, '-')}`

  return (
    <div className={cn('space-y-2', className)}>
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="text-error ml-1" aria-label="required">*</span>}
      </label>
      
      {React.cloneElement(children, {
        id: fieldId,
        'aria-invalid': error ? 'true' : 'false',
        'aria-describedby': error ? `${fieldId}-error` : undefined,
        className: cn(
          children.props.className,
          error && 'border-error focus:ring-error'
        )
      })}
      
      {error && (
        <p 
          id={`${fieldId}-error`}
          role="alert"
          className="text-sm text-error"
        >
          {error}
        </p>
      )}
    </div>
  )
}

// Input component with forwarded ref
export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

// Usage example
function ContactForm() {
  return (
    <form className="space-y-6">
      <FormField label="Email Address" required error={emailError}>
        <Input type="email" placeholder="Enter your email" />
      </FormField>
      
      <FormField label="Message" required>
        <textarea 
          className="min-h-24 resize-none" 
          placeholder="Your message"
        />
      </FormField>
    </form>
  )
}
```

### Complex Component Template

```tsx
// src/components/products/ProductCard.tsx

'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Eye, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { H3, BodyText } from '@/components/foundation/Typography'

// 1. Define prop interfaces
interface Product {
  _id: string
  name: string
  basePrice: number
  originalPrice?: number
  images: {
    primary: string
    gallery: string[]
  }
  category: string
  metadata: {
    featured: boolean
    bestseller: boolean
  }
}

interface ProductCardProps {
  product: Product
  variant?: 'standard' | 'compact' | 'featured'
  onAddToCart?: (productId: string) => Promise<void>
  onAddToWishlist?: (productId: string) => void
  onQuickView?: (productId: string) => void
  showQuickActions?: boolean
  className?: string
}

// 2. Component implementation
export function ProductCard({
  product,
  variant = 'standard',
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  showQuickActions = true,
  className
}: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!onAddToCart) return

    try {
      setIsLoading(true)
      await onAddToCart(product._id)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      // Handle error (toast notification, etc.)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsWishlisted(!isWishlisted)
    onAddToWishlist?.(product._id)
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onQuickView?.(product._id)
  }

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.basePrice) / product.originalPrice) * 100)
    : 0

  // 3. Variant-based styling
  const cardVariants = {
    standard: 'bg-background border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow',
    compact: 'bg-background border-0 rounded-md',
    featured: 'bg-background border-2 border-accent rounded-lg shadow-lg'
  }

  return (
    <article className={cn(cardVariants[variant], 'group overflow-hidden', className)}>
      <Link href={`/products/${product._id}`}>
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.images.primary}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 space-y-1">
            {product.metadata.featured && (
              <span className="bg-accent text-foreground px-2 py-1 rounded text-xs font-medium">
                Featured
              </span>
            )}
            {discountPercent > 0 && (
              <span className="bg-error text-background px-2 py-1 rounded text-xs font-medium">
                {discountPercent}% Off
              </span>
            )}
          </div>

          {/* Quick Actions Overlay */}
          {showQuickActions && (
            <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleQuickView}
                aria-label={`Quick view ${product.name}`}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant={isWishlisted ? 'primary' : 'secondary'}
                size="sm"
                onClick={handleWishlist}
                aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
              >
                <Heart className={cn('w-4 h-4', isWishlisted && 'fill-current')} />
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddToCart}
                disabled={isLoading}
                aria-label={`Add ${product.name} to cart`}
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          <H3 className="text-foreground mb-2 group-hover:text-accent transition-colors">
            {product.name}
          </H3>
          
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-foreground font-semibold">
              ${product.basePrice.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-muted line-through text-sm">
                ${product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Compact variant shows less info */}
          {variant !== 'compact' && (
            <BodyText className="text-muted text-sm mb-4">
              {product.category} • Premium Collection
            </BodyText>
          )}

          {/* Add to cart button (always visible on mobile) */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddToCart}
            disabled={isLoading}
            className="w-full md:hidden"
          >
            {isLoading ? 'Adding...' : 'Add to Cart'}
          </Button>
        </div>
      </Link>
    </article>
  )
}

// 4. Export component variants type
export type ProductCardVariant = 'standard' | 'compact' | 'featured'
```

---

## Common Patterns

### Error Boundary Pattern

```tsx
// src/components/ErrorBoundary.tsx

'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { H2, BodyText } from '@/components/foundation/Typography'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-64 text-center p-6">
          <H2 className="text-foreground mb-4">Something went wrong</H2>
          <BodyText className="text-muted mb-6 max-w-md">
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </BodyText>
          <Button 
            variant="primary"
            onClick={() => this.setState({ hasError: false, error: undefined })}
          >
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

// Usage
function App() {
  return (
    <ErrorBoundary onError={(error) => trackError(error)}>
      <ProductGrid />
    </ErrorBoundary>
  )
}
```

### Loading State Pattern

```tsx
// src/components/ui/LoadingState.tsx

interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton' | 'dots'
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingState({ 
  variant = 'spinner', 
  size = 'md', 
  text,
  className 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  if (variant === 'skeleton') {
    return <SkeletonLoader size={size} className={className} />
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center space-x-1', className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn('bg-muted rounded-full animate-pulse', sizeClasses[size])}
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
        {text && <span className="ml-2 text-muted">{text}</span>}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn(
        'border-2 border-muted border-t-accent rounded-full animate-spin',
        sizeClasses[size]
      )} />
      {text && <span className="ml-2 text-muted">{text}</span>}
    </div>
  )
}
```

---

**Last Updated**: August 12, 2025
**Version**: 1.0.0

*These guidelines ensure consistent, accessible, and performant component development across the GlowGlitch platform. All components should follow these patterns for maintainability and user experience.*