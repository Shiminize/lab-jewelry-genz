# Product Data Requirements for MongoDB Seeding

**Date**: November 18, 2025
**Author**: @Agent

## 1. Introduction

This document outlines the complete, unified product data schema required to generate realistic production data for the Gen Z Jewelry application. The schema is derived from a comprehensive audit of the frontend codebase, including product display components, filtering systems, and data access repositories.

Providing product data that adheres to this schema will enable the data-seed agent to populate the MongoDB database correctly, ensuring that all features of the catalog, product pages, and merchandising systems function as intended.

## 2. Audit Methodology

The following files were analyzed to determine the required data fields:
- **`app/collections/CatalogClient.tsx`**: Revealed user-facing filter controls (price, availability, metal, category, tone).
- **`src/components/ui/ProductCard.tsx`**: Defined the data points for product grid items (name, price, image, badges, shipping info).
- **`src/components/support/modules/ProductFilterForm.tsx`**: Confirmed filterable attributes (category, price, metal, `readyToShip`).
- **`src/services/neon/catalogRepository.ts`**: Provided the canonical mapping from MongoDB documents to application-level product objects. This was the most critical source for the schema.
- **`src/content/products.ts`**: Showed a detailed fallback structure, including rich content fields.
- **`Agent/data-seed-status.md`**: Indicated internal fields needed for merchandising (`metadata.displaySlots`).

## 3. Unified Product Schema

The following table details every field the application may consume. Fields are grouped by purpose. "Mandatory" indicates the field is essential for basic application functionality.

---

### 3.1. Core Product Information (Essential)

| Field | Type | Mandatory | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `name` | `String` | **Yes** | The official product title. | `"Aurora Solitaire Ring"` |
| `sku` | `String` | **Yes** | Unique Stock Keeping Unit. Used as a fallback for `slug`. | `"RING-SOL-001"` |
| `category` | `String` | **Yes** | The primary product category. Used for filtering and navigation. | `"Rings"` |
| `pricing.basePrice` | `Number` | **Yes** | The base price of the product in the store's primary currency. | `2499` |
| `description` | `String` | **Yes** | A short, compelling product description. Used on detail pages and as a fallback for `tagline`. | `"A brilliant-cut lab diamond set on a classic 18k gold band."` |
| `images.primary` | `String` | **Yes** | The absolute URL path to the main product image. | `"/images/products/aurora-ring-1.jpg"` |

### 3.2. Detailed Product Attributes

| Field | Type | Mandatory | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `brand` | `String` | No | The product's brand or collection name. | `"Glow Atelier"` |
| `materials` | `Array<String>` | No | List of primary materials used. | `["18k Yellow Gold", "Lab-grown Diamond"]` |
| `gemstones` | `Array<String>` | No | List of gemstones featured in the product. | `["Diamond", "Sapphire"]` |
| `images.gallery` | `Array<String>` | No | An array of URL paths for additional product images. | `["/images/products/aurora-ring-2.jpg"]` |
| `inspiration` | `String` | No | A short story or design inspiration behind the piece. | `"Inspired by the first light of dawn."` |
| `highlights` | `Array<String>` | No | Bullet points detailing key features or selling points. | `["Conflict-free diamond", "Hand-polished finish"]` |
| `care` | `Array<String>` | No | Instructions for product care. | `["Clean with a soft cloth."]` |
| `dimensions` | `Array<String>` | No | Physical dimensions of the product. | `["Band width: 2mm"]` |

### 3.3. Filtering, Sorting & Search Attributes

| Field | Type | Mandatory | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `metadata.readyToShip`| `Boolean` | **Yes** | Determines availability. `true` for "Ready to Ship", `false` for "Made to Order". | `true` |
| `metadata.primaryMetal`| `String` | **Yes** | The dominant metal. Used for filtering. | `"Gold"` |
| `metadata.tags` | `Array<String>` | No | Tags for search and filtering. Can be used for badges. | `["bestseller", "new"]` |
| `metadata.searchKeywords`| `Array<String>` | No | Additional keywords to improve searchability. | `["engagement", "solitaire", "classic"]` |
| `metadata.sortWeight` | `Number` | No | A number to influence the default "Featured" sort order. Higher is more prominent. | `100` |
| `metadata.limitedDrop` | `Boolean` | No | `true` if the product is a limited edition. | `false` |

### 3.4. Merchandising & Display Attributes

| Field | Type | Mandatory | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `seo.slug` | `String` | **Yes** | The URL-friendly identifier for the product page. Must be unique. | `"aurora-solitaire-ring"` |
| `metadata.tagline` | `String` | No | A short, catchy phrase displayed on the product card. Falls back to `description`. | `"The new classic."` |
| `metadata.accentTone` | `String` | No | Controls the color theme of the product card. | `"magenta"` |
| `metadata.displaySlots.collectionOrder` | `Number` | No | Order for homepage hero section (1-3). | `1` |
| `metadata.displaySlots.spotlightOrder` | `Number` | No | Order for homepage spotlight section (1-6). | `4` |
| `featuredInWidget` | `Boolean` | No | `true` to feature this product in the AI concierge widget. | `true` |
| `badges` | `Array<Object>` | No | For special labels on product cards. | `[{ "label": "New", "tone": "coral" }]` |
| `shippingLabel` | `String` | No | A label for shipping status on the product card. | `"Ships in 2 days"` |

---

## 4. Example `seed.json` Product Entry

Here is a complete JSON object for a single product that includes all the necessary fields. This can be used as a template for the data generation script.

```json
{
  "name": "Aurora Solitaire Ring",
  "sku": "RING-SOL-001",
  "category": "Rings",
  "brand": "Glow Atelier",
  "pricing": {
    "basePrice": 2499
  },
  "description": "A brilliant-cut, 1.5-carat lab-grown diamond set on a classic, knife-edge band of 18k recycled yellow gold. A timeless piece designed for maximum light and everyday elegance.",
  "images": {
    "primary": "/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg",
    "gallery": [
      "/images/category/rings/16023_RND_0075CT_Y_2_1600X1600.jpg",
      "/images/category/rings/16023_RND_0075CT_Y_3_1600X1600.jpg"
    ]
  },
  "materials": ["18k Recycled Yellow Gold", "1.5ct Lab-Grown Diamond (VS1, E Color)"],
  "gemstones": ["Diamond"],
  "inspiration": "Inspired by the first light of dawn, the Aurora ring symbolizes a new beginning. Its minimalist design puts the focus on the stone's brilliance.",
  "highlights": [
    "Certified conflict-free and sustainably grown diamond.",
    "Hand-polished in our Tokyo studio.",
    "Available for custom engraving."
  ],
  "care": ["Clean monthly with a soft brush and pH-neutral solution.", "Schedule annual ultrasonic detailing through our concierge."],
  "dimensions": ["Band width: 1.8mm", "Diamond diameter: 7.4mm"],
  "seo": {
    "slug": "aurora-solitaire-ring"
  },
  "metadata": {
    "readyToShip": true,
    "primaryMetal": "Gold",
    "tags": ["bestseller", "engagement", "solitaire"],
    "searchKeywords": ["diamond ring", "engagement ring", "classic ring"],
    "sortWeight": 100,
    "limitedDrop": false,
    "tagline": "The new classic, sustainably brilliant.",
    "accentTone": "magenta",
    "displaySlots": {
      "collectionOrder": 1,
      "spotlightOrder": 4
    }
  },
  "featuredInWidget": true,
  "badges": [
    { "label": "Bestseller", "tone": "coral" }
  ],
  "shippingLabel": "Ships in 2 days"
}
```

## 5. Next Steps

To proceed with generating production-quality data, please provide the product information in a structured format (such as a CSV or an array of JSON objects) that follows the schema defined in this document. The data-seed agent can then be updated to consume this data and populate the MongoDB database.
