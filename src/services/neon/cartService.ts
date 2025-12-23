import prisma from '@/lib/prisma'
import { getProductDetail } from './productService'
import type { CatalogTone } from '@/config/catalogDefaults'
import { Prisma } from '@prisma/client'

export interface CartItem {
  slug: string
  name: string
  quantity: number
  price: number
  tone: CatalogTone
  heroImage?: string
}

export interface CartSummary {
  cartId: string
  items: CartItem[]
  updatedAt: Date
  createdAt: Date
}

export interface CartTotals {
  itemCount: number
  subtotal: number
}

// Helper to parse JSON items
function parseCartItems(json: Prisma.JsonValue[]): CartItem[] {
  if (!Array.isArray(json)) return []
  return json as unknown as CartItem[]
}

export async function getCart(cartId: string): Promise<CartSummary> {
  // If no cartId provided, strictly return empty (or handle new logic upstream)
  if (!cartId) throw new Error('Cart ID is required')

  const cart = await prisma.cart.findUnique({
    where: { id: cartId }
  })

  if (!cart) {
    const now = new Date()
    return {
      cartId,
      items: [],
      createdAt: now,
      updatedAt: now,
    }
  }

  return {
    cartId: cart.id,
    items: parseCartItems(cart.items as Prisma.JsonArray),
    updatedAt: cart.updatedAt,
    createdAt: cart.createdAt,
  }
}

export async function addItemToCart(cartId: string, slug: string, quantity = 1): Promise<CartSummary> {
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than zero')
  }

  // 1. Get Product Details
  const product = await getProductDetail(slug)

  const baseItem: CartItem = product
    ? {
      slug: product.slug,
      name: product.name,
      price: product.price,
      tone: product.tone,
      heroImage: product.heroImage,
      quantity: 0
    }
    : {
      slug,
      name: slug.replace(/-/g, ' '),
      price: 0,
      tone: 'volt' as CatalogTone,
      heroImage: '/images/placeholder-product.jpg',
      quantity: 0
    }

  // 2. Fetch or Create Cart
  // Prisma upsert requires a unique ID. If cartId doesn't exist, we create it.
  // Note: If cartId is a client-generated ID that isn't in DB yet, findUnique will fail.
  // Strategy: Try find, if null create.

  let cart = await prisma.cart.findUnique({ where: { id: cartId } })

  let currentItems: CartItem[] = []

  if (cart) {
    currentItems = parseCartItems(cart.items as Prisma.JsonArray)
  }

  // 3. Update Items Inventory
  const existingIndex = currentItems.findIndex((item) => item.slug === baseItem.slug)
  let nextItems: CartItem[]

  if (existingIndex >= 0) {
    nextItems = currentItems.map((item, index) =>
      index === existingIndex
        ? {
          ...item,
          quantity: item.quantity + quantity,
          price: baseItem.price, // Update price ensuring freshness
          name: baseItem.name,
          tone: baseItem.tone,
          heroImage: baseItem.heroImage,
        }
        : item,
    )
  } else {
    nextItems = [
      ...currentItems,
      {
        ...baseItem,
        quantity,
      },
    ]
  }

  // 4. Save to DB
  // upsert is easiest if cartId matches our ID format (cuid). 
  // If client sends a random string, this might fail if it's not a valid CUID format?
  // Prisma CUIDs are specific. Assuming cartId from cookie is valid or we create new.
  // Actually, typically we trust the ID if it exists, otherwise create.

  const result = await prisma.cart.upsert({
    where: { id: cartId },
    update: {
      items: nextItems as any,
      updatedAt: new Date()
    },
    create: {
      id: cartId,
      items: nextItems as any
    }
  })

  return {
    cartId: result.id,
    items: nextItems,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt
  }
}

export async function removeItemFromCart(cartId: string, slug: string): Promise<CartSummary> {
  const cart = await prisma.cart.findUnique({ where: { id: cartId } })
  if (!cart) {
    // Return empty if cart doesn't exist
    return { cartId, items: [], createdAt: new Date(), updatedAt: new Date() }
  }

  const currentItems = parseCartItems(cart.items as Prisma.JsonArray)
  const nextItems = currentItems.filter((item) => item.slug !== slug)

  const result = await prisma.cart.update({
    where: { id: cartId },
    data: {
      items: nextItems as any,
      updatedAt: new Date()
    }
  })

  return {
    cartId: result.id,
    items: nextItems,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt
  }
}

export async function clearCart(cartId: string): Promise<CartSummary> {
  const result = await prisma.cart.upsert({
    where: { id: cartId },
    update: {
      items: [],
      updatedAt: new Date()
    },
    create: {
      id: cartId,
      items: []
    }
  })

  return {
    cartId: result.id,
    items: [],
    createdAt: result.createdAt,
    updatedAt: result.updatedAt
  }
}

export async function updateCartItemQuantity(cartId: string, slug: string, quantity: number): Promise<CartSummary> {
  if (quantity <= 0) {
    return removeItemFromCart(cartId, slug)
  }

  const cart = await prisma.cart.findUnique({ where: { id: cartId } })
  // If cart doesn't exist, strictly speaking we should probably create it or add item.
  // But logic here suggests updating an existing item. Converting to addItem call is safest.
  if (!cart) {
    return addItemToCart(cartId, slug, quantity)
  }

  const currentItems = parseCartItems(cart.items as Prisma.JsonArray)
  const existingIndex = currentItems.findIndex((item) => item.slug === slug)

  if (existingIndex < 0) {
    return addItemToCart(cartId, slug, quantity)
  }

  // Get fresh product data to ensure price is correct?
  // Original logic did: const product = await getProductDetail(slug)
  // Let's keep it simple and just update quantity for now to match original logic,
  // but original logic DID fetch product.

  const product = await getProductDetail(slug)
  const baseItem = product
    ? {
      slug: product.slug,
      name: product.name,
      price: product.price,
      tone: product.tone,
      heroImage: product.heroImage,
    }
    : currentItems[existingIndex]

  const nextItems = currentItems.map((item, index) =>
    index === existingIndex
      ? {
        ...item,
        ...baseItem, // Update details if available
        quantity,
      }
      : item,
  )

  const result = await prisma.cart.update({
    where: { id: cartId },
    data: {
      items: nextItems as any,
      updatedAt: new Date()
    }
  })

  return {
    cartId: result.id,
    items: nextItems,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt
  }
}

export function calculateCartTotals(cart: Pick<CartSummary, 'items'>): CartTotals {
  const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0)
  return { itemCount, subtotal }
}
