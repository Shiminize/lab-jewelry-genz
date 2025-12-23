# Filter Redesign Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the horizontal "sausage pill" filter layout inspired by James Allen's jewelry catalog.

---

## Current vs. Proposed Layout

### Current Layout Issues

```
┌─────────────────────────────────────────────────────────────┐
│  [All Capsules (60)]  [Grid][List]  [Search]  [Filters (3)] │  ← Toolbar
├─────────────────────────────────────────────────────────────┤
│                        [Sort: Featured ▼]                    │  ← Sort row
├─────────────────────────────────────────────────────────────┤
│  [💎 Rings] [✨ Earrings] [💎 Necklaces] [🏷️ Bracelets]    │  ← Categories
├─────────────────────────────────────────────────────────────┤
│  [All tones] [Volt] [Cyan] [Magenta] [Lime] [More filters]  │  ← Tones
├─────────────────────────────────────────────────────────────┤
│  [Under $300] [Ready to ship] [Gold] [Silver]               │  ← Quick chips
├─────────────────────────────────────────────────────────────┤
│  Active filters: [Rings ×] [Gold ×] [Reset all]             │  ← Active
└─────────────────────────────────────────────────────────────┘

Problems:
❌ Too many horizontal rows (6 rows!)
❌ Categories separated from other filters
❌ Tones feel disconnected
❌ Takes up ~400px of vertical space
❌ Not scannable at a glance
```

### Proposed Layout (James Allen Style)

```
┌─────────────────────────────────────────────────────────────────┐
│  [All Capsules (60)]  [🔍 Search...]  [Grid][List]  [Sort ▼]   │  ← Header
├─────────────────────────────────────────────────────────────────┤
│  [Category ▼] [Price ▼] [Metal ▼] [Availability ▼] [More ▼]    │  ← Filters
│  [Under $300] [Ready to Ship] [Gold] [Limited] [Bestseller]     │  ← Quick
│  Active: [Rings ×] [Gold ×] [Price: $100-$300 ×] [Clear all]    │  ← Active
└─────────────────────────────────────────────────────────────────┘

Benefits:
✅ Only 3 rows (saves ~200px)
✅ All filters in one scannable row
✅ Clear hierarchy: Dropdowns → Quick chips → Active
✅ Horizontal scroll on mobile
✅ Consistent with industry standards (James Allen, Blue Nile)
```

---

## Phase 1: Layout Rework

### Step 1.1: Create FilterPill Component

Create: `app/collections/components/FilterPill.tsx`

```typescript
'use client'

import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterPillProps {
  label: string
  count?: number
  active?: boolean
  onClick?: () => void
  icon?: React.ReactNode
  className?: string
}

export function FilterPill({
  label,
  count,
  active = false,
  onClick,
  icon,
  className,
}: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        // Base styles - sausage shape
        'inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 py-2',
        'border border-border-subtle/70 bg-surface-base',
        'text-[0.78rem] font-semibold uppercase tracking-[0.24em]',
        'transition-all duration-200',
        
        // Hover state
        'hover:border-border-strong hover:shadow-sm',
        
        // Active state
        active && [
          'border-accent-primary/40 bg-neutral-50 text-text-primary shadow-soft',
        ],
        
        // Default state
        !active && 'text-text-secondary hover:text-text-primary',
        
        // Focus state
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-accent-primary focus-visible:ring-offset-2',
        
        className
      )}
    >
      {icon && <span className="h-4 w-4">{icon}</span>}
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className="rounded-full bg-surface-panel px-2 py-0.5 text-xs font-medium">
          {count}
        </span>
      )}
      <ChevronDown className="h-3.5 w-3.5 opacity-60" />
    </button>
  )
}
```

### Step 1.2: Create FilterDropdown Component

Create: `app/collections/components/FilterDropdown.tsx`

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'

interface FilterDropdownProps {
  isOpen: boolean
  onClose: () => void
  onApply: () => void
  onReset: () => void
  title: string
  children: React.ReactNode
  anchorRef?: React.RefObject<HTMLElement>
}

export function FilterDropdown({
  isOpen,
  onClose,
  onApply,
  onReset,
  title,
  children,
  anchorRef,
}: FilterDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        anchorRef?.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose, anchorRef])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dropdown */}
      <div
        ref={dropdownRef}
        className={cn(
          'absolute left-0 right-0 z-50 mt-2',
          'max-w-2xl mx-auto',
          'rounded-3xl border border-border-subtle bg-surface-base shadow-xl',
          'p-6 space-y-6'
        )}
        role="dialog"
        aria-label={title}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-text-muted hover:text-text-primary"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[400px] overflow-y-auto">
          {children}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-4">
          <Button variant="ghost" tone="ink" onClick={onReset}>
            Reset
          </Button>
          <Button variant="primary" tone="magenta" onClick={onApply}>
            Apply Filters
          </Button>
        </div>
      </div>
    </>
  )
}
```

### Step 1.3: Create QuickFilterChip Component

Create: `app/collections/components/QuickFilterChip.tsx`

```typescript
'use client'

import { cn } from '@/lib/utils'

interface QuickFilterChipProps {
  label: string
  active?: boolean
  onClick?: () => void
  icon?: React.ReactNode
  className?: string
}

export function QuickFilterChip({
  label,
  active = false,
  onClick,
  icon,
  className,
}: QuickFilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        // Base styles - pill shape
        'inline-flex min-h-[40px] items-center gap-2 rounded-full px-4 py-2',
        'border border-border-subtle/70 bg-surface-base',
        'text-[0.75rem] font-semibold uppercase tracking-[0.2em]',
        'transition-all duration-200',
        'whitespace-nowrap',
        
        // Hover state
        'hover:border-border-strong',
        
        // Active state
        active && [
          'border-accent-primary/40 bg-neutral-50 text-text-primary shadow-soft',
        ],
        
        // Default state
        !active && 'text-text-secondary hover:text-text-primary',
        
        // Focus state
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-accent-primary focus-visible:ring-offset-2',
        
        className
      )}
    >
      {icon && <span className="h-3.5 w-3.5">{icon}</span>}
      <span>{label}</span>
    </button>
  )
}
```

### Step 1.4: Restructure CatalogClient

Modify: `app/collections/CatalogClient.tsx`

Replace the filter section (lines 456-641) with:

```typescript
{/* New Horizontal Filter Layout */}
<SectionContainer size="content">
  <div className={filterShellClass}>
    {/* Row 1: Header with Search and Controls */}
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <Link
        href={clearFiltersHref}
        prefetch={false}
        className={cn(
          toolbarButtonClass,
          'justify-between bg-surface-base text-text-primary shadow-soft'
        )}
      >
        <span>{selectedCategory ?? 'All Capsules'}</span>
        <span className="rounded-full bg-surface-panel px-2 py-0.5 text-xs font-medium text-text-secondary">
          ({resultCount})
        </span>
      </Link>

      <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[220px] md:max-w-md">
        <label htmlFor="catalog-search" className="sr-only">
          Search catalog
        </label>
        <input
          id="catalog-search"
          type="search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search rings, tones, styles..."
          autoComplete="off"
          spellCheck={false}
          className="h-[50px] w-full rounded-full border border-border-subtle/70 bg-neutral-50 pl-12 pr-14 text-sm font-medium text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2"
        />
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        {searchValue && (
          <button
            type="button"
            onClick={handleSearchClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-text-muted hover:text-text-primary"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className={viewToggleButtonClass('grid')}
          onClick={() => handleViewToggle('grid')}
          aria-label="Grid view"
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={viewToggleButtonClass('list')}
          onClick={() => handleViewToggle('list')}
          aria-label="List view"
        >
          <List className="h-4 w-4" />
        </button>
      </div>

      <div className="w-full min-w-[180px] md:w-auto">
        <label className="flex items-center gap-2">
          <span className="sr-only">Sort</span>
          <div className="relative w-full">
            <select
              value={selectedSortKey}
              onChange={handleSortChange}
              className="h-[50px] w-full appearance-none rounded-full border border-border-subtle/70 bg-neutral-50 px-6 pr-12 text-[13px] font-semibold uppercase tracking-[0.24em] text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-text-primary"
              aria-label="Sort products"
            >
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-primary/70" />
          </div>
        </label>
      </div>
    </div>

    {/* Row 2: Primary Filter Pills (Horizontal Scroll) */}
    <div className="relative mt-6">
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {/* Category Filter */}
        <FilterPill
          label="Category"
          count={selectedCategory ? 1 : 0}
          active={!!selectedCategory}
          onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
        />

        {/* Price Filter */}
        <FilterPill
          label="Price"
          count={
            (selectedPrice.min !== undefined ? 1 : 0) +
            (selectedPrice.max !== undefined ? 1 : 0)
          }
          active={selectedPrice.min !== undefined || selectedPrice.max !== undefined}
          onClick={() => setIsPriceDropdownOpen(!isPriceDropdownOpen)}
        />

        {/* Metal Filter */}
        <FilterPill
          label="Metal"
          count={selectedMetals.length}
          active={selectedMetals.length > 0}
          onClick={() => setIsMetalDropdownOpen(!isMetalDropdownOpen)}
        />

        {/* Availability Filter */}
        <FilterPill
          label="Availability"
          count={normalizedSelectedAvailability !== 'any' ? 1 : 0}
          active={normalizedSelectedAvailability !== 'any'}
          onClick={() => setIsAvailabilityDropdownOpen(!isAvailabilityDropdownOpen)}
        />

        {/* Tone Filter */}
        <FilterPill
          label="Tone"
          count={selectedTone ? 1 : 0}
          active={!!selectedTone}
          onClick={() => setIsToneDropdownOpen(!isToneDropdownOpen)}
        />

        {/* More Filters */}
        <FilterPill
          label="More Filters"
          onClick={() => setIsFilterOpen(true)}
        />
      </div>
    </div>

    {/* Row 3: Quick Filter Chips (Horizontal Scroll) */}
    <div className="mt-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <QuickFilterChip
          label="Under $300"
          active={under300Active}
          onClick={toggleUnder300}
        />
        <QuickFilterChip
          label="Ready to Ship"
          active={readyChipActive}
          onClick={toggleReadyChip}
        />
        <QuickFilterChip
          label="Gold"
          active={goldActive}
          onClick={() => toggleMetalChip('gold', goldActive)}
        />
        <QuickFilterChip
          label="Silver"
          active={silverActive}
          onClick={() => toggleMetalChip('silver', silverActive)}
        />
      </div>
    </div>

    {/* Row 4: Active Filters (Only shows when filters applied) */}
    {activeFilters.length > 0 && (
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border-subtle/60 pt-4">
        <Typography variant="eyebrow" className="text-body-muted">
          Active
        </Typography>
        {activeFilters.map((filter) => (
          <Link
            key={`${filter.label}-${filter.href}`}
            href={filter.href}
            prefetch={false}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-border-subtle/80 px-4 text-sm font-medium text-text-secondary transition hover:border-border-strong hover:text-text-primary"
          >
            {filter.label}
            <span aria-hidden>×</span>
          </Link>
        ))}
        <Link
          href={clearFiltersHref}
          prefetch={false}
          className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary hover:text-text-primary"
        >
          Clear all
        </Link>
      </div>
    )}
  </div>
</SectionContainer>
```

### Step 1.5: Add Dropdown State Management

Add to CatalogClient state (after line 123):

```typescript
const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false)
const [isMetalDropdownOpen, setIsMetalDropdownOpen] = useState(false)
const [isAvailabilityDropdownOpen, setIsAvailabilityDropdownOpen] = useState(false)
const [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false)
```

### Step 1.6: Add CSS for Horizontal Scroll

Add to `app/globals.css`:

```css
/* Hide scrollbar but keep functionality */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Smooth scroll snap for mobile */
@media (max-width: 768px) {
  .scrollbar-hide {
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }
  
  .scrollbar-hide > * {
    scroll-snap-align: start;
  }
}
```

---

## Phase 2: Add Missing Filters

### Step 2.1: Limited Edition Filter

**Backend (page.tsx)**

Add after line 384:

```typescript
const activeFilterCount =
  (selectedCategory ? 1 : 0) +
  (selectedTone ? 1 : 0) +
  (priceSelection.min !== undefined || priceSelection.max !== undefined ? 1 : 0) +
  (selectedAvailability === 'any' ? 0 : 1) +
  metalSelections.length +
  (selectedLimitedDrop ? 1 : 0) // NEW
```

Add filter logic after line 366:

```typescript
if (metalsSet.size > 0) {
  const productMetal = typeof product.metal === 'string' ? product.metal.toLowerCase() : ''
  if (!metalsSet.has(productMetal)) {
    return false
  }
}

// NEW: Limited Drop filter
const selectedLimitedDrop = sanitizedParams.get('limited') === 'true'
if (selectedLimitedDrop && product.limitedDrop !== true) {
  return false
}
```

**Frontend (CatalogClient.tsx)**

Add quick chip:

```typescript
<QuickFilterChip
  label="Limited Edition"
  active={limitedDropActive}
  onClick={toggleLimitedDrop}
  icon={<Sparkle className="h-3.5 w-3.5" />}
/>
```

Add toggle handler:

```typescript
const limitedDropActive = searchParams?.get('limited') === 'true'

const toggleLimitedDrop = () => {
  updateQuery({ limited: limitedDropActive ? undefined : 'true' })
}
```

### Step 2.2: Bestseller Filter

Same pattern as Limited Edition, using `metadata.bestseller` field.

### Step 2.3: Gemstone Filter

**Backend aggregation (page.tsx)**

After line 328 (metal aggregation):

```typescript
// Aggregate gemstones
const gemstoneValues = Array.from(
  new Set(
    allProducts
      .flatMap((product) => product.gemstones ?? [])
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
  )
).sort((a, b) => a.localeCompare(b))

const requestedGemstones = parseListParam(sanitizedParams.get('gemstone') ?? undefined)
  .map((value) => value.toLowerCase())
  .filter(Boolean)
```

**Filter logic:**

```typescript
if (requestedGemstones.length > 0) {
  const gemstonesSet = new Set(requestedGemstones)
  const productGemstones = (product.gemstones ?? []).map(g => g.toLowerCase())
  if (!productGemstones.some(gem => gemstonesSet.has(gem))) {
    return false
  }
}
```

**Frontend dropdown:**

```typescript
<FilterDropdown
  isOpen={isGemstoneDropdownOpen}
  onClose={() => setIsGemstoneDropdownOpen(false)}
  onApply={applyGemstoneFilter}
  onReset={resetGemstoneFilter}
  title="Gemstone"
>
  <div className="flex flex-wrap gap-2">
    {gemstoneOptions.map((gemstone) => (
      <button
        key={gemstone}
        type="button"
        onClick={() => toggleGemstone(gemstone)}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition',
          draftGemstones.includes(gemstone)
            ? 'border-accent-primary/40 bg-surface-base text-text-primary shadow-soft'
            : 'border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary'
        )}
      >
        {gemstone}
      </button>
    ))}
  </div>
</FilterDropdown>
```

### Step 2.4: Materials Filter

Same pattern as Gemstone filter, using `materials[]` field.

### Step 2.5: Tags Filter

Same pattern as Gemstone filter, using `tags[]` field.

---

## Phase 3: UX Polish

### Sticky Filter Bar

Add to CatalogClient:

```typescript
const [isSticky, setIsSticky] = useState(false)

useEffect(() => {
  const handleScroll = () => {
    setIsSticky(window.scrollY > 200)
  }

  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}, [])
```

Update filter container:

```typescript
<div
  className={cn(
    filterShellClass,
    isSticky && [
      'fixed top-0 left-0 right-0 z-30',
      'animate-in slide-in-from-top duration-200',
    ]
  )}
>
```

### Filter Presets

Add preset buttons:

```typescript
const filterPresets = [
  {
    label: 'Gifts Under $300',
    filters: { max_price: '299', tag: 'gift' },
  },
  {
    label: 'Ready to Ship Gold',
    filters: { availability: 'ready', metal: 'gold' },
  },
  {
    label: 'Limited Editions',
    filters: { limited: 'true' },
  },
]

// Render
<div className="flex gap-2 mb-4">
  {filterPresets.map((preset) => (
    <button
      key={preset.label}
      onClick={() => updateQuery(preset.filters)}
      className="text-xs text-accent-primary hover:underline"
    >
      {preset.label}
    </button>
  ))}
</div>
```

---

## Testing Checklist

### Functionality
- [ ] All filters work correctly
- [ ] URL state updates properly
- [ ] Back/forward browser navigation works
- [ ] Filter combinations work (e.g., Gold + Under $300)
- [ ] Clear all removes all filters
- [ ] Individual filter removal works

### UI/UX
- [ ] Horizontal scroll works on mobile
- [ ] Dropdowns position correctly
- [ ] Active states are clear
- [ ] Filter count badges update
- [ ] Sticky header works on scroll
- [ ] Animations are smooth

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader announces filter changes
- [ ] Focus management is correct
- [ ] ARIA labels are present
- [ ] Color contrast meets WCAG AA

### Performance
- [ ] Filter response time < 200ms
- [ ] No layout shift when opening dropdowns
- [ ] Smooth 60fps scrolling
- [ ] No memory leaks on filter changes

### Cross-Browser
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (desktop + iOS)
- [ ] Mobile browsers

---

## Rollout Plan

### Week 1: Development
- Day 1-2: Implement Phase 1 (layout)
- Day 3-4: Add Phase 2 filters
- Day 5: Phase 3 polish + testing

### Week 2: Testing
- Day 1-2: Internal QA
- Day 3-4: Beta testing with 10% traffic
- Day 5: Bug fixes

### Week 3: Rollout
- Day 1: 25% traffic
- Day 2: 50% traffic
- Day 3: 75% traffic
- Day 4: 100% traffic
- Day 5: Monitor + optimize

---

## Success Metrics

Track these metrics before/after:

| Metric | Baseline | Target | Actual |
|--------|----------|--------|--------|
| Filter usage rate | 35% | 50% | TBD |
| Products viewed/session | 8 | 12 | TBD |
| Time to find product | 45s | 30s | TBD |
| Conversion rate | 2.1% | 2.5% | TBD |
| Mobile engagement | 28% | 40% | TBD |

---

## Maintenance

### Monthly Tasks
- Review filter analytics
- Check for unused filters
- Optimize slow queries
- Update filter options based on inventory

### Quarterly Tasks
- A/B test filter layouts
- Add new filter types based on user feedback
- Review and optimize filter combinations
- Update documentation

---

## Conclusion

This implementation guide provides a complete roadmap for transforming the current vertical filter layout into a modern horizontal "sausage pill" design. The phased approach minimizes risk while delivering incremental value.

**Key Takeaways:**
- Rework, don't rebuild
- Preserve existing filter logic
- Focus on UI/UX improvements
- Add missing filters incrementally
- Monitor and optimize continuously

