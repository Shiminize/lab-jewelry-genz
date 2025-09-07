# GlitchGlow Development Prompt Template
> Quick reference template for AI-assisted development

## Core Prompt Structure

```
You are developing for GlitchGlow, a luxury Gen Z jewelry e-commerce platform.

## Project Context:
- Framework: Next.js 14 (App Router) with TypeScript
- Styling: Tailwind CSS + Aurora Design System
- Database: MongoDB with Mongoose  
- Architecture: Component → Hook → Service layers

## Mandatory Requirements:

### 1. CLAUDE_RULES Compliance:
- Max 300 lines per file
- Simple features: Component only
- Moderate features: Hook + Component  
- Complex features: Service → Hook → Component
- No over-engineering or unnecessary abstractions

### 2. Aurora Design System (STRICT):
- Colors: Only use --deep-space, --nebula-purple, --aurora-pink, --aurora-crimson, --aurora-plum, --lunar-grey, --emerald-flash, --amber-glow
- Typography: Only use defined clamp() values (hero, statement, title-xl, title-l, title-m, body-xl, body-l, body-m, small, micro)
- Shadows: Use color-mix with Aurora tokens only
- Border Radius: Only 3px, 5px, 8px, 13px, 21px, 34px
- NO custom colors, font sizes, or radii

### 3. TypeScript Standards:
- Explicit types for all functions
- Interface definitions for props
- No 'any' types
- Proper error handling

### 4. Performance Requirements:
- Bundle size < 200KB gzipped
- API responses < 200ms
- LCP < 2.5s, FID < 100ms
- Memoization for expensive computations
- Dynamic imports for heavy components

### 5. Accessibility (WCAG 2.1 AA):
- Semantic HTML elements
- Proper ARIA labels
- Keyboard navigation support
- 4.5:1 color contrast minimum
- Focus management

## Task: [DESCRIBE YOUR SPECIFIC TASK HERE]

## Expected Deliverables:
- [ ] TypeScript code with proper types
- [ ] Aurora Design System compliant styling  
- [ ] Performance optimized
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Under 300 lines per file
- [ ] Following layer architecture
- [ ] Error handling implemented
- [ ] Mobile responsive

Please implement following these exact standards.
```

## Feature-Specific Prompt Variations

### For UI Components
```
## Additional UI Component Requirements:
- Use component/hook pattern only (no services)
- Props interface with proper TypeScript
- Aurora Design System tokens exclusively
- Mobile-first responsive design
- Proper ARIA attributes and roles
- Handle loading and error states
- Include proper keyboard navigation
- Memoize if complex computations exist
```

### For API Routes  
```
## Additional API Requirements:
- Input validation with Zod schemas
- Proper HTTP status codes
- Error handling with try/catch
- MongoDB queries optimized
- Rate limiting considerations
- Authentication middleware if needed
- CORS headers if required
- Response time < 200ms target
```

### For Complex Features (3D, Payments, etc.)
```
## Additional Complex Feature Requirements:
- Full service → hook → component architecture
- Service layer handles all API calls
- Hook layer orchestrates business logic
- Component layer handles presentation only
- Proper loading states and error boundaries
- Performance monitoring and metrics
- Comprehensive error handling
- Progressive enhancement for features
```

## Quality Checklist Prompt

```
Before marking complete, verify:

### Code Quality:
- [ ] TypeScript errors: 0
- [ ] ESLint warnings: 0  
- [ ] File size < 300 lines
- [ ] Proper naming conventions
- [ ] No console.logs in production

### Design System:
- [ ] Only Aurora color tokens used
- [ ] Typography uses defined scale
- [ ] Shadows use color-mix formula
- [ ] Border radius from approved list
- [ ] No hardcoded values

### Performance:
- [ ] Components memoized if needed
- [ ] Heavy features lazy loaded
- [ ] API calls optimized
- [ ] Images optimized
- [ ] Bundle impact considered

### Accessibility:
- [ ] Semantic HTML used
- [ ] ARIA labels present
- [ ] Keyboard navigation works
- [ ] Color contrast > 4.5:1
- [ ] Screen reader friendly

### Architecture:
- [ ] Follows layer separation
- [ ] Proper error handling
- [ ] Mobile responsive
- [ ] TypeScript types complete
- [ ] Documentation included
```

## Common Anti-Patterns to Avoid

```
## DO NOT:
- Use any/unknown types
- Create custom colors outside Aurora tokens
- Add unnecessary abstraction layers
- Make files > 300 lines
- Put API calls in components
- Use non-semantic HTML
- Ignore mobile responsiveness
- Skip error handling
- Create hardcoded font sizes
- Use generic Tailwind utilities over design tokens
```

## Example Usage

### Creating a New Component:
```
Using the GlitchGlow prompt template above:

Task: Create a ProductCard component that displays jewelry product information with add to cart functionality.

Requirements:
- Shows product image, name, price, material
- Add to cart button with loading state
- Hover effects with Aurora shadows
- Mobile-responsive grid layout
- Price formatting for currency
- Accessibility for screen readers
```

### Creating an API Route:
```  
Using the GlitchGlow prompt template above:

Task: Create a /api/products/[id] route that fetches a single product from MongoDB.

Requirements:
- Validate product ID parameter
- Return 404 if product not found
- Include related products suggestion
- Cache response for 1 hour
- Handle database connection errors
- Response time under 200ms
```

### Creating a Custom Hook:
```
Using the GlitchGlow prompt template above:

Task: Create useCart hook for shopping cart state management.

Requirements:
- Add/remove items functionality
- Calculate totals with tax
- Persist to localStorage
- Handle quantity updates
- Loading states for API calls
- Error handling for network issues
- TypeScript interfaces for cart items
```

---

## Quick Commands Reference

### Start Development:
```bash
npm run dev           # Start dev server on port 3000
npm run build         # Test production build
npm run lint          # Check code quality
npm run test          # Run unit tests
npm run type-check    # Verify TypeScript
```

### Before Committing:
```bash
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format with Prettier  
npm run test:coverage # Check test coverage
npm run build         # Verify production build
```

---

## Emergency Debugging

### When Things Break:
1. Check browser console for errors
2. Verify Aurora tokens are properly imported
3. Check TypeScript compilation errors
4. Validate API responses in Network tab
5. Test mobile viewport for responsive issues
6. Verify accessibility with screen reader
7. Check bundle size hasn't exceeded limits

### Performance Issues:
1. Use React DevTools Profiler
2. Check Lighthouse scores
3. Analyze bundle with `npm run analyze`
4. Monitor API response times
5. Check for memory leaks
6. Verify memoization is working

---

*Save this template and use it as the starting prompt for all GlitchGlow development tasks. It ensures consistency and quality across the entire codebase.*