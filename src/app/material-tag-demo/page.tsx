'use client'

import React from 'react'
import { ProductCard } from '@/components/products/ProductCard'
import { createMaterialSpecs, type ProductListDTO } from '@/types/product-dto'
import type { MaterialTag } from '@/types/material-tags'

// Test products with different material configurations
const testProducts: ProductListDTO[] = [
  {
    _id: 'test-1',
    name: 'Moissanite Gold Ring',
    description: '1.5CT moissanite in 14K gold setting',
    category: 'rings',
    subcategory: 'engagement-rings',
    slug: 'moissanite-gold-ring',
    primaryImage: '/images/ring-001.jpg',
    pricing: { basePrice: 1200, currency: 'USD' },
    inventory: { available: true },
    metadata: { featured: true, bestseller: false, newArrival: false, tags: ['elegant', 'engagement'] },
    materialSpecs: createMaterialSpecs('14k-gold', { type: 'moissanite', carat: 1.5 })
  },
  {
    _id: 'test-2',
    name: 'Lab Diamond Platinum Ring',
    description: '2.0CT lab diamond in platinum setting',
    category: 'rings',
    subcategory: 'engagement-rings',
    slug: 'lab-diamond-platinum-ring',
    primaryImage: '/images/ring-002.jpg',
    pricing: { basePrice: 3500, currency: 'USD' },
    inventory: { available: true },
    metadata: { featured: false, bestseller: true, newArrival: false, tags: ['luxury', 'platinum'] },
    materialSpecs: createMaterialSpecs('platinum', { type: 'lab-diamond', carat: 2.0 })
  },
  {
    _id: 'test-3',
    name: 'Silver Chain Bracelet',
    description: 'Simple silver chain bracelet',
    category: 'bracelets',
    subcategory: 'chain-bracelets',
    slug: 'silver-chain-bracelet',
    primaryImage: '/images/bracelet-001.jpg',
    pricing: { basePrice: 300, currency: 'USD' },
    inventory: { available: true },
    metadata: { featured: false, bestseller: false, newArrival: true, tags: ['minimalist', 'everyday'] },
    materialSpecs: createMaterialSpecs('silver') // No stone
  }
]

export default function MaterialTagDemoPage() {
  const handleMaterialTagClick = (tag: MaterialTag) => {
    console.log('Material tag clicked:', tag)
    alert(`Material tag clicked: ${tag.displayName} (${tag.category})`)
  }

  const handleTagClick = (tag: string) => {
    console.log('Generic tag clicked:', tag)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">MaterialTagChip Integration Demo</h1>
        <p className="text-aurora-nav-muted mb-8">
          Testing MaterialTagChip integration with ProductCard component. Click on the material tags to see the functionality.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testProducts.map((product) => (
            <div key={product._id} className="space-y-token-md">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <ProductCard
                product={product}
                variant="standard"
                onMaterialTagClick={handleMaterialTagClick}
                onTagClick={handleTagClick}
                className="border rounded-lg p-2"
              />
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Expected Behavior</h2>
          <ul className="space-y-token-sm text-sm">
            <li><strong>Product 1:</strong> Should show "14K Gold", "Moissanite", "1.5CT" tags</li>
            <li><strong>Product 2:</strong> Should show "Platinum", "Lab Diamond", "2CT" tags</li>
            <li><strong>Product 3:</strong> Should show "925 Silver" tag only</li>
            <li><strong>Interaction:</strong> Click any material tag to see alert with tag details</li>
            <li><strong>Fallback:</strong> If no material specs, falls back to generic tags display</li>
          </ul>
        </div>
      </div>
    </div>
  )
}