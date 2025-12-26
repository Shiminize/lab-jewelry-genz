'use client'

import { useCart } from '../context/CartContext'

export function useCartClient() {
  return useCart()
}
