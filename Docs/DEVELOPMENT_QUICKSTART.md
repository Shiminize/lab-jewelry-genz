# GlowGlitch Development Quickstart Guide

> **Get up and running with GlowGlitch development in under 10 minutes**

## Prerequisites

### Required Software
- **Node.js**: v18.17.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: Latest version
- **MongoDB**: v6.0+ (local or Atlas)
- **Code Editor**: VS Code recommended

### VS Code Extensions (Recommended)
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-playwright.playwright",
    "mongodb.mongodb-vscode"
  ]
}
```

---

## Quick Setup (5 minutes)

### 1. Clone & Install
```bash
# Clone repository
git clone https://github.com/Shiminize/glowglitch.git
cd glowglitch

# Install dependencies
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env.development

# Edit .env.development with your values:
```

**Required Environment Variables:**
```bash
# Database
MONGODB_URI="mongodb://localhost:27017/glowglitch-dev"
# OR use MongoDB Atlas:
# MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/glowglitch"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Stripe (use test keys for development)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Optional: Email (for order confirmations)
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
```

### 3. Database Seeding
```bash
# Seed database with sample data
npm run seed:dev
```

### 4. Start Development
```bash
# Start dev server
npm run dev

# Open browser to http://localhost:3000
```

**✅ You should see the GlowGlitch homepage with sample products!**

---

## Development Commands

### Daily Development
```bash
npm run dev              # Start development server (http://localhost:3000)
npm run build           # Build production bundle
npm run start           # Start production server
npm run type-check      # Check TypeScript errors
npm run lint            # Check code quality
```

### Database Management
```bash
npm run seed            # Full database seed (production-like data)
npm run seed:dev        # Development data (smaller dataset)
npm run seed:minimal    # Minimal test data
```

### Testing
```bash
npm test                # Run unit tests
npm run test:e2e        # Run Playwright end-to-end tests
npm run test:visual     # Visual regression testing
npm run test:navigation # Navigation-specific tests
```

### Design System
```bash
npm run design-system-check     # Check UI compliance
npm run design-system-fix       # Auto-fix violations
npm run ui:validate            # Validate components
npm run ui:full-compliance     # Complete validation
```

---

## Project Structure (Essential Files)

```
GlowGlitch/
├── 📁 src/
│   ├── 📁 app/                    # Next.js pages & API routes
│   │   ├── 📄 page.tsx           # Homepage
│   │   ├── 📁 products/          # Product pages
│   │   ├── 📁 api/               # Backend API
│   │   └── 📁 admin/             # Admin dashboard
│   ├── 📁 components/            # Reusable UI components
│   │   ├── 📁 ui/                # Base components (Button, Input)
│   │   ├── 📁 layout/            # Layout components
│   │   └── 📁 products/          # Product-specific components
│   ├── 📁 lib/                   # Utilities & services
│   │   ├── 📄 mongodb.ts         # Database connection
│   │   ├── 📄 cart-service.ts    # Shopping cart logic
│   │   └── 📄 utils.ts           # Common utilities
│   └── 📁 models/                # Database schemas
│       ├── 📄 User.ts            # User model
│       └── 📄 Product.ts         # Product model
├── 📄 tailwind.config.js         # 🎨 Design system (IMPORTANT!)
├── 📄 rules.md                   # Development guidelines
└── 📄 GLOWGLITCH_MASTER_REFERENCE_2025.md  # Complete documentation
```

---

## Common Development Tasks

### Adding a New Component
```bash
# 1. Create component in appropriate directory
touch src/components/ui/MyComponent.tsx

# 2. Follow the component template (see rules.md)
# 3. Add to index file if needed
# 4. Write tests
touch __tests__/components/MyComponent.test.tsx
```

### Creating an API Endpoint
```bash
# 1. Create route file
touch src/app/api/my-endpoint/route.ts

# 2. Implement GET/POST/PUT/DELETE methods
# 3. Add authentication if needed
# 4. Write API tests
```

### Adding a Database Model
```bash
# 1. Create model file
touch src/models/MyModel.ts

# 2. Define Mongoose schema
# 3. Add to seed script if needed
# 4. Create service file for business logic
touch src/lib/my-model-service.ts
```

---

## Troubleshooting

### Server Won't Start
```bash
# Kill any running processes
killall node

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Start fresh
npm run dev
```

### Database Connection Issues
```bash
# Check MongoDB is running (local)
mongosh

# Or check Atlas connection string format
# mongodb+srv://username:password@cluster.mongodb.net/database
```

### Build Failures
```bash
# Check for design system violations
npm run design-system-check

# Check TypeScript errors
npm run type-check

# Check linting issues
npm run lint

# Fix common issues automatically
npm run design-system-fix
```

### Test Failures
```bash
# Run specific test file
npm test -- MyComponent.test.tsx

# Run tests in watch mode
npm test -- --watch

# Debug e2e tests
npm run test:e2e:debug
```

---

## Development Best Practices

### 🎨 Design System Rules
- **Always use design tokens**: `bg-cta`, `text-foreground`, `font-headline`
- **Never use generic Tailwind**: `bg-blue-500`, `text-lg`, `font-bold`
- **Check compliance**: `npm run design-system-check`

### 🧩 Component Guidelines
- **Reuse existing components** before creating new ones
- **Add variants** instead of duplicating components
- **Follow TypeScript patterns** with proper interfaces

### 🚀 Performance
- **Use dynamic imports** for large components
- **Optimize images** with Next.js Image component
- **Test bundle size** with `npm run analyze`

### 🔒 Security
- **Validate all inputs** with Zod schemas
- **Protect API routes** with authentication
- **Sanitize user content** with DOMPurify

---

## Key Resources

### Documentation
- 📖 **Master Reference**: `GLOWGLITCH_MASTER_REFERENCE_2025.md`
- 📋 **Development Rules**: `rules.md`
- 🎨 **Design System**: `tailwind.config.js`

### External Docs
- [Next.js 14](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)
- [MongoDB](https://docs.mongodb.com/)

### Testing
- [Jest](https://jestjs.io/docs/getting-started)
- [Playwright](https://playwright.dev/docs/intro)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

## Getting Help

### 🐛 Issues
- Check existing issues: https://github.com/Shiminize/glowglitch/issues
- Create new issue with reproduction steps

### 💬 Development Questions
- Review the master reference document first
- Check the rules.md for coding guidelines
- Look at similar components for patterns

### 🚀 Ready to Contribute?
1. **Read**: `GLOWGLITCH_MASTER_REFERENCE_2025.md`
2. **Follow**: Component and API patterns in `/src`
3. **Test**: Your changes with `npm test` and `npm run test:e2e`
4. **Validate**: Design system compliance with `npm run design-system-check`
5. **Submit**: Pull request with clear description

---

**🎉 Happy Coding!**

*Need more details? Check the complete documentation in `GLOWGLITCH_MASTER_REFERENCE_2025.md`*