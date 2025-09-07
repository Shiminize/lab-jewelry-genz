'use client'

import { ProductCard } from '@/components/products/ProductCard'

// Mock product data for Aurora testing
const mockProduct = {
  _id: "test-product-aurora",
  name: "Aurora Test Ring",
  description: "Test product for Aurora Design System validation",
  category: "rings" as const,
  subcategory: "engagement-rings",
  slug: "aurora-test-ring",
  primaryImage: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&crop=center",
  pricing: {
    basePrice: 1200,
    originalPrice: 1500,
    currency: "USD" as const
  },
  inventory: {
    available: true,
    quantity: 100
  },
  metadata: {
    featured: true,
    bestseller: true,
    newArrival: true,
    tags: ["sustainable", "lab-grown", "customizable"]
  },
  materialSpecs: {
    primaryMetal: {
      type: "18k-rose-gold",
      purity: "18K",
      displayName: "18K Rose Gold"
    },
    primaryStone: {
      type: "moissanite",
      carat: 1.5,
      displayName: "Moissanite"
    },
    metal: "rose gold" // This will trigger rose gold Aurora effects
  }
}

export default function AuroraTestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8 text-center">
          Aurora ProductCard Test Page
        </h1>
        
        <div className="mb-8 p-4 bg-gradient-to-r from-accent/10 to-transparent rounded-lg border border-foreground/20">
          <h2 className="text-lg font-semibold mb-2">Aurora Migration Status</h2>
          <p className="text-sm text-muted-foreground">
            This page tests the ProductCard component with Aurora Design System integration.
            Environment: {process.env.NODE_ENV} | Design Version: {process.env.NEXT_PUBLIC_DESIGN_VERSION}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Standard ProductCard */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Standard Variant</h3>
            <ProductCard 
              product={mockProduct}
              variant="standard"
              onAddToWishlist={(id) => console.log('Add to wishlist:', id)}
              onQuickView={(id) => console.log('Quick view:', id)}
              onAddToCart={(id) => console.log('Add to cart:', id)}
            />
          </div>

          {/* Featured ProductCard */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Featured Variant</h3>
            <ProductCard 
              product={mockProduct}
              variant="featured"
              onAddToWishlist={(id) => console.log('Add to wishlist:', id)}
              onQuickView={(id) => console.log('Quick view:', id)}
              onAddToCart={(id) => console.log('Add to cart:', id)}
            />
          </div>

          {/* Compact ProductCard */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Compact Variant</h3>
            <ProductCard 
              product={mockProduct}
              variant="compact"
              onAddToWishlist={(id) => console.log('Add to wishlist:', id)}
              onQuickView={(id) => console.log('Quick view:', id)}
              onAddToCart={(id) => console.log('Add to cart:', id)}
            />
          </div>
        </div>

        <div className="mt-12 p-6 bg-gradient-to-br from-background to-muted rounded-lg border border-foreground/10">
          <h3 className="text-xl font-semibold mb-4">Aurora Features to Test:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Material-specific prismatic shadows (Rose Gold)</li>
            <li>• Aurora shimmer effects on hover</li>
            <li>• Floating sparkle animations</li>
            <li>• Emotional triggers and romantic gradients</li>
            <li>• Token-based spacing system</li>
            <li>• Interactive shadow effects</li>
            <li>• Responsive design validation</li>
          </ul>
        </div>
      </div>
    </div>
  )
}