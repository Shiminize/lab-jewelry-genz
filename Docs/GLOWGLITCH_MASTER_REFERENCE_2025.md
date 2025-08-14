# GlowGlitch (Lumina Lab) - Master Reference 2025

> **The Complete Guide for AI Developers & Project Contributors**
> 
> This document serves as the single source of truth for the GlowGlitch project, combining business requirements, technical architecture, implementation status, and development guidelines.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Business Model & Goals](#business-model--goals)
3. [Technical Architecture](#technical-architecture)
4. [Implementation Status](#implementation-status)
5. [Directory Structure](#directory-structure)
6. [Development Workflows](#development-workflows)
7. [AI Development Guidelines](#ai-development-guidelines)
8. [Known Issues & Solutions](#known-issues--solutions)
9. [Future Roadmap](#future-roadmap)
10. [Quick Reference](#quick-reference)

---

## Project Overview

**GlowGlitch** (marketed as **Lumina Lab**) is a luxury e-commerce platform specializing in lab-grown diamond jewelry with advanced 3D customization capabilities. The project combines modern web technologies with sophisticated design to create a premium online jewelry shopping experience.

### Core Value Proposition
- **Sustainable Luxury**: Lab-grown diamonds with same quality as mined diamonds
- **3D Customization**: Real-time jewelry design and visualization
- **Conscious Commerce**: Values-driven luxury for Gen Z/Millennial consumers
- **Creator Economy**: 30% commission affiliate program for influencers

### Target Audience
- **Primary**: Affluent millennials and Gen Z consumers (ages 25-40)
- **Secondary**: Engagement ring buyers seeking ethical alternatives
- **Tertiary**: Jewelry influencers and content creators

---

## Business Model & Goals

### Revenue Streams
1. **Direct Sales**: Lab-grown diamond jewelry (average order value: $2,000-$5,000)
2. **Custom Designs**: 3D customization service with premium pricing
3. **Creator's Cut Program**: Affiliate commissions driving influencer sales
4. **Subscription Services**: Jewelry care and maintenance programs

### Business Objectives 2025
- **Launch MVP**: Fully functional e-commerce platform
- **Revenue Target**: $1M ARR by Q4 2025
- **Creator Network**: 100+ active affiliates
- **Customer Base**: 10,000+ registered users
- **Average Order Value**: $2,500

### Key Differentiators
- **3D Technology**: Industry-leading jewelry customization
- **Sustainability**: 100% lab-grown, conflict-free diamonds
- **Creator Program**: Highest commission rates in luxury jewelry (30%)
- **Mobile-First**: Optimized for mobile shopping experience

---

## Technical Architecture

### Frontend Stack
```
Next.js 14.2.13         App Router + TypeScript
React 18.2.0            Component-based UI
TypeScript 5.9.2        Full type safety
Tailwind CSS 3.4.17     Utility-first styling with luxury design system
```

### Backend & Database
```
MongoDB 8.17.1          NoSQL database with Mongoose ODM
NextAuth.js 4.24.11     Authentication with JWT tokens
Node.js API Routes      Built-in Next.js backend
Stripe 18.4.0           Payment processing
```

### 3D Graphics & Visualization
```
Three.js 0.179.1        3D rendering engine
React Three Fiber       React renderer for Three.js (planned)
React Three Drei        3D helpers and utilities (planned)
```

### Development & Testing
```
Jest 29.7.0             Unit testing framework
Playwright 1.54.2       End-to-end testing
ESLint                  Code linting
TypeScript              Static type checking
```

### Design System
```
UI_STANDARD_AUG_12      Luxury brand design system
Custom Font Stack       Inter (body) + Fraunces (headlines)
9-Variant Button System Comprehensive UI components
Soft Luxury Palette     Champagne gold, coral, graphite green
```

---

## Implementation Status

### ✅ **Frontend (95% Complete)**
- **Pages**: 40+ complete pages (home, products, checkout, admin, dashboard)
- **Components**: 200+ reusable components with consistent design
- **Navigation**: Full responsive navigation with mobile menu
- **Design System**: Complete luxury brand implementation
- **Responsive**: Mobile-first design with tablet/desktop optimization

### ✅ **Backend E-commerce (100% Complete)**
- **Shopping Cart**: Add/remove/update with inventory validation
- **Wishlist System**: Full CRUD with customization matching
- **Inventory Management**: Stock tracking with reservation system
- **Order Processing**: Complete checkout flow with Stripe integration
- **User Management**: Registration, authentication, profile management
- **Test Coverage**: 19/19 integration tests passing (100%)

### ✅ **Database & Models (100% Complete)**
- **User Schema**: Enhanced with cart/wishlist/preferences
- **Product Schema**: Full catalog with variants, pricing, inventory
- **Order Schema**: Complete order management with tracking
- **Inventory Tracking**: Real-time stock with audit trail
- **Seed System**: Comprehensive data seeding for development

### ⚠️ **3D Customizer (Infrastructure Only)**
- **Status**: Three.js structure present, no functional implementation
- **Assets**: GLB models exist in `/public/models/`
- **Components**: Basic 3D viewer components created
- **Priority**: High - core differentiator feature

### ✅ **Authentication & Security (95% Complete)**
- **NextAuth**: Configured with MongoDB adapter
- **JWT Tokens**: Session management implemented
- **Route Protection**: API and page-level security
- **Input Validation**: Zod schemas for all forms
- **GDPR Compliance**: Cookie consent and data protection

### ⚠️ **Payment System (80% Complete)**
- **Stripe Integration**: Configured and tested
- **Checkout Flow**: UI complete, needs backend integration
- **Order Confirmation**: Email templates ready
- **Recurring Billing**: Infrastructure for subscriptions

---

## Directory Structure

```
GlowGlitch/
├── .env.development           # Environment variables
├── package.json              # Dependencies and scripts
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Design system source of truth
├── tsconfig.json             # TypeScript configuration
├── playwright.config.ts      # E2E testing configuration
├── jest.config.js           # Unit testing configuration
├── rules.md                 # AI development guidelines
│
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # Authentication pages
│   │   ├── (dashboard)/     # User dashboard
│   │   ├── admin/           # Admin panel
│   │   ├── api/             # API routes
│   │   │   ├── auth/        # Authentication endpoints
│   │   │   ├── cart/        # Shopping cart API
│   │   │   ├── checkout/    # Checkout processing
│   │   │   ├── inventory/   # Stock management
│   │   │   ├── orders/      # Order management
│   │   │   ├── products/    # Product catalog API
│   │   │   └── wishlist/    # Wishlist management
│   │   ├── collections/     # Product category pages
│   │   ├── products/        # Product detail pages
│   │   └── support/         # Customer support pages
│   │
│   ├── components/          # Reusable UI components
│   │   ├── admin/           # Admin dashboard components
│   │   ├── auth/            # Authentication forms
│   │   ├── cart/            # Shopping cart components
│   │   ├── checkout/        # Checkout flow
│   │   ├── icons/           # SVG icon components
│   │   ├── layout/          # Page layout components
│   │   ├── navigation/      # Menu and navigation
│   │   ├── products/        # Product display components
│   │   ├── ui/              # Base UI components (buttons, inputs)
│   │   └── wishlist/        # Wishlist components
│   │
│   ├── lib/                 # Utility libraries and services
│   │   ├── cart-service.ts  # Shopping cart business logic
│   │   ├── checkout-service.ts # Order processing
│   │   ├── inventory-service.ts # Stock management
│   │   ├── wishlist-service.ts # Wishlist operations
│   │   ├── mongodb.ts       # Database connection
│   │   ├── stripe.ts        # Payment processing
│   │   └── utils.ts         # Common utilities
│   │
│   ├── models/              # MongoDB schemas
│   │   ├── User.ts          # User data model
│   │   ├── Product.ts       # Product catalog
│   │   ├── Order.ts         # Order management
│   │   ├── Wishlist.ts      # User wishlists
│   │   └── InventoryHistory.ts # Stock tracking
│   │
│   ├── hooks/               # React custom hooks
│   ├── contexts/            # React context providers
│   ├── types/               # TypeScript type definitions
│   └── styles/              # Global CSS and Tailwind
│
├── public/                  # Static assets
│   ├── images/              # Product and UI images
│   │   ├── collections/     # Category hero images
│   │   ├── creators/        # Creator program assets
│   │   ├── jewelry/         # Product photography
│   │   └── trust/           # Trust signals and badges
│   ├── models/              # 3D GLB files for customizer
│   └── Hero_videos/         # Background videos
│
├── scripts/                 # Development and build scripts
│   ├── comprehensive-seed.ts # Database seeding
│   ├── test-purchase-flow-integration.ts # E-commerce tests
│   ├── design-system-enforcer.js # UI compliance
│   └── ui-standards-automation.js # Automated fixes
│
├── __tests__/              # Test suites
│   ├── components/         # Component unit tests
│   ├── api/                # API endpoint tests
│   └── database/           # Database integration tests
│
└── docs/                   # Documentation
    ├── API_DOCUMENTATION.md
    ├── DEPLOYMENT_GUIDE.md
    └── PERFORMANCE_GUIDE.md
```

---

## Development Workflows

### Environment Setup
```bash
# Clone repository
git clone https://github.com/Shiminize/glowglitch.git
cd glowglitch

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.development
# Configure MongoDB URI, NextAuth secrets, Stripe keys

# Seed database
npm run seed:dev

# Start development server
npm run dev
```

### Essential Commands
```bash
# Development
npm run dev              # Start dev server on localhost:3000
npm run build           # Production build with design system validation
npm run start           # Start production server
npm run type-check      # TypeScript validation
npm run lint            # ESLint code quality check

# Database
npm run seed            # Full database seeding
npm run seed:dev        # Development data only
npm run seed:minimal    # Minimal test data

# Testing
npm test                # Unit tests
npm run test:e2e        # Playwright end-to-end tests
npm run test:visual     # Visual regression tests

# Design System
npm run design-system-check     # Validate UI compliance
npm run design-system-fix       # Auto-fix violations
npm run ui:full-compliance      # Complete UI validation

# Deployment
npm run pre-deploy      # Full validation before deployment
npm run analyze         # Bundle analysis
npm run performance:report # Performance metrics
```

### Git Workflow
```bash
# Feature development
git checkout -b feature/your-feature-name
git add .
git commit -m "feat: descriptive commit message"
git push origin feature/your-feature-name

# Create pull request for review
# After approval, merge to main branch
```

---

## AI Development Guidelines

### 🎯 Core Principles

#### 1. Design System First
**The `tailwind.config.js` file is the single source of truth for all design tokens.**
- ✅ **DO**: Use defined Tailwind utility classes (`bg-cta`, `text-foreground`, `font-headline`)
- ❌ **DON'T**: Use generic classes (`text-xl`, `font-bold`, `bg-gray-200`)
- ❌ **NEVER**: Use hardcoded values or `!important` CSS rules

#### 2. Component Reusability
**Before creating new components, always check existing ones.**
- ✅ **DO**: Use components from `src/components/ui/`
- ✅ **DO**: Add variants to existing components rather than creating duplicates
- ❌ **DON'T**: Create slight variations of existing components

#### 3. Type Safety
**All code must be fully typed with TypeScript.**
- ✅ **DO**: Define proper interfaces and types
- ✅ **DO**: Use Zod schemas for runtime validation
- ❌ **DON'T**: Use `any` types or disable TypeScript checks

#### 4. Testing Requirements
**All features require appropriate test coverage.**
- ✅ **DO**: Write unit tests for complex logic
- ✅ **DO**: Add integration tests for API endpoints
- ✅ **DO**: Include accessibility tests for UI components

### 🛠️ Implementation Patterns

#### Component Creation Template
```tsx
'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ComponentNameProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children: React.ReactNode
}

export function ComponentName({ 
  variant = 'primary',
  size = 'md',
  className,
  children
}: ComponentNameProps) {
  return (
    <div className={cn(
      // Base styles using design system
      'bg-background text-foreground',
      // Variant styles
      {
        'bg-cta text-background': variant === 'primary',
        'border border-border': variant === 'secondary',
      },
      // Size styles
      {
        'px-3 py-1.5 text-sm': size === 'sm',
        'px-4 py-2 text-base': size === 'md',
        'px-6 py-3 text-lg': size === 'lg',
      },
      className
    )}>
      {children}
    </div>
  )
}
```

#### API Route Pattern
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/mongodb'

const RequestSchema = z.object({
  // Define request schema
})

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Validate input
    const body = await request.json()
    const validatedData = RequestSchema.parse(body)

    // 3. Connect to database
    await connectToDatabase()

    // 4. Process business logic
    const result = await processRequest(validatedData)

    // 5. Return response
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
```

### 🚫 Common Mistakes to Avoid

1. **Design System Violations**: Using non-standard colors, fonts, or spacing
2. **Component Duplication**: Creating similar components instead of using variants
3. **Missing TypeScript**: Incomplete type definitions or any types
4. **Security Issues**: Missing authentication, input validation, or sanitization
5. **Accessibility Problems**: Missing ARIA labels, keyboard navigation, or color contrast
6. **Performance Issues**: Unnecessary re-renders, large bundle sizes, or blocking operations

---

## Known Issues & Solutions

### Current Development Environment
- **Status**: ✅ Working correctly (as of August 2025)
- **Server**: Running on `localhost:3002` with Hot Reload
- **Database**: MongoDB connection stable
- **Build System**: Next.js compilation working

### Resolved Issues
1. **Giant Image Problem**: ✅ Resolved - HomePage layout working correctly
2. **Missing Sections**: ✅ Fixed - All homepage sections restored
3. **Navigation Issues**: ✅ Complete - Full responsive navigation implemented
4. **Database Schema**: ✅ Complete - All models with proper indexing

### Minor Outstanding Issues
1. **Product Images**: Some 404s for organized subdirectory structure
2. **Database Warnings**: Mongoose duplicate index warnings (non-critical)
3. **3D Customizer**: Infrastructure present but no functional implementation

### Troubleshooting Guide

#### Development Server Issues
```bash
# If server won't start
killall node
npm install
npm run dev

# If database connection fails
# Check .env.development MONGODB_URI
# Ensure MongoDB is running
```

#### Build Issues
```bash
# If build fails
npm run design-system-check  # Check for UI violations
npm run type-check          # Check TypeScript errors
npm run lint               # Check code quality
```

#### Test Failures
```bash
# Run specific test suites
npm test -- --testNamePattern="Cart"
npm run test:e2e -- --grep="checkout"
```

---

## Future Roadmap

### Phase 1: 3D Customizer (Q1 2025)
**Priority: High - Core Differentiator**
- Functional Three.js jewelry customizer
- Real-time price calculation based on customizations
- Save/share custom designs
- Mobile-optimized 3D interaction

### Phase 2: Advanced E-commerce (Q2 2025)
- Inventory management dashboard
- Advanced filtering and search
- Recommendation engine
- Bulk order processing

### Phase 3: Creator Program Enhancement (Q3 2025)
- Creator dashboard with analytics
- Automated commission calculations
- Content creation tools
- Performance tracking and optimization

### Phase 4: Mobile App (Q4 2025)
- React Native implementation
- Native 3D customizer
- Push notifications
- Offline browsing capability

### Phase 5: AI Integration (2026)
- AI-powered design suggestions
- Virtual try-on using AR
- Chatbot customer service
- Predictive inventory management

---

## Quick Reference

### Key Files to Know
```
tailwind.config.js        # Design system source of truth
src/lib/cart-service.ts   # Shopping cart business logic
src/lib/mongodb.ts        # Database connection
src/models/User.ts        # User data schema
src/components/ui/Button.tsx # Base button component
rules.md                  # Development guidelines
```

### Design System Tokens
```css
/* Colors */
--color-foreground: 27 46 31      /* Graphite green text */
--color-background: 250 250 248   /* Ivory mist background */
--color-cta: 226 164 95           /* Coral gold buttons */
--color-accent: 212 175 55        /* Champagne gold highlights */
--color-muted: 230 205 186        /* Rose beige secondary */

/* Typography */
--font-headline: Fraunces         /* Headlines and luxury elements */
--font-body: Inter                /* Body text and UI */
```

### Common Patterns
```tsx
// Button usage
<Button variant="primary" size="lg">Call to Action</Button>

// Typography
<H1 className="text-foreground">Main Heading</H1>
<BodyText className="text-muted">Body content</BodyText>

// Layout containers
<div className="max-w-6xl mx-auto px-4">Content</div>
```

### API Endpoints
```
POST /api/cart              # Add item to cart
GET /api/products           # Get product catalog
POST /api/checkout          # Process order
GET /api/wishlist           # Get user wishlist
POST /api/auth/register     # User registration
```

---

## Support & Resources

### Development Support
- **Primary Documentation**: This file (`GLOWGLITCH_MASTER_REFERENCE_2025.md`)
- **API Reference**: `/docs/API_DOCUMENTATION.md`
- **Component Guide**: `/docs/COMPONENT_GUIDELINES.md`
- **Deployment Guide**: `/docs/DEPLOYMENT_GUIDE.md`

### External Resources
- **Next.js Documentation**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Three.js**: https://threejs.org/docs
- **Stripe API**: https://stripe.com/docs/api
- **MongoDB**: https://docs.mongodb.com/

### Team Contacts
- **Repository**: https://github.com/Shiminize/glowglitch
- **Issues**: https://github.com/Shiminize/glowglitch/issues
- **License**: Proprietary/Confidential

---

**Last Updated**: August 12, 2025
**Version**: 2.0.0
**Status**: Production Ready (Frontend + Backend E-commerce Complete)

*This document serves as the definitive guide for all development work on GlowGlitch. All AI developers and contributors should reference this document before making changes to ensure consistency with project goals and technical standards.*