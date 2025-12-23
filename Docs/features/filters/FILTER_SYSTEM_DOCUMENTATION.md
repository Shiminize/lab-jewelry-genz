# Filter System Documentation

## Overview

The GenZ Jewelry catalog filter system has been redesigned to provide a modern, intuitive filtering experience inspired by industry-leading jewelry retailers. The new system features a horizontal "sausage pill" layout with dropdown options, quick filter chips, and filter presets for rapid product discovery.

## Key Features

### 1. Compact Two-Tier Layout
- **Primary Row**: Category, Price, Metal, and Availability pills stay in one line to mirror James Allen’s toolbar.
- **Refine Row**: Tone, Gemstone, Material, and Tag pills live right below the primary row, so advanced controls remain visible without expanding a drawer.
- **Non-Sticky Default**: The whole block scrolls naturally to avoid overlapping the sticky site header; sticky mode is now an optional enhancement instead of the default.

### 2. Container Alignment & Tokens
- **Unified Width**: Both the filter bar and product grid use `SectionContainer size="gallery"`, which maps to `max-w-[var(--ja-layout-gallery)]` inside `src/components/layout/Section.tsx`.
- **Shared Padding**: Gallery containers inherit `px-4 sm:px-6 md:px-10 xl:px-[56px]` from `app/globals.css`, so every breakpoint keeps the same gutter logic.
- **Filter Shell Padding**: Local padding (`px-4` → `md:px-6`) keeps the bar compact without fighting the gallery gutters.
- **Future Adjustments**: If another layout needs more width, create a new size token in `app/globals.css` rather than hard-coding pixel widths in `CatalogClient.tsx`.

### 3. Filter Types

#### Primary Filters (Pills)
- **Category**: Rings, Earrings, Necklaces, Bracelets
- **Price**: Min/max price range with validation
- **Metal**: Gold, Silver, Platinum, etc.
- **Availability**: Ready to Ship, Made to Order, Pre-Order
- **Tone**: Warm, Cool, Mixed
- **Gemstone**: Diamond, Sapphire, Ruby, etc. (if available in catalog)

#### Quick Filter Chips
- **Under $300**: Direct price filter
- **Limited Edition**: Exclusive drops
- **Bestseller**: Popular items
- **Ready to Ship**: Immediate availability

#### Filter Presets
- 🎁 **Gifts Under $300**: Price ≤ $299 + Gift tag
- ⚡ **Ready to Ship Gold**: Availability = Ready + Metal = Gold
- ✨ **Limited Editions**: Limited drop flag = true
- 🌟 **Bestsellers**: Bestseller flag = true

#### Advanced Filters (More Filters Drawer)
- **Materials**: Specific material composition filters
- **Tags & Themes**: Style, occasion, or collection filters

### 3. Feature Flags

The new filter system is controlled by feature flags for gradual rollout:

```typescript
// .env.local
NEXT_PUBLIC_ENABLE_NEW_FILTER_LAYOUT=true
NEXT_PUBLIC_FILTER_ROLLOUT_PERCENTAGE=100
```

- `ENABLE_NEW_FILTER_LAYOUT`: Master switch (true/false)
- `FILTER_ROLLOUT_PERCENTAGE`: Gradual rollout percentage (0-100)

## Technical Architecture

### File Structure

```
app/collections/
├── components/
│   ├── FilterPill.tsx         # Reusable pill component
│   ├── FilterDropdown.tsx     # Dropdown container with apply/reset
│   └── QuickFilterChip.tsx    # Direct action chip component
├── CatalogClient.tsx          # Main catalog UI with filter logic
└── page.tsx                   # Server-side filtering logic

config/
└── features.ts                # Feature flag configuration

lib/
├── rollout.ts                 # Rollout utility for percentage-based deployment
└── analytics/
    └── filterEvents.ts        # Filter analytics tracking

src/services/neon/
└── catalogRepository.ts       # MongoDB projection updates
```

### Data Flow

1. **User Interaction**: User clicks filter pill or chip
2. **State Update**: Component updates draft state (e.g., `draftMetals`)
3. **URL Update**: `updateQuery()` updates search params
4. **Server Refetch**: Next.js refetches server component with new params
5. **Filtering**: Server applies filters and returns results
6. **UI Update**: Client displays filtered products

### URL Parameters

```
?category=rings
&min_price=100
&max_price=500
&metal=gold,platinum
&availability=ready
&tone=warm
&gemstone=diamond,sapphire
&material=14k-gold
&tag=gift,wedding
&limited=true
&bestseller=true
&sort=price_asc
&view=grid
```

## Developer Guide

### Adding a New Filter

1. **Backend (page.tsx)**:
   ```typescript
   // Parse parameter
   const selectedNewFilter = sanitizedParams.get('new_filter')
   
   // Add to filtering logic
   if (selectedNewFilter && product.newFilterField !== selectedNewFilter) {
     return false
   }
   
   // Update active filter count
   const activeFilterCount = ... + (selectedNewFilter ? 1 : 0)
   
   // Pass to client
   <CatalogClient newFilter={selectedNewFilter} />
   ```

2. **Frontend (CatalogClient.tsx)**:
   ```typescript
   // Add to props interface
   interface CatalogClientProps {
     newFilter?: string
   }
   
   // Add state
   const [isNewFilterDropdownOpen, setIsNewFilterDropdownOpen] = useState(false)
   const [draftNewFilter, setDraftNewFilter] = useState(newFilter)
   
   // Add handlers
   const applyNewFilter = () => {
     updateQuery({ new_filter: draftNewFilter })
     setIsNewFilterDropdownOpen(false)
   }
   
   // Add FilterPill
   <FilterPill
     label="New Filter"
     active={!!newFilter}
     onClick={() => setIsNewFilterDropdownOpen(!isNewFilterDropdownOpen)}
   />
   
    // Add FilterDropdown
    <FilterDropdown
      isOpen={isNewFilterDropdownOpen}
      onApply={applyNewFilter}
      onReset={resetNewFilter}
      title="New Filter"
    >
      {/* Filter options */}
    </FilterDropdown>
  ```

## Sticky Behavior Blueprint (Future-Friendly)

The current experience purposefully skips sticky mode to keep the bar from colliding with the global nav. If stakeholders request a sticky comeback, follow this playbook:

1. **Top Offset Variable**  
   Reference the site header height via CSS variable (e.g., `var(--site-header-height)`) and apply it to `top` on the sticky wrapper so the filter bar always sits just below the nav.

2. **Placeholder Wrapper**  
   Wrap the shell in a container with a fixed height (match the shell’s height) before applying `position: sticky`. This prevents the page from “jumping” when the bar switches to sticky mode.

3. **Breakpoint Guard**  
   Only enable sticky behavior on large screens (`lg:` and above). On mobile, letting the bar scroll away keeps the hero and product grid usable.

4. **No Fixed Positioning**  
   Stick with `position: sticky` instead of `fixed` so gutters, padding, and the gallery width all remain intact.

Documenting these guardrails now means we can safely reintroduce sticky mode later without repeating the overlap bug we just removed.

3. **MongoDB (catalogRepository.ts)**:
   ```typescript
   projection: {
     // ... existing fields
     newFilterField: 1,
   }
   ```

### Analytics Integration

Track filter interactions:

```typescript
import { trackFilterPillClick, trackFilterApplied } from '@/lib/analytics/filterEvents'

// Track pill click
const handlePillClick = () => {
  trackFilterPillClick('metal')
  setIsMetalDropdownOpen(true)
}

// Track filter application
const applyMetalFilter = () => {
  trackFilterApplied('metal', draftMetals.join(','), resultCount)
  updateQuery({ metal: draftMetals.join(',') })
}
```

Available tracking functions:
- `trackFilterPillClick(filterType)`
- `trackFilterApplied(filterType, filterValue, resultCount)`
- `trackFilterPresetUsed(presetName)`
- `trackQuickChipToggle(chipName, isActive)`
- `trackFilterDropdownAbandoned(filterType)`
- `trackFilterReset(resetType, filterType?)`

### Styling Guidelines

- **Pills**: Use `FilterPill` component with Aurora Design System tokens
- **Dropdowns**: Use `FilterDropdown` with 32px border radius
- **Chips**: Use `QuickFilterChip` for direct actions
- **Scroll**: Apply `scrollbar-hide` utility class for clean horizontal scroll
- **Colors**: Use design system tokens (e.g., `text-text-primary`, `border-border-subtle`)

### Accessibility

All filter components are built with accessibility in mind:
- Proper ARIA labels (`aria-expanded`, `aria-controls`)
- Keyboard navigation support
- Focus management
- Screen reader friendly

## User Guide

### How to Filter Products

1. **Quick Picks**: Click any preset link (e.g., "🎁 Gifts Under $300") for instant filtering
2. **Filter Pills**: Click a pill (e.g., "Metal") to open dropdown and select options
3. **Quick Chips**: Toggle chips (e.g., "Under $300") for instant filtering
4. **More Filters**: Click "More Filters" for advanced options like Materials and Tags

### Clearing Filters

- **Single Filter**: Click the "×" icon next to an active filter
- **All Filters**: Click "Clear all" link below active filters
- **Reset Button**: Use "Reset" in the More Filters drawer

### Mobile Experience

- **Horizontal Scroll**: Swipe left/right to see all filter options
- **Snap Points**: Pills snap into view for easy selection
- **Sticky Bar**: Filter bar stays visible as you scroll
- **Touch Optimized**: Large touch targets (50px min height)

## Testing

### Manual Testing Checklist

- [ ] Filter pills open/close correctly
- [ ] Dropdown options update URL parameters
- [ ] Product results update after filtering
- [ ] Active filter count displays correctly
- [ ] Clear all removes all filters
- [ ] Mobile horizontal scroll works smoothly
- [ ] Sticky behavior activates at 200px scroll
- [ ] Quick chips toggle correctly
- [ ] Filter presets apply correct combinations
- [ ] More Filters drawer opens/closes properly

### E2E Testing

E2E tests will be created in `tests/e2e/filters.spec.ts`:

```typescript
test('should apply metal filter', async ({ page }) => {
  await page.goto('/collections')
  await page.click('[aria-controls="metal-dropdown"]')
  await page.click('text=Gold')
  await page.click('text=Apply')
  
  await expect(page).toHaveURL(/metal=gold/)
  await expect(page.locator('.product-card')).toHaveCount(/* expected */)
})
```

## Performance Considerations

### Optimization Strategies

1. **URL-Based State**: Filters stored in URL for instant back/forward navigation
2. **Server-Side Filtering**: Heavy filtering logic runs on server
3. **Virtualization**: Product grid uses virtualization for large result sets
4. **Debouncing**: Price input changes debounced to reduce refetches
5. **Prefetching**: Common filter combinations prefetched on hover

### Monitoring Metrics

- Filter interaction rate
- Time to first filter
- Filter abandonment rate
- Most popular filter combinations
- Mobile vs. desktop usage patterns

## Rollout Strategy

### Phase 1: Internal Testing (Week 1)
- Enable for 100% of internal team
- Run E2E test suite
- Accessibility audit
- Performance testing

### Phase 2: Gradual Rollout (Week 2)
- Day 1: 10% traffic (`FILTER_ROLLOUT_PERCENTAGE=10`)
- Day 2: 25% traffic
- Day 3: 50% traffic
- Day 5: 100% traffic

### Phase 3: Monitoring (Week 3)
- Monitor analytics dashboards
- Collect user feedback
- Optimize based on usage patterns

## Troubleshooting

### Common Issues

**Issue**: Filters not persisting on page refresh
- **Solution**: Ensure URL parameters are being set correctly with `updateQuery()`

**Issue**: Dropdown not closing after apply
- **Solution**: Check that `setIs{Filter}DropdownOpen(false)` is called in apply handler

**Issue**: Active filter count incorrect
- **Solution**: Verify all filters are included in `activeFilterCount` calculation

**Issue**: Mobile scroll not working
- **Solution**: Ensure `scrollbar-hide` class is applied and parent has `overflow-x-auto`

## Support

For questions or issues:
1. Check this documentation
2. Review implementation plan
3. Contact the development team
4. Submit a GitHub issue

## Changelog

### v1.0.0 (Nov 2025)
- Initial release with horizontal pill layout
- Added Gemstone, Materials, and Tags filters
- Implemented filter presets
- Added analytics tracking
- Feature flag support for gradual rollout
