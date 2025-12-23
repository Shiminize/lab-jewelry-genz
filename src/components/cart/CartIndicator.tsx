'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'
import { useCartClient } from '@/features/cart/hooks/useCartClient'

export function CartIndicator() {
  const { items, isLoading } = useCartClient()
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <Link href="/cart" className="relative">
      <Button tone="ink" variant="outline" size="sm">
        Cart
        <span className="ml-2 rounded-none bg-brand-sky/20 px-2 py-0.5 text-xs font-semibold text-brand-ink">
          {isLoading ? '…' : itemCount}
        </span>
      </Button>
    </Link>
  )
}
