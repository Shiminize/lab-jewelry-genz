# Aurora Concierge Widget - UX Testing Guide

**Version**: Post-Fix v1.0  
**Date**: January 15, 2025  
**Server**: http://localhost:3000

---

## Quick Testing Checklist

### ✅ Critical Fixes Validation (5-10 minutes)

#### Test 1: Product View Links
```
1. Open homepage (http://localhost:3000)
2. Click "Ask Aurora Concierge" button (bottom-right)
3. Click "Gifts under $300" quick link
4. Wait for products to load
5. Click "View details" on any product
6. ✅ PASS: Catalog page opens with search results
7. ❌ FAIL: 404 error or broken link
```

#### Test 2: Shortlist Visual Confirmation
```
1. Open widget
2. Click "Ready to ship" quick link
3. Click "Save to shortlist" on first product
4. ✅ PASS: Button changes to green "Saved ✓" with checkmark
5. ✅ PASS: Aurora message confirms save
6. Click "Save to shortlist" on second product
7. ✅ PASS: Second button also turns green
```

#### Test 3: Header Copy Accuracy
```
1. Open widget
2. Read header subheading below "Let's craft your spark"
3. ✅ PASS: Says "ready-to-ship pieces, tracks orders"
4. ❌ FAIL: Mentions "capsules"
```

#### Test 4: No Footer CTA Button
```
1. Open widget
2. Click "Design ideas" quick link
3. Scroll to bottom of product carousel
4. ✅ PASS: Only individual product buttons visible
5. ❌ FAIL: Large footer button below products
```

#### Test 5: Touch Target Size (Mobile)
```
1. Open browser dev tools (F12)
2. Toggle device toolbar (Cmd/Ctrl + Shift + M)
3. Select iPhone 14 Pro or similar
4. Open widget
5. Try tapping all buttons
6. ✅ PASS: All buttons easy to tap, no mis-clicks
7. ❌ FAIL: Buttons too small or hard to tap
```

---

## Detailed Test Scenarios

### Scenario A: New User Product Discovery

**Goal**: Validate end-to-end discovery flow

**Steps**:
1. Open homepage in incognito/private window
2. Click Aurora widget button
3. Observe intro message and quick links
4. Click "Gifts under $300"
5. Review product cards (should show 1 product: "Minimalist Band Ring" at $299)
6. Click "View details" on product
7. Verify catalog page opens
8. Return to homepage
9. Re-open widget (should remember conversation)
10. Click "Save to shortlist" on product
11. Verify button turns green with checkmark
12. Close and re-open widget
13. Verify shortlist persists (Aurora should mention saved items)

**Expected Results**:
- ✅ Product view link opens catalog correctly
- ✅ Shortlist button shows visual confirmation
- ✅ Session persists across open/close
- ✅ No console errors

---

### Scenario B: Mobile User Journey

**Goal**: Validate mobile usability improvements

**Device**: iPhone 14 Pro (390x844) or Android equivalent

**Steps**:
1. Open homepage on mobile simulator
2. Verify widget FAB visible and not overlapping nav
3. Tap Aurora widget button
4. Observe widget opening animation
5. Test touch targets:
   - Tap "Design ideas" quick link
   - Tap "Track order" inline button
   - Tap "Talk to stylist" inline button
   - Tap "Save to shortlist" on product
   - Tap "View details" on product
6. Verify all taps register on first attempt (no double-tap needed)
7. Check button sizing with ruler tool:
   - All buttons should be ≥44px height

**Expected Results**:
- ✅ All buttons easily tappable with thumb
- ✅ No accidental adjacent button taps
- ✅ Touch feedback feels responsive
- ✅ Widget doesn't cover critical UI elements

---

### Scenario C: Accessibility Validation

**Goal**: Ensure WCAG 2.2 AA compliance

**Tools**: Keyboard only (no mouse)

**Steps**:
1. Tab to Aurora widget button
2. Press Enter to open
3. Tab through all interactive elements:
   - Close button (X)
   - Quick links in intro
   - Message input field
   - Send button
   - Product action buttons
   - Footer quick links
   - Footer inline actions
4. Verify focus indicators visible on each element
5. Press Escape key to close widget
6. Verify widget closes properly

**Screen Reader Test** (optional):
1. Enable VoiceOver (Mac) or NVDA (Windows)
2. Open widget
3. Verify announcements:
   - "Dialog" when widget opens
   - "Let's craft your spark" heading
   - New messages announced as they appear
   - Button labels clearly spoken
   - "Saved checkmark" announced after shortlist

**Expected Results**:
- ✅ All elements keyboard accessible
- ✅ Focus indicators visible
- ✅ Logical tab order
- ✅ Escape key closes widget
- ✅ Screen reader announces all content

---

## Browser Compatibility Matrix

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 120+ | ✅ Tested | Full support |
| Safari | 17+ | ✅ Tested | Full support |
| Firefox | 121+ | ✅ Tested | Full support |
| Edge | 120+ | ✅ Tested | Full support |
| Mobile Safari | iOS 16+ | ⏳ Pending | Need device testing |
| Chrome Android | Latest | ⏳ Pending | Need device testing |

---

## Visual Regression Checks

### Before/After Comparisons

#### Shortlist Button States
**Before**: 
```
[Save to shortlist]  (white bg, gray border)
```

**After**:
```
[Save to shortlist]  → Click → [✓ Saved ✓]  (green bg, green border)
```

#### Product Card Actions
**Before**:
```
[Save to shortlist] [View details] [Save to shortlist] (footer CTA)
                                    ↑ Non-functional
```

**After**:
```
[Save to shortlist] [View details]
                    ↑ Opens catalog correctly
```

#### Header Copy
**Before**:
```
"Share your vision—Aurora matches capsules, tracks timelines..."
                                      ↑ Outdated
```

**After**:
```
"Share your vision—Aurora finds ready-to-ship pieces, tracks orders..."
                                  ↑ Accurate
```

---

## Performance Checks

### Load Time
```bash
# Test homepage load time
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000

Expected: < 2s for full page load
```

### Widget Open Performance
```
1. Open browser Performance tab (DevTools)
2. Start recording
3. Click Aurora widget button
4. Stop recording when widget fully visible

Expected: 
- Time to interactive: < 200ms
- No layout shifts
- Smooth animation (60fps)
```

### API Response Time
```bash
# Test product API
curl -X POST http://localhost:3000/api/support/products \
  -H "Content-Type: application/json" \
  -d '{"priceMax": 300}' \
  -w "\nTime: %{time_total}s\n"

Expected: < 100ms response time
```

---

## Error Scenarios

### Test Error Handling

#### Scenario 1: MongoDB Unavailable
```bash
# Stop MongoDB
brew services stop mongodb-community

# Test widget still works with stub data
# Expected: Widget shows 3 stub products, no errors
```

#### Scenario 2: Network Failure
```
1. Open DevTools → Network tab
2. Enable "Offline" mode
3. Try clicking quick links
4. Expected: Graceful error message, no crash
```

#### Scenario 3: Invalid Product ID
```
1. Open widget
2. Type: "/gift 999999"
3. Expected: "No products found" message, not error
```

---

## Console Log Monitoring

### Expected Logs (Acceptable)
```
[DEBUG] Products received: Array(1)
[DEBUG] Is array? true
[DEBUG] Count: 1
```

### Unexpected Logs (Issues)
```
❌ ERROR: Cannot read properties of undefined
❌ 404: GET /images/catalog/*.jpg
❌ TypeError: product.price.toLocaleString is not a function
❌ Warning: Each child in a list should have a unique "key"
```

---

## Rollback Plan

If critical issues found during testing:

### Emergency Rollback
```bash
cd /Users/decepticonmanager/Projects/GenZJewelry_AUG_12

# Stash current changes
git stash push -m "UX fixes rollback"

# Return to previous state
git checkout HEAD~1

# Restart dev server
npm run dev
```

### Partial Rollback (Specific Fix)
```bash
# Revert only ProductCarousel changes
git checkout HEAD -- src/components/support/modules/ProductCarousel.tsx

# OR revert only SupportWidget changes
git checkout HEAD -- src/components/support/SupportWidget.tsx
```

---

## Sign-off Checklist

Before marking as "Ready for Production":

- [ ] All 5 critical tests passing
- [ ] Mobile usability validated on real device
- [ ] Accessibility audit passing (no violations)
- [ ] All browsers tested and working
- [ ] No console errors in any scenario
- [ ] Performance metrics within acceptable range
- [ ] Error handling graceful in all edge cases
- [ ] Product manager sign-off
- [ ] UI/UX designer sign-off
- [ ] Engineering lead sign-off

---

## Next Steps After Testing

### If All Tests Pass ✅
1. Commit changes with descriptive message
2. Push to feature branch
3. Create pull request with link to this testing guide
4. Schedule staging deployment
5. Plan canary rollout (10% → 50% → 100%)

### If Issues Found ❌
1. Document issues in GitHub Issues
2. Prioritize by severity (Critical → High → Medium)
3. Implement fixes
4. Re-run affected tests
5. Repeat until all tests pass

---

## Contact

**Questions or Issues?**
- Slack: #aurora-widget-dev
- Email: dev-team@glowglitch.com
- Documentation: `/Docs/Widget_Program/`

**Testing Support:**
- QA Lead: [Name]
- UI/UX Designer: [Name]
- Engineering Lead: [Name]

---

**Testing Status**: ⏳ Ready for validation  
**Last Updated**: January 15, 2025

