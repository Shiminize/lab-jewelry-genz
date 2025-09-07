# GlitchGlow Development Standards Guide
> Comprehensive coding conventions, architectural principles, and quality guidelines

## Table of Contents
1. [Project Overview](#project-overview)
2. [Coding Conventions](#coding-conventions)
3. [Architectural Principles](#architectural-principles)
4. [Design System Specifications](#design-system-specifications)
5. [Testing Requirements](#testing-requirements)
6. [Performance Guidelines](#performance-guidelines)
7. [Security Standards](#security-standards)
8. [Accessibility Requirements](#accessibility-requirements)
9. [Documentation Standards](#documentation-standards)

---

## 1. Project Overview

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS + Aurora Design System
- **Database**: MongoDB with Mongoose
- **State Management**: React Context + Custom Hooks
- **Testing**: Jest, React Testing Library, Playwright
- **Package Manager**: npm
- **Version Control**: Git

### Key Directories
```
src/
├── app/           # Next.js app router pages
├── components/    # React components (presentation layer)
├── hooks/         # Custom React hooks (business logic)
├── services/      # API services (data layer)
├── lib/           # Utilities and helpers
├── styles/        # Global styles and CSS modules
└── data/          # Static data and configurations
```

---

## 2. Coding Conventions

### TypeScript Standards

#### Type Definitions
```typescript
// ✅ GOOD: Explicit types with interfaces
interface Product {
  id: string
  name: string
  price: number
  materials: Material[]
  isCustomizable?: boolean
}

// ❌ BAD: Using 'any' or implicit types
const product: any = { /* ... */ }
```

#### Function Signatures
```typescript
// ✅ GOOD: Typed parameters and return values
function calculateDiscount(price: number, percentage: number): number {
  return price * (1 - percentage / 100)
}

// ❌ BAD: Untyped functions
function calculateDiscount(price, percentage) {
  return price * (1 - percentage / 100)
}
```

### ESLint Configuration
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": ["warn", { "allow": ["error", "warn"] }],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", { 
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### Prettier Configuration
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ProductCard.tsx` |
| Hooks | camelCase with 'use' prefix | `useProductData.ts` |
| Services | camelCase | `productService.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_CART_ITEMS` |
| CSS Classes | kebab-case | `product-card-container` |
| File Names | PascalCase for components, camelCase for others | `Button.tsx`, `apiHelpers.ts` |

### Import Order
```typescript
// 1. External packages
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

// 2. Internal absolute imports
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

// 3. Relative imports
import { ProductCard } from './ProductCard'
import styles from './Product.module.css'

// 4. Type imports
import type { Product, ProductVariant } from '@/types/product'
```

---

## 3. Architectural Principles

### Layer Architecture

#### Feature Complexity Classification
- **Simple Features** (navigation, tabs, modals): Direct component layer only
- **Moderate Features** (forms, search): Hook + Component
- **Complex Features** (3D viewers, payments): Service → Hook → Component

#### Component Layer (`/src/components/`)
```typescript
// ✅ GOOD: Presentation only
export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <button onClick={() => onAddToCart(product.id)}>
        Add to Cart
      </button>
    </div>
  )
}

// ❌ BAD: Direct API calls in component
export function ProductCard({ productId }: Props) {
  useEffect(() => {
    fetch('/api/products/' + productId) // ❌ No direct API calls
  }, [])
}
```

#### Hook Layer (`/src/hooks/`)
```typescript
// ✅ GOOD: Business logic orchestration
export function useProduct(productId: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    productService.getProduct(productId)
      .then(setProduct)
      .finally(() => setLoading(false))
  }, [productId])
  
  return { product, loading }
}
```

#### Service Layer (`/src/services/`)
```typescript
// ✅ GOOD: API communication only
class ProductService {
  async getProduct(id: string): Promise<Product> {
    const response = await fetch(`/api/products/${id}`)
    if (!response.ok) throw new Error('Product not found')
    return response.json()
  }
}

export const productService = new ProductService()
```

### Component Guidelines

#### File Size Limits
- **Maximum**: 300 lines per file
- **Functions per component**: Simple (1-2), Moderate (3-4), Complex (requires justification)

#### Component Structure
```typescript
// 1. Imports
import React from 'react'

// 2. Types
interface ComponentProps {
  title: string
  isActive?: boolean
}

// 3. Constants
const MAX_ITEMS = 10

// 4. Component
export function Component({ title, isActive = false }: ComponentProps) {
  // 5. State & hooks
  const [count, setCount] = useState(0)
  
  // 6. Effects
  useEffect(() => {
    // Effect logic
  }, [])
  
  // 7. Handlers
  const handleClick = () => {
    setCount(prev => prev + 1)
  }
  
  // 8. Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### State Management

#### Context Usage
```typescript
// ✅ GOOD: Only for truly global state
const AuthContext = createContext<AuthContextType | null>(null)

// ❌ BAD: Context for local component state
const ButtonContext = createContext() // Unnecessary for simple UI state
```

#### Custom Hook Pattern
```typescript
// ✅ GOOD: Encapsulated logic with clear return
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  
  const addItem = useCallback((product: Product) => {
    setItems(prev => [...prev, { ...product, quantity: 1 }])
  }, [])
  
  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])
  
  return {
    items,
    addItem,
    removeItem,
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }
}
```

---

## 4. Design System Specifications

### Aurora Design System Compliance

#### Color Tokens (Required)
```css
:root {
  --deep-space: #0A0E27;
  --nebula-purple: #6B46C1;
  --aurora-pink: #FF6B9D;
  --aurora-crimson: #C44569;
  --aurora-plum: #723C70;
  --lunar-grey: #F7F7F9;
  --emerald-flash: #10B981;
  --amber-glow: #F59E0B;
}
```

#### Typography Scale
```css
/* Only use these defined sizes */
--font-hero: clamp(3rem, 8vw, 6rem);
--font-statement: clamp(2.5rem, 6vw, 4rem);
--font-title-xl: clamp(2rem, 4vw, 3rem);
--font-title-l: clamp(1.5rem, 3vw, 2.25rem);
--font-title-m: clamp(1.25rem, 2.5vw, 1.75rem);
--font-body-xl: clamp(1.125rem, 2vw, 1.5rem);
--font-body-l: 1.125rem;
--font-body-m: 1rem;
--font-small: 0.875rem;
--font-micro: 0.75rem;
```

#### Shadow System
```css
/* Use color-mix for all shadows */
--shadow-near: 0 2px 8px color-mix(in srgb, var(--nebula-purple) 20%, transparent);
--shadow-float: 0 8px 24px color-mix(in srgb, var(--nebula-purple) 15%, transparent);
--shadow-hover: 0 16px 48px color-mix(in srgb, var(--nebula-purple) 12%, transparent);
--shadow-modal: 0 24px 64px color-mix(in srgb, var(--nebula-purple) 10%, transparent);
```

#### Border Radius Scale
```css
/* Only use these values */
--radius-micro: 3px;
--radius-small: 5px;
--radius-medium: 8px;
--radius-large: 13px;
--radius-xl: 21px;
--radius-xxl: 34px;
```

### Component Prop Standards

#### Button Component
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size: 'small' | 'medium' | 'large'
  isLoading?: boolean
  isDisabled?: boolean
  fullWidth?: boolean
  onClick?: () => void
  children: React.ReactNode
}
```

#### Card Component
```typescript
interface CardProps {
  elevation: 'near' | 'float' | 'hover' | 'modal'
  padding: 'none' | 'small' | 'medium' | 'large'
  borderRadius: 'small' | 'medium' | 'large'
  interactive?: boolean
  children: React.ReactNode
}
```

### Responsive Breakpoints
```css
/* Tailwind breakpoints aligned with design system */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet portrait */
lg: 1024px  /* Tablet landscape */
xl: 1280px  /* Desktop */
2xl: 1536px /* Large desktop */
```

### Mobile-First Patterns
```tsx
// ✅ GOOD: Mobile-first with progressive enhancement
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {/* Content */}
</div>

// ❌ BAD: Desktop-first approach
<div className="grid grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
  {/* Content */}
</div>
```

---

## 5. Testing Requirements

### Unit Testing (Jest + RTL)

#### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from '@/components/ProductCard'

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Diamond Ring',
    price: 2999
  }
  
  it('should render product information', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('Diamond Ring')).toBeInTheDocument()
    expect(screen.getByText('$2,999')).toBeInTheDocument()
  })
  
  it('should handle add to cart action', () => {
    const onAddToCart = jest.fn()
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />)
    
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))
    expect(onAddToCart).toHaveBeenCalledWith('1')
  })
})
```

#### Hook Testing
```typescript
import { renderHook, act } from '@testing-library/react'
import { useCart } from '@/hooks/useCart'

describe('useCart', () => {
  it('should add items to cart', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addItem({ id: '1', name: 'Ring', price: 100 })
    })
    
    expect(result.current.items).toHaveLength(1)
    expect(result.current.total).toBe(100)
  })
})
```

### E2E Testing (Playwright)

#### Test Structure
```typescript
import { test, expect } from '@playwright/test'

test.describe('Product Catalog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalog')
  })
  
  test('should filter products by category', async ({ page }) => {
    // Arrange
    await page.waitForSelector('[data-testid="product-card"]')
    
    // Act
    await page.click('button:has-text("Necklaces")')
    
    // Assert
    const products = page.locator('[data-testid="product-card"]')
    await expect(products).toHaveCount(12)
    
    for (const product of await products.all()) {
      await expect(product).toContainText('Necklace')
    }
  })
  
  test('should handle mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Open mobile menu
    await page.click('[data-testid="mobile-menu-toggle"]')
    await expect(page.locator('[data-testid="mobile-drawer"]')).toBeVisible()
    
    // Navigate to category
    await page.click('text=Earrings')
    await expect(page).toHaveURL('/catalog?category=earrings')
  })
})
```

### Testing Coverage Requirements
- **Unit Tests**: Minimum 80% coverage for business logic
- **Integration Tests**: Critical user flows (checkout, authentication)
- **E2E Tests**: Happy path for all major features
- **Visual Regression**: Key pages and components

### Test File Naming
```
ComponentName.test.tsx      # Unit tests
ComponentName.spec.ts       # E2E tests
ComponentName.visual.spec.ts # Visual regression tests
```

---

## 6. Performance Guidelines

### Bundle Size Optimization

#### Code Splitting
```typescript
// ✅ GOOD: Dynamic imports for heavy components
const ProductCustomizer = dynamic(
  () => import('@/components/customizer/ProductCustomizer'),
  { 
    loading: () => <CustomizerSkeleton />,
    ssr: false 
  }
)

// ❌ BAD: Static imports for rarely used components
import { HeavyVisualizationComponent } from '@/components/heavy'
```

#### Tree Shaking
```typescript
// ✅ GOOD: Named imports
import { debounce } from 'lodash-es'

// ❌ BAD: Default import of entire library
import _ from 'lodash'
```

### Rendering Optimization

#### Memoization
```typescript
// ✅ GOOD: Memoize expensive computations
const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(
    () => heavyProcessing(data),
    [data]
  )
  
  const handleClick = useCallback(
    (id: string) => {
      // Handle click
    },
    []
  )
  
  return <div>{/* Render */}</div>
})

// ❌ BAD: Re-creating functions on every render
function Component({ data }) {
  const handleClick = (id) => { /* ... */ } // Recreated every render
}
```

#### Virtual Scrolling
```typescript
// For lists > 100 items, use virtual scrolling
import { FixedSizeList } from 'react-window'

function ProductList({ products }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={products.length}
      itemSize={120}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <ProductCard product={products[index]} />
        </div>
      )}
    </FixedSizeList>
  )
}
```

### API Performance

#### Data Fetching Patterns
```typescript
// ✅ GOOD: Parallel requests when possible
const [products, categories] = await Promise.all([
  productService.getProducts(),
  categoryService.getCategories()
])

// ❌ BAD: Sequential requests when not necessary
const products = await productService.getProducts()
const categories = await categoryService.getCategories()
```

#### Caching Strategy
```typescript
// Server-side caching
export async function GET(request: Request) {
  const cached = await redis.get('products')
  if (cached) return NextResponse.json(cached)
  
  const products = await db.products.find()
  await redis.set('products', products, { ex: 3600 }) // 1 hour cache
  
  return NextResponse.json(products)
}

// Client-side caching with SWR
const { data, error } = useSWR('/api/products', fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 60000 // Refresh every minute
})
```

### Performance Metrics

| Metric | Target | Critical |
|--------|--------|----------|
| FCP (First Contentful Paint) | < 1.8s | < 3.0s |
| LCP (Largest Contentful Paint) | < 2.5s | < 4.0s |
| TTI (Time to Interactive) | < 3.8s | < 7.3s |
| CLS (Cumulative Layout Shift) | < 0.1 | < 0.25 |
| FID (First Input Delay) | < 100ms | < 300ms |
| Bundle Size (gzipped) | < 200KB | < 400KB |
| API Response Time | < 200ms | < 1000ms |

---

## 7. Security Standards

### Input Validation
```typescript
import { z } from 'zod'

// Define schema
const ProductSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive().max(1000000),
  description: z.string().max(1000),
  materials: z.array(z.enum(['gold', 'silver', 'platinum']))
})

// Validate input
export async function POST(request: Request) {
  const body = await request.json()
  
  try {
    const validatedData = ProductSchema.parse(body)
    // Process valid data
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid input' },
      { status: 400 }
    )
  }
}
```

### Authentication & Authorization
```typescript
// Middleware for protected routes
export function withAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    try {
      const user = await verifyToken(token)
      req.user = user
      return handler(req, res)
    } catch {
      return res.status(401).json({ error: 'Invalid token' })
    }
  }
}
```

### XSS Prevention
```typescript
// ✅ GOOD: Sanitize user input
import DOMPurify from 'isomorphic-dompurify'

function UserComment({ comment }: { comment: string }) {
  const sanitized = DOMPurify.sanitize(comment)
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
}

// ❌ BAD: Direct HTML injection
function UserComment({ comment }) {
  return <div dangerouslySetInnerHTML={{ __html: comment }} />
}
```

### Environment Variables
```bash
# .env.local
DATABASE_URL=mongodb://... # Never commit real credentials
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_... # Public keys can be exposed
```

---

## 8. Accessibility Requirements

### WCAG 2.1 AA Compliance

#### Semantic HTML
```tsx
// ✅ GOOD: Proper semantic structure
<nav aria-label="Main navigation">
  <ul role="list">
    <li><a href="/products">Products</a></li>
  </ul>
</nav>

// ❌ BAD: Non-semantic divs
<div className="navigation">
  <div className="nav-item">Products</div>
</div>
```

#### ARIA Labels
```tsx
// ✅ GOOD: Descriptive ARIA labels
<button 
  aria-label="Add Diamond Ring to cart"
  aria-pressed={isInCart}
>
  <ShoppingCart aria-hidden="true" />
</button>

// ❌ BAD: Missing context
<button>
  <ShoppingCart />
</button>
```

#### Keyboard Navigation
```tsx
// ✅ GOOD: Full keyboard support
function NavigationMenu() {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
        focusNextItem()
        break
      case 'ArrowLeft':
        focusPreviousItem()
        break
      case 'Enter':
      case ' ':
        selectCurrentItem()
        break
      case 'Escape':
        closeMenu()
        break
    }
  }
  
  return (
    <nav role="navigation" onKeyDown={handleKeyDown}>
      {/* Menu items */}
    </nav>
  )
}
```

#### Focus Management
```tsx
// ✅ GOOD: Proper focus trap in modals
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus()
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])
  
  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      {children}
    </div>
  )
}
```

#### Color Contrast
- Normal text: Minimum 4.5:1 contrast ratio
- Large text: Minimum 3:1 contrast ratio
- Interactive elements: Minimum 3:1 contrast ratio

---

## 9. Documentation Standards

### Component Documentation
```typescript
/**
 * ProductCard displays product information in a card layout
 * 
 * @example
 * ```tsx
 * <ProductCard 
 *   product={product}
 *   onAddToCart={handleAddToCart}
 *   showQuickView
 * />
 * ```
 */
interface ProductCardProps {
  /** Product data to display */
  product: Product
  /** Callback when add to cart is clicked */
  onAddToCart?: (productId: string) => void
  /** Show quick view button */
  showQuickView?: boolean
  /** Custom className for styling */
  className?: string
}
```

### API Documentation
```typescript
/**
 * Get products with optional filtering
 * 
 * @route GET /api/products
 * @param {string} category - Filter by category
 * @param {number} minPrice - Minimum price filter
 * @param {number} maxPrice - Maximum price filter
 * @param {string} sortBy - Sort field (price, name, date)
 * @param {string} order - Sort order (asc, desc)
 * 
 * @returns {Product[]} Array of products
 * 
 * @example
 * GET /api/products?category=rings&minPrice=1000&maxPrice=5000&sortBy=price&order=asc
 */
export async function GET(request: Request) {
  // Implementation
}
```

### README Structure
```markdown
# Component/Feature Name

## Overview
Brief description of the component/feature purpose

## Installation
\`\`\`bash
npm install required-packages
\`\`\`

## Usage
\`\`\`tsx
import { Component } from '@/components/Component'

function Example() {
  return <Component prop="value" />
}
\`\`\`

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| prop1 | string | - | Description |

## Examples
[Provide 2-3 common use cases]

## Accessibility
[ARIA requirements and keyboard navigation]

## Browser Support
[Supported browsers and versions]
```

---

## Enforcement & Tools

### Pre-commit Hooks (husky + lint-staged)
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --findRelatedTests --passWithNoTests"
    ],
    "*.{css,scss}": [
      "stylelint --fix",
      "prettier --write"
    ]
  }
}
```

### CI/CD Pipeline Checks
1. **Linting**: ESLint must pass with no errors
2. **Type Checking**: TypeScript compilation with no errors
3. **Unit Tests**: Minimum 80% coverage
4. **E2E Tests**: All critical paths must pass
5. **Bundle Size**: Must not exceed limits
6. **Accessibility**: Automated WCAG checks
7. **Security**: Dependency vulnerability scanning

### Code Review Checklist
- [ ] Follows TypeScript conventions
- [ ] Uses Aurora Design System tokens
- [ ] Includes proper error handling
- [ ] Has appropriate test coverage
- [ ] Optimized for performance
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Documented (JSDoc/comments)
- [ ] Security best practices applied
- [ ] Mobile-responsive
- [ ] No console.logs in production code

---

## Quick Reference

### Common Commands
```bash
# Development
npm run dev           # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript check
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run analyze      # Bundle analysis

# Code Quality
npm run format       # Format with Prettier
npm run lint:fix     # Auto-fix lint issues
npm run test:coverage # Test coverage report
npm run audit        # Security audit
```

### Import Aliases
```typescript
@/components  // Components directory
@/hooks       // Custom hooks
@/services    // API services
@/lib         // Utilities
@/styles      // Global styles
@/types       // TypeScript types
@/data        // Static data
```

### Environment Variables
```bash
NODE_ENV              # development | production | test
NEXT_PUBLIC_API_URL   # Public API endpoint
DATABASE_URL          // MongoDB connection string
JWT_SECRET           # Authentication secret
STRIPE_SECRET_KEY    # Payment processing
REDIS_URL            # Cache database
```

---

## Version History
- v1.0.0 (2025-09-04): Initial standards guide
- Last Updated: September 2025
- Maintained by: Development Team

## Contributing
To propose changes to these standards:
1. Create a feature branch
2. Update relevant sections
3. Submit PR with justification
4. Requires 2 approvals from senior developers

---

*This document is enforced through automated tooling and CI/CD pipelines. All code must comply with these standards before merge.*