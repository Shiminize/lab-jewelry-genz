/**
 * Search Autocomplete API
 * GET /api/search/autocomplete - Real-time search suggestions
 * Phase 2: Scale & Optimize implementation
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/database'
import { withAPIMonitoring } from '@/lib/performance'
import crypto from 'crypto'

// Success response helper (CLAUDE_RULES.md compliant)
function ok<T>(data: T) {
  return NextResponse.json({
    success: true,
    data,
    meta: { 
      timestamp: new Date().toISOString(), 
      version: '1.0.0' 
    }
  })
}

// Error response helper (CLAUDE_RULES.md compliant)
function fail(code: string, message: string, details?: any, status: number = 400) {
  return NextResponse.json({
    success: false,
    error: { 
      code, 
      message, 
      ...(details ? { details } : {}) 
    },
    meta: { 
      timestamp: new Date().toISOString(), 
      requestId: crypto.randomUUID() 
    }
  }, { status })
}

interface AutocompleteSuggestion {
  text: string
  type: 'product' | 'category' | 'material' | 'gemstone' | 'brand'
  count: number
  featured?: boolean
}

/**
 * GET /api/search/autocomplete - Get search suggestions
 */
async function getAutocomplete(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim() || ''
    const limit = Math.min(parseInt(searchParams.get('limit') || '8'), 20)
    
    if (!query || query.length < 2) {
      return ok({
        suggestions: [],
        query,
        count: 0
      })
    }
    
    const { db } = await connectToDatabase()
    
    // Build aggregation pipeline for autocomplete
    const suggestions = await generateAutocompleteSuggestions(db, query, limit)
    
    // Sort suggestions by relevance and popularity
    const sortedSuggestions = suggestions
      .sort((a, b) => {
        // Featured items first
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        
        // Then by count (popularity)
        if (a.count !== b.count) return b.count - a.count
        
        // Then by exact match preference
        const aExact = a.text.toLowerCase().startsWith(query.toLowerCase())
        const bExact = b.text.toLowerCase().startsWith(query.toLowerCase())
        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1
        
        // Finally alphabetically
        return a.text.localeCompare(b.text)
      })
      .slice(0, limit)
    
    return ok({
      suggestions: sortedSuggestions,
      query,
      count: sortedSuggestions.length
    })
    
  } catch (error) {
    console.error('Autocomplete error:', error)
    return fail('AUTOCOMPLETE_ERROR', 'Failed to get suggestions', null, 500)
  }
}

/**
 * Generate autocomplete suggestions from multiple sources
 */
async function generateAutocompleteSuggestions(
  db: any, 
  query: string, 
  limit: number
): Promise<AutocompleteSuggestion[]> {
  const suggestions: AutocompleteSuggestion[] = []
  const queryRegex = { $regex: query, $options: 'i' }
  
  // Get product name suggestions
  const productSuggestions = await db.collection('products').aggregate([
    {
      $match: {
        name: queryRegex,
        'inventory.inStock': { $gt: 0 }
      }
    },
    {
      $project: {
        text: '$name',
        featured: '$metadata.featured',
        views: '$analytics.views'
      }
    },
    { $limit: limit },
    { $sort: { featured: -1, views: -1 } }
  ]).toArray()
  
  productSuggestions.forEach(item => {
    suggestions.push({
      text: item.text,
      type: 'product',
      count: item.views || 0,
      featured: item.featured || false
    })
  })
  
  // Get category suggestions
  const categorySuggestions = await db.collection('products').aggregate([
    {
      $match: {
        $or: [
          { category: queryRegex },
          { subcategory: queryRegex }
        ]
      }
    },
    {
      $group: {
        _id: {
          category: '$category',
          subcategory: '$subcategory'
        },
        count: { $sum: 1 },
        hasStock: { $sum: { $cond: [{ $gt: ['$inventory.inStock', 0] }, 1, 0] } }
      }
    },
    {
      $match: {
        hasStock: { $gt: 0 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]).toArray()
  
  categorySuggestions.forEach(item => {
    if (item._id.category.toLowerCase().includes(query.toLowerCase())) {
      suggestions.push({
        text: item._id.category,
        type: 'category',
        count: item.count
      })
    }
    if (item._id.subcategory && 
        item._id.subcategory.toLowerCase().includes(query.toLowerCase()) &&
        item._id.subcategory !== item._id.category) {
      suggestions.push({
        text: item._id.subcategory,
        type: 'category',
        count: item.count
      })
    }
  })
  
  // Get material suggestions
  const materialSuggestions = await db.collection('products').aggregate([
    { $unwind: '$customization.materials' },
    {
      $match: {
        'customization.materials.name': queryRegex,
        'inventory.inStock': { $gt: 0 }
      }
    },
    {
      $group: {
        _id: '$customization.materials.name',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 3 }
  ]).toArray()
  
  materialSuggestions.forEach(item => {
    suggestions.push({
      text: item._id,
      type: 'material',
      count: item.count
    })
  })
  
  // Get gemstone suggestions
  const gemstoneSuggestions = await db.collection('products').aggregate([
    { $unwind: '$customization.gemstones' },
    {
      $match: {
        'customization.gemstones.name': queryRegex,
        'inventory.inStock': { $gt: 0 }
      }
    },
    {
      $group: {
        _id: '$customization.gemstones.name',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 3 }
  ]).toArray()
  
  gemstoneSuggestions.forEach(item => {
    suggestions.push({
      text: item._id,
      type: 'gemstone',
      count: item.count
    })
  })
  
  // Get popular search terms (if we had search analytics)
  // This would come from tracking user searches
  const popularTerms = await getPopularSearchTerms(db, query, 2)
  popularTerms.forEach(term => {
    if (!suggestions.find(s => s.text.toLowerCase() === term.text.toLowerCase())) {
      suggestions.push(term)
    }
  })
  
  // Remove duplicates by text (case insensitive)
  const uniqueSuggestions = suggestions.filter((suggestion, index, array) => 
    array.findIndex(s => s.text.toLowerCase() === suggestion.text.toLowerCase()) === index
  )
  
  return uniqueSuggestions
}

/**
 * Get popular search terms from analytics
 */
async function getPopularSearchTerms(
  db: any, 
  query: string, 
  limit: number
): Promise<AutocompleteSuggestion[]> {
  try {
    // Get popular search terms from analytics events
    const popularSearches = await db.collection('analyticsEvents').aggregate([
      {
        $match: {
          event: 'search_query',
          timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
          'properties.query': { $regex: query, $options: 'i' },
          'properties.query': { $ne: '' }
        }
      },
      {
        $group: {
          _id: '$properties.query',
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gte: 2 } // At least 2 searches
        }
      },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]).toArray()
    
    return popularSearches.map(search => ({
      text: search._id,
      type: 'product' as const,
      count: search.count
    }))
  } catch (error) {
    console.error('Error getting popular search terms:', error)
    return []
  }
}

// Export with performance monitoring
export const GET = withAPIMonitoring('/api/search/autocomplete', getAutocomplete)