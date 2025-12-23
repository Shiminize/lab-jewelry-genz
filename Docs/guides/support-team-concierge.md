# Aurora Concierge Widget - Support Team Guide

**Last Updated**: 2025-10-19  
**For**: Customer Support Team  
**Contact**: support-ops@glowglitch.com

---

## Table of Contents

1. [Widget Overview](#widget-overview)
2. [How to Access Dashboard](#how-to-access-dashboard)
3. [Understanding Widget Interactions](#understanding-widget-interactions)
4. [Common Customer Questions](#common-customer-questions)
5. [Escalation Triggers](#escalation-triggers)
6. [Known Limitations](#known-limitations)
7. [FAQ for Support Agents](#faq-for-support-agents)

---

## Widget Overview

### What is the Aurora Concierge Widget?

The Aurora Concierge Widget is an AI-powered support tool that helps customers with:

- **Product Discovery**: Finding ready-to-ship jewelry based on preferences
- **Order Tracking**: Checking order status and delivery timelines
- **Returns & Resizing**: Submitting return/resize requests
- **General Support**: Answering common questions

### Where Does it Appear?

- **Homepage**: Bottom-right corner (pink gradient button)
- **Product Pages**: Available for quick questions
- **Catalog**: Helps filter and find products
- **Checkout**: Available for last-minute questions

### Recommendation-Only Scope

**Important**: The widget does NOT offer customization or "capsule" features. It only recommends ready-to-ship products from existing inventory.

If customers ask about:
- Custom designs
- 3D customization
- "Capsule" reservations
- Personalized engravings

→ **Direct them to the 3D Customizer** at `/customizer` or escalate to stylist.

---

## How to Access Dashboard

### Login

1. Navigate to `https://glowglitch.com/dashboard`
2. Log in with your support team credentials
3. Click **Support** → **Concierge Tickets**

### Dashboard Sections

#### **Stylist Tickets**
Location: `/dashboard/support`

Shows all escalations where customers requested human assistance.

**Columns**:
- **Ticket ID**: Unique identifier
- **Customer**: Name and email
- **Created**: When customer submitted
- **Status**: Open / In Progress / Resolved
- **Priority**: Based on customer tier or urgency
- **Transcript**: Full conversation history

**Actions**:
- Click ticket to view full details
- Assign to yourself
- Update status
- Add internal notes
- Reply to customer (via email)

#### **CSAT Feedback**
Location: `/dashboard/support` → **CSAT tab**

Shows customer satisfaction ratings (1-5 stars).

**Metrics**:
- Average score (target: > 4.0)
- Total responses
- Score distribution chart
- Comments from customers

**Use for**:
- Identifying pain points
- Tracking improvement over time
- Reporting to management

#### **Analytics**
Location: `/dashboard/analytics/concierge` (Admin only)

**Metrics**:
- Widget open rate
- Most common intents (what users ask for)
- Conversion rate (interactions → purchases)
- Error rates

---

## Understanding Widget Interactions

### How Conversations Work

1. **Customer opens widget** → Sees welcome message
2. **Customer types question or clicks quick link**
3. **Widget detects intent** (order tracking, product search, etc.)
4. **Widget responds** with relevant module or information
5. **Customer can continue conversation** or close widget

### Intent Detection

The widget understands natural language:

| Customer Types | Intent Detected | Widget Shows |
|----------------|-----------------|--------------|
| "show me rings" | Product Search | Product grid (ready-to-ship only) |
| "where is my order" | Order Tracking | Order status form |
| "I want to return" | Returns | Return request form |
| "talk to a stylist" | Escalation | Stylist contact form |

### Session Persistence

Conversations are saved in browser session:
- Customer can close widget and reopen → history preserved
- Clears when browser closed or after 24 hours
- Shortlisted products saved for 30 days

---

## Common Customer Questions

### Q: "Why can't I customize this product in the widget?"

**A**: The Aurora widget is designed for quick recommendations of ready-to-ship products. For full customization with 3D previews, please visit our Customizer at [glowglitch.com/customizer].

**Action**: Provide link, or offer to transfer to stylist who can guide them through customization.

---

### Q: "The widget said it can't find products in my price range"

**A**: Our ready-to-ship inventory is limited to specific price points. Let me help you:

1. Check if they're searching too narrow a range (e.g., "$50-$100" may have no results)
2. Suggest browsing the full catalog: [glowglitch.com/catalog]
3. If budget is constraint, offer payment plans or suggest alternatives

**Escalate if**: Customer insists on custom pricing → transfer to stylist for quote.

---

### Q: "I submitted a return request in the widget, what happens next?"

**A**: Great! Here's what happens:

1. You received an RMA number (check email)
2. Print the return label (link in email)
3. Ship within 14 days for full refund
4. Tracking updates will be sent via email

**How to verify**:
1. Go to Dashboard → Orders
2. Search for customer's order ID
3. Check for "RMA Created" event in timeline
4. Confirm RMA number matches what customer received

---

### Q: "I escalated to a stylist, when will they contact me?"

**A**: Stylist escalations are handled within:
- **4 business hours** (standard)
- **1 business hour** (VIP customers)
- **Immediate** (if urgent flag set)

**How to check**:
1. Go to Dashboard → Support → Stylist Tickets
2. Search for customer's email
3. Check ticket status and assigned stylist
4. Can manually assign or prioritize if needed

---

### Q: "The widget keeps saying 'Something went wrong'"

**A**: Let's troubleshoot:

1. Ask customer to:
   - Refresh page
   - Clear browser cache
   - Try incognito/private mode
   - Try different browser

2. If still broken:
   - Check status page: [status.glowglitch.com]
   - Check `#aurora-concierge-alerts` Slack for known issues
   - Create bug ticket with details (browser, error message, screenshot)

**Workaround**: Provide direct links:
- Track order: `/dashboard/orders/[ORDER_ID]`
- Browse products: `/catalog`
- Contact form: `/contact`

---

### Q: "Can I reserve a product through the widget?"

**A**: The widget itself doesn't have a "reserve" or "hold" function (capsules were removed). However, customers can:

1. **Add to cart** → holds for 30 minutes during checkout
2. **Save to shortlist** → widget saves it for 30 days
3. **Purchase** → immediately reserves

For special requests (e.g., holding for wedding date), escalate to stylist.

---

## Escalation Triggers

### When to Escalate to Stylist

Escalate when customer needs:
- ✅ Custom design consultation
- ✅ Complex resizing (e.g., multiple sizes, intricate designs)
- ✅ Bulk/corporate orders
- ✅ Appraisals or certifications
- ✅ Special requests (rush shipping, gift wrapping, engraving)
- ✅ Payment plan arrangements

### When to Escalate to Engineering

Escalate when:
- ❌ Widget is broken/unresponsive for multiple customers
- ❌ Data appears incorrect (e.g., wrong order status)
- ❌ Security concern (e.g., customer sees someone else's data)
- ❌ Performance issue (widget extremely slow)

**How**: Post in `#aurora-concierge-alerts` with:
- Customer email (anonymized if needed)
- What they were trying to do
- Error message / screenshot
- Browser and device info

### When to Escalate to Management

Escalate when:
- 🚨 Customer threatens legal action
- 🚨 High-value customer (VIP tier) unsatisfied
- 🚨 Widget caused financial error (wrong price, double charge)
- 🚨 Data privacy concern

---

## Known Limitations

### What the Widget CAN Do

✅ Recommend ready-to-ship products  
✅ Filter by price, category, metal type  
✅ Show order status and tracking  
✅ Submit return/resize requests  
✅ Collect CSAT feedback  
✅ Escalate to human stylist

### What the Widget CANNOT Do

❌ Customize products (3D rendering, material swaps)  
❌ Process payments or complete checkout  
❌ Issue refunds (needs manual approval)  
❌ Modify existing orders  
❌ Access customer's account details  
❌ Reserve or "hold" products (capsule feature removed)  
❌ Upload inspiration images (removed)

### Browser Compatibility

**Supported**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Not Supported**:
- IE 11 (discontinued)
- Very old mobile browsers

If customer reports issues, first step: **Check browser version**.

---

## FAQ for Support Agents

### Can I test the widget without affecting real data?

**Yes!** Use the staging environment:
- URL: `https://staging.glowglitch.com`
- Login: Use your support credentials
- All data is test data, safe to experiment

### How do I know if a customer used the widget?

Check the order record in dashboard:
- Look for "Concierge Session ID" field
- If present → customer interacted with widget
- Can view full transcript by clicking session ID

### What if widget gives wrong information?

**Example**: Widget says order is "shipped" but it's actually "processing"

1. **Immediate**: Correct the customer
2. **Report**: Post in `#aurora-concierge-alerts` with order ID
3. **Follow-up**: Engineering will investigate data sync issue

### How is widget CSAT different from our regular CSAT?

**Widget CSAT**: Measures satisfaction with the AI assistant specifically  
**Regular CSAT**: Measures overall experience (product, shipping, support)

Both are tracked separately. Low widget CSAT → Engineering improves widget. Low regular CSAT → Product/ops improvements.

### Can I turn off the widget for a specific customer?

**No**, feature flags are global. However, you can:
- Guide them to alternative support channels
- Add their email to a "widget feedback" list if they had issues
- Escalate to stylist immediately (bypasses widget)

### What data does the widget collect?

**Collected**:
- Conversation messages (anonymized after 30 days)
- Product views/clicks
- Session duration
- CSAT ratings

**Not Collected**:
- Payment info (PCI compliant)
- Full PII (email/phone hashed in analytics)
- Passwords or sensitive account data

**Retention**:
- Sessions: 30 days
- Stylist tickets: Indefinitely (for support records)
- CSAT: Indefinitely (aggregated)
- Analytics: 90 days

---

## Quick Reference

### Support Dashboard Links

| Page | URL | Purpose |
|------|-----|---------|
| Stylist Tickets | `/dashboard/support` | View escalations |
| CSAT Feedback | `/dashboard/support` → CSAT tab | Customer ratings |
| Analytics | `/dashboard/analytics/concierge` | Metrics (admin) |
| Orders | `/dashboard/orders` | Check order status |

### Slack Channels

| Channel | Purpose |
|---------|---------|
| `#support` | General support discussion |
| `#aurora-concierge-alerts` | Widget alerts and issues |
| `#incidents` | Critical outages |

### Common Commands

**Check if widget is enabled**:
```
Ask in #aurora-concierge-alerts: "Is widget currently enabled?"
Engineering can check feature flags
```

**Report a bug**:
```
Post in #aurora-concierge-alerts:
- Customer email (or anonymize: "Customer reported...")
- What they were trying to do
- Error message / screenshot
- Browser info (if available)
```

---

## Training Resources

- **Video Tutorial**: [Link to Loom/training video]
- **Interactive Demo**: https://staging.glowglitch.com (use test account)
- **Onboarding Checklist**: [Link to onboarding doc]

---

## Feedback

Have suggestions to improve this guide or the widget? Post in `#support-feedback` or email support-ops@glowglitch.com.

**Last Reviewed**: 2025-10-19  
**Next Review**: 2025-11-19

