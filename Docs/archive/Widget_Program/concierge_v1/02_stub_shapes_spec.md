# Step 2 – Stub Response Shapes Spec

## Products Stub
### Response Schema
| field | type | meaning |
| - | - | - |
| sessionId | string | Widget session identifier echoed back |
| requestId | string | Echo of `x-request-id` |
| fetchedAt | string (ISO 8601) | Timestamp when the stub payload was generated |
| products | array | Product cards matching the query |
| products[].id | string | Catalog product identifier |
| products[].title | string | Display title |
| products[].price | object | Price block |
| products[].price.currency | string | ISO 4217 currency code |
| products[].price.amount | number | Price with two decimals |
| products[].image | string (URL) | Primary product asset |
| products[].category | string | Product category (enum TBD) |
| products[].metal | string | Primary metal (enum TBD) |
| products[].readyToShip | boolean | True if ships within 2 business days |
| products[].badges | array of string | Badge labels |
| products[].tags | array of string | Supplemental style tags |
| products[].shippingPromise | string | Customer-facing shipping copy |

### Happy Path Example
```json
{
  "sessionId": "sess_001",
  "requestId": "req_products_01",
  "fetchedAt": "2024-08-12T10:00:00Z",
  "products": [
    {
      "id": "prod_emerald_halo",
      "title": "Emerald Halo Ring",
      "price": { "currency": "USD", "amount": 3250.0 },
      "image": "https://cdn.aurora.com/products/emerald-halo.jpg",
      "category": "ring",
      "metal": "platinum",
      "readyToShip": true,
      "badges": ["Bestseller"],
      "tags": ["halo", "art-deco"],
      "shippingPromise": "Ships in 2 business days"
    }
  ]
}
```

### Error Example (HTTP 503)
```json
{
  "code": "CATALOG_UNAVAILABLE",
  "message": "Product catalog temporarily unavailable."
}
```

## Order Status Stub
### Response Schema
| field | type | meaning |
| - | - | - |
| sessionId | string | Widget session identifier |
| requestId | string | Echo of `x-request-id` |
| reference | string | Order reference echoed back |
| entries | array | Chronological order timeline |
| entries[].label | string | Human-readable milestone title |
| entries[].date | string (ISO 8601) | Event timestamp |
| entries[].status | string | Normalized status code |
| carrier | string | Shipping carrier |
| tracking | string | Masked tracking number |
| eta | string (ISO 8601) | Estimated delivery timestamp |
| exception | string (optional) | Most recent exception note |

### Happy Path Example
```json
{
  "sessionId": "sess_001",
  "requestId": "req_status_01",
  "reference": "AUR-100045",
  "entries": [
    { "label": "Order Confirmed", "date": "2024-08-10T14:02:00Z", "status": "created" },
    { "label": "Packed & Ready", "date": "2024-08-11T10:45:00Z", "status": "processing" },
    { "label": "Shipped", "date": "2024-08-11T18:30:00Z", "status": "shipped" }
  ],
  "carrier": "UPS",
  "tracking": "1Z***5678",
  "eta": "2024-08-14T20:00:00Z"
}
```

### Error Example (HTTP 404)
```json
{
  "code": "ORDER_NOT_FOUND",
  "message": "We could not locate an order with the supplied details."
}
```

## Returns Stub
### Response Schema
| field | type | meaning |
| - | - | - |
| sessionId | string | Widget session identifier |
| requestId | string | Echo of `x-request-id` |
| rmaId | string | Return/resize authorization id |
| labelUrl | string (URL) | Link to prepaid return label |
| status | string | Return workflow status (`return_pending` \| `resize_scheduled` \| `label_issued`) |
| orderId | string | Order reference |
| idempotencyKeyEcho | string (optional) | Echo of supplied `x-idempotency-key` |

### Happy Path Example
```json
{
  "sessionId": "sess_001",
  "requestId": "req_returns_01",
  "rmaId": "RMA-9087",
  "labelUrl": "https://cdn.aurora.com/labels/RMA-9087.pdf",
  "status": "return_pending",
  "orderId": "AUR-100045",
  "idempotencyKeyEcho": "idem-abc123"
}
```

### Error Example (HTTP 409)
```json
{
  "code": "RETURN_INELIGIBLE",
  "message": "This item is outside the returns window."
}
```

## Capsule Stub
### Response Schema
| field | type | meaning |
| - | - | - |
| sessionId | string | Widget session identifier |
| requestId | string | Echo of `x-request-id` |
| capsuleId | string | Capsule reservation identifier |
| expiresAt | string (ISO 8601) | Hold expiration timestamp |
| shortlistCount | number | Number of items reserved |

### Happy Path Example
```json
{
  "sessionId": "sess_001",
  "requestId": "req_capsule_01",
  "capsuleId": "cap_456",
  "expiresAt": "2024-08-14T10:00:00Z",
  "shortlistCount": 3
}
```

### Error Example (HTTP 409)
```json
{
  "code": "CAPSULE_LIMIT_REACHED",
  "message": "Customer already has an active capsule hold."
}
```

## Shortlist Stub
### Response Schema
| field | type | meaning |
| - | - | - |
| sessionId | string | Widget session identifier |
| requestId | string | Echo of `x-request-id` |
| shortlistId | string | Persistent shortlist identifier |
| items | array of string | Product ids saved in the shortlist |
| createdAt | string (ISO 8601) | Creation timestamp |

### Happy Path Example
```json
{
  "sessionId": "sess_001",
  "requestId": "req_shortlist_01",
  "shortlistId": "sl_789",
  "items": ["prod_emerald_halo", "prod_band_classic"],
  "createdAt": "2024-08-10T14:02:00Z"
}
```

### Error Example (HTTP 500)
```json
{
  "code": "SHORTLIST_SAVE_FAILED",
  "message": "Unable to persist shortlist at this time."
}
```

## Inspiration Stub
### Response Schema
| field | type | meaning |
| - | - | - |
| sessionId | string | Widget session identifier |
| requestId | string | Echo of `x-request-id` |
| ok | boolean | Upload acknowledged |
| url | string (URL) | View/preview location |
| originalFileName | string | Filename provided by customer |
| contentType | string | MIME type detected |
| sizeBytes | number | File size in bytes |
| inspirationId | string (optional) | Persisted inspiration identifier |
| moderationStatus | string (optional) | Moderator review state |

### Happy Path Example
```json
{
  "sessionId": "sess_001",
  "requestId": "req_inspiration_01",
  "ok": true,
  "url": "https://cdn.aurora.com/inspiration/ins_901.jpg",
  "originalFileName": "dream_ring.jpg",
  "contentType": "image/jpeg",
  "sizeBytes": 482193,
  "inspirationId": "ins_901",
  "moderationStatus": "pending_review"
}
```

### Error Example (HTTP 400)
```json
{
  "code": "UPLOAD_TOO_LARGE",
  "message": "Upload exceeds the 10MB limit."
}
```

## Stylist Stub
### Response Schema
| field | type | meaning |
| - | - | - |
| sessionId | string | Widget session identifier |
| requestId | string | Echo of `x-request-id` |
| ok | boolean | Ticket creation acknowledgement |
| ticketId | string | CRM ticket identifier |
| slaMinutes | number | SLA promise for human follow-up |
| queuePosition | number (optional) | Position in stylist queue (1 = next) |

### Happy Path Example
```json
{
  "sessionId": "sess_001",
  "requestId": "req_stylist_01",
  "ok": true,
  "ticketId": "sty_3021",
  "slaMinutes": 45,
  "queuePosition": 2
}
```

### Error Example (HTTP 503)
```json
{
  "code": "CRM_UNAVAILABLE",
  "message": "Stylist queue temporarily offline. Please retry."
}
```

## Order Updates Stub
### Response Schema
| field | type | meaning |
| - | - | - |
| sessionId | string | Widget session identifier |
| requestId | string | Echo of `x-request-id` |
| ok | boolean | Subscription acknowledgement |
| subscriptionId | string | Subscription reference id |
| channel | string | Notification channel (`"sms"` or `"email"`) |
| maskedDestination | string | Obfuscated phone/email |
| nextUpdateEta | string (ISO 8601, optional) | Expected next notification time |

### Happy Path Example
```json
{
  "sessionId": "sess_001",
  "requestId": "req_updates_01",
  "ok": true,
  "subscriptionId": "sub_555",
  "channel": "sms",
  "maskedDestination": "+1 (***) ***-7890",
  "nextUpdateEta": "2024-08-12T18:00:00Z"
}
```

### Error Example (HTTP 500)
```json
{
  "code": "SUBSCRIPTION_FAILED",
  "message": "Unable to subscribe this number at the moment."
}
```

## CSAT Stub
### Response Schema
| field | type | meaning |
| - | - | - |
| ok | boolean | Persistence acknowledgement |
| rating | string | `"great"` or `"needs_follow_up"` |
| intent | string | Intent context of survey |
| sessionId | string | Widget session identifier |
| requestId | string | Echo of `x-request-id` |
| storedAt | string (ISO 8601) | Timestamp survey stored |
| agentNotified | boolean (optional) | Indicates if human follow-up triggered |

### Happy Path Example
```json
{
  "ok": true,
  "rating": "great",
  "intent": "find_product",
  "sessionId": "sess_001",
  "requestId": "req_csat_01",
  "storedAt": "2024-08-12T10:10:00Z",
  "agentNotified": false
}
```

### Error Example (HTTP 500)
```json
{
  "code": "CSAT_STORE_ERROR",
  "message": "Could not store survey response."
}
```

## Assumptions & Deltas (TODO-CONFIRM)
- Product categories limited to {`ring`, `earrings`, `necklace`, `bracelet`}; metals limited to {`14k_yellow`, `14k_white`, `14k_rose`, `platinum`} until catalog confirms the final list.
- Returns status lifecycle currently {`return_pending`, `resize_scheduled`, `label_issued`}; backend may add `refund_sent` or `inspection_in_progress`.
- Inspiration uploads capped at 10 MB with moderation states {`pending_review`, `approved`, `rejected`}.
- Order status codes expected {`created`, `processing`, `shipped`, `out_for_delivery`, `delivered`, `exception`}.
- `queuePosition` reported as customer-friendly one-based index.

## Next Actions
- Sync enums and status code lists with catalog and operations teams.
- Update local stub JSON fixtures to mirror these shapes exactly.
- Align error codes with the global concierge error taxonomy before backend implementation.
