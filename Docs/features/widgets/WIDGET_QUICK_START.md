# Concierge Widget Quick Start Guide

**Status**: Phase 1 Complete - Full MongoDB Integration ✅  
**Last Updated**: October 18, 2025

---

## 🚀 Getting Started

### Prerequisites
- MongoDB running on `localhost:27017`
- Node.js v18+
- Environment configured (`.env.local`)

### Setup (5 minutes)

```bash
# 1. Create MongoDB collections and indexes
node scripts/create-widget-collections.js

# 2. Seed product data (7 products)
node scripts/seed-database.js

# 3. Seed mock orders for testing (3 orders)
node scripts/seed-mock-orders.js

# 4. Verify everything works
node scripts/test-widget-mongodb.js

# 5. Start dev server
npm run dev
```

### Configuration

Ensure `.env.local` contains:
```bash
CONCIERGE_DATA_MODE=localDb
MONGODB_URI=mongodb://localhost:27017/glowglitch
MONGODB_DB=glowglitch
```

---

## 💬 Using the Widget

### Opening the Widget
1. Visit `http://localhost:3000`
2. Click **"Ask Aurora Concierge"** button (bottom-right)
3. Widget dialog opens with welcome message

### Quick Start Journeys (Chips)
- **Design ideas** → Product recommendations
- **Gifts under $300** → Budget-filtered products
- **Ready to ship** → Products available now
- **Track my order** → Order status lookup
- **Returns & resizing** → RMA flows

### Text Input Examples

#### Product Searches
```
"Show me ready to ship rings"
"Earrings under $500"
"Engagement rings"
"Gold necklaces"
```

#### Order Tracking
```
"Track my order GG-12001"
"Where is my order?"
"Order status"
```

#### Returns
```
"I need to return my ring"
"Resize my ring"
"Wrong size"
```

#### Stylist Contact
```
"Talk to a stylist"
"Need help"
"Live chat"
```

### Command Shortcuts
```
/track GG-12001       → Track specific order
/gift 300             → Gifts under $300
/ready to ship        → Ready-to-ship products
/rings                → All rings
/rings under 500      → Rings under $500
/earrings             → All earrings
/stylist              → Contact stylist
```

---

## 🧪 Testing Flows

### 1. Product Search Flow
1. Open widget
2. Type: "ready to ship rings"
3. **Expected**: Product carousel with 4 rings
4. Click "Add to shortlist" on 2+ products
5. **Expected**: Items are added to your shortlist

### 2. Order Tracking Flow
1. Open widget
2. Type: "track GG-12001"
3. **Expected**: Timeline with order stages
4. Click "Text me updates"
5. **Expected**: Confirmation message

### 3. Returns Flow
1. Open widget
2. Type: "return my order"
3. **Expected**: Return options module
4. Enter order ID: GG-12001
5. Select option: "Return"
6. **Expected**: RMA number generated

### 4. Shortlist Flow
1. Search products (add 2+ to shortlist)
2. **Expected**: Items appear in your shortlist
3. Use shortlist to compare or share with support

### 5. Stylist Escalation Flow
1. Open widget
2. Type: "talk to a stylist"
3. **Expected**: Escalation form
4. Fill: Name, Email, Notes
5. Submit
6. **Expected**: Ticket ID (format: TICKET-{timestamp}-{4chars})

### 6. CSAT Flow
1. Complete any flow
2. **Expected**: CSAT prompt appears
3. Click "Great" or "Needs follow-up"
4. **Expected**: Thank you message

---

## 📊 Verifying Data

### Check MongoDB Collections
```bash
# Connect to MongoDB
mongosh

# Switch to database
use glowglitch

# View products
db.products.find({readyToShip: true}).pretty()

# View orders
db.orders.find({orderNumber: "GG-12001"}).pretty()

# View widget shortlists
db.widgetShortlists.find().pretty()

# View stylist tickets
db.stylistTickets.find().pretty()

# View CSAT feedback
db.csatFeedback.find().pretty()

# View analytics events
db.analyticsEvents.find().sort({timestamp: -1}).limit(10).pretty()
```

### Test Order IDs
- `GG-12001` - Processing order, email: test@example.com, zip: 90001
- `GG-12002` - Shipped order, email: shipped@example.com
- `GG-12003` - Custom order, email: custom@example.com

---

## 🐛 Troubleshooting

### Widget Not Appearing
- Check console for errors
- Verify `.env.local` has `CONCIERGE_DATA_MODE=localDb`
- Restart dev server

### Products Not Loading
```bash
# Re-run seed script
node scripts/seed-database.js

# Verify products exist
mongosh glowglitch --eval "db.products.countDocuments()"
```

### Order Not Found
```bash
# Re-run order seed
node scripts/seed-mock-orders.js

# Verify orders exist
mongosh glowglitch --eval "db.orders.find({orderNumber: 'GG-12001'})"
```

### MongoDB Connection Error
```bash
# Check MongoDB is running
mongosh --eval "db.version()"

# If not running, start it:
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

### Provider Import Warnings
- **Fixed!** Stub and remote providers now exist
- If you see warnings, run: `npm run build`

---

## 📋 API Endpoints

### Widget Backend APIs
All routes under `/api/support/*`:

| Endpoint | Method | Purpose | MongoDB Collection |
|----------|--------|---------|-------------------|
| `/api/concierge/products` | GET | Product search | `products` |
| `/api/support/order-status` | POST | Order timeline | `orders` |
| `/api/support/returns` | POST | Create RMA | `orders` |
| `/api/support/shortlist` | POST | Save shortlist | `widgetShortlists` |
| `/api/support/stylist` | POST | Create ticket | `stylistTickets` |
| `/api/support/csat` | POST | Save feedback | `csatFeedback` |
| `/api/support/order-updates` | POST | Subscribe updates | `widgetOrderSubscriptions` |
| `/api/dev-analytics/collect` | POST | Log analytics | `analyticsEvents` |

### Testing Endpoints

```bash
# Test product query
curl "http://localhost:3000/api/concierge/products?readyToShip=true&tags=rings"

# Test order status
curl -X POST http://localhost:3000/api/support/order-status \
  -H "Content-Type: application/json" \
  -d '{"orderId": "GG-12001"}'

# Test analytics
curl http://localhost:3000/api/dev-analytics/collect
```

---

## 📈 Monitoring

### Check Analytics Events
```bash
# View recent events
mongosh glowglitch --eval "
  db.analyticsEvents
    .find()
    .sort({timestamp: -1})
    .limit(10)
    .forEach(e => print(e.event, e.sessionId))
"
```

### Event Types Tracked
- `aurora_widget_open`
- `aurora_widget_close`
- `aurora_intent_detected`
- `aurora_intent_complete`
- `aurora_products_shown`
- `aurora_product_shortlisted`
- `aurora_csat_submitted`
- `aurora_return_initiated`

### Collection Sizes
```bash
mongosh glowglitch --eval "
  ['products', 'orders', 'widgetShortlists', 
   'stylistTickets', 'csatFeedback', 'analyticsEvents'].forEach(c => 
    print(c + ':', db[c].countDocuments())
  )
"
```

---

## 🎯 Success Criteria

### Phase 1 Complete ✅
- [x] Widget renders and is interactive
- [x] Product search returns correct results
- [x] Order tracking works (by ID and email+zip)
- [x] Returns flow creates RMA
- [x] Stylist tickets are created
- [x] CSAT feedback is stored
- [x] Analytics events are logged
- [x] All MongoDB collections exist with indexes
- [x] Seed data loaded (7 products, 3 orders)
- [x] Test script passes (4/4 tests)

### Ready for Phase 2 🚀
- [ ] Build support queue dashboard
- [ ] Build analytics dashboard
- [ ] Enhance orders dashboard
- [ ] Add security (rate limiting, validation)
- [ ] Write comprehensive tests
- [ ] Deploy to staging

---

## 🔗 Quick Links

### Documentation
- [Full Implementation Plan](/concierge-widget-implementation.plan.md)
- [Implementation Progress](/Docs/Widget_Program/implementation-progress.md)
- [Implementation Summary](/IMPLEMENTATION_SUMMARY.md)
- [Widget System Overview](/Docs/Widget_Program/widget_system_overview.md)

### Scripts
- Setup: `scripts/create-widget-collections.js`
- Seed Products: `scripts/seed-database.js`
- Seed Orders: `scripts/seed-mock-orders.js`
- Test: `scripts/test-widget-mongodb.js`

### Code Locations
- Widget UI: `src/components/support/SupportWidget.tsx`
- Intent Detection: `src/lib/concierge/intentRules.ts`
- Order Service: `src/server/services/orderService.ts`
- Widget Service: `src/server/services/widgetService.ts`
- Providers: `src/lib/concierge/providers/`

---

## 💡 Tips & Best Practices

1. **Always seed data first** - Widget needs products and orders to function
2. **Use command shortcuts** - Faster than typing full queries
3. **Check MongoDB** - When in doubt, verify data exists in collections
4. **Monitor analytics** - Track events to understand user behavior
5. **Test all flows** - Each intent should be tested end-to-end
6. **Watch console** - Errors show in browser and server console
7. **Use test orders** - GG-12001, GG-12002, GG-12003 have different statuses

---

## 🆘 Getting Help

### Check Logs
```bash
# Server logs
npm run dev | grep -i error

# MongoDB logs
tail -f /usr/local/var/log/mongodb/mongo.log  # macOS
tail -f /var/log/mongodb/mongod.log           # Linux
```

### Debug Mode
```javascript
// In browser console
localStorage.setItem('DEBUG', 'concierge:*')
```

### Common Issues
1. **"Order not found"** → Run seed script, check order ID
2. **"No products"** → Run product seed, check tags
3. **"MongoDB error"** → Verify connection string, check service status
4. **"Module not found"** → Rebuild: `npm run build`

---

**🎉 You're all set! Happy testing!**

For questions or issues, check the [Implementation Progress](/Docs/Widget_Program/implementation-progress.md) document.

