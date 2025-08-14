/**
 * Database Seeding API Route
 * Populates database with initial product catalog
 * Only for development/staging environments
 */

import { NextRequest, NextResponse } from 'next/server'
import { productRepository } from '@/lib/database'
import { SEED_PRODUCTS } from '@/data/seed-products'

export async function POST(request: NextRequest) {
  try {
    // Security check - only allow in development/staging
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DB_SEED !== 'true') {
      return NextResponse.json({
        error: 'Database seeding not allowed in production'
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const force = searchParams.get('force') === 'true'

    // Check if products already exist (unless force is true)
    if (!force) {
      const existingProducts = await productRepository.searchProducts({ limit: 1 })
      if (existingProducts.products.length > 0) {
        return NextResponse.json({
          error: 'Products already exist',
          message: 'Use ?force=true to overwrite existing data',
          existingCount: existingProducts.pagination.total
        }, { status: 409 })
      }
    }

    // Seed products
    const seedResults = []
    let successCount = 0
    let errorCount = 0

    for (const productData of SEED_PRODUCTS) {
      try {
        const newProduct = await productRepository.create(productData)
        seedResults.push({
          success: true,
          product: {
            id: newProduct._id,
            name: newProduct.name,
            category: newProduct.category
          }
        })
        successCount++
      } catch (error) {
        seedResults.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          productName: productData.name
        })
        errorCount++
      }
    }

    return NextResponse.json({
      message: 'Database seeding completed',
      summary: {
        total: SEED_PRODUCTS.length,
        success: successCount,
        errors: errorCount
      },
      results: seedResults,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database seeding error:', error)
    
    return NextResponse.json({
      error: 'Failed to seed database',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    })
  }
}