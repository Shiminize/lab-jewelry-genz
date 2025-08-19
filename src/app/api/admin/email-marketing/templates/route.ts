/**
 * Email Template Management API
 * GET /api/admin/email-marketing/templates - List all templates
 * POST /api/admin/email-marketing/templates - Create new template
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

interface EmailTemplate {
  _id?: string
  name: string
  description: string
  category: 'marketing' | 'transactional' | 'automation' | 'newsletter'
  type: 'welcome' | 'promotional' | 'abandoned-cart' | 'order-confirmation' | 'newsletter' | 'custom'
  
  design: {
    layout: 'single-column' | 'two-column' | 'hero' | 'product-grid' | 'minimal'
    colorScheme: {
      primary: string
      secondary: string
      background: string
      text: string
      accent: string
    }
    typography: {
      headingFont: string
      bodyFont: string
      fontSize: string
    }
  }
  
  content: {
    html: string
    css: string
    variables: Array<{
      name: string
      type: 'text' | 'image' | 'url' | 'number' | 'boolean'
      description: string
      defaultValue?: any
      required: boolean
    }>
  }
  
  preview: {
    thumbnail: string
    previewData: Record<string, any> // Sample data for variables
  }
  
  usage: {
    campaigns: number
    triggers: number
    lastUsed?: Date
  }
  
  isActive: boolean
  isDefault: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

/**
 * GET /api/admin/email-marketing/templates - List templates
 */
async function getTemplates(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    
    const { db } = await connectToDatabase()
    
    // Build query filters
    const filters: any = {}
    if (category) filters.category = category
    if (type) filters.type = type
    
    // Build aggregation pipeline
    const pipeline = [
      { $match: filters },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'creator'
        }
      },
      {
        $addFields: {
          creatorName: {
            $ifNull: [
              { $concat: [{ $arrayElemAt: ['$creator.firstName', 0] }, ' ', { $arrayElemAt: ['$creator.lastName', 0] }] },
              'System'
            ]
          }
        }
      },
      {
        $project: {
          creator: 0,
          'content.html': 0, // Exclude large HTML content from list view
          'content.css': 0
        }
      },
      { $sort: { isDefault: -1, updatedAt: -1 } },
      {
        $facet: {
          templates: [
            { $skip: (page - 1) * limit },
            { $limit: limit }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ]
    
    const [result] = await db.collection('emailTemplates').aggregate(pipeline).toArray()
    const templates = result.templates || []
    const total = result.totalCount[0]?.count || 0
    
    // Get summary statistics
    const summaryPipeline = [
      {
        $group: {
          _id: null,
          totalTemplates: { $sum: 1 },
          activeTemplates: { $sum: { $cond: ['$isActive', 1, 0] } },
          defaultTemplates: { $sum: { $cond: ['$isDefault', 1, 0] } },
          totalUsage: { $sum: { $add: ['$usage.campaigns', '$usage.triggers'] } },
          categoryBreakdown: {
            $push: {
              category: '$category',
              count: 1
            }
          }
        }
      },
      {
        $addFields: {
          categories: {
            $reduce: {
              input: '$categoryBreakdown',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $let: {
                      vars: { cat: '$$this.category' },
                      in: {
                        $arrayToObject: [
                          [{ k: '$$cat', v: { $add: [{ $ifNull: [{ $getField: { field: '$$cat', input: '$$value' } }, 0] }, '$$this.count'] } }]
                        ]
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ]
    
    const [summary] = await db.collection('emailTemplates').aggregate(summaryPipeline).toArray()
    
    return ok({
      templates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      summary: summary || {
        totalTemplates: 0,
        activeTemplates: 0,
        defaultTemplates: 0,
        totalUsage: 0,
        categories: {}
      },
      filters: { category, type }
    })
    
  } catch (error) {
    console.error('Get templates error:', error)
    return fail('TEMPLATES_ERROR', 'Failed to retrieve templates', null, 500)
  }
}

/**
 * POST /api/admin/email-marketing/templates - Create template
 */
async function createTemplate(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      category,
      type,
      design,
      content,
      preview,
      createdBy
    } = body
    
    // Validation
    if (!name || !category || !content?.html) {
      return fail('VALIDATION_ERROR', 'Missing required fields: name, category, content.html')
    }
    
    const validCategories = ['marketing', 'transactional', 'automation', 'newsletter']
    if (!validCategories.includes(category)) {
      return fail('VALIDATION_ERROR', `Category must be one of: ${validCategories.join(', ')}`)
    }
    
    const validTypes = ['welcome', 'promotional', 'abandoned-cart', 'order-confirmation', 'newsletter', 'custom']
    if (type && !validTypes.includes(type)) {
      return fail('VALIDATION_ERROR', `Type must be one of: ${validTypes.join(', ')}`)
    }
    
    const { db } = await connectToDatabase()
    
    // Create template document
    const template: EmailTemplate = {
      name,
      description: description || '',
      category,
      type: type || 'custom',
      
      design: {
        layout: design?.layout || 'single-column',
        colorScheme: {
          primary: design?.colorScheme?.primary || '#d4af37',
          secondary: design?.colorScheme?.secondary || '#f4e4bc',
          background: design?.colorScheme?.background || '#ffffff',
          text: design?.colorScheme?.text || '#1a1a1a',
          accent: design?.colorScheme?.accent || '#b8941f'
        },
        typography: {
          headingFont: design?.typography?.headingFont || 'Fraunces',
          bodyFont: design?.typography?.bodyFont || 'Inter',
          fontSize: design?.typography?.fontSize || '16px'
        }
      },
      
      content: {
        html: content.html,
        css: content.css || generateDefaultCSS(design),
        variables: content.variables || extractVariablesFromHTML(content.html)
      },
      
      preview: {
        thumbnail: preview?.thumbnail || '',
        previewData: preview?.previewData || {}
      },
      
      usage: {
        campaigns: 0,
        triggers: 0
      },
      
      isActive: true,
      isDefault: false,
      createdBy: createdBy || 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await db.collection('emailTemplates').insertOne(template)
    
    if (!result.insertedId) {
      return fail('CREATION_ERROR', 'Failed to create template')
    }
    
    // Return created template with ID
    const createdTemplate = { ...template, _id: result.insertedId }
    
    return ok({
      template: createdTemplate,
      message: 'Email template created successfully'
    })
    
  } catch (error) {
    console.error('Create template error:', error)
    return fail('CREATION_ERROR', 'Failed to create template', null, 500)
  }
}

// Generate default CSS based on design settings
function generateDefaultCSS(design: any): string {
  const colors = design?.colorScheme || {}
  const typography = design?.typography || {}
  
  return `
    /* Email Template Styles */
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      font-family: ${typography.bodyFont || 'Inter'}, -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: ${typography.fontSize || '16px'};
      line-height: 1.6;
      color: ${colors.text || '#1a1a1a'};
      background-color: ${colors.background || '#ffffff'};
    }
    
    .email-header {
      text-align: center;
      padding: 40px 20px;
      background: linear-gradient(135deg, ${colors.primary || '#d4af37'} 0%, ${colors.secondary || '#f4e4bc'} 100%);
      border-radius: 12px 12px 0 0;
    }
    
    .email-content {
      padding: 40px 30px;
      background: ${colors.background || '#ffffff'};
    }
    
    .email-footer {
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #666;
      border-top: 1px solid #eee;
    }
    
    h1, h2, h3 {
      font-family: ${typography.headingFont || 'Fraunces'}, serif;
      color: ${colors.text || '#1a1a1a'};
      margin-bottom: 20px;
    }
    
    h1 { font-size: 28px; }
    h2 { font-size: 24px; }
    h3 { font-size: 20px; }
    
    .button {
      display: inline-block;
      background: ${colors.primary || '#d4af37'};
      color: white;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      transition: background-color 0.2s;
    }
    
    .button:hover {
      background: ${colors.accent || '#b8941f'};
    }
    
    .highlight {
      background: ${colors.secondary || '#f4e4bc'};
      border: 1px solid ${colors.primary || '#d4af37'};
      border-radius: 6px;
      padding: 16px;
      margin: 20px 0;
    }
    
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    
    .product-card {
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;
      background: white;
    }
    
    .product-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    
    .product-info {
      padding: 15px;
    }
    
    @media (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
      
      .email-content {
        padding: 20px !important;
      }
      
      .product-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `.trim()
}

// Extract variables from HTML template
function extractVariablesFromHTML(html: string): Array<any> {
  const variables: Array<any> = []
  const variableRegex = /\{\{(\w+)\}\}/g
  let match
  
  while ((match = variableRegex.exec(html)) !== null) {
    const varName = match[1]
    
    if (!variables.find(v => v.name === varName)) {
      variables.push({
        name: varName,
        type: inferVariableType(varName),
        description: `Dynamic ${varName} content`,
        required: true
      })
    }
  }
  
  return variables
}

// Infer variable type from name
function inferVariableType(varName: string): string {
  const name = varName.toLowerCase()
  
  if (name.includes('image') || name.includes('photo') || name.includes('picture')) {
    return 'image'
  } else if (name.includes('url') || name.includes('link') || name.includes('href')) {
    return 'url'
  } else if (name.includes('price') || name.includes('amount') || name.includes('total') || name.includes('count')) {
    return 'number'
  } else if (name.includes('enable') || name.includes('show') || name.includes('hide')) {
    return 'boolean'
  } else {
    return 'text'
  }
}

// Export with performance monitoring
export const GET = withAPIMonitoring('/api/admin/email-marketing/templates', getTemplates)
export const POST = withAPIMonitoring('/api/admin/email-marketing/templates', createTemplate)