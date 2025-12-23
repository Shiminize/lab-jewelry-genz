# Production Image Optimization Guide

To optimize "GlowGlitch" for production, you must move away from storing images in the Git repository (`public/images/`) and instead use a specialized Image CDN.

## 1. The Strategy: "Externalize & Optimize"
**Current State:** Images are local files. This bloats the repo and slows down deployments.
**Target State:** Images are hosted on a CDN (e.g., Cloudinary, Vercel Blob). The database stores the *URL*, not the file.

## 2. Recommended Solution: Cloudinary (or Vercel Blob)
We recommend **Cloudinary** for e-commerce because it offers on-the-fly transformations (resizing, cropping) via the URL.

### Why?
*   **Automatic Formatting:** Serves AVIF to Chrome users, WebP to Safari users automatically.
*   **Repo Health:** Keeps your git history light.
*   **Performance:** Images are served from edge servers close to the user.

## 3. Implementation Steps

### Step A: Configure `next.config.js`
Allow the external domain to be optimized by Next.js.

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // or your chosen CDN
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
}
```

### Step B: Database Migration
Update your `Product` rows in PostgreSQL to point to the remote URLs instead of local paths.

**Example Update:**
*   **Old:** `/images/products/static/chaos-ring/hero.webp`
*   **New:** `https://res.cloudinary.com/glowglitch/image/upload/v1234/products/chaos-ring-hero.jpg`

*Note: You would upload your `public/images` folder to the CDN provider to get these URLs.*

### Step C: Frontend Usage (`next/image`)
Ensure your Product Card components use the `next/image` component properly.

```tsx
import Image from 'next/image';

<div className="relative aspect-square w-full">
  <Image
    src={product.heroImage} // The CDN URL
    alt={product.name}
    fill
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    className="object-cover"
    priority={isAboveFold} // true for hero images
  />
</div>
```

**Key Optimization:** The `sizes` prop is critical. It tells the browser "this image will be 33% of the screen width on desktop", so Next.js generates a smaller customized version instead of downloading the 4K original.

## 4. Summary
1.  **Sign up** for a CDN provider.
2.  **Upload** your assets.
3.  **Update** `production_products.json` with the new URLs.
4.  **Re-seed** the database (`npm run db:seed`).
