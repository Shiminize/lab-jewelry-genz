# Quick Fix Reference Card

## 🚨 Common Issues & Instant Fixes

### Issue: Port Already in Use (EADDRINUSE)
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Issue: 404 Errors for /_next/static/*
```bash
rm -rf .next
npm run dev
# Then hard refresh browser: Cmd+Shift+R
```

### Issue: MongoDB Connection Errors
**File**: `.env.local`
```bash
CONCIERGE_DATA_MODE=stub
# MONGODB_URI=mongodb://localhost:27017/glowglitch
```

### Issue: Widget Shows "Couldn't Complete Request"
```bash
# Test API manually
curl -X POST http://localhost:3000/api/support/products \
  -H "Content-Type: application/json" \
  -d '{"readyToShip": true}'

# Should return products JSON (not 405)
```

### Issue: UI Not Rendering After Changes
```bash
# Nuclear option - full clean restart
pkill -9 -f node
rm -rf .next
npm run dev
# Wait 10 seconds
# Hard refresh browser: Cmd+Shift+R
```

### Issue: Stale Browser Cache
```
1. Open Chrome DevTools
2. Right-click reload button
3. Select "Empty Cache and Hard Reload"
```

---

## ✅ Health Check Commands

### Is Server Running?
```bash
curl -I http://localhost:3000
# Expected: HTTP/1.1 200 OK
```

### Is Widget API Working?
```bash
curl -s http://localhost:3000/api/support/products?readyToShip=true | head -c 100
# Expected: [{"id":"aurora-ring-...
```

### Any Port Conflicts?
```bash
lsof -i:3000
# Expected: One node process only
```

### Check Current Config
```bash
cat .env.local | grep -v "^#" | grep -v "^$"
# Expected: CONCIERGE_DATA_MODE=stub
```

---

## 📊 Quick Status Check

### All Systems Go ✅
```bash
✅ curl http://localhost:3000 returns 200
✅ Browser console has 0-1 errors
✅ Widget button visible bottom-right
✅ Clicking "Ready to ship" shows products
```

### Something's Wrong ❌
```bash
❌ Port 3000 not responding
   → lsof -ti:3000 | xargs kill -9 && npm run dev

❌ 404 errors in console
   → rm -rf .next && npm run dev

❌ Widget error message
   → Check POST /api/support/products returns 200

❌ MongoDB errors flooding logs
   → Verify .env.local has CONCIERGE_DATA_MODE=stub
```

---

## 🔧 Emergency Reset (Nuclear Option)

If everything is broken:

```bash
# 1. Kill all processes
pkill -9 -f "node"

# 2. Clean all caches
rm -rf .next
rm -rf node_modules/.cache

# 3. Verify config
cat .env.local
# Should have: CONCIERGE_DATA_MODE=stub
# Should NOT have: active MONGODB_URI

# 4. Start fresh
npm run dev

# 5. Wait for compilation (30 seconds)
sleep 30

# 6. Test
curl -I http://localhost:3000

# 7. Open browser with clean cache
# Chrome: Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Win)
```

---

## 📞 Quick Diagnostics

### "Port 3000 is busy"
```bash
lsof -ti:3000 | xargs kill -9
```

### "Widget not working"
```bash
# Test the endpoint directly
curl -X POST http://localhost:3000/api/support/products \
  -H "Content-Type: application/json" \
  -d '{"readyToShip": true}'
```

### "UI looks broken"
```
1. Check console for errors
2. Hard refresh: Cmd+Shift+R
3. If still broken: rm -rf .next && npm run dev
```

### "Too many MongoDB errors"
```bash
# Edit .env.local, set:
CONCIERGE_DATA_MODE=stub

# Restart server:
lsof -ti:3000 | xargs kill -9
npm run dev
```

---

## 🎯 Success Indicators

### Healthy Server
```
✅ Starts in ~30 seconds
✅ No EADDRINUSE errors
✅ "ready - started server on 0.0.0.0:3000"
✅ 0-1 MongoDB messages (fallback is OK)
```

### Healthy Browser
```
✅ Page loads in 2-5 seconds
✅ Console shows 0 errors (or 1 warning OK)
✅ Network tab: all /_next/static/* return 200
✅ Widget button visible and clickable
```

### Healthy API
```
✅ POST /api/support/products → 200 + JSON array
✅ GET /api/support/products?readyToShip=true → 200 + JSON array
✅ Response time < 1 second
```

---

## 📝 Common Patterns

### After Changing .env.local
```bash
# ALWAYS restart server
lsof -ti:3000 | xargs kill -9
npm run dev
```

### After Changing next.config.js
```bash
# ALWAYS clear build cache
rm -rf .next
npm run dev
```

### After Pulling Git Changes
```bash
# Safe restart
npm install  # Update dependencies
rm -rf .next  # Clear build
npm run dev
```

### After Widget Code Changes
```bash
# Just refresh browser if server still running
# Or restart if types/interfaces changed
```

---

## 🚀 One-Liners

```bash
# Full reset
pkill -9 -f node; rm -rf .next; npm run dev

# Quick restart
lsof -ti:3000 | xargs kill -9 && npm run dev

# Test everything
curl -I http://localhost:3000 && curl -s -X POST http://localhost:3000/api/support/products -H "Content-Type: application/json" -d '{"readyToShip":true}' | head -c 200

# Check what's using port 3000
lsof -i:3000

# View server logs
tail -f dev.log  # If redirected to file
```

---

**Keep This Card Handy For Quick Fixes!** 🛠️

