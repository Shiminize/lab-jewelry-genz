# Aurora Design System - Remediation Checklist
**Priority Actions to Achieve 95%+ CLAUDE_RULES Compliance**

## 🔴 Critical Priority - File Size Violations

### ProductCard.tsx (570 → <350 lines)
- [ ] **Extract ProductCardImage Component**
  - Move image handling, lazy loading, and aspect ratio logic
  - Target: ~80 lines
  
- [ ] **Extract ProductCardPricing Component** 
  - Move price formatting, discount calculation, and currency display
  - Target: ~60 lines
  
- [ ] **Extract ProductCardActions Component**
  - Move wishlist, cart, and interaction buttons
  - Target: ~70 lines
  
- [ ] **Retain Core ProductCard Logic**
  - Keep main component structure and prop handling
  - Target: ~320 lines (under limit)

### CreatorProfile.tsx (565 → <350 lines)
- [ ] **Extract ProfileHeader Component**
  - Move avatar, name, title, and social links
  - Target: ~80 lines
  
- [ ] **Extract ProfileStats Component**
  - Move commission tracking, performance metrics  
  - Target: ~90 lines
  
- [ ] **Extract ProfileActions Component**
  - Move edit profile, settings, and action buttons
  - Target: ~75 lines

- [ ] **Retain Core Profile Logic**
  - Keep main data fetching and state management
  - Target: ~320 lines (under limit)

## 🟡 Medium Priority - Token Standardization

### Admin Components Hardcoded Colors
**File: ConversionFunnelChart.tsx**
- [ ] Replace `#6B46C1` → `text-brand-primary` 
- [ ] Replace `#FF6B9D` → `text-brand-secondary`
- [ ] Replace `#C44569` → `text-brand-tertiary`
- [ ] Replace `#10B981` → `text-brand-accent`

**File: GeographicHeatMap.tsx**
- [ ] Replace `#FFFFFF` → `text-neutral-0`
- [ ] Create map-specific color tokens if needed

### Customizer Components
**File: AdvancedMaterialEditor.tsx**
- [ ] Replace `#FFD700` → `var(--token-color-material-gold)`
- [ ] Replace `#C0C0C0` → `var(--token-color-material-platinum)` 
- [ ] Replace `#E5E4E2` → `var(--token-color-material-white-gold)`
- [ ] Replace `#E8B4B8` → `var(--token-color-material-rose-gold)`

### UI Components  
**File: DiamondProcessIcons.tsx**
- [ ] Create gradient token definitions in design-tokens.css
- [ ] Replace hardcoded gradient stops with token references

## ⚡ Quick Wins - Minor Fixes

### Material Selection Components
- [ ] **QuickSelector.tsx**: Use material token colors instead of `|| '#E8D7D3'`
- [ ] **MaterialSelection.tsx**: Standardize fallback color handling
- [ ] **GemstoneSelection.tsx**: Replace hardcoded `#FFFFFF`, `#0066CC`

## 📋 Implementation Strategy

### Week 1: File Size Refactoring
```bash
Day 1-2: ProductCard.tsx breakdown
Day 3-4: CreatorProfile.tsx breakdown  
Day 5: Test extracted components, ensure no regressions
```

### Week 2: Token Cleanup
```bash
Day 1-2: Admin components color standardization
Day 3-4: Customizer components token migration
Day 5: UI components gradient token creation
```

### Week 3: Validation & Testing
```bash
Day 1-2: Run comprehensive test suites
Day 3-4: Performance validation, A/B test prep
Day 5: Documentation updates, audit re-run
```

## 🎯 Success Criteria

### File Size Compliance
- [ ] All components ≤ 350 lines
- [ ] No functionality regressions
- [ ] Maintained code readability

### Token Usage
- [ ] ≥95% Aurora token usage
- [ ] Zero hardcoded hex colors in core components  
- [ ] All material colors use token system

### Performance Maintenance
- [ ] Homepage response time remains <100ms
- [ ] No additional CSS bundle size increase
- [ ] Component rendering performance maintained

## 🔍 Validation Commands

### File Size Check
```bash
find src/components -name "*.tsx" | xargs wc -l | awk '$1 > 350'
```

### Hardcoded Color Scan  
```bash
grep -r "#[0-9a-fA-F]{3,6}" src/components --include="*.tsx" | grep -v "// "
```

### Token Usage Verification
```bash
grep -r "var(--token-" src/components --include="*.tsx" | wc -l
```

### Performance Test
```bash
curl -s -w "%{time_total}" -o /dev/null http://localhost:3000
```

## 📈 Expected Outcomes

**After Completion:**
- **CLAUDE_RULES Compliance:** 87% → 95%+
- **File Size Violations:** 10 files → 0 files
- **Token Usage:** 80% → 95%+
- **Maintainability:** Significantly improved
- **A/B Testing:** Ready for activation

## 🚀 A/B Testing Readiness Gate

**Requirements to Enable A/B Testing:**
- [ ] ✅ File size compliance: All files ≤350 lines
- [ ] ✅ Token standardization: ≥95% token usage  
- [ ] ✅ Performance maintained: <100ms response time
- [ ] ✅ Zero regressions: All components render correctly
- [ ] ✅ Documentation updated: Component extraction documented

**Final Audit Required:** Re-run post-repair audit to confirm 95%+ compliance before A/B testing activation.

---
**Created:** September 6, 2025  
**Target Completion:** 3 weeks  
**Priority Level:** Medium (Non-blocking for current functionality)