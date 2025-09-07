// ProductFilters static data extracted for CLAUDE_RULES compliance

export const filterData = {
  categories: [
    { id: 'rings', name: 'Rings', count: 156 },
    { id: 'necklaces', name: 'Necklaces', count: 89 },
    { id: 'earrings', name: 'Earrings', count: 124 },
    { id: 'bracelets', name: 'Bracelets', count: 67 },
  ],
  materials: [
    { id: '14k-gold', name: '14K Gold', count: 245 },
    { id: '18k-gold', name: '18K Gold', count: 198 },
    { id: 'white-gold', name: 'White Gold', count: 167 },
    { id: 'rose-gold', name: 'Rose Gold', count: 156 },
    { id: 'platinum', name: 'Platinum', count: 89 },
  ],
  stoneTypes: [
    { id: 'diamond', name: 'Diamond', count: 387 },
    { id: 'emerald', name: 'Emerald', count: 45 },
    { id: 'sapphire', name: 'Sapphire', count: 67 },
    { id: 'ruby', name: 'Ruby', count: 34 },
  ],
  stoneQualities: [
    { id: 'premium', name: 'Premium (VVS)', count: 156 },
    { id: 'signature', name: 'Signature (VS)', count: 234 },
    { id: 'classic', name: 'Classic (SI)', count: 189 },
  ],
  sizes: [
    { id: 'size-4', name: '4', count: 45 },
    { id: 'size-5', name: '5', count: 78 },
    { id: 'size-6', name: '6', count: 124 },
    { id: 'size-7', name: '7', count: 156 },
    { id: 'size-8', name: '8', count: 89 },
    { id: 'size-9', name: '9', count: 67 },
  ],
}

export interface FilterOptions {
  priceRange: [number, number]
  categories: string[]
  materials: string[]
  stoneTypes: string[]
  stoneQualities: string[]
  sizes: string[]
  inStock: boolean
}