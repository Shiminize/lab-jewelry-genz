# Filter Layout Audit & Issues

## Date: November 19, 2025

## Problems Identified

### Problem 1: Dropdown Overlap ❌
**Issue**: All dropdowns are positioned with `absolute left-0 top-full` which makes them ALL appear at the left edge of the parent container, causing overlap.

**Current Code**:
```tsx
// Line 760: Parent container
<div className="relative mt-6">
  <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
    <FilterPill label="Category" ... />
    <FilterPill label="Price" ... />
    <FilterPill label="Metal" ... />
    ...
  </div>
  
  {/* ALL dropdowns render HERE - at same position */}
  {isPriceDropdownOpen && <FilterDropdown ... />}
  {isMetalDropdownOpen && <FilterDropdown ... />}
  {isToneDropdownOpen && <FilterDropdown ... />}
</div>
```

**Root Cause**:
- ALL dropdowns are siblings under the same parent `div`
- ALL have `absolute left-0` positioning
- They all appear at the LEFT edge, regardless of which pill was clicked
- No individual positioning relative to each pill

---

### Problem 2: Not Truly Linear Layout
**Issue**: While pills are in flexbox, they may wrap on smaller screens or with padding/margin issues.

**Current Structure**:
```
┌─ Filter Shell (rounded-[32px], px-5, py-6) ─────────────┐
│  Row 1: All Capsules | Search | Sort                     │
│  Filter Presets: Quick Picks                             │
│  Row 2: [Category] [Price] [Metal] [Availability]...     │
│  (All dropdowns render here - overlapping!)              │
└──────────────────────────────────────────────────────────┘
```

**Issues**:
- Pills container has correct `flex` but lacks `flex-wrap: nowrap`
- No maximum constraints to prevent wrapping
- FilterShell padding might be too large (px-5 on mobile)

---

## Solution Architecture

### Fix 1: Individual Dropdown Positioning
Each dropdown needs to be positioned relative to ITS OWN pill, not the container.

**Strategy**: Wrap each pill + dropdown pair in a `relative` container

```tsx
// ✅ CORRECT STRUCTURE
<div className="flex items-center gap-3 ...">
  {/* Category */}
  <div className="relative">
    <FilterPill label="Category" ... />
    {isCategoryDropdownOpen && <FilterDropdown ... />}
  </div>
  
  {/* Price */}
  <div className="relative">
    <FilterPill label="Price" ... />
    {isPriceDropdownOpen && <FilterDropdown ... />}
  </div>
  
  {/* Metal */}
  <div className="relative">
    <FilterPill label="Metal" ... />
    {isMetalDropdownOpen && <FilterDropdown ... />}
  </div>
  
  ...
</div>
```

---

### Fix 2: Enforce True Linear Layout
Ensure pills NEVER wrap

```tsx
<div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide flex-nowrap">
  {/* Pills here */}
</div>
```

Add to container:
- `flex-nowrap` - prevents wrapping
- `min-w-0` - allows flex items to shrink below content size

---

### Fix 3: Adjust FilterShell Padding
Reduce padding on mobile to maximize horizontal space

```tsx
// Before
className="rounded-[32px] border ... px-5 py-6 md:px-8 md:py-8"

// After
className="rounded-[32px] border ... px-3 py-4 md:px-8 md:py-8"
```

---

## Implementation Changes Required

### File: `app/collections/CatalogClient.tsx`

#### Change 1: Wrap Each Pill + Dropdown in `relative` Container

**Lines 761-1071** - Restructure filter pills section

**Before**:
```tsx
<div className="relative mt-6">
  <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
    <FilterPill label="Category" ... />
    <FilterPill label="Price" ... />
    ...
  </div>
  
  {isPriceDropdownOpen && <FilterDropdown ... />}
  {isMetalDropdownOpen && <FilterDropdown ... />}
  ...
</div>
```

**After**:
```tsx
<div className="mt-6">
  <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide flex-nowrap">
    
    {/* Category Filter */}
    <div className="relative flex-shrink-0">
      <FilterPill label="Category" ... />
      {isCategoryDropdownOpen && (
        <FilterDropdown ... />
      )}
    </div>
    
    {/* Price Filter */}
    <div className="relative flex-shrink-0">
      <FilterPill label="Price" ... />
      {isPriceDropdownOpen && (
        <FilterDropdown ... />
      )}
    </div>
    
    {/* Metal Filter */}
    <div className="relative flex-shrink-0">
      <FilterPill label="Metal" ... />
      {isMetalDropdownOpen && (
        <FilterDropdown ... />
      )}
    </div>
    
    {/* Continue for all filters... */}
  </div>
</div>
```

---

#### Change 2: Add `flex-nowrap` to Pills Container

**Line 761**:
```tsx
// Before
<div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">

// After
<div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide flex-nowrap">
```

---

#### Change 3: Reduce Mobile Padding

**Line 160** - Update `filterShellClass`:
```tsx
// Before
const filterShellClass = 'rounded-[32px] border border-border-subtle/70 bg-surface-base/95 px-5 py-6 shadow-soft md:px-8 md:py-8'

// After
const filterShellClass = 'rounded-[32px] border border-border-subtle/70 bg-surface-base/95 px-3 py-4 shadow-soft md:px-8 md:py-8'
```

---

## Expected Result After Fixes

### Dropdown Positioning
✅ Category dropdown appears below Category pill  
✅ Price dropdown appears below Price pill  
✅ Metal dropdown appears below Metal pill  
✅ No overlap between dropdowns  
✅ Dropdowns stay within viewport (responsive)

### Linear Layout
✅ Pills in single horizontal row  
✅ Never wrap to second line  
✅ Horizontal scroll on mobile  
✅ Smooth snap scrolling  
✅ No vertical stacking

---

## Visual Representation

### Before (Current - WRONG):
```
[Category] [Price] [Metal] [Availability] [Tone]
└─ Dropdown appears here for ALL pills (overlaps!)
```

### After (Fixed - CORRECT):
```
[Category]     [Price]     [Metal]     [Availability]
    └─ Cat DD   └─ Price DD  └─ Metal DD  └─ Avail DD
```

Each dropdown appears directly below its own pill.

---

## Additional Optimizations

### 1. Dropdown Width Strategy
Since dropdowns can vary in width, consider:
- Price: Narrower (min/max inputs)
- Metal: Wider (multiple options)
- Category: Medium

**Solution**: Let each dropdown size naturally, but add responsive constraints:

```tsx
<FilterDropdown 
  className="w-full min-w-[280px] max-w-[min(380px,90vw)]"
  ...
/>
```

---

### 2. Mobile Dropdown Positioning
On very small screens, dropdowns might go off-screen to the right.

**Solution**: Add responsive positioning:

```tsx
// In FilterDropdown.tsx
className={cn(
  'absolute left-0 top-full z-30 mt-2',
  'w-full min-w-[280px] max-w-[380px]',
  // Add this for right-side pills on mobile:
  'md:left-auto md:right-0'
)}
```

Better: Use JavaScript to detect position and flip if needed (future enhancement).

---

### 3. Dropdown Z-Index Management
If sticky header overlaps dropdowns:

```tsx
// Ensure dropdowns appear above sticky header
const filterBarZIndex = 30
const dropdownZIndex = 40

// Update dropdown className
className="... z-40 ..." // Was z-30
```

---

## Testing Checklist

After implementing fixes:

- [ ] Click Category pill → dropdown appears below Category pill only
- [ ] Click Price pill → dropdown appears below Price pill only
- [ ] Click Metal pill → dropdown appears below Metal pill only
- [ ] No dropdown overlap when switching between pills
- [ ] Pills stay in single horizontal row (never wrap)
- [ ] Horizontal scroll works on mobile
- [ ] Dropdowns close when clicking outside
- [ ] Dropdowns don't get cut off on right edge
- [ ] Sticky behavior still works correctly
- [ ] All dropdowns show their content (not empty)

---

## Estimated Impact

### Before:
- Dropdown UX: ❌ Broken (overlap)
- Layout: ⚠️ Semi-functional (might wrap)
- Mobile: ⚠️ Cramped padding

### After:
- Dropdown UX: ✅ Perfect (positioned correctly)
- Layout: ✅ True linear (never wraps)
- Mobile: ✅ Optimized spacing

---

## Priority

**P0 - Critical**: Must fix before any testing or rollout.

The current implementation is not functional for production use due to dropdown overlap.

---

## Implementation Time Estimate

- **Fix 1** (Individual positioning): 45 minutes
- **Fix 2** (Linear layout): 5 minutes
- **Fix 3** (Padding adjustment): 2 minutes
- **Testing**: 15 minutes

**Total**: ~70 minutes

---

## References

- James Allen Reference: Dropdowns appear below their respective pills
- Industry Standard: Each dropdown positioned relative to its trigger
- CSS Flexbox: `flex-nowrap` prevents wrapping
- Mobile UX: Horizontal scroll for overflow content

