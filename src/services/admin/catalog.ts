import prisma from '@/lib/prisma'
import { logAdminActivity } from './activityLog'

export interface AdminProductSummary {
  id: string
  name: string
  category: string
  basePrice: number
  featured: boolean
  bestseller: boolean
  status: string
  updatedAt?: Date
}

export interface AdminProductDetail extends AdminProductSummary {
  description?: string
  collections: string[]
  slug: string
}

export async function listAdminProducts(limit = 100): Promise<AdminProductSummary[]> {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      name: true,
      category: true,
      basePrice: true,
      featured: true,
      bestseller: true,
      status: true,
      updatedAt: true,
    }
  })

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    basePrice: p.basePrice,
    featured: p.featured,
    bestseller: p.bestseller,
    status: p.status,
    updatedAt: p.updatedAt,
  }))
}

export async function getAdminProduct(id: string): Promise<AdminProductDetail | null> {
  const product = await prisma.product.findUnique({
    where: { id }
  })

  if (!product) return null

  return {
    id: product.id,
    name: product.name,
    category: product.category,
    basePrice: product.basePrice,
    featured: product.featured,
    bestseller: product.bestseller,
    status: product.status,
    description: product.description,
    collections: product.collections,
    slug: product.slug,
    updatedAt: product.updatedAt,
  }
}

export async function updateAdminProduct(
  id: string,
  updates: {
    name: string
    category: string
    basePrice: number
    featured: boolean
    bestseller: boolean
    status: string
    description?: string
    collections: string[]
  },
  options?: { skipLog?: boolean }
) {
  const before = await prisma.product.findUnique({ where: { id } })

  const after = await prisma.product.update({
    where: { id },
    data: {
      name: updates.name,
      category: updates.category,
      basePrice: updates.basePrice,
      status: updates.status,
      description: updates.description ?? '',
      featured: updates.featured,
      bestseller: updates.bestseller,
      collections: updates.collections,
    },
  })

  if (!options?.skipLog && before) {
    await logAdminActivity({
      action: 'update_product',
      entityType: 'product',
      entityId: id,
      summary: `Updated ${updates.name} (${updates.status})`,
      before: {
        name: before.name,
        category: before.category,
        basePrice: before.basePrice,
        featured: before.featured,
        bestseller: before.bestseller,
        status: before.status,
        collections: before.collections,
        description: before.description,
      },
      after: {
        name: after.name,
        category: after.category,
        basePrice: after.basePrice,
        featured: after.featured,
        bestseller: after.bestseller,
        status: after.status,
        collections: after.collections,
        description: after.description,
      },
    })
  }
}
