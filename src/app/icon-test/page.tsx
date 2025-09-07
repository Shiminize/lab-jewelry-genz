'use client'

import React from 'react'
import { Icon, SearchIcon, CartIcon, UserIcon, HeartIcon } from '@/components/ui/Icon'

export default function IconTestPage() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Atlas Icons Test</h1>
      
      <div className="space-y-token-md">
        <h2 className="text-lg font-semibold">Common Icons (via mappings)</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col items-center p-4 border rounded">
            <Icon name="search" size={24} />
            <span className="text-xs mt-2">search</span>
          </div>
          <div className="flex flex-col items-center p-4 border rounded">
            <Icon name="shopping-cart" size={24} />
            <span className="text-xs mt-2">shopping-cart</span>
          </div>
          <div className="flex flex-col items-center p-4 border rounded">
            <Icon name="user" size={24} />
            <span className="text-xs mt-2">user</span>
          </div>
          <div className="flex flex-col items-center p-4 border rounded">
            <Icon name="heart" size={24} color="red" />
            <span className="text-xs mt-2">heart</span>
          </div>
          <div className="flex flex-col items-center p-4 border rounded">
            <Icon name="menu" size={24} />
            <span className="text-xs mt-2">menu</span>
          </div>
        </div>
      </div>

      <div className="space-y-token-md">
        <h2 className="text-lg font-semibold">Preset Components</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col items-center p-4 border rounded">
            <SearchIcon size={24} />
            <span className="text-xs mt-2">SearchIcon</span>
          </div>
          <div className="flex flex-col items-center p-4 border rounded">
            <CartIcon size={24} />
            <span className="text-xs mt-2">CartIcon</span>
          </div>
          <div className="flex flex-col items-center p-4 border rounded">
            <UserIcon size={24} />
            <span className="text-xs mt-2">UserIcon</span>
          </div>
          <div className="flex flex-col items-center p-4 border rounded">
            <HeartIcon size={24} color="var(--aurora-pink)" />
            <span className="text-xs mt-2">HeartIcon</span>
          </div>
        </div>
      </div>

      <div className="space-y-token-md">
        <h2 className="text-lg font-semibold">Direct Atlas Icon Names</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col items-center p-4 border rounded">
            <Icon name="DiamondRing" size={24} color="var(--aurora-nebula-purple)" />
            <span className="text-xs mt-2">DiamondRing</span>
          </div>
          <div className="flex flex-col items-center p-4 border rounded">
            <Icon name="Star" size={24} color="var(--aurora-amber-glow)" />
            <span className="text-xs mt-2">Star</span>
          </div>
          <div className="flex flex-col items-center p-4 border rounded">
            <Icon name="ShoppingBag" size={24} />
            <span className="text-xs mt-2">ShoppingBag</span>
          </div>
        </div>
      </div>

      <div className="space-y-token-md">
        <h2 className="text-lg font-semibold">Size Variations</h2>
        <div className="flex items-center gap-4">
          <Icon name="heart" size={16} color="red" />
          <Icon name="heart" size={20} color="red" />
          <Icon name="heart" size={24} color="red" />
          <Icon name="heart" size={32} color="red" />
          <Icon name="heart" size={48} color="red" />
        </div>
      </div>

      <div className="space-y-token-md">
        <h2 className="text-lg font-semibold">Aurora Colors</h2>
        <div className="flex items-center gap-4">
          <Icon name="gem" size={32} color="var(--aurora-pink)" />
          <Icon name="gem" size={32} color="var(--aurora-nebula-purple)" />
          <Icon name="gem" size={32} color="var(--aurora-emerald-flash)" />
          <Icon name="gem" size={32} color="var(--aurora-amber-glow)" />
        </div>
      </div>
    </div>
  )
}